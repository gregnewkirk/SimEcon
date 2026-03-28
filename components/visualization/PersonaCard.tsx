"use client";

import type { Persona, TaxPolicy } from "@/lib/types";
import { CURRENT_POLICY } from "@/lib/data/defaults";

interface PersonaCardProps {
  persona: Persona;
  taxPolicy: TaxPolicy;
  enabledPrograms: string[];
}

/**
 * Scale the effective-rate change based on income level.
 * Higher incomes are more affected by top-rate and cap-gains changes.
 */
function calculateNewEffectiveRate(
  persona: Persona,
  taxPolicy: TaxPolicy
): number {
  const topRateDelta = taxPolicy.topMarginalRate - CURRENT_POLICY.topMarginalRate;
  const capGainsDelta = taxPolicy.capitalGainsRate - CURRENT_POLICY.capitalGainsRate;
  const income = persona.householdIncome;

  let multiplierTop: number;
  let multiplierCg: number;

  if (income >= 10_000_000) {
    multiplierTop = 0.6;
    multiplierCg = 0.3;
  } else if (income >= 400_000) {
    multiplierTop = 0.4;
    multiplierCg = 0.1;
  } else if (income >= 150_000) {
    multiplierTop = 0.15;
    multiplierCg = 0.02;
  } else {
    multiplierTop = 0.02;
    multiplierCg = 0.0;
  }

  const effectiveDelta = topRateDelta * multiplierTop + capGainsDelta * multiplierCg;
  return Math.max(0, persona.effectiveTaxRate + effectiveDelta);
}

function formatDollars(value: number): string {
  if (Math.abs(value) >= 1_000_000) {
    return `$${(value / 1_000_000).toFixed(1)}M`;
  }
  if (Math.abs(value) >= 1_000) {
    return `$${(value / 1_000).toFixed(0)}K`;
  }
  return `$${value.toFixed(0)}`;
}

function formatRate(rate: number): string {
  return `${rate.toFixed(1)}%`;
}

export function PersonaCard({
  persona,
  taxPolicy,
  enabledPrograms,
}: PersonaCardProps) {
  const newRate = calculateNewEffectiveRate(persona, taxPolicy);
  const rateDelta = newRate - persona.effectiveTaxRate;
  const taxChangePerYear =
    (rateDelta / 100) * persona.householdIncome;

  const totalBenefits = enabledPrograms.reduce(
    (sum, progId) => sum + (persona.programBenefits[progId] ?? 0),
    0
  );

  const netImpact = totalBenefits - taxChangePerYear;
  const isPositive = netImpact >= 0;

  return (
    <div className="rounded-lg border border-[#e5e5ea] bg-white p-4">
      {/* Header */}
      <div className="mb-3 flex items-center gap-2">
        <span className="text-2xl">{persona.icon}</span>
        <div>
          <p className="text-sm font-semibold text-[#1d1d1f]">{persona.name}</p>
          <p className="text-xs text-[#86868b]">{persona.title}</p>
        </div>
      </div>

      {/* 2x2 grid */}
      <div className="grid grid-cols-2 gap-2 text-xs">
        {/* Tax Rate */}
        <div className="rounded-md bg-[#f5f5f7] p-2">
          <p className="text-[#86868b]">Tax Rate</p>
          <p className="font-mono text-[#1d1d1f]">
            {formatRate(persona.effectiveTaxRate)} &rarr; {formatRate(newRate)}
          </p>
        </div>

        {/* Tax Change */}
        <div className="rounded-md bg-[#f5f5f7] p-2">
          <p className="text-[#86868b]">Tax Change</p>
          <p
            className={`font-mono ${taxChangePerYear > 0 ? "text-[#ff3b30]" : taxChangePerYear < 0 ? "text-[#34c759]" : "text-[#86868b]"}`}
          >
            {taxChangePerYear >= 0 ? "+" : "-"}
            {formatDollars(Math.abs(taxChangePerYear))}/yr
          </p>
        </div>

        {/* Benefits */}
        <div className="rounded-md bg-[#f5f5f7] p-2">
          <p className="text-[#86868b]">Benefits</p>
          <p className="font-mono text-[#34c759]">
            +{formatDollars(totalBenefits)}/yr
          </p>
        </div>

        {/* Net Impact */}
        <div className="rounded-md bg-[#f5f5f7] p-2">
          <p className="text-[#86868b]">Net Impact</p>
          <p
            className={`font-mono font-semibold ${isPositive ? "text-[#34c759]" : "text-[#ff3b30]"}`}
          >
            {netImpact >= 0 ? "+" : "-"}
            {formatDollars(Math.abs(netImpact))}/yr
          </p>
        </div>
      </div>
    </div>
  );
}
