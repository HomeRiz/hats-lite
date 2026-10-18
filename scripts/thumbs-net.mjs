export const HOSTS = new Set(["raw.githubusercontent.com", "cdn.jsdelivr.net", "github.com"]);
const MAX_DATA_URL = 2048;

export function isAllowedRequest(url) {
  if (typeof url !== "string") return false;
  if (url === "about:blank") return true;
  if (/^data:image\//i.test(url)) return url.length <= MAX_DATA_URL;
  let parsed;
  try {
    parsed = new URL(url);
  } catch {
    return false;
  }
  if (parsed.protocol !== "https:" || parsed.username || parsed.password || parsed.port) return false;
  return HOSTS.has(parsed.hostname);
}

export async function guard(page) {
  await page.setRequestInterception(true);
  page.on("request", async (request) => {
    if (request.isInterceptResolutionHandled()) return;
    let allowed = false;
    try {
      allowed = isAllowedRequest(request.url());
    } catch {
      allowed = false;
    }
    if (allowed) await request.continue();
    else await request.abort("blockedbyclient");
  });
}
