"use client";

import { TooltipProvider } from "@/components/ui/tooltip";
import { useSimulation } from "@/hooks/useSimulation";
import { usePlayback } from "@/hooks/usePlayback";
import { Header } from "./Header";
import { Sidebar } from "@/components/sidebar/Sidebar";
import { ViewToggle } from "@/components/visualization/ViewToggle";
import { SimpleView } from "@/components/visualization/SimpleView";
import { AdvancedView } from "@/components/visualization/AdvancedView";
import { KitchenTableView } from "@/components/visualization/KitchenTableView";
import { PlaybackBar } from "@/components/playback/PlaybackBar";
import { TransparencyBanner } from "@/components/shared/TransparencyBanner";
import { ShowYourWork } from "@/components/shared/ShowYourWork";
import { useCallback, useState } from "react";
import type { TaxPolicy, AdvancedAssumptions } from "@/lib/types";

export function SimulatorLayout() {
  const sim = useSimulation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showYourWorkOpen, setShowYourWorkOpen] = useState(false);

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

  const handleScrollToPlayback = useCallback(() => {
    const playbackBar = document.querySelector('[data-playback-bar]');
    if (playbackBar) {
      playbackBar.scrollIntoView({ behavior: 'smooth', block: 'end' });
    }
    // Also start playing
    if (!sim.state.isPlaying) {
      sim.setIsPlaying(true);
    }
  }, [sim.state.isPlaying, sim.setIsPlaying]);

  const sidebarContent = (
    <Sidebar
      state={sim.state}
      onScenarioChange={sim.loadScenario}
      onTaxChange={handleTaxChange}
      onBracketChange={sim.setBracketRate}
      onProgramToggle={sim.toggleProgram}
      onProgramCostOverride={sim.setProgramCostOverride}
      onAssumptionsChange={handleAssumptionsChange}
      onAdvancedModeChange={sim.setAdvancedMode}
      onReset={sim.reset}
      onToggleWhatIfEvent={sim.toggleWhatIfEvent}
      onModeChange={sim.setMode}
    />
  );

  return (
    <TooltipProvider delay={200}>
      <div className="flex h-screen flex-col">
        <Header
          onMenuToggle={() => setSidebarOpen((o) => !o)}
          onShowYourWork={() => setShowYourWorkOpen(true)}
        />
        <div className="flex flex-1 overflow-hidden">
          {/* Desktop sidebar -- always visible at lg+ */}
          <div className="hidden lg:block">{sidebarContent}</div>

          {/* Mobile sidebar overlay -- below lg */}
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
            {/* Play Simulation button at top of viz area */}
            <button
              onClick={handleScrollToPlayback}
              className="flex items-center gap-2 rounded-lg border border-zinc-700/50 bg-zinc-900/50 px-4 py-2 text-sm text-zinc-400 transition-all hover:border-[#e94560]/50 hover:text-zinc-200 hover:bg-zinc-800/50"
            >
              <span className={`inline-flex size-6 items-center justify-center rounded-full bg-[#e94560] text-white text-xs ${!sim.state.isPlaying ? 'animate-pulse' : ''}`}>
                {sim.state.isPlaying ? "\u23F8" : "\u25B6"}
              </span>
              <span>{sim.state.isPlaying ? "Playing..." : "Play Simulation"}</span>
              <span className="font-mono text-zinc-500">{sim.state.currentYear}</span>
            </button>

            {/* View toggles */}
            <ViewToggle
              complexity={sim.state.viewComplexity}
              perspective={sim.state.viewPerspective}
              onComplexityChange={sim.setViewComplexity}
              onPerspectiveChange={sim.setViewPerspective}
            />

            {/* Conditional rendering based on view */}
            {sim.state.viewPerspective === "kitchen" ? (
              <KitchenTableView
                taxPolicy={sim.state.taxPolicy}
                enabledPrograms={sim.state.enabledPrograms}
              />
            ) : sim.state.viewComplexity === "simple" ? (
              <SimpleView
                todayYours={sim.todayYoursData}
                todayActual={sim.todayActualData}
                allData={sim.allData}
                baselineAllData={sim.baselineAllData}
                currentYear={sim.state.currentYear}
                isRevisionMode={sim.isRevisionMode}
              />
            ) : (
              <AdvancedView
                todayYours={sim.todayYoursData}
                todayActual={sim.todayActualData}
                projectedYours={sim.state.currentYear > 2025 ? sim.currentYearData : undefined}
                playbackYear={sim.state.currentYear}
                allData={sim.allData}
                baselineAllData={sim.baselineAllData}
                currentYear={sim.state.currentYear}
                taxPolicy={sim.state.taxPolicy}
                enabledPrograms={sim.state.enabledPrograms}
                assumptions={sim.state.assumptions}
                currentYearData={sim.currentYearData}
                whatIfCounterfactual={sim.whatIfData?.counterfactual}
                whatIfDelta={sim.whatIfDelta}
                isRevisionMode={sim.isRevisionMode}
              />
            )}

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
          allData={sim.allData}
          taxPolicy={sim.state.taxPolicy}
          enabledPrograms={sim.state.enabledPrograms}
          shareUrl={typeof window !== "undefined" ? window.location.href : ""}
        />
        <ShowYourWork
          assumptions={sim.state.assumptions}
          onAssumptionsChange={handleAssumptionsChange}
          onReset={sim.reset}
          open={showYourWorkOpen}
          onOpenChange={setShowYourWorkOpen}
        />
      </div>
    </TooltipProvider>
  );
}
