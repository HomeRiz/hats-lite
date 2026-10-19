import json
import subprocess
import sys
from pathlib import Path

import pytest

WORKER = Path(__file__).resolve().parent.parent / "scripts" / "full" / "jinja_worker.py"
N = 30000000
STATES = [{"entity_id": "input_number.lcars_menu_font", "state": "20", "attributes": {}}]
BIG = "{% set a = 'a' * 60000 %}"

PROBE = """
import json, resource, subprocess, sys, time
worker, states, template = sys.argv[1], sys.argv[2], sys.argv[3]
proc = subprocess.Popen([sys.executable, "-I", worker], stdin=subprocess.PIPE, stdout=subprocess.PIPE, text=True)
proc.stdin.write(json.dumps({"op": "init", "states": json.loads(states)}) + "\\n")
proc.stdin.flush()
proc.stdout.readline()
started = time.monotonic()
proc.stdin.write(json.dumps({"id": 1, "template": template, "variables": {}}) + "\\n")
proc.stdin.flush()
reply = json.loads(proc.stdout.readline() or "{}")
seconds = time.monotonic() - started
proc.stdin.close()
proc.wait(timeout=30)
peak = resource.getrusage(resource.RUSAGE_CHILDREN).ru_maxrss
print(json.dumps({"reply": reply, "seconds": seconds, "peak_mb": peak / (1048576 if sys.platform == "darwin" else 1024)}))
"""


def probe(tmp_path, template):
    proc = subprocess.run(
        [sys.executable, "-I", "-c", PROBE, str(WORKER), json.dumps(STATES), template],
        capture_output=True,
        text=True,
        timeout=120,
        cwd=tmp_path,
    )
    assert proc.returncode == 0, proc.stderr
    return json.loads(proc.stdout)


@pytest.fixture(scope="module")
def baseline(tmp_path_factory):
    return probe(tmp_path_factory.mktemp("base"), "{{ 1 }}")["peak_mb"]


BYPASSES = [
    f"{{{{ 'x'.ljust({N}) }}}}",
    f"{{{{ 'x'.rjust({N}) }}}}",
    f"{{{{ 'x'.zfill({N}) }}}}",
    f"{{{{ 'x'.center({N}) }}}}",
    f"{{{{ 'x'.encode().ljust({N}) }}}}",
    f"{{{{ '{{:>{N}}}'.format(1) }}}}",
    f"{{{{ '{{:{{}}}}'.format(1, {N}) }}}}",
    f"{{{{ '{{:{{}}}}'.format(1, '{N}') }}}}",
    f"{{{{ '{{v:>{{w}}}}'.format_map({{'v': 1, 'w': {N}}}) }}}}",
    f"{{{{ '%{N}d' % 1 }}}}",
    f"{{{{ '%*d' % ({N}, 1) }}}}",
    f"{{{{ '%.{N}f' % 1 }}}}",
    f"{{{{ '%*d'|format({N}, 1) }}}}",
    f"{{{{ '%{N}d'|format(1) }}}}",
    "{{ ('a' * 60000)|replace('a', 'b' * 60000) }}",
    "{{ ('a' * 60000).replace('a', 'b' * 60000) }}",
    BIG + "{{ " + "a~" * 32000 + "a }}",
    BIG + "{% set x %}{% for i in range(10000) %}{{ a }}{% endfor %}{% endset %}{{ x | length }}",
    BIG + "{{ [a] * 60000 }}",
    BIG + "{{ ([a] * 60000) | join }}",
    BIG + "{{ ''.join([a] * 60000) }}",
    BIG + "{{ ([a] * 60000) | tojson | length }}",
    "{{ ('\\t' * 60000).expandtabs(9999) }}",
    "{{ ('a\\n' * 30000) | indent(1000) }}",
    "{{ ('a' * 60000).translate({97: 'b' * 60000}) }}",
    "{{ ('a ' * 30000) | wordwrap(1, wrapstring='b' * 60000) }}",
    "{{ '%9999d' * 6000 % ((1,) * 6000) }}",
    "{{ ('a' * 30000).encode('utf-16') | length }}",
    "{{ ('a' * 30000).encode('utf-8', 'backslashreplace') | length }}",
    "{{ ('{:9999}' * 6000).format(*([1] * 6000)) }}",
]


