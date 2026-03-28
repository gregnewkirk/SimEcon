"use client";

import { useSimulation } from "@/hooks/useSimulation";
import { SimpleView } from "@/components/visualization/SimpleView";
import { BudgetGame } from "@/components/visualization/BudgetGame";
import { FIX_END_YEAR } from "@/lib/data/defaults";

export default function EmbedPage() {
  const sim = useSimulation();

  // Auto-set to fix mode and end year
  const endYear = FIX_END_YEAR;
  if (sim.state.currentYear !== endYear) {
    sim.setCurrentYear(endYear);
  }

  return (
    <div className="min-h-screen bg-[#fafafa] p-3 space-y-3">
      <SimpleView
        todayYours={sim.todayYoursData}
        todayActual={sim.todayActualData}
        allData={sim.allData}
        baselineAllData={sim.baselineAllData}
        currentYear={sim.state.currentYear}
        isRevisionMode={sim.isRevisionMode}
      />
      <BudgetGame
        taxPolicy={sim.state.taxPolicy}
        enabledPrograms={sim.state.enabledPrograms}
        onToggleProgram={sim.toggleProgram}
        todayYours={sim.todayYoursData}
        todayActual={sim.todayActualData}
      />
      <div className="text-center text-xs text-[#86868b] py-2">
        Powered by{" "}
        <a
          href="https://simecon.app"
          target="_blank"
          rel="noopener noreferrer"
          className="text-[#007AFF] font-medium hover:underline"
        >
          SimEcon
        </a>
        {" "}&mdash;{" "}
        <a
          href="https://simecon.app"
          target="_blank"
          rel="noopener noreferrer"
          className="text-[#007AFF] hover:underline"
        >
          Try the full version &rarr;
        </a>
      </div>
    </div>
  );
}
