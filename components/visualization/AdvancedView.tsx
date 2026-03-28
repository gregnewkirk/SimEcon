"use client";

import type { TaxPolicy, AdvancedAssumptions, YearData } from "@/lib/types";
import { KPICards } from "./KPICards";
import { VisualizationTabs } from "./VisualizationTabs";
import { DebtDeficitChart } from "./DebtDeficitChart";
import { WealthDistributionChart } from "./WealthDistributionChart";

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
      <KPICards
        todayYours={todayYours}
        todayActual={todayActual}
        projectedYours={projectedYours}
        playbackYear={playbackYear}
      />
      <VisualizationTabs
        chartsContent={
          <>
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
          </>
        }
        taxPolicy={taxPolicy}
        enabledPrograms={enabledPrograms}
        assumptions={assumptions}
        currentYearData={currentYearData}
        allData={allData}
        currentYear={currentYear}
      />
    </div>
  );
}
