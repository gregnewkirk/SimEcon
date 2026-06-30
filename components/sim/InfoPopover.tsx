"use client";

import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Info } from "lucide-react";
import { C } from "./theme";

/** Small info dot that opens a short explanation popover. */
export function InfoPopover({ title, children }: { title?: string; children: React.ReactNode }) {
  return (
    <Popover>
      <PopoverTrigger aria-label={title ?? "More info"} className="inline-flex items-center transition-colors" style={{ color: C.inkMute }}>
        <Info className="size-4" />
      </PopoverTrigger>
      <PopoverContent align="end" className="w-80 text-xs" style={{ color: C.ink }}>
        {title && <p className="mb-1 text-sm font-semibold">{title}</p>}
        <p className="leading-relaxed" style={{ color: C.inkMute }}>{children}</p>
      </PopoverContent>
    </Popover>
  );
}
