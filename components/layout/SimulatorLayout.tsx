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
import { useCallback, useState } from "react";
import type { TaxPolicy, AdvancedAssumptions } from "@/lib/types";

export function SimulatorLayout() {
  const sim = useSimulation();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleTaxChange = useCallback(
    (field: keyof TaxPolicy, value: number) => {
      sim.setTaxPolicy({ [field]: value });
    },
    [sim.setTaxPolicy]
  );

  const handleAssumptionsChange = useCallback(
    (field: keyof AdvancedAssumptions, value: number) => {
      sim.setAssumptions({ [field]: value });
    },
    [sim.setAssumptions]
  );

  const handlePlayToggle = useCallback(() => {
    sim.setIsPlaying(!sim.state.isPlaying);
  }, [sim.setIsPlaying, sim.state.isPlaying]);

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

  const sidebarContent = (
    <Sidebar
      state={sim.state}
      onScenarioChange={sim.loadScenario}
      onTaxChange={handleTaxChange}
      onProgramToggle={sim.toggleProgram}
      onAssumptionsChange={handleAssumptionsChange}
      onAdvancedModeChange={sim.setAdvancedMode}
      onReset={sim.reset}
    />
  );

  return (
    <TooltipProvider delay={200}>
      <div className="flex h-screen flex-col">
        <Header onMenuToggle={() => setSidebarOpen((o) => !o)} />
        <div className="flex flex-1 overflow-hidden">
          {/* Desktop sidebar — always visible at lg+ */}
          <div className="hidden lg:block">{sidebarContent}</div>

          {/* Mobile sidebar overlay — below lg */}
          {sidebarOpen && (
            <div className="fixed inset-0 z-50 flex lg:hidden">
              {/* Backdrop */}
              <div
                className="absolute inset-0 bg-black/60"
                onClick={() => setSidebarOpen(false)}
              />
              {/* Sidebar panel */}
              <div className="relative z-10 h-full">{sidebarContent}</div>
            </div>
          )}

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
