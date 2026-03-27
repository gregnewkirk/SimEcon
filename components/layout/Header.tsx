"use client";

import { useCallback, useState } from "react";

export function Header() {
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
        <span className="text-lg" role="img" aria-label="lightning">
          &#9889;
        </span>
        <span className="text-lg font-bold text-zinc-100">SimEcon</span>
        <span className="hidden text-sm text-zinc-500 sm:inline">
          Economic Policy Simulator
        </span>
      </div>
      <button
        onClick={handleShare}
        className="rounded-md border border-zinc-700 px-3 py-1 text-xs text-zinc-400 transition-colors hover:border-zinc-500 hover:text-zinc-200"
      >
        {copied ? "Copied!" : "Share"}
      </button>
    </header>
  );
}
