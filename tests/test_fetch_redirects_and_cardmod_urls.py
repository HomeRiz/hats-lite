from unittest.mock import patch

import pytest

from custom_components.hats_lite import sources
from custom_components.hats_lite.catalog import CatalogError
from custom_components.hats_lite.theme_errors import FETCH_FAILED
from custom_components.hats_lite.theme_fetch import ThemeFetchError, _get_json, fetch_theme_yaml
from custom_components.hats_lite.theme_sanitizer import sanitize_value

RAW = "https://raw.githubusercontent.com/a/b/abc1234/themes/x.yaml"
RAW_MOVED = "https://raw.githubusercontent.com/a/b/abc1234/themes/moved.yaml"
JSD = "https://data.jsdelivr.com/v1/packages/gh/a/b@abc1234?structure=flat"
CATALOG = "https://data-v2.hacs.xyz/theme/data.json"
EVIL = "https://evil.example/x.yaml"
REDIRECTS = (301, 302, 303, 307, 308)
THEME = b"X:\n  a: b\n"


class Content:
    def __init__(self, body):
        self._body = body

    async def iter_chunked(self, size):
        yield self._body


class Resp:
    def __init__(self, status=200, body=b"", headers=None):
        self.status = status
        self.headers = headers or {}
        self.content = Content(body)
        self._body = body

    async def __aenter__(self):
        return self

    async def __aexit__(self, *exc):
        return False

    async def read(self):
        return self._body


class Session:
    def __init__(self, routes):
        self.routes = routes
        self.urls = []

    def get(self, url, allow_redirects=True, **kwargs):
        self.urls.append(url)
        resp = self.routes[url]
        if allow_redirects and resp.status in REDIRECTS:
            return self.get(resp.headers["Location"])
        return resp


class Hass:
    async def async_add_executor_job(self, fn, *args):
        return fn(*args)


async def test_redirect_to_foreign_host_is_refused():
    session = Session({RAW: Resp(302, headers={"Location": EVIL}), EVIL: Resp(body=THEME)})
    with pytest.raises(ThemeFetchError) as info:
        await fetch_theme_yaml(session, "a/b", "abc1234", "themes/x.yaml")
    assert info.value.code == FETCH_FAILED
    assert EVIL not in session.urls


async def test_redirect_to_foreign_host_is_refused_for_json():
    session = Session({JSD: Resp(301, headers={"Location": EVIL}), EVIL: Resp(body=b"{}")})
    with pytest.raises(ThemeFetchError) as info:
        await _get_json(session, JSD)
    assert info.value.code == FETCH_FAILED
    assert EVIL not in session.urls


async def test_redirect_to_foreign_host_is_refused_for_catalog():
    session = Session({CATALOG: Resp(302, headers={"Location": EVIL}), EVIL: Resp(body=b"{}")})
    with patch.object(sources, "async_get_clientsession", return_value=session):
        with pytest.raises(CatalogError):
            await sources.public_loader(Hass())
    assert EVIL not in session.urls


@pytest.mark.parametrize("status", REDIRECTS)
async def test_redirect_within_allow_list_still_works(status):
    session = Session(
        {RAW: Resp(status, headers={"Location": RAW_MOVED}), RAW_MOVED: Resp(body=THEME)}
    )
    assert "a: b" in await fetch_theme_yaml(session, "a/b", "abc1234", "themes/x.yaml")
    assert session.urls == [RAW, RAW_MOVED]


async def test_relative_redirect_within_allow_list_still_works():
    session = Session(
        {RAW: Resp(302, headers={"Location": "/a/b/abc1234/themes/moved.yaml"}), RAW_MOVED: Resp(body=THEME)}
    )
    assert "a: b" in await fetch_theme_yaml(session, "a/b", "abc1234", "themes/x.yaml")


async def test_redirect_loop_is_refused():
    session = Session({RAW: Resp(302, headers={"Location": RAW})})
    with pytest.raises(ThemeFetchError) as info:
        await fetch_theme_yaml(session, "a/b", "abc1234", "themes/x.yaml")
    assert info.value.code == FETCH_FAILED
    assert len(session.urls) == 4


CARD_MOD_KEYS = ["card-mod-card", "uix-card", "UIX-Card"]


@pytest.mark.parametrize("key", CARD_MOD_KEYS)
@pytest.mark.parametrize(
    "value",
    [
        "ha-card { background: url(https://evil.example/a.png); }",
        "ha-card { background: url('https://evil.example/a.png'); }",
        "ha-card[x^='a'] { background: url(https://evil.example/leak); }",
    ],
)
def test_card_mod_rejects_external_https_url(key, value):
    assert sanitize_value(value, key) is None


@pytest.mark.parametrize("key", CARD_MOD_KEYS)
@pytest.mark.parametrize(
    "value",
    [
        "ha-card { background: var(--card-bg); }",
        "ha-card { background: url(var(--bg)); }",
        "ha-card { background: url(/local/a.png); }",
        "ha-card { background: url(/hacsfiles/a/a.png); }",
        "ha-card { background: url(data:image/png;base64,AAAA); }",
    ],
)
def test_card_mod_keeps_allowed_urls(key, value):
    assert sanitize_value(value, key) == value


@pytest.mark.parametrize("key", CARD_MOD_KEYS)
@pytest.mark.parametrize(
    "value",
    [
        "ha-card { background: cross-fade(url(/local/a.png), url(/local/b.png)); }",
        "ha-card { background: image(/local/a.png); }",
        "@font-face { font-family: x; src: url(/local/f.woff); }",
        "@namespace svg 'http://www.w3.org/2000/svg';",
    ],
)
def test_card_mod_rejects_image_crossfade_font_face_and_namespace(key, value):
    assert sanitize_value(value, key) is None


def test_ordinary_key_keeps_external_https_url():
    value = "url(https://example.com/bg.png)"
    assert sanitize_value(value, "lovelace-background") == value

@pytest.mark.parametrize("key", CARD_MOD_KEYS)
@pytest.mark.parametrize(
    "value",
    [
        "ha-card { background: URL(HTTPS://evil.example/a.png); }",
        "ha-card { background: u\\72l(https://evil.example/a.png); }",
        "ha-card { background: url(https\\3a //evil.example/a.png); }",
        "ha-card { background: var(--x, url(https://evil.example/a.png)); }",
        "ha-card { background: url(//evil.example/a.png); }",
        "@import url(https://evil.example/a.css);",
        "ha-card { background: image-set(url(https://evil.example/a.png) 1x); }",
        "ha-card { background: url(https://evil.example/a.png/**/); }",
    ],
)
def test_card_mod_rejects_obfuscated_external_urls(key, value):
    assert sanitize_value(value, key) is None
