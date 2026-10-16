import {
  bmcs,
  farmers,
  societies,
  societyById,
} from "@/services/demoRepository";
import type { LinkBuilder } from "@/types/navigation";
import { ArrowUpRight, Search, X } from "lucide-react";
import { useMemo, useState } from "react";
import { Link } from "react-router-dom";

export function GlobalSearch({ linkTo }: { linkTo: LinkBuilder }) {
  const [query, setQuery] = useState("");
  const found = useMemo(() => {
    if (query.trim().length < 2) return [];
    const q = query.toLowerCase();
    return [
      ...bmcs.map((b) => ({
        id: b.id,
        name: b.name,
        kind: "BMC",
        url: linkTo(`/bmcs/${b.id}`, { bmc: b.id, society: "" }),
      })),
      ...societies.map((s) => ({
        id: s.id,
        name: s.name,
        kind: "Society",
        url: linkTo(`/societies/${s.id}`, { bmc: s.bmcId, society: s.id }),
      })),
      ...farmers.map((f) => ({
        id: f.id,
        name: f.name,
        kind: "Farmer",
        url: linkTo(`/farmers/${f.id}`, {
          bmc: societyById.get(f.societyId)!.bmcId,
          society: f.societyId,
        }),
      })),
    ]
      .filter((r) => `${r.name} ${r.id}`.toLowerCase().includes(q))
      .slice(0, 8);
  }, [query, linkTo]);
  return (
    <div className="global-search">
      <label>
        <Search size={17} />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Escape") setQuery("");
          }}
          placeholder="Search your union…"
          aria-label="Search all BMCs, societies and farmers"
        />
        <span className="search-hint">⌕</span>
      </label>
      {query.length >= 2 && (
        <div className="search-results">
          <div className="search-results-heading">
            Search results{" "}
            <button
              className="icon-button"
              aria-label="Close search results"
              onClick={() => setQuery("")}
            >
              <X size={14} />
            </button>
          </div>
          {found.length ? (
            found.map((r) => (
              <Link key={r.id} to={r.url} onClick={() => setQuery("")}>
                <span>
                  <b>{r.name}</b>
                  <small>
                    {r.id} · {r.kind}
                  </small>
                </span>
                <ArrowUpRight size={16} />
              </Link>
            ))
          ) : (
            <p>No matching records. Try a name or ID.</p>
          )}
        </div>
      )}
    </div>
  );
}
