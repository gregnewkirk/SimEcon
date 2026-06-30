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
  {
    id: "wyden_bit",
    agency: "Senate Finance Committee (Wyden) / Treasury",
    dataset: "Billionaires Income Tax: mark-to-market and taxing borrowing against unrealized gains",
    year: 2023,
    url: "https://www.finance.senate.gov/",
    accessed: "2026-06-28",
  },
  {
    id: "tax_foundation_tariffs",
    agency: "Tax Foundation",
    dataset: "Revenue and economic effects of broad-based import tariffs",
    year: 2024,
    url: "https://taxfoundation.org/",
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
  group: string;
  contested?: boolean;
  citationId: string;
  /** If present, this option is a dial (slider) instead of a yes/no toggle. */
  dial?: { min: number; max: number; step: number; onValue: number; unit: string; perUnitB: number };
}

const OPTIONS: RevenueDef[] = [
  // Tax wealth & Wall Street
  { id: "wealth_tax", label: "Wealth Tax (on $50M+)", amountB: 250, target: "policy_revenue", sign: 1, tier: "estimate", group: "Tax wealth & Wall Street", contested: true, citationId: "saez_zucman_wealth", dial: { min: 0, max: 5, step: 0.5, onValue: 2, unit: "%", perUnitB: 125 } },
  { id: "billionaire_min_tax", label: "Billionaire Minimum Tax (unrealized gains)", amountB: 40, target: "policy_revenue", sign: 1, tier: "calibrated", group: "Tax wealth & Wall Street", citationId: "treasury_greenbook" },
  { id: "buyback_tax", label: "Stock Buyback Tax (1% to 4%)", amountB: 25, target: "policy_revenue", sign: 1, tier: "calibrated", group: "Tax wealth & Wall Street", citationId: "jct_tax_expenditures" },
  { id: "financial_tx_tax", label: "Financial Transaction Tax", amountB: 55, target: "policy_revenue", sign: 1, tier: "calibrated", group: "Tax wealth & Wall Street", citationId: "cbo_budget_options" },
  { id: "carried_interest", label: "Close Carried-Interest Loophole", amountB: 1.5, target: "policy_revenue", sign: 1, tier: "calibrated", group: "Tax wealth & Wall Street", citationId: "jct_tax_expenditures" },
  { id: "collateral_tax", label: "Tax gains borrowed against (buy-borrow-die)", amountB: 60, target: "policy_revenue", sign: 1, tier: "estimate", group: "Tax wealth & Wall Street", contested: true, citationId: "wyden_bit", dial: { min: 0, max: 37, step: 1, onValue: 20, unit: "%", perUnitB: 3 } },
  // Broad-based taxes
  { id: "vat5", label: "Value-Added Tax", amountB: 1400, target: "policy_revenue", sign: 1, tier: "calibrated", group: "Broad-based taxes", citationId: "tpc_vat", dial: { min: 0, max: 10, step: 0.5, onValue: 5, unit: "%", perUnitB: 280 } },
  { id: "cap_employer_health", label: "Cap Employer Health Exclusion", amountB: 300, target: "policy_revenue", sign: 1, tier: "calibrated", group: "Broad-based taxes", citationId: "jct_tax_expenditures", dial: { min: 0, max: 100, step: 5, onValue: 100, unit: "% capped", perUnitB: 3 } },
  { id: "carbon_tax", label: "Carbon Tax", amountB: 120, target: "policy_revenue", sign: 1, tier: "calibrated", group: "Broad-based taxes", citationId: "cbo_budget_options" },
  { id: "land_value_tax", label: "Federal Land Value Tax", amountB: 100, target: "policy_revenue", sign: 1, tier: "estimate", group: "Broad-based taxes", citationId: "cbo_budget_options" },
  { id: "tariffs", label: "Tariffs (avg import tax)", amountB: 180, target: "policy_revenue", sign: 1, tier: "estimate", group: "Broad-based taxes", contested: true, citationId: "tax_foundation_tariffs", dial: { min: 0, max: 25, step: 1, onValue: 10, unit: "%", perUnitB: 18 } },
  // Sin & niche taxes
  { id: "sugar_tax", label: "Sugar / Junk Food Tax", amountB: 30, target: "policy_revenue", sign: 1, tier: "estimate", group: "Sin & niche taxes", citationId: "cbo_budget_options" },
  { id: "cannabis_tax", label: "Federal Cannabis Tax", amountB: 10, target: "policy_revenue", sign: 1, tier: "estimate", group: "Sin & niche taxes", citationId: "crs_cannabis" },
  { id: "sports_betting_tax", label: "Federal Sports Betting Tax", amountB: 18, target: "policy_revenue", sign: 1, tier: "estimate", group: "Sin & niche taxes", citationId: "cbo_budget_options" },
  { id: "robot_tax", label: "Automation / Robot Tax", amountB: 50, target: "policy_revenue", sign: 1, tier: "estimate", group: "Sin & niche taxes", citationId: "cbo_budget_options" },
  // Cuts & savings
  { id: "defense_cut", label: "Defense Budget Reduction", amountB: 100, target: "defense", sign: -1, tier: "calibrated", group: "Cuts & savings", citationId: "cbo_budget_options", dial: { min: 0, max: 50, step: 1, onValue: 10, unit: "% cut", perUnitB: 9 } },
  { id: "medicare_negotiation", label: "Medicare Drug Negotiation", amountB: 100, target: "medicare", sign: -1, tier: "calibrated", group: "Cuts & savings", citationId: "cbo_budget_options" },
  { id: "irs_enforcement", label: "IRS Enforcement Funding", amountB: 75, target: "policy_revenue", sign: 1, tier: "calibrated", group: "Cuts & savings", citationId: "cbo_budget_options" },
  { id: "end_fossil_subsidies", label: "End Fossil-Fuel Subsidies", amountB: 15, target: "policy_revenue", sign: 1, tier: "calibrated", group: "Cuts & savings", citationId: "treasury_greenbook" },
];

export const REVENUE_LEVERS: Lever[] = OPTIONS.map((o) => {
  if (o.dial) {
    const d = o.dial;
    return {
      id: o.id,
      label: o.label,
      category: "revenue" as const,
      tier: o.tier,
      group: o.group,
      targets: [o.target],
      citationIds: [o.citationId],
      contested: o.contested,
      defaultValue: 0,
      onValue: d.onValue,
      unit: d.unit,
      range: { min: d.min, max: d.max, step: d.step, baseline: 0 },
      conventional: (cfg) => [
        { lineId: o.target, amountB: ((cfg[o.id] as number) ?? 0) * d.perUnitB * o.sign, citationId: o.citationId, leverId: o.id },
      ],
    };
  }
  return {
    id: o.id,
    label: o.label,
    category: "revenue" as const,
    tier: o.tier,
    group: o.group,
    targets: [o.target],
    citationIds: [o.citationId],
    contested: o.contested,
    defaultValue: false,
    onValue: true,
    conventional: (cfg) => [
      { lineId: o.target, amountB: cfg[o.id] === true ? o.sign * o.amountB : 0, citationId: o.citationId, leverId: o.id },
    ],
  };
});
