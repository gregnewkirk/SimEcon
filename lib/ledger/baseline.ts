import type { BudgetLine } from "./types";
import { registerSources } from "../citations";

/**
 * FY2025 itemized federal budget. Values are nominal billions and reconcile to the
 * cited FY2025 headline already used in the app: revenue ~$5.0T, outlays ~$6.9T,
 * deficit ~$1.9T, gross debt ~$36.6T, GDP ~$29.3T.
 *
 * Composition follows Treasury Monthly Treasury Statement / OMB Historical Tables
 * receipt-by-source and outlay-by-function splits (Medicare shown net of premiums;
 * "other mandatory" is the realistic grab-bag of income security, veterans, federal
 * retirement, SNAP, ACA subsidies, etc.). Exact per-line values get a verification
 * pass in the adversarial stage; these are the defensible starting anchors.
 */

registerSources([
  {
    id: "cbo_mbr_2025",
    agency: "Congressional Budget Office",
    dataset: "Monthly Budget Review: Fiscal Year 2025",
    year: 2025,
    url: "https://www.cbo.gov/topics/budget",
    accessed: "2026-06-28",
  },
  {
    id: "omb_hist_2_1",
    agency: "Office of Management and Budget",
    dataset: "Historical Tables, Table 2.1 (Receipts by Source)",
    year: 2025,
    url: "https://www.whitehouse.gov/omb/historical-tables/",
    accessed: "2026-06-28",
  },
  {
    id: "omb_hist_3_2",
    agency: "Office of Management and Budget",
    dataset: "Historical Tables, Table 3.2 (Outlays by Function)",
    year: 2025,
    url: "https://www.whitehouse.gov/omb/historical-tables/",
    accessed: "2026-06-28",
  },
  {
    id: "treasury_mts_2025",
    agency: "U.S. Treasury",
    dataset: "Monthly Treasury Statement, FY2025",
    year: 2025,
    url: "https://fiscaldata.treasury.gov/datasets/monthly-treasury-statement/",
    accessed: "2026-06-28",
  },
  {
    id: "model_container",
    agency: "SimEcon model",
    dataset: "Policy container line (seeded at $0; populated only by active levers)",
    year: 2025,
    url: "",
    accessed: "2026-06-28",
  },
]);

export const BASELINE_GDP_T = 29.3;
export const BASELINE_DEBT_T = 36.6;

export const BASELINE_2025: BudgetLine[] = [
  // ---- Revenue (sums to ~5000) ----
  { id: "individual_income", label: "Individual income tax", side: "revenue", valueB: 2470, growthBasis: "nominalGDP", citationId: "treasury_mts_2025" },
  { id: "payroll", label: "Payroll / social insurance", side: "revenue", valueB: 1730, growthBasis: "wages", citationId: "treasury_mts_2025" },
  { id: "corporate", label: "Corporate income tax", side: "revenue", valueB: 535, growthBasis: "profits", citationId: "treasury_mts_2025" },
  { id: "excise", label: "Excise taxes", side: "revenue", valueB: 100, growthBasis: "inflation", citationId: "omb_hist_2_1" },
  { id: "customs", label: "Customs duties", side: "revenue", valueB: 80, growthBasis: "nominalGDP", citationId: "omb_hist_2_1" },
  { id: "estate_gift", label: "Estate & gift tax", side: "revenue", valueB: 35, growthBasis: "nominalGDP", citationId: "omb_hist_2_1" },
  { id: "misc_receipts", label: "Misc (Fed remittances, fees)", side: "revenue", valueB: 50, growthBasis: "nominalGDP", citationId: "omb_hist_2_1" },

  // ---- Spending (sums to ~6900) ----
  { id: "social_security", label: "Social Security", side: "spending", valueB: 1520, growthBasis: "ssCOLA", citationId: "omb_hist_3_2" },
  { id: "medicare", label: "Medicare (net of premiums)", side: "spending", valueB: 870, growthBasis: "healthCost", citationId: "cbo_mbr_2025" },
  { id: "medicaid", label: "Medicaid", side: "spending", valueB: 620, growthBasis: "healthCost", citationId: "cbo_mbr_2025" },
  { id: "other_mandatory", label: "Other mandatory", side: "spending", valueB: 1130, growthBasis: "nominalGDP", citationId: "omb_hist_3_2" },
  { id: "defense", label: "Defense discretionary", side: "spending", valueB: 900, growthBasis: "inflation", citationId: "omb_hist_3_2" },
  { id: "nondefense_discretionary", label: "Non-defense discretionary", side: "spending", valueB: 910, growthBasis: "inflation", citationId: "omb_hist_3_2" },
  { id: "net_interest", label: "Net interest", side: "spending", valueB: 950, growthBasis: "computed", citationId: "cbo_mbr_2025" },

  // ---- Policy containers (seeded at 0; populated by active levers) ----
  { id: "policy_revenue", label: "New policy revenue", side: "revenue", valueB: 0, growthBasis: "nominalGDP", citationId: "model_container" },
  { id: "policy_programs", label: "New policy programs", side: "spending", valueB: 0, growthBasis: "inflation", citationId: "model_container" },
];
