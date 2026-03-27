"use client";

import { Slider } from "@/components/ui/slider";
import { SpeedControl } from "./SpeedControl";
import { START_YEAR, DEFAULT_END_YEAR } from "@/lib/data/defaults";

interface PlaybackBarProps {
  currentYear: number;
  isPlaying: boolean;
  speed: 1 | 5 | 10;
  onYearChange: (year: number) => void;
  onPlayToggle: () => void;
  onSpeedChange: (speed: 1 | 5 | 10) => void;
}

export function PlaybackBar({
  currentYear,
  isPlaying,
  speed,
  onYearChange,
  onPlayToggle,
  onSpeedChange,
}: PlaybackBarProps) {
  return (
    <div className="sticky bottom-0 z-50 flex items-center gap-4 border-t border-zinc-800 bg-[#0a0a1a] px-4 py-3">
      <button
        onClick={onPlayToggle}
        className="flex size-8 shrink-0 items-center justify-center rounded-full bg-[#e94560] text-white transition-colors hover:bg-[#e94560]/80"
        aria-label={isPlaying ? "Pause" : "Play"}
      >
        {isPlaying ? "\u23F8" : "\u25B6"}
      </button>

      <div className="flex-1">
        <Slider
          min={START_YEAR}
          max={DEFAULT_END_YEAR}
          value={[currentYear]}
          onValueChange={(val) => {
            if (Array.isArray(val)) onYearChange(val[0]);
          }}
        />
      </div>

      <span className="min-w-[3.5rem] text-center font-mono text-sm text-zinc-400">
        {currentYear}
      </span>

      <SpeedControl speed={speed} onChange={onSpeedChange} />
    </div>
  );
}
