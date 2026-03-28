"use client";

import { useCallback, useState } from "react";

interface HeaderProps {
  onMenuToggle?: () => void;
  onShowYourWork?: () => void;
}

export function Header({
  onMenuToggle,
  onShowYourWork,
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
        {/* Hamburger menu -- visible below lg */}
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

      <div className="flex items-center gap-2">
        {onShowYourWork && (
          <button
            onClick={onShowYourWork}
            className="rounded-md border border-zinc-700 px-3 py-1 text-xs text-zinc-400 transition-colors hover:border-zinc-500 hover:text-zinc-200"
            aria-label="Show assumptions"
          >
            <span className="flex items-center gap-1">
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <circle cx="12" cy="12" r="3" />
                <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
              </svg>
              <span className="hidden sm:inline">Assumptions</span>
            </span>
          </button>
        )}
        <button
          onClick={handleShare}
          className="rounded-md border border-zinc-700 px-3 py-1 text-xs text-zinc-400 transition-colors hover:border-zinc-500 hover:text-zinc-200"
        >
          {copied ? "Copied!" : "Share"}
        </button>
      </div>
    </header>
  );
}
