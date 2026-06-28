import type { Lever } from "./types";
import { bracketLevers, topRateLever } from "./tax-brackets";
import { corporateLever } from "./corporate";
import { payrollCapLever } from "./payroll";
import { capGainsLever } from "./capital-gains";
import { estateLever } from "./estate";
import { PROGRAM_LEVERS } from "./programs";
import { REVENUE_LEVERS } from "./revenue-options";

export const TAX_LEVERS: Lever[] = [
  ...bracketLevers,
  topRateLever,
  corporateLever,
  payrollCapLever,
  capGainsLever,
  estateLever,
];

export const ALL_LEVERS: Lever[] = [...TAX_LEVERS, ...PROGRAM_LEVERS, ...REVENUE_LEVERS];

export const LEVERS_BY_ID: Map<string, Lever> = new Map(ALL_LEVERS.map((l) => [l.id, l]));

/** Default config: every lever at its baseline / off value. */
export function defaultConfig(): Record<string, number | boolean> {
  const cfg: Record<string, number | boolean> = {};
  for (const l of ALL_LEVERS) {
    if (l.defaultValue !== undefined) cfg[l.id] = l.defaultValue;
  }
  return cfg;
}
