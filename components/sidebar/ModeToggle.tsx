"use client";

import type { SimMode } from "@/lib/types";

interface ModeToggleProps {
  mode: SimMode;
  onModeChange: (mode: SimMode) => void;
}

export function ModeToggle({ mode, onModeChange }: ModeToggleProps) {
  const isRevision = mode === "revision";
  const isFix = mode === "fix" || mode === "forward" || mode === "whatif";

  return (
    <div className="space-y-1.5">
      <span className="text-[10px] uppercase tracking-wider text-zinc-500">
        Simulation Mode
      </span>
      <div className="flex rounded-lg border overflow-hidden" style={{ borderColor: "var(--simecon-border)" }}>
        <button
          onClick={() => onModeChange("revision")}
          className={`flex-1 px-2 py-2 text-left transition-colors ${
            isRevision
              ? "bg-[#e94560]/15 border-r"
              : "bg-transparent border-r hover:bg-zinc-800/50"
          }`}
          style={{ borderColor: "var(--simecon-border)" }}
        >
          <div
            className={`text-xs font-semibold leading-tight ${
              isRevision ? "text-[#e94560]" : "text-zinc-400"
            }`}
          >
            What If We Had...
          </div>
          <div className="text-[9px] text-zinc-500 leading-tight mt-0.5">
            Rewrite history with your policy
          </div>
        </button>
        <button
          onClick={() => onModeChange("fix")}
          className={`flex-1 px-2 py-2 text-left transition-colors ${
            isFix
              ? "bg-[#4ecca3]/15"
              : "bg-transparent hover:bg-zinc-800/50"
          }`}
        >
          <div
            className={`text-xs font-semibold leading-tight ${
              isFix ? "text-[#4ecca3]" : "text-zinc-400"
            }`}
          >
            Fix This Mess
          </div>
          <div className="text-[9px] text-zinc-500 leading-tight mt-0.5">
            Change policy going forward
          </div>
        </button>
      </div>
    </div>
  );
}
