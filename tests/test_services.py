import json
import pathlib

import pytest
import voluptuous as vol
from homeassistant.core import Context
from homeassistant.exceptions import ServiceValidationError
from people_support import DAY, NOW, call, clock, client_for, make_user, setup, store_of  # noqa: F401

from custom_components.hats_lite.const import DOMAIN

PKG = pathlib.Path(__file__).parent.parent / "custom_components" / "hats_lite"


@pytest.fixture
async def cast(hass, setup):
    users = {
        "admin": await make_user(hass, "Root", admin=True),
        "helper": await make_user(hass, "Helper"),
        "kid": await make_user(hass, "Kid"),
        "peer": await make_user(hass, "Peer"),
        "twin1": await make_user(hass, "Twin"),
        "twin2": await make_user(hass, "twin"),
        "system": await make_user(hass, "Sys", system_generated=True),
    }
    await store_of(hass).async_set_assigners([users["helper"].id])
    return users


async def run(hass, service, who=None, **data):
    context = Context(user_id=who.id if who else None)
    return await hass.services.async_call(
        DOMAIN, service, data, blocking=True, context=context, return_response=True
    )


async def fails(hass, service, key, who=None, **data):
    with pytest.raises(ServiceValidationError) as err:
        await run(hass, service, who, **data)
    assert err.value.translation_key == key
    assert err.value.translation_domain == DOMAIN


async def test_assign_returns_response_and_stores_override(hass, cast):
    out = await run(hass, "assign_theme", cast["admin"], theme="Sunset", user=cast["kid"].id, mode="dark")
    item = store_of(hass).all_overrides()[0]
    assert out == {"id": item["id"], "user_id": cast["kid"].id, "theme": "Sunset", "dark": True, "ends": None}
    assert item["assigned_by"] == cast["admin"].id and item["source"] == "manual"


async def test_modes_map_to_dark_values(hass, cast):
    kid = cast["kid"].id
    assert (await run(hass, "assign_theme", cast["admin"], theme="Sunset", user=kid))["dark"] is None
    assert (await run(hass, "assign_theme", cast["admin"], theme="Sunset", user=kid, mode="light"))["dark"] is False


async def test_assign_duration_sets_ends(hass, cast):
    out = await run(hass, "assign_theme", cast["admin"], theme="Sunset", user=cast["kid"].id, duration=3600)
    assert out["ends"] == NOW + 3600


@pytest.mark.parametrize("duration", [59, 2592001, 0, -5])
async def test_duration_bounds_are_validation_errors(hass, cast, duration):
    await fails(hass, "assign_theme", "invalid_range", cast["admin"], theme="Sunset", user=cast["kid"].id, duration=duration)
    assert store_of(hass).all_overrides() == []


async def test_duration_non_number_is_a_schema_error(hass, cast):
    with pytest.raises(vol.Invalid):
        await run(hass, "assign_theme", cast["admin"], theme="Sunset", user=cast["kid"].id, duration="x")


@pytest.mark.parametrize("data", [
    {"user": "x"}, {"theme": "Sunset"}, {"theme": "Sunset", "user": "x", "mode": "sepia"},
    {"theme": "", "user": "x"}, {"theme": "Sunset", "user": "x", "extra": 1},
])
async def test_assign_schema_errors(hass, cast, data):
    with pytest.raises(vol.Invalid):
        await run(hass, "assign_theme", cast["admin"], **data)


async def test_apply_schema_errors(hass, cast):
    for data in ({}, {"theme": "Sunset", "mode": "x"}, {"theme": "Sunset", "duration": "x"}):
        with pytest.raises(vol.Invalid):
            await run(hass, "apply_theme", cast["kid"], **data)


async def test_apply_for_self_defaults_to_24_hours(hass, cast):
    out = await run(hass, "apply_theme", cast["kid"], theme="Midnight")
    assert out["user_id"] == cast["kid"].id and out["ends"] == NOW + DAY
    assert store_of(hass).all_overrides()[0]["assigned_by"] == cast["kid"].id


async def test_apply_for_other_with_duration(hass, cast):
    out = await run(hass, "apply_theme", cast["helper"], theme="Sunset", user=cast["kid"].id, duration=120)
    assert out["user_id"] == cast["kid"].id and out["ends"] == NOW + 120


async def test_unknown_system_and_missing_users(hass, cast):
    await fails(hass, "assign_theme", "invalid_user", cast["admin"], theme="Sunset", user="ghost")
    await fails(hass, "assign_theme", "invalid_user", cast["admin"], theme="Sunset", user=cast["system"].id)


async def test_user_name_resolves_case_insensitively_and_ambiguity_fails(hass, cast):
    out = await run(hass, "assign_theme", cast["admin"], theme="Sunset", user="kId")
    assert out["user_id"] == cast["kid"].id
    await fails(hass, "assign_theme", "invalid_user", cast["admin"], theme="Sunset", user="TWIN")


