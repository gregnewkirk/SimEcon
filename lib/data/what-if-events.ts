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
      "Signed into law in December 2017. Lowered the top individual income tax rate from 39.6% to 37% and reduced the corporate tax rate from 35% to 21%. Also doubled the standard deduction and modified itemized deductions. CBO estimated it would add approximately $1.9 trillion to deficits over 10 years before accounting for economic growth effects.",
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
      "The Economic Growth and Tax Relief Reconciliation Act of 2001. Reduced the top individual rate from 39.6% to 35% over six years, created a new 10% bracket, increased the child tax credit, and reduced estate taxes. Passed during the transition from budget surpluses to deficits. CBO estimated a $1.35 trillion revenue reduction over 10 years.",
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
      "Accelerated the income tax rate reductions from the 2001 act and reduced the capital gains tax rate from 20% to 15% and the dividend tax rate from 38.6% to 15%. Enacted during the 2001 recession recovery. CBO estimated a $350 billion revenue reduction over 10 years.",
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
      "Made most of the 2001 and 2003 tax cuts permanent for individuals earning under $400K ($450K for couples). Restored the top individual rate to 39.6% for higher earners and set the capital gains rate at 20% for top earners. The estate tax exemption was set at $5 million (indexed for inflation) with a 40% top rate.",
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
      "Extended the 2001 and 2003 tax cuts for two additional years across all income levels. Also included a temporary 2% payroll tax cut and extended unemployment benefits. The 2001/2003 cuts had been set to expire at the end of 2010. CBO estimated the extension reduced revenues by approximately $858 billion over two years.",
    counterfactualPolicy: {
      topMarginalRate: 39.6,
      capitalGainsRate: 20,
      corporateRate: 35,
      estateRate: 55,
      brackets: bracketsWithTopRate(39.6),
    },
  },

  // === SPENDING EVENTS ===
  {
    id: "iraq2003",
    name: "Iraq War (2003\u20132011)",
    year: 2003,
    endYear: 2011,
    category: "spending",
    description:
      "U.S. military operations in Iraq from March 2003 through December 2011. Direct Department of Defense spending totaled approximately $815 billion. Including State Department operations, veterans' medical care, disability costs, and interest on war-related borrowing, the total cost is estimated at $1.9 trillion (Watson Institute, Brown University). Peak troop deployment reached 170,000 in 2007.",
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
      "U.S. military operations in Afghanistan from October 2001 through August 2021 \u2014 the longest war in U.S. history. Direct DoD spending totaled approximately $933 billion. Including State Department operations, veterans' care, and interest on borrowing, the total cost is estimated at $2.3 trillion (Watson Institute, Brown University). Peak troop deployment reached 100,000 in 2011.",
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
      "The Troubled Asset Relief Program, signed into law in October 2008 during the financial crisis. Originally authorized $700 billion to purchase toxic assets and inject capital into banks. The Treasury ultimately disbursed $443 billion. Most funds were repaid with interest \u2014 the CBO estimated a net cost to taxpayers of approximately $31 billion, though broader bailout-related programs (AIG, auto industry, Fannie Mae/Freddie Mac) brought the total net federal outlay to roughly $450 billion.",
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
      "Federal pandemic response legislation across 6 major bills signed by Presidents Trump and Biden. Includes the CARES Act ($2.2T), Consolidated Appropriations Act ($900B), and American Rescue Plan ($1.9T), among others. Funded stimulus checks, expanded unemployment insurance, PPP loans for businesses, healthcare funding, and state/local government aid. Total estimated cost: approximately $5.2 trillion (Committee for a Responsible Federal Budget).",
    spendingReductionBillionsPerYear: 2600,
    totalCostTrillions: 5.2,
  },
];

// Sort by year ascending (earliest first)
WHAT_IF_EVENTS.sort((a, b) => a.year - b.year);

export const WHAT_IF_EVENTS_MAP = new Map(
  WHAT_IF_EVENTS.map((e) => [e.id, e])
);
