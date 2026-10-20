import pytest

from custom_components.hats_lite.assignments import holidays_replacement
from custom_components.hats_lite.store_people import clean_holiday

BASE = {
    "id": "h1",
    "name": "Winter",
    "month_start": 12,
    "day_start": 20,
    "month_end": 1,
    "day_end": 5,
    "theme": "Sunset",
}


def test_missing_kind_stays_unchanged():
    item = clean_holiday(BASE)
    assert "kind" not in item
    assert "year" not in item


def test_holiday_kind_is_dropped_as_default():
    assert "kind" not in clean_holiday({**BASE, "kind": "holiday"})


def test_event_kind_is_kept():
    assert clean_holiday({**BASE, "kind": "event"})["kind"] == "event"


@pytest.mark.parametrize("kind", ["party", "", None, 1, True])
def test_unknown_kind_rejected(kind):
    with pytest.raises(ValueError, match="invalid_kind"):
        clean_holiday({**BASE, "kind": kind})


def test_year_is_kept_when_valid():
    assert clean_holiday({**BASE, "kind": "event", "year": 2027})["year"] == 2027


@pytest.mark.parametrize("year", [1999, 2201, "2027", True, 2027.5])
def test_bad_year_rejected(year):
    with pytest.raises(ValueError, match="invalid_year"):
        clean_holiday({**BASE, "year": year})


def test_replacement_accepts_kind_and_year():
    items, code = holidays_replacement([{**BASE, "kind": "event", "year": 2027}], ["Sunset"])
    assert code is None
    assert items[0]["kind"] == "event"


def test_replacement_still_rejects_unknown_keys():
    items, code = holidays_replacement([{**BASE, "bogus": 1}], ["Sunset"])
    assert items is None and code == "invalid_request"
