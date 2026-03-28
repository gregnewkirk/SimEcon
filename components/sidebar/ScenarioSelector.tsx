"use client";

import { useMemo } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { SCENARIOS } from "@/lib/data/scenarios";
import type { SimMode } from "@/lib/types";

interface ScenarioSelectorProps {
  scenarioId: string;
  mode: SimMode;
  onSelect: (id: string) => void;
}

export function ScenarioSelector({
  scenarioId,
  mode,
  onSelect,
}: ScenarioSelectorProps) {
  const isRevision = mode === "revision";

  // Filter scenarios to only show ones relevant to the current mode
  const filteredScenarios = useMemo(() =>
    SCENARIOS.filter((s) => {
      if (!s.mode || s.mode === "both") return true;
      return s.mode === (isRevision ? "revision" : "fix");
    }),
    [isRevision]
  );

  const selected = SCENARIOS.find((s) => s.id === scenarioId);

  return (
    <div className="space-y-1.5">
      <span className="text-xs uppercase tracking-wider font-semibold text-[#86868b]">
        {isRevision ? "Historical Scenario" : "Policy Scenario"}
      </span>
      <Select value={scenarioId} onValueChange={(value) => { if (value !== null) onSelect(value); }}>
        <SelectTrigger
          className="w-full border-[var(--simecon-border)] bg-white"
        >
          <SelectValue placeholder="Select scenario" />
        </SelectTrigger>
        <SelectContent side="bottom" className="border-[#e5e5ea] bg-white w-[320px]">
          {filteredScenarios.map((s) => (
            <SelectItem key={s.id} value={s.id} className="py-2.5">
              <div>
                <div className="text-sm font-semibold text-[#1d1d1f]">{s.name}</div>
                <div className="text-xs text-[#86868b] leading-snug mt-0.5 whitespace-normal">{s.description}</div>
              </div>
            </SelectItem>
          ))}
          <SelectItem value="custom" className="py-2.5">
            <div>
              <div className="text-sm font-semibold text-[#1d1d1f]">Custom</div>
              <div className="text-xs text-[#86868b] leading-snug mt-0.5">Your own tax rates and program choices</div>
            </div>
          </SelectItem>
        </SelectContent>
      </Select>
      {selected && (
        <p className="text-xs text-[#86868b] leading-tight">
          {selected.description}
          {selected.source && (
            <span className="text-[#c7c7cc]"> — {selected.source}</span>
          )}
        </p>
      )}
    </div>
  );
}
