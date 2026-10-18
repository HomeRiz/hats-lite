import pytest

pytest_plugins = "pytest_homeassistant_custom_component"


@pytest.fixture(autouse=True)
def auto_enable_custom_integrations(enable_custom_integrations):
    yield


@pytest.fixture(autouse=True)
def fresh_fetch_budget():
    from custom_components.hats_lite.theme_budget import FETCH_BUDGET

    FETCH_BUDGET.clear()
    yield
    FETCH_BUDGET.clear()
