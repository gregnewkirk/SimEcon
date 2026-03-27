"use client";

import { useState } from "react";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { TaxSlider } from "./TaxSlider";
import { CURRENT_POLICY } from "@/lib/data/defaults";
import type { TaxPolicy } from "@/lib/types";

interface TaxControlsProps {
  policy: TaxPolicy;
  advancedMode: boolean;
  onAdvancedModeChange: (open: boolean) => void;
  onChange: (field: keyof TaxPolicy, value: number) => void;
}

export function TaxControls({
  policy,
  advancedMode,
  onAdvancedModeChange,
  onChange,
}: TaxControlsProps) {
  const [open, setOpen] = useState(false);

  return (
    <div className="space-y-3">
      <span className="text-[10px] uppercase tracking-wider text-zinc-500">
        Tax Rates
      </span>

      <TaxSlider
        label="Top Marginal Rate"
        value={policy.topMarginalRate}
        defaultValue={CURRENT_POLICY.topMarginalRate}
        onChange={(v) => onChange("topMarginalRate", v)}
      />

      <Collapsible open={open} onOpenChange={setOpen}>
        <CollapsibleTrigger className="flex items-center gap-1.5 text-[10px] uppercase tracking-wider text-zinc-500 hover:text-zinc-300 transition-colors">
          <span className="text-[8px]">{open ? "\u25BE" : "\u25B8"}</span>
          Advanced Tax Controls
        </CollapsibleTrigger>
        <CollapsibleContent className="mt-2 space-y-3">
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
