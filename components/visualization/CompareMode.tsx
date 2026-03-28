"use client";

import { useMemo, useState } from "react";
import { simulate } from "@/lib/engine/simulate";
import { HISTORICAL_DATA } from "@/lib/data/historical";
import { DEFAULT_ASSUMPTIONS, FIX_END_YEAR } from "@/lib/data/defaults";
import { SCENARIOS, SCENARIOS_MAP } from "@/lib/data/scenarios";
import { PROGRAMS, PROGRAMS_MAP } from "@/lib/data/programs";
import type { TaxPolicy, YearData } from "@/lib/types";

// ─── Formatting helpers ────────────────────────────────────────────

function fmtT(value: number): string {
  return `$${Math.abs(value).toFixed(1)}T`;
}

function fmtB(value: number): string {
  const abs = Math.abs(value);
  if (abs >= 1000) return `$${(abs / 1000).toFixed(2)}T`;
  return `$${abs.toFixed(0)}B`;
}

function fmtPct(ratio: number): string {
  return `${ratio.toFixed(1)}%`;
}

/** Composite grade weighting fiscal health, median household impact, and services. */
function computeCompositeGrade(
  lastYear: YearData,
  enabledPrograms: string[],
  scenarioPolicy: TaxPolicy
): { letter: string; score: number } {
  // 1. Fiscal health (30% weight) — deficit as % of GDP
  const deficitPct = (-lastYear.deficitBillions / (lastYear.gdpTrillions * 1000)) * 100;
  let fiscalScore = 0;
  if (deficitPct <= 0) fiscalScore = 100; // surplus
  else if (deficitPct <= 1) fiscalScore = 90;
  else if (deficitPct <= 3) fiscalScore = 70;
  else if (deficitPct <= 5) fiscalScore = 50;
  else if (deficitPct <= 8) fiscalScore = 30;
  else fiscalScore = 10;

  // 2. Median household impact (50% weight) — net benefit for $75K household
  const medianIncome = 75000;
  const CURRENT_BRACKETS = [
    { minIncome: 0, maxIncome: 11000, rate: 10 },
    { minIncome: 11000, maxIncome: 44725, rate: 12 },
    { minIncome: 44725, maxIncome: 95375, rate: 22 },
    { minIncome: 95375, maxIncome: 182100, rate: 24 },
    { minIncome: 182100, maxIncome: 231250, rate: 32 },
    { minIncome: 231250, maxIncome: 578125, rate: 35 },
    { minIncome: 578125, maxIncome: Infinity, rate: 37 },
  ];
  function calcTax(income: number, brackets: { minIncome: number; maxIncome: number; rate: number }[]): number {
    let tax = 0, remaining = income;
    for (const b of brackets) {
      if (remaining <= 0) break;
      const taxable = Math.min(remaining, b.maxIncome === Infinity ? remaining : b.maxIncome - b.minIncome);
      tax += taxable * (b.rate / 100);
      remaining -= taxable;
    }
    return tax;
  }
  const taxDefault = calcTax(medianIncome, CURRENT_BRACKETS);
  const taxUser = calcTax(medianIncome, scenarioPolicy.brackets.map(b => ({ minIncome: b.minIncome, maxIncome: b.maxIncome, rate: b.rate })));
  const taxChange = taxUser - taxDefault;

  // Benefits (simplified for median 2-adult 1-kid household)
  let benefits = 0;
  for (const pid of enabledPrograms) {
    if (pid === "healthcare") benefits += 2 * 7500;
    else if (pid === "prek") benefits += 10000;
    else if (pid === "housing" && medianIncome < 150000) benefits += 3000;
    else if (pid === "ubi") benefits += 2 * 12000;
  }
  const netImpact = benefits - taxChange;
  const impactPct = (netImpact / medianIncome) * 100;

  let householdScore = 50; // neutral baseline
  if (impactPct >= 10) householdScore = 100;
  else if (impactPct >= 5) householdScore = 85;
  else if (impactPct >= 2) householdScore = 70;
  else if (impactPct >= 0) householdScore = 55;
  else if (impactPct >= -2) householdScore = 40;
  else if (impactPct >= -5) householdScore = 25;
  else householdScore = 10;

  // 3. Services provided (20% weight) — how many programs enabled
  const serviceScore = Math.min((enabledPrograms.length / 6) * 100, 100);

  // Composite
  const composite = fiscalScore * 0.3 + householdScore * 0.5 + serviceScore * 0.2;

  let letter: string;
  if (composite >= 90) letter = "A+";
  else if (composite >= 80) letter = "A";
  else if (composite >= 70) letter = "B+";
  else if (composite >= 60) letter = "B";
  else if (composite >= 50) letter = "C+";
  else if (composite >= 40) letter = "C";
  else if (composite >= 30) letter = "D";
  else letter = "F";

  return { letter, score: Math.round(composite) };
}

