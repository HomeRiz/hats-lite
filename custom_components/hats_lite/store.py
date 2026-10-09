from .trial import Trial, trial_from_dict, trial_to_dict


class LiteStore:
    def __init__(self, backend):
        self._backend = backend
        self._trials = {}
        self._originals = {}

    async def async_load(self):
        data = await self._backend.async_load()
        self._trials = {}
        self._originals = {}
        if not isinstance(data, dict):
            return
        trials = data.get("trials")
        if isinstance(trials, dict):
            for user_id, raw in trials.items():
                trial = trial_from_dict(raw)
                if trial is not None:
                    self._trials[user_id] = trial
        originals = data.get("originals")
        if isinstance(originals, dict):
            self._originals = {k: dict(v) for k, v in originals.items() if isinstance(v, dict)}

    async def _save(self):
        await self._backend.async_save(
            {
                "version": 1,
                "trials": {k: trial_to_dict(v) for k, v in self._trials.items()},
                "originals": dict(self._originals),
            }
        )

    def get_trial(self, user_id):
        return self._trials.get(user_id)

    def all_trials(self):
        return list(self._trials.values())

    async def async_set_trial(self, trial):
        self._trials[trial.user_id] = trial
        await self._save()

    async def async_clear_trial(self, user_id):
        self._trials.pop(user_id, None)
        await self._save()

    def get_original(self, user_id):
        return self._originals.get(user_id)

    async def async_set_original(self, user_id, selection):
        self._originals[user_id] = dict(selection)
        await self._save()

    async def async_clear_original(self, user_id):
        self._originals.pop(user_id, None)
        await self._save()
