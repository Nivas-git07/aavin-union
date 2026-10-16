import { collectionEntry } from "@/data/mock/collectionGenerator";
import { bmcById, societyById } from "@/data/mock/network";
import { classify, windowClosed } from "@/domain/collectionStatus";
import { selectFarmers } from "@/domain/reportingFilters";
import type {
  EntityKind,
  Farmer,
  Filters,
  QueryOptions,
  Row,
  SeriesPoint,
  Shift,
  Status,
  Summary,
} from "@/types/models";
import {
  addDays,
  dayCount,
  formatDate,
  historyStart,
  indiaDate,
  indiaHour,
} from "@/utils/date";

export function summarize(
  filters: Filters,
  now: Date,
  options: QueryOptions = {},
): Summary {
  const selected = selectFarmers(filters).filter(
    (p) => !options.farmerId || p.id === options.farmerId,
  );
  const stats = selected.map((p) => ({
    id: p.id,
    ml: 0,
    morning: 0,
    evening: 0,
    supplied: 0,
    zero: 0,
    missing: 0,
    pending: 0,
    expected: 0,
    missedDays: 0,
    lastDelivery: "",
    status: "Not expected" as Status,
  }));
  const days = dayCount(filters.start, filters.end),
    single = days === 1,
    monthly = days > 62;
  const points = new Map<string, SeriesPoint>();
  const daily: SeriesPoint[] = [];
  if (single)
    for (let h = 5; h <= 20; h++)
      points.set(String(h), {
        name: `${String(h).padStart(2, "0")}:00`,
        date: filters.start,
        morning: 0,
        evening: 0,
        litres: 0,
        pending: filters.start === indiaDate(now) && h > indiaHour(now),
      });
  for (let day = filters.start; day <= filters.end; day = addDays(day, 1)) {
    const dayPoint: SeriesPoint = {
      name: formatDate(day, true),
      date: day,
      morning: 0,
      evening: 0,
      litres: 0,
      pending:
        day === indiaDate(now) &&
        indiaHour(now) < (filters.shift === "Morning" ? 10 : 20),
    };
    const key = monthly ? day.slice(0, 7) : day;
    if (!single && !points.has(key))
      points.set(key, {
        name: monthly
          ? new Date(day + "T00:00:00Z").toLocaleDateString("en-IN", {
              month: "short",
              year: "2-digit",
              timeZone: "UTC",
            })
          : formatDate(day, true),
        date: key,
        morning: 0,
        evening: 0,
        litres: 0,
      });
    for (let i = 0; i < selected.length; i++) {
      const p = selected[i],
        stat = stats[i];
      let missedDay = false;
      for (const shift of ["Morning", "Evening"] as Shift[]) {
        if (filters.shift !== "Both" && filters.shift !== shift) continue;
        const entry = collectionEntry(p, day, shift, now);
        if (options.elapsedReference && day === filters.end) {
          const ref = options.elapsedReference;
          if (
            !windowClosed(ref.date, shift, ref.cutoff) &&
            entry.hour + 1 > indiaHour(ref.cutoff)
          )
            continue;
        }
        if (entry.status !== "Not expected") stat.expected++;
        if (entry.status === "Confirmed zero") {
          stat.zero++;
          missedDay = true;
        }
        if (entry.status === "Missing record") {
          stat.missing++;
          missedDay = true;
        }
        if (entry.status === "Pending") stat.pending++;
        if (entry.ml) {
          stat.supplied++;
          stat.lastDelivery = day;
        }
        stat.ml += entry.ml;
        const field = shift === "Morning" ? "morning" : "evening";
        stat[field] += entry.ml;
        dayPoint[field] += entry.ml;
        dayPoint.litres += entry.ml;
        const point = points.get(single ? String(entry.hour) : key);
        if (point) {
          point[field] += entry.ml / 1000;
          point.litres += entry.ml / 1000;
        }
      }
      if (missedDay) stat.missedDays++;
    }
    daily.push({
      ...dayPoint,
      morning: dayPoint.morning / 1000,
      evening: dayPoint.evening / 1000,
      litres: dayPoint.litres / 1000,
    });
  }
  stats.forEach((s) => {
    s.status = classify(s);
  });
  return {
    ml: stats.reduce((n, s) => n + s.ml, 0),
    morning: stats.reduce((n, s) => n + s.morning, 0),
    evening: stats.reduce((n, s) => n + s.evening, 0),
    stats,
    series: [...points.values()],
    daily,
    days,
    farmers: selected,
  };
}

