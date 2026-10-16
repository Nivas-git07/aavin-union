import { Panel } from "@/components/ui/Panel";
import type { Row } from "@/types/models";
import { number } from "@/utils/format";
import { Table2 } from "lucide-react";
import { useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

export const chartColors = [
  "#0874ce",
  "#24aaa0",
  "#75a5e5",
  "#96cdbb",
  "#b6c9ee",
  "#536e9f",
];

export function BmcChart({ rows }: { rows: Row[] }) {
  const [table, setTable] = useState(false);
  const data = [...rows]
    .sort((a, b) => b.ml - a.ml)
    .map((row) => ({
      name: row.name.replace(" BMC", ""),
      litres: row.ml / 1000,
    }));
  return (
    <Panel
      title="Collection by BMC"
      subtitle="Contribution to the union · litres"
      action={
        <button
          className="icon-button"
          aria-label={table ? "Show BMC chart" : "Show BMC data table"}
          onClick={() => setTable(!table)}
        >
          <Table2 size={17} />
        </button>
      }
    >
      {table ? (
        <div className="chart-data">
          <table>
            <thead>
              <tr>
                <th>BMC</th>
                <th>Litres</th>
              </tr>
            </thead>
            <tbody>
              {data.map((d) => (
                <tr key={d.name}>
                  <td>{d.name}</td>
                  <td>{number(d.litres, 1)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div
          className="bmc-chart"
          role="img"
          aria-label="BMC collection comparison. Use the data table button for exact values."
        >
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={data}
              layout="vertical"
              margin={{ left: 4, right: 28, top: 4, bottom: 0 }}
            >
              <CartesianGrid
                horizontal={false}
                strokeDasharray="3 5"
                stroke="#e8eef4"
              />
              <XAxis
                type="number"
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 12, fill: "#64748b" }}
                tickFormatter={(v) =>
                  v >= 1000 ? `${number(v / 1000, 1)}k` : String(v)
                }
              />
              <YAxis
                dataKey="name"
                type="category"
                width={104}
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 12, fill: "#526078" }}
              />
              <Tooltip
                formatter={(v) => [`${number(Number(v), 1)} L`, "Collection"]}
                cursor={{ fill: "#f5f8fc" }}
              />
              <Bar
                dataKey="litres"
                barSize={15}
                radius={[0, 4, 4, 0]}
                isAnimationActive={false}
              >
                {data.map((d, i) => (
                  <Cell
                    key={d.name}
                    fill={chartColors[i % chartColors.length]}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </Panel>
  );
}
