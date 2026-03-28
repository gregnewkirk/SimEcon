"use client";

import { Switch } from "@/components/ui/switch";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { PROGRAMS } from "@/lib/data/programs";

interface ProgramTogglesProps {
  enabledPrograms: string[];
  onToggle: (programId: string) => void;
}

export function ProgramToggles({
  enabledPrograms,
  onToggle,
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
            return (
              <div
                key={program.id}
                className="flex items-center justify-between py-1"
              >
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
                      Net cost: ${Math.abs(program.netCostBillions) >= 1000 ? `${(program.netCostBillions / 1000).toFixed(2)}T` : `${program.netCostBillions.toFixed(2)}B`}/yr
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
            );
          })}
        </TooltipProvider>
      </div>
    </div>
  );
}
