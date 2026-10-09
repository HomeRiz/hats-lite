import pytest

from custom_components.hats_lite.theme_fetch import ThemeFetchError, fetch_theme_yaml


class Resp:
    def __init__(self, status=200, body=b"", payload=None):
        self.status = status
        self._body = body
        self._payload = payload

    async def __aenter__(self):
        return self

    async def __aexit__(self, *exc):
        return False

    async def read(self):
        return self._body

    async def json(self):
        return self._payload


class Session:
    def __init__(self, routes):
        self.routes = routes
        self.urls = []

    def get(self, url, **kwargs):
        self.urls.append(url)
        return self.routes[url]


async def test_fetch_with_explicit_path():
    url = "https://raw.githubusercontent.com/a/b/abc1234/themes/x.yaml"
    session = Session({url: Resp(body=b"X:\n  primary-color: red\n")})
    assert "primary-color" in await fetch_theme_yaml(session, "a/b", "abc1234", "themes/x.yaml")


async def test_fetch_discovers_theme_file():
    tree = "https://api.github.com/repos/a/b/git/trees/abc1234?recursive=1"
    raw = "https://raw.githubusercontent.com/a/b/abc1234/themes/x.yaml"
    session = Session(
        {
            tree: Resp(payload={"tree": [{"path": ".github/dependabot.yml", "type": "blob"}, {"path": "themes/x.yaml", "type": "blob"}]}),
            raw: Resp(body=b"X:\n  a: b\n"),
        }
    )
    assert "a: b" in await fetch_theme_yaml(session, "a/b", "abc1234")


@pytest.mark.parametrize("name,commit", [("../etc", "abc1234"), ("a/b", "bad commit"), ("a b/c", "abc1234")])
async def test_rejects_bad_input(name, commit):
    with pytest.raises(ThemeFetchError):
        await fetch_theme_yaml(Session({}), name, commit)


async def test_rejects_oversized_and_http_errors():
    url = "https://raw.githubusercontent.com/a/b/abc1234/themes/x.yaml"
    with pytest.raises(ThemeFetchError):
        await fetch_theme_yaml(Session({url: Resp(body=b"x" * 1_048_577)}), "a/b", "abc1234", "themes/x.yaml")
    with pytest.raises(ThemeFetchError):
        await fetch_theme_yaml(Session({url: Resp(status=404)}), "a/b", "abc1234", "themes/x.yaml")
