import type { DashboardState } from "@/hooks/useDashboard";
import { Analytics } from "@/pages/AnalyticsPage";
import { BmcsPage } from "@/pages/BmcsPage";
import { Detail } from "@/pages/EntityDetailPage";
import { FarmersPage } from "@/pages/FarmersPage";
import { NoSupply } from "@/pages/NoSupplyPage";
import { Overview } from "@/pages/OverviewPage";
import { Reports } from "@/pages/ReportsPage";
import { SocietiesPage } from "@/pages/SocietiesPage";
import { Search, TriangleAlert } from "lucide-react";
import { Link } from "react-router-dom";

export function DashboardContent({ dashboard }: { dashboard: DashboardState }) {
  const {
    missingPage,
    error,
    navigate,
    page,
    setNow,
    summary,
    detailEntity,
    id,
    kind,
    filters,
    now,
    linkTo,
    loaded,
    rowHref,
    params,
    setParams,
    print,
  } = dashboard;
  return (
    <>
      {" "}
      {missingPage ? (
        <div className="empty page-empty">
          <Search size={32} />
          <h2>We couldn’t find that record</h2>
          <p>Choose a record from the directory or return to the overview.</p>
          <Link className="button primary-button" to="/overview">
            Back to overview
          </Link>
        </div>
      ) : error ? (
        <div className="error-state" role="alert">
          <TriangleAlert size={26} />
          <h2>Let’s adjust this report</h2>
          <p>{error}</p>
          <button
            className="button primary-button"
            onClick={() => {
              navigate(`/${page}`);
              setNow(new Date());
            }}
          >
            Reset and retry
          </button>
        </div>
      ) : !summary ? (
        <div className="loading-state" role="status">
          <div className="loading-spinner" />
          <h2>Preparing your collection report</h2>
          <p>Calculating farmer entries and network totals…</p>
        </div>
      ) : detailEntity ? (
        <Detail
          key={id}
          kind={kind}
          id={id!}
          filters={filters}
          now={now}
          summary={summary}
          linkTo={linkTo}
        />
      ) : page === "overview" ? (
        <Overview
          summary={summary}
          comparison={loaded!.comparison}
          filters={filters}
          linkTo={linkTo}
        />
      ) : page === "analytics" ? (
        <Analytics summary={summary} />
      ) : page === "bmcs" ? (
        <BmcsPage summary={summary} filters={filters} rowHref={rowHref} />
      ) : page === "societies" ? (
        <SocietiesPage summary={summary} filters={filters} rowHref={rowHref} />
      ) : page === "farmers" ? (
        <FarmersPage summary={summary} filters={filters} rowHref={rowHref} />
      ) : page === "no-supply" ? (
        <NoSupply
          summary={summary}
          filters={filters}
          now={now}
          linkTo={linkTo}
          params={params}
          setParam={(key, value) => {
            const p = new URLSearchParams(params);
            p.set(key, value);
            setParams(p);
          }}
        />
      ) : (
        <Reports
          summary={summary}
          filters={filters}
          linkTo={linkTo}
          onPrint={print}
          now={now}
        />
      )}
    </>
  );
}
