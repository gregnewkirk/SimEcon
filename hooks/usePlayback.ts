"use client";

import { useEffect, useRef } from "react";

interface UsePlaybackOptions {
  isPlaying: boolean;
  speed: 1 | 5 | 10;
  currentYear: number;
  endYear: number;
  onYearChange: (year: number) => void;
  onFinished: () => void;
}

/**
 * Playback hook using requestAnimationFrame.
 * Speed 1x = 1 year/sec, 5x = 5 years/sec, 10x = 10 years/sec.
 * Calls onFinished when currentYear reaches endYear.
 */
export function usePlayback({
  isPlaying,
  speed,
  currentYear,
  endYear,
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

        const nextYear = currentYear + 1;

        if (nextYear >= endYear) {
          onYearChange(endYear);
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
  }, [isPlaying, speed, currentYear, endYear, onYearChange, onFinished]);
}
