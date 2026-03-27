export function TransparencyBanner() {
  return (
    <div className="rounded-lg border border-zinc-800 bg-zinc-900/50 px-3 py-2">
      <p className="text-[11px] leading-relaxed text-zinc-500">
        SimEcon uses a simplified economic model for illustration purposes only.
        Real economic outcomes depend on countless variables not captured here.
        All historical data is sourced from official government agencies.
        Projections are estimates and should not be used for policy decisions.
      </p>
    </div>
  );
}
