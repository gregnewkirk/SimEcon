import type { YearData } from "@/lib/types";
import { KPICard } from "./KPICard";

function formatTrillions(value: number): string {
  if (value < 0) return "$0.00T"; // Debt can't go negative in reality
  return `$${value.toFixed(2)}T`;
}

function formatBillions(value: number): string {
  const abs = Math.abs(value);
  const sign = value < 0 ? "-" : "";
  if (abs >= 1000) {
    return `${sign}$${(abs / 1000).toFixed(2)}T`;
  }
  return `${sign}$${abs.toFixed(2)}B`;
}

function formatDeficit(value: number): string {
  // Negative deficitBillions = deficit, positive = surplus
  if (value >= 0) {
    return `$${(value >= 1000 ? (value / 1000).toFixed(2) + "T" : value.toFixed(2) + "B")} surplus`;
  }
  const abs = Math.abs(value);
  return `$${(abs >= 1000 ? (abs / 1000).toFixed(2) + "T" : abs.toFixed(2) + "B")} deficit`;
}

interface KPICardsProps {
  current: YearData;
  baseline: YearData;
  currentYear: number;
}

export function KPICards({ current, baseline, currentYear }: KPICardsProps) {
  return (
    <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
      <KPICard
        label="National Debt"
        actualValue={formatTrillions(baseline.debtTrillions)}
        yourValue={formatTrillions(current.debtTrillions)}
        year={currentYear}
        color="#e94560"
      />
      <KPICard
        label="Annual Deficit"
        actualValue={formatDeficit(baseline.deficitBillions)}
        yourValue={formatDeficit(current.deficitBillions)}
        year={currentYear}
        color="#f0a500"
      />
      <KPICard
        label="Revenue"
        actualValue={formatBillions(baseline.revenueBillions)}
        yourValue={formatBillions(current.revenueBillions)}
        year={currentYear}
        color="#4ecca3"
      />
      <KPICard
        label="Debt / GDP"
        actualValue={`${(baseline.debtToGdpRatio * 100).toFixed(1)}%`}
        yourValue={`${(current.debtToGdpRatio * 100).toFixed(1)}%`}
        year={currentYear}
        color="#0f3460"
      />
    </div>
  );
}
