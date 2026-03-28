# SimEcon Phase 2 — Viral Features Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add five viral features to SimEcon: Historical "What If" mode, Household Impact Personas, "Show Your Work" assumptions panel, visualization tab system, and a TikTok video export button.

**Architecture:** All features are client-side only, layered onto the existing SimulatorLayout. Each feature is an independent component that reads from the existing useSimulation hook. What-If mode adds a new engine function and new state fields. The Sankey diagram is deferred to a follow-up (D3-sankey is heavy and the tab infrastructure can be built without it).

**Tech Stack:** Next.js 16, TypeScript, shadcn/ui (Sheet, Tabs, Dialog), Recharts, existing engine

**Spec:** `docs/superpowers/specs/2026-03-27-simecon-design.md` §6

**NOTE on Sankey:** The animated Sankey (spec §6.2) requires D3-sankey and custom SVG animation — it's the most complex Phase 2 feature by far. This plan builds the tab infrastructure and placeholder for it, but defers the full Sankey implementation to a separate task after the other 4 features ship. This keeps the plan shippable.

---

## File Structure

```
New files:
├── lib/data/what-if-events.ts            # Historical policy event definitions
├── lib/data/personas.ts                  # Household persona definitions
├── lib/engine/what-if.ts                 # What-if counterfactual engine
├── components/visualization/VisualizationTabs.tsx  # Tab container (Charts | Household Impact)
├── components/visualization/HouseholdPersonas.tsx  # 5 persona cards
├── components/visualization/PersonaCard.tsx         # Single persona card
├── components/shared/ShowYourWork.tsx     # Slide-out assumptions drawer
├── components/shared/WhatIfControls.tsx   # What-if mode toggle + event selector
├── components/shared/VideoExport.tsx      # TikTok export button + logic

Modified files:
├── lib/types.ts                          # Add WhatIfEvent, Persona, SimMode types
├── lib/url-state.ts                      # Add m (mode) and we (what-if event) params
├── hooks/useURLState.ts                  # Encode/decode new URL params
├── hooks/useSimulation.ts                # Add what-if mode state + computed data
├── components/layout/SimulatorLayout.tsx  # Wire new components
├── components/layout/Header.tsx          # Add mode toggle + assumptions button
├── components/playback/PlaybackBar.tsx   # Add export button
```

---

## Task 1: Types & Data for What-If Events and Personas

**Files:**
- Modify: `lib/types.ts`
- Create: `lib/data/what-if-events.ts`
- Create: `lib/data/personas.ts`

- [ ] **Step 1: Add new types to lib/types.ts**

Append to the existing file:

```typescript
export type SimMode = "forward" | "whatif";

export interface WhatIfEvent {
  id: string;
  name: string;
  year: number;
  description: string;
  // Tax rates BEFORE the policy change (counterfactual rates)
  counterfactualPolicy: TaxPolicy;
}

export interface Persona {
  id: string;
  name: string;
  title: string;
  icon: string;
  householdIncome: number;      // Annual, dollars
  netWorth: number;             // Dollars
  effectiveTaxRate: number;     // Current effective rate (0-1)
  // How much this persona benefits from each program (annual $ value)
  programBenefits: Record<string, number>;
}
```

Also add to `URLState`:

```typescript
  m?: string;   // mode: forward | whatif
  we?: string;  // what-if event ID
```

Also add to `SimulationState`:

```typescript
  mode: SimMode;
  whatIfEventId?: string;
```

- [ ] **Step 2: Create what-if events data**

Create `lib/data/what-if-events.ts`:

```typescript
import type { WhatIfEvent } from "../types";

export const WHAT_IF_EVENTS: WhatIfEvent[] = [
  {
    id: "tcja2017",
    name: "Tax Cuts and Jobs Act",
    year: 2017,
    description: "Top rate cut from 39.6% to 37%, corporate from 35% to 21%",
    counterfactualPolicy: {
      topMarginalRate: 39.6,
      capitalGainsRate: 20,
      corporateRate: 35,
      estateRate: 40,
    },
  },
  {
    id: "atra2013",
    name: "American Taxpayer Relief Act",
    year: 2013,
    description: "Made Bush-era cuts permanent for most, restored 39.6% top rate",
    counterfactualPolicy: {
      topMarginalRate: 35,
      capitalGainsRate: 15,
      corporateRate: 35,
      estateRate: 35,
    },
  },
  {
    id: "tra2010",
    name: "Tax Relief Act of 2010",
    year: 2010,
    description: "Extended Bush-era tax cuts for all income levels",
    counterfactualPolicy: {
      topMarginalRate: 39.6,
      capitalGainsRate: 20,
      corporateRate: 35,
      estateRate: 55,
    },
  },
  {
    id: "jgtrra2003",
    name: "Jobs and Growth Tax Relief",
    year: 2003,
    description: "Cut capital gains to 15%, dividends to 15%",
    counterfactualPolicy: {
      topMarginalRate: 38.6,
      capitalGainsRate: 20,
      corporateRate: 35,
      estateRate: 49,
    },
  },
  {
    id: "egtrra2001",
    name: "Economic Growth and Tax Relief",
    year: 2001,
    description: "Bush tax cuts: top rate from 39.6% to 35%",
    counterfactualPolicy: {
      topMarginalRate: 39.6,
      capitalGainsRate: 20,
      corporateRate: 35,
      estateRate: 55,
    },
  },
];

export const WHAT_IF_EVENTS_MAP = new Map(WHAT_IF_EVENTS.map((e) => [e.id, e]));
```

