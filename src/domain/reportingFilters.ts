import { bmcById, farmers, societyById } from "@/data/mock/network";
import type { Farmer, Filters } from "@/types/models";
import {
  addDays,
  dayCount,
  formatDate,
  historyStart,
  indiaDate,
} from "@/utils/date";

export const presets = [
  "Today",
  "Yesterday",
  "Last 7 Days",
  "Selected Date",
  "Last 12 Months",
  "Previous Calendar Year",
  "Custom Range",
];

export function presetRange(
  preset: string,
  now = new Date(),
): { start: string; end: string } {
  const today = indiaDate(now),
    year = Number(today.slice(0, 4));
  if (preset === "Yesterday")
    return { start: addDays(today, -1), end: addDays(today, -1) };
  if (preset === "Last 7 Days")
    return { start: addDays(today, -6), end: today };
  if (preset === "Last 12 Months") {
    const d = new Date(today + "T00:00:00Z");
    d.setUTCFullYear(d.getUTCFullYear() - 1);
    return { start: addDays(d.toISOString().slice(0, 10), 1), end: today };
  }
  if (preset === "Previous Calendar Year")
    return { start: `${year - 1}-01-01`, end: `${year - 1}-12-31` };
  return { start: today, end: today };
}

export function selectFarmers(f: Filters): Farmer[] {
  return farmers.filter(
    (p) =>
      (!f.bmc || societyById.get(p.societyId)?.bmcId === f.bmc) &&
      (!f.society || p.societyId === f.society),
  );
}

export function validateFilters(f: Filters, now = new Date()): string | null {
  const valid = (s: string) =>
    /^\d{4}-\d{2}-\d{2}$/.test(s) &&
    Number.isFinite(Date.parse(s)) &&
    new Date(s).toISOString().slice(0, 10) === s;
  if (!valid(f.start) || !valid(f.end))
    return "Choose a valid start and end date.";
  if (f.start > f.end)
    return "The start date must be on or before the end date.";
  if (f.start < historyStart(now) || f.end > indiaDate(now))
    return `Available history: ${formatDate(historyStart(now), true)} to ${formatDate(indiaDate(now), true)}.`;
  if (f.bmc && !bmcById.has(f.bmc))
    return "This BMC does not exist. Reset the filters to continue.";
  if (
    f.society &&
    (!societyById.has(f.society) ||
      (f.bmc && societyById.get(f.society)?.bmcId !== f.bmc))
  )
    return "Choose a society that belongs to the selected BMC.";
  return null;
}

export function previousFilters(f: Filters): Filters {
  const days = dayCount(f.start, f.end);
  return { ...f, start: addDays(f.start, -days), end: addDays(f.start, -1) };
}
