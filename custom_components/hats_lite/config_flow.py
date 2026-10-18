import voluptuous as vol
from homeassistant.config_entries import ConfigEntry, ConfigFlow, ConfigFlowResult, OptionsFlow
from homeassistant.core import callback

from .advanced import MAX_PATH, OPTION_ADVANCED, valid_path
from .const import DOMAIN
from .services import OPTION_AUTOMATION


class HatsLiteOptionsFlow(OptionsFlow):
    async def async_step_init(self, user_input=None) -> ConfigFlowResult:
        errors = {}
        if user_input is not None:
            path = str(user_input.get(OPTION_ADVANCED) or "").strip()
            if path and not valid_path(path):
                errors[OPTION_ADVANCED] = "invalid_advanced_path"
            else:
                data = {key: value for key, value in user_input.items() if key != OPTION_ADVANCED}
                if path:
                    data[OPTION_ADVANCED] = path
                return self.async_create_entry(data=data)
        options = self.config_entry.options
        schema = vol.Schema(
            {
                vol.Required(OPTION_AUTOMATION, default=options.get(OPTION_AUTOMATION, False)): bool,
                vol.Optional(
                    OPTION_ADVANCED, description={"suggested_value": options.get(OPTION_ADVANCED, "")}
                ): vol.All(str, vol.Length(max=MAX_PATH)),
            }
        )
        return self.async_show_form(step_id="init", data_schema=schema, errors=errors)


class HatsLiteConfigFlow(ConfigFlow, domain=DOMAIN):
    VERSION = 1

    @staticmethod
    @callback
    def async_get_options_flow(config_entry: ConfigEntry) -> OptionsFlow:
        return HatsLiteOptionsFlow()

    async def async_step_user(self, user_input=None) -> ConfigFlowResult:
        if self._async_current_entries():
            return self.async_abort(reason="single_instance_allowed")
        return self.async_create_entry(title="HATS Lite", data={})
