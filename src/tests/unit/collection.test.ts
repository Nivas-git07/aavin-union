import { collectionEntry } from "@/data/mock/collectionGenerator";
import { bmcs, farmers, societies } from "@/data/mock/network";
import {
  changePercent,
  entityRows,
  lastDelivered,
  summarize,
} from "@/domain/collection";
import { classify, windowClosed } from "@/domain/collectionStatus";
import {
  presetRange,
  previousFilters,
  validateFilters,
} from "@/domain/reportingFilters";
import type { Filters, Shift } from "@/types/models";
import { csvText } from "@/utils/csv";
import {
  addDays,
  dayCount,
  historyStart,
  indiaDate,
  indiaHour,
} from "@/utils/date";
import { describe, expect, it } from "vitest";

const now = new Date("2026-10-16T06:00:00Z");
const base: Filters = {
  preset: "Today",
  start: "2026-10-16",
  end: "2026-10-16",
  shift: "Both",
  bmc: "",
  society: "",
};
describe("demo network and dates", () => {
  it("contains the required hierarchy with a single parent per record", () => {
    expect(bmcs).toHaveLength(6);
    expect(societies).toHaveLength(30);
    expect(farmers).toHaveLength(600);
    expect(new Set(farmers.map((f) => f.id)).size).toBe(600);
    expect(societies.every((s) => bmcs.some((b) => b.id === s.bmcId))).toBe(
      true,
    );
    expect(
      farmers.every((f) => societies.some((s) => s.id === f.societyId)),
    ).toBe(true);
  });
  it("uses IST at midnight and year boundaries", () => {
    const midnight = new Date("2025-12-31T18:30:00Z");
    expect(indiaDate(midnight)).toBe("2026-01-01");
    expect(indiaHour(midnight)).toBe(0);
    expect(historyStart(midnight)).toBe("2024-01-01");
    expect(indiaDate(new Date("2025-12-31T18:29:59Z"))).toBe("2025-12-31");
  });
  it("resolves presets, leap days and adjacent comparison periods", () => {
    expect(presetRange("Last 7 Days", now)).toEqual({
      start: "2026-10-10",
      end: "2026-10-16",
    });
    expect(presetRange("Previous Calendar Year", now)).toEqual({
      start: "2025-01-01",
      end: "2025-12-31",
    });
    expect(presetRange("Last 12 Months", now)).toEqual({
      start: "2025-10-17",
      end: "2026-10-16",
    });
    expect(addDays("2024-02-28", 1)).toBe("2024-02-29");
    expect(dayCount("2024-01-01", "2024-12-31")).toBe(366);
    expect(previousFilters({ ...base, start: "2026-10-10" })).toMatchObject({
      start: "2026-10-03",
      end: "2026-10-09",
    });
  });
  it("rejects impossible, future, reversed and mismatched filters", () => {
    for (const patch of [
      { start: "2026-02-30" },
      { start: "" },
      { start: "2023-12-31" },
      { end: "2027-01-01" },
      { start: "2026-10-17" },
      { bmc: "unknown" },
      { bmc: "BMC-001", society: "SOC-020" },
    ])
      expect(validateFilters({ ...base, ...patch }, now)).not.toBeNull();
    expect(validateFilters(base, now)).toBeNull();
  });
});
describe("shift and daily status semantics", () => {
  it("closes morning at 10:00 and evening at 20:00 IST exactly", () => {
    expect(
      windowClosed(base.start, "Morning", new Date("2026-10-16T04:29:59Z")),
    ).toBe(false);
    expect(
      windowClosed(base.start, "Morning", new Date("2026-10-16T04:30:00Z")),
    ).toBe(true);
    expect(
      windowClosed(base.start, "Evening", new Date("2026-10-16T14:29:59Z")),
    ).toBe(false);
    expect(
      windowClosed(base.start, "Evening", new Date("2026-10-16T14:30:00Z")),
    ).toBe(true);
  });
  it("does not flag an inactive or unscheduled farmer as missed", () => {
    expect(collectionEntry(farmers[0], base.start, "Morning", now).status).toBe(
      "Not expected",
    );
    expect(
      collectionEntry(farmers[17], base.start, "Evening", now).status,
    ).toBe("Not expected");
    const row = summarize(base, now, { farmerId: farmers[0].id }).stats[0];
    expect(row).toMatchObject({
      zero: 0,
      missing: 0,
      pending: 0,
      expected: 0,
      status: "Not expected",
    });
  });
  it("keeps zero-supply farmers pending until their expected day closes", () => {
    expect(collectionEntry(farmers[1], base.start, "Morning", now).status).toBe(
      "Confirmed zero",
    );
    expect(collectionEntry(farmers[1], base.start, "Evening", now).status).toBe(
      "Pending",
    );
    expect(
      summarize(base, now, { farmerId: farmers[1].id }).stats[0],
    ).toMatchObject({ status: "Pending", zero: 1, pending: 1, missedDays: 1 });
    const closed = new Date("2026-10-16T15:00:00Z");
    expect(
      summarize(base, closed, { farmerId: farmers[1].id }).stats[0],
    ).toMatchObject({
      status: "Confirmed zero",
      zero: 2,
      pending: 0,
      missedDays: 1,
    });
  });
  it("distinguishes partial supply and unconfirmed missing records", () => {
    expect(
      classify({ ml: 1000, zero: 1, missing: 0, pending: 0, expected: 2 }),
    ).toBe("Partial supply");
    expect(
      classify({ ml: 0, zero: 1, missing: 1, pending: 0, expected: 2 }),
    ).toBe("Missing record");
    expect(
      classify({ ml: 0, zero: 1, missing: 0, pending: 1, expected: 2 }),
    ).toBe("Pending");
    expect(
      classify({ ml: 0, zero: 2, missing: 0, pending: 0, expected: 2 }),
    ).toBe("Confirmed zero");
  });
  it("never records future shifts as zero or supplied", () => {
    const summary = summarize({ ...base, shift: "Evening" }, now);
    expect(summary.ml).toBe(0);
    expect(
      summary.stats.every((s) =>
        ["Pending", "Not expected"].includes(s.status),
      ),
    ).toBe(true);
  });
});
describe("reconciling every aggregation and filter", () => {
  for (const shift of ["Both", "Morning", "Evening"] as const)
    for (const network of [
      {},
      { bmc: "BMC-002" },
      { bmc: "BMC-002", society: "SOC-007" },
    ]) {
      it(`reconciles ${shift} with ${JSON.stringify(network)} over a weekly range`, () => {
        const f = { ...base, start: "2026-10-10", shift, ...network },
          s = summarize(f, now);
        expect(s.ml).toBe(s.morning + s.evening);
        for (const kind of ["farmers", "societies", "bmcs"] as const)
          expect(entityRows(s, kind).reduce((n, r) => n + r.ml, 0)).toBe(s.ml);
        expect(s.series.reduce((n, p) => n + p.litres, 0)).toBeCloseTo(
          s.ml / 1000,
          6,
        );
        expect(s.stats.every((r) => Number.isInteger(r.ml))).toBe(true);
      });
    }
  it("uses the same exact underlying farmer entries in a single-day report", () => {
    const summary = summarize(base, now);
    const explicit = farmers.reduce(
      (total, f) =>
        total +
        (["Morning", "Evening"] as Shift[]).reduce(
          (n, shift) => n + collectionEntry(f, base.start, shift, now).ml,
          0,
        ),
      0,
    );
    expect(summary.ml).toBe(explicit);
    expect(summary.series).toHaveLength(16);
  });
  it("aggregates a full year into twelve months without changing totals", () => {
    const f = {
        ...base,
        start: "2025-01-01",
        end: "2025-12-31",
        society: "SOC-002",
      },
      summary = summarize(f, now);
    expect(summary.days).toBe(365);
    expect(summary.series).toHaveLength(12);
    expect(summary.daily).toHaveLength(365);
    expect(summary.daily.reduce((n, p) => n + p.litres, 0)).toBeCloseTo(
      summary.ml / 1000,
      6,
    );
    expect(summary.series.reduce((n, p) => n + p.litres, 0)).toBeCloseTo(
      summary.ml / 1000,
      6,
    );
    expect(entityRows(summary, "bmcs")[0].ml).toBe(summary.ml);
    expect(summary.stats.some((s) => s.status === "Partial supply")).toBe(true);
  });
  it("uses equivalent elapsed shifts in the previous-period comparison", () => {
    const prior = previousFilters(base);
    const comparison = summarize(prior, now, {
      elapsedReference: { date: base.end, cutoff: now },
    });
    expect(comparison.evening).toBe(0);
    expect(comparison.ml).toBe(
      summarize({ ...prior, shift: "Morning" }, now).ml,
    );
    expect(changePercent(200, 100)).toBe(100);
    expect(changePercent(1, 0)).toBeNull();
  });
  it("shows partial parent supply and never calls it wholly absent", () => {
    const rows = entityRows(
      summarize({ ...base, start: "2026-10-10" }, now),
      "bmcs",
    );
    expect(
      rows.every(
        (r) => r.ml > 0 && r.status === "Partial supply" && r.affected > 0,
      ),
    ).toBe(true);
  });
  it("keeps permanent non-supply separate from occasional misses", () => {
    const rows = entityRows(
      summarize({ ...base, start: "2026-10-01", end: "2026-10-15" }, now),
      "farmers",
    );
    expect(rows.find((r) => r.id === farmers[1].id)?.pattern).toBe(
      "Zero throughout period",
    );
    expect(rows.some((r) => r.pattern === "Occasional misses")).toBe(true);
    expect(lastDelivered(farmers[1], base.end, "Both", now)).toBe("");
  });
});
describe("complete and safe CSV output", () => {
  it("exports all six hundred rows rather than a ten-row UI page", () => {
    const rows = entityRows(summarize(base, now), "farmers");
    const csv = csvText(
      ["ID", "Name", "Milk (L)"],
      rows.map((r) => [r.id, r.name, r.ml / 1000]),
    );
    expect(csv.split("\r\n")).toHaveLength(601);
    expect(csv).toContain("FMR-0600");
  });
  it("escapes commas, quotes, line breaks and formula-like strings", () => {
    const csv = csvText(["Label"], [['a,"b"\nc'], ["=2+3"], [0]]);
    expect(csv).toContain('"a,""b""\nc"');
    expect(csv).toContain('"\'=2+3"');
    expect(csv).toContain('"0"');
  });
});
