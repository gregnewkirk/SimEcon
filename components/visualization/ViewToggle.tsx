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
          : "bg-transparent text-[#86868b] hover:text-[#1d1d1f]"
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
      <div className="flex items-center rounded-full border border-[#e5e5ea] bg-white shadow-sm p-0.5">
        <ToggleButton
          label="Simple"
          active={complexity === "simple"}
          activeColor="#007AFF"
          onClick={() => onComplexityChange("simple")}
        />
        <ToggleButton
          label="Advanced"
          active={complexity === "advanced"}
          activeColor="#007AFF"
          onClick={() => onComplexityChange("advanced")}
        />
      </div>

      {/* Right toggle: perspective */}
      <div className="flex items-center rounded-full border border-[#e5e5ea] bg-white shadow-sm p-0.5">
        <ToggleButton
          label="Macro"
          active={perspective === "macro"}
          activeColor="#007AFF"
          onClick={() => onPerspectiveChange("macro")}
        />
        <ToggleButton
          label="Kitchen Table"
          active={perspective === "kitchen"}
          activeColor="#007AFF"
          onClick={() => onPerspectiveChange("kitchen")}
        />
      </div>
    </div>
  );
}
