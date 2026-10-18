import asyncio
import json
import pathlib
from uuid import uuid4

import pytest
import voluptuous as vol
import yaml
from homeassistant.core import Context
from homeassistant.exceptions import ServiceValidationError
from people_support import DAY, NOW, clock, make_user, setup, store_of  # noqa: F401

from custom_components.hats_lite import api, scheduler
from custom_components.hats_lite.const import DOMAIN

PKG = pathlib.Path(__file__).parent.parent / "custom_components" / "hats_lite"
PREVIOUS = {"theme": "Midnight"}
CANDIDATE = {"theme": "Sunset"}


@pytest.fixture
async def cast(hass, setup):
    users = {
        "admin": await make_user(hass, "Root", admin=True),
        "helper": await make_user(hass, "Helper"),
        "kid": await make_user(hass, "Kid"),
        "peer": await make_user(hass, "Peer"),
    }
    await store_of(hass).async_set_assigners([users["helper"].id])
    return users


async def run(hass, who=None, **data):
    context = Context(user_id=who.id if who else None)
    return await hass.services.async_call(
        DOMAIN, "revert_now", data, blocking=True, context=context, return_response=True
    )


async def fails(hass, key, who=None, **data):
    with pytest.raises(ServiceValidationError) as err:
        await run(hass, who, **data)
    assert err.value.translation_key == key
    assert err.value.translation_domain == DOMAIN


async def trial_for(hass, user, previous=PREVIOUS):
    return await api.async_start_user_trial(hass, user.id, previous, CANDIDATE)


async def override_for(hass, user, by=None, theme="Sunset"):
    item = {
        "id": uuid4().hex,
        "user_id": user.id,
        "theme": theme,
        "source": "manual",
        "assigned_by": by or user.id,
        "starts": NOW,
        "ends": NOW + DAY,
    }
    return await store_of(hass).async_add_override(item)


def events(hass, name):
    seen = []
    hass.bus.async_listen(name, lambda event: seen.append(event.data))
    return seen


async def test_self_reverts_running_trial(hass, cast):
    trial = await trial_for(hass, cast["kid"])
    reverts = events(hass, api.REVERT_EVENT)
    out = await run(hass, cast["kid"])
    await hass.async_block_till_done()
    assert out == {"reverted": "trial"}
    assert store_of(hass).get_trial(cast["kid"].id) is None
    assert store_of(hass).get_outcome(cast["kid"].id, NOW)["outcome"] == "cancelled"
    assert reverts == [{"user_id": cast["kid"].id, "selection": trial.previous}]
    assert cast["kid"].id not in hass.data[DOMAIN]["handles"]


async def test_trial_revert_reaches_open_tabs(hass, cast):
    await trial_for(hass, cast["kid"])
    received = []
    hass.data[DOMAIN]["subscribers"].setdefault(cast["kid"].id, {})["k"] = received.append
    await run(hass, cast["kid"])
    assert received == [{"type": "revert", "selection": PREVIOUS, "started_at": NOW}]


async def test_self_reverts_own_override(hass, cast):
    await override_for(hass, cast["kid"])
    out = await run(hass, cast["kid"])
    assert out == {"reverted": "override"}
    assert store_of(hass).all_overrides() == []


async def test_override_removal_pushes_effective_event(hass, cast):
    await override_for(hass, cast["kid"])
    scheduler.async_reschedule(hass, None)
    await asyncio_settle(hass)
    effective = events(hass, "hats_lite_effective")
    await run(hass, cast["kid"])
    await asyncio_settle(hass)
    kid = [e for e in effective if e["user_id"] == cast["kid"].id]
    assert kid and kid[-1]["source"] != "manual"


async def asyncio_settle(hass):
    await asyncio.sleep(0.4)
    await hass.async_block_till_done()


async def test_trial_wins_over_override(hass, cast):
    await trial_for(hass, cast["kid"])
    await override_for(hass, cast["kid"])
    assert await run(hass, cast["kid"]) == {"reverted": "trial"}
    assert len(store_of(hass).all_overrides()) == 1
    assert await run(hass, cast["kid"]) == {"reverted": "override"}


async def test_nothing_to_revert(hass, cast):
    assert await run(hass, cast["kid"]) == {"reverted": "none"}


async def test_other_assigned_override_is_not_self_choice(hass, cast):
    await override_for(hass, cast["kid"], by=cast["admin"].id)
    assert await run(hass, cast["kid"]) == {"reverted": "none"}
    assert len(store_of(hass).all_overrides()) == 1


async def test_expired_self_override_is_not_reverted(hass, cast, clock):
    await override_for(hass, cast["kid"])
    clock["t"] = NOW + DAY + 5
    assert await run(hass, cast["kid"]) == {"reverted": "none"}


async def test_other_users_state_untouched(hass, cast):
    await trial_for(hass, cast["peer"])
    await override_for(hass, cast["peer"])
    await override_for(hass, cast["kid"])
    await trial_for(hass, cast["kid"])
    await run(hass, cast["kid"])
    await run(hass, cast["kid"])
    assert store_of(hass).get_trial(cast["peer"].id) is not None
    assert [o["user_id"] for o in store_of(hass).all_overrides()] == [cast["peer"].id]


