from types import SimpleNamespace


class FakeRepo:
    def __init__(self, repo_id, full_name, category="theme", installed=False, file_name=None):
        self.data = SimpleNamespace(
            id=repo_id,
            full_name=full_name,
            name=full_name.split("/")[-1],
            file_name=file_name or full_name.split("/")[-1] + ".yaml",
            category=category,
            description="d",
            stargazers_count=5,
            installed=installed,
            last_commit="abc1234",
        )
        self.content = SimpleNamespace(path=SimpleNamespace(local=None))
        self.downloads = 0
        self.removals = 0
        self.fail = None
        self.remove_fail = None
        self.gate = None

    async def async_download_repository(self, **kwargs):
        if self.gate is not None:
            await self.gate.wait()
        if self.fail is not None:
            raise self.fail
        self.downloads += 1
        self.data.installed = True

    async def uninstall(self):
        if self.gate is not None:
            await self.gate.wait()
        if self.remove_fail is not None:
            raise self.remove_fail
        self.removals += 1
        self.data.installed = False


class FakeHacs:
    def __init__(self, repos):
        self.items = {str(r.data.id): r for r in repos}
        self.repositories = SimpleNamespace(
            list_all=lambda: list(self.items.values()),
            get_by_id=lambda repo_id: self.items.get(repo_id),
        )
        self.configuration = SimpleNamespace(theme_path="themes")
        self.writes = 0
        self.recreated = 0
        self.data = SimpleNamespace(async_write=self._write)

    async def async_recreate_entities(self):
        self.recreated += 1

    async def _write(self):
        self.writes += 1
