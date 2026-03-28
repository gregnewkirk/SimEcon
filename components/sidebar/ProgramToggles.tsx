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
  return (
    <div className="space-y-2">
      <span className="text-[10px] uppercase tracking-wider text-zinc-500">
        Programs
      </span>

      <div className="space-y-1">
        <TooltipProvider>
          {PROGRAMS.map((program) => {
            const enabled = enabledPrograms.includes(program.id);
            const costMultiplier = programCostOverrides[program.id] ?? 1.0;
            const adjustedCost = program.netCostBillions * costMultiplier;

            return (
              <div key={program.id}>
                <div className="flex items-center justify-between py-1">
                  <Tooltip>
                    <TooltipTrigger
                      className={`flex items-center gap-1.5 text-sm transition-colors cursor-default ${
                        enabled ? "text-white" : "text-zinc-400"
                      }`}
                      onClick={() => onToggle(program.id)}
                    >
                      <span>{program.icon}</span>
                      <span>{program.name}</span>
                    </TooltipTrigger>
                    <TooltipContent
                      side="right"
                      className="max-w-xs text-xs space-y-1"
                    >
                      <p>{program.description}</p>
                      <p className="font-mono">
                        Net cost: {formatCost(adjustedCost)}/yr
                        {costMultiplier !== 1.0 && (
                          <span className="text-zinc-500">
                            {" "}(base: {formatCost(program.netCostBillions)})
                          </span>
                        )}
                      </p>
                      <p className="text-zinc-500">
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
                    className="data-checked:bg-[#e94560]"
                    size="sm"
                  />
                </div>

                {/* Per-program cost slider — visible in advanced mode when enabled */}
                {advancedMode && enabled && onProgramCostOverride && (
                  <div className="pl-6 pb-2">
                    <TaxSlider
                      label={`Cost: ${formatCost(adjustedCost)}/yr`}
                      value={costMultiplier}
                      defaultValue={1.0}
                      onChange={(v) => onProgramCostOverride(program.id, v)}
                      min={0.25}
                      max={2.0}
                      step={0.05}
                      color="#e94560"
                      suffix="×"
                    />
                  </div>
                )}
              </div>
            );
          })}
        </TooltipProvider>
      </div>
    </div>
  );
}
