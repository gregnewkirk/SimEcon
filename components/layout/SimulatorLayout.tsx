"use client";

import { TooltipProvider } from "@/components/ui/tooltip";
import { useSimulation } from "@/hooks/useSimulation";
import { usePlayback } from "@/hooks/usePlayback";
import { Header } from "./Header";
import { Sidebar } from "@/components/sidebar/Sidebar";
import { ViewToggle } from "@/components/visualization/ViewToggle";
import { ModeToggle } from "@/components/sidebar/ModeToggle";
import { START_YEAR, LAST_HISTORICAL_YEAR, DEFAULT_END_YEAR, FIX_END_YEAR } from "@/lib/data/defaults";
import { SimpleView } from "@/components/visualization/SimpleView";
import { BudgetGame } from "@/components/visualization/BudgetGame";
import { AdvancedView } from "@/components/visualization/AdvancedView";
import { KitchenTableView } from "@/components/visualization/KitchenTableView";
import { HouseholdImpact } from "@/components/visualization/HouseholdImpact";
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

  // Mode-aware timeline bounds
  const playbackStartYear = sim.isRevisionMode ? START_YEAR : LAST_HISTORICAL_YEAR;
  const playbackEndYear = sim.isRevisionMode ? DEFAULT_END_YEAR : FIX_END_YEAR;

  usePlayback({
    isPlaying: sim.state.isPlaying,
    speed: sim.state.playbackSpeed,
    currentYear: sim.state.currentYear,
    endYear: playbackEndYear,
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
      <div className="flex h-screen flex-col" data-mode={sim.isRevisionMode ? "revision" : "fix"}>
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

          <main className="flex-1 space-y-4 overflow-y-auto bg-[#fafafa] p-4">
            {/* Mode toggle — visible on mobile where sidebar is hidden */}
            <div className="lg:hidden">
              <ModeToggle mode={sim.state.mode} onModeChange={sim.setMode} />
            </div>

            {/* Play Simulation button */}
            <div className="flex items-center gap-3">
              <button
                onClick={handleScrollToPlayback}
                className="flex items-center gap-2 rounded-lg border border-[#e5e5ea] bg-white shadow-sm px-4 py-2 text-sm text-[#86868b] transition-all hover:border-[#007AFF]/50 hover:text-[#1d1d1f] hover:bg-[#f5f5f7]"
              >
                <span className={`inline-flex size-6 items-center justify-center rounded-full bg-[#007AFF] text-white text-xs ${!sim.state.isPlaying ? 'animate-pulse' : ''}`}>
                  {sim.state.isPlaying ? "\u23F8" : "\u25B6"}
                </span>
                <span>{sim.state.isPlaying ? "Playing..." : "Play Simulation"}</span>
                <span className="font-mono text-[#c7c7cc]">{sim.state.currentYear}</span>
              </button>
              {/* Mobile menu button */}
              <button
                onClick={() => setSidebarOpen(true)}
                className="lg:hidden flex items-center gap-1.5 rounded-lg border border-[#e5e5ea] bg-white shadow-sm px-3 py-2 text-sm text-[#007AFF] transition-all hover:bg-[#f5f5f7]"
              >
                <svg width="16" height="16" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                  <line x1="3" y1="6" x2="17" y2="6" />
                  <line x1="3" y1="10" x2="17" y2="10" />
                  <line x1="3" y1="14" x2="17" y2="14" />
                </svg>
                Adjust Policy
              </button>
            </div>

            {/* View toggles */}
            <ViewToggle
              complexity={sim.state.viewComplexity}
              perspective={sim.state.viewPerspective}
              onComplexityChange={sim.setViewComplexity}
              onPerspectiveChange={sim.setViewPerspective}
            />

            {/* Conditional rendering based on view */}
            {sim.state.viewPerspective === "kitchen" && sim.state.viewComplexity === "simple" ? (
              <HouseholdImpact
                taxPolicy={sim.state.taxPolicy}
                enabledPrograms={sim.state.enabledPrograms}
              />
            ) : sim.state.viewPerspective === "kitchen" ? (
              <KitchenTableView
                taxPolicy={sim.state.taxPolicy}
                enabledPrograms={sim.state.enabledPrograms}
                viewComplexity={sim.state.viewComplexity}
              />
            ) : sim.state.viewComplexity === "simple" ? (
              <>
                <BudgetGame
                  taxPolicy={sim.state.taxPolicy}
                  enabledPrograms={sim.state.enabledPrograms}
                  onToggleProgram={sim.toggleProgram}
                  todayYours={sim.todayYoursData}
                  todayActual={sim.todayActualData}
                />
                <SimpleView
                  todayYours={sim.todayYoursData}
                  todayActual={sim.todayActualData}
                  allData={sim.allData}
                  baselineAllData={sim.baselineAllData}
                  currentYear={sim.state.currentYear}
                  isRevisionMode={sim.isRevisionMode}
                />
              </>
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
          startYear={playbackStartYear}
          endYear={playbackEndYear}
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
