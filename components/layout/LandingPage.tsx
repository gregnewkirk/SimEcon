"use client";

interface LandingPageProps {
  onSelectMode: (mode: "revision" | "fix") => void;
  onQuickStart: (scenarioId: string, mode: "revision" | "fix") => void;
}

const QUICK_STARTS = [
  {
    id: "current",
    mode: "fix" as const,
    icon: "\u{1F3DB}\uFE0F",
    label: "Current Policy",
    description: "See where we're headed with no changes",
  },
  {
    id: "progressive2025",
    mode: "fix" as const,
    icon: "\u{1F4CA}",
    label: "Progressive Plan",
    description: "Tax the wealthy, fund everything",
  },
  {
    id: "moderate2025",
    mode: "fix" as const,
    icon: "\u2696\uFE0F",
    label: "Moderate Compromise",
    description: "Small changes, big impact",
  },
];

const STEPS = [
  { icon: "\u{1F3DB}\uFE0F", text: "Pick a mode \u2014 explore history or fix the future" },
  { icon: "\u{1F4B0}", text: "Adjust taxes and toggle programs" },
  { icon: "\u{1F4C8}", text: "Watch the numbers change in real-time" },
  { icon: "\u{1F517}", text: "Share your policy with friends" },
];

export function LandingPage({ onSelectMode, onQuickStart }: LandingPageProps) {
  return (
    <div className="flex-1 overflow-y-auto bg-[#fafafa] p-6">
      <div className="mx-auto w-full max-w-3xl space-y-10">
        {/* Title */}
        <div className="text-center">
          <h1 className="text-3xl font-bold tracking-tight text-[#1d1d1f] sm:text-4xl lg:text-5xl">
            <span className="text-3d-blue text-[#007AFF] font-black sm:text-5xl lg:text-6xl">SimEcon</span>
            <br className="sm:hidden" />
            <span className="text-2xl sm:text-3xl lg:text-4xl"> &mdash; What would </span>
            <em className="not-italic font-black text-[#1d1d1f]">YOU</em>
            <span className="text-2xl sm:text-3xl lg:text-4xl">{" "}do with $36&nbsp;trillion?</span>
          </h1>
          <p className="mt-3 text-base text-[#86868b]">
            The U.S. national debt is $36&nbsp;trillion. That&rsquo;s $108,000 per person.
          </p>
        </div>

        {/* Mode Cards */}
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

        {/* How It Works */}
        <div className="space-y-4">
          <h3 className="text-center text-xs font-semibold uppercase tracking-widest text-[#86868b]">
            How It Works
          </h3>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {STEPS.map((step, i) => (
              <div
                key={i}
                className="flex flex-col items-center gap-2 rounded-xl bg-white p-4 text-center shadow-sm border border-[#f0f0f0]"
              >
                <span className="text-2xl" aria-hidden="true">{step.icon}</span>
                <span className="text-xs font-medium text-[#1d1d1f] leading-snug">
                  <span className="text-[#86868b] font-semibold">{i + 1}.</span>{" "}
                  {step.text}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Start Presets */}
        <div className="space-y-4">
          <h3 className="text-center text-xs font-semibold uppercase tracking-widest text-[#86868b]">
            Quick Start &mdash; Try a Preset
          </h3>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            {QUICK_STARTS.map((qs) => (
              <button
                key={qs.id}
                type="button"
                onClick={() => onQuickStart(qs.id, qs.mode)}
                className="group flex cursor-pointer flex-col items-center gap-2 rounded-2xl border border-[#e5e5ea] bg-white px-5 py-5 text-center shadow-sm transition-all hover:shadow-md hover:border-[#007AFF]/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#007AFF]"
              >
                <span className="text-3xl" aria-hidden="true">{qs.icon}</span>
                <span className="text-sm font-semibold text-[#1d1d1f]">{qs.label}</span>
                <span className="text-xs text-[#86868b] leading-snug">{qs.description}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Skip Intro */}
        <div className="text-center">
          <button
            type="button"
            onClick={() => onSelectMode("fix")}
            className="text-xs text-[#86868b] hover:text-[#007AFF] transition-colors cursor-pointer"
          >
            Skip intro &rarr;
          </button>
        </div>
      </div>
    </div>
  );
}
