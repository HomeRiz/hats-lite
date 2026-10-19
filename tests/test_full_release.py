import json
import subprocess
import sys
from pathlib import Path

WORKER = Path(__file__).resolve().parent.parent / "scripts" / "full" / "jinja_worker.py"
STATES = [{"entity_id": "input_number.lcars_menu_font", "state": "20", "attributes": {}}]
TEMPLATE = "{% set x = '\\u0100 ' * 32000 %}{% set s = x ~ x ~ x ~ x %}" + "".join("{% set v" + str(i) + " = s.split() %}" for i in range(20))

DRIVER = """
import json, resource, subprocess, sys
worker, states, template = sys.argv[1], sys.argv[2], sys.argv[3]
proc = subprocess.Popen([sys.executable, "-I", worker], stdin=subprocess.PIPE, stdout=subprocess.PIPE, text=True)
proc.stdin.write(json.dumps({"op": "init", "states": json.loads(states)}) + "\\n")
proc.stdin.flush()
proc.stdout.readline()
errors = 0
for i in range(12):
    proc.stdin.write(json.dumps({"id": i, "template": template, "variables": {}}) + "\\n")
    proc.stdin.flush()
    errors += "error" in json.loads(proc.stdout.readline())
proc.stdin.close()
proc.wait(timeout=60)
peak = resource.getrusage(resource.RUSAGE_CHILDREN).ru_maxrss
print(json.dumps({"errors": errors, "peak_mb": peak / (1048576 if sys.platform == "darwin" else 1024)}))
"""


def test_memory_of_refused_renders_is_released_between_renders(tmp_path):
    proc = subprocess.run(
        [sys.executable, "-I", "-c", DRIVER, str(WORKER), json.dumps(STATES), TEMPLATE],
        capture_output=True,
        text=True,
        timeout=120,
        cwd=tmp_path,
    )
    assert proc.returncode == 0, proc.stderr
    result = json.loads(proc.stdout)
    assert result["errors"] == 12
    assert result["peak_mb"] < 250, result
