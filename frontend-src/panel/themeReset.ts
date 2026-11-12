export function removedInUse(answer: boolean | undefined, current: string | undefined, removed: readonly string[]): boolean {
  if (answer !== undefined) return answer;
  return current !== undefined && removed.includes(current);
}
