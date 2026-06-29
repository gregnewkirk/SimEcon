/** Money + number formatting shared across the SimEcon UI. */

/** Billions to a compact dollar string: 6900 -> "$6.9T", 535 -> "$535B". */
export function money(billions: number): string {
  const sign = billions < 0 ? "-" : "";
  const abs = Math.abs(billions);
  if (abs >= 1000) return `${sign}$${(abs / 1000).toFixed(2)}T`;
  return `${sign}$${Math.round(abs)}B`;
}

/** Signed money, always showing + or -. */
export function signedMoney(billions: number): string {
  const s = money(billions);
  return billions > 0 ? `+${s}` : s;
}

export function pct(n: number, digits = 0): string {
  return `${n.toFixed(digits)}%`;
}

export function trillions(billions: number): string {
  return `$${(billions / 1000).toFixed(2)}T`;
}
