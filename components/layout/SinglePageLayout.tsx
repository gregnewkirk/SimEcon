"use client";

import { useCallback, useMemo, useState } from "react";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useSimulation } from "@/hooks/useSimulation";
import { DEFAULT_END_YEAR, FIX_END_YEAR, CURRENT_POLICY } from "@/lib/data/defaults";
import { SCENARIOS } from "@/lib/data/scenarios";
import { PROGRAMS } from "@/lib/data/programs";
import { EXPLAINERS } from "@/lib/data/explainers";
import { WHAT_IF_EVENTS } from "@/lib/data/what-if-events";
import { TaxSlider } from "@/components/sidebar/TaxSlider";
import { SimpleView } from "@/components/visualization/SimpleView";
import { TradeOffCards } from "@/components/visualization/TradeOffCards";
import { HouseholdImpact } from "@/components/visualization/HouseholdImpact";
import { PersonalCalculator } from "@/components/visualization/PersonalCalculator";
import { CompareMode } from "@/components/visualization/CompareMode";
import { ShareCard } from "@/components/shared/ShareCard";
import type { TaxPolicy, SimMode } from "@/lib/types";

/* ── Helpers ─────────────────────────────────────────────────────────── */

function formatB(billions: number): string {
  if (Math.abs(billions) >= 1000) {
    return `$${(billions / 1000).toFixed(1)}T`;
  }
  return `$${Math.round(billions)}B`;
}

function getGrade(deficitBillions: number, gdpTrillions: number): { letter: string; color: string } {
  if (deficitBillions <= 0) return { letter: "A+", color: "#34c759" };
  const pct = (deficitBillions / (gdpTrillions * 1000)) * 100;
  if (pct < 1) return { letter: "A", color: "#34c759" };
  if (pct < 3) return { letter: "B", color: "#a8d65c" };
  if (pct < 5) return { letter: "C", color: "#f5a623" };
  if (pct < 8) return { letter: "D", color: "#ff6b35" };
  return { letter: "F", color: "#ff3b30" };
}

/* ── Experimental program IDs ────────────────────────────────────────── */

const EXPERIMENTAL_IDS = new Set([
  "wealth_tax", "sports_betting_tax", "robot_tax", "sugar_tax", "land_value_tax",
  "baby_bonds", "mental_health", "public_internet", "green_jobs", "rd_moonshot",
]);

/* ── Section Header ──────────────────────────────────────────────────── */

function SectionHeader({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="mb-4 border-b border-[#e5e5ea] pb-2 text-xs font-semibold uppercase tracking-wider text-[#86868b]">
      {children}
    </h2>
  );
}

/* ── Program Card (tap to expand, separate toggle) ──────────────────── */

