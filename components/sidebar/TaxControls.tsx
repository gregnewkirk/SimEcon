"use client";

import { useState } from "react";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { TaxSlider } from "./TaxSlider";
import { CURRENT_POLICY, DEFAULT_BRACKETS } from "@/lib/data/defaults";
import type { TaxPolicy } from "@/lib/types";

interface TaxControlsProps {
  policy: TaxPolicy;
  advancedMode: boolean;
  onAdvancedModeChange: (open: boolean) => void;
  onChange: (field: keyof TaxPolicy, value: number) => void;
  onBracketChange?: (index: number, rate: number) => void;
}

export function TaxControls({
  policy,
  advancedMode,
  onAdvancedModeChange,
  onChange,
  onBracketChange,
}: TaxControlsProps) {
  const [open, setOpen] = useState(false);

  // Top bracket is the last one
  const topBracketIndex = (policy.brackets?.length ?? 1) - 1;
  const topBracketRate = policy.brackets?.[topBracketIndex]?.rate ?? policy.topMarginalRate;

  const handleTopBracketChange = (value: number) => {
    onChange("topMarginalRate", value);
    // Also update the top bracket
    if (onBracketChange) {
      onBracketChange(topBracketIndex, value);
    }
  };

  return (
    <div className="space-y-3">
      <span className="text-[10px] uppercase tracking-wider text-zinc-500">
        Tax Rates
      </span>

      {/* Simple mode: just the top bracket */}
      <TaxSlider
        label="Top Bracket Rate ($578K+)"
        value={topBracketRate}
        defaultValue={CURRENT_POLICY.topMarginalRate}
        onChange={handleTopBracketChange}
      />

      <Collapsible open={open} onOpenChange={setOpen}>
        <CollapsibleTrigger className="flex items-center gap-1.5 text-[10px] uppercase tracking-wider text-zinc-500 hover:text-zinc-300 transition-colors">
          <span className="text-[8px]">{open ? "\u25BE" : "\u25B8"}</span>
          All Tax Brackets
        </CollapsibleTrigger>
        <CollapsibleContent className="mt-2 space-y-3">
          {/* Show all 7 brackets */}
          {policy.brackets?.map((bracket, index) => {
            // Skip the top bracket since it's already shown above
            if (index === topBracketIndex) return null;
            const defaultBracket = DEFAULT_BRACKETS[index];
            return (
              <TaxSlider
                key={bracket.label}
                label={bracket.label}
                value={bracket.rate}
                defaultValue={defaultBracket?.defaultRate ?? bracket.defaultRate}
                onChange={(v) => {
                  if (onBracketChange) {
                    onBracketChange(index, v);
                  }
                }}
              />
            );
          })}

          <div className="mt-1 border-t border-zinc-800 pt-3">
            <span className="text-[10px] uppercase tracking-wider text-zinc-500">
              Other Rates
            </span>
          </div>
          <TaxSlider
            label="Capital Gains"
            value={policy.capitalGainsRate}
            defaultValue={CURRENT_POLICY.capitalGainsRate}
            onChange={(v) => onChange("capitalGainsRate", v)}
            color="#f0a500"
          />
          <TaxSlider
            label="Corporate"
            value={policy.corporateRate}
            defaultValue={CURRENT_POLICY.corporateRate}
            onChange={(v) => onChange("corporateRate", v)}
            color="#0f3460"
          />
          <TaxSlider
            label="Estate"
            value={policy.estateRate}
            defaultValue={CURRENT_POLICY.estateRate}
            onChange={(v) => onChange("estateRate", v)}
            color="#533483"
          />
        </CollapsibleContent>
      </Collapsible>
    </div>
  );
}
