import re

import yaml
from yaml.nodes import MappingNode, SequenceNode

MAX_MERGED_PAIRS = 300000
MAX_NODES = 600000
MAX_DEPTH = 100
SHALLOW_DEPTH = 50
NOT_VALID_YAML = "Theme file is not valid YAML"
TOO_DEEP = "Theme file is too deeply nested"
MERGE_TAG = "tag:yaml.org,2002:merge"
VALUE_TAG = "tag:yaml.org,2002:value"
STR_TAG = "tag:yaml.org,2002:str"

BRACKETS = re.compile(r"[{\[\]}]")
DEEP_INDENT = re.compile(r"^[ \t]{%d,}\S" % SHALLOW_DEPTH, re.MULTILINE)
INDICATOR_RUN = re.compile(r"(?:[-?][ \t]+){%d}" % 20)
OPENERS = frozenset("{[")


class ThemeError(ValueError):
    pass


class InvalidValueError(ThemeError):
    pass


class ThemeTooLargeError(ThemeError):
    pass


def _budget(owner, pairs):
    owner.merged_pairs += pairs
    if owner.merged_pairs > MAX_MERGED_PAIRS:
        raise ThemeTooLargeError("Theme file is too large")


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
    index = 0
    while index < len(node.value):
        key_node, value_node = node.value[index]
        if key_node.tag == MERGE_TAG:
            del node.value[index]
            merge.extend(_merge_source(owner, value_node))
        elif key_node.tag == VALUE_TAG:
            key_node.tag = STR_TAG
            index += 1
        else:
            index += 1
    if merge:
        node.value = merge + node.value


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


class GuardedLoader(_GuardMixin, yaml.SafeLoader):
    def __init__(self, stream):
        super().__init__(stream)
        self.node_count = 0
        self.depth = 0

    def compose_mapping_node(self, anchor):
        node = super().compose_mapping_node(anchor)
        self.flatten_mapping(node)
        return node

    def compose_node(self, parent, index):
        self.node_count += 1
        if self.node_count > MAX_NODES:
            raise ThemeTooLargeError("Theme file is too large")
        self.depth += 1
        try:
            if self.depth > MAX_DEPTH:
                raise ThemeError(TOO_DEEP)
            return super().compose_node(parent, index)
        finally:
            self.depth -= 1


def _shallow(text):
    depth = 0
    for match in BRACKETS.finditer(text):
        if match.group() in OPENERS:
            depth += 1
            if depth >= SHALLOW_DEPTH:
                return False
        elif depth:
            depth -= 1
    if DEEP_INDENT.search(text) or INDICATOR_RUN.search(text):
        return False
    return True


def load_yaml(text):
    loader = FastLoader if _shallow(text) else GuardedLoader
    try:
        return yaml.load(text, Loader=loader)
    except ThemeError:
        raise
    except (RecursionError, MemoryError) as err:
        raise ThemeError(TOO_DEEP) from err
    except Exception as err:
        raise ThemeError(NOT_VALID_YAML) from err
