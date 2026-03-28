"use client";

import { useState, useMemo, useCallback } from "react";
import type { TaxPolicy } from "@/lib/types";
import { CURRENT_POLICY } from "@/lib/data/defaults";
import { PROGRAMS_MAP } from "@/lib/data/programs";

// ─── Household definitions ────────────────────────────────────────────

interface Household {
  id: string;
  label: string;
  income: number;
  icon: string;
  adults: number;
  kids: number;
  students: number;
}

const HOUSEHOLDS: Household[] = [
  { id: "nurse", label: "Single Nurse", income: 55000, icon: "\u{1F3E5}", adults: 1, kids: 0, students: 0 },
  { id: "teacher", label: "Teacher Family", income: 85000, icon: "\u{1F4DA}", adults: 2, kids: 2, students: 0 },
  { id: "smallbiz", label: "Small Business Owner", income: 150000, icon: "\u{1F3EA}", adults: 2, kids: 1, students: 0 },
  { id: "engineer", label: "Software Engineer", income: 200000, icon: "\u{1F4BB}", adults: 2, kids: 1, students: 0 },
  { id: "doctor", label: "Doctor / Lawyer", income: 350000, icon: "\u{2695}\u{FE0F}", adults: 2, kids: 2, students: 1 },
  { id: "executive", label: "Executive", income: 500000, icon: "\u{1F3E2}", adults: 2, kids: 2, students: 1 },
  { id: "top1", label: "Top 1%", income: 800000, icon: "\u{1F48E}", adults: 2, kids: 2, students: 1 },
];

// ─── Tax calculation ──────────────────────────────────────────────────

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

// ─── Benefits estimation per household ────────────────────────────────

interface BenefitLine {
  programId: string;
  programName: string;
  annualValue: number;
  description: string;
}

function estimateBenefits(
  household: Household,
  enabledPrograms: string[]
): BenefitLine[] {
  const lines: BenefitLine[] = [];

  for (const progId of enabledPrograms) {
    const prog = PROGRAMS_MAP.get(progId);
    if (!prog) continue;

    let value = 0;
    let desc = "";

    switch (progId) {
      case "healthcare":
        value = household.adults * 7500;
        desc = `~$7,500/adult avg premium saved`;
        break;
      case "college":
        value = household.students * 12000;
        desc = household.students > 0
          ? `~$12,000/student/yr`
          : "No students in household";
        break;
      case "prek":
        // Assume 1 child under 5 for families with kids
        value = household.kids > 0 ? 10000 : 0;
        desc = household.kids > 0
          ? "~$10,000/yr per child in pre-K"
          : "No young children";
        break;
      case "housing":
        if (household.income < 75000) {
          value = 6000;
          desc = "~$6,000/yr rental assistance";
        } else if (household.income < 150000) {
          value = 3000;
          desc = "~$3,000/yr housing support";
        } else {
          value = 0;
          desc = "Income above threshold";
        }
        break;
      case "ubi":
        value = household.adults * 12000;
        desc = `$12,000/adult/yr`;
        break;
      case "infrastructure":
        value = 0;
        desc = "Indirect benefits (jobs, infrastructure)";
        break;
    }

    lines.push({
      programId: progId,
      programName: prog.name,
      annualValue: value,
      description: desc,
    });
  }

  return lines;
}

// ─── Format helpers ───────────────────────────────────────────────────

function fmtDollars(value: number): string {
  const abs = Math.abs(value);
  if (abs >= 1_000_000) return `$${(abs / 1_000_000).toFixed(1)}M`;
  if (abs >= 1_000) return `$${(abs / 1_000).toFixed(1)}K`;
  return `$${abs.toFixed(0)}`;
}

function fmtIncome(value: number): string {
  if (value >= 1_000_000) return `$${(value / 1_000_000).toFixed(0)}M`;
  if (value >= 1_000) return `$${(value / 1_000).toFixed(0)}K`;
  return `$${value}`;
}

// ─── Component types ──────────────────────────────────────────────────

