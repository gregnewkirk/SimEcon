import type { Lever, Tier } from "./types";
import { registerSources } from "../citations";

registerSources([
  {
    id: "cbo_programs",
    agency: "Congressional Budget Office / agency estimates",
    dataset: "Program cost estimates (single-payer, UBI, infrastructure, etc.)",
    year: 2023,
    url: "https://www.cbo.gov/",
    accessed: "2026-06-28",
  },
  {
    id: "cbpp_ctc",
    agency: "Center on Budget and Policy Priorities / Columbia CPSP",
    dataset: "Cost and child-poverty effect of a permanent expanded Child Tax Credit",
    year: 2023,
    url: "https://www.cbpp.org/",
    accessed: "2026-06-28",
  },
  {
    id: "levy_job_guarantee",
    agency: "Levy Economics Institute",
    dataset: "Macroeconomic effects of a federal job guarantee",
    year: 2018,
    url: "https://www.levyinstitute.org/",
    accessed: "2026-06-28",
  },
  {
    id: "treasury_childcare",
    agency: "U.S. Treasury / Center for American Progress",
    dataset: "Cost of universal child care and early learning (0-5)",
    year: 2021,
    url: "https://home.treasury.gov/",
    accessed: "2026-06-28",
  },
  {
    id: "cbo_paid_leave",
    agency: "Congressional Budget Office",
    dataset: "Cost of a federal paid family and medical leave program",
    year: 2021,
    url: "https://www.cbo.gov/",
    accessed: "2026-06-28",
  },
  {
    id: "usda_school_meals",
    agency: "USDA Food and Nutrition Service",
    dataset: "Cost of universal free school meals",
    year: 2023,
    url: "https://www.fns.usda.gov/",
    accessed: "2026-06-28",
  },
]);

/**
 * Spending programs. netCostB is the annual net cost in 2025 dollars (gross cost minus
 * cited offsets). Each is a toggle: when on, it adds netCostB to the policy_programs line.
 * Big, well-scored programs are tier "calibrated"; smaller/rougher ones are "estimate".
 */
interface ProgramDef {
  id: string;
  label: string;
  netCostB: number;
  tier: Tier;
  citationId?: string;
}

const PROGRAMS: ProgramDef[] = [
  { id: "healthcare", label: "Universal Healthcare (M4A)", netCostB: 450, tier: "calibrated" },
  { id: "ubi", label: "Universal Basic Income", netCostB: 2800, tier: "calibrated" },
  { id: "college", label: "Free Public College", netCostB: 80, tier: "calibrated" },
  { id: "prek", label: "Universal Pre-K", netCostB: 40, tier: "calibrated" },
  { id: "housing", label: "Affordable Housing", netCostB: 75, tier: "calibrated" },
  { id: "infrastructure", label: "Infrastructure Modernization", netCostB: 370, tier: "calibrated" },
  { id: "rd_moonshot", label: "R&D Moonshot Fund", netCostB: 200, tier: "calibrated" },
  { id: "mental_health", label: "Federal Mental Health Corps", netCostB: 50, tier: "estimate" },
  { id: "public_internet", label: "Federal Public Internet", netCostB: 40, tier: "estimate" },
  { id: "green_jobs", label: "Green Jobs Corps", netCostB: 60, tier: "estimate" },
  { id: "baby_bonds", label: "Baby Bonds", netCostB: 4, tier: "estimate" },
  // Next-gen moonshots
  { id: "child_tax_credit", label: "Permanent Child Tax Credit ($300/mo)", netCostB: 110, tier: "calibrated", citationId: "cbpp_ctc" },
  { id: "child_care", label: "Universal Child Care (0-5)", netCostB: 200, tier: "estimate", citationId: "treasury_childcare" },
  { id: "paid_leave", label: "Paid Family & Medical Leave", netCostB: 250, tier: "estimate", citationId: "cbo_paid_leave" },
  { id: "job_guarantee", label: "Federal Job Guarantee", netCostB: 500, tier: "estimate", citationId: "levy_job_guarantee" },
  { id: "school_meals", label: "Universal Free School Meals", netCostB: 25, tier: "calibrated", citationId: "usda_school_meals" },
];

export const PROGRAM_LEVERS: Lever[] = PROGRAMS.map((p) => {
  const citationId = p.citationId ?? "cbo_programs";
  return {
    id: p.id,
    label: p.label,
    category: "program",
    tier: p.tier,
    targets: ["policy_programs"],
    citationIds: [citationId],
    defaultValue: false,
    conventional: (cfg) => [
      { lineId: "policy_programs", amountB: cfg[p.id] === true ? p.netCostB : 0, citationId, leverId: p.id },
    ],
  };
});
