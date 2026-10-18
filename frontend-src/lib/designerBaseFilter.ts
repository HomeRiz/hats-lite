const KEY = /^[A-Za-z0-9_-]{1,80}$/;
const FORBIDDEN_NAMES = new Set([
  "__proto__",
  "constructor",
  "prototype",
  "tostring",
  "hasownproperty",
  "valueof",
  "__definegetter__",
  "__definesetter__",
  "__lookupgetter__",
  "__lookupsetter__",
  "isprototypeof",
  "propertyisenumerable",
  "tolocalestring",
]);
const REJECT = [
  "javascript:",
  "vbscript:",
  "@import",
  "expression(",
  "behavior:",
  "-moz-binding",
  "image-set(",
  "imageset(",
  "src(",
  "<",
  "&#",
];
const ENTITY = /&[a-z#]/i;
const LONE_SURROGATE = /[\ud800-\udbff](?![\udc00-\udfff])|(?<![\ud800-\udbff])[\udc00-\udfff]/;
const COMMENT = /\/\*[\s\S]*?\*\//g;
const INVISIBLE = /[\p{Z}\p{C}\u200b-\u200f\u2028-\u202f\u2060-\u206f\ufeff\u3164\u1160\u180e\u00ad\ufe00-\ufe0f]/gu;
const IMPORTANT = /!\s*important\s*$/i;
const BACKGROUND_KEY = "lovelace-background";

export type BaseVerdict = "ok" | "skip" | "background";

function cssBlock(key: string): boolean {
  const lower = key.toLowerCase();
  return lower.startsWith("card-mod-") || lower.startsWith("uix-");
}

function trimmed(value: string, key: string): string {
  let out = value;
  for (let round = 0; round < 4; round += 1) {
    const next = out.replace(IMPORTANT, "").trimEnd();
    const cut = cssBlock(key) ? next : next.replace(/;+\s*$/, "").trimEnd();
    if (cut === out) break;
    out = cut;
  }
  return out;
}

function normalized(value: string): string {
  return value
    .replace(INVISIBLE, "")
    .normalize("NFKC")
    .replace(COMMENT, "")
    .replace(INVISIBLE, "")
    .toLowerCase();
}

export function baseVerdict(key: string, value: string): BaseVerdict {
  if (!KEY.test(key) || FORBIDDEN_NAMES.has(key.toLowerCase())) return "skip";
  if (key === BACKGROUND_KEY) return "background";
  const text = trimmed(value, key);
  if (!text || value.includes("\0") || LONE_SURROGATE.test(value) || text.includes("\\")) return "skip";
  const flat = normalized(text);
  if (REJECT.some((pattern) => flat.includes(pattern)) || ENTITY.test(flat)) return "skip";
  if (flat.includes("url(")) return "background";
  if (!cssBlock(key) && /[{};]/.test(flat)) return "skip";
  return "ok";
}
