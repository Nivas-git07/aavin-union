import { titles } from "@/app/navigation";
import { changePercent, entityRows, followUpRows } from "@/domain/collection";
import {
  presetRange,
  presets,
  previousFilters,
  validateFilters,
} from "@/domain/reportingFilters";
import { exportRows } from "@/reports/exportRows";
import {
  bmcs,
  demoRepository,
  farmers,
  societies,
  societyById,
} from "@/services/demoRepository";
import type { EntityKind, Filters, Row, Summary } from "@/types/models";
import type { LinkBuilder } from "@/types/navigation";
import { historyStart, indiaDate, indiaHour } from "@/utils/date";
import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate, useSearchParams } from "react-router-dom";

export function useDashboard() {
  const [params, setParams] = useSearchParams(),
    location = useLocation(),
    navigate = useNavigate();
  const [now, setNow] = useState(() => new Date());
  const [printReport, setPrintReport] = useState<{
    title: string;
    kind: EntityKind | "summary" | "no-supply";
  } | null>(null);
  const segments = location.pathname.split("/").filter(Boolean),
    page = segments[0] || "overview",
    id = segments[1];
  const isEntity = ["bmcs", "societies", "farmers"].includes(page),
    kind = page as EntityKind;
  const detailEntity =
    id && isEntity
      ? page === "bmcs"
        ? bmcs.find((b) => b.id === id)
        : page === "societies"
          ? societies.find((s) => s.id === id)
          : farmers.find((f) => f.id === id)
      : undefined;
  const preset = presets.includes(params.get("period") || "")
    ? params.get("period")!
    : "Today";
  const range = presetRange(preset, now);
  const rawFilters: Filters = {
    preset,
    start: ["Selected Date", "Custom Range"].includes(preset)
      ? params.get("start") || range.start
      : range.start,
    end: ["Selected Date", "Custom Range"].includes(preset)
      ? params.get("end") || range.end
      : range.end,
    shift: ["Morning", "Evening"].includes(params.get("shift") || "")
      ? (params.get("shift") as Filters["shift"])
      : "Both",
    bmc: params.get("bmc") || "",
    society: params.get("society") || "",
  };
  if (detailEntity) {
    if (kind === "bmcs") {
      rawFilters.bmc = id;
      rawFilters.society = "";
    } else {
      const societyId =
        kind === "societies" ? id : farmers.find((f) => f.id === id)!.societyId;
      rawFilters.society = societyId;
      rawFilters.bmc = societyById.get(societyId)!.bmcId;
    }
  }
  const filterKey = JSON.stringify(rawFilters);
  const filters = useMemo(() => rawFilters, [filterKey]);
  const validation = validateFilters(filters, now);
  const [loaded, setLoaded] = useState<{
      key: string;
      data: Summary;
      comparison: number | null;
    } | null>(null),
    [loadError, setLoadError] = useState("");
  const calculationKey = `${filterKey}:${kind === "farmers" ? id || "" : ""}:${now.toISOString()}`;
  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 60_000);
    return () => clearInterval(timer);
  }, []);
  useEffect(() => {
    if (validation) return;
    setLoadError("");
    const timer = setTimeout(() => {
      try {
        const options = { farmerId: kind === "farmers" ? id : undefined };
        const data = demoRepository.summarize(filters, now, options),
          previous = previousFilters(filters);
        let comparison: number | null = null;
        if (previous.start >= historyStart(now)) {
          const prior = demoRepository.summarize(previous, now, {
            ...options,
            ...(filters.end === indiaDate(now)
              ? { elapsedReference: { date: indiaDate(now), cutoff: now } }
              : {}),
          });
          comparison = changePercent(data.ml, prior.ml);
        }
        setLoaded({ key: calculationKey, data, comparison });
      } catch {
        setLoadError(
          "We could not prepare this report. Refresh the data to try again.",
        );
      }
    }, 20);
    return () => clearTimeout(timer);
  }, [calculationKey, validation]);
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname]);
  useEffect(() => {
    document.title = `${detailEntity?.name || titles[page]?.[0] || "Page not found"} · Aavin Madurai`;
  }, [page, detailEntity]);
  const updateFilters = (patch: Partial<Filters>) => {
    const f = { ...filters, ...patch };
    const p = new URLSearchParams(params);
    for (const [key, value] of Object.entries(f)) {
      const q = key === "preset" ? "period" : key;
      if (value) p.set(q, value);
      else p.delete(q);
    }
    setParams(p);
  };
  const linkTo: LinkBuilder = (path, changes = {}) => {
    const p = new URLSearchParams(params);
    if (detailEntity) {
      filters.bmc ? p.set("bmc", filters.bmc) : p.delete("bmc");
      filters.society ? p.set("society", filters.society) : p.delete("society");
    }
    for (const [key, value] of Object.entries(changes))
      value ? p.set(key, value) : p.delete(key);
    return `${path}${p.size ? "?" + p.toString() : ""}`;
  };
  const rowHref = (r: Row, k: EntityKind) =>
    k === "bmcs"
      ? linkTo(`/bmcs/${r.id}`, { bmc: r.id, society: "" })
      : k === "societies"
        ? linkTo(`/societies/${r.id}`, {
            bmc: societyById.get(r.id)!.bmcId,
            society: r.id,
          })
        : linkTo(`/farmers/${r.id}`, {
            bmc: societyById.get(farmers.find((f) => f.id === r.id)!.societyId)!
              .bmcId,
            society: farmers.find((f) => f.id === r.id)!.societyId,
          });
  const summary = loaded?.key === calculationKey ? loaded.data : null;
  const error = validation || loadError;
  const missingPage =
    !titles[page] || segments.length > 2 || (!!id && !detailEntity);
  const print = (
    title: string,
    reportKind: EntityKind | "summary" | "no-supply",
  ) => {
    setPrintReport({ title, kind: reportKind });
  };
  useEffect(() => {
    if (!printReport) return;
    const t = setTimeout(() => window.print(), 150);
    return () => clearTimeout(t);
  }, [printReport]);
  useEffect(() => {
    const clear = () => setPrintReport(null);
    window.addEventListener("afterprint", clear);
    return () => window.removeEventListener("afterprint", clear);
  }, []);
  const exportCurrent = () => {
    if (!summary) return;
    const tab = ["bmcs", "societies", "farmers"].includes(
      params.get("tab") || "",
    )
      ? (params.get("tab") as EntityKind)
      : "farmers";
    exportRows(
      page,
      page === "no-supply"
        ? followUpRows(
            summary,
            tab,
            filters,
            now,
            params.get("reason") || "all",
          )
        : entityRows(summary, isEntity ? kind : "farmers"),
      filters,
    );
  };
  const closed = indiaHour(now) >= 20,
    todayIncluded = filters.end === indiaDate(now);
  return {
    params,
    setParams,
    navigate,
    now,
    setNow,
    printReport,
    page,
    id,
    isEntity,
    kind,
    detailEntity,
    filters,
    validation,
    loaded,
    updateFilters,
    linkTo,
    rowHref,
    summary,
    error,
    missingPage,
    print,
    exportCurrent,
    closed,
    todayIncluded,
  };
}
export type DashboardState = ReturnType<typeof useDashboard>;