LITERAL = "{% for i in range(2000) %}" + "b" * 60000 + "{% endfor %}"
VIEWS = "{% set a = 'a' * 60000 %}{% set d = {" + ", ".join(f"{i}: a" for i in range(600)) + "} %}"
BYPASSES += [
    "{% set x %}" + LITERAL + "{% endset %}x",
    "{% macro m() %}" + LITERAL + "{% endmacro %}{{ m() | length }}",
    "{% macro w() %}{{ caller() | length }}{% endmacro %}{% call w() %}" + LITERAL + "{% endcall %}",
    "{% filter length %}" + LITERAL + "{% endfilter %}",
    VIEWS + "{{ d.values() | string | length }}",
    VIEWS + "{{ d.items() | string | length }}",
    VIEWS + "{{ (d.values() ~ '') | length }}",
    VIEWS + "{{ d.values() }}",
]


@pytest.mark.parametrize("template", BYPASSES, ids=[f"bypass{i}" for i in range(len(BYPASSES))])
def test_size_bypasses_are_refused_quickly_without_allocating(tmp_path, baseline, template):
    result = probe(tmp_path, template)
    assert "error" in result["reply"], (template[:80], str(result["reply"])[:200])
    assert result["seconds"] < 1, (template[:80], result["seconds"])
    assert result["peak_mb"] < baseline + 16, (template[:80], result["peak_mb"], baseline)


NORMAL = [
    ("{{ '%.1f' | format(3.14159) }}", "3.1"),
    ("{{ '{:.1f}'.format(3.14159) }}", "3.1"),
    ("{{ '%d' % 5 }}|{{ '%02d:%02d' % (7, 5) }}", "5|07:05"),
    ("{{ 'lcars-blue' | replace('blue', 'red') }}|{{ 'a-b'.replace('-', '_') }}", "lcars-red|a_b"),
    ("{{ 'a' ~ 1 ~ 'b' }}|{{ states('input_number.lcars_menu_font') ~ 'px' }}", "a1b|20px"),
    ("{{ 'x'.ljust(5, '.') }}|{{ '7'.zfill(3) }}|{{ '{:>6}'.format('ok') }}", "x....|007|    ok"),
    ("{{ ['a', 'b'] | join(', ') }}|{{ '-'.join(['c', 'd']) }}", "a, b|c-d"),
    ("[{{ 'LCARS' | center(9) }}]|{{ 'x' | indent(2, true) }}", "[  LCARS  ]|  x"),
    ("{% set s %}{% for i in range(3) %}{{ i }}{% endfor %}{% endset %}{{ s }}", "012"),
    ("{{ ('ab' ~ 'cd').upper() }}|{{ 'a\\tb'.expandtabs(2) }}", "ABCD|a b"),
    ("{{ '%-6s|' | format('ab') }}{{ '%(n)03d' % {'n': 7} }}", "ab    |007"),
    ("{{ [1, 2] | tojson }}|{{ 'a b c' | wordwrap(3) }}", "[1, 2]|a b\nc"),
    ("{{ {'b': [1, 2], 'a': 1} | tojson(indent=2) }}", '{\n  "a": 1,\n  "b": [\n    1,\n    2\n  ]\n}'),
    ("{% set s = 'a' * 30000 %}{{ s.encode('utf-8') | length }}|{{ s.encode('UTF8') | length }}", "30000|30000"),
    ("{% set s = 'é' * 30000 %}{{ s.encode('utf-8') | length }}|{{ s.encode(encoding='latin-1') | length }}", "60000|30000"),
]


@pytest.mark.parametrize("template,expected", NORMAL, ids=[f"normal{i}" for i in range(len(NORMAL))])
def test_normal_lcars_style_templates_still_render(tmp_path, template, expected):
    assert probe(tmp_path, template)["reply"] == {"id": 1, "result": expected}


