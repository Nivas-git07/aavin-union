import { EntityTable } from "@/components/tables/EntityTable";
import { followUpRows } from "@/domain/collection";
import { farmers, societyById } from "@/services/demoRepository";
import type { EntityKind, Filters, Summary } from "@/types/models";
import type { LinkBuilder } from "@/types/navigation";
import { number } from "@/utils/format";
import { Clock3, FileBarChart2, Milk, ShieldCheck, Users } from "lucide-react";
import { useMemo } from "react";

export function NoSupply({
  summary,
  filters,
  now,
  linkTo,
  params,
  setParam,
}: {
  summary: Summary;
  filters: Filters;
  now: Date;
  linkTo: LinkBuilder;
  params: URLSearchParams;
  setParam: (key: string, value: string) => void;
}) {
  const kind: EntityKind = ["bmcs", "societies", "farmers"].includes(
    params.get("tab") || "",
  )
    ? (params.get("tab") as EntityKind)
    : "farmers";
  const reason = params.get("reason") || "all";
  const rows = useMemo(
    () => followUpRows(summary, kind, filters, now, reason),
    [summary, kind, reason, filters.end, filters.shift, now],
  );
  const zero = summary.stats.reduce((n, s) => n + s.zero, 0),
    missing = summary.stats.reduce((n, s) => n + s.missing, 0),
    pending = summary.stats.reduce((n, s) => n + s.pending, 0);
  return (
    <>
      <div className="notice">
        <ShieldCheck size={19} />
        <p>
          <strong>Follow up with confidence.</strong> Only expected, closed
          shifts are counted as gaps. Missing records are unconfirmed; pending
          shifts are still open. Select “All shifts” for the whole-day view.
        </p>
      </div>
      <div className="exception-cards">
        <button
          className={reason === "all" ? "active" : ""}
          onClick={() => setParam("reason", "all")}
        >
          <span className="exception-icon amber">
            <Users size={19} />
          </span>
          <span>
            <small>Farmers with gaps</small>
            <strong>
              {number(
                summary.stats.filter((s) => s.zero + s.missing > 0).length,
              )}
            </strong>
          </span>
        </button>
        <button
          className={reason === "zero" ? "active" : ""}
          onClick={() => setParam("reason", "zero")}
        >
          <span className="exception-icon red">
            <Milk size={19} />
          </span>
          <span>
            <small>Confirmed zero shifts</small>
            <strong>{number(zero)}</strong>
          </span>
        </button>
        <button
          className={reason === "missing" ? "active" : ""}
          onClick={() => setParam("reason", "missing")}
        >
          <span className="exception-icon orange">
            <FileBarChart2 size={19} />
          </span>
          <span>
            <small>Missing record shifts</small>
            <strong>{number(missing)}</strong>
          </span>
        </button>
        <button
          className={reason === "pending" ? "active" : ""}
          onClick={() => setParam("reason", "pending")}
        >
          <span className="exception-icon blue">
            <Clock3 size={19} />
          </span>
          <span>
            <small>Pending shifts</small>
            <strong>{number(pending)}</strong>
          </span>
        </button>
      </div>
      <div className="subnav">
        <div className="tab-group">
          {(["farmers", "societies", "bmcs"] as EntityKind[]).map((k) => (
            <button
              key={k}
              className={kind === k ? "active" : ""}
              onClick={() => setParam("tab", k)}
            >
              {k === "bmcs"
                ? "BMCs"
                : k === "societies"
                  ? "Societies"
                  : "Farmers"}
            </button>
          ))}
        </div>
        <span className="muted">
          {filters.shift === "Both"
            ? "Whole-day view · both shifts"
            : `${filters.shift} shift view`}
        </span>
      </div>
      <EntityTable
        key={`${kind}-${reason}`}
        title={
          reason === "pending" ? "Awaiting collection" : "Supply follow-up list"
        }
        subtitle={`${rows.length} ${kind === "bmcs" ? "BMCs" : kind} · ${reason === "all" ? "all closed-shift gaps" : reason === "zero" ? "confirmed zero" : reason === "missing" ? "unconfirmed missing records" : "not yet due"}`}
        rows={rows}
        kind={kind}
        filters={filters}
        issues
        href={(r) =>
          kind === "farmers"
            ? linkTo(`/farmers/${r.id}`, {
                bmc: societyById.get(
                  farmers.find((f) => f.id === r.id)!.societyId,
                )!.bmcId,
                society: farmers.find((f) => f.id === r.id)!.societyId,
              })
            : linkTo(
                "/no-supply",
                kind === "bmcs"
                  ? { bmc: r.id, society: "", tab: "farmers" }
                  : {
                      bmc: societyById.get(r.id)!.bmcId,
                      society: r.id,
                      tab: "farmers",
                    },
              )
        }
      />
      <p className="footnote">
        “Affected farmer-days” counts days with at least one confirmed zero or
        missing shift, summed across farmers. Last delivery is the latest
        recorded supply on or before the end date, for the selected shifts.
      </p>
    </>
  );
}
