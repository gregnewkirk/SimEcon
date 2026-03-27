import type { YearData } from "@/lib/types";
import { KPICard } from "./KPICard";

function formatTrillions(value: number): string {
  return `$${value.toFixed(1)}T`;
}

function formatBillions(value: number): string {
  const abs = Math.abs(value);
  if (abs >= 1000) {
    return `$${(value / 1000).toFixed(2)}T`;
  }
  return `$${abs.toFixed(0)}B`;
}

function pctDelta(current: number, baseline: number): number {
  if (baseline === 0) return 0;
  return ((current - baseline) / Math.abs(baseline)) * 100;
}

interface KPICardsProps {
  current: YearData;
  baseline: YearData;
}

export function KPICards({ current, baseline }: KPICardsProps) {
  return (
    <div className="grid grid-cols-4 gap-3">
      <KPICard
        label="National Debt"
        value={formatTrillions(current.debtTrillions)}
        delta={pctDelta(current.debtTrillions, baseline.debtTrillions)}
        color="#e94560"
      />
      <KPICard
        label="Annual Deficit"
        value={formatBillions(current.deficitBillions)}
        delta={pctDelta(current.deficitBillions, baseline.deficitBillions)}
        color="#f0a500"
      />
      <KPICard
        label="Revenue"
        value={formatBillions(current.revenueBillions)}
        delta={pctDelta(current.revenueBillions, baseline.revenueBillions)}
        color="#4ecca3"
      />
      <KPICard
        label="Debt / GDP"
        value={`${current.debtToGdpRatio.toFixed(1)}%`}
        delta={pctDelta(current.debtToGdpRatio, baseline.debtToGdpRatio)}
        color="#0f3460"
      />
    </div>
  );
}
