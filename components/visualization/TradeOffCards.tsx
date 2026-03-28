"use client";

import { WHAT_IF_EVENTS_MAP } from "@/lib/data/what-if-events";
import { PROGRAMS } from "@/lib/data/programs";

interface TradeOffCardsProps {
  whatIfEventIds: string[];
  enabledPrograms: string[];
}

const US_POPULATION = 330_000_000;

export function TradeOffCards({
  whatIfEventIds,
  enabledPrograms,
}: TradeOffCardsProps) {
  // Only show spending events that have a total cost
  const activeSpendingEvents = whatIfEventIds
    .map((id) => WHAT_IF_EVENTS_MAP.get(id))
    .filter(
      (e): e is NonNullable<typeof e> =>
        e !== undefined && e.totalCostTrillions !== undefined
    );

  if (activeSpendingEvents.length === 0) {
    return (
      <div className="rounded-xl border border-[#e8dcc8] bg-[#fdfbf8] p-5 text-center text-sm text-[#86868b]">
        Toggle historical events in the sidebar to see what America traded away.
      </div>
    );
  }

  // Programs with positive net cost (things you'd want to buy)
  const spendingPrograms = PROGRAMS.filter((p) => p.netCostBillions > 0);

  return (
    <div className="flex gap-4 overflow-x-auto pb-2">
      {activeSpendingEvents.map((event) => {
        const costBillions = event.totalCostTrillions! * 1000;
        const perPerson = (event.totalCostTrillions! * 1e12) / US_POPULATION;

        // Calculate years each program could be funded
        const alternatives = spendingPrograms
          .map((p) => ({
            icon: p.icon,
            name: p.name,
            years: Math.floor(costBillions / p.netCostBillions),
          }))
          .filter((a) => a.years >= 1)
          .sort((a, b) => b.years - a.years)
          .slice(0, 4);

        return (
          <div
            key={event.id}
            className="min-w-[300px] flex-shrink-0 rounded-xl border border-[#e8dcc8] bg-[#fdfbf8] p-5 shadow-sm"
          >
            {/* Event name & cost */}
            <div className="mb-3">
              <h3 className="text-base font-semibold text-[#1d1d1f]">
                {event.category === "spending" ? "\u2694\uFE0F " : "\uD83D\uDCB8 "}
                {event.name}
              </h3>
              <p className="text-lg font-bold text-[#d63031]">
                ${event.totalCostTrillions}T {event.category === "tax" ? "in revenue lost" : "spent"}
              </p>
            </div>

            {/* What it could have paid for */}
            {alternatives.length > 0 && (
              <div className="mb-3">
                <p className="mb-1.5 text-xs font-medium uppercase tracking-wider text-[#86868b]">
                  What that could have paid for
                </p>
                <ul className="space-y-1">
                  {alternatives.map((alt, i) => (
                    <li
                      key={alt.name}
                      className="flex items-center gap-2 text-sm text-[#1d8348]"
                    >
                      <span className="text-[#c7c7cc]">
                        {i < alternatives.length - 1 ? "\u2523" : "\u2517"}
                      </span>
                      <span>
                        {alt.icon} {alt.years} year{alt.years !== 1 ? "s" : ""}{" "}
                        of {alt.name}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Per-person stat */}
            <div className="rounded-lg bg-[#faf5eb] px-3 py-2 text-sm">
              <span className="text-[#86868b]">For YOUR household: </span>
              <span className="font-semibold text-[#8b6914]">
                ${Math.round(perPerson).toLocaleString()}
              </span>
              <span className="text-[#86868b]"> per person taken from you.</span>
            </div>
          </div>
        );
      })}
    </div>
  );
}