async def test_admin_reverts_for_another_user(hass, cast):
    await trial_for(hass, cast["kid"])
    assert await run(hass, cast["admin"], user=cast["kid"].id) == {"reverted": "trial"}
    await override_for(hass, cast["kid"])
    assert await run(hass, cast["admin"], user="kid") == {"reverted": "override"}


async def test_admin_without_user_acts_on_self_only(hass, cast):
    await trial_for(hass, cast["kid"])
    assert await run(hass, cast["admin"]) == {"reverted": "none"}
    assert store_of(hass).get_trial(cast["kid"].id) is not None


async def test_assigner_rules(hass, cast):
    await trial_for(hass, cast["kid"])
    assert await run(hass, cast["helper"], user=cast["kid"].id) == {"reverted": "trial"}
    await trial_for(hass, cast["admin"])
    await fails(hass, "unauthorized", cast["helper"], user=cast["admin"].id)
    assert store_of(hass).get_trial(cast["admin"].id) is not None


async def test_normal_user_refused_for_another(hass, cast):
    await trial_for(hass, cast["peer"])
    for ident in (cast["peer"].id, "Peer", cast["admin"].id, "ghost"):
        await fails(hass, "unauthorized", cast["kid"], user=ident)
    assert store_of(hass).get_trial(cast["peer"].id) is not None


async def test_normal_user_may_name_self(hass, cast):
    await trial_for(hass, cast["kid"])
    assert await run(hass, cast["kid"], user="KID") == {"reverted": "trial"}


async def test_admin_unknown_user(hass, cast):
    await fails(hass, "invalid_user", cast["admin"], user="ghost")


async def test_automation_off_then_on(hass, cast, setup):
    await trial_for(hass, cast["kid"])
    await fails(hass, "unauthorized", None, user=cast["kid"].id)
    assert store_of(hass).get_trial(cast["kid"].id) is not None
    hass.config_entries.async_update_entry(setup, options={"allow_automation_assign": True})
    assert await run(hass, None, user=cast["kid"].id) == {"reverted": "trial"}


async def test_automation_without_user_field(hass, cast, setup):
    hass.config_entries.async_update_entry(setup, options={"allow_automation_assign": True})
    await fails(hass, "invalid_user", None)


async def test_unknown_context_user_is_unauthorized(hass, cast):
    context = Context(user_id="gone")
    with pytest.raises(ServiceValidationError) as err:
        await hass.services.async_call(DOMAIN, "revert_now", {}, blocking=True, context=context, return_response=True)
    assert err.value.translation_key == "unauthorized"


async def test_opted_out_refused(hass, cast):
    await trial_for(hass, cast["kid"])
    await store_of(hass).async_set_opt_out(cast["kid"].id, True)
    await fails(hass, "opted_out", cast["kid"])
    await fails(hass, "opted_out", cast["admin"], user=cast["kid"].id)
    assert store_of(hass).get_trial(cast["kid"].id) is not None


async def test_removal_hold_blocks_restoring_removing_theme(hass, cast):
    await trial_for(hass, cast["kid"], previous={"theme": "Frosted"})
    hass.data[DOMAIN]["removing"] = {"frosted"}
    await fails(hass, "theme_unavailable", cast["kid"])
    assert store_of(hass).get_trial(cast["kid"].id) is not None


async def test_removal_hold_does_not_block_other_themes(hass, cast):
    await trial_for(hass, cast["kid"])
    hass.data[DOMAIN]["removing"] = {"frosted"}
    assert await run(hass, cast["kid"]) == {"reverted": "trial"}


async def test_removal_hold_allows_dropping_override_of_removing_theme(hass, cast):
    await override_for(hass, cast["kid"], theme="Frosted")
    hass.data[DOMAIN]["removing"] = {"frosted"}
    assert await run(hass, cast["kid"]) == {"reverted": "override"}


@pytest.mark.parametrize("data", [{"user": ""}, {"extra": 1}, {"user": 5}])
async def test_schema_errors(hass, cast, data):
    with pytest.raises(vol.Invalid):
        await run(hass, cast["kid"], **data)


async def test_service_unloaded_not_registered(hass):
    assert not hass.services.has_service(DOMAIN, "revert_now")


async def test_registered_and_removed_with_entry(hass, cast, setup):
    assert hass.services.has_service(DOMAIN, "revert_now")
    await hass.config_entries.async_unload(setup.entry_id)
    await hass.async_block_till_done()
    assert not hass.services.has_service(DOMAIN, "revert_now")


def test_yaml_and_translations_describe_service():
    spec = yaml.safe_load((PKG / "services.yaml").read_text())["revert_now"]
    text = json.loads((PKG / "translations" / "en.json").read_text())
    entry = text["services"]["revert_now"]
    assert entry["name"] and entry["description"]
    assert set(spec["fields"]) == set(entry["fields"]) == {"user"}
    assert "selector" in spec["fields"]["user"]
    assert entry["fields"]["user"]["name"] and entry["fields"]["user"]["description"]
