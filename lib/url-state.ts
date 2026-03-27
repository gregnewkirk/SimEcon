import type { URLState } from "./types";

const DEFAULTS: Required<Pick<URLState, "s" | "tr" | "cg" | "cr" | "er" | "sp" | "ag" | "ai" | "ae">> = {
  s: "current",
  tr: 37,
  cg: 20,
  cr: 21,
  er: 40,
  sp: 1,
  ag: 1.8,
  ai: 3.2,
  ae: 0.3,
};

/**
 * Encode a URLState object into a hash string.
 * Only includes values that differ from defaults.
 * Returns "#key=val&key2=val2" or "" if all defaults.
 */
export function encodeURLState(state: URLState): string {
  const parts: string[] = [];

  for (const [key, value] of Object.entries(state)) {
    if (value === undefined || value === null) continue;
    const defaultVal = DEFAULTS[key as keyof typeof DEFAULTS];
    if (defaultVal !== undefined && String(value) === String(defaultVal)) continue;
    parts.push(`${encodeURIComponent(key)}=${encodeURIComponent(String(value))}`);
  }

  return parts.length > 0 ? `#${parts.join("&")}` : "";
}

/**
 * Decode a hash string back into a URLState object.
 * Strips leading "#" if present.
 */
export function decodeURLState(hash: string): URLState {
  const cleaned = hash.startsWith("#") ? hash.slice(1) : hash;
  if (!cleaned) return {};

  const result: URLState = {};

  for (const pair of cleaned.split("&")) {
    const [rawKey, rawValue] = pair.split("=");
    if (!rawKey || rawValue === undefined) continue;

    const key = decodeURIComponent(rawKey);
    const value = decodeURIComponent(rawValue);

    switch (key) {
      case "s":
        result.s = value;
        break;
      case "p":
        result.p = value;
        break;
      case "tr":
        result.tr = Number(value);
        break;
      case "cg":
        result.cg = Number(value);
        break;
      case "cr":
        result.cr = Number(value);
        break;
      case "er":
        result.er = Number(value);
        break;
      case "y":
        result.y = Number(value);
        break;
      case "sp":
        result.sp = Number(value);
        break;
      case "ag":
        result.ag = Number(value);
        break;
      case "ai":
        result.ai = Number(value);
        break;
      case "ae":
        result.ae = Number(value);
        break;
      case "m":
        result.m = value;
        break;
      case "we":
        result.we = value;
        break;
    }
  }

  return result;
}
