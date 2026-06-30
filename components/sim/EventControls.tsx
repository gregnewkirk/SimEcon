"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Switch } from "@/components/ui/switch";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { ChevronRight } from "lucide-react";
import { COUNTER_EVENTS, EVENT_CATEGORIES, type EventCategory } from "@/lib/events/catalog";
import { getCitation } from "@/lib/citations";
import { C, SHADOW_SM } from "./theme";

const CAT_ICON: Record<EventCategory, string> = {
  "Wars & military": "🪖",
  "Tax cuts": "✂️",
  "Crises & bailouts": "🚨",
  "Program expansions": "🏛️",
};

/**
 * The "What if we had..." list, grouped by category and collapsible. Each header shows how
 * many events are selected and the total annual cost removed, so the list stays compact.
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
      <div className="mb-2 ml-1 text-[11px] font-semibold uppercase tracking-wider" style={{ color: C.inkMute }}>
        Remove decisions the country actually made
      </div>
      {EVENT_CATEGORIES.map((cat) => (
        <CategorySection key={cat} category={cat} events={events} toggleEvent={toggleEvent} />
      ))}
    </div>
  );
}

function CategorySection({
  category,
  events,
  toggleEvent,
}: {
  category: EventCategory;
  events: string[];
  toggleEvent: (id: string) => void;
}) {
  const [open, setOpen] = useState(category === "Wars & military");
  const items = COUNTER_EVENTS.filter((e) => e.category === category);
  const selected = items.filter((e) => events.includes(e.id));
  const removedPerYear = selected.reduce((s, e) => s + e.annualCostB, 0);

  return (
    <div className="mb-2.5 overflow-hidden rounded-2xl" style={{ background: C.card, boxShadow: SHADOW_SM }}>
      <Collapsible open={open} onOpenChange={setOpen}>
        <CollapsibleTrigger className="flex w-full items-center justify-between gap-2 px-3.5 py-3 text-left">
          <span className="flex items-center gap-1.5 text-[13px] font-medium" style={{ color: C.ink }}>
            <ChevronRight className={`size-4 transition-transform ${open ? "rotate-90" : ""}`} style={{ color: C.inkMute }} />
            <span aria-hidden>{CAT_ICON[category]}</span>
            {category}
          </span>
          {selected.length > 0 ? (
            <span className="flex items-center gap-1.5">
              <span className="rounded-full px-1.5 py-0.5 text-[10px] font-semibold" style={{ background: C.accent, color: "#fff" }}>{selected.length} on</span>
              <span className="font-mono text-xs font-semibold tabular-nums" style={{ color: C.green }}>-${removedPerYear}B/yr</span>
            </span>
          ) : (
            <span className="text-xs" style={{ color: C.inkMute }}>{items.length}</span>
          )}
        </CollapsibleTrigger>
        <CollapsibleContent style={{ borderTop: `1px solid ${C.hair}` }}>
          {items.map((e, i) => {
            const cite = getCitation(e.citationId);
            return (
              <motion.label
                whileTap={{ scale: 0.985 }}
                key={e.id}
                className="flex items-center justify-between gap-3 px-3.5 py-3 text-[13px]"
                style={i === items.length - 1 ? {} : { borderBottom: `1px solid ${C.hair}` }}
                title={cite ? `${cite.agency} - ${cite.dataset}` : undefined}
              >
                <span className="min-w-0">
                  <span className="block truncate" style={{ color: C.ink }}>{e.label}</span>
                  <span className="text-[11px]" style={{ color: C.inkMute }}>~${e.annualCostB}B/yr, {e.startYear}-{e.endYear}</span>
                </span>
                <Switch checked={events.includes(e.id)} onCheckedChange={() => toggleEvent(e.id)} />
              </motion.label>
            );
          })}
        </CollapsibleContent>
      </Collapsible>
    </div>
  );
}
