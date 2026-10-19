import pytest

from test_full_limits import probe

SEPARATORS = ["\\r", "\\x0b", "\\x0c", "\\x1c", "\\x85", "\\u2028", "\\u2029"]


def indent_case(sep, count):
    return '{% set s = "' + sep + '" * ' + count + " %}{% set r = s | indent(10000, blank=true) %}{{ r | length }}"


def wordwrap_case(sep, count):
    item = 's | wordwrap(79, wrapstring="x" * 300)'
    return '{% set s = "' + sep + '" * ' + count + " %}{% set l = [" + ", ".join([item] * 8) + "] %}{{ l | length }}"


def assert_refused_like_control(tmp_path, control, template):
    result = probe(tmp_path, template)
    assert "error" in result["reply"], str(result["reply"])[:200]
    assert result["seconds"] < 1, result["seconds"]
    assert result["peak_mb"] < control["peak_mb"] + 16, (result["peak_mb"], control["peak_mb"])


@pytest.mark.parametrize("sep", SEPARATORS, ids=[f"sep{i}" for i in range(len(SEPARATORS))])
def test_indent_counts_every_line_break_jinja_splits_on(tmp_path, sep):
    control = probe(tmp_path, indent_case(sep, "3"))
    assert control["reply"]["result"] in ("20002", "30003")
    assert_refused_like_control(tmp_path, control, indent_case(sep, "30000"))


@pytest.mark.parametrize("sep", SEPARATORS, ids=[f"sep{i}" for i in range(len(SEPARATORS))])
def test_wordwrap_counts_every_line_break_jinja_splits_on(tmp_path, sep):
    control = probe(tmp_path, wordwrap_case(sep, "3"))
    assert control["reply"] == {"id": 1, "result": "8"}
    assert_refused_like_control(tmp_path, control, wordwrap_case(sep, "40000"))


NORMAL = [
    ("{{ 'a\\nb\\rc\\x85d' | indent(2) }}", "a\n  b\n  c\n  d"),
    ("{{ 'a\\n\\nb' | indent(2, first=true, blank=true) }}", "  a\n  \n  b"),
    ("{{ 'aaa bbb\\nccc ddd' | wordwrap(3) }}", "aaa\nbbb\nccc\nddd"),
    ("{{ 'aaa bbb\\rccc' | wordwrap(5, wrapstring='|') }}", "aaa|bbb|ccc"),
    ("{{ '\\U00010000' | tojson }}", '"\\ud800\\udc00"'),
    ("{{ 'a b/\\U00010000' | urlencode }}", "a%20b/%F0%90%80%80"),
    ("{{ '\\u0390' | upper | length }}|{{ 'abc' | title }}|{{ 'x' | capitalize }}|{{ 'Ab' | lower }}", "3|Abc|X|ab"),
    ("{% set m = '-' | safe %}{{ m.join(['&', '<']) }}|{{ m + '&' }}|{{ '&' + m }}", "&amp;-&lt;|-&amp;|&amp;-"),
    ("{% set m = '%s|' | safe %}{{ m % '<' }}{{ ('{}' | safe).format('&') }}", "&lt;|&amp;"),
    ("{{ ['a', 1] | string }}|{{ [1, 2] ~ '' }}|{{ '%s' | format([1]) }}|{{ '{}'.format([2]) }}", "['a', 1]|[1, 2]|[1]|[2]"),
    ("{{ ['a', 'b'] | join('-') }}|{{ {'a': ['x']} | xmlattr }}|{{ ['<'] | e }}", "a-b| a=\"[&#39;x&#39;]\"|[&#39;&lt;&#39;]"),
    ("{{ 'abc'.encode('ascii', 'namereplace') | length }}|{{ [[1], [2]] | sum(start=[0]) }}", "3|[0, 1, 2]"),
    ("{% macro m() %}x{% endmacro %}{{ [m] | string | length > 0 }}|{{ ('a' | safe).replace('a', '<') }}", "True|&lt;"),
]


@pytest.mark.parametrize("template,expected", NORMAL, ids=[f"normal{i}" for i in range(len(NORMAL))])
def test_normal_templates_still_render(tmp_path, template, expected):
    assert probe(tmp_path, template)["reply"] == {"id": 1, "result": expected}


TAG = "{% set s = ['\\U000E0001' * @N] %}"
EMOJI = "{% set s = '\\U00010000' * @N %}"
MARK = "{% set m = '-' | safe %}{% set s = '&' * @N %}"
MACRO = "{% macro " + "a" * 30000 + "() %}{% endmacro %}{% set s = [" + "a" * 30000 + "] * @N %}"
AMPLIFY = [
    (EMOJI, "s | tojson", "20000", 9),
    (EMOJI, "s | urlencode", "20000", 9),
    ("{% set s = '\\u0390' * @N %}", "s | upper", "40000", 18),
    ("{% set s = '\\u0390' * @N %}", "s | title", "40000", 18),
    (MARK, "m + s", "50000", 9),
    (MARK, "s + m", "50000", 9),
    (MARK, "m.join([s])", "50000", 9),
    (MARK, "m.replace('-', s)", "50000", 9),
    ("{% set m = '%s' | safe %}{% set s = '&' * @N %}", "m % s", "50000", 9),
    ("{% set m = '{}' | safe %}{% set s = '&' * @N %}", "m.format(s)", "50000", 9),
    (TAG, "s | string", "20000", 11),
    (TAG, "s ~ ''", "20000", 11),
    (TAG, "'%s' | format(s)", "20000", 11),
    (TAG, "'%s' % (s,)", "20000", 11),
    (TAG, "'{}'.format(s)", "20000", 11),
    (TAG, "[s] | join", "20000", 11),
    (TAG, "s | center(10)", "20000", 11),
    (TAG, "s | e", "20000", 11),
    (TAG, "{'a': s} | xmlattr", "20000", 11),
    (EMOJI, "'%a' % s", "20000", 11),
    ("{% set s = '\\uFDFA' * @N %}", "s.encode('ascii', 'namereplace')", "3000", 16),
    ("{% set l = [1] * @N %}", "[[1]] | sum(start=l)", "60000", 60),
    (MACRO, "s | string", "100", 60),
]


def amplified(setup, item, count, copies):
    return setup.replace("@N", count) + "{% set x = [" + ", ".join([item] * copies) + "] %}{{ x | length }}"


@pytest.mark.parametrize("setup,item,big,copies", AMPLIFY, ids=[f"amplify{i}" for i in range(len(AMPLIFY))])
def test_expanding_filters_and_markup_operations_are_metered(tmp_path, setup, item, big, copies):
    control = probe(tmp_path, amplified(setup, item, "1", copies))
    assert control["reply"] == {"id": 1, "result": str(copies)}, str(control["reply"])[:200]
    assert_refused_like_control(tmp_path, control, amplified(setup, item, big, copies))
