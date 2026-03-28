"use client";

import { useCallback, useState } from "react";
import type { SimMode } from "@/lib/types";
import { WhatIfControls } from "@/components/shared/WhatIfControls";

interface HeaderProps {
  onMenuToggle?: () => void;
  mode?: SimMode;
  whatIfEventId?: string;
  onModeChange?: (mode: SimMode) => void;
  onEventChange?: (eventId: string) => void;
}

export function Header({
  onMenuToggle,
  mode = "forward",
  whatIfEventId,
  onModeChange,
  onEventChange,
}: HeaderProps) {
  const [copied, setCopied] = useState(false);

  const handleShare = useCallback(() => {
    navigator.clipboard.writeText(window.location.href).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }, []);

  return (
    <header className="flex items-center justify-between border-b border-zinc-800 bg-card px-4 py-2">
      <div className="flex items-center gap-2">
        {/* Hamburger menu — visible below lg */}
        {onMenuToggle && (
          <button
            onClick={onMenuToggle}
            className="mr-1 flex size-8 items-center justify-center rounded-md text-zinc-400 hover:bg-zinc-800 hover:text-zinc-200 lg:hidden"
            aria-label="Toggle sidebar"
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 20 20"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
            >
              <line x1="3" y1="5" x2="17" y2="5" />
              <line x1="3" y1="10" x2="17" y2="10" />
              <line x1="3" y1="15" x2="17" y2="15" />
            </svg>
          </button>
        )}
        <span className="text-lg" role="img" aria-label="lightning">
          &#9889;
        </span>
        <span className="text-lg font-bold text-zinc-100">SimEcon</span>
        <span className="hidden text-sm text-zinc-500 sm:inline">
          Economic Policy Simulator
        </span>
      </div>

      {/* What-if controls — hidden on mobile */}
      {onModeChange && onEventChange && (
        <div className="hidden md:flex">
          <WhatIfControls
            mode={mode}
            whatIfEventId={whatIfEventId}
            onModeChange={onModeChange}
            onEventChange={onEventChange}
          />
        </div>
      )}

      <button
        onClick={handleShare}
        className="rounded-md border border-zinc-700 px-3 py-1 text-xs text-zinc-400 transition-colors hover:border-zinc-500 hover:text-zinc-200"
      >
        {copied ? "Copied!" : "Share"}
      </button>
    </header>
  );
}