function ProgramCard({
  program,
  enabled,
  type,
  onToggle,
}: {
  program: (typeof PROGRAMS)[number];
  enabled: boolean;
  type: "revenue" | "spending";
  onToggle: () => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const isRevenue = type === "revenue";
  const accentColor = isRevenue ? "#34c759" : "#ff3b30";
  const explainer = EXPLAINERS[program.id];

  return (
    <div
      className="rounded-xl border bg-white shadow-sm transition-all duration-200"
      style={{
        borderColor: enabled ? accentColor : "#e5e5ea",
        boxShadow: enabled
          ? `0 0 0 1px ${accentColor}, 0 0 12px ${accentColor}25`
          : undefined,
      }}
    >
      {/* Top row: icon, name, cost, toggle */}
      <div className="flex items-center gap-2.5 p-3">
        <span className="text-xl shrink-0">{program.icon}</span>
        {/* Tap card body to expand */}
        <button
          type="button"
          onClick={() => setExpanded((e) => !e)}
          className="min-w-0 flex-1 text-left"
        >
          <div className="text-sm font-semibold text-[#1d1d1f] leading-tight">{program.name}</div>
          <div
            className="mt-0.5 font-mono text-xs font-bold"
            style={{ color: enabled ? accentColor : "#86868b" }}
          >
            {isRevenue ? "+" : "−"}{formatB(Math.abs(program.netCostBillions))}/yr
          </div>
        </button>
        {/* Toggle pill — separate from expand tap */}
        <button
          type="button"
          onClick={(e) => { e.stopPropagation(); onToggle(); }}
          className="flex h-7 w-12 shrink-0 items-center rounded-full p-0.5 transition-all duration-200"
          style={{ backgroundColor: enabled ? accentColor : "#d1d1d6" }}
          aria-label={`Toggle ${program.name}`}
        >
          <div
            className="size-6 rounded-full bg-white shadow transition-all duration-200"
            style={{ transform: enabled ? "translateX(20px)" : "translateX(0px)" }}
          />
        </button>
      </div>

      {/* Expanded detail (tap card to show/hide) */}
      {expanded && explainer && (
        <div className="border-t border-[#f0f0f0] px-3 pb-3 pt-2">
          <p className="text-xs text-[#1d1d1f] leading-relaxed">{explainer.simple}</p>
          <p className="mt-2 text-[11px] text-[#86868b] leading-relaxed">{explainer.detail}</p>
          <p className="mt-1.5 text-[10px] text-[#c7c7cc] italic">
            Source: {program.source.agency} ({program.source.year})
          </p>
        </div>
      )}

      {/* Collapsed hint */}
      {!expanded && (
        <div className="px-3 pb-2">
          <p className="text-[11px] text-[#86868b] leading-snug">
            {explainer ? explainer.simple.slice(0, 80) + (explainer.simple.length > 80 ? "…" : "") : program.description.slice(0, 80) + "…"}
          </p>
          <button
            type="button"
            onClick={() => setExpanded(true)}
            className="mt-0.5 text-[10px] font-semibold text-[#007AFF]"
          >
            Learn more ↓
          </button>
        </div>
      )}
    </div>
  );
}

/* ════════════════════════════════════════════════════════════════════════
   SINGLE PAGE LAYOUT — replaces SimulatorLayout
   ════════════════════════════════════════════════════════════════════════ */

export function SinglePageLayout() {
  const sim = useSimulation();
  const [shareOpen, setShareOpen] = useState(false);
  const [showCompare, setShowCompare] = useState(false);
  const [modeSelected, setModeSelected] = useState(false);

  /* Keep currentYear pinned to end of timeline */
  const endYear = sim.isRevisionMode ? DEFAULT_END_YEAR : FIX_END_YEAR;
  if (sim.state.currentYear !== endYear) {
    sim.setCurrentYear(endYear);
  }

  /* Mode selection handler */
  const handleModeSelect = useCallback(
    (mode: SimMode) => {
      sim.setMode(mode);
      setModeSelected(true);
    },
    [sim.setMode],
  );

  /* Tax change handler */
  const handleTaxChange = useCallback(
    (field: keyof TaxPolicy, value: number) => {
      sim.setTaxPolicy({ [field]: value });
    },
    [sim.setTaxPolicy],
  );

  /* Split scenarios into ideology vs candidate, filtered by mode */
  const ideologyScenarios = useMemo(
    () => SCENARIOS.filter((s) =>
      (s.category === "ideology" || !s.category) &&
      (s.mode === "both" || s.mode === sim.state.mode)
    ),
    [sim.state.mode],
  );
  const candidateScenarios = useMemo(
    () => SCENARIOS.filter((s) =>
      s.category === "candidate" &&
      (s.mode === "both" || s.mode === sim.state.mode)
    ),
    [sim.state.mode],
  );

  /* Categorized programs */
  const spendingPrograms = useMemo(
    () => PROGRAMS.filter((p) => p.netCostBillions > 0 && !EXPERIMENTAL_IDS.has(p.id)),
    [],
  );
  const revenuePrograms = useMemo(
    () => PROGRAMS.filter((p) => p.netCostBillions < 0 && !EXPERIMENTAL_IDS.has(p.id)),
    [],
  );
  const experimentalPrograms = useMemo(
    () => PROGRAMS.filter((p) => EXPERIMENTAL_IDS.has(p.id)),
    [],
  );

  /* Budget numbers */
  const enabledPrograms = sim.state.enabledPrograms;
  const revenue = sim.todayYoursData.revenueBillions;
  const spending = sim.todayYoursData.spendingBillions;
  const gdp = sim.todayYoursData.gdpTrillions;
  const deficit = spending - revenue;
  const isSurplus = deficit <= 0;
  const grade = useMemo(() => getGrade(deficit, gdp), [deficit, gdp]);
  const total = revenue + spending;
  const revenuePct = total > 0 ? (revenue / total) * 100 : 50;
  const spendingPct = 100 - revenuePct;

  /* Debt numbers (for revision mode scoreboard) */
  // In revision mode with what-if events: show counterfactual vs actual from whatIfData
  // This way toggling events actually moves the bar
  const whatIfCounterfactual = sim.whatIfData?.counterfactual;
  const whatIfActual = sim.whatIfData?.actual;
  const debtYours = useMemo(() => {
    if (sim.isRevisionMode && whatIfCounterfactual && whatIfCounterfactual.length > 0) {
      // Use the counterfactual endpoint (what WOULD have happened without these events)
      return whatIfCounterfactual[whatIfCounterfactual.length - 1].debtTrillions;
    }
    return sim.todayYoursData.debtTrillions;
  }, [sim.isRevisionMode, whatIfCounterfactual, sim.todayYoursData]);

  const debtActual = useMemo(() => {
    if (sim.isRevisionMode && whatIfActual && whatIfActual.length > 0) {
      return whatIfActual[whatIfActual.length - 1].debtTrillions;
    }
    return sim.todayActualData.debtTrillions;
  }, [sim.isRevisionMode, whatIfActual, sim.todayActualData]);

  const debtDiff = debtYours - debtActual;
  const debtSaving = debtDiff < 0;

  return (
    <TooltipProvider delay={200}>
      <div className="min-h-screen bg-[#fafafa]" data-mode={sim.isRevisionMode ? "revision" : "fix"}>
        {/* ─── SECTION 1: Hero + Mode Choice ─────────────────────────── */}
        <section className="px-4 pb-8 pt-12 text-center">
          <h1 className="mb-2 text-4xl font-black tracking-tight sm:text-5xl">
            <span className="bg-gradient-to-r from-[#007AFF] via-[#af52de] to-[#ff3b30] bg-clip-text text-transparent">
              SimEcon
            </span>
          </h1>
          <p className="mb-8 text-lg text-[#86868b] sm:text-xl">
            What would you do with $36 trillion?
          </p>

          <div className="mx-auto flex max-w-lg gap-4">
            <button
              type="button"
              onClick={() => handleModeSelect("revision")}
              className="flex-1 rounded-xl border-2 px-4 py-4 text-left transition-all duration-200 hover:shadow-lg active:scale-[0.97]"
              style={{
                borderColor: sim.state.mode === "revision" && modeSelected ? "#af52de" : "#e5e5ea",
                backgroundColor: sim.state.mode === "revision" && modeSelected ? "#af52de10" : "white",
              }}
            >
              <div className="text-lg font-bold" style={{ color: sim.state.mode === "revision" && modeSelected ? "#af52de" : "#1d1d1f" }}>
                🕰️ What If We Had...
              </div>
              <p className="mt-1 text-xs text-[#86868b] leading-snug">
                Explore alternate history. What if the Bush tax cuts never happened? What if we didn&apos;t go to war? See what America traded away.
              </p>
            </button>
            <button
              type="button"
              onClick={() => handleModeSelect("fix")}
              className="flex-1 rounded-xl border-2 px-4 py-4 text-left transition-all duration-200 hover:shadow-lg active:scale-[0.97]"
              style={{
                borderColor: sim.state.mode === "fix" && modeSelected ? "#007AFF" : "#e5e5ea",
                backgroundColor: sim.state.mode === "fix" && modeSelected ? "#007AFF10" : "white",
              }}
            >
              <div className="text-lg font-bold" style={{ color: sim.state.mode === "fix" && modeSelected ? "#007AFF" : "#1d1d1f" }}>
                🔧 Fix This Mess
              </div>
              <p className="mt-1 text-xs text-[#86868b] leading-snug">
                Starting from today&apos;s $36T debt. Pick programs, set tax rates, toggle revenue generators. Can you actually balance the budget?
              </p>
            </button>
          </div>
        </section>

        {/* Everything below renders only after mode is selected */}
        {modeSelected && (
          <div className="mx-auto max-w-4xl px-4 pb-32">

            {/* ─── SECTION 2: What-If Events (revision mode only) ──── */}
            {sim.isRevisionMode && (
              <section className="py-8">
                <SectionHeader>What Happened — Toggle historical events to see what we traded away</SectionHeader>
                <div className="flex flex-wrap gap-2">
                  {WHAT_IF_EVENTS.map((event) => {
                    const active = sim.state.whatIfEventIds.includes(event.id);
                    return (
                      <button
                        key={event.id}
                        type="button"
                        onClick={() => sim.toggleWhatIfEvent(event.id)}
                        className="rounded-full border px-3 py-1.5 text-xs font-medium transition-all duration-200 hover:shadow-sm active:scale-[0.96]"
                        style={{
                          borderColor: active ? "#af52de" : "#e5e5ea",
                          backgroundColor: active ? "#af52de15" : "white",
                          color: active ? "#af52de" : "#1d1d1f",
                        }}
                      >
                        {event.name} {active ? "\u2713" : ""}
                      </button>
                    );
                  })}
                </div>

                {/* Trade-off cards */}
                {sim.state.whatIfEventIds.length > 0 && (
                  <div className="mt-6">
                    <TradeOffCards
                      whatIfEventIds={sim.state.whatIfEventIds}
                      enabledPrograms={sim.state.enabledPrograms}
                    />
                  </div>
                )}
              </section>
            )}

            {/* ─── SECTION 3: Scenario + Tax Controls ────────────────── */}
            <section className="py-8">
              <SectionHeader>Policy Scenario</SectionHeader>

              {/* Two dropdowns: ideology + candidate */}
              <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:gap-4">
                {/* Ideology / Economic Model */}
                <div className="flex-1">
                  <label className="mb-1 block text-[10px] font-semibold uppercase tracking-wider text-[#86868b]">
                    Economic Model
                  </label>
                  <select
                    value={ideologyScenarios.some((s) => s.id === sim.state.scenarioId) ? sim.state.scenarioId : ""}
                    onChange={(e) => { if (e.target.value) sim.loadScenario(e.target.value); }}
                    className="w-full rounded-xl border border-[#e5e5ea] bg-white px-4 py-3 text-sm font-medium text-[#1d1d1f] shadow-sm outline-none transition-all focus:border-[#007AFF] focus:ring-2 focus:ring-[#007AFF]/20"
                  >
                    <option value="">— Pick an ideology —</option>
                    {ideologyScenarios.map((s) => (
                      <option key={s.id} value={s.id}>{s.name}</option>
                    ))}
                  </select>
                </div>

                {/* Candidate / Specific Proposal */}
                <div className="flex-1">
                  <label className="mb-1 block text-[10px] font-semibold uppercase tracking-wider text-[#86868b]">
                    Candidate Plan
                  </label>
                  <select
                    value={candidateScenarios.some((s) => s.id === sim.state.scenarioId) ? sim.state.scenarioId : ""}
                    onChange={(e) => { if (e.target.value) sim.loadScenario(e.target.value); }}
                    className="w-full rounded-xl border border-[#e5e5ea] bg-white px-4 py-3 text-sm font-medium text-[#1d1d1f] shadow-sm outline-none transition-all focus:border-[#007AFF] focus:ring-2 focus:ring-[#007AFF]/20"
                  >
                    <option value="">— Pick a candidate —</option>
                    {candidateScenarios.map((s) => (
                      <option key={s.id} value={s.id}>{s.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Show which scenario is active */}
              {sim.state.scenarioId !== "current" && (
                <p className="mb-4 text-xs text-[#86868b]">
                  Active: <span className="font-semibold text-[#1d1d1f]">{SCENARIOS.find((s) => s.id === sim.state.scenarioId)?.name ?? "Custom"}</span>
                  {" · "}
                  <button type="button" onClick={() => sim.loadScenario("current")} className="text-[#007AFF] hover:underline">
                    Reset to Current Policy
                  </button>
                </p>
              )}

              {/* Tax sliders */}
              <h3 className="mb-3 text-xs font-semibold uppercase tracking-wider text-[#86868b]">Tax Rates</h3>
              <div className="grid grid-cols-1 gap-x-8 gap-y-4 sm:grid-cols-2">
                <TaxSlider
                  label="Top Bracket"
                  value={sim.state.taxPolicy.topMarginalRate}
                  defaultValue={CURRENT_POLICY.topMarginalRate}
                  onChange={(v) => handleTaxChange("topMarginalRate", v)}
                  color="#007AFF"
                  min={10}
                  max={90}
                  step={1}
                />
                <TaxSlider
                  label="Corporate"
                  value={sim.state.taxPolicy.corporateRate}
                  defaultValue={CURRENT_POLICY.corporateRate}
                  onChange={(v) => handleTaxChange("corporateRate", v)}
                  color="#af52de"
                  min={0}
                  max={100}
                  step={1}
                />
                <TaxSlider
                  label="Capital Gains"
                  value={sim.state.taxPolicy.capitalGainsRate}
                  defaultValue={CURRENT_POLICY.capitalGainsRate}
                  onChange={(v) => handleTaxChange("capitalGainsRate", v)}
                  color="#34c759"
                  min={0}
                  max={100}
                  step={1}
                />
                <TaxSlider
                  label="Estate Tax"
                  value={sim.state.taxPolicy.estateRate}
                  defaultValue={CURRENT_POLICY.estateRate}
                  onChange={(v) => handleTaxChange("estateRate", v)}
                  color="#ff9500"
                  min={0}
                  max={100}
                  step={1}
                />
              </div>
            </section>

            {/* ─── SECTION 4: Programs (the game part!) ──────────────── */}
            <section className="py-8">
              <SectionHeader>Spending Programs</SectionHeader>
              <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                {spendingPrograms.map((p) => (
                  <ProgramCard
                    key={p.id}
                    program={p}
                    enabled={sim.state.enabledPrograms.includes(p.id)}
                    type="spending"
                    onToggle={() => sim.toggleProgram(p.id)}
                  />
                ))}
              </div>

              <h3 className="mb-3 mt-8 text-xs font-semibold uppercase tracking-wider text-[#34c759]">
                Revenue Generators
              </h3>
              <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                {revenuePrograms.map((p) => (
                  <ProgramCard
                    key={p.id}
                    program={p}
                    enabled={sim.state.enabledPrograms.includes(p.id)}
                    type="revenue"
                    onToggle={() => sim.toggleProgram(p.id)}
                  />
                ))}
              </div>

              <h3 className="mb-1 mt-8 text-xs font-semibold uppercase tracking-wider text-[#af52de]">
                Experimental
              </h3>
              <p className="mb-3 text-[10px] text-[#c7c7cc]">Bold ideas with real economics behind them</p>
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                {/* Left column: costs money */}
                <div>
                  <p className="mb-2 text-[10px] font-semibold uppercase tracking-wider text-[#ff3b30]">💸 Costs Money (with ROI)</p>
                  <div className="space-y-2">
                    {experimentalPrograms.filter((p) => p.netCostBillions > 0).map((p) => (
                      <ProgramCard
                        key={p.id}
                        program={p}
                        enabled={sim.state.enabledPrograms.includes(p.id)}
                        type="spending"
                        onToggle={() => sim.toggleProgram(p.id)}
                      />
                    ))}
                  </div>
                </div>
                {/* Right column: makes money */}
                <div>
                  <p className="mb-2 text-[10px] font-semibold uppercase tracking-wider text-[#34c759]">💰 Generates Revenue</p>
                  <div className="space-y-2">
                    {experimentalPrograms.filter((p) => p.netCostBillions <= 0).map((p) => (
                      <ProgramCard
                        key={p.id}
                        program={p}
                        enabled={sim.state.enabledPrograms.includes(p.id)}
                        type="revenue"
                        onToggle={() => sim.toggleProgram(p.id)}
                      />
                    ))}
                  </div>
                </div>
              </div>
            </section>

            {/* ─── SECTION 6: Results (chart + metrics) ──────────────── */}
            <section className="py-8">
              <SectionHeader>Your Policy Impact</SectionHeader>
              <SimpleView
                todayYours={sim.todayYoursData}
                todayActual={sim.todayActualData}
                allData={sim.allData}
                baselineAllData={sim.baselineAllData}
                currentYear={sim.state.currentYear}
                isRevisionMode={sim.isRevisionMode}
              />
            </section>

            {/* ─── SECTION 7: Kitchen Table ──────────────────────────── */}
            <section className="py-8">
              <SectionHeader>Household Impact</SectionHeader>
              <HouseholdImpact
                taxPolicy={sim.state.taxPolicy}
                enabledPrograms={sim.state.enabledPrograms}
              />
            </section>

            {/* ─── SECTION 8: Personal Calculator ────────────────────── */}
            <section className="py-8">
              <SectionHeader>What This Means For You</SectionHeader>
              <PersonalCalculator
                taxPolicy={sim.state.taxPolicy}
                enabledPrograms={sim.state.enabledPrograms}
                whatIfEventIds={sim.isRevisionMode ? sim.state.whatIfEventIds : []}
              />
            </section>

            {/* ─── SECTION 9: Compare + Share ────────────────────────── */}
            <section className="py-8">
              <div className="flex flex-wrap gap-3">
                {!sim.isRevisionMode && (
                  <button
                    type="button"
                    onClick={() => setShowCompare(!showCompare)}
                    className="rounded-xl border border-[#e5e5ea] bg-white px-6 py-3 text-sm font-semibold text-[#007AFF] shadow-sm transition-all hover:shadow-md active:scale-[0.97]"
                  >
                    {showCompare ? "\u2190 Back" : "\u2696\uFE0F Compare Candidates"}
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => setShareOpen(true)}
                  className="rounded-xl border border-[#e5e5ea] bg-white px-6 py-3 text-sm font-semibold text-[#af52de] shadow-sm transition-all hover:shadow-md active:scale-[0.97]"
                >
                  Share Your Policy
                </button>
              </div>

              {showCompare && (
                <div className="mt-6">
                  <CompareMode />
                </div>
              )}
            </section>
          </div>
        )}

        {/* ─── SECTION 5: Sticky Scoreboard ─────────────────────────── */}
        {modeSelected && (
          <div className="sticky bottom-0 z-50 border-t border-[#e5e5ea] bg-white/95 shadow-lg backdrop-blur-sm">
            <div className="mx-auto max-w-4xl px-4 py-2">

              {sim.isRevisionMode ? (
                /* ── REVISION MODE: National Debt scoreboard ──────────── */
                <>
                  <div className="flex items-center gap-3">
                    {/* Debt comparison bar */}
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between text-[10px] font-semibold text-[#86868b] mb-1">
                        <span>National Debt</span>
                        <span>{debtSaving ? "You saved" : "Still"} ${Math.abs(debtDiff).toFixed(1)}T {debtSaving ? "✨" : ""}</span>
                      </div>
                      <div className="relative h-8 overflow-hidden rounded-full bg-[#f5f5f7]">
                        {/* Actual debt (gray baseline) */}
                        <div
                          className="absolute left-0 top-0 h-full rounded-full bg-[#c7c7cc] transition-all duration-500"
                          style={{ width: `${Math.min((debtActual / Math.max(debtActual, debtYours, 1)) * 100, 100)}%` }}
                        />
                        {/* Your debt (colored overlay) */}
                        <div
                          className="absolute left-0 top-0 h-full rounded-full transition-all duration-500"
                          style={{
                            width: `${Math.min((debtYours / Math.max(debtActual, debtYours, 1)) * 100, 100)}%`,
                            backgroundColor: debtSaving ? "#34c759" : "#ff3b30",
                          }}
                        />
                        <div className="absolute inset-0 flex items-center justify-between px-3 text-xs font-bold text-white">
                          <span className="drop-shadow">Yours: ${debtYours.toFixed(1)}T</span>
                          <span className="drop-shadow text-white/70">Actual: ${debtActual.toFixed(1)}T</span>
                        </div>
                      </div>
                    </div>

                    {/* Savings pill */}
                    <div
                      className="shrink-0 rounded-full px-3 py-1.5 text-sm font-bold whitespace-nowrap"
                      style={{
                        backgroundColor: debtSaving ? "#34c75920" : "#ff3b3020",
                        color: debtSaving ? "#34c759" : "#ff3b30",
                      }}
                    >
                      {debtSaving ? "−" : "+"}{formatB(Math.abs(debtDiff * 1000))}
                    </div>
                  </div>
                  <div className="mt-1 text-center text-[10px] text-[#86868b]">
                    {sim.state.whatIfEventIds.length} event{sim.state.whatIfEventIds.length !== 1 ? "s" : ""} toggled
                    {" · "}
                    {enabledPrograms.length} program{enabledPrograms.length !== 1 ? "s" : ""}
                  </div>
                </>
              ) : (
                /* ── FIX MODE: Budget + Debt dual scoreboard ─────────── */
                <>
                  {/* Achievement banners */}
                  {isSurplus && (
                    <div className="mb-1 text-center text-xs font-bold text-[#34c759] animate-pulse">
                      🎉 BALANCED BUDGET! You did what Congress couldn&apos;t.
                    </div>
                  )}
                  {!isSurplus && deficit > 0 && deficit < 500 && (
                    <div className="mb-1 text-center text-xs font-semibold text-[#ff9500]">
                      🔥 Almost there! Just {formatB(deficit)} more to balance.
                    </div>
                  )}

                  {/* Row 1: Budget balance bar + grade */}
                  <div className="flex items-center gap-3">
                    <div className="relative h-8 min-w-0 flex-1 overflow-hidden rounded-full bg-[#f5f5f7]">
                      <div
                        className="absolute left-0 top-0 h-full rounded-l-full transition-all duration-500 ease-out"
                        style={{ width: `${revenuePct}%`, backgroundColor: "#34c759" }}
                      />
                      <div
                        className="absolute right-0 top-0 h-full rounded-r-full transition-all duration-500 ease-out"
                        style={{ width: `${spendingPct}%`, backgroundColor: "#ff3b30" }}
                      />
                      <div className="absolute left-1/2 top-0 h-full w-0.5 -translate-x-1/2 bg-[#1d1d1f]/30" />
                      <div className="absolute inset-0 flex items-center justify-between px-3 text-[10px] font-bold text-white sm:text-xs">
                        <span className="drop-shadow">💰 {formatB(revenue)}</span>
                        <span className="drop-shadow">💸 {formatB(spending)}</span>
                      </div>
                    </div>

                    <div
                      className="shrink-0 rounded-full px-2.5 py-1 text-xs font-bold whitespace-nowrap"
                      style={{
                        backgroundColor: isSurplus ? "#34c75920" : "#ff3b3020",
                        color: isSurplus ? "#34c759" : "#ff3b30",
                      }}
                    >
                      {isSurplus ? "+" : "−"}{formatB(Math.abs(deficit))}/yr
                    </div>

                    <div className="shrink-0 flex flex-col items-center">
                      <span
                        className="text-2xl font-black leading-none transition-all duration-500 sm:text-3xl"
                        style={{ color: grade.color }}
                      >
                        {grade.letter}
                      </span>
                      <span className="text-[7px] font-semibold text-[#86868b] uppercase">Grade</span>
                    </div>
                  </div>

                  {/* Row 2: Debt trajectory (small, below budget bar) */}
                  <div className="mt-1.5 flex items-center gap-2 text-[10px] text-[#86868b]">
                    <span className="font-semibold">Debt by 2050:</span>
                    <span className="font-bold tabular-nums" style={{ color: debtSaving ? "#34c759" : "#ff3b30" }}>
                      ${debtYours.toFixed(1)}T
                    </span>
                    <span>vs ${debtActual.toFixed(1)}T baseline</span>
                    <span className="font-semibold" style={{ color: debtSaving ? "#34c759" : "#ff3b30" }}>
                      ({debtSaving ? "−" : "+"}{formatB(Math.abs(debtDiff * 1000))})
                    </span>
                    <span className="ml-auto">{enabledPrograms.length} programs · {((deficit / (gdp * 1000)) * 100).toFixed(1)}% of GDP</span>
                  </div>
                </>
              )}
            </div>
          </div>
        )}

        {/* Share Card Sheet */}
        <ShareCard
          open={shareOpen}
          onOpenChange={setShareOpen}
          taxPolicy={sim.state.taxPolicy}
          enabledPrograms={sim.state.enabledPrograms}
          todayYours={sim.todayYoursData}
          todayActual={sim.todayActualData}
          allData={sim.allData}
          baselineAllData={sim.baselineAllData}
          shareUrl={typeof window !== "undefined" ? window.location.href : "https://simecon.app"}
        />
      </div>
    </TooltipProvider>
  );
}
