import json
import subprocess
import sys
import time
from pathlib import Path

import pytest

FULL = Path(__file__).resolve().parent.parent / "scripts" / "full"
WORKER = FULL / "jinja_worker.py"
STATES = [
    {"entity_id": "sensor.time", "state": "19:35", "attributes": {"friendly_name": "Time"}},
    {"entity_id": "input_boolean.lcars_sound", "state": "on", "attributes": {}},
    {"entity_id": "input_number.lcars_menu_font", "state": "20", "attributes": {"max": 40}},
    {"entity_id": "light.a", "state": "unavailable", "attributes": {"brightness": 5}},
]


def ask(cwd, *templates, variables=None):
    messages = [{"op": "init", "states": STATES}]
    for i, template in enumerate(templates, start=1):
        messages.append({"id": i, "template": template, "variables": variables or {}})
    proc = subprocess.run(
        [sys.executable, "-I", str(WORKER)],
        input="".join(json.dumps(m) + "\n" for m in messages),
        capture_output=True,
        text=True,
        timeout=60,
        cwd=cwd,
    )
    replies = [json.loads(line) for line in proc.stdout.splitlines()]
    assert replies[0] == {"ok": True}, proc.stderr
    assert len(replies) == len(templates) + 1, proc.stderr
    return replies[1:]


def one(cwd, template, **kwargs):
    return ask(cwd, template, **kwargs)[0]


NORMAL = [
    ("{{ states('sensor.time') }}", "19:35"),
    ("{% if is_state('input_boolean.lcars_sound', 'on') %}yes{% else %}no{% endif %}", "yes"),
    ("{{ is_state('light.a', ['on', 'unavailable']) }}", "True"),
    ("{{ 'on' if has_value('sensor.time') else 'off' }}|{{ has_value('light.a') }}", "on|False"),
    ("{{ states('input_number.lcars_menu_font') | int + 2 }}px", "22px"),
    ("{% for x in ['a', 'b', 'c'] %}{{ x }}{{ loop.index }}{% endfor %}", "a1b2c3"),
    ("{% for i in range(3) %}{{ i }}{% endfor %}", "012"),
    ("{{ state_attr('input_number.lcars_menu_font', 'max') }}", "40"),
    ("{{ is_state_attr('light.a', 'brightness', 5) }}", "True"),
    ("{{ states.sensor.time.state }}|{{ states.sensor.time.attributes.friendly_name }}", "19:35|Time"),
    ("{{ states() | map(attribute='entity_id') | select('in', ['light.a']) | list | length }}", "1"),
    ("{{ states('sensor.time').split(':') | first }}", "19"),
    ("{{ states('sensor.nope') }}|{{ missing }}|{{ states.sensor.nope }}", "unknown||"),
    ("{{ '%02d' | format(5) }}|{{ 'ab' * 2 }}|{{ 2 ** 10 }}", "05|abab|1024"),
    ("{{ now().year > 2000 }}|{{ as_timestamp(now()) > 0 }}|{{ user_name }}", "True|True|HATS Preview"),
    ("{% set x = 3 %}{{ [x, 1, 2] | sort | join(',') }}", "1,2,3"),
]


@pytest.mark.parametrize("template,expected", NORMAL)
def test_normal_templates_still_render(tmp_path, template, expected):
    assert one(tmp_path, template) == {"id": 1, "result": expected}


def test_variables_are_passed_and_non_dict_variables_are_ignored(tmp_path):
    assert one(tmp_path, "{{ config.size }}", variables={"config": {"size": 4}})["result"] == "4"
    proc = subprocess.run(
        [sys.executable, "-I", str(WORKER)],
        input=json.dumps({"op": "init", "states": STATES}) + "\n" + json.dumps({"id": 1, "template": "a{{ 1 }}", "variables": [1]}) + "\n",
        capture_output=True,
        text=True,
        timeout=60,
        cwd=tmp_path,
    )
    assert json.loads(proc.stdout.splitlines()[1]) == {"id": 1, "result": "a1"}


MARKER = "PWNED"
HOSTILE = [
    "{{ states.__class__ }}",
    "{{ ''.__class__.__mro__ }}",
    "{{ ''.__class__.__mro__[1].__subclasses__() }}",
    "{{ states.__globals__ }}",
    "{{ states.__call__.__globals__ }}",
    "{{ is_state.__globals__ }}",
    "{{ now.__self__ }}",
    "{{ now().__class__.__init__.__globals__ }}",
    "{{ states('sensor.time').__class__ }}",
    "{{ (states() | first).__class__ }}",
    "{{ self.__init__.__globals__ }}",
    "{{ self._TemplateReference__context }}",
    "{{ lipsum.__globals__['os'].system('touch " + MARKER + "') }}",
    "{{ lipsum.__globals__.os.popen('touch " + MARKER + "').read() }}",
    "{{ cycler.__init__.__globals__.os.system('touch " + MARKER + "') }}",
    "{{ joiner.__init__.__globals__.os.system('touch " + MARKER + "') }}",
    "{{ namespace.__init__.__globals__.os.system('touch " + MARKER + "') }}",
    "{{ dict.__base__.__subclasses__() }}",
    "{{ states | attr('__class__') }}",
    "{{ '{0.__class__}'.format(states) }}",
    "{{ '{0.__globals__}'.format(is_state) }}",
    "{{ request.application.__globals__ }}",
    "{{ config.__class__.__init__.__globals__ }}",
    "{% include '/etc/passwd' %}",
    "{% import 'os' as os %}{{ os }}",
    "{% extends '/etc/hosts' %}",
    "{{ (states() | first).update({'state': 'x'}) }}",
    "{{ [1].append(2) }}",
]


