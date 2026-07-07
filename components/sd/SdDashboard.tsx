"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { Slider } from "@/components/ui/slider";
import { useSdEngine } from "@/hooks/useSdEngine";
import { SegmentedControl } from "@/components/sim/SegmentedControl";
import { Confetti } from "@/components/sim/Confetti";
import { SdLeverSidebar } from "./SdLeverSidebar";
import { SdScenarioPresets } from "./SdScenarioPresets";
import { SdEventControls } from "./SdEventControls";
import { SdHeadlineStats } from "./SdHeadlineStats";
import { SdTrajectoryChart } from "./SdTrajectoryChart";
import { SdMoneyFlowSankey } from "./SdMoneyFlowSankey";
import { moneyM, pct } from "./format";
import { C, SHADOW, SHADOW_SM, SPRING } from "@/components/sim/theme";

function SectionCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <motion.section initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={SPRING} className="rounded-3xl p-4 sm:p-5" style={{ background: C.card, boxShadow: SHADOW }}>
      <h2 className="mb-3 text-[11px] font-semibold uppercase tracking-wider" style={{ color: C.inkMute }}>{title}</h2>
      {children}
    </motion.section>
  );
}

export function SdDashboard() {
  const sim = useSdEngine();
  const [yearIdx, setYearIdx] = useState(0);
  const fixYear = sim.years[Math.min(yearIdx, sim.years.length - 1)] ?? sim.years[0];

  // Fire confetti on the transition into balance (derived during render, per React docs).
  const balanced = (fixYear?.gapM ?? 1) < 0;
  const [confetti, setConfetti] = useState(0);
  const [wasBalanced, setWasBalanced] = useState(false);
  if (balanced !== wasBalanced) {
    setWasBalanced(balanced);
    if (balanced) setConfetti((n) => n + 1);
  }

  return (
    <div className="mx-auto min-h-screen max-w-6xl px-4 py-7" style={{ color: C.ink }}>
      <Confetti trigger={confetti} />

      <header className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Sim<span style={{ color: C.accent }}>Econ</span> <span style={{ color: C.amber }}>San Diego</span>
          </h1>
          <p className="text-sm" style={{ color: C.inkMute }}>
            Run the City of San Diego&apos;s General Fund. Real FY2026 numbers, real history. Every figure is sourced.
          </p>
        </div>
        <div className="flex items-center gap-4">
          <Link href="/" className="text-sm underline-offset-2 hover:underline" style={{ color: C.inkMute }}>
            Federal budget →
          </Link>
          <motion.button whileTap={{ scale: 0.95 }} onClick={sim.reset} className="rounded-full px-4 py-1.5 text-sm font-medium" style={{ background: C.card, color: C.ink, boxShadow: SHADOW_SM }}>
            Reset
          </motion.button>
        </div>
      </header>

      <div className="mb-6 flex justify-center">
        <SegmentedControl
          value={sim.mode}
          onChange={sim.setMode}
          options={[
            { value: "whatif", label: "What if we had..." },
            { value: "fix", label: "Fix this mess" },
          ]}
        />
      </div>

      {sim.mode === "fix" ? (
        <div className="space-y-5">
          <div className="rounded-3xl p-4 sm:p-5" style={{ background: C.card, boxShadow: SHADOW }}>
            <SdScenarioPresets
              activePreset={sim.activePreset}
              onApply={(id, config) => {
                sim.applyPreset(config);
                sim.setActivePreset(id);
              }}
              onReset={sim.reset}
            />
          </div>

          <div className="grid gap-5 lg:grid-cols-[360px_1fr] lg:items-start">
            <aside>
              <SdLeverSidebar cfg={sim.cfg} setLever={sim.setLever} />
            </aside>

            <main className="space-y-5 lg:sticky lg:top-6 lg:max-h-[calc(100vh-3rem)] lg:self-start lg:overflow-y-auto lg:pr-1">
              <div className="flex items-center gap-3 rounded-3xl px-4 py-3" style={{ background: C.card, boxShadow: SHADOW_SM }}>
                <motion.span key={fixYear?.year} initial={{ scale: 0.8, opacity: 0.5 }} animate={{ scale: 1, opacity: 1 }} transition={SPRING} className="rounded-full px-3 py-1 font-mono text-sm font-bold tabular-nums" style={{ background: C.accent, color: "#fff" }}>
                  FY{fixYear?.year}
                </motion.span>
                <Slider value={[yearIdx]} min={0} max={sim.years.length - 1} step={1} onValueChange={(v) => setYearIdx(Array.isArray(v) ? v[0] : v)} className="flex-1" />
                <span className="text-[11px] font-medium uppercase tracking-wider" style={{ color: C.inkMute }}>to 2040</span>
              </div>

              {fixYear && <SdHeadlineStats year={fixYear} />}

              {fixYear && (
                <div className="grid grid-cols-2 gap-3">
                  <MiniStat
                    label={`Pension hole (SDCERS), ${pct(fixYear.pensionFundedPct)} funded`}
                    value={moneyM(fixYear.pensionUalM)}
                    color={C.amber}
                  />
                  <MiniStat
                    label="Forced cuts once reserves run dry (cumulative)"
                    value={moneyM(fixYear.unfundedGapM)}
                    color={fixYear.unfundedGapM > 0 ? C.red : C.green}
                  />
                </div>
              )}

              <SectionCard title="Reserves vs. the 16.7% target, through 2040">
                <SdTrajectoryChart mode="fix" years={sim.years} />
              </SectionCard>

              <SectionCard title={`Where the money flows (FY${fixYear?.year})`}>
                {fixYear && <SdMoneyFlowSankey year={fixYear} />}
              </SectionCard>
            </main>
          </div>
        </div>
      ) : (
        <div className="grid gap-5 lg:grid-cols-[400px_1fr]">
          <aside>
            <SdEventControls events={sim.events} toggleEvent={sim.toggleEvent} setEventsBulk={sim.setEventsBulk} />
          </aside>
          <main className="space-y-5">
            <div className="grid grid-cols-3 gap-3">
              <MiniStat label="The city would have today" value={moneyM(sim.whatIf.totalSavedM)} color={C.green} />
              <MiniStat label="Dollars actually spent/forgone" value={moneyM(sim.whatIf.rawSpentM)} color={C.red} />
              <MiniStat label="Budget room freed, per year today" value={moneyM(sim.whatIf.annualRoomTodayM)} color={C.amber} />
            </div>
            <SectionCard title="Money the city would have today (invested at SDCERS returns), 1996-2026">
              <SdTrajectoryChart mode="whatif" whatIfPoints={sim.whatIf.points} />
            </SectionCard>
            <SectionCard title="For scale">
              <ScaleNotes totalSavedM={sim.whatIf.totalSavedM} annualRoomM={sim.whatIf.annualRoomTodayM} />
            </SectionCard>
          </main>
        </div>
      )}

      <footer className="mt-10 text-center text-[11px]" style={{ color: C.inkMute }}>
        Illustrative model calibrated to the City of San Diego FY2026 Adopted Budget, IBA reports, and SDCERS valuations. Not a forecast.
      </footer>
    </div>
  );
}

