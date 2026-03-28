import type { Scenario } from "../types";
import { DEFAULT_BRACKETS } from "./defaults";

/** Helper: create brackets with a custom top bracket rate, keeping lower brackets at defaults. */
function bracketsWithTopRate(topRate: number) {
  return DEFAULT_BRACKETS.map((b, i) =>
    i === DEFAULT_BRACKETS.length - 1
      ? { ...b, rate: topRate }
      : { ...b }
  );
}

/** Helper: create brackets scaled proportionally from default toward a target top rate.
 *  Used for extreme scenarios like Eisenhower where ALL brackets shift up. */
function bracketsScaled(topRate: number) {
  const defaultTop = DEFAULT_BRACKETS[DEFAULT_BRACKETS.length - 1].defaultRate;
  const ratio = topRate / defaultTop;
  return DEFAULT_BRACKETS.map((b) => ({
    ...b,
    rate: Math.min(Math.round(b.defaultRate * ratio), 100),
  }));
}

export const SCENARIOS: Scenario[] = [
  {
    id: "current",
    name: "Current Policy",
    mode: "both",
    description: "Maintain existing tax rates and no new programs. The CBO baseline projection.",
    policy: {
      topMarginalRate: 37,
      capitalGainsRate: 20,
      corporateRate: 21,
      estateRate: 40,
      brackets: DEFAULT_BRACKETS.map((b) => ({ ...b })),
    },
    programs: [],
    source: "Congressional Budget Office, 2025 Budget and Economic Outlook",
  },
  {
    id: "nordic",
    name: "Nordic Model",
    mode: "both",
    description:
      "High taxes funding universal healthcare, education, and childcare — modeled on Scandinavian welfare states.",
    policy: {
      topMarginalRate: 55,
      capitalGainsRate: 30,
      corporateRate: 25,
      estateRate: 50,
      brackets: bracketsWithTopRate(55),
    },
    programs: ["healthcare", "college", "prek"],
    source: "OECD Tax Database; Nordic Council of Ministers",
  },
  {
    id: "warren",
    name: "Warren Plan",
    mode: "revision",
    description:
      "Wealth tax on ultra-millionaires, higher capital gains, funding healthcare and infrastructure.",
    policy: {
      topMarginalRate: 50,
      capitalGainsRate: 39.6,
      corporateRate: 28,
      estateRate: 45,
      brackets: bracketsWithTopRate(50),
    },
    programs: ["healthcare", "college", "infrastructure"],
    source: "Sen. Elizabeth Warren, 2020 Presidential Campaign Policy Platform",
  },
  {
    id: "sanders",
    name: "Sanders Plan",
    mode: "revision",
    description:
      "Aggressive progressive taxation funding Medicare for All, free college, housing, and infrastructure.",
    policy: {
      topMarginalRate: 52,
      capitalGainsRate: 39.6,
      corporateRate: 35,
      estateRate: 55,
      brackets: bracketsWithTopRate(52),
    },
    programs: ["healthcare", "college", "prek", "housing", "infrastructure"],
    source: "Sen. Bernie Sanders, 2020 Presidential Campaign Policy Platform",
  },
  {
    id: "eisenhower",
    name: "Eisenhower Era",
    mode: "revision",
    description:
      "1950s-era tax rates when top marginal rate was 91%. No new social programs in this model.",
    policy: {
      topMarginalRate: 91,
      capitalGainsRate: 25,
      corporateRate: 52,
      estateRate: 77,
      brackets: bracketsScaled(91),
    },
    programs: [],
    source: "IRS Historical Tax Rates, 1954 Internal Revenue Code",
  },
  {
    id: "libertarian",
    name: "Libertarian",
    mode: "both",
    description:
      "Minimal taxation, no new social programs. Relies on free-market solutions and reduced government spending.",
    policy: {
      topMarginalRate: 15,
      capitalGainsRate: 0,
      corporateRate: 10,
      estateRate: 0,
      brackets: bracketsScaled(15),
    },
    programs: [],
    source: "Libertarian Party Platform; Cato Institute Policy Recommendations",
  },

  // ─── 2024/2025 CANDIDATE PLATFORMS ───────────────────────────────────

  {
    id: "trump2025",
    name: "Trump 2025 Plan",
    mode: "fix",
    description:
      "Extend TCJA tax cuts permanently, reduce corporate rate to 15%, no new social programs, tariff revenue. Based on 2024 campaign platform and executive actions.",
    policy: {
      topMarginalRate: 37,
      capitalGainsRate: 15,
      corporateRate: 15,
      estateRate: 0,
      brackets: bracketsWithTopRate(37),
    },
    programs: [],
    source: "Trump 2024 Campaign Platform; Tax Foundation Analysis",
  },
  {
    id: "harris2024",
    name: "Harris 2024 Plan",
    mode: "fix",
    description:
      "Raise taxes on income over $400K, increase corporate rate to 28%, expand child tax credit, invest in housing and healthcare access. Based on 2024 campaign platform.",
    policy: {
      topMarginalRate: 39.6,
      capitalGainsRate: 28,
      corporateRate: 28,
      estateRate: 45,
      brackets: bracketsWithTopRate(39.6),
    },
    programs: ["housing", "prek"],
    source: "Harris 2024 Campaign Platform; Tax Policy Center Analysis",
  },
  {
    id: "progressive2025",
    name: "Progressive Caucus",
    mode: "fix",
    description:
      "Medicare for All, free college, Green New Deal infrastructure, funded by wealth tax and corporate rate increase. Based on Congressional Progressive Caucus Budget.",
    policy: {
      topMarginalRate: 50,
      capitalGainsRate: 39.6,
      corporateRate: 35,
      estateRate: 55,
      brackets: bracketsWithTopRate(50),
    },
    programs: [
      "healthcare",
      "college",
      "prek",
      "housing",
      "infrastructure",
      "ss_cap",
      "carbon_tax",
      "irs_enforcement",
    ],
    source: "Congressional Progressive Caucus FY2025 Budget; People's Budget",
  },
  {
    id: "moderate2025",
    name: "Bipartisan Moderate",
    mode: "fix",
    description:
      "Modest tax increases on high earners, targeted spending on infrastructure and pre-K, IRS enforcement funding. Deficit reduction focus. Based on Problem Solvers Caucus proposals.",
    policy: {
      topMarginalRate: 39.6,
      capitalGainsRate: 23.8,
      corporateRate: 25,
      estateRate: 40,
      brackets: bracketsWithTopRate(39.6),
    },
    programs: ["infrastructure", "prek", "irs_enforcement", "medicare_negotiation"],
    source:
      "Problem Solvers Caucus; Committee for a Responsible Federal Budget",
  },
];

export const SCENARIOS_MAP = new Map(SCENARIOS.map((s) => [s.id, s]));
