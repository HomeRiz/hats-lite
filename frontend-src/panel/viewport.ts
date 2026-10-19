import { unsafeCSS } from "lit";

export const PHONE_MAX_WIDTH = 600;
export const PHONE_QUERY = `(max-width: ${PHONE_MAX_WIDTH}px)`;
export const phoneMedia = unsafeCSS(`@media ${PHONE_QUERY}`);

export function watchPhoneViewport(onChange: (isPhone: boolean) => void): () => void {
  if (typeof window.matchMedia !== "function") return () => undefined;
  const list = window.matchMedia(PHONE_QUERY);
  const handler = (event: { matches: boolean }) => onChange(event.matches);
  list.addEventListener("change", handler);
  return () => list.removeEventListener("change", handler);
}
