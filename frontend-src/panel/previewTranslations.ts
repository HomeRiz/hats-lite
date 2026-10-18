const FRAGMENT = "lovelace";
const LOAD_TIMEOUT_MS = 3000;

type FragmentHost = { loadFragmentTranslation?: unknown };

export async function loadCardTranslations(hass: unknown): Promise<void> {
  if (typeof hass !== "object" || hass === null) return;
  const host = hass as FragmentHost;
  const load = host.loadFragmentTranslation;
  if (typeof load !== "function") return;
  let timer: ReturnType<typeof setTimeout> | undefined;
  const timeout = new Promise<void>((resolve) => {
    timer = setTimeout(resolve, LOAD_TIMEOUT_MS);
  });
  try {
    await Promise.race([Promise.resolve(load.call(host, FRAGMENT)).then(() => undefined), timeout]);
  } catch {
    return;
  } finally {
    clearTimeout(timer);
  }
}
