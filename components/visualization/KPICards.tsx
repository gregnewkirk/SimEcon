import type { YearData } from "@/lib/types";
import { KPICard } from "./KPICard";
import { LAST_HISTORICAL_YEAR } from "@/lib/data/defaults";

function fmtT(value: number): string {
  if (value < 0) return "$0.00T";
  return `$${value.toFixed(2)}T`;
}

function fmtB(value: number): string {
  const abs = Math.abs(value);
  if (abs >= 1000) return `$${(abs / 1000).toFixed(2)}T`;
  return `$${abs.toFixed(2)}B`;
}

function fmtDeficit(value: number): string {
  if (value >= 0) {
    return `${fmtB(value)} surplus`;
  }
  return `${fmtB(value)} deficit`;
}

function fmtPct(ratio: number): string {
  // debtToGdpRatio is already a percentage (e.g. 128 = 128%)
  return `${ratio.toFixed(1)}%`;
}

function deltaStr(yours: number, actual: number, unit: "T" | "B" | "%"): { text: string; direction: "better" | "worse" | "same" } {
  const diff = yours - actual;
  if (Math.abs(diff) < 0.005) return { text: "", direction: "same" };

  const abs = Math.abs(diff);
  let formatted: string;
  if (unit === "T") {
    formatted = `$${abs.toFixed(2)}T`;
  } else if (unit === "B") {
    formatted = abs >= 1000 ? `$${(abs / 1000).toFixed(2)}T` : `$${abs.toFixed(0)}B`;
  } else {
    formatted = `${abs.toFixed(1)}%`;
  }

  // For debt/deficit: lower is better. For revenue: higher is better.
  return {
    text: `${diff > 0 ? "+" : "\u2212"}${formatted}`,
    direction: diff > 0 ? "worse" : "better",
  };
}

interface KPICardsProps {
  /** Your policy applied to the present-day year */
  todayYours: YearData;
  /** Actual present-day data (baseline, no changes) */
  todayActual: YearData;
  /** Your policy at the playback cursor (for hover tooltip) */
  projectedYours?: YearData;
  /** Current playback year */
  playbackYear: number;
}

export function KPICards({ todayYours, todayActual, projectedYours, playbackYear }: KPICardsProps) {
  const showProjected = projectedYours && playbackYear > LAST_HISTORICAL_YEAR;

  const debtDelta = deltaStr(todayYours.debtTrillions, todayActual.debtTrillions, "T");
  const deficitDelta = deltaStr(
    Math.abs(todayYours.deficitBillions),
    Math.abs(todayActual.deficitBillions),
    "B"
  );
  // Revenue: higher is better, so flip the direction
  const revDelta = deltaStr(todayYours.revenueBillions, todayActual.revenueBillions, "B");
  const revDirection = revDelta.direction === "worse" ? "better" as const : revDelta.direction === "better" ? "worse" as const : "same" as const;

  const dgdpDelta = deltaStr(
    todayYours.debtToGdpRatio,
    todayActual.debtToGdpRatio,
    "%"
  );

  return (
    <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
      <KPICard
        label="National Debt"
        actualValue={fmtT(todayActual.debtTrillions)}
        yourValue={fmtT(todayYours.debtTrillions)}
        delta={debtDelta.text}
        deltaDirection={debtDelta.direction}
        color="#ff3b30"
        projectedLabel={showProjected ? `${playbackYear} projection` : undefined}
        projectedValue={showProjected && projectedYours ? fmtT(projectedYours.debtTrillions) : undefined}
      />
      <KPICard
        label="Annual Deficit"
        actualValue={fmtDeficit(todayActual.deficitBillions)}
        yourValue={fmtDeficit(todayYours.deficitBillions)}
        delta={deficitDelta.text}
        deltaDirection={deficitDelta.direction}
        color="#ff9500"
        projectedLabel={showProjected ? `${playbackYear} projection` : undefined}
        projectedValue={showProjected && projectedYours ? fmtDeficit(projectedYours.deficitBillions) : undefined}
      />
      <KPICard
        label="Revenue"
        actualValue={fmtB(todayActual.revenueBillions)}
        yourValue={fmtB(todayYours.revenueBillions)}
        delta={revDelta.text}
        deltaDirection={revDirection}
        color="#34c759"
        projectedLabel={showProjected ? `${playbackYear} projection` : undefined}
        projectedValue={showProjected && projectedYours ? fmtB(projectedYours.revenueBillions) : undefined}
      />
      <KPICard
        label="Debt / GDP"
        actualValue={fmtPct(todayActual.debtToGdpRatio)}
        yourValue={fmtPct(todayYours.debtToGdpRatio)}
        delta={dgdpDelta.text}
        deltaDirection={dgdpDelta.direction}
        color="#007AFF"
        projectedLabel={showProjected ? `${playbackYear} projection` : undefined}
        projectedValue={showProjected && projectedYours ? fmtPct(projectedYours.debtToGdpRatio) : undefined}
      />
    </div>
  );
}
