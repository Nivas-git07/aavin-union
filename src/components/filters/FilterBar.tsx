import { SelectField } from "@/components/ui/SelectField";
import { presetRange, presets } from "@/domain/reportingFilters";
import { bmcs, societies } from "@/services/demoRepository";
import type { Filters } from "@/types/models";
import { historyStart, indiaDate } from "@/utils/date";
import {
  Activity,
  Building2,
  CalendarDays,
  Filter,
  SlidersHorizontal,
  Sun,
  Sunset,
  Warehouse,
} from "lucide-react";
import { useState } from "react";

export function FilterBar({
  filters,
  onChange,
  now,
  pinned,
}: {
  filters: Filters;
  onChange: (patch: Partial<Filters>) => void;
  now: Date;
  pinned: boolean;
}) {
  const [expanded, setExpanded] = useState(false);
  const setPreset = (preset: string) =>
    onChange({ preset, ...presetRange(preset, now) });
  return (
    <div className="filter-area">
      <div className="filter-bar">
        <div className="period-control">
          <SelectField
            label="Reporting period"
            icon={<CalendarDays size={16} />}
            value={filters.preset}
            onChange={setPreset}
            options={presets.map((preset) => ({
              value: preset,
              label: preset,
            }))}
          />
        </div>
        <div className="filter-separator" />
        <div className="shift-tabs" role="group" aria-label="Collection shift">
          {(["Both", "Morning", "Evening"] as const).map((s) => (
            <button
              key={s}
              className={filters.shift === s ? "active" : ""}
              aria-pressed={filters.shift === s}
              onClick={() => onChange({ shift: s })}
            >
              {s === "Both" ? (
                <Activity size={13} />
              ) : s === "Morning" ? (
                <Sun size={13} />
              ) : (
                <Sunset size={13} />
              )}
              <span>{s === "Both" ? "All shifts" : s}</span>
            </button>
          ))}
        </div>
        <div className="filter-spacer" />
        <div className="select-field">
          <SelectField
            label="Filter by BMC"
            icon={<Warehouse size={15} />}
            disabled={pinned}
            value={filters.bmc}
            onChange={(value) => onChange({ bmc: value, society: "" })}
            options={[
              { value: "", label: "All BMCs" },
              ...bmcs.map((bmc) => ({ value: bmc.id, label: bmc.name })),
            ]}
          />
        </div>
        <div className="select-field society-filter">
          <SelectField
            label="Filter by society"
            icon={<Building2 size={15} />}
            disabled={pinned}
            value={filters.society}
            onChange={(value) => onChange({ society: value })}
            options={[
              { value: "", label: "All societies" },
              ...societies
                .filter(
                  (society) => !filters.bmc || society.bmcId === filters.bmc,
                )
                .map((society) => ({ value: society.id, label: society.name })),
            ]}
          />
        </div>
        <button
          className={`icon-button filter-more ${expanded ? "selected" : ""}`}
          aria-label="Show date and filter details"
          aria-expanded={expanded}
          onClick={() => setExpanded(!expanded)}
        >
          <SlidersHorizontal size={17} />
        </button>
      </div>
      {(expanded ||
        filters.preset === "Selected Date" ||
        filters.preset === "Custom Range") && (
        <div className="filter-details">
          <label>
            {filters.preset === "Selected Date" ? "Selected date" : "From"}
            <input
              type="date"
              aria-label="Start date"
              min={historyStart(now)}
              max={indiaDate(now)}
              value={filters.start}
              onChange={(e) =>
                onChange({
                  start: e.target.value,
                  ...(filters.preset === "Selected Date"
                    ? { end: e.target.value }
                    : { preset: "Custom Range" }),
                })
              }
            />
          </label>
          {filters.preset !== "Selected Date" && (
            <label>
              To
              <input
                type="date"
                aria-label="End date"
                min={filters.start}
                max={indiaDate(now)}
                value={filters.end}
                onChange={(e) =>
                  onChange({ end: e.target.value, preset: "Custom Range" })
                }
              />
            </label>
          )}
          <span>
            <Filter size={13} />
            Filters apply to every chart, table and export.
          </span>
          <button
            className="text-button"
            onClick={() =>
              onChange({
                preset: "Today",
                ...presetRange("Today", now),
                shift: "Both",
                ...(pinned ? {} : { bmc: "", society: "" }),
              })
            }
          >
            Reset filters
          </button>
        </div>
      )}
    </div>
  );
}
