"use client";

import { motion, AnimatePresence } from "framer-motion";
import { C } from "./theme";

const COLORS = [C.greenFill, C.accent, C.amberFill, "#FF2D55", "#5856D6", "#34C759"];

/**
 * A one-shot confetti burst. Increment `trigger` to fire it (e.g. when the budget hits a
 * surplus). Pure decoration, pointer-events none, respects reduced motion by not firing.
 */
export function Confetti({ trigger }: { trigger: number }) {
  const reduce =
    typeof window !== "undefined" && window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
  if (reduce) return null;
  return (
    <AnimatePresence>
      {trigger > 0 && (
        <div key={trigger} className="pointer-events-none fixed inset-0 z-50 overflow-hidden">
          {Array.from({ length: 90 }).map((_, i) => {
            const left = Math.random() * 100;
            const delay = Math.random() * 0.15;
            const duration = 1.4 + Math.random() * 1.1;
            const size = 6 + Math.random() * 8;
            const color = COLORS[i % COLORS.length];
            const drift = (Math.random() - 0.5) * 240;
            const rotate = (Math.random() - 0.5) * 720;
            return (
              <motion.div
                key={i}
                initial={{ x: 0, y: -40, opacity: 1, rotate: 0 }}
                animate={{ x: drift, y: "105vh", opacity: [1, 1, 0.9, 0], rotate }}
                transition={{ duration, delay, ease: "easeIn" }}
                style={{
                  position: "absolute",
                  left: `${left}%`,
                  top: 0,
                  width: size,
                  height: size * 1.4,
                  background: color,
                  borderRadius: 2,
                }}
              />
            );
          })}
        </div>
      )}
    </AnimatePresence>
  );
}
