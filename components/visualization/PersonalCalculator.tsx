"use client";

import { useState, useMemo } from "react";
import type { TaxPolicy } from "@/lib/types";
import { CURRENT_POLICY } from "@/lib/data/defaults";
import { PROGRAMS_MAP } from "@/lib/data/programs";
import { WHAT_IF_EVENTS_MAP } from "@/lib/data/what-if-events";

interface PersonalCalculatorProps {
  taxPolicy: TaxPolicy;
  enabledPrograms: string[];
  whatIfEventIds: string[];
}

const US_POPULATION = 330_000_000;
const WORKING_YEARS = 40;

const INCOME_PRESETS = [
  { label: "$30K", value: 30_000 },
  { label: "$50K", value: 50_000 },
  { label: "$75K", value: 75_000 },
  { label: "$100K", value: 100_000 },
  { label: "$150K", value: 150_000 },
  { label: "$200K", value: 200_000 },
  { label: "$350K", value: 350_000 },
  { label: "$500K", value: 500_000 },
  { label: "$800K+", value: 800_000 },
];

function calculateTaxForBrackets(income: number, brackets: TaxPolicy["brackets"]): number {
  let tax = 0;
  let remaining = income;
  for (const bracket of brackets) {
    if (remaining <= 0) break;
    const taxableInBracket = Math.min(
      remaining,
      bracket.maxIncome === Infinity ? remaining : bracket.maxIncome - bracket.minIncome
    );
    tax += taxableInBracket * (bracket.rate / 100);
    remaining -= taxableInBracket;
  }
  return tax;
}

/** Estimate the household composition from income for benefit calculations */
function getHouseholdFromIncome(income: number): { adults: number; kids: number; students: number } {
  if (income <= 50_000) return { adults: 1, kids: 0, students: 0 };
  if (income <= 100_000) return { adults: 2, kids: 1, students: 0 };
  if (income <= 200_000) return { adults: 2, kids: 1, students: 0 };
  return { adults: 2, kids: 2, students: 1 };
}

interface BenefitLine {
  programId: string;
  label: string;
  annualValue: number;
  description: string;
}

function estimateBenefits(
  income: number,
  enabledPrograms: string[]
): BenefitLine[] {
  const hh = getHouseholdFromIncome(income);
  const lines: BenefitLine[] = [];

  for (const progId of enabledPrograms) {
    const prog = PROGRAMS_MAP.get(progId);
    if (!prog) continue;
    // Only show spending programs (positive benefits to household)
    if (prog.netCostBillions < 0) continue;

    let value = 0;
    let desc = "";

    switch (progId) {
      case "healthcare":
        value = hh.adults * 7500;
        desc = `~$7,500/adult avg premium saved`;
        break;
      case "college":
        value = hh.students * 12000;
        desc = hh.students > 0 ? `~$12,000/student/yr` : "No students in household";
        break;
      case "prek":
        value = hh.kids > 0 ? 10000 : 0;
        desc = hh.kids > 0 ? "~$10,000/yr per child in pre-K" : "No young children";
        break;
      case "housing":
        if (income < 75000) {
          value = 6000;
          desc = "~$6,000/yr rental assistance";
        } else if (income < 150000) {
          value = 3000;
          desc = "~$3,000/yr housing support";
        } else {
          value = 0;
          desc = "Income above threshold";
        }
        break;
      case "ubi":
        value = hh.adults * 12000;
        desc = `$12,000/adult/yr`;
        break;
      case "infrastructure":
        value = 0;
        desc = "Better roads & broadband";
        break;
      case "ss_cap":
        value = 0;
        desc = "Social Security stays solvent";
        break;
      case "irs_enforcement":
        value = 0;
        desc = "Tax cheats pay their share";
        break;
      case "defense_cut":
        value = 0;
        desc = "Reduced military spending";
        break;
      case "carbon_tax":
        value = 0;
        desc = "Cleaner air & climate action";
        break;
      case "financial_tx_tax":
        value = 0;
        desc = "Wall Street pays more";
        break;
      case "medicare_negotiation":
        value = income < 100000 ? 500 : 0;
        desc = income < 100000 ? "Lower drug prices" : "Lower drug prices";
        break;
      case "wealth_tax":
        value = 0;
        desc = "Billionaires pay fair share";
        break;
      case "sports_betting_tax":
        value = 0;
        desc = "Gambling funds public services";
        break;
      case "robot_tax":
        value = 0;
        desc = "Worker retraining funded";
        break;
      case "sugar_tax":
        value = 0;
        desc = "Healthier food incentives";
        break;
      case "land_value_tax":
        value = 0;
        desc = "More affordable housing";
        break;
      case "baby_bonds":
        value = hh.kids > 0 ? 1000 : 0;
        desc = hh.kids > 0 ? "$1K/child at birth" : "Wealth gap closes";
        break;
      case "mental_health":
        value = hh.adults * 2000;
        desc = "Free therapy access";
        break;
      case "public_internet":
        value = income < 100000 ? 1200 : 0;
        desc = income < 100000 ? "~$100/mo broadband" : "Faster internet";
        break;
      case "green_jobs":
        value = 0;
        desc = "Clean energy jobs";
        break;
      case "rd_moonshot":
        value = 0;
        desc = "Next-gen innovation";
        break;
      default:
        value = 0;
        desc = prog.netCostBillions < 0 ? "Deficit reduction" : "Public investment";
        break;
    }

    lines.push({
      programId: progId,
      label: prog.name,
      annualValue: value,
      description: desc,
    });
  }

  return lines;
}

