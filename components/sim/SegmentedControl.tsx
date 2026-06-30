"use client";

import { motion } from "framer-motion";
import { C, SHADOW_SM, SPRING } from "./theme";

/** iOS-style segmented control with a sliding white highlight behind the active segment. */
export function SegmentedControl<T extends string>({
  value,
  onChange,
  options,
  layoutId = "segmented",
}: {
  value: T;
  onChange: (v: T) => void;
  options: { value: T; label: string }[];
  layoutId?: string;
}) {
  return (
    <div className="inline-flex rounded-[13px] p-[3px]" style={{ background: "#E3E3E8" }}>
      {options.map((o) => {
        const active = o.value === value;
        return (
          <button
            key={o.value}
            type="button"
            onClick={() => onChange(o.value)}
            className="relative rounded-[10px] px-4 py-1.5 text-sm font-medium transition-colors"
            style={{ color: active ? C.ink : C.inkMute }}
          >
            {active && (
              <motion.div
                layoutId={layoutId}
                className="absolute inset-0 rounded-[10px]"
                style={{ background: C.card, boxShadow: SHADOW_SM }}
                transition={SPRING}
              />
            )}
            <span className="relative z-10">{o.label}</span>
          </button>
        );
      })}
    </div>
  );
}
