import { TrendChart } from "@/components/charts/TrendChart";
import { DailyHistory } from "@/components/tables/DailyHistory";
import { EntityTable } from "@/components/tables/EntityTable";
import { Badge } from "@/components/ui/Badge";
import { Metric } from "@/components/ui/Metric";
import { Panel } from "@/components/ui/Panel";
import { entityRows } from "@/domain/collection";
import {
  bmcById,
  collectionEntry,
  demoRepository,
  farmers,
  societyById,
} from "@/services/demoRepository";
import type { EntityKind, Filters, Summary } from "@/types/models";
import type { LinkBuilder } from "@/types/navigation";
import { downloadCsv } from "@/utils/csv";
import { addDays, formatDate, historyStart, indiaDate } from "@/utils/date";
import { litres, number } from "@/utils/format";
import {
  Building2,
  ChevronRight,
  Download,
  Droplets,
  MapPin,
  Milk,
  Sun,
  TriangleAlert,
  Users,
  Warehouse,
} from "lucide-react";
import { useMemo, useState } from "react";
import { Link } from "react-router-dom";

export function Detail({
  kind,
  id,
  filters,
  now,
  summary,
  linkTo,
}: {
  kind: EntityKind;
  id: string;
  filters: Filters;
  now: Date;
  summary: Summary;
  linkTo: LinkBuilder;
}) {
  const person =
    kind === "farmers" ? farmers.find((f) => f.id === id) : undefined;
  const society = person
    ? societyById.get(person.societyId)
    : kind === "societies"
      ? societyById.get(id)
      : undefined;
  const bmc = bmcById.get(society?.bmcId || id);
  const allTime = useMemo(
    () =>
      demoRepository.summarize(
        {
          ...filters,
          start: historyStart(now),
          end: indiaDate(now),
          shift: "Both",
        },
        now,
        { farmerId: person?.id },
      ),
    [filters.bmc, filters.society, person?.id, now],
  ); // All recorded history intentionally ignores reporting date/shift.
  const today = useMemo(
    () =>
      demoRepository.summarize(
        { ...filters, start: indiaDate(now), end: indiaDate(now) },
        now,
        { farmerId: person?.id },
      ),
    [filters.bmc, filters.society, filters.shift, person?.id, now],
  );
  const row = entityRows(summary, kind)[0];
  const [ledgerPage, setLedgerPage] = useState(1);
  const ledger = useMemo(() => {
    if (!person) return [];
    const entries = [];
    for (let d = filters.end; d >= filters.start; d = addDays(d, -1)) {
      const am = collectionEntry(person, d, "Morning", now),
        pm = collectionEntry(person, d, "Evening", now);
      entries.push({
        date: d,
        morning: filters.shift === "Evening" ? null : am,
        evening: filters.shift === "Morning" ? null : pm,
        total:
          (filters.shift === "Evening" ? 0 : am.ml) +
          (filters.shift === "Morning" ? 0 : pm.ml),
      });
    }
    return entries;
  }, [person, filters.start, filters.end, filters.shift, now]);
  const ledgerCurrent = Math.min(
    ledgerPage,
    Math.max(1, Math.ceil(ledger.length / 10)),
  );
  const [networkTab, setNetworkTab] = useState<"societies" | "farmers">(
    "societies",
  );
  const childrenKind = kind === "bmcs" ? networkTab : "farmers";
  return (
    <>
      <div className="detail-breadcrumb">
        <Link to={linkTo("/bmcs", { bmc: "", society: "" })}>BMC network</Link>
        <ChevronRight size={13} />
        {bmc && (
          <Link to={linkTo(`/bmcs/${bmc.id}`, { bmc: bmc.id, society: "" })}>
            {bmc.name}
          </Link>
        )}
        {society && (
          <>
            <ChevronRight size={13} />
            <Link
              to={linkTo(`/societies/${society.id}`, {
                bmc: society.bmcId,
                society: society.id,
              })}
            >
              {society.name}
            </Link>
          </>
        )}
        {person && (
          <>
            <ChevronRight size={13} />
            <span>{person.name}</span>
          </>
        )}
      </div>
      <div className="profile-card">
        <div className="profile-avatar">
          {person ? (
            <Users size={29} />
          ) : kind === "bmcs" ? (
            <Warehouse size={30} />
          ) : (
            <Building2 size={30} />
          )}
        </div>
        <div className="profile-heading">
          <h2>{row?.name}</h2>
          <p>
            {id} <span>·</span>
            <MapPin size={13} />
            {row?.location}, Madurai
          </p>
        </div>
        <Badge status={row?.status || "Not expected"} />
        <div className="profile-facts">
          {person ? (
            <>
              <span>
                Demo contact<strong>{person.contact}</strong>
              </span>
              <span>
                Registered cows<strong>{person.cows}</strong>
              </span>
              <span>
                Expected shifts
                <strong>
                  {person.active
                    ? person.shifts.join(" & ")
                    : "Inactive · none"}
                </strong>
              </span>
            </>
          ) : (
            <>
              <span>
                Registered farmers<strong>{summary.farmers.length}</strong>
              </span>
              <span>
                Societies
                <strong>
                  {new Set(summary.farmers.map((f) => f.societyId)).size}
                </strong>
              </span>
              <span>
                Registered cows
                <strong>
                  {number(summary.farmers.reduce((n, f) => n + f.cows, 0))}
                </strong>
              </span>
            </>
          )}
        </div>
      </div>
      <div className="metrics-grid four">
        <Metric
          title="Selected-period milk"
          value={litres(summary.ml)}
          unit="L"
          subtitle={`${formatDate(filters.start, true)} – ${formatDate(filters.end, true)}`}
          icon={<Droplets size={18} />}
          primary
        />
        <Metric
          title="Today's milk"
          value={litres(today.ml)}
          unit="L"
          subtitle={`${filters.shift === "Both" ? "Both shifts" : filters.shift} · provisional until 20:00`}
          icon={<Sun size={18} />}
        />
        <Metric
          title="Total recorded milk"
          value={litres(allTime.ml)}
          unit="L"
          subtitle={`Both shifts · since ${formatDate(historyStart(now), true)}`}
          icon={<Milk size={18} />}
        />
        <Metric
          title="Closed-shift gaps"
          value={number(
            summary.stats.reduce((n, s) => n + s.zero + s.missing, 0),
          )}
          subtitle="Confirmed zero + missing records"
          icon={<TriangleAlert size={18} />}
        />
      </div>
      <TrendChart summary={summary} />
      {!person ? (
        <>
          <div className="detail-section-actions">
            <div className="tab-group">
              {kind === "bmcs" ? (
                <>
                  <button
                    className={networkTab === "societies" ? "active" : ""}
                    onClick={() => setNetworkTab("societies")}
                  >
                    Linked societies
                  </button>
                  <button
                    className={networkTab === "farmers" ? "active" : ""}
                    onClick={() => setNetworkTab("farmers")}
                  >
                    Linked farmers
                  </button>
                </>
              ) : (
                <h2>Linked farmers</h2>
              )}
            </div>
            <Link
              className="button"
              to={linkTo("/no-supply", { tab: "farmers", reason: "all" })}
            >
              <TriangleAlert size={15} />
              View affected farmers
            </Link>
          </div>
          <EntityTable
            key={childrenKind}
            title={
              childrenKind === "societies"
                ? "Society collection"
                : "Farmer collection"
            }
            rows={entityRows(summary, childrenKind)}
            kind={childrenKind}
            filters={filters}
            href={(r) =>
              childrenKind === "societies"
                ? linkTo(`/societies/${r.id}`, {
                    bmc: societyById.get(r.id)!.bmcId,
                    society: r.id,
                  })
                : linkTo(`/farmers/${r.id}`, {
                    bmc: societyById.get(
                      farmers.find((f) => f.id === r.id)!.societyId,
                    )!.bmcId,
                    society: farmers.find((f) => f.id === r.id)!.societyId,
                  })
            }
          />
          <DailyHistory summary={summary} filters={filters} name={id} />
        </>
      ) : (
        <Panel
          title="Daily milk ledger"
          subtitle="Morning and evening collection with explicit shift status"
          className="ledger"
          action={
            <button
              className="button small"
              onClick={() =>
                downloadCsv(
                  `${person.id}-daily-milk-${filters.start}-${filters.end}`,
                  [
                    "Demo data",
                    "Farmer ID",
                    "Date",
                    "Morning (L)",
                    "Morning status",
                    "Evening (L)",
                    "Evening status",
                    "Daily total (L)",
                  ],
                  ledger.map((r) => [
                    "Yes",
                    person.id,
                    r.date,
                    r.morning
                      ? (r.morning.ml / 1000).toFixed(3)
                      : "Not selected",
                    r.morning?.status || "Not selected",
                    r.evening
                      ? (r.evening.ml / 1000).toFixed(3)
                      : "Not selected",
                    r.evening?.status || "Not selected",
                    (r.total / 1000).toFixed(3),
                  ]),
                )
              }
            >
              <Download size={14} />
              Export ledger
            </button>
          }
        >
          <div className="table-scroll">
            <table>
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Morning (L)</th>
                  <th>Morning status</th>
                  <th>Evening (L)</th>
                  <th>Evening status</th>
                  <th>Daily total (L)</th>
                </tr>
              </thead>
              <tbody>
                {ledger
                  .slice((ledgerCurrent - 1) * 10, ledgerCurrent * 10)
                  .map((r) => (
                    <tr key={r.date}>
                      <td>{formatDate(r.date, true)}</td>
                      <td>{r.morning ? litres(r.morning.ml) : "—"}</td>
                      <td>
                        {r.morning ? (
                          <Badge status={r.morning.status} />
                        ) : (
                          "Not selected"
                        )}
                      </td>
                      <td>{r.evening ? litres(r.evening.ml) : "—"}</td>
                      <td>
                        {r.evening ? (
                          <Badge status={r.evening.status} />
                        ) : (
                          "Not selected"
                        )}
                      </td>
                      <td>
                        <b>{litres(r.total)}</b>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
          <div className="table-pagination">
            <span>{ledger.length} collection days</span>
            <div>
              <button
                className="button small"
                disabled={ledgerCurrent === 1}
                onClick={() => setLedgerPage(ledgerCurrent - 1)}
              >
                Previous
              </button>
              <span>
                {ledgerCurrent} / {Math.ceil(ledger.length / 10)}
              </span>
              <button
                className="button small"
                disabled={ledgerCurrent * 10 >= ledger.length}
                onClick={() => setLedgerPage(ledgerCurrent + 1)}
              >
                Next
              </button>
            </div>
          </div>
        </Panel>
      )}
    </>
  );
}
