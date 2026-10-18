import yaml
from yaml.events import (
    AliasEvent,
    CollectionEndEvent,
    CollectionStartEvent,
    DocumentStartEvent,
    MappingStartEvent,
    ScalarEvent,
)
from yaml.nodes import MappingNode, SequenceNode

MAX_MERGED_PAIRS = 300000
MAX_NODES = 150000
MAX_DEPTH = 100
LIBYAML = hasattr(yaml, "CSafeLoader")
TOO_LARGE = "Theme file is too large"
NOT_VALID_YAML = "Theme file is not valid YAML"
TOO_DEEP = "Theme file is too deeply nested"
MERGE_TAG = "tag:yaml.org,2002:merge"
VALUE_TAG = "tag:yaml.org,2002:value"
STR_TAG = "tag:yaml.org,2002:str"
ESCAPE_PROBLEM = "invalid Unicode character escape code"
RETRY_MAX_CHARS = 200000


class ThemeError(ValueError):
    pass


class InvalidValueError(ThemeError):
    pass


class ThemeTooLargeError(ThemeError):
    pass


def _budget(owner, pairs):
    owner.merged_pairs += pairs
    if owner.merged_pairs > MAX_MERGED_PAIRS:
        raise ThemeTooLargeError(TOO_LARGE)


def _flatten(owner, node):
    owner.flatten_depth += 1
    try:
        if owner.flatten_depth > MAX_DEPTH:
            raise ThemeError(TOO_DEEP)
        _flatten_node(owner, node)
    finally:
        owner.flatten_depth -= 1


def _merge_source(owner, value_node):
    if isinstance(value_node, MappingNode):
        _flatten(owner, value_node)
        _budget(owner, len(value_node.value))
        return list(value_node.value)
    if isinstance(value_node, SequenceNode):
        parts = []
        for subnode in value_node.value:
            if not isinstance(subnode, MappingNode):
                raise ThemeError(NOT_VALID_YAML)
            _flatten(owner, subnode)
            _budget(owner, len(subnode.value))
            parts.append(subnode.value)
        merged = []
        for part in reversed(parts):
            merged.extend(part)
        return merged
    raise ThemeError(NOT_VALID_YAML)


def _flatten_node(owner, node):
    merge = []
    kept = []
    merged = False
    for key_node, value_node in node.value:
        if key_node.tag == MERGE_TAG:
            merged = True
            merge.extend(_merge_source(owner, value_node))
            continue
        if key_node.tag == VALUE_TAG:
            key_node.tag = STR_TAG
        kept.append((key_node, value_node))
    if merged:
        merge.extend(kept)
        node.value = merge


class _GuardMixin:
    def _guard_reset(self):
        self.merged_pairs = 0
        self.flatten_depth = 0

    def flatten_mapping(self, node):
        if not hasattr(self, "merged_pairs"):
            self._guard_reset()
        _flatten(self, node)


class FastLoader(_GuardMixin, getattr(yaml, "CSafeLoader", yaml.SafeLoader)):
    pass


class EventBudget:
    def __init__(self):
        self.nodes = 0
        self.depth = 0

    def feed(self, event):
        if isinstance(event, CollectionStartEvent):
            self.depth += 1
            if self.depth > MAX_DEPTH:
                raise ThemeError(TOO_DEEP)
        elif isinstance(event, CollectionEndEvent):
            self.depth -= 1
            return
        elif not isinstance(event, (ScalarEvent, AliasEvent)):
            return
        self.nodes += 1
        if self.nodes > MAX_NODES:
            raise ThemeTooLargeError(TOO_LARGE)


class GuardedLoader(_GuardMixin, yaml.SafeLoader):
    def __init__(self, stream):
        super().__init__(stream)
        self.budget = EventBudget()

    def get_event(self):
        event = super().get_event()
        self.budget.feed(event)
        return event

    def compose_mapping_node(self, anchor):
        node = super().compose_mapping_node(anchor)
        self.flatten_mapping(node)
        return node


def _prescan(text):
    budget = EventBudget()
    for event in yaml.parse(text, Loader=FastLoader):
        budget.feed(event)


def _plain_key(event):
    return isinstance(event, ScalarEvent) and event.anchor is None and event.value != "<<"


def _scan_keys(events):
    budget = EventBudget()
    keys = []
    documents = 0
    is_key = True
    for event in events:
        level = budget.depth
        budget.feed(event)
        if isinstance(event, DocumentStartEvent):
            documents += 1
            if documents > 1:
                return None
        if not isinstance(event, (ScalarEvent, AliasEvent, CollectionStartEvent)):
            continue
        if getattr(event, "tag", None) is not None:
            return None
        if level == 0:
            if not isinstance(event, MappingStartEvent) or event.anchor is not None:
                return None
        elif level == 1:
            if is_key:
                if not _plain_key(event):
                    return None
                keys.append(event.value)
            is_key = not is_key
    return keys


def _escape_failure(err, text):
    if not isinstance(err, yaml.YAMLError) or ("\\u" not in text and "\\U" not in text):
        return False
    return ESCAPE_PROBLEM in str(getattr(err, "problem", "") or "")


def top_level_keys(text):
    if not LIBYAML:
        return None
    try:
        return _scan_keys(yaml.parse(text, Loader=FastLoader))
    except yaml.YAMLError as err:
        if _escape_failure(err, text):
            return None
        raise


def _load(text):
    if LIBYAML:
        try:
            _prescan(text)
            return yaml.load(text, Loader=FastLoader)
        except yaml.YAMLError as err:
            if not _escape_failure(err, text):
                raise
            if len(text) > RETRY_MAX_CHARS:
                raise ThemeTooLargeError(TOO_LARGE) from err
    return yaml.load(text, Loader=GuardedLoader)


def load_yaml(text):
    try:
        return _load(text)
    except ThemeError:
        raise
    except (RecursionError, MemoryError) as err:
        raise ThemeError(TOO_DEEP) from err
    except Exception as err:
        raise ThemeError(NOT_VALID_YAML) from err
