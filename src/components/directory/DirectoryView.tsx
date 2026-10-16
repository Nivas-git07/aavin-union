import { EntityTable } from "@/components/tables/EntityTable";
import { entityRows } from "@/domain/collection";
import type { EntityKind } from "@/types/models";
import type { DirectoryPageProps } from "@/types/navigation";
import { litres, number } from "@/utils/format";
import { Building2, Users, Warehouse } from "lucide-react";

export function DirectoryView({
  summary,
  filters,
  rowHref,
  kind,
}: DirectoryPageProps & { kind: EntityKind }) {
  return (
    <>
      <div className="directory-summary">
        <span>
          <span className="directory-icon">
            {kind === "bmcs" ? (
              <Warehouse size={23} />
            ) : kind === "societies" ? (
              <Building2 size={23} />
            ) : (
              <Users size={23} />
            )}
          </span>
          <div>
            <strong>{number(entityRows(summary, kind).length)}</strong>
            <small>registered {kind === "bmcs" ? "BMCs" : kind}</small>
          </div>
        </span>
        <span>
          <div>
            <strong>
              {litres(summary.ml)} <em>L</em>
            </strong>
            <small>selected-period collection</small>
          </div>
        </span>
        <span>
          <div>
            <strong>
              {number(entityRows(summary, kind).filter((r) => r.ml > 0).length)}
            </strong>
            <small>contributing {kind === "bmcs" ? "BMCs" : kind}</small>
          </div>
        </span>
        <span>
          <div>
            <strong>
              {number(
                entityRows(summary, kind).filter((r) => r.affected > 0).length,
              )}
            </strong>
            <small>with closed-shift gaps</small>
          </div>
        </span>
      </div>
      <EntityTable
        key={kind}
        title={
          kind === "bmcs"
            ? "BMC directory"
            : kind === "societies"
              ? "Society directory"
              : "Farmer directory"
        }
        rows={entityRows(summary, kind)}
        kind={kind}
        filters={filters}
        href={(r) => rowHref(r, kind)}
      />
    </>
  );
}
