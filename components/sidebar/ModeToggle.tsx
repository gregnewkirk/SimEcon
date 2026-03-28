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
      <span className="text-xs uppercase tracking-wider font-semibold text-[#86868b]">
        Simulation Mode
      </span>
      <div className="flex rounded-lg border overflow-hidden" style={{ borderColor: "var(--simecon-border)" }}>
        <button
          onClick={() => onModeChange("revision")}
          className={`flex-1 px-2 py-2 text-left transition-colors ${
            isRevision
              ? "bg-[#007AFF]/10 border-r"
              : "bg-transparent border-r hover:bg-[#f5f5f7]"
          }`}
          style={{ borderColor: "var(--simecon-border)" }}
        >
          <div
            className={`text-xs font-semibold leading-tight ${
              isRevision ? "text-[#007AFF]" : "text-[#86868b]"
            }`}
          >
            What If We Had...
          </div>
          <div className="text-[11px] text-[#86868b] leading-tight mt-0.5">
            Rewrite history with your policy
          </div>
        </button>
        <button
          onClick={() => onModeChange("fix")}
          className={`flex-1 px-2 py-2 text-left transition-colors ${
            isFix
              ? "bg-[#34c759]/10"
              : "bg-transparent hover:bg-[#f5f5f7]"
          }`}
        >
          <div
            className={`text-xs font-semibold leading-tight ${
              isFix ? "text-[#34c759]" : "text-[#86868b]"
            }`}
          >
            Fix This Mess
          </div>
          <div className="text-[11px] text-[#86868b] leading-tight mt-0.5">
            Change policy going forward
          </div>
        </button>
      </div>
    </div>
  );
}
