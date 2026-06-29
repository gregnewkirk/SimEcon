"use client";

import { Switch } from "@/components/ui/switch";
import { COUNTER_EVENTS } from "@/lib/events/catalog";
import { getCitation } from "@/lib/citations";

/**
 * The "What if we had..." event list. Toggling an event removes its cost from the
 * counterfactual timeline. Each is a real, dated, cited fiscal event.
 */
export function EventControls({
  events,
  toggleEvent,
}: {
  events: string[];
  toggleEvent: (id: string) => void;
}) {
  return (
    <div>
      <h3 className="mb-2 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
        Remove a decision history actually made
      </h3>
      <div className="divide-y divide-border/40">
        {COUNTER_EVENTS.map((e) => {
          const cite = getCitation(e.citationId);
          return (
            <label key={e.id} className="flex items-center justify-between gap-3 py-2 text-xs" title={cite ? `${cite.agency} - ${cite.dataset}` : undefined}>
              <span>
                <span className="block">{e.label}</span>
                <span className="text-[10px] text-muted-foreground">
                  ~${e.annualCostB}B/yr, {e.startYear}-{e.endYear}
                </span>
              </span>
              <Switch checked={events.includes(e.id)} onCheckedChange={() => toggleEvent(e.id)} />
            </label>
          );
        })}
      </div>
    </div>
  );
}
