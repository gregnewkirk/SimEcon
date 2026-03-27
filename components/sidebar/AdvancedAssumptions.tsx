"use client";

import { useState } from "react";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { TaxSlider } from "./TaxSlider";
import { DEFAULT_ASSUMPTIONS } from "@/lib/data/defaults";
import type { AdvancedAssumptions as AdvancedAssumptionsType } from "@/lib/types";

interface AdvancedAssumptionsProps {
  assumptions: AdvancedAssumptionsType;
  onChange: (field: keyof AdvancedAssumptionsType, value: number) => void;
}

export function AdvancedAssumptions({
  assumptions,
  onChange,
}: AdvancedAssumptionsProps) {
  const [open, setOpen] = useState(false);

  return (
    <Collapsible open={open} onOpenChange={setOpen}>
      <CollapsibleTrigger className="flex items-center gap-1.5 text-[10px] uppercase tracking-wider text-zinc-500 hover:text-zinc-300 transition-colors">
        <span>{open ? "\u25BE" : "\u25B8"}</span>
        <span className="text-sm">&#x2699;</span>
        Model Assumptions
      </CollapsibleTrigger>
      <CollapsibleContent className="mt-3 space-y-3">
        <TaxSlider
          label="GDP Growth"
          value={assumptions.gdpGrowthRate}
          defaultValue={DEFAULT_ASSUMPTIONS.gdpGrowthRate}
          onChange={(v) => onChange("gdpGrowthRate", v)}
          min={0}
          max={5.0}
          step={0.1}
          color="#4ade80"
          suffix="%"
        />
        <TaxSlider
          label="Interest Rate"
          value={assumptions.interestRate}
          defaultValue={DEFAULT_ASSUMPTIONS.interestRate}
          onChange={(v) => onChange("interestRate", v)}
          min={1.0}
          max={8.0}
          step={0.1}
          color="#60a5fa"
          suffix="%"
        />
        <TaxSlider
          label="Behavioral Elasticity"
          value={assumptions.behavioralElasticity}
          defaultValue={DEFAULT_ASSUMPTIONS.behavioralElasticity}
          onChange={(v) => onChange("behavioralElasticity", v)}
          min={0}
          max={1.0}
          step={0.01}
          color="#c084fc"
          suffix=""
        />
      </CollapsibleContent>
    </Collapsible>
  );
}
