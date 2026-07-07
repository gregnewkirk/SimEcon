import type { SdLeverConfig } from "./types";
import { SD_ALL_LEVERS, SD_LEVERS_BY_ID, sdDefaultConfig } from "./levers";

/**
 * Shareable URL state for the San Diego sandbox. Only levers that differ from the
 * FY2026 adopted baseline are encoded, as `l.<leverId>=<value>` params, plus `m` for
 * the mode and `e` for selected what-if event ids. Kept human-readable on purpose -
 * a shared link IS the pitch ("l.sworn_officers=2200&l.police_raise=5").
 */
export interface SdUrlState {
  cfg: SdLeverConfig;
  mode: "fix" | "whatif";
  events: string[];
}

const LEVER_PREFIX = "l.";

export function encodeSdState(cfg: SdLeverConfig, mode: "fix" | "whatif", events: string[]): URLSearchParams {
  const params = new URLSearchParams();
  const defaults = sdDefaultConfig();
  for (const lever of SD_ALL_LEVERS) {
    const v = cfg[lever.id];
    if (v === undefined || v === defaults[lever.id]) continue;
    params.set(LEVER_PREFIX + lever.id, typeof v === "boolean" ? (v ? "1" : "0") : String(v));
  }
  if (mode !== "fix") params.set("m", mode);
  if (events.length > 0) params.set("e", events.join(","));
  return params;
}

export function decodeSdState(params: URLSearchParams): SdUrlState {
  const cfg = sdDefaultConfig();
  for (const [key, raw] of params.entries()) {
    if (!key.startsWith(LEVER_PREFIX)) continue;
    const lever = SD_LEVERS_BY_ID.get(key.slice(LEVER_PREFIX.length));
    if (!lever) continue;
    if (lever.range) {
      const n = Number(raw);
      if (Number.isFinite(n)) {
        cfg[lever.id] = Math.min(lever.range.max, Math.max(lever.range.min, n));
      }
    } else {
      cfg[lever.id] = raw === "1" || raw === "true";
    }
  }
  const mode = params.get("m") === "whatif" ? "whatif" : "fix";
  const events = (params.get("e") ?? "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
  return { cfg, mode, events };
}

/** Count of levers moved off baseline (for share copy like "7 changes"). */
export function changedLevers(cfg: SdLeverConfig): { id: string; label: string; value: number | boolean }[] {
  const defaults = sdDefaultConfig();
  return SD_ALL_LEVERS.filter((l) => cfg[l.id] !== undefined && cfg[l.id] !== defaults[l.id]).map((l) => ({
    id: l.id,
    label: l.label,
    value: cfg[l.id],
  }));
}
