import { Panel } from "@/components/ui/Panel";
import type { Status, Summary } from "@/types/models";
import { number } from "@/utils/format";
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";

export function SupplyChart({ summary }: { summary: Summary }) {
  const groups: { name: Status; color: string }[] = [
    { name: "Supplied", color: "#1c9c85" },
    { name: "Partial supply", color: "#e8ae50" },
    { name: "Confirmed zero", color: "#df6772" },
    { name: "Missing record", color: "#ef9c6d" },
    { name: "Pending", color: "#79a9e2" },
    { name: "Not expected", color: "#d6dee9" },
  ];
  const data = groups.map((g) => ({
    ...g,
    value: summary.stats.filter((s) => s.status === g.name).length,
  }));
  const contributing = summary.stats.filter((s) => s.ml > 0).length;
  return (
    <Panel
      title="Farmer participation"
      subtitle="Supply status in selected period"
      className="supply-panel"
    >
      <div className="donut-wrap">
        <ResponsiveContainer width="100%" height={190}>
          <PieChart>
            <Pie
              data={data.filter((d) => d.value)}
              dataKey="value"
              innerRadius={65}
              outerRadius={82}
              paddingAngle={3}
              cornerRadius={4}
              startAngle={90}
              endAngle={-270}
              stroke="none"
              isAnimationActive={false}
            >
              {data
                .filter((d) => d.value)
                .map((d) => (
                  <Cell key={d.name} fill={d.color} />
                ))}
            </Pie>
            <Tooltip formatter={(v) => `${v} farmers`} />
          </PieChart>
        </ResponsiveContainer>
        <div className="donut-label">
          <strong>
            {summary.farmers.length
              ? Math.round((contributing / summary.farmers.length) * 100)
              : 0}
            <small>%</small>
          </strong>
          <span>contributing</span>
        </div>
      </div>
      <dl className="supply-legend">
        {data.map((d) => (
          <div key={d.name}>
            <dt>
              <i style={{ background: d.color }} />
              {d.name}
            </dt>
            <dd>{number(d.value)}</dd>
          </div>
        ))}
      </dl>
    </Panel>
  );
}
