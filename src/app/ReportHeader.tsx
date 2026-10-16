import { titles } from "@/app/navigation";
import { FilterBar } from "@/components/filters/FilterBar";
import type { DashboardState } from "@/hooks/useDashboard";
import { formatDate } from "@/utils/date";
import { ArrowDownToLine, Clock3, Printer, RefreshCw } from "lucide-react";

export function ReportHeader({ dashboard }: { dashboard: DashboardState }) {
  const {
    page,
    detailEntity,
    summary,
    error,
    setNow,
    print,
    isEntity,
    kind,
    exportCurrent,
    missingPage,
    filters,
    updateFilters,
    now,
    todayIncluded,
    closed,
    validation,
  } = dashboard;
  return (
    <>
      <div className="page-heading">
        <div>
          <div className="eyebrow">AAVIN · MADURAI UNION</div>
          <h1>{detailEntity?.name || titles[page]?.[0] || "Page not found"}</h1>
          <p>
            {detailEntity
              ? "Collection performance, connected records and daily history."
              : titles[page]?.[1]}
          </p>
        </div>
        <div className="page-actions">
          <button
            className="icon-button refresh"
            aria-label="Refresh collection data"
            onClick={() => setNow(new Date())}
          >
            <RefreshCw size={16} />
          </button>
          <button
            className="button"
            disabled={!summary || !!error}
            onClick={() =>
              print(
                `${detailEntity?.name || titles[page]?.[0]} report`,
                isEntity
                  ? kind
                  : page === "no-supply"
                    ? "no-supply"
                    : "summary",
              )
            }
          >
            <Printer size={15} />
            <span>Print</span>
          </button>
          <button
            className="button primary-button"
            disabled={!summary || !!error}
            onClick={exportCurrent}
          >
            <ArrowDownToLine size={15} />
            <span>Export data</span>
          </button>
        </div>
      </div>
      {!missingPage && (
        <>
          <FilterBar
            filters={filters}
            onChange={updateFilters}
            now={now}
            pinned={!!detailEntity}
          />
          <div className="report-context">
            <span>
              <span
                className={`status-dot ${todayIncluded && !closed ? "blue-dot" : "green-dot"}`}
              />
              {todayIncluded && !closed
                ? "Collection in progress · provisional"
                : "Collection period closed"}
              <span className="context-divider">·</span>
              {!validation &&
                `${formatDate(filters.start, true)}${filters.start !== filters.end ? " – " + formatDate(filters.end, true) : ""}`}
            </span>
            <span>
              <Clock3 size={12} />
              Updated{" "}
              {now.toLocaleTimeString("en-IN", {
                hour: "2-digit",
                minute: "2-digit",
                timeZone: "Asia/Kolkata",
              })}{" "}
              IST
            </span>
          </div>
        </>
      )}
    </>
  );
}
