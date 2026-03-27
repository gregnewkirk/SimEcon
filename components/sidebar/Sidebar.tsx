"use client";

import { Button } from "@/components/ui/button";
import { ScenarioSelector } from "./ScenarioSelector";
import { TaxControls } from "./TaxControls";
import { ProgramToggles } from "./ProgramToggles";
import { AdvancedAssumptions } from "./AdvancedAssumptions";
import type {
  SimulationState,
  TaxPolicy,
  AdvancedAssumptions as AdvancedAssumptionsType,
} from "@/lib/types";

interface SidebarProps {
  state: SimulationState;
  onScenarioChange: (id: string) => void;
  onTaxChange: (field: keyof TaxPolicy, value: number) => void;
  onProgramToggle: (programId: string) => void;
  onAssumptionsChange: (
    field: keyof AdvancedAssumptionsType,
    value: number
  ) => void;
  onAdvancedModeChange: (open: boolean) => void;
  onReset: () => void;
}

export function Sidebar({
  state,
  onScenarioChange,
  onTaxChange,
  onProgramToggle,
  onAssumptionsChange,
  onAdvancedModeChange,
  onReset,
}: SidebarProps) {
  return (
    <aside
      className="flex w-72 flex-col gap-6 overflow-y-auto border-r p-4"
      style={{
        backgroundColor: "var(--simecon-bg-sidebar)",
        borderColor: "var(--simecon-border)",
      }}
    >
      <ScenarioSelector
        scenarioId={state.scenarioId}
        onSelect={onScenarioChange}
      />

      <TaxControls
        policy={state.taxPolicy}
        advancedMode={state.advancedMode}
        onAdvancedModeChange={onAdvancedModeChange}
        onChange={onTaxChange}
      />

      <ProgramToggles
        enabledPrograms={state.enabledPrograms}
        onToggle={onProgramToggle}
      />

      <AdvancedAssumptions
        assumptions={state.assumptions}
        onChange={onAssumptionsChange}
      />

      <div className="mt-auto border-t pt-4" style={{ borderColor: "var(--simecon-border)" }}>
        <Button
          variant="ghost"
          size="sm"
          className="w-full text-zinc-400 hover:text-white"
          onClick={onReset}
        >
          Reset to Defaults
        </Button>
      </div>
    </aside>
  );
}