- [ ] **Step 3: Create personas data**

Create `lib/data/personas.ts`:

```typescript
import type { Persona } from "../types";

export const PERSONAS: Persona[] = [
  {
    id: "nurse",
    name: "The Nurse",
    title: "$65K household",
    icon: "\u{1FA7A}",
    householdIncome: 65000,
    netWorth: 80000,
    effectiveTaxRate: 0.12,
    programBenefits: {
      healthcare: 8000,  // Premiums + deductibles saved
      college: 2000,     // Per child benefit (amortized)
      prek: 6000,        // Childcare savings
      housing: 3000,     // Rent assistance
      ubi: 12000,        // $1K/month
      infrastructure: 500,
    },
  },
  {
    id: "smallbiz",
    name: "The Small Business Owner",
    title: "$180K household",
    icon: "\u{1F3EA}",
    householdIncome: 180000,
    netWorth: 500000,
    effectiveTaxRate: 0.22,
    programBenefits: {
      healthcare: 12000,
      college: 3000,
      prek: 6000,
      housing: 0,
      ubi: 12000,
      infrastructure: 1000,
    },
  },
  {
    id: "techexec",
    name: "The Tech Executive",
    title: "$450K household",
    icon: "\u{1F4BB}",
    householdIncome: 450000,
    netWorth: 5000000,
    effectiveTaxRate: 0.30,
    programBenefits: {
      healthcare: 5000,  // Less benefit (already has good insurance)
      college: 3000,
      prek: 2000,
      housing: 0,
      ubi: 12000,
      infrastructure: 500,
    },
  },
  {
    id: "hedgefund",
    name: "The Hedge Fund Manager",
    title: "$10M income",
    icon: "\u{1F4C8}",
    householdIncome: 10000000,
    netWorth: 200000000,
    effectiveTaxRate: 0.23, // Cap gains heavy
    programBenefits: {
      healthcare: 0,
      college: 0,
      prek: 0,
      housing: 0,
      ubi: 12000,
      infrastructure: 0,
    },
  },
  {
    id: "billionaire",
    name: "The Billionaire",
    title: "$50M+ income",
    icon: "\u{1F3E6}",
    householdIncome: 50000000,
    netWorth: 2000000000,
    effectiveTaxRate: 0.20, // Unrealized gains, carried interest
    programBenefits: {
      healthcare: 0,
      college: 0,
      prek: 0,
      housing: 0,
      ubi: 12000,
      infrastructure: 0,
    },
  },
];
```

- [ ] **Step 4: Verify compilation**

Run: `npx tsc --noEmit`
Expected: No errors.

- [ ] **Step 5: Commit**

```bash
git add lib/types.ts lib/data/what-if-events.ts lib/data/personas.ts
git commit -m "feat: add types and data for what-if events and household personas"
```

---

## Task 2: What-If Engine

**Files:**
- Create: `lib/engine/what-if.ts`

- [ ] **Step 1: Create the what-if simulation function**

Create `lib/engine/what-if.ts`:

```typescript
import type { WhatIfEvent, YearData, AdvancedAssumptions } from "../types";
import { HISTORICAL_DATA } from "../data/historical";
import { simulate } from "./simulate";

/**
 * Run a counterfactual simulation: "What if this policy event never happened?"
 *
 * 1. Find the event's year in historical data
 * 2. Take history up to (event.year - 1) as the base
 * 3. Run the simulation forward from there using the counterfactual policy
 * 4. Return the alternate timeline alongside the actual timeline
 */
export function simulateWhatIf(
  event: WhatIfEvent,
  assumptions: AdvancedAssumptions,
  endYear: number
): { actual: YearData[]; counterfactual: YearData[] } {
  // Historical data up to (but not including) the event year serves as the base
  const baseHistory = HISTORICAL_DATA.filter((d) => d.year < event.year);

  if (baseHistory.length === 0) {
    return { actual: HISTORICAL_DATA, counterfactual: [] };
  }

  // Run simulation from the year before the event to endYear
  // using the counterfactual policy (rates if the event never happened)
  const counterfactualProjection = simulate(
    baseHistory,
    event.counterfactualPolicy,
    [], // No additional programs in what-if mode
    assumptions,
    endYear
  );

  // The actual timeline is just the real historical data + current-policy projection
  const actual = HISTORICAL_DATA;

  // Combine base history with counterfactual projection
  const counterfactual = [...baseHistory, ...counterfactualProjection];

  return { actual, counterfactual };
}

/**
 * Calculate the delta between actual and counterfactual at a given year.
 */
export function calculateWhatIfDelta(
  actual: YearData[],
  counterfactual: YearData[],
  year: number
): {
  debtDeltaTrillions: number;
  deficitDeltaBillions: number;
  revenueDeltaBillions: number;
} | null {
  const actualYear = actual.find((d) => d.year === year);
  const cfYear = counterfactual.find((d) => d.year === year);

  if (!actualYear || !cfYear) return null;

  return {
    debtDeltaTrillions: actualYear.debtTrillions - cfYear.debtTrillions,
    deficitDeltaBillions: actualYear.deficitBillions - cfYear.deficitBillions,
    revenueDeltaBillions: actualYear.revenueBillions - cfYear.revenueBillions,
  };
}
```

