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
      <PopoverContent className="w-72 bg-white border-[#e5e5ea] text-xs">
        <div className="space-y-1.5">
          <p className="font-semibold text-[#1d1d1f]">{citation.agency}</p>
          <p className="text-[#86868b]">{citation.dataset}</p>
          <p className="text-[#c7c7cc]">
            Accessed {citation.accessedDate}
          </p>
          <a
            href={citation.url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block text-[#007AFF] hover:underline"
          >
            View source &rarr;
          </a>
        </div>
      </PopoverContent>
    </Popover>
  );
}
