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
        <span className="text-xs uppercase tracking-wider font-semibold text-[#86868b]">
          What If...?
        </span>
        <p className="text-[11px] text-[#86868b] mt-0.5">
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
                      enabled ? "text-[#1d1d1f]" : "text-[#86868b]"
                    }`}
                    onClick={() => onToggleEvent(event.id)}
                  >
                    <span className="text-[#86868b] text-xs font-mono shrink-0">
                      {event.year}
                    </span>
                    <span className="leading-tight">
                      {event.name}
                      {event.totalCostTrillions != null && (
                        <span className="text-xs text-[#ff3b30] ml-1">
                          ({formatCost(event.totalCostTrillions)})
                        </span>
                      )}
                    </span>
                  </TooltipTrigger>
                  <TooltipContent
                    side="right"
                    className="max-w-sm text-xs leading-relaxed"
                  >
                    <p className="font-semibold text-[#1d1d1f] mb-1">{event.name}</p>
                    <p className="text-[#86868b]">{event.description}</p>
                  </TooltipContent>
                </Tooltip>

                <Switch
                  checked={enabled}
                  onCheckedChange={() => onToggleEvent(event.id)}
                  className="data-checked:bg-[#007AFF] shrink-0 ml-2"
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
