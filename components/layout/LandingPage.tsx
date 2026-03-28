"use client";

interface LandingPageProps {
  onSelectMode: (mode: "revision" | "fix") => void;
}

export function LandingPage({ onSelectMode }: LandingPageProps) {
  return (
    <div className="flex flex-1 items-center justify-center bg-[#fafafa] p-6">
      <div className="mx-auto w-full max-w-3xl space-y-8">
        {/* Title */}
        <div className="text-center">
          <h1 className="text-3xl font-bold tracking-tight text-[#1d1d1f] sm:text-4xl">
            SimEcon &mdash; What would <em>YOU</em> do with $36&nbsp;trillion?
          </h1>
          <p className="mt-3 text-base text-[#86868b]">
            The U.S. national debt is $36&nbsp;trillion. That&rsquo;s $108,000 per person.
          </p>
        </div>

        {/* Cards */}
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          {/* Card 1 — Rewrite History */}
          <button
            type="button"
            onClick={() => onSelectMode("revision")}
            className="group flex cursor-pointer flex-col items-start gap-4 rounded-2xl border border-[#e8dcc8] bg-[#faf8f4] p-6 text-left shadow-sm transition-all hover:shadow-md hover:shadow-amber-200/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400"
          >
            <span className="text-5xl" aria-hidden="true">
              &#x1F570;&#xFE0F;
            </span>
            <div className="space-y-2">
              <h2 className="text-xl font-semibold text-[#1d1d1f]">
                Explore What We Lost
              </h2>
              <p className="text-sm leading-relaxed text-[#6e6e73]">
                What if we hadn&rsquo;t spent $4.2T on wars? What if the Bush
                tax cuts never happened? See what America traded away.
              </p>
            </div>
            <span className="mt-auto inline-flex items-center gap-1 rounded-lg bg-[#8b6914] px-4 py-2 text-sm font-medium text-white transition-colors group-hover:bg-[#7a5b10]">
              Rewrite History &rarr;
            </span>
          </button>

          {/* Card 2 — Fix the Future */}
          <button
            type="button"
            onClick={() => onSelectMode("fix")}
            className="group flex cursor-pointer flex-col items-start gap-4 rounded-2xl border border-[#c8d8ec] bg-[#f0f4fa] p-6 text-left shadow-sm transition-all hover:shadow-md hover:shadow-blue-200/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400"
          >
            <span className="text-5xl" aria-hidden="true">
              &#x1F527;
            </span>
            <div className="space-y-2">
              <h2 className="text-xl font-semibold text-[#1d1d1f]">
                Fix What&rsquo;s Broken
              </h2>
              <p className="text-sm leading-relaxed text-[#6e6e73]">
                Starting from today: can you actually balance the budget? Pick
                your programs, set your taxes, see if the math works.
              </p>
            </div>
            <span className="mt-auto inline-flex items-center gap-1 rounded-lg bg-[#007AFF] px-4 py-2 text-sm font-medium text-white transition-colors group-hover:bg-[#006ae6]">
              Build the Future &rarr;
            </span>
          </button>
        </div>
      </div>
    </div>
  );
}
