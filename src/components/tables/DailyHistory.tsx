import { Panel } from "@/components/ui/Panel";
import type { Filters, Summary } from "@/types/models";
import { downloadCsv } from "@/utils/csv";
import { formatDate } from "@/utils/date";
import { number } from "@/utils/format";
import { ArrowDownToLine } from "lucide-react";
import { useState } from "react";

export function DailyHistory({
  summary,
  filters,
  name,
}: {
  summary: Summary;
  filters: Filters;
  name: string;
}) {
  const [page, setPage] = useState(1);
  const rows = [...summary.daily].reverse(),
    pages = Math.max(1, Math.ceil(rows.length / 10)),
    current = Math.min(page, pages);
  return (
    <Panel
      title="Daily collection history"
      subtitle="All daily totals, including days with no recorded collection"
      className="ledger"
      action={
        <button
          className="button small"
          onClick={() =>
            downloadCsv(
              `${name}-daily-history-${filters.start}-${filters.end}`,
              [
                "Demo data",
                "Entity",
                "Date",
                "Selected shift",
                "Morning (L)",
                "Evening (L)",
                "Total (L)",
                "Collection window",
              ],
              rows.map((r) => [
                "Yes",
                name,
                r.date,
                filters.shift,
                r.morning.toFixed(3),
                r.evening.toFixed(3),
                r.litres.toFixed(3),
                r.pending ? "Provisional" : "Closed",
              ]),
            )
          }
        >
          <DownloadIcon />
          Export history
        </button>
      }
    >
      <div className="table-scroll">
        <table>
          <thead>
            <tr>
              <th>Date</th>
              <th>Morning (L)</th>
              <th>Evening (L)</th>
              <th>Daily total (L)</th>
              <th>Collection window</th>
            </tr>
          </thead>
          <tbody>
            {rows.slice((current - 1) * 10, current * 10).map((r) => (
              <tr key={r.date}>
                <td>{formatDate(r.date)}</td>
                <td>{number(r.morning, 1)}</td>
                <td>{number(r.evening, 1)}</td>
                <td>
                  <b>{number(r.litres, 1)}</b>
                </td>
                <td>
                  <span className={`badge ${r.pending ? "blue" : "green"}`}>
                    {r.pending ? "Provisional" : "Closed"}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="table-pagination">
        <span>
          {rows.length} collection days · {filters.shift} shifts
        </span>
        <div>
          <button
            className="button small"
            disabled={current === 1}
            onClick={() => setPage(current - 1)}
          >
            Previous
          </button>
          <span>
            {current} / {pages}
          </span>
          <button
            className="button small"
            disabled={current === pages}
            onClick={() => setPage(current + 1)}
          >
            Next
          </button>
        </div>
      </div>
    </Panel>
  );
}

export function DownloadIcon() {
  return <ArrowDownToLine size={14} />;
}