/** Compute median household net impact for display. */
function computeMedianNetImpact(
  enabledPrograms: string[],
  scenarioPolicy: TaxPolicy
): number {
  const medianIncome = 75000;
  const CURRENT_BRACKETS = [
    { minIncome: 0, maxIncome: 11000, rate: 10 },
    { minIncome: 11000, maxIncome: 44725, rate: 12 },
    { minIncome: 44725, maxIncome: 95375, rate: 22 },
    { minIncome: 95375, maxIncome: 182100, rate: 24 },
    { minIncome: 182100, maxIncome: 231250, rate: 32 },
    { minIncome: 231250, maxIncome: 578125, rate: 35 },
    { minIncome: 578125, maxIncome: Infinity, rate: 37 },
  ];
  function calcTax(income: number, brackets: { minIncome: number; maxIncome: number; rate: number }[]): number {
    let tax = 0, remaining = income;
    for (const b of brackets) {
      if (remaining <= 0) break;
      const taxable = Math.min(remaining, b.maxIncome === Infinity ? remaining : b.maxIncome - b.minIncome);
      tax += taxable * (b.rate / 100);
      remaining -= taxable;
    }
    return tax;
  }
  const taxDefault = calcTax(medianIncome, CURRENT_BRACKETS);
  const taxUser = calcTax(medianIncome, scenarioPolicy.brackets.map(b => ({ minIncome: b.minIncome, maxIncome: b.maxIncome, rate: b.rate })));
  const taxChange = taxUser - taxDefault;

  let benefits = 0;
  for (const pid of enabledPrograms) {
    if (pid === "healthcare") benefits += 2 * 7500;
    else if (pid === "prek") benefits += 10000;
    else if (pid === "housing" && medianIncome < 150000) benefits += 3000;
    else if (pid === "ubi") benefits += 2 * 12000;
  }
  return benefits - taxChange;
}

function gradeColor(grade: string): string {
  if (grade.startsWith("A")) return "#34c759";
  if (grade.startsWith("B")) return "#007AFF";
  if (grade.startsWith("C")) return "#ff9500";
  if (grade.startsWith("D")) return "#ff6b35";
  return "#ff3b30";
}

// ─── Types ─────────────────────────────────────────────────────────

interface ScenarioResult {
  id: string;
  name: string;
  description: string;
  source?: string;
  enabledPrograms: string[];
  lastYear: YearData;
  grade: string;
  score: number;
  medianNetImpact: number;
}

// ─── Hook: run simulation for a scenario ───────────────────────────

function useScenarioResult(scenarioId: string): ScenarioResult | null {
  return useMemo(() => {
    const scenario = SCENARIOS_MAP.get(scenarioId);
    if (!scenario) return null;

    const projected = simulate(
      HISTORICAL_DATA,
      scenario.policy,
      scenario.programs,
      DEFAULT_ASSUMPTIONS,
      FIX_END_YEAR,
    );

    if (projected.length === 0) return null;
    const lastYear = projected[projected.length - 1];

    const { letter, score } = computeCompositeGrade(lastYear, scenario.programs, scenario.policy);
    const medianNetImpact = computeMedianNetImpact(scenario.programs, scenario.policy);

    return {
      id: scenario.id,
      name: scenario.name,
      description: scenario.description,
      source: scenario.source,
      enabledPrograms: scenario.programs,
      lastYear,
      grade: letter,
      score,
      medianNetImpact,
    };
  }, [scenarioId]);
}

// ─── Sub-components ────────────────────────────────────────────────

