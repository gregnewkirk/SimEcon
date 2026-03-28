"use client";

import type { SimMode } from "@/lib/types";
import { WHAT_IF_EVENTS } from "@/lib/data/what-if-events";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

interface WhatIfControlsProps {
  mode: SimMode;
  whatIfEventIds: string[];
  onModeChange: (mode: SimMode) => void;
  onToggleEvent: (eventId: string) => void;
}

function formatCost(trillions: number): string {
  if (trillions >= 1) return `$${trillions.toFixed(2)}T`;
  return `$${(trillions * 1000).toFixed(2)}B`;
}

export function WhatIfControls({
  mode,
  whatIfEventIds,
  onModeChange,
  onToggleEvent,
}: WhatIfControlsProps) {
  const selectedCount = whatIfEventIds.length;

  return (
    <div className="flex items-center gap-3">
      {/* Segmented toggle */}
      <div className="flex rounded-md border border-zinc-700 text-xs">
        <button
          className={`rounded-l-md px-3 py-1 transition-colors ${
            mode === "forward"
              ? "bg-[#e94560] text-white"
              : "text-zinc-400 hover:text-zinc-200"
          }`}
          onClick={() => onModeChange("forward")}
        >
          Simulate Forward
        </button>
        <button
          className={`rounded-r-md px-3 py-1 transition-colors ${
            mode === "whatif"
              ? "bg-[#e94560] text-white"
              : "text-zinc-400 hover:text-zinc-200"
          }`}
          onClick={() => onModeChange("whatif")}
        >
          Rewrite History
        </button>
      </div>

      {/* Event multi-select — shown only in what-if mode */}
      {mode === "whatif" && (
        <Popover>
          <PopoverTrigger
            className="flex items-center gap-1.5 rounded-md border border-zinc-700 px-3 py-1.5 text-xs text-zinc-300 transition-colors hover:border-zinc-500 hover:text-zinc-100"
          >
            <span>
              {selectedCount === 0
                ? "Select events..."
                : `${selectedCount} event${selectedCount !== 1 ? "s" : ""} selected`}
            </span>
            <svg
              width="12"
              height="12"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <polyline points="6 9 12 15 18 9" />
            </svg>
          </PopoverTrigger>
          <PopoverContent
            align="start"
            className="w-[340px] max-h-[400px] overflow-y-auto border-zinc-700 bg-[#1a1a2e] p-2"
          >
            {/* Spending Events */}
            <div className="px-2 py-1 text-[10px] font-semibold uppercase tracking-wider text-zinc-500">
              Spending Events
            </div>
            {WHAT_IF_EVENTS.filter(
              (e) => e.category === "spending" || e.category === "both"
            ).map((event) => {
              const checked = whatIfEventIds.includes(event.id);
              return (
                <label
                  key={event.id}
                  className={`flex cursor-pointer items-center gap-2 rounded-md px-2 py-1.5 text-xs transition-colors hover:bg-zinc-800 ${
                    checked ? "text-zinc-100" : "text-zinc-400"
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={checked}
                    onChange={() => onToggleEvent(event.id)}
                    className="size-3.5 rounded border-zinc-600 bg-zinc-800 text-[#e94560] accent-[#e94560]"
                  />
                  <span className="flex items-center gap-1.5">
                    <span className="text-zinc-500">{event.year}</span>
                    <span>{event.name}</span>
                    {event.totalCostTrillions != null && (
                      <span className="text-[10px] text-[#e94560]">
                        ({formatCost(event.totalCostTrillions)})
                      </span>
                    )}
                  </span>
                </label>
              );
            })}

            {/* Tax Policy Changes */}
            <div className="mt-1 px-2 py-1 text-[10px] font-semibold uppercase tracking-wider text-zinc-500">
              Tax Policy Changes
            </div>
            {WHAT_IF_EVENTS.filter((e) => e.category === "tax").map((event) => {
              const checked = whatIfEventIds.includes(event.id);
              return (
                <label
                  key={event.id}
                  className={`flex cursor-pointer items-center gap-2 rounded-md px-2 py-1.5 text-xs transition-colors hover:bg-zinc-800 ${
                    checked ? "text-zinc-100" : "text-zinc-400"
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={checked}
                    onChange={() => onToggleEvent(event.id)}
                    className="size-3.5 rounded border-zinc-600 bg-zinc-800 text-[#e94560] accent-[#e94560]"
                  />
                  <span className="flex items-center gap-1.5">
                    <span className="text-zinc-500">{event.year}</span>
                    <span>{event.name}</span>
                  </span>
                </label>
              );
            })}
          </PopoverContent>
        </Popover>
      )}
    </div>
  );
}
