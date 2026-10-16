import { ArrowDown, ArrowUp } from "lucide-react";
import type { ReactNode } from "react";

export function Metric({
  title,
  value,
  unit,
  subtitle,
  icon,
  primary = false,
  change,
}: {
  title: string;
  value: string;
  unit?: string;
  subtitle: string;
  icon: ReactNode;
  primary?: boolean;
  change?: number | null;
}) {
  return (
    <div className={`metric ${primary ? "primary" : ""}`}>
      <div className="metric-top">
        <span>{title}</span>
        <span className="metric-icon">{icon}</span>
      </div>
      <div className="metric-value">
        {value}
        <small>{unit}</small>
      </div>
      <div className="metric-note">
        {change != null && (
          <span className={`change ${change >= 0 ? "up" : "down"}`}>
            {change >= 0 ? <ArrowUp size={11} /> : <ArrowDown size={11} />}{" "}
            {Math.abs(change).toFixed(1)}%
          </span>
        )}
        <span>{subtitle}</span>
      </div>
    </div>
  );
}
