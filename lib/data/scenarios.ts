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
];

export const SCENARIOS_MAP = new Map(SCENARIOS.map((s) => [s.id, s]));
