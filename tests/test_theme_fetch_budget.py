from custom_components.hats_lite import theme_budget
from custom_components.hats_lite.theme_budget import FetchBudget


class Clock:
    def __init__(self):
        self.now = 0.0

    def __call__(self):
        return self.now


def test_limits_support_browsing_the_whole_catalog():
    assert theme_budget.MAX_FETCHES == 150
    assert theme_budget.GLOBAL_MAX_FETCHES == 600
    assert theme_budget.WINDOW_SECONDS == 600


def test_check_without_charge_records_nothing(monkeypatch):
    monkeypatch.setattr(theme_budget, "MAX_FETCHES", 2)
    budget = FetchBudget(Clock())
    for index in range(5):
        assert budget.allow("u", f"k{index}") is True
    assert budget.allow("u", "a", charge=True) is True
    assert budget.allow("u", "b", charge=True) is True
    assert budget.allow("u", "c") is False
    assert budget.allow("u", "a") is False
    assert budget.allow("u", "a", charge=True) is False


def test_global_ceiling_applies_across_users(monkeypatch):
    monkeypatch.setattr(theme_budget, "GLOBAL_MAX_FETCHES", 3)
    clock = Clock()
    budget = FetchBudget(clock)
    for index in range(3):
        assert budget.allow(f"u{index}", "k", charge=True) is True
    assert budget.allow("u9", "k", charge=True) is False
    assert budget.allow("u0", "k", charge=True) is False
    assert budget.allow("u9", "k") is True
    clock.now = theme_budget.WINDOW_SECONDS
    assert budget.allow("u9", "k", charge=True) is True


def test_memory_stays_bounded(monkeypatch):
    monkeypatch.setattr(theme_budget, "MAX_USERS", 4)
    monkeypatch.setattr(theme_budget, "MAX_FETCHES", 3)
    monkeypatch.setattr(theme_budget, "GLOBAL_MAX_FETCHES", 50)
    budget = FetchBudget(Clock())
    for user in range(20):
        for key in range(10):
            budget.allow(user, key, charge=True)
    assert len(budget._users) <= 4
    assert all(len(keys) <= 3 for keys in budget._users.values())
    assert len(budget._global) <= 50


def test_window_expiry_frees_user_budget(monkeypatch):
    monkeypatch.setattr(theme_budget, "MAX_FETCHES", 1)
    clock = Clock()
    budget = FetchBudget(clock)
    assert budget.allow("u", "a", charge=True) is True
    assert budget.allow("u", "b", charge=True) is False
    clock.now = theme_budget.WINDOW_SECONDS
    assert budget.allow("u", "b", charge=True) is True


def test_repeats_of_one_key_count_against_the_user(monkeypatch):
    monkeypatch.setattr(theme_budget, "MAX_FETCHES", 3)
    budget = FetchBudget(Clock())
    assert [budget.allow("u", "same", charge=True) for _ in range(5)] == [True, True, True, False, False]
    assert budget.allow("other", "same", charge=True) is True


def test_one_user_cannot_fill_the_global_ceiling(monkeypatch):
    monkeypatch.setattr(theme_budget, "MAX_FETCHES", 5)
    monkeypatch.setattr(theme_budget, "GLOBAL_MAX_FETCHES", 8)
    budget = FetchBudget(Clock())
    results = [budget.allow("evil", f"k{index % 2}", charge=True) for index in range(40)]
    assert results.count(True) == 5
    assert budget.allow("victim", "fresh", charge=True) is True
