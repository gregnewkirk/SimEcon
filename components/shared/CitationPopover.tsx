"use client";

import type { ReactNode } from "react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

interface CitationData {
  agency: string;
  dataset: string;
  url: string;
  accessedDate: string;
}

interface CitationPopoverProps {
  citation: CitationData;
  children: ReactNode;
}

export function CitationPopover({ citation, children }: CitationPopoverProps) {
  return (
    <Popover>
      <PopoverTrigger className="cursor-pointer underline decoration-dotted underline-offset-2">
        {children}
      </PopoverTrigger>
      <PopoverContent className="w-72 bg-[#1a1a2e] text-xs">
        <div className="space-y-1.5">
          <p className="font-semibold text-zinc-200">{citation.agency}</p>
          <p className="text-zinc-400">{citation.dataset}</p>
          <p className="text-zinc-500">
            Accessed {citation.accessedDate}
          </p>
          <a
            href={citation.url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block text-[#4ecca3] hover:underline"
          >
            View source &rarr;
          </a>
        </div>
      </PopoverContent>
    </Popover>
  );
}
