"use client";

import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface KPICardProps {
  label: string;
  actualValue: string;
  yourValue: string;
  delta: string;        // e.g., "+$1.23T more" or "-$500B less"
  deltaDirection: "better" | "worse" | "same";
  projectedLabel?: string; // e.g., "2035 projection"
  projectedValue?: string; // e.g., "$50.16T"
  color: string;
}

export function KPICard({
  label,
  actualValue,
  yourValue,
  delta,
  deltaDirection,
  projectedLabel,
  projectedValue,
  color,
}: KPICardProps) {
  const isSame = deltaDirection === "same";
  const deltaColor =
    deltaDirection === "better"
      ? "text-[#34c759]"
      : deltaDirection === "worse"
        ? "text-[#ff3b30]"
        : "text-[#86868b]";

  const card = (
    <div className="bg-white shadow-sm rounded-lg border border-[#e5e5ea] p-3">
      <p className="text-[10px] uppercase tracking-wider text-[#86868b] mb-2">
        {label}
      </p>

      {/* Today's actual */}
      <div className="flex items-baseline justify-between mb-1">
        <span className="text-[10px] text-[#86868b]">Today</span>
        <span className="font-mono text-sm text-[#1d1d1f]">{actualValue}</span>
      </div>

      {/* Your policy */}
      <div className="flex items-baseline justify-between">
        <span className="text-[10px] font-medium" style={{ color }}>
          Your policy
        </span>
        <span className="font-mono text-lg font-bold" style={{ color }}>
          {yourValue}
        </span>
      </div>

      {/* Delta */}
      {!isSame && (
        <p className={`mt-1.5 text-[11px] font-medium text-right ${deltaColor}`}>
          {delta}
        </p>
      )}
    </div>
  );

  if (projectedLabel && projectedValue) {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger className="w-full text-left">{card}</TooltipTrigger>
          <TooltipContent side="bottom" className="text-xs">
            <p className="text-[#86868b]">{projectedLabel}</p>
            <p className="font-mono font-bold" style={{ color }}>
              {projectedValue}
            </p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  return card;
}
