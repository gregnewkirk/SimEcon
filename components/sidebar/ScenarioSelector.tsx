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
  return (
    <div className="space-y-1.5">
      <span className="text-[10px] uppercase tracking-wider text-zinc-500">
        Scenario
      </span>
      <Select value={scenarioId} onValueChange={(value) => { if (value !== null) onSelect(value); }}>
        <SelectTrigger
          className="w-full border-[var(--simecon-border)] bg-zinc-800/50"
        >
          <SelectValue placeholder="Select scenario" />
        </SelectTrigger>
        <SelectContent className="border-[var(--simecon-border)] bg-zinc-800">
          {SCENARIOS.map((s) => (
            <SelectItem key={s.id} value={s.id}>
              {s.name}
            </SelectItem>
          ))}
          <SelectItem value="custom">Custom</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}