async def test_non_admin_cannot_target_others(hass, cast):
    for target in (cast["admin"], cast["peer"], "ghost", "Peer"):
        ident = target if isinstance(target, str) else target.id
        await fails(hass, "assign_theme", "unauthorized", cast["kid"], theme="Sunset", user=ident)
        await fails(hass, "apply_theme", "unauthorized", cast["kid"], theme="Sunset", user=ident)
    assert store_of(hass).all_overrides() == []


async def test_non_admin_may_target_self_by_id_or_name(hass, cast):
    assert (await run(hass, "assign_theme", cast["kid"], theme="Sunset", user=cast["kid"].id))["theme"] == "Sunset"
    assert (await run(hass, "apply_theme", cast["kid"], theme="Sunset", user="kid"))["user_id"] == cast["kid"].id


async def test_assigner_rules(hass, cast):
    helper = cast["helper"]
    assert (await run(hass, "assign_theme", helper, theme="Sunset", user=cast["peer"].id))["user_id"]
    await fails(hass, "assign_theme", "unauthorized", helper, theme="Sunset", user=cast["admin"].id)


async def test_automation_context_off_then_on(hass, cast, setup):
    await fails(hass, "assign_theme", "unauthorized", None, theme="Sunset", user=cast["kid"].id)
    await fails(hass, "apply_theme", "unauthorized", None, theme="Sunset", user=cast["kid"].id)
    hass.config_entries.async_update_entry(setup, options={"allow_automation_assign": True})
    out = await run(hass, "assign_theme", None, theme="Sunset", user=cast["admin"].id)
    assert out["user_id"] == cast["admin"].id
    assert store_of(hass).all_overrides()[0]["assigned_by"] == "automation"
    await fails(hass, "apply_theme", "invalid_user", None, theme="Sunset")


async def test_unknown_context_user_is_unauthorized(hass, cast):
    context = Context(user_id="gone")
    with pytest.raises(ServiceValidationError) as err:
        await hass.services.async_call(
            DOMAIN, "assign_theme", {"theme": "Sunset", "user": cast["kid"].id}, blocking=True, context=context
        )
    assert err.value.translation_key == "unauthorized"


async def test_opted_out_target_refused(hass, cast):
    await store_of(hass).async_set_opt_out(cast["kid"].id, True)
    await fails(hass, "assign_theme", "opted_out", cast["admin"], theme="Sunset", user=cast["kid"].id)
    assert store_of(hass).all_overrides() == []


async def test_unknown_theme_refused(hass, cast):
    await fails(hass, "assign_theme", "unknown_theme", cast["admin"], theme="Nope", user=cast["kid"].id)


async def test_limit_reached(hass, cast, monkeypatch):
    async def full(*args, **kwargs):
        raise ValueError("too_many_overrides")

    monkeypatch.setattr(store_of(hass), "async_add_override", full)
    await fails(hass, "assign_theme", "limit_reached", cast["admin"], theme="Sunset", user=cast["kid"].id)


async def test_override_visible_in_effective_of_target(hass, cast, hass_ws_client):
    await run(hass, "assign_theme", cast["admin"], theme="Midnight", user=cast["kid"].id, mode="dark")
    client = await client_for(hass, hass_ws_client, cast["kid"])
    msg = await call(client, 1, "effective")
    assert msg["result"]["selection"]["theme"] == "Midnight"
    assert msg["result"]["selection"]["dark"] is True
    assert msg["result"]["source"] == "manual"


async def test_unload_removes_services(hass, setup):
    assert hass.services.has_service(DOMAIN, "apply_theme")
    assert hass.services.has_service(DOMAIN, "assign_theme")
    assert await hass.config_entries.async_unload(setup.entry_id)
    await hass.async_block_till_done()
    assert not hass.services.has_service(DOMAIN, "apply_theme")
    assert not hass.services.has_service(DOMAIN, "assign_theme")


async def test_options_flow_toggles_automation_option(hass, setup):
    result = await hass.config_entries.options.async_init(setup.entry_id)
    assert result["type"] == "form"
    result = await hass.config_entries.options.async_configure(
        result["flow_id"], {"allow_automation_assign": True}
    )
    assert result["type"] == "create_entry"
    assert setup.options == {"allow_automation_assign": True}


def test_services_yaml_and_translations_are_consistent():
    import yaml

    services = yaml.safe_load((PKG / "services.yaml").read_text())
    text = json.loads((PKG / "translations" / "en.json").read_text())
    assert set(services) == {"apply_theme", "assign_theme", "revert_now"} == set(text["services"])
    for name, spec in services.items():
        entry = text["services"][name]
        assert entry["name"] and entry["description"]
        assert set(spec["fields"]) == set(entry["fields"])
        for field, field_spec in spec["fields"].items():
            assert "selector" in field_spec
            assert entry["fields"][field]["name"] and entry["fields"][field]["description"]
    for key in ("unauthorized", "invalid_user", "opted_out", "unknown_theme", "invalid_range", "limit_reached"):
        assert text["exceptions"][key]["message"]
    assert text["options"]["step"]["init"]["data"]["allow_automation_assign"]
