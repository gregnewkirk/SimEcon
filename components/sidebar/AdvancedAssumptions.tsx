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
        {/* ── Macroeconomic ── */}
        <div className="text-[9px] uppercase tracking-widest text-zinc-600 pt-1">Macro</div>
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
          label="Inflation Rate"
          value={assumptions.inflationRate}
          defaultValue={DEFAULT_ASSUMPTIONS.inflationRate}
          onChange={(v) => onChange("inflationRate", v)}
          min={0}
          max={8.0}
          step={0.1}
          color="#fb923c"
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

        {/* ── Behavioral ── */}
        <div className="text-[9px] uppercase tracking-widest text-zinc-600 pt-1">Behavioral</div>
        <TaxSlider
          label="Tax Elasticity"
          value={assumptions.behavioralElasticity}
          defaultValue={DEFAULT_ASSUMPTIONS.behavioralElasticity}
          onChange={(v) => onChange("behavioralElasticity", v)}
          min={0}
          max={1.0}
          step={0.01}
          color="#c084fc"
          suffix=""
        />
        <TaxSlider
          label="Fiscal Multiplier"
          value={assumptions.fiscalMultiplier}
          defaultValue={DEFAULT_ASSUMPTIONS.fiscalMultiplier}
          onChange={(v) => onChange("fiscalMultiplier", v)}
          min={0.5}
          max={2.5}
          step={0.1}
          color="#f472b6"
          suffix="×"
        />

        {/* ── Program Costs ── */}
        <div className="text-[9px] uppercase tracking-widest text-zinc-600 pt-1">Program Costs</div>
        <TaxSlider
          label="Cost Scenario"
          value={assumptions.programCostMultiplier}
          defaultValue={DEFAULT_ASSUMPTIONS.programCostMultiplier}
          onChange={(v) => onChange("programCostMultiplier", v)}
          min={0.5}
          max={1.75}
          step={0.05}
          color="#e94560"
          suffix="×"
        />
        <p className="text-[9px] text-zinc-600 leading-tight">
          Scales all program net costs relative to CBO baseline. 1.0 = CBO estimate. Costs also grow at inflation rate each year.
        </p>
      </CollapsibleContent>
    </Collapsible>
  );
}
