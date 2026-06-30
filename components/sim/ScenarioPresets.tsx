"use client";

import { motion } from "framer-motion";
import { SCENARIOS } from "@/lib/scenarios";
import type { LeverConfig } from "@/lib/levers/types";
import { C, SHADOW_SM } from "./theme";

/** One-click preset plans as friendly pill chips. */
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
      <div className="mb-2 text-[11px] font-semibold uppercase tracking-wider" style={{ color: C.inkMute }}>
        Load a plan, then compare
      </div>
      <div className="flex flex-wrap gap-2">
        <Chip active={activePreset === null} onClick={onReset} label="Current law" />
        {SCENARIOS.map((s) => (
          <Chip key={s.id} active={activePreset === s.id} onClick={() => onApply(s.id, s.config)} label={s.label} title={s.blurb} />
        ))}
      </div>
    </div>
  );
}

function Chip({ active, onClick, label, title }: { active: boolean; onClick: () => void; label: string; title?: string }) {
  return (
    <motion.button
      type="button"
      onClick={onClick}
      title={title}
      whileTap={{ scale: 0.94 }}
      className="rounded-full px-3 py-1.5 text-[13px] font-medium transition-colors"
      style={
        active
          ? { background: C.accent, color: "#fff", boxShadow: SHADOW_SM }
          : { background: C.card, color: C.ink, boxShadow: SHADOW_SM }
      }
    >
      {label}
    </motion.button>
  );
}
