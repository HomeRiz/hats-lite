from homeassistant.config_entries import ConfigFlow, ConfigFlowResult

from .const import DOMAIN


class HatsLiteConfigFlow(ConfigFlow, domain=DOMAIN):
    VERSION = 1

    async def async_step_user(self, user_input=None) -> ConfigFlowResult:
        if self._async_current_entries():
            return self.async_abort(reason="single_instance_allowed")
        return self.async_create_entry(title="HATS Lite", data={})
