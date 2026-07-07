/**
 * Money formatting for the San Diego budget. Everything is shown in millions, one
 * consistent unit, same reasoning as the federal trillions formatter: a $2,200M General
 * Fund next to a $14M library cut keeps the scale visceral instead of flipping between
 * "B" and "M". Per-resident figures stay in plain dollars.
 */

/** Millions in, a millions string out (grouped, no decimals above $10M). */
export function moneyM(millions: number): string {
  const abs = Math.abs(millions);
  if (abs < 0.05) return "$0M";
  const sign = millions < 0 ? "-" : "";
  const decimals = abs >= 10 ? 0 : 1;
  return `${sign}$${abs.toLocaleString("en-US", { minimumFractionDigits: decimals, maximumFractionDigits: decimals })}M`;
}

/** Signed millions, always showing + or -. */
export function signedMoneyM(millions: number): string {
  return millions > 0 ? `+${moneyM(millions)}` : moneyM(millions);
}

export function pct(n: number, digits = 0): string {
  return `${n.toFixed(digits)}%`;
}

/** Plain dollars for per-resident/human-scale numbers. */
export function dollars(n: number): string {
  const sign = n < 0 ? "-" : "";
  return `${sign}$${Math.abs(Math.round(n)).toLocaleString("en-US")}`;
}
