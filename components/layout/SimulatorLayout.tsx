"use client";

import { TooltipProvider } from "@/components/ui/tooltip";
import { useSimulation } from "@/hooks/useSimulation";
import { Header } from "./Header";
import { Sidebar } from "@/components/sidebar/Sidebar";
import { ViewToggle } from "@/components/visualization/ViewToggle";
import { ModeToggle } from "@/components/sidebar/ModeToggle";
import { DEFAULT_END_YEAR, FIX_END_YEAR } from "@/lib/data/defaults";
import { SimpleView } from "@/components/visualization/SimpleView";
import { BudgetGame } from "@/components/visualization/BudgetGame";
import { AdvancedView } from "@/components/visualization/AdvancedView";
import { KitchenTableView } from "@/components/visualization/KitchenTableView";
import { HouseholdImpact } from "@/components/visualization/HouseholdImpact";
import { TransparencyBanner } from "@/components/shared/TransparencyBanner";
import { ShowYourWork } from "@/components/shared/ShowYourWork";
import { ShareCard } from "@/components/shared/ShareCard";
import { LandingPage } from "./LandingPage";
import { TradeOffCards } from "@/components/visualization/TradeOffCards";
import { useCallback, useState } from "react";
import type { TaxPolicy, AdvancedAssumptions } from "@/lib/types";

export function SimulatorLayout() {
  const sim = useSimulation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showYourWorkOpen, setShowYourWorkOpen] = useState(false);
  const [shareOpen, setShareOpen] = useState(false);
  const [showLanding, setShowLanding] = useState(true);

  const handleModeSelect = useCallback((mode: "revision" | "fix") => {
    sim.setMode(mode);
    setShowLanding(false);
  }, [sim.setMode]);

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

  // Charts always show full timeline — no playback needed
  // Set currentYear to end of timeline so all data is visible
  const endYear = sim.isRevisionMode ? DEFAULT_END_YEAR : FIX_END_YEAR;
  if (sim.state.currentYear !== endYear) {
    sim.setCurrentYear(endYear);
  }

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
          onShare={() => setShareOpen(true)}
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
              {/* Sidebar panel — h-full + overflow for scrolling */}
              <div className="relative z-10 h-full overflow-y-auto">{sidebarContent}</div>
            </div>
          )}

          {showLanding ? (
            <main className="flex flex-1 overflow-y-auto bg-[#fafafa]">
              <LandingPage onSelectMode={handleModeSelect} />
            </main>
          ) : (
            <main className="flex-1 space-y-4 overflow-y-auto bg-[#fafafa] p-4">
              {/* Mode toggle — visible on mobile where sidebar is hidden */}
              <div className="lg:hidden">
                <ModeToggle mode={sim.state.mode} onModeChange={sim.setMode} />
              </div>

              {/* Mobile menu button */}
              <div className="lg:hidden">
                <button
                  onClick={() => setSidebarOpen(true)}
                  className="flex items-center gap-1.5 rounded-lg border border-[#e5e5ea] bg-white shadow-sm px-3 py-2 text-sm text-[#007AFF] transition-all hover:bg-[#f5f5f7]"
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

              {/* Trade-off cards — bottom of page, simple view only */}
              {sim.state.viewComplexity === "simple" && sim.isRevisionMode && sim.state.whatIfEventIds.length > 0 && (
                <TradeOffCards
                  whatIfEventIds={sim.state.whatIfEventIds}
                  enabledPrograms={sim.state.enabledPrograms}
                />
              )}

              <TransparencyBanner />
            </main>
          )}
        </div>
        {/* Playback bar removed — charts show full timeline instantly */}
        <ShowYourWork
          assumptions={sim.state.assumptions}
          onAssumptionsChange={handleAssumptionsChange}
          onReset={sim.reset}
          open={showYourWorkOpen}
          onOpenChange={setShowYourWorkOpen}
        />
        <ShareCard
          open={shareOpen}
          onOpenChange={setShareOpen}
          taxPolicy={sim.state.taxPolicy}
          enabledPrograms={sim.state.enabledPrograms}
          todayYours={sim.todayYoursData}
          todayActual={sim.todayActualData}
          shareUrl={typeof window !== "undefined" ? window.location.href : "https://simecon.app"}
        />
      </div>
    </TooltipProvider>
  );
}
