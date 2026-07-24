import type { LeverConfig } from "./levers/types";

/**
 * One-click preset plans for the Fix-this-mess sandbox. Each applies a partial config on
 * top of current law so you can load a familiar plan and see what it does, then compare.
 * These are illustrative interpretations of widely discussed plans, not official scores.
 */
export interface Scenario {
  id: string;
  label: string;
  blurb: string;
  config: LeverConfig;
}

export const SCENARIOS: Scenario[] = [
  {
    id: "nordic",
    label: "Nordic model",
    blurb: "High broad-based taxes funding universal services, the Scandinavian bargain.",
    config: {
      topRate: 55,
      corpRate: 22,
      capGains: 30,
      removeSsCap: true,
      vat5: 5,
      healthcare: 100,
      child_care: true,
      paid_leave: true,
      college: true,
      prek: true,
      school_meals: true,
    },
  },
  {
    id: "eisenhower",
    label: "Eisenhower era (1950s)",
    blurb: "The postwar high-rate structure: a 91% top bracket and a 52% corporate rate.",
    config: {
      topRate: 91,
      b6: 50,
      corpRate: 52,
      capGains: 25,
      estateRate: 77,
      infrastructure: true,
    },
  },
  {
    id: "trump2025",
    label: "Trump 2025",
    blurb: "Extend the 2017 cuts, drop the corporate rate to 15%, repeal the estate tax.",
    config: {
      topRate: 37,
      corpRate: 15,
      capGains: 20,
      estateRate: 0,
    },
  },
  {
    id: "project2025",
    label: "Project 2025",
    blurb: "Mandate for Leadership's tax plan: a two-bracket 15%/30% income tax, 18% corporate rate, 15% capital gains, tariffs up. Illustrative mapping of the Heritage blueprint.",
    config: {
      topRate: 30,
      b6: 30,
      corpRate: 18,
      capGains: 15,
      estateRate: 0,
      tariffs: true,
    },
  },
  {
    id: "dsa2026",
    label: "DSA 2026 program",
    blurb: "The democratic-socialist program (program.dsausa.org): Medicare for All, a Green New Deal, social housing, a job guarantee — funded by steep taxes on wealth and a smaller Pentagon. Illustrative mapping.",
    config: {
      topRate: 70,
      b6: 45,
      corpRate: 35,
      capGains: 40,
      estateRate: 77,
      removeSsCap: true,
      wealth_tax: 3,
      billionaire_min_tax: true,
      financial_tx_tax: true,
      collateral_tax: true,
      carried_interest: true,
      irs_enforcement: true,
      end_fossil_subsidies: true,
      defense_cut: 30,
      healthcare: 100,
      college: true,
      child_care: true,
      paid_leave: true,
      prek: true,
      school_meals: true,
      housing: true,
      job_guarantee: true,
      green_jobs: true,
      public_internet: true,
    },
  },
  {
    id: "libertarian",
    label: "Libertarian: minimal state",
    blurb: "Cut taxes and the state alike: 20% top rate, 12% corporate, half the Pentagon, no subsidies, no new programs. Illustrative mapping of the small-government platform.",
    config: {
      topRate: 20,
      b6: 20,
      corpRate: 12,
      capGains: 10,
      estateRate: 0,
      defense_cut: 50,
      end_fossil_subsidies: true,
    },
  },
  {
    id: "harris2024",
    label: "Harris 2024",
    blurb: "28% corporate rate, billionaire minimum tax, expanded Child Tax Credit, housing.",
    config: {
      topRate: 39.6,
      corpRate: 28,
      capGains: 28,
      billionaire_min_tax: true,
      buyback_tax: true,
      child_tax_credit: true,
      child_care: true,
      housing: true,
    },
  },
  {
    id: "bernie",
    label: "Bernie / Progressive",
    blurb: "Tax wealth hard, fund Medicare for All, college, care, and a job guarantee.",
    config: {
      topRate: 52,
      corpRate: 35,
      capGains: 37,
      estateRate: 65,
      removeSsCap: true,
      wealth_tax: 2,
      billionaire_min_tax: true,
      healthcare: 100,
      college: true,
      child_care: true,
      paid_leave: true,
      job_guarantee: true,
      green_jobs: true,
    },
  },
  {
    id: "balance",
    label: "Balance the budget",
    blurb: "A no-new-spending basket aimed at closing the deficit. Can you do it kinder?",
    config: {
      vat5: 5,
      cap_employer_health: 100,
      removeSsCap: true,
      defense_cut: 10,
      carbon_tax: true,
      irs_enforcement: true,
      end_fossil_subsidies: true,
      medicare_negotiation: true,
      billionaire_min_tax: true,
      buyback_tax: true,
    },
  },
];