- [ ] **Step 2: Verify compilation**

Run: `npx tsc --noEmit`

- [ ] **Step 3: Commit**

```bash
git add lib/engine/what-if.ts
git commit -m "feat: add what-if counterfactual simulation engine"
```

---

## Task 3: Wire What-If into useSimulation

**Files:**
- Modify: `hooks/useSimulation.ts`
- Modify: `lib/url-state.ts`
- Modify: `hooks/useURLState.ts`

- [ ] **Step 1: Update useSimulation with what-if state and computed data**

Add to `hooks/useSimulation.ts`:

Import at top:
```typescript
import type { SimMode } from "@/lib/types";
import { WHAT_IF_EVENTS_MAP } from "@/lib/data/what-if-events";
import { simulateWhatIf, calculateWhatIfDelta } from "@/lib/engine/what-if";
```

Add `mode: "forward" as SimMode` and `whatIfEventId: undefined` to `createInitialState()`.

Add new memos after the existing baseline computation:

```typescript
// What-if data (only computed when in what-if mode)
const whatIfData = useMemo(() => {
  if (state.mode !== "whatif" || !state.whatIfEventId) return null;
  const event = WHAT_IF_EVENTS_MAP.get(state.whatIfEventId);
  if (!event) return null;
  return simulateWhatIf(event, state.assumptions, DEFAULT_END_YEAR);
}, [state.mode, state.whatIfEventId, state.assumptions]);

const whatIfDelta = useMemo(() => {
  if (!whatIfData) return null;
  return calculateWhatIfDelta(
    whatIfData.actual,
    whatIfData.counterfactual,
    state.currentYear
  );
}, [whatIfData, state.currentYear]);
```

Add new actions:

```typescript
const setMode = useCallback((mode: SimMode) => {
  setState((prev) => ({ ...prev, mode }));
}, []);

const setWhatIfEvent = useCallback((eventId: string) => {
  setState((prev) => ({ ...prev, whatIfEventId: eventId, mode: "whatif" as SimMode }));
}, []);
```

Return these new values from the hook.

- [ ] **Step 2: Update URL state encode/decode**

In `lib/url-state.ts`, add encoding for `m` (mode) and `we` (what-if event) params. Only encode when mode is "whatif".

In `hooks/useURLState.ts`, add decoding of `m` and `we` params in `urlToState`, and encoding in `stateToURL`.

- [ ] **Step 3: Verify compilation**

Run: `npx tsc --noEmit`

- [ ] **Step 4: Commit**

```bash
git add hooks/useSimulation.ts lib/url-state.ts hooks/useURLState.ts
git commit -m "feat: wire what-if mode into simulation hook and URL state"
```

---

## Task 4: What-If Controls UI

**Files:**
- Create: `components/shared/WhatIfControls.tsx`
- Modify: `components/layout/Header.tsx`

- [ ] **Step 1: Install shadcn Tabs component**

Run: `npx shadcn@latest add tabs`

- [ ] **Step 2: Create WhatIfControls component**

Create `components/shared/WhatIfControls.tsx`:

```tsx
"use client";

import type { SimMode, WhatIfEvent } from "@/lib/types";
import { WHAT_IF_EVENTS } from "@/lib/data/what-if-events";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface WhatIfControlsProps {
  mode: SimMode;
  whatIfEventId?: string;
  onModeChange: (mode: SimMode) => void;
  onEventChange: (eventId: string) => void;
}

export function WhatIfControls({
  mode,
  whatIfEventId,
  onModeChange,
  onEventChange,
}: WhatIfControlsProps) {
  return (
    <div className="flex items-center gap-2">
      {/* Mode toggle */}
      <div className="flex rounded-md border border-[var(--simecon-border)] text-xs overflow-hidden">
        <button
          onClick={() => onModeChange("forward")}
          className={`px-3 py-1 transition-colors ${
            mode === "forward"
              ? "bg-[#e94560] text-white"
              : "bg-transparent text-zinc-400 hover:text-white"
          }`}
        >
          Simulate Forward
        </button>
        <button
          onClick={() => onModeChange("whatif")}
          className={`px-3 py-1 transition-colors ${
            mode === "whatif"
              ? "bg-[#e94560] text-white"
              : "bg-transparent text-zinc-400 hover:text-white"
          }`}
        >
          Rewrite History
        </button>
      </div>

      {/* Event selector — only shown in what-if mode */}
      {mode === "whatif" && (
        <Select value={whatIfEventId ?? ""} onValueChange={onEventChange}>
          <SelectTrigger className="w-52 bg-zinc-800/50 border-[var(--simecon-border)] text-xs h-8">
            <SelectValue placeholder="Select a policy event..." />
          </SelectTrigger>
          <SelectContent>
            {WHAT_IF_EVENTS.map((event) => (
              <SelectItem key={event.id} value={event.id} className="text-xs">
                <span className="font-mono text-zinc-500 mr-1">{event.year}</span>
                {event.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      )}
    </div>
  );
}
```

