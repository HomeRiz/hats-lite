export function clockIn(zone: string | undefined, now: Date = new Date()): [number, number, number] {
  try {
    const parts = new Intl.DateTimeFormat("en-US", {
      timeZone: zone || undefined,
      hourCycle: "h23",
      hour: "numeric",
      minute: "numeric",
      second: "numeric",
    }).formatToParts(now);
    const pick = (type: string) => Number(parts.find((p) => p.type === type)?.value);
    return [pick("hour"), pick("minute"), pick("second")];
  } catch {
    return [now.getHours(), now.getMinutes(), now.getSeconds()];
  }
}