interface HouseholdImpactData {
  household: Household;
  taxChange: number;
  benefits: BenefitLine[];
  totalBenefits: number;
  netImpact: number;
}

interface KitchenTableViewProps {
  taxPolicy: TaxPolicy;
  enabledPrograms: string[];
}

// ─── Main component ───────────────────────────────────────────────────

export function KitchenTableView({
  taxPolicy,
  enabledPrograms,
}: KitchenTableViewProps) {
  const [selectedId, setSelectedId] = useState<string>("teacher");
  const [comparedIds, setComparedIds] = useState<string[]>([]);

  // Calculate impacts for all households
  const impacts = useMemo(() => {
    const map = new Map<string, HouseholdImpactData>();
    for (const h of HOUSEHOLDS) {
      const taxDefault = calculateTaxForBrackets(h.income, CURRENT_POLICY.brackets);
      const taxUser = calculateTaxForBrackets(h.income, taxPolicy.brackets);
      const taxChange = taxUser - taxDefault;
      const benefits = estimateBenefits(h, enabledPrograms);
      const totalBenefits = benefits.reduce((s, b) => s + b.annualValue, 0);
      map.set(h.id, {
        household: h,
        taxChange,
        benefits,
        totalBenefits,
        netImpact: totalBenefits - taxChange,
      });
    }
    return map;
  }, [taxPolicy, enabledPrograms]);

  const selected = impacts.get(selectedId);

  const addToComparison = useCallback(() => {
    setComparedIds((prev) => {
      if (prev.includes(selectedId) || prev.length >= 4) return prev;
      return [...prev, selectedId];
    });
  }, [selectedId]);

  const removeFromComparison = useCallback((id: string) => {
    setComparedIds((prev) => prev.filter((cid) => cid !== id));
  }, []);

  return (
    <div className="space-y-4">
      {/* Household selector */}
      <div className="flex flex-wrap gap-2">
        {HOUSEHOLDS.map((h) => {
          const isActive = h.id === selectedId;
          return (
            <button
              key={h.id}
              onClick={() => setSelectedId(h.id)}
              className={`flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium transition-all ${
                isActive
                  ? "border-[#4ecca3]/50 bg-[#4ecca3]/10 text-[#4ecca3]"
                  : "border-zinc-700/50 bg-zinc-900/50 text-zinc-400 hover:border-zinc-600 hover:text-zinc-200"
              }`}
            >
              <span>{h.icon}</span>
              <span>{h.label}</span>
              <span className="text-zinc-500">({fmtIncome(h.income)})</span>
            </button>
          );
        })}
      </div>

      {/* Selected household detail card */}
      {selected && (
        <div className="rounded-xl border border-zinc-800 bg-zinc-900/30 p-5">
          {/* Header */}
          <div className="flex items-center gap-3 mb-4">
            <span className="flex size-12 items-center justify-center rounded-full bg-zinc-800 text-2xl">
              {selected.household.icon}
            </span>
            <div>
              <h3 className="text-lg font-bold text-zinc-100">{selected.household.label}</h3>
              <p className="text-xs text-zinc-500">
                Household income: {fmtIncome(selected.household.income)}/yr
                {" \u00B7 "}
                {selected.household.adults} adult{selected.household.adults > 1 ? "s" : ""}
                {selected.household.kids > 0 && `, ${selected.household.kids} kid${selected.household.kids > 1 ? "s" : ""}`}
                {selected.household.students > 0 && `, ${selected.household.students} student${selected.household.students > 1 ? "s" : ""}`}
              </p>
            </div>
          </div>

          {/* Tax impact */}
          <div className="mb-3 rounded-lg border border-zinc-700/50 bg-zinc-900/40 p-3">
            <p className="text-xs text-zinc-500 uppercase tracking-wider mb-1">Tax Impact</p>
            <p
              className="text-lg font-bold tabular-nums"
              style={{ color: selected.taxChange <= 0 ? "#4ecca3" : "#e94560" }}
            >
              Your taxes change by{" "}
              {selected.taxChange >= 0 ? "+" : "-"}{fmtDollars(selected.taxChange)}/yr
            </p>
          </div>

          {/* Benefits gained */}
          {selected.benefits.length > 0 && (
            <div className="mb-3 rounded-lg border border-zinc-700/50 bg-zinc-900/40 p-3">
              <p className="text-xs text-zinc-500 uppercase tracking-wider mb-2">Benefits Gained</p>
              <div className="space-y-1.5">
                {selected.benefits.map((b) => (
                  <div key={b.programId} className="flex items-center justify-between">
                    <span className="text-sm text-zinc-300">{b.programName}</span>
                    <div className="text-right">
                      {b.annualValue > 0 ? (
                        <span className="text-sm font-medium text-emerald-400">
                          Save ~{fmtDollars(b.annualValue)}/yr
                        </span>
                      ) : (
                        <span className="text-xs text-zinc-500">{b.description}</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Net impact */}
          <div className="rounded-lg border-2 p-4 text-center" style={{
            borderColor: selected.netImpact >= 0 ? "#4ecca3" : "#e94560",
            backgroundColor: selected.netImpact >= 0 ? "rgba(78,204,163,0.05)" : "rgba(233,69,96,0.05)",
          }}>
            <p className="text-xs text-zinc-400 mb-1">Net Impact</p>
            <p
              className="text-2xl font-extrabold tabular-nums"
              style={{ color: selected.netImpact >= 0 ? "#4ecca3" : "#e94560" }}
            >
              {selected.netImpact >= 0 ? "+" : "-"}{fmtDollars(selected.netImpact)}/yr
            </p>
            <p className="mt-1 text-xs text-zinc-500">
              {selected.netImpact >= 0
                ? "You\u2019re better off under this policy"
                : "You pay more under this policy"}
            </p>
          </div>

          {/* Visual bar: tax increase vs benefits */}
          {(selected.taxChange !== 0 || selected.totalBenefits > 0) && (
            <div className="mt-3">
              <div className="flex gap-1 h-4 rounded-full overflow-hidden bg-zinc-800">
                {selected.taxChange > 0 && (
                  <div
                    className="h-full bg-red-500/80 rounded-l-full"
                    style={{
                      width: `${Math.min(
                        (selected.taxChange / (selected.taxChange + selected.totalBenefits || 1)) * 100,
                        100
                      )}%`,
                    }}
                  />
                )}
                {selected.totalBenefits > 0 && (
                  <div
                    className="h-full bg-emerald-500/80 rounded-r-full"
                    style={{
                      width: `${Math.min(
                        (selected.totalBenefits / (Math.max(selected.taxChange, 0) + selected.totalBenefits || 1)) * 100,
                        100
                      )}%`,
                    }}
                  />
                )}
              </div>
              <div className="flex justify-between mt-1 text-[10px] text-zinc-500">
                <span>Tax increase</span>
                <span>Benefits gained</span>
              </div>
            </div>
          )}

          {/* Add to comparison button */}
          <button
            onClick={addToComparison}
            disabled={comparedIds.includes(selectedId) || comparedIds.length >= 4}
            className="mt-4 w-full rounded-lg border border-zinc-700/50 bg-zinc-800/50 py-2 text-sm text-zinc-300 transition-all hover:border-[#4ecca3]/50 hover:text-[#4ecca3] disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {comparedIds.includes(selectedId)
              ? "Already in comparison"
              : comparedIds.length >= 4
                ? "Max 4 households"
                : "+ Add to comparison"}
          </button>
        </div>
      )}

      {/* Comparison table */}
      {comparedIds.length > 0 && (
        <div className="rounded-xl border border-zinc-800 bg-zinc-900/30 overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-zinc-800">
                <th className="p-3 text-left text-xs text-zinc-500 font-medium" />
                {comparedIds.map((id) => {
                  const imp = impacts.get(id);
                  if (!imp) return null;
                  return (
                    <th key={id} className="p-3 text-center">
                      <div className="flex flex-col items-center gap-1">
                        <span className="text-lg">{imp.household.icon}</span>
                        <span className="text-xs font-medium text-zinc-200">{imp.household.label}</span>
                        <button
                          onClick={() => removeFromComparison(id)}
                          className="text-[10px] text-zinc-500 hover:text-red-400 transition-colors"
                        >
                          Remove
                        </button>
                      </div>
                    </th>
                  );
                })}
              </tr>
            </thead>
            <tbody className="text-xs">
              <ComparisonRow label="Income" ids={comparedIds} impacts={impacts} render={(imp) =>
                fmtIncome(imp.household.income) + "/yr"
              } />
              <ComparisonRow label="Tax Change" ids={comparedIds} impacts={impacts} render={(imp) => (
                <span style={{ color: imp.taxChange <= 0 ? "#4ecca3" : "#e94560" }}>
                  {imp.taxChange >= 0 ? "+" : "-"}{fmtDollars(imp.taxChange)}
                </span>
              )} />
              <ComparisonRow label="Healthcare Savings" ids={comparedIds} impacts={impacts} render={(imp) => {
                const hb = imp.benefits.find((b) => b.programId === "healthcare");
                return hb && hb.annualValue > 0
                  ? <span className="text-emerald-400">+{fmtDollars(hb.annualValue)}</span>
                  : <span className="text-zinc-500">\u2014</span>;
              }} />
              <ComparisonRow label="College Savings" ids={comparedIds} impacts={impacts} render={(imp) => {
                const cb = imp.benefits.find((b) => b.programId === "college");
                return cb && cb.annualValue > 0
                  ? <span className="text-emerald-400">+{fmtDollars(cb.annualValue)}</span>
                  : <span className="text-zinc-500">\u2014</span>;
              }} />
              <ComparisonRow label="Pre-K Savings" ids={comparedIds} impacts={impacts} render={(imp) => {
                const pb = imp.benefits.find((b) => b.programId === "prek");
                return pb && pb.annualValue > 0
                  ? <span className="text-emerald-400">+{fmtDollars(pb.annualValue)}</span>
                  : <span className="text-zinc-500">\u2014</span>;
              }} />
              <ComparisonRow label="UBI" ids={comparedIds} impacts={impacts} render={(imp) => {
                const ub = imp.benefits.find((b) => b.programId === "ubi");
                return ub && ub.annualValue > 0
                  ? <span className="text-emerald-400">+{fmtDollars(ub.annualValue)}</span>
                  : <span className="text-zinc-500">\u2014</span>;
              }} />
              <tr className="border-t border-zinc-700 font-bold">
                <td className="p-3 text-zinc-300">Net Impact</td>
                {comparedIds.map((id) => {
                  const imp = impacts.get(id);
                  if (!imp) return <td key={id} />;
                  return (
                    <td key={id} className="p-3 text-center">
                      <span
                        className="text-base tabular-nums"
                        style={{ color: imp.netImpact >= 0 ? "#4ecca3" : "#e94560" }}
                      >
                        {imp.netImpact >= 0 ? "+" : "-"}{fmtDollars(imp.netImpact)}/yr
                      </span>
                    </td>
                  );
                })}
              </tr>
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

// ─── Comparison table row helper ──────────────────────────────────────

function ComparisonRow({
  label,
  ids,
  impacts,
  render,
}: {
  label: string;
  ids: string[];
  impacts: Map<string, HouseholdImpactData>;
  render: (imp: HouseholdImpactData) => React.ReactNode;
}) {
  return (
    <tr className="border-b border-zinc-800/50">
      <td className="p-3 text-zinc-400">{label}</td>
      {ids.map((id) => {
        const imp = impacts.get(id);
        if (!imp) return <td key={id} />;
        return (
          <td key={id} className="p-3 text-center text-zinc-200">
            {render(imp)}
          </td>
        );
      })}
    </tr>
  );
}
