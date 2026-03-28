import type { WhatIfEvent } from "../types";
import { DEFAULT_BRACKETS } from "./defaults";

/** Helper: create brackets with a custom top bracket rate */
function bracketsWithTopRate(topRate: number) {
  return DEFAULT_BRACKETS.map((b, i) =>
    i === DEFAULT_BRACKETS.length - 1
      ? { ...b, rate: topRate }
      : { ...b }
  );
}

export const WHAT_IF_EVENTS: WhatIfEvent[] = [
  // === TAX POLICY EVENTS ===
  {
    id: "tcja2017",
    name: "Tax Cuts and Jobs Act (2017)",
    year: 2017,
    category: "tax",
    description:
      "Reduced the top individual rate from 39.6% to 37%, corporate rate from 35% to 21%. What if these cuts never happened?",
    counterfactualPolicy: {
      topMarginalRate: 39.6,
      capitalGainsRate: 20,
      corporateRate: 35,
      estateRate: 40,
      brackets: bracketsWithTopRate(39.6),
    },
  },
  {
    id: "egtrra2001",
    name: "Bush Tax Cuts (2001)",
    year: 2001,
    category: "tax",
    description:
      "Reduced top rate from 39.6% to 35% over six years. What if Clinton-era rates had been preserved?",
    counterfactualPolicy: {
      topMarginalRate: 39.6,
      capitalGainsRate: 20,
      corporateRate: 35,
      estateRate: 55,
      brackets: bracketsWithTopRate(39.6),
    },
  },
  {
    id: "jgtrra2003",
    name: "Jobs and Growth Tax Relief (2003)",
    year: 2003,
    category: "tax",
    description:
      "Accelerated the 2001 rate cuts and reduced capital gains to 15%. What if rates stayed higher?",
    counterfactualPolicy: {
      topMarginalRate: 38.6,
      capitalGainsRate: 20,
      corporateRate: 35,
      estateRate: 49,
      brackets: bracketsWithTopRate(38.6),
    },
  },
  {
    id: "atra2013",
    name: "American Taxpayer Relief Act (2012)",
    year: 2013,
    category: "tax",
    description:
      "Made most Bush-era tax cuts permanent but raised the top rate to 39.6% for incomes over $400K. What if rates had returned to Clinton-era levels across all brackets?",
    counterfactualPolicy: {
      topMarginalRate: 39.6,
      capitalGainsRate: 23.8,
      corporateRate: 35,
      estateRate: 45,
      brackets: bracketsWithTopRate(39.6),
    },
  },
  {
    id: "tra2010",
    name: "Tax Relief Act of 2010",
    year: 2010,
    category: "tax",
    description:
      "Extended Bush-era tax cuts for two more years. What if they had expired as scheduled?",
    counterfactualPolicy: {
      topMarginalRate: 39.6,
      capitalGainsRate: 20,
      corporateRate: 35,
      estateRate: 55,
      brackets: bracketsWithTopRate(39.6),
    },
  },

  // === SPENDING / WAR EVENTS ===
  {
    id: "iraq2003",
    name: "Iraq War (2003\u20132011)",
    year: 2003,
    endYear: 2011,
    category: "spending",
    description:
      "The Iraq War cost an estimated $1.9 trillion in direct spending, plus trillions more in veterans' care and interest. What if we never invaded?",
    spendingReductionBillionsPerYear: 210,
    totalCostTrillions: 1.9,
  },
  {
    id: "afghanistan2001",
    name: "Afghanistan War (2001\u20132021)",
    year: 2001,
    endYear: 2021,
    category: "spending",
    description:
      "The longest US war cost an estimated $2.3 trillion in direct spending over 20 years. What if we never deployed?",
    spendingReductionBillionsPerYear: 115,
    totalCostTrillions: 2.3,
  },
  {
    id: "tarp2008",
    name: "Bank Bailouts / TARP (2008)",
    year: 2008,
    endYear: 2012,
    category: "spending",
    description:
      "The Troubled Asset Relief Program and related bailouts cost ~$700B initially (much was repaid). Net cost ~$450B. What if there was no bailout?",
    spendingReductionBillionsPerYear: 90,
    totalCostTrillions: 0.45,
  },
  {
    id: "covid2020",
    name: "COVID Relief Spending (2020\u20132021)",
    year: 2020,
    endYear: 2021,
    category: "spending",
    description:
      "CARES Act, PPP, stimulus checks, and other COVID relief totaled ~$5.2 trillion. What if there was no pandemic spending?",
    spendingReductionBillionsPerYear: 2600,
    totalCostTrillions: 5.2,
  },
];

export const WHAT_IF_EVENTS_MAP = new Map(
  WHAT_IF_EVENTS.map((e) => [e.id, e])
);
