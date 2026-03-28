"use client";

import { Switch } from "@/components/ui/switch";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { WHAT_IF_EVENTS } from "@/lib/data/what-if-events";

interface WhatIfTogglesProps {
  whatIfEventIds: string[];
  onToggleEvent: (eventId: string) => void;
}

function formatCost(trillions: number): string {
  if (trillions >= 1) return `$${trillions.toFixed(1)}T`;
  return `$${(trillions * 1000).toFixed(0)}B`;
}

export function WhatIfToggles({
  whatIfEventIds,
  onToggleEvent,
}: WhatIfTogglesProps) {
  return (
    <div className="space-y-2">
      <div>
        <span className="text-[10px] uppercase tracking-wider text-zinc-500">
          What If...?
        </span>
        <p className="text-[9px] text-zinc-600 mt-0.5">
          Remove historical events
        </p>
      </div>

      <div className="space-y-1">
        <TooltipProvider>
          {WHAT_IF_EVENTS.map((event) => {
            const enabled = whatIfEventIds.includes(event.id);
            return (
              <div
                key={event.id}
                className="flex items-center justify-between py-1"
              >
                <Tooltip>
                  <TooltipTrigger
                    className={`flex items-center gap-1.5 text-xs transition-colors cursor-default text-left ${
                      enabled ? "text-white" : "text-zinc-400"
                    }`}
                    onClick={() => onToggleEvent(event.id)}
                  >
                    <span className="text-zinc-500 text-[10px] font-mono shrink-0">
                      {event.year}
                    </span>
                    <span className="leading-tight">
                      {event.name}
                      {event.totalCostTrillions != null && (
                        <span className="text-[10px] text-[#e94560] ml-1">
                          ({formatCost(event.totalCostTrillions)})
                        </span>
                      )}
                    </span>
                  </TooltipTrigger>
                  <TooltipContent
                    side="right"
                    className="max-w-xs text-xs"
                  >
                    <p>{event.description}</p>
                  </TooltipContent>
                </Tooltip>

                <Switch
                  checked={enabled}
                  onCheckedChange={() => onToggleEvent(event.id)}
                  className="data-checked:bg-[#e94560] shrink-0 ml-2"
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
