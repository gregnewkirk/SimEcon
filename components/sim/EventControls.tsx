"use client";

import { motion } from "framer-motion";
import { Switch } from "@/components/ui/switch";
import { COUNTER_EVENTS } from "@/lib/events/catalog";
import { getCitation } from "@/lib/citations";
import { C, SHADOW_SM } from "./theme";

/** The "What if we had..." event list. Toggling an event removes its cost from history. */
export function EventControls({
  events,
  toggleEvent,
}: {
  events: string[];
  toggleEvent: (id: string) => void;
}) {
  return (
    <div>
      <div className="mb-2 ml-1 text-[11px] font-semibold uppercase tracking-wider" style={{ color: C.inkMute }}>
        Remove a decision history made
      </div>
      <div className="overflow-hidden rounded-2xl" style={{ background: C.card, boxShadow: SHADOW_SM }}>
        {COUNTER_EVENTS.map((e, i) => {
          const cite = getCitation(e.citationId);
          return (
            <motion.label
              whileTap={{ scale: 0.985 }}
              key={e.id}
              className="flex items-center justify-between gap-3 px-3.5 py-3 text-[13px]"
              style={i === COUNTER_EVENTS.length - 1 ? {} : { borderBottom: `1px solid ${C.hair}` }}
              title={cite ? `${cite.agency} - ${cite.dataset}` : undefined}
            >
              <span>
                <span className="block" style={{ color: C.ink }}>{e.label}</span>
                <span className="text-[11px]" style={{ color: C.inkMute }}>~${e.annualCostB}B/yr, {e.startYear}-{e.endYear}</span>
              </span>
              <Switch checked={events.includes(e.id)} onCheckedChange={() => toggleEvent(e.id)} />
            </motion.label>
          );
        })}
      </div>
    </div>
  );
}