- [ ] **Step 3: Wire into Header**

Modify `components/layout/Header.tsx` to accept and render WhatIfControls between the logo and the Share button. Add props: `mode`, `whatIfEventId`, `onModeChange`, `onEventChange`. Render `<WhatIfControls />` in the center of the header (hidden on mobile, visible at `md:flex`).

- [ ] **Step 4: Wire into SimulatorLayout**

Modify `components/layout/SimulatorLayout.tsx` to pass the new what-if props from `sim` to `Header`.

Also update `DebtDeficitChart` to accept and render the counterfactual line when in what-if mode:
- Pass `whatIfData={sim.whatIfData?.counterfactual}` and `whatIfDelta={sim.whatIfDelta}` as optional props
- In the chart, render a third Line (green dashed) for the counterfactual debt when present
- Render a delta callout box when `whatIfDelta` is available

- [ ] **Step 5: Verify compilation**

Run: `npx tsc --noEmit`

- [ ] **Step 6: Commit**

```bash
git add components/shared/WhatIfControls.tsx components/layout/Header.tsx components/layout/SimulatorLayout.tsx components/visualization/DebtDeficitChart.tsx
git commit -m "feat: add what-if mode controls and counterfactual chart overlay"
```

---

## Task 5: Household Impact Personas

**Files:**
- Create: `components/visualization/PersonaCard.tsx`
- Create: `components/visualization/HouseholdPersonas.tsx`
- Create: `components/visualization/VisualizationTabs.tsx`
- Modify: `components/layout/SimulatorLayout.tsx`

- [ ] **Step 1: Create PersonaCard**

Create `components/visualization/PersonaCard.tsx`:

```tsx
import type { Persona, TaxPolicy } from "@/lib/types";
import { CURRENT_POLICY } from "@/lib/data/defaults";

interface PersonaCardProps {
  persona: Persona;
  taxPolicy: TaxPolicy;
  enabledPrograms: string[];
}

/**
 * Calculate the new effective tax rate for a persona given a tax policy.
 * Simplified: scales linearly based on top rate change for high earners,
 * minimal change for lower brackets.
 */
function calculateNewEffectiveRate(persona: Persona, policy: TaxPolicy): number {
  const topRateDelta = (policy.topMarginalRate - CURRENT_POLICY.topMarginalRate) / 100;
  const capGainsDelta = (policy.capitalGainsRate - CURRENT_POLICY.capitalGainsRate) / 100;

  // Scale effect by income level
  if (persona.householdIncome >= 10_000_000) {
    // Ultra-high earners: affected by top rate + cap gains
    return Math.max(0, Math.min(0.7, persona.effectiveTaxRate + topRateDelta * 0.6 + capGainsDelta * 0.3));
  } else if (persona.householdIncome >= 400_000) {
    // High earners: mostly top rate
    return Math.max(0, Math.min(0.6, persona.effectiveTaxRate + topRateDelta * 0.4));
  } else if (persona.householdIncome >= 150_000) {
    // Upper-middle: modest effect
    return Math.max(0, Math.min(0.4, persona.effectiveTaxRate + topRateDelta * 0.15));
  } else {
    // Middle/lower: minimal direct impact from top rate changes
    return Math.max(0, Math.min(0.3, persona.effectiveTaxRate + topRateDelta * 0.02));
  }
}

export function PersonaCard({ persona, taxPolicy, enabledPrograms }: PersonaCardProps) {
  const newRate = calculateNewEffectiveRate(persona, taxPolicy);
  const rateDelta = newRate - persona.effectiveTaxRate;
  const taxChange = rateDelta * persona.householdIncome;

  // Calculate program benefits
  const totalBenefits = enabledPrograms.reduce(
    (sum, pid) => sum + (persona.programBenefits[pid] ?? 0),
    0
  );

  const netImpact = -taxChange + totalBenefits; // Negative tax change = paying more

  const formatDollars = (n: number) => {
    const abs = Math.abs(n);
    if (abs >= 1_000_000) return `$${(n / 1_000_000).toFixed(1)}M`;
    if (abs >= 1_000) return `$${(n / 1_000).toFixed(0)}K`;
    return `$${n.toFixed(0)}`;
  };

  return (
    <div className="bg-[var(--simecon-bg-card)] border border-[var(--simecon-border)] rounded-lg p-3 space-y-2">
      <div className="flex items-center gap-2">
        <span className="text-xl">{persona.icon}</span>
        <div>
          <div className="text-sm font-medium">{persona.name}</div>
          <div className="text-xs text-zinc-500">{persona.title}</div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2 text-xs">
        <div>
          <div className="text-zinc-500">Tax Rate</div>
          <div className="font-mono">
            <span className="text-zinc-400">{(persona.effectiveTaxRate * 100).toFixed(0)}%</span>
            <span className="text-zinc-600 mx-1">{"\u2192"}</span>
            <span className={newRate > persona.effectiveTaxRate ? "text-[#e94560]" : "text-[#4ecca3]"}>
              {(newRate * 100).toFixed(0)}%
            </span>
          </div>
        </div>
        <div>
          <div className="text-zinc-500">Tax Change</div>
          <div className={`font-mono ${taxChange > 0 ? "text-[#e94560]" : "text-[#4ecca3]"}`}>
            {taxChange > 0 ? "+" : ""}{formatDollars(taxChange)}/yr
          </div>
        </div>
        <div>
          <div className="text-zinc-500">Benefits</div>
          <div className="font-mono text-[#4ecca3]">
            {totalBenefits > 0 ? `+${formatDollars(totalBenefits)}/yr` : "$0"}
          </div>
        </div>
        <div>
          <div className="text-zinc-500">Net Impact</div>
          <div className={`font-mono font-bold ${netImpact >= 0 ? "text-[#4ecca3]" : "text-[#e94560]"}`}>
            {netImpact >= 0 ? "+" : ""}{formatDollars(netImpact)}/yr
          </div>
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Create HouseholdPersonas**

Create `components/visualization/HouseholdPersonas.tsx`:

```tsx
import type { TaxPolicy } from "@/lib/types";
import { PERSONAS } from "@/lib/data/personas";
import { PersonaCard } from "./PersonaCard";

