"use client";

import { Slider } from "@/components/ui/slider";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface TaxSliderProps {
  label: string;
  value: number;
  defaultValue: number;
  onChange: (value: number) => void;
  color?: string;
  min?: number;
  max?: number;
  step?: number;
  suffix?: string;
}

export function TaxSlider({
  label,
  value,
  defaultValue,
  onChange,
  color = "#e94560",
  min = 0,
  max = 100,
  step = 1,
  suffix = "%",
}: TaxSliderProps) {
  const delta = value - defaultValue;
  const deltaStr = delta >= 0 ? `+${delta.toFixed(1)}` : delta.toFixed(1);
  const pct = ((defaultValue - min) / (max - min)) * 100;

  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between">
        <span className="text-xs uppercase tracking-wider text-[#86868b]">
          {label}
        </span>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger
              className="cursor-default font-mono text-xs"
              style={{ color }}
            >
              {value.toFixed(step < 1 ? 1 : 0)}
              {suffix}
            </TooltipTrigger>
            <TooltipContent side="left" className="font-mono text-xs">
              <div className="space-y-0.5">
                <div>
                  Current: {defaultValue.toFixed(step < 1 ? 1 : 0)}
                  {suffix}
                </div>
                <div>
                  Your setting: {value.toFixed(step < 1 ? 1 : 0)}
                  {suffix}
                </div>
                <div>
                  Delta: {deltaStr}
                  {suffix}
                </div>
              </div>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>

      <div className="relative">
        <Slider
          value={[value]}
          min={min}
          max={max}
          step={step}
          onValueChange={(val: number | readonly number[]) => {
            const v = Array.isArray(val) ? val[0] : val;
            onChange(v);
          }}
          className="[&_[data-slot=slider-range]]:bg-[var(--slider-color)] [&_[data-slot=slider-thumb]]:border-[var(--slider-color)]"
          style={{ "--slider-color": color } as React.CSSProperties}
        />
        {/* Ghost marker at default value */}
        <div
          className="pointer-events-none absolute top-1/2 h-3 w-0.5 -translate-y-1/2 rounded-full bg-[#c7c7cc]"
          style={{ left: `${pct}%` }}
          title={`Default: ${defaultValue}`}
        />
      </div>
    </div>
  );
}
