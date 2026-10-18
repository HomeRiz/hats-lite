import pytest
from homeassistant.core import Context
from homeassistant.exceptions import ServiceValidationError
from people_support import DAY, NOW, call, clock, client_for, make_user, setup, store_of  # noqa: F401

from custom_components.hats_lite import api_effective, scheduler
from custom_components.hats_lite.const import DOMAIN
from test_people_api import cast  # noqa: F401
from test_scheduler import advance, listen, seed, watch


def test_debounce_is_a_quarter_second_constant():
    assert scheduler.DEBOUNCE_SECONDS == 0.25


async def test_ten_writes_in_the_window_make_one_recompute_and_one_event(hass, setup, clock):
    kid = await make_user(hass, "Kid")
    sent = watch(hass, kid)
    seen = listen(hass)
    await seed(hass, kid, NOW + 3600)
    for _ in range(10):
        scheduler.async_reschedule(hass, kid.id)
    await advance(hass, 0.3)
    assert len(seen) == 1 and len(sent) == 1


async def test_debounce_timer_uses_the_constant(hass, setup, monkeypatch):
    delays = []
    real = hass.loop.call_later

    def spy(delay, *args):
        delays.append(delay)
        return real(delay, *args)

    monkeypatch.setattr(hass.loop, "call_later", spy)
    state = hass.data[DOMAIN]["scheduler"]
    if state["debounce"] is not None:
        state["debounce"].cancel()
        state["debounce"] = None
    for _ in range(10):
        scheduler.async_reschedule(hass, None)
    assert delays == [scheduler.DEBOUNCE_SECONDS]


async def test_automation_assigner_is_named(hass, cast):
    kid = cast["users"]["kid"]
    await store_of(hass).async_add_override({
        "id": "auto-1", "user_id": kid.id, "theme": "Sunset", "source": "manual",
        "assigned_by": "automation", "starts": NOW - 10, "ends": None,
    })
    assert api_effective.AUTOMATION_NAME == "Automation"
    people = (await call(cast["clients"]["admin"], 1, "people"))["result"]["people"]
    row = next(item for item in people if item["id"] == kid.id)
    assert row["active_override"]["assigned_by_name"] == "Automation"
    result = (await call(cast["clients"]["kid"], 1, "effective"))["result"]
    assert result["assigned_by_name"] == "Automation"
    sent = watch(hass, kid)
    await api_effective.refresh_user(hass, kid.id)
    assert sent[-1]["assigned_by_name"] == "Automation"


async def test_unknown_assigner_stays_null(hass, cast):
    kid = cast["users"]["kid"]
    await store_of(hass).async_add_override({
        "id": "ghost-1", "user_id": kid.id, "theme": "Sunset", "source": "manual",
        "assigned_by": "deleted-user", "starts": NOW - 10, "ends": None,
    })
    people = (await call(cast["clients"]["admin"], 1, "people"))["result"]["people"]
    row = next(item for item in people if item["id"] == kid.id)
    assert row["active_override"]["assigned_by_name"] is None
    assert "assigned_by_name" not in (await call(cast["clients"]["kid"], 1, "effective"))["result"]


@pytest.mark.parametrize("service", ["assign_theme", "apply_theme"])
@pytest.mark.parametrize("duration", [59, 0, -5, 2592001, 59.5])
async def test_out_of_range_duration_raises_readable_error(hass, setup, service, duration):
    admin = await make_user(hass, "Root", admin=True)
    kid = await make_user(hass, "Kid")
    with pytest.raises(ServiceValidationError) as err:
        await hass.services.async_call(
            DOMAIN, service, {"theme": "Sunset", "user": kid.id, "duration": duration},
            blocking=True, context=Context(user_id=admin.id), return_response=True,
        )
    assert err.value.translation_key == "invalid_range"
    assert err.value.translation_domain == DOMAIN
    assert store_of(hass).all_overrides() == []


async def test_in_range_duration_still_accepted(hass, setup):
    admin = await make_user(hass, "Root", admin=True)
    kid = await make_user(hass, "Kid")
    out = await hass.services.async_call(
        DOMAIN, "assign_theme", {"theme": "Sunset", "user": kid.id, "duration": 60},
        blocking=True, context=Context(user_id=admin.id), return_response=True,
    )
    assert out["ends"] == NOW + 60
