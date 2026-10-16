import { Badge } from "@/components/ui/Badge";
import { Panel } from "@/components/ui/Panel";
import { exportRows } from "@/reports/exportRows";
import type { EntityKind, Filters, Row } from "@/types/models";
import { formatDate } from "@/utils/date";
import { litres, number } from "@/utils/format";
import {
  ArrowDown,
  ArrowDownToLine,
  ArrowUp,
  ArrowUpDown,
  ArrowUpRight,
  ChevronLeft,
  ChevronRight,
  Inbox,
  Search,
  X,
} from "lucide-react";
import { useMemo, useState } from "react";
import { Link } from "react-router-dom";

export function EntityTable({
  title,
  subtitle,
  rows,
  kind,
  filters,
  href,
  issues = false,
}: {
  title: string;
  subtitle?: string;
  rows: Row[];
  kind: EntityKind;
  filters: Filters;
  href: (row: Row) => string;
  issues?: boolean;
}) {
  const [query, setQuery] = useState(""),
    [sort, setSort] = useState<keyof Row>("ml"),
    [asc, setAsc] = useState(false),
    [page, setPage] = useState(1);
  const filtered = useMemo(
    () =>
      rows
        .filter((r) =>
          `${r.name} ${r.id} ${r.location} ${r.bmc} ${r.society} ${r.status}`
            .toLowerCase()
            .includes(query.toLowerCase()),
        )
        .sort((a, b) => {
          const av = a[sort],
            bv = b[sort];
          return (
            (typeof av === "number" && typeof bv === "number"
              ? av - bv
              : String(av).localeCompare(String(bv))) * (asc ? 1 : -1)
          );
        }),
    [rows, query, sort, asc],
  );
  const totalPages = Math.max(1, Math.ceil(filtered.length / 10)),
    current = Math.min(page, totalPages);
  const displayed = filtered.slice((current - 1) * 10, current * 10);
  const heading = (key: keyof Row, text: string) => (
    <button
      className="sort-button"
      onClick={() => {
        if (sort === key) setAsc(!asc);
        else {
          setSort(key);
          setAsc(key === "name");
        }
        setPage(1);
      }}
    >
      {text}
      {sort === key ? (
        asc ? (
          <ArrowUp size={12} />
        ) : (
          <ArrowDown size={12} />
        )
      ) : (
        <ArrowUpDown size={12} />
      )}
    </button>
  );
  return (
    <Panel
      title={title}
      subtitle={
        subtitle ||
        `${number(rows.length)} ${kind === "bmcs" ? "BMCs" : kind} in selected view`
      }
      className="entity-panel"
      action={
        <button
          className="button small"
          disabled={!filtered.length}
          onClick={() =>
            exportRows(
              title.replaceAll(" ", "-").toLowerCase(),
              filtered,
              filters,
            )
          }
        >
          <ArrowDownToLine size={14} />
          Export CSV
        </button>
      }
    >
      <div className="table-tools">
        <label className="search-box">
          <Search size={16} />
          <input
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setPage(1);
            }}
            placeholder={`Search ${kind === "bmcs" ? "BMCs" : kind}, ID or location…`}
            aria-label={`Search ${title}`}
          />
          {query && (
            <button
              className="icon-button"
              aria-label="Clear table search"
              onClick={() => {
                setQuery("");
                setPage(1);
              }}
            >
              <X size={14} />
            </button>
          )}
        </label>
        <span>
          {number(filtered.length)} records{" "}
          <span className="muted">· all filtered records export</span>
        </span>
      </div>
      <div className="table-scroll">
        <table>
          <thead>
            <tr>
              <th
                aria-sort={
                  sort === "name" ? (asc ? "ascending" : "descending") : "none"
                }
              >
                {heading(
                  "name",
                  kind === "bmcs"
                    ? "BMC / LOCATION"
                    : kind === "societies"
                      ? "SOCIETY / LOCATION"
                      : "FARMER",
                )}
              </th>
              <th>
                {kind === "farmers"
                  ? "SOCIETY / BMC"
                  : kind === "societies"
                    ? "BMC"
                    : "NETWORK"}
              </th>
              {issues ? (
                <>
                  <th>{heading("affected", "AFFECTED")}</th>
                  <th>{heading("zero", "ZERO / MISSING")}</th>
                  <th>{heading("lastDelivery", "LAST DELIVERY")}</th>
                </>
              ) : (
                <>
                  <th>
                    {heading(
                      kind === "farmers" ? "cows" : "farmers",
                      kind === "farmers" ? "COWS" : "FARMERS",
                    )}
                  </th>
                  <th
                    aria-sort={
                      sort === "ml"
                        ? asc
                          ? "ascending"
                          : "descending"
                        : "none"
                    }
                  >
                    {heading("ml", "COLLECTION (L)")}
                  </th>
                </>
              )}
              <th>{heading("status", "SUPPLY STATUS")}</th>
              <th>
                <span className="sr-only">Open details</span>
              </th>
            </tr>
          </thead>
          <tbody>
            {displayed.map((row) => (
              <tr key={row.id}>
                <td>
                  <Link to={href(row)} className="entity-name">
                    <span className={`entity-avatar ${kind}`}>
                      {kind === "farmers"
                        ? row.name.split(". ")[1]?.slice(0, 1)
                        : row.name.slice(0, 2).toUpperCase()}
                    </span>
                    <span>
                      <strong>{row.name}</strong>
                      <small>
                        {row.id} · {row.location}
                      </small>
                      {issues && kind === "farmers" && (
                        <small>Contact: {row.contact}</small>
                      )}
                    </span>
                  </Link>
                </td>
                <td>
                  <span className="cell-main">
                    {kind === "farmers"
                      ? row.society
                      : kind === "societies"
                        ? row.bmc
                        : `${row.societies} societies`}
                  </span>
                  <small className="cell-sub">
                    {kind === "farmers"
                      ? row.bmc
                      : kind === "bmcs"
                        ? `${row.farmers} farmers`
                        : row.location}
                  </small>
                </td>
                {issues ? (
                  <>
                    <td>
                      <b>{row.affected}</b>
                      <small className="cell-sub">
                        {row.missedDays} farmer-days
                      </small>
                    </td>
                    <td>
                      <b className="text-red">{row.zero}</b>
                      <span className="muted"> / </span>
                      <b className="text-amber">{row.missing}</b>
                      <small className="cell-sub">closed shifts</small>
                    </td>
                    <td>
                      {row.lastDelivery
                        ? formatDate(row.lastDelivery, true)
                        : "No recorded supply"}
                      <small className="cell-sub">
                        {row.pending
                          ? `${row.pending} shifts pending`
                          : "Collection closed"}
                      </small>
                    </td>
                  </>
                ) : (
                  <>
                    <td>
                      {number(kind === "farmers" ? row.cows : row.farmers)}
                    </td>
                    <td className="numeric">
                      <strong>{litres(row.ml)}</strong>
                      <small className="cell-sub">
                        AM {litres(row.morning)} · PM {litres(row.evening)}
                      </small>
                    </td>
                  </>
                )}
                <td>
                  <Badge status={row.status} />
                  {issues && (
                    <small className="cell-sub pattern">{row.pattern}</small>
                  )}
                </td>
                <td>
                  <Link
                    className="icon-button"
                    to={href(row)}
                    aria-label={`Open ${row.name}`}
                  >
                    <ArrowUpRight size={16} />
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {!filtered.length && (
          <div className="empty">
            <Inbox size={30} />
            <h3>No records to show</h3>
            <p>
              {query
                ? "Try a different name, ID, or location."
                : "There are no matching records for this reporting period."}
            </p>
            {query && (
              <button className="button" onClick={() => setQuery("")}>
                Clear search
              </button>
            )}
          </div>
        )}
      </div>
      <div className="table-pagination">
        <span>
          Showing{" "}
          <b>
            {filtered.length ? (current - 1) * 10 + 1 : 0}–
            {Math.min(current * 10, filtered.length)}
          </b>{" "}
          of <b>{number(filtered.length)}</b>
        </span>
        <div>
          <button
            className="icon-button"
            aria-label="Previous page"
            disabled={current <= 1}
            onClick={() => setPage(current - 1)}
          >
            <ChevronLeft size={16} />
          </button>
          <span>
            Page {current} of {totalPages}
          </span>
          <button
            className="icon-button"
            aria-label="Next page"
            disabled={current >= totalPages}
            onClick={() => setPage(current + 1)}
          >
            <ChevronRight size={16} />
          </button>
        </div>
      </div>
    </Panel>
  );
}