@pytest.mark.parametrize("template", HOSTILE)
def test_hostile_templates_do_not_execute_or_leak(tmp_path, template):
    reply = one(tmp_path, template)
    text = json.dumps(reply)
    for leak in ("<class", "<module", "<function", "<built-in", "<bound", "root:", "localhost", "__builtins__", "subclasses"):
        assert leak not in reply.get("result", ""), (template, text)
    assert len(reply.get("error", "")) <= 300
    assert list(tmp_path.iterdir()) == []


def test_range_is_bounded(tmp_path):
    for template in ("{{ range(10**9) | list | length }}", "{% for i in range(100000) %}{% endfor %}"):
        assert "error" in one(tmp_path, template)


def test_big_operations_are_refused(tmp_path):
    for template in ("{{ 'a' * 10**9 }}", "{{ [1] * 10**9 }}", "{{ 99 ** 5000 }}", "{{ (2 ** 4000) ** 4000 }}", "{{ (10 ** 900) * (10 ** 900) * (10 ** 900) * 2 ** 9000 }}"):
        assert "error" in one(tmp_path, template), template


def test_long_running_loops_are_stopped(tmp_path):
    started = time.monotonic()
    reply = one(tmp_path, "{% for i in range(1000) %}{% for j in range(1000) %}{% for k in range(1000) %}{% endfor %}{% endfor %}{% endfor %}")
    assert "error" in reply
    assert time.monotonic() - started < 20


SLOW_FOLD = """
import signal, sys, time
sys.path.insert(0, sys.argv[1])
import jinja_worker as w
def slow(value):
    end = time.monotonic() + 2.5
    while time.monotonic() < end:
        pass
    return value
signal.signal(signal.SIGALRM, w._timeout)
env = w.make_env([])
env.filters["slow"] = slow
loop = "{% for i in range(10000) %}{% for j in range(10000) %}{% for k in range(10000) %}{% endfor %}{% endfor %}{% endfor %}"
try:
    w.render(env, "{{ 1 | slow }}" + loop, {})
    print("rendered")
except BaseException as e:
    print(type(e).__name__, e)
"""


def test_timeout_survives_constant_folding_and_still_stops_the_render(tmp_path):
    started = time.monotonic()
    proc = subprocess.run([sys.executable, "-I", "-c", SLOW_FOLD, str(FULL)], capture_output=True, text=True, timeout=30, cwd=tmp_path)
    assert proc.stdout.strip() == "RenderTimeout template took too long", proc.stderr
    assert time.monotonic() - started < 10


def test_output_and_template_size_are_capped(tmp_path):
    big = one(tmp_path, "{% for i in range(1000) %}{{ 'x' * 1000 }}{% endfor %}")
    assert "error" in big and "result" not in big
    long = one(tmp_path, "a" * 70000)
    assert "error" in long


def test_worker_keeps_answering_after_errors(tmp_path):
    replies = ask(tmp_path, "{{ ''.__class__.__mro__ }}", "{{ 1 / 0 }}", "{{ 'a' * 10**9 }}", "{{ states('sensor.time') }}")
    assert replies[-1] == {"id": 4, "result": "19:35"}


def test_dangerous_globals_are_removed():
    sys.path.insert(0, str(FULL))
    try:
        import jinja_worker
    finally:
        sys.path.remove(str(FULL))
    env = jinja_worker.make_env(STATES)
    for name in ("lipsum", "cycler", "joiner", "namespace"):
        assert name not in env.globals
    assert type(env).__name__ == "WorkerEnvironment"
    assert "ImmutableSandboxedEnvironment" in [c.__name__ for c in type(env).__mro__]


def test_harden_blocks_sockets_and_processes(tmp_path):
    code = (
        "import sys; sys.path.insert(0, sys.argv[1]); import jinja_worker as w; w.harden()\n"
        "import socket, subprocess\n"
        "out = []\n"
        "for probe in (lambda: socket.socket(), lambda: socket.create_connection(('127.0.0.1', 9)),"
        " lambda: socket.getaddrinfo('example.com', 80), lambda: subprocess.run(['true'])):\n"
        "    try:\n"
        "        probe(); out.append('open')\n"
        "    except Exception:\n"
        "        out.append('blocked')\n"
        "print(','.join(out))\n"
    )
    proc = subprocess.run([sys.executable, "-I", "-c", code, str(FULL)], capture_output=True, text=True, timeout=60, cwd=tmp_path)
    assert proc.stdout.strip().split(",")[:3] == ["blocked", "blocked", "blocked"], proc.stderr


def test_installed_jinja2_is_at_least_3_1_6():
    import jinja2

    parts = tuple(int(p) for p in jinja2.__version__.split(".")[:3])
    assert parts >= (3, 1, 6), jinja2.__version__
