/**
 * Money formatting for SimEcon. Everything is shown in trillions, one consistent unit, so
 * the scale is visceral: a $407B surplus reads $0.407T right next to a $1.90T deficit and a
 * $0.002T loophole. People lose the 1000x gap when we flip between "B" and "T"; this keeps
 * the denominator fixed. Per-person figures (human scale) stay in dollars elsewhere.
 */

/** Billions in, a trillions string out. Decimals scale with size so small levers stay visible. */
export function money(billions: number): string {
  const t = billions / 1000;
  const abs = Math.abs(t);
  if (abs < 0.0005) return "$0T";
  const sign = t < 0 ? "-" : "";
  const decimals = abs >= 10 ? 1 : abs >= 1 ? 2 : 3;
  return `${sign}$${abs.toFixed(decimals)}T`;
}

/** Signed trillions, always showing + or -. */
export function signedMoney(billions: number): string {
  return billions > 0 ? `+${money(billions)}` : money(billions);
}

export function pct(n: number, digits = 0): string {
  return `${n.toFixed(digits)}%`;
}

/** Alias kept for callers that pass billions and want the trillions string. */
export function trillions(billions: number): string {
  return money(billions);
}
