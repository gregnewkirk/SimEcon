interface KPICardProps {
  label: string;
  value: string;
  delta: number;
  color: string;
}

export function KPICard({ label, value, delta, color }: KPICardProps) {
  const isWorse = delta > 0;
  const arrow = delta > 0 ? "\u2191" : "\u2193";
  const deltaColor = isWorse ? "text-red-400" : "text-teal-400";

  return (
    <div className="bg-card rounded-lg border p-3 text-center">
      <p className="text-[10px] uppercase tracking-wider text-zinc-500">
        {label}
      </p>
      <p className="mt-1 font-mono text-xl font-bold" style={{ color }}>
        {value}
      </p>
      {delta !== 0 && (
        <p className={`mt-0.5 font-mono text-xs ${deltaColor}`}>
          {arrow}
          {Math.abs(delta).toFixed(1)}%
        </p>
      )}
    </div>
  );
}
