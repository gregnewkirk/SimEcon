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
];

export const PROGRAM_LEVERS: Lever[] = PROGRAMS.map((p) => ({
  id: p.id,
  label: p.label,
  category: "program",
  tier: p.tier,
  targets: ["policy_programs"],
  citationIds: ["cbo_programs"],
  defaultValue: false,
  conventional: (cfg) => [
    { lineId: "policy_programs", amountB: cfg[p.id] === true ? p.netCostB : 0, citationId: "cbo_programs", leverId: p.id },
  ],
}));
