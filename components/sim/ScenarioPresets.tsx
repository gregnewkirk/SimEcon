"use client";

import { SCENARIOS } from "@/lib/scenarios";
import type { LeverConfig } from "@/lib/levers/types";

/**
 * One-click preset plans. Selecting one loads that configuration so you can see what a
 * familiar plan does, then keep tweaking from there.
 */
export function ScenarioPresets({
  activePreset,
  onApply,
  onReset,
}: {
  activePreset: string | null;
  onApply: (id: string, config: LeverConfig) => void;
  onReset: () => void;
}) {
  return (
    <div>
      <div className="mb-1.5 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
        Load a plan, then compare
      </div>
      <div className="flex flex-wrap gap-1.5">
        <Chip active={activePreset === null} onClick={onReset} label="Current law" />
        {SCENARIOS.map((s) => (
          <Chip
            key={s.id}
            active={activePreset === s.id}
            onClick={() => onApply(s.id, s.config)}
            label={s.label}
            title={s.blurb}
          />
        ))}
      </div>
    </div>
  );
}

function Chip({ active, onClick, label, title }: { active: boolean; onClick: () => void; label: string; title?: string }) {
  return (
    <button
      type="button"
      onClick={onClick}
      title={title}
      className={`rounded-full border px-3 py-1 text-xs transition-colors ${
        active
          ? "border-emerald-400/60 bg-emerald-400/15 text-emerald-300"
          : "border-border/60 bg-card/40 text-muted-foreground hover:bg-card/80 hover:text-foreground"
      }`}
    >
      {label}
    </button>
  );
}
