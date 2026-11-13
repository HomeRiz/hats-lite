from custom_components.hats_lite import hats_originals

BASE = f"https://raw.githubusercontent.com/{hats_originals.FULL_NAME}/{hats_originals.COMMIT}"


def url_for(path):
    return f"{BASE}/{path}"


def theme_body(name, primary="#123456"):
    return (
        f"{name}:\n"
        f"  primary-color: '{primary}'\n"
        "  modes:\n"
        "    dark:\n"
        "      primary-background-color: '#000000'\n"
        "    light:\n"
        "      primary-background-color: '#ffffff'\n"
    )


class Resp:
    def __init__(self, status=200, body=b"", headers=None):
        self.status = status
        self._body = body
        self.headers = headers or {}

    async def __aenter__(self):
        return self

    async def __aexit__(self, *exc):
        return False

    async def read(self):
        return self._body


class FakeSession:
    def __init__(self, routes):
        self.routes = routes
        self.urls = []

    def get(self, url, **kwargs):
        self.urls.append(url)
        return self.routes.get(url, Resp(status=404))


def bundle(overrides=None):
    routes = {}
    for path, name in zip(hats_originals.PATHS, hats_originals.NAMES):
        routes[url_for(path)] = Resp(body=theme_body(name).encode("utf-8"))
    for path, resp in (overrides or {}).items():
        routes[url_for(path)] = resp
    return routes


def path_of(name):
    stem = name.lower().replace(" ", "-")
    return f"bundled/themes/{stem}.yaml"
