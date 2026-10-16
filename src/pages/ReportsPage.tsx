import { entityRows, followUpRows } from "@/domain/collection";
import { exportRows } from "@/reports/exportRows";
import type { EntityKind, Filters, Summary } from "@/types/models";
import type { LinkBuilder } from "@/types/navigation";
import { downloadCsv } from "@/utils/csv";
import { formatDate } from "@/utils/date";
import {
  ArrowRight,
  Building2,
  CalendarDays,
  Download,
  Droplets,
  FileBarChart2,
  Printer,
  ShieldCheck,
  TriangleAlert,
  Users,
  Warehouse,
} from "lucide-react";
import { Link } from "react-router-dom";

export function Reports({
  summary,
  filters,
  linkTo,
  onPrint,
  now,
}: {
  summary: Summary;
  filters: Filters;
  now: Date;
  linkTo: LinkBuilder;
  onPrint: (title: string, kind: EntityKind | "summary" | "no-supply") => void;
}) {
  const reports: {
    title: string;
    desc: string;
    kind: EntityKind | "summary" | "no-supply";
    icon: typeof Droplets;
  }[] = [
    {
      title: "Collection summary",
      desc: "Morning, evening and total milk collection for every reporting interval.",
      kind: "summary",
      icon: Droplets,
    },
    {
      title: "BMC comparison",
      desc: "Compare collection, linked societies and farmer participation across BMCs.",
      kind: "bmcs",
      icon: Warehouse,
    },
    {
      title: "Society collection",
      desc: "Society-wise volumes, supply status and closed-shift collection gaps.",
      kind: "societies",
      icon: Building2,
    },
    {
      title: "Farmer collection",
      desc: "A complete farmer list with collection totals and supply status.",
      kind: "farmers",
      icon: Users,
    },
    {
      title: "No-supply follow-up",
      desc: "All affected farmers, with confirmed zero and missing shifts separated.",
      kind: "no-supply",
      icon: TriangleAlert,
    },
  ];
  const exportReport = (
    kind: (typeof reports)[number]["kind"],
    title: string,
  ) => {
    if (kind === "summary")
      downloadCsv(
        `collection-summary-${filters.start}-${filters.end}`,
        [
          "Demo data",
          "Period start",
          "Period end",
          "Shift",
          "BMC filter",
          "Society filter",
          "Interval",
          "Morning (L)",
          "Evening (L)",
          "Total (L)",
          "Status",
        ],
        summary.series.map((p) => [
          "Yes",
          filters.start,
          filters.end,
          filters.shift,
          filters.bmc || "All",
          filters.society || "All",
          `${p.date} ${p.name}`,
          p.morning.toFixed(3),
          p.evening.toFixed(3),
          p.litres.toFixed(3),
          p.pending ? "Pending" : "Recorded",
        ]),
      );
    else
      exportRows(
        title.replaceAll(" ", "-").toLowerCase(),
        kind === "no-supply"
          ? followUpRows(summary, "farmers", filters, now)
          : entityRows(summary, kind),
        filters,
      );
  };
  return (
    <>
      <div className="report-banner">
        <span>
          <FileBarChart2 size={30} />
        </span>
        <div>
          <h2>From daily collection to clear decisions.</h2>
          <p>
            Every export reflects your selected dates, shifts and network
            filters.
          </p>
        </div>
        <div className="report-banner-date">
          <CalendarDays size={16} />
          {formatDate(filters.start, true)} – {formatDate(filters.end, true)}
        </div>
      </div>
      <div className="report-grid">
        {reports.map((r) => (
          <section className="report-card" key={r.kind}>
            <div className="report-icon">
              <r.icon size={23} />
            </div>
            <span className="report-format">CSV / PRINT</span>
            <h2>{r.title}</h2>
            <p>{r.desc}</p>
            <div>
              <button
                className="button"
                onClick={() => exportReport(r.kind, r.title)}
              >
                <Download size={15} />
                Export CSV
              </button>
              <button
                className="icon-button"
                aria-label={`Print ${r.title}`}
                onClick={() => onPrint(r.title, r.kind)}
              >
                <Printer size={17} />
              </button>
            </div>
          </section>
        ))}
        <section className="report-card report-help">
          <ShieldCheck size={25} />
          <h2>One source of truth</h2>
          <p>
            All milk totals roll up from individual farmer entries. Explore the
            underlying records before you export.
          </p>
          <Link className="text-button" to={linkTo("/farmers")}>
            Explore farmer records <ArrowRight size={15} />
          </Link>
        </section>
      </div>
    </>
  );
}
