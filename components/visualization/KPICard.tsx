interface KPICardProps {
  label: string;
  actualValue: string;
  yourValue: string;
  year: number;
  color: string;
}

export function KPICard({ label, actualValue, yourValue, year, color }: KPICardProps) {
  const isSame = actualValue === yourValue;

  return (
    <div className="bg-card rounded-lg border p-3 text-center">
      <p className="text-[10px] uppercase tracking-wider text-zinc-500">
        {label} ({year})
      </p>
      {isSame ? (
        <p className="mt-1 font-mono text-lg font-bold" style={{ color }}>
          {actualValue}
        </p>
      ) : (
        <div className="mt-1 space-y-0.5">
          <p className="font-mono text-xs text-zinc-500">
            Actual: <span className="text-zinc-300">{actualValue}</span>
          </p>
          <p className="font-mono text-lg font-bold" style={{ color }}>
            Yours: {yourValue}
          </p>
        </div>
      )}
    </div>
  );
}