export function changePercent(
  current: number,
  previous: number,
): number | null {
  return previous === 0 ? null : ((current - previous) / previous) * 100;
}

export function entityRows(summary: Summary, kind: EntityKind): Row[] {
  const map = new Map<string, Row>();
  summary.farmers.forEach((farmer, i) => {
    const society = societyById.get(farmer.societyId)!,
      bmc = bmcById.get(society.bmcId)!,
      stat = summary.stats[i];
    const entity =
      kind === "farmers" ? farmer : kind === "societies" ? society : bmc;
    if (!map.has(entity.id))
      map.set(entity.id, {
        id: entity.id,
        name: entity.name,
        location: farmer.village,
        bmc: bmc.name,
        society: kind === "bmcs" ? "Multiple societies" : society.name,
        contact: kind === "farmers" ? farmer.contact : "—",
        cows: 0,
        farmers: 0,
        societies: 0,
        ml: 0,
        morning: 0,
        evening: 0,
        zero: 0,
        missing: 0,
        pending: 0,
        expected: 0,
        missedDays: 0,
        lastDelivery: "",
        lastDeliveryScope: "Selected period",
        status: "Not expected",
        affected: 0,
        pattern: "",
      });
    const row = map.get(entity.id)!;
    if (kind === "bmcs") row.location = bmc.location;
    row.cows += farmer.cows;
    row.farmers++;
    for (const field of [
      "ml",
      "morning",
      "evening",
      "zero",
      "missing",
      "pending",
      "expected",
    ] as const)
      row[field] += stat[field];
    row.missedDays += stat.missedDays;
    if (stat.lastDelivery > row.lastDelivery)
      row.lastDelivery = stat.lastDelivery;
    if (stat.zero + stat.missing > 0) row.affected++;
  });
  for (const row of map.values()) {
    row.status = classify(row);
    row.societies =
      kind === "bmcs"
        ? new Set(
            summary.farmers
              .filter((p) => societyById.get(p.societyId)?.bmcId === row.id)
              .map((p) => p.societyId),
          ).size
        : 1;
    row.pattern =
      row.zero + row.missing === 0
        ? "No closed-shift gaps"
        : row.ml > 0
          ? "Occasional misses"
          : row.pending > 0
            ? "Awaiting completion"
            : row.missing > 0
              ? "No recorded supply · incomplete"
              : "Zero throughout period";
  }
  return [...map.values()];
}

export function lastDelivered(
  farmer: Farmer,
  end: string,
  shift: Filters["shift"],
  now: Date,
): string {
  if (!farmer.active) return "";
  for (let d = end; d >= historyStart(now); d = addDays(d, -1)) {
    if (
      ["Morning", "Evening"].some(
        (s) =>
          (shift === "Both" || shift === s) &&
          collectionEntry(farmer, d, s as Shift, now).ml > 0,
      )
    )
      return d;
  }
  return "";
}

export function followUpRows(
  summary: Summary,
  kind: EntityKind,
  filters: Filters,
  now: Date,
  reason = "all",
): Row[] {
  return entityRows(summary, kind)
    .filter((r) =>
      reason === "zero"
        ? r.zero > 0
        : reason === "missing"
          ? r.missing > 0
          : reason === "pending"
            ? r.pending > 0
            : r.zero + r.missing > 0,
    )
    .map((row) => {
      let lastDelivery = row.lastDelivery;
      if (!lastDelivery) {
        const members = summary.farmers.filter((f) =>
          kind === "farmers"
            ? f.id === row.id
            : kind === "societies"
              ? f.societyId === row.id
              : societyById.get(f.societyId)?.bmcId === row.id,
        );
        for (const farmer of members) {
          const last = lastDelivered(farmer, filters.end, filters.shift, now);
          if (last > lastDelivery) lastDelivery = last;
        }
      }
      return {
        ...row,
        lastDelivery,
        lastDeliveryScope: "Available history through period end",
      };
    });
}
