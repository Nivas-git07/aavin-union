export const DAY = 86_400_000;

export function indiaDate(now = new Date()): string {
  return new Date(now.getTime() + 330 * 60_000).toISOString().slice(0, 10);
}

export function indiaHour(now = new Date()): number {
  const d = new Date(now.getTime() + 330 * 60_000);
  return d.getUTCHours() + d.getUTCMinutes() / 60;
}

export function addDays(date: string, days: number): string {
  return new Date(Date.parse(date + "T00:00:00Z") + days * DAY)
    .toISOString()
    .slice(0, 10);
}

export function dayNumber(date: string): number {
  return Math.floor(Date.parse(date + "T00:00:00Z") / DAY);
}

export function dayCount(start: string, end: string): number {
  return dayNumber(end) - dayNumber(start) + 1;
}

export function historyStart(now = new Date()): string {
  return `${Number(indiaDate(now).slice(0, 4)) - 2}-01-01`;
}

export function formatDate(date: string, short = false): string {
  return new Date(date + "T00:00:00Z").toLocaleDateString("en-IN", {
    day: "numeric",
    month: short ? "short" : "long",
    ...(short ? {} : { year: "numeric" }),
    timeZone: "UTC",
  });
}
