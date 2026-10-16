import type { EntityKind, Filters, Row, Summary } from "@/types/models";

export type LinkBuilder = (
  path: string,
  changes?: Record<string, string>,
) => string;
export interface DirectoryPageProps {
  summary: Summary;
  filters: Filters;
  rowHref: (row: Row, kind: EntityKind) => string;
}