def test_a_long_lcars_css_block_built_with_tilde_still_renders(tmp_path):
    rule = "{% set c = 'var(--lcars-' %}"
    body = " ~ ".join(["c ~ 'orange) '"] * 20)
    reply = probe(tmp_path, rule + "{{ " + body + " }}")["reply"]
    assert reply == {"id": 1, "result": "var(--lcars-orange) " * 20}


def test_total_produced_characters_are_capped_per_render(tmp_path):
    template = "{% set a = 'a' * 50000 %}{% for i in range(100) %}{% set b = a ~ i %}{% endfor %}ok"
    assert "error" in probe(tmp_path, template)["reply"]
    assert probe(tmp_path, "{% set a = 'a' * 500 %}{% for i in range(100) %}{% set b = a ~ i %}{% endfor %}ok")["reply"]["result"] == "ok"


def test_views_and_iterators_of_small_dicts_still_render(tmp_path):
    template = "{% set d = {'a': 1, 'b': 2} %}{{ d.keys() | list }}|{{ d.values() | sum }}|{{ d | items | list | length }}|{{ d.items() | string | length > 0 }}"
    assert probe(tmp_path, template)["reply"] == {"id": 1, "result": "['a', 'b']|3|2|True"}



AMPLIFY = [
    ("{% set n = %s %}", "[1] * n", "65536", "1"),
    ("{% set a = [1] * %s %}", "a + a", "32768", "1"),
    ("{% set s = 'ß' * %s %}", "s.upper()", "65535", "1"),
    ("{% set m = 'a' | safe %}{% set s = '<' * %s %}", "m.escape(s)", "65535", "1"),
    ("{% set s = 'é' * %s %}", "s.encode()", "65535", "1"),
]


def amplified(setup, item, count):
    return setup.replace("%s", count) + "{% set x = [" + ", ".join([item] * 2500) + "] %}{{ x | length }}"


@pytest.mark.parametrize("setup,item,big,small", AMPLIFY, ids=[f"amplify{i}" for i in range(len(AMPLIFY))])
def test_repeated_sequence_and_text_building_is_metered(tmp_path, setup, item, big, small):
    control = probe(tmp_path, amplified(setup, item, small))
    assert control["reply"] == {"id": 1, "result": "2500"}
    result = probe(tmp_path, amplified(setup, item, big))
    assert "too much text" in result["reply"].get("error", ""), str(result["reply"])[:200]
    assert result["seconds"] < 1, result["seconds"]
    assert result["peak_mb"] < control["peak_mb"] + 16, (result["peak_mb"], control["peak_mb"])


def indented(size, indent):
    sets = "".join("{% set v" + str(i) + " = l | tojson(indent=" + indent + ") %}" for i in range(15))
    return "{% set l = [0] * " + size + " %}" + sets + "{{ 1 }}"


def test_tojson_indent_is_metered(tmp_path):
    control = probe(tmp_path, indented("500", "2"))
    assert control["reply"] == {"id": 1, "result": "1"}
    for indent in ("10000", "'" + " " * 10000 + "'"):
        result = probe(tmp_path, indented("5400", indent))
        assert "error" in result["reply"], str(result["reply"])[:200]
        assert result["seconds"] < 1, result["seconds"]
        assert result["peak_mb"] < control["peak_mb"] + 16, (result["peak_mb"], control["peak_mb"])


def test_nested_tojson_indent_is_metered(tmp_path):
    nest = "{% set l = " + "[" * 50 + "0" + "]" * 50 + " %}"
    control = probe(tmp_path, nest + "{{ l | tojson(indent=2) | length }}")
    assert control["reply"] == {"id": 1, "result": "5201"}
    sets = "{% for i in range(15) %}{% set v = l | tojson(indent=10000) %}{% endfor %}"
    result = probe(tmp_path, nest + sets + "{{ 1 }}")
    assert "error" in result["reply"], str(result["reply"])[:200]
    assert result["seconds"] < 1, result["seconds"]
    assert result["peak_mb"] < control["peak_mb"] + 16, (result["peak_mb"], control["peak_mb"])
