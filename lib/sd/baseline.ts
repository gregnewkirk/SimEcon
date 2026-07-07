import type { SdBudgetLine } from "./types";
import { registerSources } from "../citations";

registerSources([
  {
    id: "sd_fy26_budget",
    agency: "City of San Diego",
    dataset: "FY2026 Adopted Budget, Vol. 1 (General Fund revenues and expenditures)",
    year: 2025,
    url: "https://www.sandiego.gov/sites/default/files/2025-08/fy26ab_v1executivesummary.pdf",
    accessed: "2026-07-07",
  },
  {
    id: "sd_iba_guide",
    agency: "Office of the Independent Budget Analyst",
    dataset: "Public's Guide to the Budget Process and the FY2026 Adopted Budget ($6.10B total, $2.17B General Fund)",
    year: 2025,
    url: "https://www.sandiego.gov/sites/default/files/2025-12/publics-guide-to-the-budget-process-and-the-fy-2026-adopted-budget.pdf",
    accessed: "2026-07-07",
  },
  {
    id: "sd_iba_police",
    agency: "Office of the Independent Budget Analyst",
    dataset: "IBA Report 26-09: Analysis of the Police Department's FY2026 Budget ($703.5M, $45.3M overtime)",
    year: 2026,
    url: "https://www.sandiego.gov/sites/default/files/2026-03/26-09-analysis-of-the-police-department-s-fiscal-year-2026-budget.pdf",
    accessed: "2026-07-07",
  },
  {
    id: "sd_fire_budget",
    agency: "City of San Diego",
    dataset: "FY2026 Adopted Budget: Fire-Rescue ($516.6M all funds; ~$379M General Fund; Police+Fire = 49.9% of GF)",
    year: 2025,
    url: "https://www.sandiego.gov/sites/default/files/2025-08/fy26ab_v2firerescue.pdf",
    accessed: "2026-07-07",
  },
  {
    id: "sd_dept_budgets",
    agency: "City of San Diego / Times of San Diego",
    dataset: "FY2026 department budgets: Parks ~$185M, Transportation $184.2M GF, Library ~$57M (-$8M), Stormwater ~$60M, City Attorney ~$86.5M",
    year: 2025,
    url: "https://www.sandiego.gov/sites/default/files/2025-08/fy26ab_v1generalfundexpenditures.pdf",
    accessed: "2026-07-07",
  },
  {
    id: "sd_homelessness_budget",
    agency: "City of San Diego",
    dataset: "FY2026 homelessness investment: $105.3M total, $71.1M General Fund",
    year: 2025,
    url: "https://www.sandiego.gov/sites/default/files/2025-05/2025-5-8-draft-fy26-budget-continues-city-of-san-diego-s-progress-on-addressing-homelessness.pdf",
    accessed: "2026-07-07",
  },
  {
    id: "sd_gf_revenues",
    agency: "City of San Diego",
    dataset: "FY2026 Adopted Budget: General Fund revenues (property $844.6M, sales $374.5M, TOT $170.3M, franchise ~$106.5M)",
    year: 2025,
    url: "https://www.sandiego.gov/sites/default/files/2025-08/fy26ab_v1generalfundrevenues.pdf",
    accessed: "2026-07-07",
  },
  {
    id: "sd_one_time",
    agency: "Office of the Independent Budget Analyst",
    dataset: "IBA 25-36: $103.6M in one-time resources used to balance FY2026, incl. $66.4M skipped reserve contributions",
    year: 2025,
    url: "https://www.sandiego.gov/sites/default/files/2025-12/25-36-review-of-the-mayor-s-fy-2027-2031-five-year-financial-outlook_2.pdf",
    accessed: "2026-07-07",
  },
  {
    id: "sd_reserves",
    agency: "City of San Diego / Governing",
    dataset: "General Fund reserves: $207.1M (11.8% of revenues) vs 16.7% Council Policy target (CP-100-20)",
    year: 2025,
    url: "https://www.sandiego.gov/sites/default/files/2025-10/fy25-year-end-financial-performance-report.pdf",
    accessed: "2026-07-07",
  },
  {
    id: "sd_sdcers",
    agency: "SDCERS / Axios San Diego / Reason Foundation",
    dataset: "FY2026 pension ADC: $533.2M citywide, ~$378M General Fund; UAL ~$3.4B, ~74% funded (June 30, 2024 valuation)",
    year: 2025,
    url: "https://www.sdcers.org/financials-investments/actuarial-valuation-reports",
    accessed: "2026-07-07",
  },
]);

/**
 * FY2026 Adopted General Fund, in nominal millions. Revenues and spending both sum to
 * ~$2,170M because California cities must adopt balanced budgets - but $103.6M of the
 * revenue side is one-time money (mostly skipped reserve contributions) that vanishes in
 * FY2027, which is where the structural deficit comes from.
 *
 * Department budgets are as adopted (they include each department's share of the pension
 * payment, the way the city books them). The pension_adc line starts at zero and carries
 * DEVIATIONS from the scheduled pension path - underpay it and watch the future.
 */
