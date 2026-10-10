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


class Content:
    def __init__(self, chunks):
        self.chunks = chunks
        self.consumed = 0

    async def iter_chunked(self, size):
        for chunk in self.chunks:
            self.consumed += 1
            yield chunk


class StreamResp(Resp):
    def __init__(self, chunks, status=200, content_length=None):
        super().__init__(status=status)
        self.content = Content(chunks)
        self.content_length = content_length

    async def read(self):
        raise AssertionError("read must not be called")


RAW = "https://raw.githubusercontent.com/a/b/abc1234/themes/x.yaml"
TREE = "https://api.github.com/repos/a/b/git/trees/abc1234?recursive=1"


async def test_content_length_rejected_without_reading():
    resp = StreamResp([b"x"], content_length=2_000_000)
    with pytest.raises(ThemeFetchError):
        await fetch_theme_yaml(Session({RAW: resp}), "a/b", "abc1234", "themes/x.yaml")
    assert resp.content.consumed == 0


async def test_streamed_body_stops_early():
    resp = StreamResp([b"x" * 65536] * 32)
    with pytest.raises(ThemeFetchError):
        await fetch_theme_yaml(Session({RAW: resp}), "a/b", "abc1234", "themes/x.yaml")
    assert resp.content.consumed <= 17


async def test_streamed_small_body_works():
    resp = StreamResp([b"X:\n", b"  a: b\n"])
    assert "a: b" in await fetch_theme_yaml(Session({RAW: resp}), "a/b", "abc1234", "themes/x.yaml")


async def test_invalid_tree_json_rejected():
    resp = StreamResp([b"{not json"])
    with pytest.raises(ThemeFetchError):
        await fetch_theme_yaml(Session({TREE: resp}), "a/b", "abc1234")


async def test_streamed_tree_works():
    tree = StreamResp([b'{"tree": [{"path": "themes/x.yaml", "type": "blob"}]}'])
    raw = StreamResp([b"X:\n  a: b\n"])
    assert "a: b" in await fetch_theme_yaml(Session({TREE: tree, RAW: raw}), "a/b", "abc1234")


@pytest.mark.parametrize(
    "commit,path",
    [("main/./x", "themes/x.yaml"), ("a//b", "themes/x.yaml"), ("/abc", "themes/x.yaml"), ("abc1234", "a/./b.yaml"), ("abc1234", "a//b.yaml"), ("abc1234", "/a.yaml")],
)
async def test_rejects_dot_and_empty_segments(commit, path):
    with pytest.raises(ThemeFetchError):
        await fetch_theme_yaml(Session({}), "a/b", commit, path)


async def test_truncated_tree_without_theme_raises():
    session = Session({TREE: Resp(payload={"truncated": True, "tree": [{"path": "README.md", "type": "blob"}]})})
    with pytest.raises(ThemeFetchError, match="truncated"):
        await fetch_theme_yaml(session, "a/b", "abc1234")


JSD = "https://data.jsdelivr.com/v1/packages/gh/a/b@abc1234?structure=flat"


def _files(*names):
    return Resp(payload={"files": [{"name": name} for name in names]})


async def test_jsdelivr_listing_is_used_first():
    session = Session({JSD: _files("/README.md", "/themes/x.yaml", "/themes/y.yml"), RAW: Resp(body=b"X:\n  a: b\n")})
    assert "a: b" in await fetch_theme_yaml(session, "a/b", "abc1234")
    assert session.urls == [JSD, RAW]


async def test_falls_back_to_github_tree_on_jsdelivr_failures():
    tree = Resp(payload={"tree": [{"path": "themes/x.yaml", "type": "blob"}]})
    for bad in (Resp(status=403), Resp(payload=["x"]), Resp(payload={"files": "no"}), Resp(payload={"files": [1]})):
        session = Session({JSD: bad, TREE: tree, RAW: Resp(body=b"X:\n  a: b\n")})
        assert "a: b" in await fetch_theme_yaml(session, "a/b", "abc1234")
        assert session.urls == [JSD, TREE, RAW]


async def test_both_listings_failing_raises():
    limited = Resp(status=403)
    limited.headers = {"X-RateLimit-Remaining": "0"}
    session = Session({JSD: Resp(status=500), TREE: limited})
    with pytest.raises(ThemeFetchError, match="403") as info:
        await fetch_theme_yaml(session, "a/b", "abc1234")
    assert info.value.code == "rate_limited"


async def test_jsdelivr_url_is_built_from_validated_values():
    url = "https://data.jsdelivr.com/v1/packages/gh/a/b@HEAD?structure=flat"
    raw = "https://raw.githubusercontent.com/a/b/HEAD/themes/x.yaml"
    session = Session({url: _files("/themes/x.yaml"), raw: Resp(body=b"X:\n  a: b\n")})
    assert "a: b" in await fetch_theme_yaml(session, "a/b", "HEAD")
    assert session.urls[0] == url


def pick(paths, repo="b", truncated=False):
    from custom_components.hats_lite.theme_fetch import pick_theme_path

    return pick_theme_path(paths, repo, truncated)


def test_picker_skips_source_dirs_and_helper_names():
    assert pick(["src/themes/lcars.yaml", "dist/x.yaml", "defaults.yaml", "themes/real.yaml"]) == "themes/real.yaml"
    assert pick([".github/workflows/ci.yml", "secrets.yaml", "preamble.yaml", "configuration.yaml", "my.yaml"]) == "my.yaml"


