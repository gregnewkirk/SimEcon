"use client";

import { Slider } from "@/components/ui/slider";
import { SpeedControl } from "./SpeedControl";
import { VideoExport } from "@/components/shared/VideoExport";
import { START_YEAR, DEFAULT_END_YEAR } from "@/lib/data/defaults";
import type { YearData, TaxPolicy } from "@/lib/types";

interface PlaybackBarProps {
  currentYear: number;
  isPlaying: boolean;
  speed: 1 | 5 | 10;
  onYearChange: (year: number) => void;
  onPlayToggle: () => void;
  onSpeedChange: (speed: 1 | 5 | 10) => void;
  allData?: YearData[];
  taxPolicy?: TaxPolicy;
  enabledPrograms?: string[];
  shareUrl?: string;
}

export function PlaybackBar({
  currentYear,
  isPlaying,
  speed,
  onYearChange,
  onPlayToggle,
  onSpeedChange,
  allData,
  taxPolicy,
  enabledPrograms,
  shareUrl,
}: PlaybackBarProps) {
  return (
    <div
      data-playback-bar
      className="sticky bottom-0 z-50 flex items-center gap-4 border-t border-[#e5e5ea] bg-white px-4 py-3"
    >
      {/* Play/pause button — larger, with glow when paused */}
      <button
        onClick={onPlayToggle}
        className={`flex size-12 shrink-0 items-center justify-center rounded-full bg-[#007AFF] text-white text-lg transition-all hover:bg-[#007AFF]/80 ${
          !isPlaying ? "animate-playback-pulse shadow-[0_0_16px_rgba(0,122,255,0.5)]" : ""
        }`}
        aria-label={isPlaying ? "Pause" : "Play"}
      >
        {isPlaying ? "\u23F8" : "\u25B6"}
      </button>

      {/* Label next to button */}
      <span className="hidden shrink-0 text-xs font-medium text-[#86868b] sm:block min-w-[60px]">
        {isPlaying ? "Playing..." : "Play"}
      </span>

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

      {/* Prominent year display */}
      <span className="min-w-[4rem] text-center font-mono text-lg font-bold text-[#1d1d1f]">
        {currentYear}
      </span>

      <SpeedControl speed={speed} onChange={onSpeedChange} />

      {allData && taxPolicy && enabledPrograms && shareUrl && (
        <VideoExport
          allData={allData}
          taxPolicy={taxPolicy}
          enabledPrograms={enabledPrograms}
          shareUrl={shareUrl}
        />
      )}
    </div>
  );
}
