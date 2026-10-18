import json
import pathlib

import pytest
from people_support import DAY, NOW, clock, make_user, setup, store_of  # noqa: F401
from test_services import cast, fails, run  # noqa: F401

from custom_components.hats_lite import assignments as rules

PKG = pathlib.Path(__file__).parent.parent / "custom_components" / "hats_lite"


async def test_nameless_active_user_does_not_break_resolution(hass, cast):
    await make_user(hass, "")
    out = await run(hass, "assign_theme", cast["admin"], theme="Sunset", user="kid")
    assert out["user_id"] == cast["kid"].id
    await fails(hass, "assign_theme", "invalid_user", cast["admin"], theme="Sunset", user="ghost")


async def test_nameless_caller_may_target_self_by_id_only(hass, cast):
    nameless = await make_user(hass, "")
    out = await run(hass, "apply_theme", nameless, theme="Sunset", user=nameless.id)
    assert out["user_id"] == nameless.id
    await fails(hass, "apply_theme", "unauthorized", nameless, theme="Sunset", user="Kid")


async def test_self_overrides_supersede_and_leave_others_untouched(hass, cast):
    kid = cast["kid"]
    await run(hass, "assign_theme", cast["admin"], theme="Midnight", user=kid.id)
    for service in ("assign_theme", "apply_theme", "assign_theme"):
        await run(hass, service, kid, theme="Sunset", user=kid.id)
    items = store_of(hass).overrides_for(kid.id)
    own = [i for i in items if i["assigned_by"] == kid.id]
    other = [i for i in items if i["assigned_by"] == cast["admin"].id]
    assert len(items) == 2 and len(own) == 1 and len(other) == 1
    assert other[0]["ends"] is None and own[0]["ends"] == NOW + DAY


async def test_self_assign_without_duration_ends_in_24_hours(hass, cast):
    out = await run(hass, "assign_theme", cast["kid"], theme="Sunset", user=cast["kid"].id)
    assert out["ends"] == NOW + DAY


async def test_self_explicit_duration_is_kept(hass, cast):
    out = await run(hass, "assign_theme", cast["kid"], theme="Sunset", user=cast["kid"].id, duration=600)
    assert out["ends"] == NOW + 600


async def test_admin_assigning_to_self_is_also_bounded(hass, cast):
    admin = cast["admin"]
    await run(hass, "assign_theme", admin, theme="Sunset", user=admin.id)
    out = await run(hass, "assign_theme", admin, theme="Midnight", user=admin.id)
    assert out["ends"] == NOW + DAY and len(store_of(hass).overrides_for(admin.id)) == 1


async def test_other_target_still_permanent_and_not_superseding(hass, cast):
    kid = cast["kid"]
    await run(hass, "assign_theme", cast["admin"], theme="Sunset", user=kid.id)
    out = await run(hass, "assign_theme", cast["admin"], theme="Midnight", user=kid.id)
    assert out["ends"] is None and len(store_of(hass).overrides_for(kid.id)) == 2


async def test_opted_out_self_refused_and_keeps_existing(hass, cast):
    kid = cast["kid"]
    await run(hass, "assign_theme", kid, theme="Sunset", user=kid.id)
    await store_of(hass).async_set_opt_out(kid.id, True)
    await fails(hass, "assign_theme", "opted_out", kid, theme="Sunset", user=kid.id)
    assert len(store_of(hass).overrides_for(kid.id)) == 1


def test_every_error_code_has_an_exception_entry():
    text = json.loads((PKG / "translations" / "en.json").read_text())
    codes = {rules.error_code(c) for c in rules.LIMIT_CODES | {"duplicate_id", "bad_theme", "anything"}}
    assert codes == {"limit_reached", "invalid_request"}
    for key in codes:
        assert text["exceptions"][key]["message"]