interface HouseholdPersonasProps {
  taxPolicy: TaxPolicy;
  enabledPrograms: string[];
}

export function HouseholdPersonas({ taxPolicy, enabledPrograms }: HouseholdPersonasProps) {
  return (
    <div className="space-y-3">
      <h3 className="text-xs uppercase tracking-wider text-zinc-500">
        Household Impact
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-3">
        {PERSONAS.map((persona) => (
          <PersonaCard
            key={persona.id}
            persona={persona}
            taxPolicy={taxPolicy}
            enabledPrograms={enabledPrograms}
          />
        ))}
      </div>
    </div>
  );
}
```

- [ ] **Step 3: Create VisualizationTabs**

Create `components/visualization/VisualizationTabs.tsx`:

This wraps the existing charts and the new HouseholdPersonas in a shadcn Tabs component.

```tsx
"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { YearData, TaxPolicy } from "@/lib/types";
import { HouseholdPersonas } from "./HouseholdPersonas";

interface VisualizationTabsProps {
  chartsContent: React.ReactNode;   // The existing charts (debt/deficit + wealth)
  taxPolicy: TaxPolicy;
  enabledPrograms: string[];
}

export function VisualizationTabs({
  chartsContent,
  taxPolicy,
  enabledPrograms,
}: VisualizationTabsProps) {
  return (
    <Tabs defaultValue="charts" className="w-full">
      <TabsList className="bg-zinc-800/50 border border-[var(--simecon-border)]">
        <TabsTrigger value="charts" className="text-xs">Charts</TabsTrigger>
        <TabsTrigger value="household" className="text-xs">Household Impact</TabsTrigger>
      </TabsList>
      <TabsContent value="charts" className="space-y-4 mt-3">
        {chartsContent}
      </TabsContent>
      <TabsContent value="household" className="mt-3">
        <HouseholdPersonas taxPolicy={taxPolicy} enabledPrograms={enabledPrograms} />
      </TabsContent>
    </Tabs>
  );
}
```

- [ ] **Step 4: Wire VisualizationTabs into SimulatorLayout**

In `SimulatorLayout.tsx`, replace the direct rendering of `DebtDeficitChart` + `WealthDistributionChart` with `VisualizationTabs`. Pass the charts as `chartsContent`:

```tsx
<VisualizationTabs
  chartsContent={
    <>
      <DebtDeficitChart ... />
      <WealthDistributionChart ... />
    </>
  }
  taxPolicy={sim.state.taxPolicy}
  enabledPrograms={sim.state.enabledPrograms}
/>
```

- [ ] **Step 5: Verify compilation**

Run: `npx tsc --noEmit`

- [ ] **Step 6: Commit**

```bash
git add components/visualization/PersonaCard.tsx components/visualization/HouseholdPersonas.tsx components/visualization/VisualizationTabs.tsx components/layout/SimulatorLayout.tsx
git commit -m "feat: add household impact personas with tab navigation"
```

---

## Task 6: "Show Your Work" Assumptions Panel

**Files:**
- Create: `components/shared/ShowYourWork.tsx`
- Modify: `components/layout/Header.tsx`
- Modify: `components/layout/SimulatorLayout.tsx`

- [ ] **Step 1: Install shadcn Sheet component**

Run: `npx shadcn@latest add sheet`

- [ ] **Step 2: Create ShowYourWork component**

Create `components/shared/ShowYourWork.tsx`:

```tsx
"use client";

