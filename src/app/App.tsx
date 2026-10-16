import { DashboardContent } from "@/app/DashboardContent";
import { titles } from "@/app/navigation";
import { ReportHeader } from "@/app/ReportHeader";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { useDashboard } from "@/hooks/useDashboard";
import { PrintReport } from "@/reports/PrintReport";
import type { EntityKind } from "@/types/models";

export default function App() {
  const dashboard = useDashboard();
  const {
    page,
    summary,
    linkTo,
    printReport,
    detailEntity,
    isEntity,
    kind,
    filters,
    now,
    params,
  } = dashboard;
  return (
    <DashboardLayout
      page={page}
      summary={summary}
      linkTo={linkTo}
      printContent={
        <>
          {summary && (
            <PrintReport
              title={
                printReport?.title ||
                `${detailEntity?.name || titles[page]?.[0]} report`
              }
              kind={
                printReport?.kind ||
                (isEntity
                  ? kind
                  : page === "no-supply"
                    ? "no-supply"
                    : "summary")
              }
              filters={filters}
              summary={summary}
              now={now}
              reason={
                page === "no-supply" ? params.get("reason") || "all" : "all"
              }
              exceptionKind={
                page === "no-supply" &&
                ["bmcs", "societies", "farmers"].includes(
                  params.get("tab") || "",
                )
                  ? (params.get("tab") as EntityKind)
                  : "farmers"
              }
            />
          )}
        </>
      }
    >
      <ReportHeader dashboard={dashboard} />
      <DashboardContent dashboard={dashboard} />
    </DashboardLayout>
  );
}