/** Translate the counterfactual total into things a San Diegan can feel. */
function ScaleNotes({ totalSavedM, annualRoomM }: { totalSavedM: number; annualRoomM: number }) {
  if (totalSavedM < 1) {
    return <p className="text-sm" style={{ color: C.inkMute }}>Flip some decisions on the left to see what they cost, in today&apos;s dollars.</p>;
  }
  const items: string[] = [];
  const ualPct = Math.min(100, (totalSavedM / 3400) * 100);
  items.push(`${ualPct.toFixed(0)}% of today's $3.4B pension hole could be gone.`);
  const deficits = totalSavedM / 258;
  items.push(`That is ${deficits.toFixed(1)}x the $258M deficit the city faced going into FY2026.`);
  if (annualRoomM > 0) {
    const libraries = annualRoomM / 60;
    items.push(`The ongoing room alone (~${moneyM(annualRoomM)}/yr) is ~${libraries.toFixed(1)}x the entire library system's budget, every year.`);
  }
  return (
    <ul className="list-disc space-y-1 pl-5 text-sm" style={{ color: C.ink }}>
      {items.map((t, i) => <li key={i}>{t}</li>)}
    </ul>
  );
}

function MiniStat({ label, value, color }: { label: string; value: string; color: string }) {
  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={SPRING} className="rounded-2xl px-4 py-3" style={{ background: C.card, boxShadow: SHADOW_SM }}>
      <div className="mb-0.5 text-[11px] font-medium uppercase tracking-wider" style={{ color: C.inkMute }}>{label}</div>
      <div className="font-mono text-xl font-semibold tabular-nums" style={{ color }}>{value}</div>
    </motion.div>
  );
}
