"use client";

import { Button } from "@/components/ui/button";
import { ModeToggle } from "./ModeToggle";
import { ScenarioSelector } from "./ScenarioSelector";
import { TaxControls } from "./TaxControls";
import { ProgramToggles } from "./ProgramToggles";
import { WhatIfToggles } from "./WhatIfToggles";
import { AdvancedAssumptions } from "./AdvancedAssumptions";
import type {
  SimulationState,
  SimMode,
  TaxPolicy,
  AdvancedAssumptions as AdvancedAssumptionsType,
} from "@/lib/types";

interface SidebarProps {
  state: SimulationState;
  onScenarioChange: (id: string) => void;
  onTaxChange: (field: keyof TaxPolicy, value: number) => void;
  onBracketChange: (index: number, rate: number) => void;
  onProgramToggle: (programId: string) => void;
  onProgramCostOverride: (programId: string, multiplier: number) => void;
  onAssumptionsChange: (
    field: keyof AdvancedAssumptionsType,
    value: number
  ) => void;
  onAdvancedModeChange: (open: boolean) => void;
  onReset: () => void;
  onToggleWhatIfEvent: (eventId: string) => void;
  onModeChange: (mode: SimMode) => void;
}

export function Sidebar({
  state,
  onScenarioChange,
  onTaxChange,
  onBracketChange,
  onProgramToggle,
  onProgramCostOverride,
  onAssumptionsChange,
  onAdvancedModeChange,
  onReset,
  onToggleWhatIfEvent,
  onModeChange,
}: SidebarProps) {
  return (
    <aside
      className="flex w-72 flex-col gap-6 overflow-y-auto border-r p-4"
      style={{
        backgroundColor: "var(--simecon-bg-sidebar)",
        borderColor: "var(--simecon-border)",
      }}
    >
      <ModeToggle mode={state.mode} onModeChange={onModeChange} />

      <ScenarioSelector
        scenarioId={state.scenarioId}
        onSelect={onScenarioChange}
      />

      <TaxControls
        policy={state.taxPolicy}
        advancedMode={state.advancedMode}
        onAdvancedModeChange={onAdvancedModeChange}
        onChange={onTaxChange}
        onBracketChange={onBracketChange}
      />

      <ProgramToggles
        enabledPrograms={state.enabledPrograms}
        onToggle={onProgramToggle}
        advancedMode={state.advancedMode}
        programCostOverrides={state.programCostOverrides}
        onProgramCostOverride={onProgramCostOverride}
      />

      <WhatIfToggles
        whatIfEventIds={state.whatIfEventIds}
        onToggleEvent={onToggleWhatIfEvent}
      />

      <AdvancedAssumptions
        assumptions={state.assumptions}
        onChange={onAssumptionsChange}
      />

      <div className="mt-auto border-t pt-4" style={{ borderColor: "var(--simecon-border)" }}>
        <Button
          variant="ghost"
          size="sm"
          className="w-full text-[#86868b] hover:text-[#1d1d1f]"
          onClick={onReset}
        >
          Reset to Defaults
        </Button>
      </div>
    </aside>
  );
}
