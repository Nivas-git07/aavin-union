import { Logo } from "@/components/ui/Logo";
import { entityRows, followUpRows } from "@/domain/collection";
import { bmcById, societyById } from "@/services/demoRepository";
import type { EntityKind, Filters, Summary } from "@/types/models";
import { formatDate } from "@/utils/date";
import { litres, number } from "@/utils/format";

export function PrintReport({
  title,
  kind,
  filters,
  summary,
  now,
  reason,
  exceptionKind,
}: {
  title: string;
  kind: EntityKind | "summary" | "no-supply";
  filters: Filters;
  summary: Summary;
  now: Date;
  reason: string;
  exceptionKind: EntityKind;
}) {
  const rows =
    kind === "summary"
      ? []
      : kind === "no-supply"
        ? followUpRows(summary, exceptionKind, filters, now, reason)
        : entityRows(summary, kind);
  return (
    <section className="print-report">
      <header>
        <Logo />
        <div>
          <h1>Aavin Madurai Union</h1>
          <h2>{title}</h2>
        </div>
        <b>DEMO DATA</b>
      </header>
      <p>
        {formatDate(filters.start)} – {formatDate(filters.end)} ·{" "}
        {filters.shift} shifts
      </p>
      <p>
        BMC: {bmcById.get(filters.bmc)?.name || "All"} · Society:{" "}
        {societyById.get(filters.society)?.name || "All"} · Generated{" "}
        {now.toLocaleString("en-IN", { timeZone: "Asia/Kolkata" })} IST
      </p>
      <p>
        Total collection: <b>{litres(summary.ml)} L</b> · Registered farmers:{" "}
        {summary.farmers.length} · Fictional records
      </p>
      <table>
        <thead>
          {kind === "summary" ? (
            <tr>
              <th>Interval</th>
              <th>Morning (L)</th>
              <th>Evening (L)</th>
              <th>Total (L)</th>
            </tr>
          ) : (
            <tr>
              <th>ID / Name</th>
              <th>Society / BMC</th>
              <th>Milk (L)</th>
              <th>Status</th>
              <th>Zero shifts</th>
              <th>Missing shifts</th>
              {kind === "no-supply" && (
                <>
                  <th>Demo contact</th>
                  <th>Last delivery</th>
                  <th>Missed farmer-days</th>
                </>
              )}
            </tr>
          )}
        </thead>
        <tbody>
          {kind === "summary"
            ? summary.series.map((p) => (
                <tr key={p.date + p.name}>
                  <td>
                    {p.date} {p.name}
                  </td>
                  <td>{p.pending ? "Pending" : number(p.morning, 1)}</td>
                  <td>{p.pending ? "Pending" : number(p.evening, 1)}</td>
                  <td>{p.pending ? "Pending" : number(p.litres, 1)}</td>
                </tr>
              ))
            : rows.map((r) => (
                <tr key={r.id}>
                  <td>
                    {r.id}
                    <br />
                    {r.name}
                  </td>
                  <td>
                    {r.society}
                    <br />
                    {r.bmc}
                  </td>
                  <td>{litres(r.ml)}</td>
                  <td>{r.status}</td>
                  <td>{r.zero}</td>
                  <td>{r.missing}</td>
                  {kind === "no-supply" && (
                    <>
                      <td>{r.contact}</td>
                      <td>{r.lastDelivery || "None recorded"}</td>
                      <td>{r.missedDays}</td>
                    </>
                  )}
                </tr>
              ))}
        </tbody>
      </table>
    </section>
  );
}
