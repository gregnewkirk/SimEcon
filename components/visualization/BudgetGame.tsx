"use client";

import { useMemo } from "react";
import { PROGRAMS } from "@/lib/data/programs";
import { EXPLAINERS } from "@/lib/data/explainers";
import type { TaxPolicy, YearData } from "@/lib/types";

interface BudgetGameProps {
  taxPolicy: TaxPolicy;
  enabledPrograms: string[];
  onToggleProgram: (programId: string) => void;
  todayYours: YearData;
  todayActual: YearData;
}

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

export function BudgetGame({
  taxPolicy,
  enabledPrograms,
  onToggleProgram,
  todayYours,
  todayActual,
}: BudgetGameProps) {
  const revenue = todayYours.revenueBillions;
  const spending = todayYours.spendingBillions;
  const gdp = todayYours.gdpTrillions;
  const deficit = spending - revenue;
  const isSurplus = deficit <= 0;

  const grade = useMemo(() => getGrade(deficit, gdp), [deficit, gdp]);

  const spendingPrograms = useMemo(
    () => PROGRAMS.filter((p) => p.netCostBillions > 0),
    []
  );
  const revenuePrograms = useMemo(
    () => PROGRAMS.filter((p) => p.netCostBillions < 0),
    []
  );

  // Budget bar: ratio of revenue to total (revenue + spending)
  const total = revenue + spending;
  const revenuePct = total > 0 ? (revenue / total) * 100 : 50;
  const spendingPct = 100 - revenuePct;

  // Balance indicator position: how far off from 50/50
  // If balanced, indicator is at center. Surplus pushes green right, deficit pushes red right.
  const balanceRatio = total > 0 ? revenue / spending : 1;
  const balancePosition = Math.min(Math.max((balanceRatio - 0.5) * 100, 0), 100);

  return (
    <div className="space-y-4">
      {/* Budget Balance Bar + Grade */}
      <div className="rounded-xl border border-[#e5e5ea] bg-white p-4 shadow-sm">
        <div className="mb-3 flex items-center justify-between">
          <div>
            <h2 className="text-sm font-semibold text-[#1d1d1f]">Annual Federal Budget</h2>
            <p className="text-xs text-[#86868b]">How much the government takes in vs. spends each year</p>
          </div>
          <div className="flex items-center gap-3">
            <span
              className="text-4xl font-black transition-all duration-500"
              style={{ color: grade.color }}
            >
              {grade.letter}
            </span>
            <span className="text-xs text-[#86868b]">
              {isSurplus
                ? `Annual surplus: ${formatB(Math.abs(deficit))}/yr`
                : `Annual deficit: ${formatB(deficit)}/yr`}
            </span>
          </div>
        </div>

        {/* The bar */}
        <div className="relative h-10 w-full overflow-hidden rounded-full bg-[#f5f5f7]">
          {/* Revenue (green) from left */}
          <div
            className="absolute left-0 top-0 h-full rounded-l-full transition-all duration-500"
            style={{
              width: `${revenuePct}%`,
              backgroundColor: "#34c759",
            }}
          />
          {/* Spending (red) from right */}
          <div
            className="absolute right-0 top-0 h-full rounded-r-full transition-all duration-500"
            style={{
              width: `${spendingPct}%`,
              backgroundColor: "#ff3b30",
            }}
          />
          {/* Center line */}
          <div className="absolute left-1/2 top-0 h-full w-px -translate-x-1/2 bg-[#1d1d1f]/20" />
          {/* Labels on bar */}
          <div className="absolute inset-0 flex items-center justify-between px-3 text-xs font-semibold text-white">
            <span className="drop-shadow-sm">
              Revenue {formatB(revenue)}
            </span>
            <span className="drop-shadow-sm">
              Spending {formatB(spending)}
            </span>
          </div>
        </div>

        {/* Net result indicator */}
        <div className="mt-2 text-center">
          <span
            className="inline-block rounded-full px-3 py-0.5 text-xs font-semibold transition-all duration-500"
            style={{
              backgroundColor: isSurplus ? "#34c75920" : "#ff3b3020",
              color: isSurplus ? "#34c759" : "#ff3b30",
            }}
          >
            {isSurplus ? "SURPLUS" : "DEFICIT"}: {formatB(Math.abs(deficit))} (
            {((Math.abs(deficit) / (gdp * 1000)) * 100).toFixed(1)}% of GDP)
          </span>
        </div>
      </div>

      {/* Revenue & Spending Summary */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {/* Revenue column */}
        <div className="rounded-xl border border-[#e5e5ea] bg-white p-4 shadow-sm">
          <h3 className="mb-2 text-sm font-semibold text-[#34c759]">Revenue</h3>
          <div className="space-y-2">
            <SummaryRow
              label="Base Tax Revenue"
              value={todayActual.revenueBillions}
              maxValue={Math.max(revenue, spending)}
              color="#34c759"
            />
            {revenuePrograms
              .filter((p) => enabledPrograms.includes(p.id))
              .map((p) => (
                <SummaryRow
                  key={p.id}
                  label={`${p.icon} ${p.name}`}
                  value={Math.abs(p.netCostBillions)}
                  maxValue={Math.max(revenue, spending)}
                  color="#34c759"
                />
              ))}
          </div>
          <div className="mt-3 border-t border-[#e5e5ea] pt-2 text-sm font-semibold text-[#1d1d1f]">
            Total: {formatB(revenue)}
          </div>
        </div>

        {/* Spending column */}
        <div className="rounded-xl border border-[#e5e5ea] bg-white p-4 shadow-sm">
          <h3 className="mb-2 text-sm font-semibold text-[#ff3b30]">Spending</h3>
          <div className="space-y-2">
            <SummaryRow
              label="Baseline Spending"
              value={todayActual.spendingBillions}
              maxValue={Math.max(revenue, spending)}
              color="#ff3b30"
            />
            {spendingPrograms
              .filter((p) => enabledPrograms.includes(p.id))
              .map((p) => (
                <SummaryRow
                  key={p.id}
                  label={`${p.icon} ${p.name}`}
                  value={p.netCostBillions}
                  maxValue={Math.max(revenue, spending)}
                  color="#ff3b30"
                />
              ))}
          </div>
          <div className="mt-3 border-t border-[#e5e5ea] pt-2 text-sm font-semibold text-[#1d1d1f]">
            Total: {formatB(spending)}
          </div>
        </div>
      </div>

      {/* Program Toggle Cards — hidden on desktop where sidebar has them */}
      <div className="space-y-3 lg:hidden">
        {/* Revenue generators */}
        <div>
          <h3 className="mb-2 text-xs font-semibold uppercase tracking-wider text-[#86868b]">
            Revenue Generators
          </h3>
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3">
            {revenuePrograms.map((p) => {
              const enabled = enabledPrograms.includes(p.id);
              return (
                <ProgramCard
                  key={p.id}
                  program={p}
                  enabled={enabled}
                  type="revenue"
                  onToggle={() => onToggleProgram(p.id)}
                />
              );
            })}
          </div>
        </div>

        {/* Spending programs */}
        <div>
          <h3 className="mb-2 text-xs font-semibold uppercase tracking-wider text-[#86868b]">
            Spending Programs
          </h3>
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3">
            {spendingPrograms.map((p) => {
              const enabled = enabledPrograms.includes(p.id);
              return (
                <ProgramCard
                  key={p.id}
                  program={p}
                  enabled={enabled}
                  type="spending"
                  onToggle={() => onToggleProgram(p.id)}
                />
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ── Sub-components ── */

function SummaryRow({
  label,
  value,
  maxValue,
  color,
}: {
  label: string;
  value: number;
  maxValue: number;
  color: string;
}) {
  const pct = maxValue > 0 ? (value / maxValue) * 100 : 0;
  return (
    <div>
      <div className="flex items-center justify-between text-xs">
        <span className="text-[#1d1d1f]">{label}</span>
        <span className="font-mono text-[#86868b]">{formatB(value)}</span>
      </div>
      <div className="mt-0.5 h-1.5 w-full overflow-hidden rounded-full bg-[#f5f5f7]">
        <div
          className="h-full rounded-full transition-all duration-500"
          style={{ width: `${Math.min(pct, 100)}%`, backgroundColor: color }}
        />
      </div>
    </div>
  );
}

interface ProgramCardProps {
  program: (typeof PROGRAMS)[number];
  enabled: boolean;
  type: "revenue" | "spending";
  onToggle: () => void;
}

function ProgramCard({ program, enabled, type, onToggle }: ProgramCardProps) {
  const isRevenue = type === "revenue";
  const accentColor = isRevenue ? "#34c759" : "#ff3b30";

  return (
    <button
      type="button"
      onClick={onToggle}
      className="flex items-center gap-3 rounded-xl border bg-white p-3 text-left shadow-sm transition-all duration-300"
      style={{
        borderColor: enabled ? accentColor : "#e5e5ea",
        boxShadow: enabled
          ? `0 0 0 1px ${accentColor}, 0 0 12px ${accentColor}30`
          : undefined,
      }}
    >
      <span className="text-xl">{program.icon}</span>
      <div className="min-w-0 flex-1">
        <div className="truncate text-xs font-semibold text-[#1d1d1f]">
          {program.name}
        </div>
        {EXPLAINERS[program.id] && (
          <div className="text-[11px] text-[#86868b] line-clamp-2 leading-tight mt-0.5">
            {EXPLAINERS[program.id].simple}
          </div>
        )}
        <div
          className="text-xs font-mono transition-colors duration-300 mt-0.5"
          style={{ color: enabled ? accentColor : "#86868b" }}
        >
          {isRevenue ? "+" : ""}
          {formatB(Math.abs(program.netCostBillions))}
          {isRevenue ? "/yr" : "/yr"}
        </div>
      </div>
      {/* Toggle indicator */}
      <div
        className="flex h-6 w-10 shrink-0 items-center rounded-full p-0.5 transition-all duration-300"
        style={{
          backgroundColor: enabled ? accentColor : "#e5e5ea",
        }}
      >
        <div
          className="size-5 rounded-full bg-white shadow-sm transition-all duration-300"
          style={{
            transform: enabled ? "translateX(16px)" : "translateX(0px)",
          }}
        />
      </div>
    </button>
  );
}
