import { Panel } from "@/components/ui/Panel";
import type { Summary } from "@/types/models";
import { litres, number } from "@/utils/format";
import { Table2 } from "lucide-react";
import { useState } from "react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

export function TrendChart({
  summary,
  title = "Milk collection trend",
  subtitle,
}: {
  summary: Summary;
  title?: string;
  subtitle?: string;
}) {
  const [accessible, setAccessible] = useState(false);
  const points = summary.series.map((p) => ({
    ...p,
    morning: p.pending ? null : Math.round(p.morning * 10) / 10,
    evening: p.pending ? null : Math.round(p.evening * 10) / 10,
  }));
  return (
    <Panel
      title={title}
      subtitle={
        subtitle ||
        `${summary.days === 1 ? "Hourly" : summary.days > 62 ? "Monthly" : "Daily"} collection · litres`
      }
      action={
        <button
          className={`icon-button ${accessible ? "selected" : ""}`}
          aria-label={accessible ? "Show trend chart" : "Show trend data table"}
          onClick={() => setAccessible(!accessible)}
        >
          <Table2 size={17} />
        </button>
      }
    >
      <div className="chart-summary">
        <div>
          <strong>
            {litres(summary.ml)} <small>L</small>
          </strong>
          <span>collected in selected period</span>
        </div>
        <div className="legend">
          <span>
            <i style={{ background: "#0874ce" }} />
            Morning
          </span>
          <span>
            <i style={{ background: "#24aaa0" }} />
            Evening
          </span>
        </div>
      </div>
      {accessible ? (
        <div className="chart-data">
          <table>
            <caption>Milk collection in litres</caption>
            <thead>
              <tr>
                <th>Interval</th>
                <th>Morning (L)</th>
                <th>Evening (L)</th>
                <th>Total (L)</th>
              </tr>
            </thead>
            <tbody>
              {summary.series.map((p) => (
                <tr key={p.date + p.name}>
                  <td>{p.name}</td>
                  <td>{p.pending ? "Pending" : number(p.morning, 1)}</td>
                  <td>{p.pending ? "Pending" : number(p.evening, 1)}</td>
                  <td>{p.pending ? "Pending" : number(p.litres, 1)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div
          className="trend-chart"
          role="img"
          aria-label="Morning and evening milk collection chart. Use the Show trend data table button for exact values."
        >
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={points}
              margin={{ top: 12, right: 8, left: -16, bottom: 0 }}
            >
              <defs>
                <linearGradient id="morningFill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#0874ce" stopOpacity={0.16} />
                  <stop offset="100%" stopColor="#0874ce" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="eveningFill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#24aaa0" stopOpacity={0.14} />
                  <stop offset="100%" stopColor="#24aaa0" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid
                strokeDasharray="3 5"
                vertical={false}
                stroke="#e8eef4"
              />
              <XAxis
                dataKey="name"
                tickLine={false}
                axisLine={false}
                minTickGap={32}
                tick={{ fontSize: 12, fill: "#64748b" }}
                dy={10}
              />
              <YAxis
                tickLine={false}
                axisLine={false}
                tick={{ fontSize: 12, fill: "#64748b" }}
                tickFormatter={(v) =>
                  v >= 1000 ? `${number(v / 1000, 1)}k` : String(v)
                }
              />
              <Tooltip
                formatter={(value, name) => [
                  `${number(Number(value), 1)} L`,
                  name === "morning" ? "Morning" : "Evening",
                ]}
                contentStyle={{
                  borderRadius: 12,
                  border: "1px solid #e3eaf2",
                  fontSize: 12,
                }}
              />
              <Area
                type="monotone"
                dataKey="morning"
                stroke="#0874ce"
                strokeWidth={2.5}
                fill="url(#morningFill)"
                isAnimationActive={false}
              />
              <Area
                type="monotone"
                dataKey="evening"
                stroke="#24aaa0"
                strokeWidth={2.5}
                fill="url(#eveningFill)"
                isAnimationActive={false}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      )}
      <div className="chart-footer">
        <span>
          <span className="status-dot blue-dot" /> Morning{" "}
          <b>{litres(summary.morning)} L</b>
        </span>
        <span>
          <span className="status-dot teal-dot" /> Evening{" "}
          <b>{litres(summary.evening)} L</b>
        </span>
      </div>
    </Panel>
  );
}