function fmtDollars(value: number): string {
  const abs = Math.abs(value);
  if (abs >= 1_000_000) return `$${(abs / 1_000_000).toFixed(1)}M`;
  if (abs >= 1_000) return `$${Math.round(abs / 1_000).toLocaleString()}K`;
  return `$${Math.round(abs).toLocaleString()}`;
}

function fmtDollarsExact(value: number): string {
  return `$${Math.round(Math.abs(value)).toLocaleString()}`;
}

export function PersonalCalculator({
  taxPolicy,
  enabledPrograms,
  whatIfEventIds,
}: PersonalCalculatorProps) {
  const [income, setIncome] = useState(75_000);

  const calc = useMemo(() => {
    // 1. Opportunity cost from what-if events
    let totalWhatIfCostPerPerson = 0;
    const whatIfBreakdown: { label: string; annualPerPerson: number }[] = [];

    for (const eventId of whatIfEventIds) {
      const event = WHAT_IF_EVENTS_MAP.get(eventId);
      if (!event || !event.totalCostTrillions) continue;
      const perPerson = (event.totalCostTrillions * 1e12) / US_POPULATION;
      totalWhatIfCostPerPerson += perPerson;
      whatIfBreakdown.push({
        label: event.name,
        annualPerPerson: perPerson / WORKING_YEARS,
      });
    }

    const lifetimeOpportunityCost = totalWhatIfCostPerPerson;
    const annualOpportunityCost = totalWhatIfCostPerPerson / WORKING_YEARS;

    // 2. Tax change under current policy
    const taxDefault = calculateTaxForBrackets(income, CURRENT_POLICY.brackets);
    const taxUser = calculateTaxForBrackets(income, taxPolicy.brackets);
    const annualTaxChange = taxUser - taxDefault;

    // 3. Benefits from enabled programs
    const benefits = estimateBenefits(income, enabledPrograms);
    const annualBenefits = benefits.reduce((s, b) => s + b.annualValue, 0);

    // 4. Net annual and lifetime
    const annualNet = annualBenefits - annualTaxChange;
    const lifetimeNet = annualNet * WORKING_YEARS;

    return {
      lifetimeOpportunityCost,
      annualOpportunityCost,
      whatIfBreakdown,
      annualTaxChange,
      benefits,
      annualBenefits,
      annualNet,
      lifetimeNet,
    };
  }, [income, taxPolicy, enabledPrograms, whatIfEventIds]);

  const hasWhatIfs = whatIfEventIds.length > 0;
  const hasBenefits = calc.benefits.length > 0;

  return (
    <div className="rounded-xl border border-[#e5e5ea] bg-white shadow-sm p-5">
      {/* Header */}
      <h2 className="text-base font-bold text-[#1d1d1f] mb-1">
        What These Decisions Cost YOU
      </h2>
      <p className="text-xs text-[#86868b] mb-4">
        See how policy choices affect your household over a working lifetime
      </p>

      {/* Income selector */}
      <div className="mb-5">
        <label htmlFor="income-select" className="block text-xs font-medium text-[#86868b] mb-1.5">
          Your household income
        </label>
        <select
          id="income-select"
          value={income}
          onChange={(e) => setIncome(Number(e.target.value))}
          className="w-full rounded-lg border border-[#e5e5ea] bg-white px-3 py-2 text-sm text-[#1d1d1f] shadow-sm focus:border-[#007AFF] focus:outline-none focus:ring-1 focus:ring-[#007AFF]"
        >
          {INCOME_PRESETS.map((p) => (
            <option key={p.value} value={p.value}>
              {p.label} / year
            </option>
          ))}
        </select>
      </div>

      {/* Opportunity Cost Section — only if what-if events are toggled */}
      {hasWhatIfs && (
        <div className="mb-5">
          <p className="text-xs font-semibold uppercase tracking-wider text-[#86868b] mb-2">
            Over your working life ({WORKING_YEARS} years)
          </p>
          <div className="rounded-lg border border-[#e5e5ea] bg-[#fafafa] p-4 space-y-3">
            {calc.whatIfBreakdown.map((item) => (
              <div key={item.label} className="flex items-start gap-2">
                <span className="text-sm mt-0.5">
                  {item.label.includes("War") || item.label.includes("Afghanistan") ? "\u2694\uFE0F" : "\uD83D\uDCB0"}
                </span>
                <div className="flex-1">
                  <p className="text-sm text-[#1d1d1f]">
                    {item.label} cost you:
                  </p>
                  <p className="text-sm font-bold text-[#ff3b30]">
                    {fmtDollarsExact(item.annualPerPerson * WORKING_YEARS)} in lost services
                  </p>
                </div>
              </div>
            ))}
            {/* Total */}
            <div className="border-t border-[#e5e5ea] pt-3">
              <div className="flex items-center gap-2">
                <span className="text-sm">{"\uD83D\uDCCA"}</span>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-[#86868b]">
                    Total lifetime opportunity cost
                  </p>
                  <p className="text-2xl font-bold text-[#ff3b30]">
                    {fmtDollarsExact(calc.lifetimeOpportunityCost)}
                  </p>
                  <p className="text-xs text-[#86868b] mt-0.5">
                    That&apos;s {fmtDollarsExact(calc.annualOpportunityCost)}/year you could have had in healthcare, education, or tax relief.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Benefits Section — what you get under current policy */}
      {hasBenefits && (
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-[#86868b] mb-2">
            What you get under your current policy
          </p>
          <div className="rounded-lg border border-[#e5e5ea] bg-[#fafafa] p-4 space-y-2">
            {/* Per-program benefit lines */}
            {calc.benefits.map((b) => (
              <div key={b.programId} className="flex items-center justify-between text-sm">
                <span className="text-[#1d1d1f]">
                  {b.annualValue > 0 ? "\u2713" : "\u2717"} {b.label}
                </span>
                <span
                  className="font-medium tabular-nums"
                  style={{ color: b.annualValue > 0 ? "#34c759" : "#86868b" }}
                >
                  {b.annualValue > 0 ? `+${fmtDollars(b.annualValue)}/yr` : b.description}
                </span>
              </div>
            ))}

            {/* Tax change line */}
            <div className="flex items-center justify-between text-sm">
              <span className="text-[#1d1d1f]">
                {calc.annualTaxChange <= 0 ? "\u2713" : "\u2717"} Tax change
              </span>
              <span
                className="font-medium tabular-nums"
                style={{ color: calc.annualTaxChange <= 0 ? "#34c759" : "#ff3b30" }}
              >
                {calc.annualTaxChange >= 0 ? "-" : "+"}{fmtDollars(calc.annualTaxChange)}/yr
              </span>
            </div>

            {/* Divider + Net */}
            <div className="border-t border-[#e5e5ea] pt-2 mt-1">
              <div className="flex items-center justify-between">
                <span className="text-sm font-semibold text-[#1d1d1f]">NET</span>
                <span
                  className="text-lg font-bold tabular-nums"
                  style={{ color: calc.annualNet >= 0 ? "#34c759" : "#ff3b30" }}
                >
                  {calc.annualNet >= 0 ? "+" : "-"}{fmtDollars(calc.annualNet)}/yr
                  <span className="text-sm font-medium ml-2">
                    ({income > 0 ? ((Math.abs(calc.annualNet) / income) * 100).toFixed(1) : "0"}% {calc.annualNet >= 0 ? "raise" : "cut"})
                  </span>
                </span>
              </div>
              <p className="text-xs text-[#86868b] text-right mt-0.5">
                {calc.lifetimeNet >= 0 ? "+" : "-"}{fmtDollarsExact(calc.lifetimeNet)} over 40 years &middot; effective income: {fmtDollarsExact(income + calc.annualNet)}/yr
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Empty state */}
      {!hasWhatIfs && !hasBenefits && (
        <div className="rounded-lg border border-[#e5e5ea] bg-[#fafafa] p-6 text-center">
          <p className="text-sm text-[#86868b]">
            Toggle programs or what-if events in the sidebar to see your personal impact.
          </p>
        </div>
      )}
    </div>
  );
}