function ScenarioDropdown({
  value,
  onChange,
  side,
}: {
  value: string;
  onChange: (id: string) => void;
  side: "left" | "right";
}) {
  const fixScenarios = SCENARIOS.filter(s => !s.mode || s.mode === "both" || s.mode === "fix");

  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="w-full rounded-lg border border-[#e5e5ea] bg-white px-3 py-2 text-sm font-medium text-[#1d1d1f] shadow-sm focus:border-[#007AFF] focus:outline-none focus:ring-1 focus:ring-[#007AFF]"
      aria-label={`Select ${side} scenario`}
    >
      {fixScenarios.map((s) => (
        <option key={s.id} value={s.id}>
          {s.name}
        </option>
      ))}
    </select>
  );
}

function MetricRow({
  label,
  leftValue,
  rightValue,
  format,
  lowerIsBetter,
}: {
  label: string;
  leftValue: number;
  rightValue: number;
  format: (v: number) => string;
  lowerIsBetter: boolean;
}) {
  const leftWins = lowerIsBetter
    ? leftValue < rightValue
    : leftValue > rightValue;
  const rightWins = lowerIsBetter
    ? rightValue < leftValue
    : rightValue > leftValue;
  const tied = leftValue === rightValue;

  return (
    <div className="flex items-center gap-2 py-2">
      {/* Left value */}
      <div
        className={`flex-1 text-right rounded-md px-2 py-1 text-sm font-semibold tabular-nums ${
          leftWins && !tied
            ? "bg-[#34c75910] text-[#34c759]"
            : "text-[#1d1d1f]"
        }`}
      >
        {format(leftValue)}
      </div>

      {/* Label */}
      <div className="w-24 text-center text-xs font-medium text-[#86868b] shrink-0">
        {label}
      </div>

      {/* Right value */}
      <div
        className={`flex-1 text-left rounded-md px-2 py-1 text-sm font-semibold tabular-nums ${
          rightWins && !tied
            ? "bg-[#34c75910] text-[#34c759]"
            : "text-[#1d1d1f]"
        }`}
      >
        {format(rightValue)}
      </div>
    </div>
  );
}

function ProgramList({
  enabledPrograms,
  side,
}: {
  enabledPrograms: string[];
  side: "left" | "right";
}) {
  const enabledSet = new Set(enabledPrograms);
  const align = side === "left" ? "text-right" : "text-left";

  return (
    <div className={`space-y-1 ${align}`}>
      {PROGRAMS.map((p) => {
        const enabled = enabledSet.has(p.id);
        return (
          <div
            key={p.id}
            className={`flex items-center gap-1.5 text-xs ${
              side === "left" ? "flex-row-reverse" : "flex-row"
            } ${enabled ? "text-[#1d1d1f]" : "text-[#c7c7cc]"}`}
          >
            <span className="shrink-0 w-4 text-center">
              {enabled ? (
                <span className="text-[#34c759]">&#10003;</span>
              ) : (
                <span className="text-[#c7c7cc]">&mdash;</span>
              )}
            </span>
            <span>
              {p.icon} {p.name}
            </span>
          </div>
        );
      })}
    </div>
  );
}

function GradeBadge({ grade, score }: { grade: string; score: number }) {
  return (
    <span
      className="inline-flex items-center justify-center rounded-full px-3 py-1 text-sm font-bold text-white"
      style={{ backgroundColor: gradeColor(grade) }}
    >
      {grade} ({score})
    </span>
  );
}

// ─── Scenario Column ───────────────────────────────────────────────

function ScenarioColumn({
  result,
  side,
}: {
  result: ScenarioResult;
  side: "left" | "right";
}) {
  const align = side === "left" ? "text-right" : "text-left";

  return (
    <div className="space-y-4">
      {/* Name + grade */}
      <div className={`flex items-center gap-2 ${side === "left" ? "flex-row-reverse" : "flex-row"}`}>
        <GradeBadge grade={result.grade} score={result.score} />
        <h3 className={`text-lg font-semibold text-[#1d1d1f] ${align}`}>
          {result.name}
        </h3>
      </div>

      {/* Description */}
      <p className={`text-xs text-[#86868b] leading-relaxed line-clamp-2 ${align}`}>
        {result.description}
      </p>

      {/* Source */}
      {result.source && (
        <p className={`text-[10px] text-[#aeaeb2] italic ${align}`}>
          {result.source}
        </p>
      )}

      {/* Programs */}
      <div>
        <p className={`text-xs font-medium text-[#86868b] mb-2 ${align}`}>
          Programs
        </p>
        <ProgramList enabledPrograms={result.enabledPrograms} side={side} />
      </div>
    </div>
  );
}