def test_picker_uses_excluded_dirs_when_nothing_else():
    assert pick(["test/b.yaml", "src/a.yaml"], repo="zzz") == "src/a.yaml"


def test_picker_prefers_themes_then_repo_name_then_alphabetical():
    assert pick(["a.yaml", "themes/zeta.yaml", "themes/alpha.yaml"]) == "themes/alpha.yaml"
    assert pick(["themes/alpha.yaml", "themes/my-theme.yaml"], repo="My-Theme") == "themes/my-theme.yaml"
    assert pick(["themes/alpha.yaml", "themes/ha-my-theme-dark.yaml"], repo="my-theme") == "themes/ha-my-theme-dark.yaml"


def test_picker_ha_lcars_like_tree():
    paths = [
        "src/themes/lcars_base.yaml",
        "src/themes/lcars_colors.yaml",
        "docs/example.yaml",
        "lcars/ha-lcars.yaml",
        "defaults.yaml",
        ".github/workflows/build.yml",
    ]
    assert pick(paths, repo="ha-lcars") == "lcars/ha-lcars.yaml"


def test_picker_errors():
    with pytest.raises(ThemeFetchError, match="No theme"):
        pick(["README.md", "hacs.yaml"])
    with pytest.raises(ThemeFetchError, match="truncated"):
        pick([], truncated=True)


class TimeoutSession(Session):
    def __init__(self, routes):
        super().__init__(routes)
        self.kwargs = []

    def get(self, url, **kwargs):
        self.kwargs.append(kwargs)
        return self.routes[url]


async def test_every_request_has_an_explicit_timeout():
    session = TimeoutSession({JSD: _files("/themes/x.yaml"), RAW: Resp(body=b"X:\n  a: b\n")})
    await fetch_theme_yaml(session, "a/b", "abc1234")
    assert len(session.kwargs) == 2
    for kwargs in session.kwargs:
        timeout = kwargs["timeout"]
        assert timeout.total == 20
        assert timeout.sock_connect == 8


async def test_listing_fallback_requests_carry_the_timeout():
    session = TimeoutSession(
        {
            JSD: Resp(status=500),
            TREE: Resp(payload={"tree": [{"path": "themes/x.yaml", "type": "blob"}]}),
            RAW: Resp(body=b"X:\n  a: b\n"),
        }
    )
    await fetch_theme_yaml(session, "a/b", "abc1234")
    assert [kw["timeout"].total for kw in session.kwargs] == [20, 20, 20]


@pytest.mark.parametrize("status,transient", [(403, False), (429, True), (500, True), (503, True), (404, False), (410, True), (422, False)])
async def test_status_errors_are_classified(status, transient):
    with pytest.raises(ThemeFetchError) as info:
        await fetch_theme_yaml(Session({RAW: Resp(status=status)}), "a/b", "abc1234", "themes/x.yaml")
    assert info.value.transient is transient


async def test_network_errors_and_timeouts_are_transient():
    import asyncio

    class Boom:
        async def __aenter__(self):
            raise asyncio.TimeoutError()

        async def __aexit__(self, *exc):
            return False

    with pytest.raises(ThemeFetchError) as info:
        await fetch_theme_yaml(Session({RAW: Boom()}), "a/b", "abc1234", "themes/x.yaml")
    assert info.value.transient is True


async def test_validation_and_size_errors_are_permanent():
    with pytest.raises(ThemeFetchError) as info:
        await fetch_theme_yaml(Session({RAW: Resp(body=b"x" * 1_048_577)}), "a/b", "abc1234", "themes/x.yaml")
    assert info.value.transient is False


@pytest.mark.parametrize(
    "name,commit,path",
    [
        ("a" * 200 + "/b", "abc1234", "themes/x.yaml"),
        ("a/b", "c" * 101, "themes/x.yaml"),
        ("a/b", "abc1234", "p/" * 200 + "x.yaml"),
    ],
)
async def test_length_caps(name, commit, path):
    with pytest.raises(ThemeFetchError):
        await fetch_theme_yaml(Session({}), name, commit, path)


def test_validate_request_is_public_and_checks_everything():
    from custom_components.hats_lite.theme_fetch import validate_request

    validate_request("a/b", "abc1234", "themes/x.yaml")
    validate_request("a/b", "abc1234", None)
    for args in (("../b", "abc1234", None), ("a/b", "bad commit", None), ("a/b", "abc1234", "a/../b.yaml")):
        with pytest.raises(ThemeFetchError):
            validate_request(*args)


class _Missing(dict):
    def __getitem__(self, key):
        if key in self:
            return super().__getitem__(key)
        return Resp(status=404)


def _big():
    return StreamResp([b"x"], content_length=5 * 1024 * 1024)


async def test_oversize_listing_falls_back_to_the_default_path():
    raw = "https://raw.githubusercontent.com/a/b/abc1234/themes/b.yaml"
    session = Session(_Missing({JSD: _big(), TREE: _big(), raw: Resp(body=b"X:\n  a: b\n")}))
    assert "a: b" in await fetch_theme_yaml(session, "a/b", "abc1234")


async def test_oversize_listing_without_default_file_is_too_large():
    session = Session(_Missing({JSD: _big(), TREE: _big()}))
    with pytest.raises(ThemeFetchError) as info:
        await fetch_theme_yaml(session, "a/b", "abc1234")
    assert info.value.code == "theme_too_large"
