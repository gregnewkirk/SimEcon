"use client";

import { motion } from "framer-motion";
import { C, SHADOW_SM, SPRING } from "./theme";
import type { SimMode } from "@/hooks/useSimEngine";

const MODES: {
  value: SimMode;
  eyebrow: string;
  title: string;
  blurb: string;
  accent: string;
  tint: string;
  art: React.ReactNode;
}[] = [
  {
    value: "whatif",
    eyebrow: "Look back",
    title: "What if we had…",
    blurb: "Replay the choices already made — wars, bailouts, tax cuts — and watch the debt we actually carry against the one we could have had.",
    accent: "#f43f5e",
    tint: "#fff1f2",
    // Two diverging paths: what happened vs. what could have been.
    art: (
      <svg viewBox="0 0 120 48" className="h-12 w-[120px]" aria-hidden>
        <path d="M2 40 C 30 38, 60 30, 118 6" fill="none" stroke="#f43f5e" strokeWidth="3" strokeLinecap="round" />
        <path d="M2 40 C 30 41, 60 42, 118 38" fill="none" stroke="#34d399" strokeWidth="3" strokeLinecap="round" strokeDasharray="5 4" />
        <circle cx="2" cy="40" r="3" fill={C.inkMute} />
      </svg>
    ),
  },
  {
    value: "fix",
    eyebrow: "Look forward",
    title: "Fix this mess",
    blurb: "You hold the levers now. Tax, spend, cut, invest — then find out what year the United States finally goes debt-free.",
    accent: "#0a84ff",
    tint: "#eef6ff",
    // Sliders: the levers you get to pull.
    art: (
      <svg viewBox="0 0 120 48" className="h-12 w-[120px]" aria-hidden>
        <line x1="8" y1="12" x2="112" y2="12" stroke="#C9D3E0" strokeWidth="3" strokeLinecap="round" />
        <line x1="8" y1="12" x2="76" y2="12" stroke="#0a84ff" strokeWidth="3" strokeLinecap="round" />
        <circle cx="76" cy="12" r="6" fill="#fff" stroke="#0a84ff" strokeWidth="3" />
        <line x1="8" y1="34" x2="112" y2="34" stroke="#C9D3E0" strokeWidth="3" strokeLinecap="round" />
        <line x1="8" y1="34" x2="40" y2="34" stroke="#34d399" strokeWidth="3" strokeLinecap="round" />
        <circle cx="40" cy="34" r="6" fill="#fff" stroke="#34d399" strokeWidth="3" />
      </svg>
    ),
  },
];

/**
 * The two halves of SimEcon, as side-by-side cards. Each explains itself, and the
 * selected one lifts with its own accent so you always know which game you're in.
 */
export function ModeCards({ value, onChange }: { value: SimMode; onChange: (m: SimMode) => void }) {
  return (
    <div className="mb-6 grid gap-3 sm:grid-cols-2">
      {MODES.map((m) => {
        const active = m.value === value;
        return (
          <motion.button
            key={m.value}
            type="button"
            onClick={() => onChange(m.value)}
            whileTap={{ scale: 0.99 }}
            transition={SPRING}
            aria-pressed={active}
            className="relative overflow-hidden rounded-3xl px-5 py-4 text-left"
            style={{
              background: active ? m.tint : C.card,
              boxShadow: SHADOW_SM,
              outline: active ? `2px solid ${m.accent}` : "1px solid transparent",
              opacity: active ? 1 : 0.75,
            }}
          >
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <div className="text-[11px] font-bold uppercase tracking-wider" style={{ color: active ? m.accent : C.inkMute }}>
                  {m.eyebrow}
                </div>
                <div className="mt-0.5 text-xl font-bold tracking-tight" style={{ color: C.ink }}>
                  {m.title}
                </div>
                <p className="mt-1 text-sm leading-snug" style={{ color: C.inkMute }}>
                  {m.blurb}
                </p>
              </div>
              <div className="shrink-0 pt-1">{m.art}</div>
            </div>
            {active && (
              <motion.div
                layoutId="mode-underline"
                className="absolute inset-x-0 bottom-0 h-1"
                style={{ background: m.accent }}
                transition={SPRING}
              />
            )}
          </motion.button>
        );
      })}
    </div>
  );
}
