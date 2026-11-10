import pytest
from homeassistant.components.frontend import DATA_THEMES
from people_support import NOW, call, clock, client_for, code, make_user, setup, store_of  # noqa: F401
from test_people_api import cast  # noqa: F401

from custom_components.hats_lite import assign_core
from custom_components.hats_lite.const import DOMAIN
from custom_components.hats_lite.removal import THEME_UNAVAILABLE
from custom_components.hats_lite.store_people import MAX_OVERRIDES_PER_USER


def _row(override_id, user_id, assigned_by, theme):
    return {
        "id": override_id,
        "user_id": user_id,
        "theme": theme,
        "source": "manual",
        "assigned_by": assigned_by,
        "starts": NOW,
        "ends": None,
    }


@pytest.mark.parametrize("theme", ["default", "Sunset", "Midnight"])
async def test_own_set_accepts_known_themes(hass, cast, theme):
    msg = await call(cast["clients"]["kid"], 1, "own_set", theme=theme)
    assert msg["success"] is True and msg["result"]["own"]["theme"] == theme


async def test_own_set_accepts_theme_installed_moments_earlier(hass, cast):
    hass.data[DATA_THEMES]["Dawn"] = {}
    msg = await call(cast["clients"]["kid"], 1, "own_set", theme="Dawn")
    assert msg["success"] is True and msg["result"]["own"]["theme"] == "Dawn"


async def test_own_set_rejects_theme_that_is_not_installed(hass, cast):
    msg = await call(cast["clients"]["kid"], 1, "own_set", theme="Nowhere")
    assert code(msg) == "unknown_theme"
    assert store_of(hass).get_own(cast["users"]["kid"].id) is None
    assert "nowhere" not in store_of(hass).referenced_themes()


async def test_own_set_still_reports_theme_being_removed_first(hass, cast):
    hass.data[DOMAIN]["removing"] = {"nowhere"}
    msg = await call(cast["clients"]["kid"], 1, "own_set", theme="Nowhere")
    assert code(msg) == THEME_UNAVAILABLE


async def test_replace_swaps_the_old_own_override_for_the_new_one(hass, cast):
    store = store_of(hass)
    kid = cast["users"]["kid"].id
    _, first = await assign_core.async_create_override(hass, store, kid, kid, "Sunset", None, None, NOW, True)
    item, second = await assign_core.async_create_override(hass, store, kid, kid, "Midnight", None, None, NOW + 1, True)
    assert first is None and second is None
    assert [row["theme"] for row in store.overrides_for(kid)] == ["Midnight"]
    assert store.overrides_for(kid)[0]["id"] == item["id"]


async def test_replace_at_the_cap_still_succeeds(hass, cast):
    store = store_of(hass)
    kid, admin = cast["users"]["kid"].id, cast["users"]["admin"].id
    await store.async_add_override(_row("own", kid, kid, "Sunset"))
    for index in range(MAX_OVERRIDES_PER_USER - 1):
        await store.async_add_override(_row(f"other-{index}", kid, admin, "Midnight"))
    item, error = await assign_core.async_create_override(hass, store, kid, kid, "Dawn", None, None, NOW, True)
    assert error is None and item is not None
    rows = store.overrides_for(kid)
    assert len(rows) == MAX_OVERRIDES_PER_USER and "own" not in {row["id"] for row in rows}


async def test_theme_removed_during_prune_keeps_the_old_own_override(hass, cast, monkeypatch):
    store = store_of(hass)
    kid = cast["users"]["kid"].id
    await store.async_add_override(_row("own", kid, kid, "Sunset"))
    real_prune = store.async_prune_expired

    async def prune_then_start_removal(now):
        result = await real_prune(now)
        hass.data[DOMAIN]["removing"] = {"midnight"}
        return result

    monkeypatch.setattr(store, "async_prune_expired", prune_then_start_removal)
    try:
        item, error = await assign_core.async_create_override(hass, store, kid, kid, "Midnight", None, None, NOW, True)
    finally:
        hass.data[DOMAIN]["removing"] = set()
    assert (item, error) == (None, THEME_UNAVAILABLE)
    assert [row["id"] for row in store.overrides_for(kid)] == ["own"]


async def test_invalid_replacement_keeps_the_old_own_override(hass, cast):
    store = store_of(hass)
    kid = cast["users"]["kid"].id
    await store.async_add_override(_row("own", kid, kid, "Sunset"))
    item, error = await assign_core.async_create_override(hass, store, kid, kid, "Midnight", None, NOW, NOW + 5, True)
    assert (item, error) == (None, "invalid_request")
    assert [row["id"] for row in store.overrides_for(kid)] == ["own"]


async def test_replace_refused_at_the_cap_keeps_the_old_own_override(hass, cast, monkeypatch):
    store = store_of(hass)
    kid, admin = cast["users"]["kid"].id, cast["users"]["admin"].id
    await store.async_add_override(_row("own", kid, kid, "Sunset"))
    crowd = [_row(f"crowd-{index}", kid, admin, "Midnight") for index in range(MAX_OVERRIDES_PER_USER)]
    real_overrides_for = store.overrides_for
    monkeypatch.setattr(
        store, "overrides_for", lambda user_id: real_overrides_for(user_id) + (crowd if user_id == kid else [])
    )
    item, error = await assign_core.async_create_override(hass, store, kid, kid, "Midnight", None, None, NOW, True)
    assert (item, error) == (None, "limit_reached")
    assert [row["id"] for row in real_overrides_for(kid)] == ["own"]