import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import type { AdvancedAssumptions } from "@/lib/types";
import { DEFAULT_ASSUMPTIONS } from "@/lib/data/defaults";
import { TaxSlider } from "@/components/sidebar/TaxSlider";

interface ShowYourWorkProps {
  assumptions: AdvancedAssumptions;
  onAssumptionsChange: (field: keyof AdvancedAssumptions, value: number) => void;
  onReset: () => void;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const METHODOLOGY = `## How SimEcon Works

### Tax Revenue
Revenue is calculated per wealth bracket using income-to-wealth ratios and effective tax rates that scale with the top marginal rate. Corporate tax scales proportionally with the corporate rate as a percentage of GDP. Capital gains tax is estimated from top-bracket wealth appreciation.

### Wealth Redistribution
Higher top rates slow wealth accumulation at the top brackets. Government spending from programs partially flows to lower brackets. GDP growth benefits top brackets disproportionately (matching historical patterns). The behavioral elasticity parameter controls how much higher taxes reduce investment activity.

### GDP Feedback
Program spending generates a fiscal multiplier effect on GDP growth. The default multiplier (1.2x) is based on CBO and IMF literature estimates.

### Known Limitations
- This is a **simplified illustration**, not an econometric model
- No labor market dynamics, international trade, or monetary policy
- Behavioral responses are modeled with a single elasticity parameter
- Program costs are fixed estimates, not dynamic
- No interaction effects between programs`;

export function ShowYourWork({
  assumptions,
  onAssumptionsChange,
  onReset,
  open,
  onOpenChange,
}: ShowYourWorkProps) {
  const handleExportJSON = () => {
    const data = {
      assumptions,
      defaults: DEFAULT_ASSUMPTIONS,
      methodology: "See SimEcon methodology documentation",
      exportDate: new Date().toISOString(),
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "simecon-assumptions.json";
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-96 bg-[var(--simecon-bg-sidebar)] border-[var(--simecon-border)] overflow-y-auto">
        <SheetHeader>
          <SheetTitle className="text-white">Show Your Work</SheetTitle>
        </SheetHeader>

        <div className="space-y-6 mt-4">
          {/* Adjustable Assumptions */}
          <div className="space-y-3">
            <h4 className="text-[10px] uppercase tracking-wider text-zinc-500 font-medium">
              Model Assumptions
            </h4>
            <TaxSlider
              label="GDP Growth Rate"
              value={assumptions.gdpGrowthRate}
              defaultValue={DEFAULT_ASSUMPTIONS.gdpGrowthRate}
              onChange={(v) => onAssumptionsChange("gdpGrowthRate", v)}
              color="#4ecca3"
              min={0}
              max={5}
              step={0.1}
              suffix="%"
            />
            <TaxSlider
              label="Interest Rate on Debt"
              value={assumptions.interestRate}
              defaultValue={DEFAULT_ASSUMPTIONS.interestRate}
              onChange={(v) => onAssumptionsChange("interestRate", v)}
              color="#f0a500"
              min={1}
              max={8}
              step={0.1}
              suffix="%"
            />
            <TaxSlider
              label="Behavioral Elasticity"
              value={assumptions.behavioralElasticity}
              defaultValue={DEFAULT_ASSUMPTIONS.behavioralElasticity}
              onChange={(v) => onAssumptionsChange("behavioralElasticity", v)}
              color="#0f3460"
              min={0}
              max={1}
              step={0.01}
            />
            <TaxSlider
              label="Fiscal Multiplier"
              value={assumptions.fiscalMultiplier}
              defaultValue={DEFAULT_ASSUMPTIONS.fiscalMultiplier}
              onChange={(v) => onAssumptionsChange("fiscalMultiplier", v)}
              color="#533483"
              min={0.5}
              max={2.5}
              step={0.1}
              suffix="x"
            />
          </div>

          {/* Methodology */}
          <div className="space-y-2">
            <h4 className="text-[10px] uppercase tracking-wider text-zinc-500 font-medium">
              Methodology
            </h4>
            <div className="text-xs text-zinc-400 leading-relaxed whitespace-pre-line space-y-2">
              {METHODOLOGY.split('\n\n').map((paragraph, i) => {
                if (paragraph.startsWith('##')) {
                  return null; // Skip title
                }
                if (paragraph.startsWith('###')) {
                  return <h5 key={i} className="text-zinc-300 font-medium mt-3">{paragraph.replace('### ', '')}</h5>;
                }
                return <p key={i}>{paragraph.replace(/^- /gm, '\u2022 ').replace(/\*\*/g, '')}</p>;
              })}
            </div>
          </div>

          {/* Export + Reset */}
          <div className="flex flex-col gap-2 pt-4 border-t border-[var(--simecon-border)]">
            <Button
              variant="outline"
              size="sm"
              onClick={() => window.print()}
              className="text-xs border-[var(--simecon-border)]"
            >
              Export as PDF
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleExportJSON}
              className="text-xs border-[var(--simecon-border)]"
            >
              Export as JSON
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={onReset}
              className="text-xs text-zinc-500 hover:text-white"
            >
              Reset All to Defaults
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
```

**NOTE to implementer:** The TaxSlider component may need updates to support `step` and `suffix` props. Check the actual component signature and add these props if they don't exist. The slider should display the raw value (not scaled) with the optional suffix.

- [ ] **Step 3: Add "Assumptions" button to Header**

Add a button to Header that opens the ShowYourWork panel. Pass `onShowYourWork` callback prop.

- [ ] **Step 4: Wire into SimulatorLayout**

Add `showYourWorkOpen` state. Pass it + toggle to Header and ShowYourWork component.

- [ ] **Step 5: Verify compilation**

Run: `npx tsc --noEmit`

- [ ] **Step 6: Commit**

```bash
git add components/shared/ShowYourWork.tsx components/layout/Header.tsx components/layout/SimulatorLayout.tsx
git commit -m "feat: add Show Your Work assumptions panel with methodology and export"
```

---

## Task 7: TikTok Video Export

**Files:**
- Create: `components/shared/VideoExport.tsx`
- Modify: `components/playback/PlaybackBar.tsx`

- [ ] **Step 1: Create VideoExport component**

Create `components/shared/VideoExport.tsx`:

```tsx
"use client";

import { useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import type { YearData, TaxPolicy } from "@/lib/types";

interface VideoExportProps {
  allData: YearData[];
  taxPolicy: TaxPolicy;
  enabledPrograms: string[];
  shareUrl: string;
}

/**
 * Renders a simplified version of the dashboard to a canvas,
 * records it as a video using MediaRecorder, and downloads as WebM.
 *
 * This is a simplified implementation. Full 9:16 vertical with
 * polished overlays would be a Phase 2.5 enhancement.
 */
export function VideoExport({
  allData,
  taxPolicy,
  enabledPrograms,
  shareUrl,
}: VideoExportProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [progress, setProgress] = useState(0);

  const handleExport = useCallback(async () => {
    setIsRecording(true);
    setProgress(0);

    try {
      const canvas = document.createElement("canvas");
      canvas.width = 1080;
      canvas.height = 1920;
      const ctx = canvas.getContext("2d");
      if (!ctx) throw new Error("Canvas not supported");

      const stream = canvas.captureStream(30);
      const recorder = new MediaRecorder(stream, {
        mimeType: "video/webm;codecs=vp9",
        videoBitsPerSecond: 5_000_000,
      });

      const chunks: Blob[] = [];
      recorder.ondataavailable = (e) => chunks.push(e.data);

      recorder.onstop = () => {
        const blob = new Blob(chunks, { type: "video/webm" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = "simecon-export.webm";
        a.click();
        URL.revokeObjectURL(url);
        setIsRecording(false);

        // Copy share text to clipboard
        const shareText = `What if we taxed billionaires at ${taxPolicy.topMarginalRate}%? Watch what happens to the national debt. Try it: ${shareUrl}`;
        navigator.clipboard.writeText(shareText).catch(() => {});
      };

      recorder.start();

      // Animate through years
      const totalFrames = allData.length;
      const msPerFrame = 15000 / totalFrames; // 15 seconds total

      for (let i = 0; i < totalFrames; i++) {
        const d = allData[i];
        setProgress(Math.round((i / totalFrames) * 100));

        // Dark background
        ctx.fillStyle = "#0a0a1a";
        ctx.fillRect(0, 0, 1080, 1920);

        // Title
        ctx.fillStyle = "#ffffff";
        ctx.font = "bold 48px sans-serif";
        ctx.textAlign = "center";
        ctx.fillText("SimEcon", 540, 100);

        // Year
        ctx.font = "bold 120px monospace";
        ctx.fillStyle = "#e94560";
        ctx.fillText(String(d.year), 540, 300);

        // Policy summary
        ctx.font = "32px sans-serif";
        ctx.fillStyle = "#999";
        const policyText = `Top rate: ${taxPolicy.topMarginalRate}%`;
        ctx.fillText(policyText, 540, 380);

        // Debt
        ctx.font = "bold 80px monospace";
        ctx.fillStyle = "#e94560";
        ctx.fillText(`$${d.debtTrillions.toFixed(1)}T`, 540, 600);
        ctx.font = "28px sans-serif";
        ctx.fillStyle = "#666";
        ctx.fillText("NATIONAL DEBT", 540, 650);

        // Deficit
        ctx.font = "bold 60px monospace";
        ctx.fillStyle = "#f0a500";
        ctx.fillText(`$${Math.abs(d.deficitBillions).toFixed(0)}B`, 540, 850);
        ctx.font = "28px sans-serif";
        ctx.fillStyle = "#666";
        ctx.fillText("ANNUAL DEFICIT", 540, 900);

        // Debt/GDP
        ctx.font = "bold 60px monospace";
        ctx.fillStyle = "#0f3460";
        ctx.fillText(`${d.debtToGdpRatio.toFixed(0)}%`, 540, 1100);
        ctx.font = "28px sans-serif";
        ctx.fillStyle = "#666";
        ctx.fillText("DEBT / GDP", 540, 1150);

        // Simple debt bar chart
        const barMaxHeight = 400;
        const barWidth = 800 / totalFrames;
        ctx.fillStyle = "#e94560";
        for (let j = 0; j <= i; j++) {
          const barData = allData[j];
          const barHeight = (barData.debtTrillions / 80) * barMaxHeight; // 80T max scale
          ctx.fillRect(
            140 + j * barWidth,
            1550 - barHeight,
            barWidth - 1,
            barHeight
          );
        }

        // Watermark
        ctx.font = "24px sans-serif";
        ctx.fillStyle = "#444";
        ctx.fillText("SimEcon.app \u2014 Try it yourself", 540, 1850);

        // Projected marker
        if (d.isProjected && i > 0 && !allData[i - 1].isProjected) {
          ctx.font = "20px sans-serif";
          ctx.fillStyle = "#666";
          ctx.fillText("\u25B8 Projected", 540, 1580);
        }

        await new Promise((r) => setTimeout(r, msPerFrame));
      }

      // Hold final frame for 2 seconds
      await new Promise((r) => setTimeout(r, 2000));
      recorder.stop();
    } catch (err) {
      console.error("Export failed:", err);
      setIsRecording(false);
    }
  }, [allData, taxPolicy, enabledPrograms, shareUrl]);

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={handleExport}
      disabled={isRecording}
      className="text-xs border-[var(--simecon-border)] h-7"
    >
      {isRecording ? `Exporting ${progress}%...` : "Export Video"}
    </Button>
  );
}
```

- [ ] **Step 2: Wire VideoExport into PlaybackBar**

Add `VideoExport` to the right side of the PlaybackBar, after the speed controls. Pass the required props through from SimulatorLayout → PlaybackBar → VideoExport.

The `shareUrl` is `typeof window !== 'undefined' ? window.location.href : ''`.

- [ ] **Step 3: Verify compilation**

Run: `npx tsc --noEmit`

- [ ] **Step 4: Commit**

```bash
git add components/shared/VideoExport.tsx components/playback/PlaybackBar.tsx components/layout/SimulatorLayout.tsx
git commit -m "feat: add TikTok video export with canvas animation and share text"
```

---

## Task 8: Integration & Polish

**Files:**
- Modify: `components/layout/SimulatorLayout.tsx` (final wiring)
- Modify: `components/sidebar/TaxSlider.tsx` (add step/suffix support if needed)

- [ ] **Step 1: Verify all new features are wired into SimulatorLayout**

Ensure SimulatorLayout now renders:
1. `Header` with what-if controls and "Assumptions" button
2. `Sidebar` (unchanged)
3. `KPICards` (unchanged)
4. `VisualizationTabs` wrapping charts + household personas
5. `TransparencyBanner` (unchanged)
6. `PlaybackBar` with video export
7. `ShowYourWork` sheet (controlled by open state)

- [ ] **Step 2: Verify TaxSlider supports step/suffix props**

Read `components/sidebar/TaxSlider.tsx`. If it doesn't have `step` and `suffix` props, add them:
- `step?: number` (defaults to 1)
- `suffix?: string` (appended to the displayed value, e.g. "%" or "x")

This is needed for the ShowYourWork panel where sliders show decimal values like "1.8%" and "1.2x".

- [ ] **Step 3: Run type check**

Run: `npx tsc --noEmit`
Fix any errors.

- [ ] **Step 4: Start dev server and verify**

Run: `npm run dev`
Verify:
- Charts tab shows debt/deficit + wealth distribution (as before)
- Household Impact tab shows 5 persona cards
- What-if mode toggle in header switches to event selector
- Selecting an event shows counterfactual line on debt chart
- "Assumptions" button opens the Show Your Work drawer
- Export Video button appears in playback bar
- URL state encodes/restores what-if mode

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "feat: SimEcon Phase 2 complete - what-if mode, personas, assumptions panel, video export"
```

---

## Summary

| Task | Description | Key Files |
|------|-------------|-----------|
| 1 | Types & data (what-if events, personas) | types.ts, what-if-events.ts, personas.ts |
| 2 | What-if counterfactual engine | what-if.ts |
| 3 | Wire what-if into useSimulation + URL state | useSimulation.ts, url-state.ts, useURLState.ts |
| 4 | What-if controls UI + chart overlay | WhatIfControls.tsx, Header.tsx, DebtDeficitChart.tsx |
| 5 | Household personas + tab system | PersonaCard.tsx, HouseholdPersonas.tsx, VisualizationTabs.tsx |
| 6 | Show Your Work assumptions panel | ShowYourWork.tsx |
| 7 | TikTok video export | VideoExport.tsx, PlaybackBar.tsx |
| 8 | Integration & polish | SimulatorLayout.tsx, TaxSlider.tsx |

**Deferred:** Animated Sankey money flow diagram (D3-sankey) — to be planned separately after these features ship.
