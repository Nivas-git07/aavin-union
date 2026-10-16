import { BmcChart } from "@/components/charts/BmcChart";
import { SupplyChart } from "@/components/charts/SupplyChart";
import { TrendChart } from "@/components/charts/TrendChart";
import { EntityTable } from "@/components/tables/EntityTable";
import { Metric } from "@/components/ui/Metric";
import { Panel } from "@/components/ui/Panel";
import { entityRows } from "@/domain/collection";
import { societies } from "@/services/demoRepository";
import type { Filters, Summary } from "@/types/models";
import type { LinkBuilder } from "@/types/navigation";
import { litres, number } from "@/utils/format";
import {
  ArrowRight,
  ArrowUpRight,
  Building2,
  Check,
  ChevronRight,
  Clock3,
  Droplets,
  Tractor,
  TriangleAlert,
  Users,
  Warehouse,
} from "lucide-react";
import { Link } from "react-router-dom";

export function Overview({
  summary,
  comparison,
  filters,
  linkTo,
}: {
  summary: Summary;
  comparison: number | null;
  filters: Filters;
  linkTo: LinkBuilder;
}) {
  const bmcRows = entityRows(summary, "bmcs"),
    societyRows = entityRows(summary, "societies");
  const affected = summary.stats.filter((s) => s.zero + s.missing > 0).length,
    contributing = summary.stats.filter((s) => s.ml > 0).length;
  const issues = [...societyRows]
    .filter((r) => r.affected)
    .sort((a, b) => b.affected - a.affected)
    .slice(0, 4);
  return (
    <>
      <div className="metrics-grid">
        <Metric
          title="Milk collected"
          value={litres(summary.ml)}
          unit="L"
          subtitle={
            comparison == null
              ? "No comparable prior data"
              : "vs. previous period"
          }
          change={comparison}
          primary
          icon={<Droplets size={19} />}
        />
        <Metric
          title="BMC network"
          value={String(bmcRows.length)}
          subtitle={`${bmcRows.filter((r) => r.ml > 0).length} contributing BMCs`}
          icon={<Warehouse size={18} />}
        />
        <Metric
          title="Societies"
          value={number(societyRows.length)}
          subtitle={`${societyRows.filter((r) => r.ml > 0).length} contributing societies`}
          icon={<Building2 size={18} />}
        />
        <Metric
          title="Registered farmers"
          value={number(summary.farmers.length)}
          subtitle={`${number(contributing)} contributing farmers`}
          icon={<Users size={18} />}
        />
        <Metric
          title="Registered cows"
          value={number(summary.farmers.reduce((n, f) => n + f.cows, 0))}
          subtitle="Across selected farmers"
          icon={<Tractor size={18} />}
        />
        <Metric
          title="Farmers with gaps"
          value={number(affected)}
          subtitle="Zero or missing closed shifts"
          icon={<TriangleAlert size={18} />}
        />
      </div>
      <div className="overview-main">
        <TrendChart summary={summary} />
        <SupplyChart summary={summary} />
      </div>
      <div className="overview-bottom">
        <BmcChart rows={bmcRows} />
        <Panel
          title="Needs your attention"
          subtitle="Societies with closed-shift collection gaps"
          action={
            <Link className="text-button" to={linkTo("/no-supply")}>
              View all <ArrowUpRight size={14} />
            </Link>
          }
          className="attention-panel"
        >
          <div className="attention-summary">
            <span className="attention-icon">
              <TriangleAlert size={18} />
            </span>
            <div>
              <strong>{number(affected)} farmers need a follow-up</strong>
              <p>Confirmed zero and missing records are shown separately.</p>
            </div>
          </div>
          <div className="attention-list">
            {issues.map((row) => (
              <Link
                key={row.id}
                to={linkTo("/no-supply", {
                  bmc: societies.find((s) => s.id === row.id)!.bmcId,
                  society: row.id,
                  tab: "farmers",
                })}
              >
                <span className="attention-mark" />
                <span>
                  <strong>{row.name}</strong>
                  <small>
                    {row.bmc} · {row.affected} affected farmers
                  </small>
                </span>
                <span className="attention-count">
                  {row.zero} zero · {row.missing} missing
                </span>
                <ChevronRight size={16} />
              </Link>
            ))}
            {!issues.length && (
              <div className="empty compact">
                <Check size={25} />
                <h3>No closed-shift gaps</h3>
                <p>Pending shifts are still awaiting completion.</p>
              </div>
            )}
          </div>
          <div className="panel-bottom-note">
            <Clock3 size={13} />
            Morning closes at 10:00 · Evening at 20:00 IST
          </div>
        </Panel>
      </div>
      <div className="section-label">
        <div>
          <h2>The union at a glance</h2>
          <p>Collection performance across your BMC network.</p>
        </div>
        <Link className="text-button" to={linkTo("/bmcs")}>
          Explore BMCs <ArrowRight size={14} />
        </Link>
      </div>
      <EntityTable
        title="BMC performance"
        rows={bmcRows}
        kind="bmcs"
        filters={filters}
        href={(r) => linkTo(`/bmcs/${r.id}`, { bmc: r.id, society: "" })}
      />
    </>
  );
}
