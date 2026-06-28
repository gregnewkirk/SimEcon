import type { EconAssumptions } from "./growth";

/**
 * Effective interest rate on the federal debt, modeled as a slow rollover.
 *
 * Existing debt is locked at older rates and only a fraction (1 / average maturity)
 * rolls over to the new-issue rate each year, so the blended effective rate converges
 * toward the new-issue rate gradually rather than jumping. This matters a lot at today's
 * rates: pinning interest to a flat current rate overstates near-term interest.
 *
 * Source: CBO interest-rate path + average maturity of marketable debt (~6 years).
 */
export function effectiveRate(prevEffective: number, a: EconAssumptions): number {
  const rolloverFraction = 1 / a.avgMaturityYears;
  return prevEffective + (a.newIssueRate - prevEffective) * rolloverFraction;
}
