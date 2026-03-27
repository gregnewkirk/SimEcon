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
              ? "bg-[#e94560] text-white"
              : "bg-zinc-800 text-zinc-400 hover:text-zinc-200"
          }`}
        >
          {s}x
        </button>
      ))}
    </div>
  );
}
