import type { Status } from "@/types/models";

export const statusClass = (status: Status) =>
  ({
    Supplied: "green",
    "Partial supply": "amber",
    "Confirmed zero": "red",
    "Missing record": "orange",
    Pending: "blue",
    "Not expected": "grey",
  })[status];

export function Badge({ status }: { status: Status }) {
  return (
    <span className={`badge ${statusClass(status)}`}>
      <span className="status-dot" />
      {status}
    </span>
  );
}
