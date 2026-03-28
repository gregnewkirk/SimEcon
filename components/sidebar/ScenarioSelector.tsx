"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { SCENARIOS } from "@/lib/data/scenarios";

interface ScenarioSelectorProps {
  scenarioId: string;
  onSelect: (id: string) => void;
}

export function ScenarioSelector({
  scenarioId,
  onSelect,
}: ScenarioSelectorProps) {
  const selected = SCENARIOS.find((s) => s.id === scenarioId);

  return (
    <div className="space-y-1.5">
      <span className="text-[10px] uppercase tracking-wider text-[#86868b]">
        Scenario
      </span>
      <Select value={scenarioId} onValueChange={(value) => { if (value !== null) onSelect(value); }}>
        <SelectTrigger
          className="w-full border-[var(--simecon-border)] bg-white"
        >
          <SelectValue placeholder="Select scenario" />
        </SelectTrigger>
        <SelectContent side="bottom" className="border-[#e5e5ea] bg-white max-h-[320px]">
          {SCENARIOS.map((s) => (
            <SelectItem key={s.id} value={s.id} className="py-2">
              <div>
                <div className="font-medium text-[#1d1d1f]">{s.name}</div>
                <div className="text-[10px] text-[#86868b] leading-tight mt-0.5 max-w-[200px]">{s.description}</div>
              </div>
            </SelectItem>
          ))}
          <SelectItem value="custom" className="py-2">
            <div>
              <div className="font-medium text-[#1d1d1f]">Custom</div>
              <div className="text-[10px] text-[#86868b] leading-tight mt-0.5">Your own tax rates and program choices</div>
            </div>
          </SelectItem>
        </SelectContent>
      </Select>
      {/* Explainer for selected scenario */}
      {selected && (
        <p className="text-[10px] text-[#86868b] leading-tight">
          {selected.description}
          {selected.source && (
            <span className="text-[#c7c7cc]"> — {selected.source}</span>
          )}
        </p>
      )}
    </div>
  );
}
