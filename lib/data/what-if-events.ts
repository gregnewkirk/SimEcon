import type { WhatIfEvent } from "../types";

export const WHAT_IF_EVENTS: WhatIfEvent[] = [
  {
    id: "tcja2017",
    name: "Tax Cuts and Jobs Act (2017)",
    year: 2017,
    description:
      "Reduced the top individual rate from 39.6% to 37%, corporate rate from 35% to 21%, and capital gains remained at 20%. What if these cuts never happened?",
    counterfactualPolicy: {
      topMarginalRate: 39.6,
      capitalGainsRate: 20,
      corporateRate: 35,
      estateRate: 40,
    },
  },
  {
    id: "atra2013",
    name: "American Taxpayer Relief Act (2012)",
    year: 2013,
    description:
      "Made most Bush-era tax cuts permanent but raised the top rate to 39.6% for incomes over $400K. What if rates had returned to Clinton-era levels across all brackets?",
    counterfactualPolicy: {
      topMarginalRate: 39.6,
      capitalGainsRate: 23.8,
      corporateRate: 35,
      estateRate: 45,
    },
  },
  {
    id: "tra2010",
    name: "Tax Relief Act of 2010",
    year: 2010,
    description:
      "Extended Bush-era tax cuts for two more years, keeping the top rate at 35%. What if they had expired as scheduled, reverting to Clinton-era rates?",
    counterfactualPolicy: {
      topMarginalRate: 39.6,
      capitalGainsRate: 20,
      corporateRate: 35,
      estateRate: 55,
    },
  },
  {
    id: "jgtrra2003",
    name: "Jobs and Growth Tax Relief (2003)",
    year: 2003,
    description:
      "Accelerated the 2001 rate cuts and reduced capital gains and dividend taxes to 15%. What if capital gains had stayed at 20% and top rate at 38.6%?",
    counterfactualPolicy: {
      topMarginalRate: 38.6,
      capitalGainsRate: 20,
      corporateRate: 35,
      estateRate: 49,
    },
  },
  {
    id: "egtrra2001",
    name: "Bush Tax Cuts (2001)",
    year: 2001,
    description:
      "Reduced top rate from 39.6% to 35% over six years and lowered capital gains. What if Clinton-era rates had been preserved?",
    counterfactualPolicy: {
      topMarginalRate: 39.6,
      capitalGainsRate: 20,
      corporateRate: 35,
      estateRate: 55,
    },
  },
];

export const WHAT_IF_EVENTS_MAP = new Map(
  WHAT_IF_EVENTS.map((e) => [e.id, e])
);
