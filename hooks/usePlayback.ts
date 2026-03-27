"use client";

import { useEffect, useRef } from "react";
import { DEFAULT_END_YEAR } from "@/lib/data/defaults";

interface UsePlaybackOptions {
  isPlaying: boolean;
  speed: 1 | 5 | 10;
  currentYear: number;
  onYearChange: (year: number) => void;
  onFinished: () => void;
}

/**
 * Playback hook using requestAnimationFrame.
 * Speed 1x = 1 year/sec, 5x = 5 years/sec, 10x = 10 years/sec.
 * Calls onFinished when currentYear reaches DEFAULT_END_YEAR.
 */
export function usePlayback({
  isPlaying,
  speed,
  currentYear,
  onYearChange,
  onFinished,
}: UsePlaybackOptions) {
  const rafRef = useRef<number>(0);
  const lastTickRef = useRef<number>(0);

  useEffect(() => {
    if (!isPlaying) {
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
        rafRef.current = 0;
      }
      return;
    }

    // Milliseconds per year tick based on speed
    const msPerYear = 1000 / speed;
    lastTickRef.current = performance.now();

    const tick = (now: number) => {
      const elapsed = now - lastTickRef.current;

      if (elapsed >= msPerYear) {
        lastTickRef.current = now;

        // Use functional ref to get latest currentYear via closure
        // We read from the prop which updates each render
        const nextYear = currentYear + 1;

        if (nextYear >= DEFAULT_END_YEAR) {
          onYearChange(DEFAULT_END_YEAR);
          onFinished();
          return;
        }

        onYearChange(nextYear);
      }

      rafRef.current = requestAnimationFrame(tick);
    };

    rafRef.current = requestAnimationFrame(tick);

    return () => {
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
        rafRef.current = 0;
      }
    };
  }, [isPlaying, speed, currentYear, onYearChange, onFinished]);
}
