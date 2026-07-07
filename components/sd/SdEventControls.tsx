"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Switch } from "@/components/ui/switch";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { ChevronRight } from "lucide-react";
import { SD_COUNTER_EVENTS, SD_EVENT_CATEGORIES, SD_CAT_ICON, type SdEventCategory } from "@/lib/sd/events";
import { getCitation } from "@/lib/citations";
import { C, SHADOW_SM } from "@/components/sim/theme";

/**
 * The "What if we had..." list for San Diego, grouped by saga and collapsible. Each event
 * carries a one-line story: these are real council votes, ballot measures, and deals.
 */
export function SdEventControls({
  events,
  toggleEvent,
  setEventsBulk,
}: {
  events: string[];
  toggleEvent: (id: string) => void;
  setEventsBulk: (ids: string[], on: boolean) => void;
}) {
  return (
    <div>
      <div className="mb-2 ml-1 text-[11px] font-semibold uppercase tracking-wider" style={{ color: C.inkMute }}>
        Undo decisions the city actually made
      </div>
      {SD_EVENT_CATEGORIES.map((cat) => (
        <CategorySection key={cat} category={cat} events={events} toggleEvent={toggleEvent} setEventsBulk={setEventsBulk} />
      ))}
    </div>
  );
}

function CategorySection({
  category,
  events,
  toggleEvent,
  setEventsBulk,
}: {
  category: SdEventCategory;
  events: string[];
  toggleEvent: (id: string) => void;
  setEventsBulk: (ids: string[], on: boolean) => void;
}) {
  const [open, setOpen] = useState(category === "The pension scandal");
  const items = SD_COUNTER_EVENTS.filter((e) => e.category === category);
  const selected = items.filter((e) => events.includes(e.id));
  const allOn = selected.length === items.length;

  return (
    <div className="mb-2.5 overflow-hidden rounded-2xl" style={{ background: C.card, boxShadow: SHADOW_SM }}>
      <Collapsible open={open} onOpenChange={setOpen}>
        <div className="flex items-center gap-2 pr-2.5">
          <CollapsibleTrigger className="flex flex-1 items-center justify-between gap-2 px-3.5 py-3 text-left">
            <span className="flex items-center gap-1.5 text-[13px] font-medium" style={{ color: C.ink }}>
              <ChevronRight className={`size-4 transition-transform ${open ? "rotate-90" : ""}`} style={{ color: C.inkMute }} />
              <span aria-hidden>{SD_CAT_ICON[category]}</span>
              {category}
            </span>
            {selected.length > 0 ? (
              <span className="rounded-full px-1.5 py-0.5 text-[10px] font-semibold" style={{ background: C.accent, color: "#fff" }}>{selected.length} on</span>
            ) : (
              <span className="text-xs" style={{ color: C.inkMute }}>{items.length}</span>
            )}
          </CollapsibleTrigger>
          <motion.button
            type="button"
            whileTap={{ scale: 0.92 }}
            onClick={(e) => { e.stopPropagation(); setEventsBulk(items.map((it) => it.id), !allOn); }}
            className="rounded-full px-2.5 py-1 text-[11px] font-semibold"
            style={allOn ? { background: "#F0F0F3", color: C.inkMute } : { background: C.accent, color: "#fff" }}
          >
            {allOn ? "Clear" : "All"}
          </motion.button>
        </div>
        <CollapsibleContent style={{ borderTop: `1px solid ${C.hair}` }}>
          {items.map((e, i) => {
            const cite = getCitation(e.citationId);
            return (
              <motion.label
                whileTap={{ scale: 0.985 }}
                key={e.id}
                className="flex items-start justify-between gap-3 px-3.5 py-3 text-[13px]"
                style={i === items.length - 1 ? {} : { borderBottom: `1px solid ${C.hair}` }}
                title={cite ? `${cite.agency} - ${cite.dataset}` : undefined}
              >
                <span className="min-w-0">
                  <span className="block" style={{ color: C.ink }}>{e.label}</span>
                  <span className="block text-[11px] leading-snug" style={{ color: C.inkMute }}>{e.blurb}</span>
                  <span className="mt-0.5 block font-mono text-[11px]" style={{ color: C.amber }}>
                    ~${e.annualCostM.toLocaleString("en-US")}M/yr, {e.startYear}-{e.endYear}
                    {e.ongoingAnnualM ? ` · still $${e.ongoingAnnualM.toLocaleString("en-US")}M/yr today` : ""}
                  </span>
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
