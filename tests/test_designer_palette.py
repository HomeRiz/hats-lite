from custom_components.hats_lite.theme_sanitizer import parse_themes, theme_to_yaml

DARK = {
    "primary-color": "#03a9f4",
    "accent-color": "#ff9800",
    "primary-background-color": "#0e1f29",
    "secondary-background-color": "#192c39",
    "card-background-color": "#19303e",
    "primary-text-color": "#e2eef5",
    "secondary-text-color": "#99afc0",
    "divider-color": "rgba(255,255,255,0.12)",
    "app-header-background-color": "#03a9f4",
    "app-header-text-color": "#000000",
    "text-primary-color": "#000000",
    "switch-checked-color": "#ff9800",
    "switch-checked-button-color": "#000000",
    "paper-slider-active-color": "#03a9f4",
    "state-icon-color": "#ff9800",
    "sidebar-background-color": "#0a171f",
    "sidebar-text-color": "#e2eef5",
    "sidebar-selected-background-color": "rgba(3,169,244,0.18)",
    "sidebar-selected-text-color": "#03a9f4",
    "sidebar-selected-icon-color": "#03a9f4",
    "ha-card-border-radius": "12px",
    "ha-card-backdrop-filter": "blur(10px)",
    "ha-card-background": "rgba(255,255,255,0.2)",
}
LIGHT = {
    **DARK,
    "primary-background-color": "#f1fafe",
    "secondary-background-color": "#e6f6fe",
    "card-background-color": "#f9fdff",
    "primary-text-color": "#132028",
    "secondary-text-color": "#4c6373",
    "divider-color": "rgba(0,0,0,0.12)",
    "sidebar-background-color": "#ecf9fe",
    "sidebar-text-color": "#132028",
    "sidebar-selected-text-color": "#0276ab",
    "sidebar-selected-icon-color": "#0276ab",
    "ha-card-background": "rgba(255,255,255,0.8)",
}


def test_designer_output_survives_the_sanitizer():
    text = theme_to_yaml("Designer", DARK, {"dark": DARK, "light": LIGHT})
    parsed = parse_themes(text)["Designer"]
    assert parsed["vars"] == DARK
    assert parsed["modes"]["dark"] == DARK
    assert parsed["modes"]["light"] == LIGHT
