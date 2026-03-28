"use client";

import type { SimMode } from "@/lib/types";
import { WHAT_IF_EVENTS } from "@/lib/data/what-if-events";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface WhatIfControlsProps {
  mode: SimMode;
  whatIfEventId: string | undefined;
  onModeChange: (mode: SimMode) => void;
  onEventChange: (eventId: string) => void;
}

export function WhatIfControls({
  mode,
  whatIfEventId,
  onModeChange,
  onEventChange,
}: WhatIfControlsProps) {
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

      {/* Event selector — shown only in what-if mode */}
      {mode === "whatif" && (
        <Select
          value={whatIfEventId ?? WHAT_IF_EVENTS[0].id}
          onValueChange={(value) => { if (value) onEventChange(value); }}
        >
          <SelectTrigger className="w-[260px] border-zinc-700 text-xs text-zinc-300">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <div className="px-2 py-1 text-[10px] font-semibold uppercase tracking-wider text-zinc-500">
              Spending Events
            </div>
            {WHAT_IF_EVENTS.filter((e) => e.category === "spending" || e.category === "both").map(
              (event) => (
                <SelectItem key={event.id} value={event.id}>
                  <span className="flex items-center gap-1.5">
                    <span className="text-zinc-500">{event.year}</span>
                    <span>{event.name}</span>
                    {event.totalCostTrillions && (
                      <span className="text-[10px] text-[#e94560]">
                        (${event.totalCostTrillions}T)
                      </span>
                    )}
                  </span>
                </SelectItem>
              )
            )}
            <div className="px-2 py-1 text-[10px] font-semibold uppercase tracking-wider text-zinc-500 mt-1">
              Tax Policy Changes
            </div>
            {WHAT_IF_EVENTS.filter((e) => e.category === "tax").map((event) => (
              <SelectItem key={event.id} value={event.id}>
                <span className="flex items-center gap-1.5">
                  <span className="text-zinc-500">{event.year}</span>
                  <span>{event.name}</span>
                </span>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      )}
    </div>
  );
}
