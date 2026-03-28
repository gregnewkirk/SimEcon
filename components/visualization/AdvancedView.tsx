"use client";

import type { TaxPolicy, AdvancedAssumptions, YearData } from "@/lib/types";
import { KPICards } from "./KPICards";
import { DebtDeficitChart } from "./DebtDeficitChart";
import { WealthDistributionChart } from "./WealthDistributionChart";
import { HouseholdImpact } from "./HouseholdImpact";
import { WaterfallChart } from "./WaterfallChart";
import { RevenueSpendingChart } from "./RevenueSpendingChart";
import { TornadoChart } from "./TornadoChart";

interface AdvancedViewProps {
  todayYours: YearData;
  todayActual: YearData;
  projectedYours?: YearData;
  playbackYear: number;
  allData: YearData[];
  baselineAllData: YearData[];
  currentYear: number;
  taxPolicy: TaxPolicy;
  enabledPrograms: string[];
  assumptions: AdvancedAssumptions;
  currentYearData: YearData;
  whatIfCounterfactual?: YearData[];
  whatIfDelta?: { debtDeltaTrillions: number } | null;
  isRevisionMode: boolean;
}

export function AdvancedView({
  todayYours,
  todayActual,
  projectedYours,
  playbackYear,
  allData,
  baselineAllData,
  currentYear,
  taxPolicy,
  enabledPrograms,
  assumptions,
  currentYearData,
  whatIfCounterfactual,
  whatIfDelta,
  isRevisionMode,
}: AdvancedViewProps) {
  return (
    <div className="space-y-4">
      {/* KPI summary cards */}
      <KPICards
        todayYours={todayYours}
        todayActual={todayActual}
        projectedYours={projectedYours}
        playbackYear={playbackYear}
      />

      {/* All charts in one scrollable view — no tabs */}

      {/* Overview */}
      <DebtDeficitChart
        data={allData}
        baselineData={baselineAllData}
        currentYear={currentYear}
        whatIfCounterfactual={whatIfCounterfactual}
        whatIfDelta={whatIfDelta}
        isRevisionMode={isRevisionMode}
      />
      <WealthDistributionChart
        data={allData}
        currentYear={currentYear}
      />

      {/* Budget */}
      <WaterfallChart yearData={currentYearData} />
      <RevenueSpendingChart data={allData} currentYear={currentYear} />

      {/* Sensitivity */}
      <TornadoChart
        taxPolicy={taxPolicy}
        assumptions={assumptions}
        currentYearData={currentYearData}
      />

      {/* Household Impact */}
      <HouseholdImpact
        taxPolicy={taxPolicy}
        enabledPrograms={enabledPrograms}
      />
    </div>
  );
}
