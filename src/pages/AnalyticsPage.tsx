import { BmcChart } from "@/components/charts/BmcChart";
import { SupplyChart } from "@/components/charts/SupplyChart";
import { TrendChart } from "@/components/charts/TrendChart";
import { Metric } from "@/components/ui/Metric";
import { entityRows } from "@/domain/collection";
import type { Summary } from "@/types/models";
import { litres, number } from "@/utils/format";
import { BarChart3, Droplets, TriangleAlert, Users } from "lucide-react";

export function Analytics({ summary }: { summary: Summary }) {
  return (
    <>
      <div className="metrics-grid four">
        <Metric
          title="Period collection"
          value={litres(summary.ml)}
          unit="L"
          subtitle={`${summary.days} calendar days`}
          icon={<Droplets size={18} />}
          primary
        />
        <Metric
          title="Daily average"
          value={litres(summary.ml / summary.days)}
          unit="L"
          subtitle="Includes every selected calendar day"
          icon={<BarChart3 size={18} />}
        />
        <Metric
          title="Contributing farmers"
          value={number(summary.stats.filter((s) => s.ml > 0).length)}
          subtitle={`Of ${summary.farmers.length} registered farmers`}
          icon={<Users size={18} />}
        />
        <Metric
          title="Missed supply shifts"
          value={number(
            summary.stats.reduce((n, s) => n + s.zero + s.missing, 0),
          )}
          subtitle="Confirmed zero + missing records"
          icon={<TriangleAlert size={18} />}
        />
      </div>
      <TrendChart summary={summary} />
      <div className="overview-main analytics-secondary">
        <BmcChart rows={entityRows(summary, "bmcs")} />
        <SupplyChart summary={summary} />
      </div>
    </>
  );
}