// ─── Main Component ────────────────────────────────────────────────

export function CompareMode() {
  const [leftId, setLeftId] = useState("current");
  const [rightId, setRightId] = useState("trump2025");

  const leftResult = useScenarioResult(leftId);
  const rightResult = useScenarioResult(rightId);

  if (!leftResult || !rightResult) {
    return (
      <div className="rounded-xl border border-[#e5e5ea] bg-white p-8 text-center text-[#86868b]">
        Select two scenarios to compare.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="rounded-xl border border-[#e5e5ea] bg-white p-4 shadow-sm">
        <h2 className="text-center text-lg font-semibold text-[#1d1d1f] mb-1">
          Compare Scenarios
        </h2>
        <p className="text-center text-xs text-[#86868b]">
          Side-by-side projection to {FIX_END_YEAR} using CBO baseline assumptions
        </p>
      </div>

      {/* Dropdowns */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <ScenarioDropdown value={leftId} onChange={setLeftId} side="left" />
        <ScenarioDropdown value={rightId} onChange={setRightId} side="right" />
      </div>

      {/* Metrics comparison */}
      <div className="rounded-xl border border-[#e5e5ea] bg-white p-4 shadow-sm">
        <p className="text-center text-xs font-medium text-[#86868b] mb-3">
          Key Metrics in {FIX_END_YEAR}
        </p>

        {/* Scenario name badges header */}
        <div className="flex items-center gap-2 pb-3 mb-2 border-b border-[#f2f2f7]">
          <div className="flex-1 text-right">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-[#007AFF]/10 px-3 py-1 text-sm font-semibold text-[#007AFF]">
              {leftResult.name}
            </span>
          </div>
          <div className="w-24 shrink-0" />
          <div className="flex-1 text-left">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-[#ff9500]/10 px-3 py-1 text-sm font-semibold text-[#ff9500]">
              {rightResult.name}
            </span>
          </div>
        </div>

        <div className="divide-y divide-[#f2f2f7]">
          <MetricRow
            label="Debt"
            leftValue={leftResult.lastYear.debtTrillions}
            rightValue={rightResult.lastYear.debtTrillions}
            format={fmtT}
            lowerIsBetter={true}
          />
          <MetricRow
            label="Deficit"
            leftValue={Math.abs(leftResult.lastYear.deficitBillions)}
            rightValue={Math.abs(rightResult.lastYear.deficitBillions)}
            format={fmtB}
            lowerIsBetter={true}
          />
          <MetricRow
            label="Revenue"
            leftValue={leftResult.lastYear.revenueBillions}
            rightValue={rightResult.lastYear.revenueBillions}
            format={fmtB}
            lowerIsBetter={false}
          />
          <MetricRow
            label="Debt/GDP"
            leftValue={leftResult.lastYear.debtToGdpRatio}
            rightValue={rightResult.lastYear.debtToGdpRatio}
            format={fmtPct}
            lowerIsBetter={true}
          />
          <MetricRow
            label="Median Impact"
            leftValue={leftResult.medianNetImpact}
            rightValue={rightResult.medianNetImpact}
            format={(v) => `${v >= 0 ? "+" : "-"}$${Math.abs(Math.round(v)).toLocaleString()}/yr`}
            lowerIsBetter={false}
          />
        </div>
      </div>

      {/* Side-by-side details */}
      <div className="rounded-xl border border-[#e5e5ea] bg-white shadow-sm overflow-hidden">
        <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-[#f2f2f7]">
          {/* Left column */}
          <div className="p-4 border-l-4 border-l-[#007AFF]">
            <ScenarioColumn result={leftResult} side="left" />
          </div>

          {/* Right column */}
          <div className="p-4 border-r-4 border-r-[#ff9500]">
            <ScenarioColumn result={rightResult} side="right" />
          </div>
        </div>
      </div>
    </div>
  );
}
