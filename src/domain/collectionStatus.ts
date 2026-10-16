import type { FarmerStats, Shift, Status } from "@/types/models";
import { indiaDate, indiaHour } from "@/utils/date";

export function windowClosed(date: string, shift: Shift, now: Date): boolean {
  return (
    date < indiaDate(now) ||
    (date === indiaDate(now) &&
      indiaHour(now) >= (shift === "Morning" ? 10 : 20))
  );
}

export function classify(
  s: Pick<FarmerStats, "ml" | "zero" | "missing" | "pending" | "expected">,
): Status {
  if (!s.expected) return "Not expected";
  if (s.ml > 0) return s.zero + s.missing > 0 ? "Partial supply" : "Supplied";
  if (s.pending) return "Pending";
  if (s.missing) return "Missing record";
  return "Confirmed zero";
}
