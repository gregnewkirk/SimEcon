import type { Lever, Tier } from "./types";
import { registerSources } from "../citations";

registerSources([
  {
    id: "cbo_budget_options",
    agency: "Congressional Budget Office",
    dataset: "Options for Reducing the Deficit (revenue and savings options)",
    year: 2024,
    url: "https://www.cbo.gov/budget-options",
    accessed: "2026-06-28",
  },
  {
    id: "saez_zucman_wealth",
    agency: "UC Berkeley / Saez & Zucman",
    dataset: "Progressive wealth tax revenue estimates (disputed range)",
    year: 2024,
    url: "https://eml.berkeley.edu/~saez/",
    accessed: "2026-06-28",
  },
  {
    id: "tpc_vat",
    agency: "Tax Policy Center",
    dataset: "Revenue from a broad-based 5% value-added tax",
    year: 2023,
    url: "https://www.taxpolicycenter.org/",
    accessed: "2026-06-28",
  },
  {
    id: "jct_tax_expenditures",
    agency: "Joint Committee on Taxation",
    dataset: "Estimates of Federal Tax Expenditures (employer health exclusion, buybacks, carried interest)",
    year: 2024,
    url: "https://www.jct.gov/publications/",
    accessed: "2026-06-28",
  },
  {
    id: "treasury_greenbook",
    agency: "U.S. Treasury",
    dataset: "General Explanations of the Administration's Revenue Proposals (billionaire minimum tax; fossil-fuel preferences)",
    year: 2024,
    url: "https://home.treasury.gov/policy-issues/tax-policy/revenue-proposals",
    accessed: "2026-06-28",
  },
  {
    id: "crs_cannabis",
    agency: "Congressional Research Service / Tax Foundation",
    dataset: "Federal revenue from cannabis legalization and excise tax",
    year: 2023,
    url: "https://crsreports.congress.gov/",
    accessed: "2026-06-28",
  },
]);

/**
 * Revenue-side options. amountB is the annual fiscal improvement in 2025 dollars.
 * Most add to the policy_revenue line. A few are spending cuts that reduce a real
 * spending line instead (defense reduction, Medicare drug negotiation).
 */
interface RevenueDef {
  id: string;
  label: string;
  amountB: number;
  target: string; // line id
  sign: 1 | -1; // +1 raises that line, -1 cuts it; both improve the deficit
  tier: Tier;
  contested?: boolean;
  citationId: string;
}

const OPTIONS: RevenueDef[] = [
  { id: "irs_enforcement", label: "IRS Enforcement Funding", amountB: 75, target: "policy_revenue", sign: 1, tier: "calibrated", citationId: "cbo_budget_options" },
  { id: "defense_cut", label: "Defense Budget Reduction", amountB: 100, target: "defense", sign: -1, tier: "calibrated", citationId: "cbo_budget_options" },
  { id: "carbon_tax", label: "Carbon Tax", amountB: 120, target: "policy_revenue", sign: 1, tier: "calibrated", citationId: "cbo_budget_options" },
  { id: "financial_tx_tax", label: "Financial Transaction Tax", amountB: 55, target: "policy_revenue", sign: 1, tier: "calibrated", citationId: "cbo_budget_options" },
  { id: "medicare_negotiation", label: "Medicare Drug Negotiation", amountB: 100, target: "medicare", sign: -1, tier: "calibrated", citationId: "cbo_budget_options" },
  { id: "wealth_tax", label: "Wealth Tax (2% on $50M+)", amountB: 250, target: "policy_revenue", sign: 1, tier: "estimate", contested: true, citationId: "saez_zucman_wealth" },
  { id: "sports_betting_tax", label: "Federal Sports Betting Tax", amountB: 18, target: "policy_revenue", sign: 1, tier: "estimate", citationId: "cbo_budget_options" },
  { id: "robot_tax", label: "Automation / Robot Tax", amountB: 50, target: "policy_revenue", sign: 1, tier: "estimate", citationId: "cbo_budget_options" },
  { id: "sugar_tax", label: "Sugar / Junk Food Tax", amountB: 30, target: "policy_revenue", sign: 1, tier: "estimate", citationId: "cbo_budget_options" },
  { id: "land_value_tax", label: "Federal Land Value Tax", amountB: 100, target: "policy_revenue", sign: 1, tier: "estimate", citationId: "cbo_budget_options" },
  // The giants people underestimate
  { id: "vat5", label: "Value-Added Tax (5%)", amountB: 1400, target: "policy_revenue", sign: 1, tier: "calibrated", citationId: "tpc_vat" },
  { id: "cap_employer_health", label: "Cap Employer Health Exclusion", amountB: 300, target: "policy_revenue", sign: 1, tier: "calibrated", citationId: "jct_tax_expenditures" },
  { id: "billionaire_min_tax", label: "Billionaire Minimum Tax (unrealized gains)", amountB: 40, target: "policy_revenue", sign: 1, tier: "calibrated", citationId: "treasury_greenbook" },
  { id: "buyback_tax", label: "Stock Buyback Tax (1% to 4%)", amountB: 25, target: "policy_revenue", sign: 1, tier: "calibrated", citationId: "jct_tax_expenditures" },
  // The reveals people overestimate
  { id: "carried_interest", label: "Close Carried-Interest Loophole", amountB: 1.5, target: "policy_revenue", sign: 1, tier: "calibrated", citationId: "jct_tax_expenditures" },
  { id: "end_fossil_subsidies", label: "End Fossil-Fuel Subsidies", amountB: 15, target: "policy_revenue", sign: 1, tier: "calibrated", citationId: "treasury_greenbook" },
  { id: "cannabis_tax", label: "Federal Cannabis Tax", amountB: 10, target: "policy_revenue", sign: 1, tier: "estimate", citationId: "crs_cannabis" },
];

export const REVENUE_LEVERS: Lever[] = OPTIONS.map((o) => ({
  id: o.id,
  label: o.label,
  category: "revenue",
  tier: o.tier,
  targets: [o.target],
  citationIds: [o.citationId],
  contested: o.contested,
  defaultValue: false,
  conventional: (cfg) => [
    { lineId: o.target, amountB: cfg[o.id] === true ? o.sign * o.amountB : 0, citationId: o.citationId, leverId: o.id },
  ],
}));
