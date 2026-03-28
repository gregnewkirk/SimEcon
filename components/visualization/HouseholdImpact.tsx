"use client";

import { useMemo } from "react";
import type { TaxPolicy } from "@/lib/types";
import { PERSONAS } from "@/lib/data/personas";
import { CURRENT_POLICY } from "@/lib/data/defaults";

interface HouseholdImpactProps {
  taxPolicy: TaxPolicy;
  enabledPrograms: string[];
  currentPolicy?: TaxPolicy;
}

// ─── Calculation helpers ─────────────────────────────────────────────

function calculateEffectiveRateChange(
  householdIncome: number,
  effectiveTaxRate: number,
  taxPolicy: TaxPolicy,
  basePolicy: TaxPolicy
): number {
  const topRateDelta = taxPolicy.topMarginalRate - basePolicy.topMarginalRate;
  const capGainsDelta = taxPolicy.capitalGainsRate - basePolicy.capitalGainsRate;

  let multiplierTop: number;
  let multiplierCg: number;

  if (householdIncome >= 10_000_000) {
    multiplierTop = 0.6;
    multiplierCg = 0.3;
  } else if (householdIncome >= 400_000) {
    multiplierTop = 0.4;
    multiplierCg = 0.1;
  } else if (householdIncome >= 150_000) {
    multiplierTop = 0.15;
    multiplierCg = 0.02;
  } else {
    multiplierTop = 0.02;
    multiplierCg = 0.0;
  }

  const effectiveDelta = topRateDelta * multiplierTop + capGainsDelta * multiplierCg;
  const newRate = Math.max(0, effectiveTaxRate + effectiveDelta);
  return newRate - effectiveTaxRate;
}

function formatDollars(value: number): string {
  const abs = Math.abs(value);
  if (abs >= 1_000_000) return `$${(abs / 1_000_000).toFixed(1)}M`;
  if (abs >= 1_000) return `$${(abs / 1_000).toFixed(0)}K`;
  return `$${abs.toFixed(0)}`;
}

function formatIncome(value: number): string {
  if (value >= 1_000_000_000) return `$${(value / 1_000_000_000).toFixed(0)}B+`;
  if (value >= 1_000_000) return `$${(value / 1_000_000).toFixed(0)}M`;
  if (value >= 1_000) return `$${(value / 1_000).toFixed(0)}K`;
  return `$${value}`;
}

// ─── Bar width: log-scale so billionaire doesn't dwarf everyone ──────

function logScale(value: number, maxBarPct: number): number {
  if (value === 0) return 0;
  const logVal = Math.log10(Math.abs(value) + 1);
  // Max expected: log10(50M) ~ 7.7
  const maxLog = 7.7;
  return Math.min((logVal / maxLog) * maxBarPct, maxBarPct);
}

// ─── Component ───────────────────────────────────────────────────────

interface PersonaImpact {
  id: string;
  name: string;
  title: string;
  icon: string;
  income: number;
  rateDelta: number;
  taxChange: number;
  benefits: number;
  netImpact: number;
}

export function HouseholdImpact({
  taxPolicy,
  enabledPrograms,
  currentPolicy,
}: HouseholdImpactProps) {
  const basePolicy = currentPolicy ?? CURRENT_POLICY;

  const personas: PersonaImpact[] = useMemo(() => {
    return PERSONAS.map((p) => {
      const rateDelta = calculateEffectiveRateChange(
        p.householdIncome,
        p.effectiveTaxRate,
        taxPolicy,
        basePolicy
      );
      const taxChange = (rateDelta / 100) * p.householdIncome;
      const benefits = enabledPrograms.reduce(
        (sum, progId) => sum + (p.programBenefits[progId] ?? 0),
        0
      );
      const netImpact = benefits - taxChange;
      return {
        id: p.id,
        name: p.name,
        title: p.title,
        icon: p.icon,
        income: p.householdIncome,
        rateDelta,
        taxChange,
        benefits,
        netImpact,
      };
    });
  }, [taxPolicy, enabledPrograms, basePolicy]);

  const maxBarPct = 70; // max bar width %

  return (
    <div className="space-y-3">
      {personas.map((p) => {
        const isPositive = p.netImpact >= 0;
        const barWidth = logScale(p.netImpact, maxBarPct);

        return (
          <div
            key={p.id}
            className="rounded-lg border border-zinc-800 bg-card p-4"
          >
            <div className="flex items-center gap-3">
              {/* Icon */}
              <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-zinc-800 text-xl">
                {p.icon}
              </span>

              {/* Name + income */}
              <div className="min-w-0 flex-1">
                <div className="flex items-baseline gap-2">
                  <span className="text-sm font-semibold text-zinc-100">
                    {p.title}
                  </span>
                  <span className="text-xs text-zinc-500">
                    {p.name} &middot; {formatIncome(p.income)}/yr
                  </span>
                </div>

                {/* Diverging bar */}
                <div className="mt-2 flex items-center gap-1">
                  {/* Left side (negative / pays more) */}
                  <div className="flex h-5 w-1/2 justify-end">
                    {!isPositive && (
                      <div
                        className="h-full rounded-l bg-red-500/80 transition-all duration-500"
                        style={{ width: `${barWidth}%` }}
                      />
                    )}
                  </div>
                  {/* Center line */}
                  <div className="h-6 w-px bg-zinc-600" />
                  {/* Right side (positive / saves money) */}
                  <div className="flex h-5 w-1/2">
                    {isPositive && (
                      <div
                        className="h-full rounded-r bg-emerald-500/80 transition-all duration-500"
                        style={{ width: `${barWidth}%` }}
                      />
                    )}
                  </div>
                </div>

                {/* Labels under bar */}
                <div className="mt-1 flex justify-between text-[10px] text-zinc-500">
                  <span>Pays more</span>
                  <span>Saves money</span>
                </div>
              </div>

              {/* Net impact amount */}
              <div className="shrink-0 text-right">
                <p
                  className={`text-lg font-bold tabular-nums ${
                    isPositive ? "text-emerald-400" : "text-red-400"
                  }`}
                >
                  {p.netImpact >= 0 ? "+" : "-"}
                  {formatDollars(p.netImpact)}<span className="text-xs font-normal text-zinc-500">/yr</span>
                </p>
                <div className="mt-0.5 flex items-center gap-2 text-[10px] text-zinc-500">
                  {p.taxChange !== 0 && (
                    <span
                      className={
                        p.taxChange > 0 ? "text-red-400/70" : "text-emerald-400/70"
                      }
                    >
                      Tax: {p.taxChange > 0 ? "+" : "-"}{formatDollars(p.taxChange)}
                    </span>
                  )}
                  {p.benefits > 0 && (
                    <span className="text-emerald-400/70">
                      Benefits: +{formatDollars(p.benefits)}
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>
        );
      })}

      {/* Legend */}
      <div className="flex items-center justify-center gap-6 pt-1 text-[10px] text-zinc-500">
        <span className="flex items-center gap-1">
          <span className="inline-block size-2 rounded-sm bg-red-500/80" /> Pays more in taxes
        </span>
        <span className="flex items-center gap-1">
          <span className="inline-block size-2 rounded-sm bg-emerald-500/80" /> Net benefit (tax savings + programs)
        </span>
      </div>
    </div>
  );
}
