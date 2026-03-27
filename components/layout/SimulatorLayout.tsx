"use client";

import { TooltipProvider } from "@/components/ui/tooltip";
import { useSimulation } from "@/hooks/useSimulation";
import { usePlayback } from "@/hooks/usePlayback";
import { Header } from "./Header";
import { Sidebar } from "@/components/sidebar/Sidebar";
import { KPICards } from "@/components/visualization/KPICards";
import { DebtDeficitChart } from "@/components/visualization/DebtDeficitChart";
import { WealthDistributionChart } from "@/components/visualization/WealthDistributionChart";
import { PlaybackBar } from "@/components/playback/PlaybackBar";
import { TransparencyBanner } from "@/components/shared/TransparencyBanner";
import { useCallback } from "react";
import type { TaxPolicy, AdvancedAssumptions } from "@/lib/types";

export function SimulatorLayout() {
  const sim = useSimulation();

  // Adapt setTaxPolicy(Partial<TaxPolicy>) to onTaxChange(field, value) for Sidebar
  const handleTaxChange = useCallback(
    (field: keyof TaxPolicy, value: number) => {
      sim.setTaxPolicy({ [field]: value });
    },
    [sim.setTaxPolicy]
  );

  // Adapt setAssumptions(Partial<AdvancedAssumptions>) to onAssumptionsChange(field, value) for Sidebar
  const handleAssumptionsChange = useCallback(
    (field: keyof AdvancedAssumptions, value: number) => {
      sim.setAssumptions({ [field]: value });
    },
    [sim.setAssumptions]
  );

  // PlaybackBar expects onPlayToggle() — toggle based on current state
  const handlePlayToggle = useCallback(() => {
    sim.setIsPlaying(!sim.state.isPlaying);
  }, [sim.setIsPlaying, sim.state.isPlaying]);

  // Stop playback when it reaches the end
  const handlePlaybackFinished = useCallback(() => {
    sim.setIsPlaying(false);
  }, [sim.setIsPlaying]);

  usePlayback({
    isPlaying: sim.state.isPlaying,
    speed: sim.state.playbackSpeed,
    currentYear: sim.state.currentYear,
    onYearChange: sim.setCurrentYear,
    onFinished: handlePlaybackFinished,
  });

  return (
    <TooltipProvider delay={200}>
      <div className="flex h-screen flex-col">
        <Header />
        <div className="flex flex-1 overflow-hidden">
          <Sidebar
            state={sim.state}
            onScenarioChange={sim.loadScenario}
            onTaxChange={handleTaxChange}
            onProgramToggle={sim.toggleProgram}
            onAssumptionsChange={handleAssumptionsChange}
            onAdvancedModeChange={sim.setAdvancedMode}
            onReset={sim.reset}
          />
          <main className="flex-1 space-y-4 overflow-y-auto p-4">
            <KPICards
              current={sim.currentYearData}
              baseline={sim.baselineYearData}
            />
            <DebtDeficitChart
              data={sim.allData}
              baselineData={sim.baselineAllData}
              currentYear={sim.state.currentYear}
            />
            <WealthDistributionChart
              data={sim.allData}
              currentYear={sim.state.currentYear}
            />
            <TransparencyBanner />
          </main>
        </div>
        <PlaybackBar
          currentYear={sim.state.currentYear}
          isPlaying={sim.state.isPlaying}
          speed={sim.state.playbackSpeed}
          onYearChange={sim.setCurrentYear}
          onPlayToggle={handlePlayToggle}
          onSpeedChange={sim.setPlaybackSpeed}
        />
      </div>
    </TooltipProvider>
  );
}
