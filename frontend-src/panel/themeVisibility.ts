const PLACEHOLDER = /\bdo not (use|modify)\b/i;

export function isHiddenThemeName(name: unknown): boolean {
  return typeof name === "string" && PLACEHOLDER.test(name);
}

export function visibleThemeNames(names: readonly string[], keep?: string): string[] {
  return names.filter((name) => !isHiddenThemeName(name) || name === keep);
}
