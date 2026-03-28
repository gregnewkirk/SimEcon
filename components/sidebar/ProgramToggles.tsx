"use client";

import { Switch } from "@/components/ui/switch";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { PROGRAMS } from "@/lib/data/programs";
import { TaxSlider } from "./TaxSlider";

interface ProgramTogglesProps {
  enabledPrograms: string[];
  onToggle: (programId: string) => void;
  advancedMode?: boolean;
  programCostOverrides?: Record<string, number>;
  onProgramCostOverride?: (programId: string, multiplier: number) => void;
}

function formatCost(billions: number): string {
  if (Math.abs(billions) >= 1000) {
    return `$${(billions / 1000).toFixed(2)}T`;
  }
  return `$${billions.toFixed(0)}B`;
}

export function ProgramToggles({
  enabledPrograms,
  onToggle,
  advancedMode = false,
  programCostOverrides = {},
  onProgramCostOverride,
}: ProgramTogglesProps) {
  const spendingPrograms = PROGRAMS.filter((p) => p.netCostBillions >= 0);
  const revenuePrograms = PROGRAMS.filter((p) => p.netCostBillions < 0);

  const renderProgram = (program: (typeof PROGRAMS)[0]) => {
    const enabled = enabledPrograms.includes(program.id);
    const costMultiplier = programCostOverrides[program.id] ?? 1.0;
    const adjustedCost = program.netCostBillions * costMultiplier;
    const isRevenue = program.netCostBillions < 0;

    return (
      <div key={program.id}>
        <div className="flex items-center justify-between py-1">
          <Tooltip>
            <TooltipTrigger
              className={`flex items-center gap-1.5 text-sm transition-colors cursor-default ${
                enabled ? "text-[#1d1d1f]" : "text-[#c7c7cc]"
              }`}
              onClick={() => onToggle(program.id)}
            >
              <span>{program.icon}</span>
              <span>{program.name}</span>
              {enabled && (
                <span className={`text-[10px] font-semibold ${isRevenue ? "text-[#34c759]" : "text-[#ff3b30]"}`}>
                  {isRevenue ? `+${formatCost(Math.abs(adjustedCost))}` : `-${formatCost(adjustedCost)}`}
                </span>
              )}
            </TooltipTrigger>
            <TooltipContent
              side="right"
              className="max-w-xs text-xs space-y-1"
            >
              <p>{program.description}</p>
              <p className="font-mono">
                {isRevenue ? "Revenue" : "Net cost"}: {formatCost(Math.abs(adjustedCost))}/yr
                {costMultiplier !== 1.0 && (
                  <span className="text-[#86868b]">
                    {" "}(base: {formatCost(Math.abs(program.netCostBillions))})
                  </span>
                )}
              </p>
              <p className="text-[#86868b]">
                Source: {program.source.agency} ({program.source.year})
              </p>
              {program.warning && (
                <p className="text-amber-400">{program.warning}</p>
              )}
            </TooltipContent>
          </Tooltip>

          <Switch
            checked={enabled}
            onCheckedChange={() => onToggle(program.id)}
            className={isRevenue ? "data-checked:bg-[#34c759]" : "data-checked:bg-[#007AFF]"}
            size="sm"
          />
        </div>

        {advancedMode && enabled && onProgramCostOverride && (
          <div className="pl-6 pb-2">
            <TaxSlider
              label={`${isRevenue ? "Revenue" : "Cost"}: ${formatCost(Math.abs(adjustedCost))}/yr`}
              value={costMultiplier}
              defaultValue={1.0}
              onChange={(v) => onProgramCostOverride(program.id, v)}
              min={0.25}
              max={2.0}
              step={0.05}
              color={isRevenue ? "#34c759" : "#ff3b30"}
              suffix="×"
            />
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-3">
      {/* Spending programs */}
      <div className="space-y-1">
        <span className="text-xs uppercase tracking-wider font-semibold text-[#86868b]">
          Spending Programs
        </span>
        <TooltipProvider>
          {spendingPrograms.map(renderProgram)}
        </TooltipProvider>
      </div>

      {/* Revenue generators */}
      <div className="space-y-1">
        <span className="text-xs uppercase tracking-wider font-semibold text-[#34c759]">
          Revenue Generators
        </span>
        <TooltipProvider>
          {revenuePrograms.map(renderProgram)}
        </TooltipProvider>
      </div>
    </div>
  );
}
