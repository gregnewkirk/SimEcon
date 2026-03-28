"use client";

interface SpeedControlProps {
  speed: 1 | 5 | 10;
  onChange: (speed: 1 | 5 | 10) => void;
}

const SPEEDS = [1, 5, 10] as const;

export function SpeedControl({ speed, onChange }: SpeedControlProps) {
  return (
    <div className="flex gap-1">
      {SPEEDS.map((s) => (
        <button
          key={s}
          onClick={() => onChange(s)}
          className={`rounded px-2 py-1 font-mono text-xs transition-colors ${
            speed === s
              ? "bg-[#007AFF] text-white"
              : "bg-[#f5f5f7] text-[#86868b] hover:text-[#1d1d1f]"
          }`}
        >
          {s}x
        </button>
      ))}
    </div>
  );
}
