"use client";

import type { ViewComplexity, ViewPerspective } from "@/lib/types";

interface ViewToggleProps {
  complexity: ViewComplexity;
  perspective: ViewPerspective;
  onComplexityChange: (v: ViewComplexity) => void;
  onPerspectiveChange: (v: ViewPerspective) => void;
}

function ToggleButton({
  label,
  active,
  activeColor,
  onClick,
}: {
  label: string;
  active: boolean;
  activeColor: string;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`rounded-full px-4 py-1.5 text-xs font-medium transition-all ${
        active
          ? "text-white shadow-sm"
          : "bg-transparent text-zinc-400 hover:text-zinc-200"
      }`}
      style={active ? { backgroundColor: activeColor } : undefined}
    >
      {label}
    </button>
  );
}

export function ViewToggle({
  complexity,
  perspective,
  onComplexityChange,
  onPerspectiveChange,
}: ViewToggleProps) {
  return (
    <div className="flex flex-wrap items-center gap-3">
      {/* Left toggle: complexity */}
      <div className="flex items-center rounded-full border border-zinc-700/50 bg-zinc-900/60 p-0.5">
        <ToggleButton
          label="Simple"
          active={complexity === "simple"}
          activeColor="#e94560"
          onClick={() => onComplexityChange("simple")}
        />
        <ToggleButton
          label="Advanced"
          active={complexity === "advanced"}
          activeColor="#e94560"
          onClick={() => onComplexityChange("advanced")}
        />
      </div>

      {/* Right toggle: perspective */}
      <div className="flex items-center rounded-full border border-zinc-700/50 bg-zinc-900/60 p-0.5">
        <ToggleButton
          label="Macro"
          active={perspective === "macro"}
          activeColor="#4ecca3"
          onClick={() => onPerspectiveChange("macro")}
        />
        <ToggleButton
          label="Kitchen Table"
          active={perspective === "kitchen"}
          activeColor="#4ecca3"
          onClick={() => onPerspectiveChange("kitchen")}
        />
      </div>
    </div>
  );
}
