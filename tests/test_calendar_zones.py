import json
from datetime import date, datetime, timezone
from pathlib import Path
from zoneinfo import ZoneInfo

import pytest

from custom_components.hats_lite.resolver import day_view

CASES = json.loads((Path(__file__).parent / "fixtures" / "calendar_zones.json").read_text())


def stamp(text):
    return datetime.fromisoformat(text.replace("Z", "+00:00")).astimezone(timezone.utc).timestamp()


def state_for(case):
    return {
        "overrides": [
            {"id": "o", "user_id": "u", "theme": "A", "source": "manual", "assigned_by": "x",
             "starts": stamp(case["starts"]), "ends": stamp(case["ends"])}
        ]
    }


def window(view):
    if not view["items"]:
        return "absent"
    item = view["items"][0]
    if not item.get("partial"):
        return None
    return [item["active_from"], item["active_until"]]


@pytest.mark.parametrize("case", CASES, ids=[c["name"] for c in CASES])
def test_partial_windows(case):
    tz = ZoneInfo(case["tz"])
    state = state_for(case)
    for day, expected in case["expect"].items():
        view = day_view("u", date.fromisoformat(day), state, tz)
        assert window(view) == ("absent" if expected is None else expected), day