export const SD_BASELINE_2026: SdBudgetLine[] = [
  // ——— Revenue ———
  { id: "property_tax", label: "Property tax", side: "revenue", valueM: 844.6, growthBasis: "assessedValue", citationId: "sd_gf_revenues" },
  { id: "sales_tax", label: "Sales tax", side: "revenue", valueM: 374.5, growthBasis: "salesEconomy", citationId: "sd_gf_revenues" },
  { id: "tot", label: "Hotel tax (TOT)", side: "revenue", valueM: 170.3, growthBasis: "touristEconomy", citationId: "sd_gf_revenues" },
  { id: "franchise_fees", label: "Franchise fees (SDG&E, cable, refuse)", side: "revenue", valueM: 106.5, growthBasis: "cpi", citationId: "sd_gf_revenues" },
  { id: "business_tax", label: "Business & rental unit taxes", side: "revenue", valueM: 34.0, growthBasis: "salesEconomy", citationId: "sd_gf_revenues" },
  { id: "cannabis_tax", label: "Cannabis tax", side: "revenue", valueM: 21.3, growthBasis: "salesEconomy", citationId: "sd_gf_revenues" },
  { id: "parking_fines", label: "Parking citations & fines", side: "revenue", valueM: 28.3, growthBasis: "cpi", citationId: "sd_gf_revenues" },
  { id: "parking_meters", label: "Parking meters", side: "revenue", valueM: 19.2, growthBasis: "cpi", citationId: "sd_gf_revenues" },
  { id: "transfer_tax", label: "Property transfer tax", side: "revenue", valueM: 10.1, growthBasis: "assessedValue", citationId: "sd_gf_revenues" },
  { id: "other_revenue", label: "Charges, transfers & other", side: "revenue", valueM: 457.6, growthBasis: "cpi", citationId: "sd_fy26_budget" },
  { id: "one_time", label: "One-time fixes (FY2026 only)", side: "revenue", valueM: 103.6, growthBasis: "oneTime", citationId: "sd_one_time" },
  { id: "policy_revenue", label: "New revenue measures", side: "revenue", valueM: 0, growthBasis: "cpi", citationId: "sd_fy26_budget" },

  // ——— Spending ———
  { id: "police", label: "Police (SDPD)", side: "spending", valueM: 703.5, growthBasis: "personnel", citationId: "sd_iba_police" },
  { id: "fire", label: "Fire-Rescue & lifeguards", side: "spending", valueM: 379.3, growthBasis: "personnel", citationId: "sd_fire_budget" },
  { id: "parks", label: "Parks & Recreation", side: "spending", valueM: 185.0, growthBasis: "personnel", citationId: "sd_dept_budgets" },
  { id: "transportation", label: "Transportation & streets", side: "spending", valueM: 184.2, growthBasis: "cpi", citationId: "sd_dept_budgets" },
  { id: "city_attorney", label: "City Attorney", side: "spending", valueM: 86.5, growthBasis: "personnel", citationId: "sd_dept_budgets" },
  { id: "homelessness", label: "Homelessness programs", side: "spending", valueM: 71.1, growthBasis: "cpi", citationId: "sd_homelessness_budget" },
  { id: "stormwater", label: "Stormwater", side: "spending", valueM: 60.0, growthBasis: "cpi", citationId: "sd_dept_budgets" },
  { id: "library", label: "Libraries", side: "spending", valueM: 57.0, growthBasis: "personnel", citationId: "sd_dept_budgets" },
  { id: "environmental", label: "Environmental services (litter, abatement)", side: "spending", valueM: 25.0, growthBasis: "cpi", citationId: "sd_dept_budgets" },
  { id: "citywide_debt", label: "Citywide obligations (debt service, Petco, insurance)", side: "spending", valueM: 120.0, growthBasis: "flat", citationId: "sd_dept_budgets" },
  { id: "other_depts", label: "Other departments (planning, IT, finance, council...)", side: "spending", valueM: 298.4, growthBasis: "personnel", citationId: "sd_dept_budgets" },
  { id: "pension_adc", label: "Pension payment changes (SDCERS)", side: "spending", valueM: 0, growthBasis: "computed", citationId: "sd_sdcers" },
  { id: "policy_programs", label: "New programs", side: "spending", valueM: 0, growthBasis: "cpi", citationId: "sd_fy26_budget" },
];

/** City-scale fiscal facts the engine runs on (all millions unless noted). */
export const SD_FISCAL = {
  /** General Fund reserves, FY2025 year-end (Emergency $107.6M + Stability $99.5M). */
  reserveM: 207.1,
  /** Council Policy CP-100-20 reserve target, % of revenues. */
  reserveTargetPct: 16.7,
  /** SDCERS City plan UAL, June 30, 2024 valuation (citywide). */
  pensionUalM: 3400,
  /** Implied total actuarial liability at ~74% funded (assets ~= liability - UAL). */
  pensionLiabilityM: 13100,
  /** Citywide pension normal cost (ADC minus UAL amortization; calibrated so ADC ~= $533M). */
  pensionNormalCostM: 131,
  /** Level-payment amortization factor (retires the UAL by ~2040, SDCERS schedule-ish). */
  pensionAmortFactor: 0.1181,
  /** Share of the citywide ADC paid by the General Fund (~$378M of $533M). */
  pensionGfShare: 0.71,
  /** Growth of the liability/normal cost with payroll, %/yr. */
  pensionPayrollGrowth: 3.5,
  /** City population, for per-resident scale. */
  population: 1_390_000,
  /** SDPD budgeted sworn positions (vs ~1,797 filled, April 2025). */
  swornBudgeted: 2040,
};
