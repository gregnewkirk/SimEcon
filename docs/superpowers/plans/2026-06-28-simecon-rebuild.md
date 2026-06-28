# SimEcon Engine Rebuild Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace SimEcon's top-down fudge engine with a real itemized federal ledger whose every lever self-scores against cited CBO/JCT/Treasury numbers, and rewire the existing UI to it.

**Architecture:** A typed `BudgetLine[]` baseline (FY2025) is grown forward on per-line bases. Each `Lever` returns `LineDelta[]` (a conventional/static score, plus an optional dynamic one) applied fresh every year so nothing compounds. Two engine entry points share the core: `projectForward` (2025-2050 sandbox) and `replayCounterfactual` (2000-2025, real history +/- cited event delta). Static cited incidence drives a gamified who-pays view. The existing Next.js/shadcn/Recharts UI is rewired, not replaced.

**Tech Stack:** TypeScript, Next.js 16, React, Recharts, shadcn/ui, Tailwind. Tests: Vitest.

## Global Constraints

- No em-dashes anywhere (hyphens, parentheses, commas only).
- Every displayed number traces to a `Citation` (no orphan numbers).
- Fidelity is "real where it counts": calibrated levers match cited CBO/JCT/Treasury within stated tolerance; estimate-tier levers are visibly badged.
- Conventional scoring is the default; dynamic/behavioral effects only apply when a Dynamic toggle is on. Exception: capital-gains realization elasticity is in the conventional score (CBO convention).
- Levers persist as deltas re-applied each year; program cost is never folded into carried-forward spending.
- Pure sandbox: no win conditions.
- TDD on every engine/lever task: failing test first, then minimal code. Frequent commits.
- Keep the existing UI shell; follow existing component patterns under `components/`.

---

## File Structure

```
lib/
  citations.ts            // Citation type + SOURCES registry
  ledger/
    types.ts              // BudgetLine, GrowthBasis, LineDelta, YearData, Provenance
    baseline.ts           // FY2025 BudgetLine[] (cited data)
    growth.ts             // GrowthBasis -> annual factor (real/nominal split)
    interest.ts           // effective-rate rollover model
  levers/
    types.ts              // Lever, LeverConfig, Tier
    tax-brackets.ts       // income brackets, scored off SOI distribution
    payroll.ts            // payroll + SS cap
    corporate.ts
    capital-gains.ts      // Laffer-shaped
    estate.ts
    programs.ts           // spending programs (re-verified)
    revenue-options.ts    // wealth tax, carbon, FTT, etc (ranges where contested)
    registry.ts           // all levers + tiers
    apply.ts              // applyLevers(lines, levers, config, dynamic) -> {lines, provenance}
  engine/
    project-forward.ts    // 2025 -> endYear
    replay-counterfactual.ts // 2000 -> 2025
    year-data.ts          // buildYearData helper
  events/
    catalog.ts            // counterfactual events with cited fiscal costs
  incidence/
    tables.ts             // cited incidence-by-bracket per lever
    compute.ts            // per-config who-pays/who-benefits
  data/
    historical.ts         // KEEP (real 2000-2025 actuals; used by retrospective)
tests/
  ledger/, levers/, engine/, incidence/  // vitest specs mirroring lib/
components/  // rewired to new engine (existing shell)
```

Old files removed once unused: `lib/engine/simulate.ts`, `simulate-revision.ts`,
`tax-revenue.ts`, `wealth-redistribution.ts`, `what-if.ts`. (Removal happens in the UI
rewire task, after the new engine is wired and green, never before.)

---

### Task 0: Test harness + core types

**Files:**
- Modify: `package.json` (add vitest, test script)
- Create: `vitest.config.ts`
- Create: `lib/citations.ts`
- Create: `lib/ledger/types.ts`
- Test: `tests/setup.test.ts`

**Interfaces:**
- Produces:
  - `interface Citation { id: string; agency: string; dataset: string; year: number; url: string; accessed: string }`
  - `type GrowthBasis = "nominalGDP" | "wages" | "profits" | "ssCOLA" | "healthCost" | "inflation" | "computed"`
  - `interface BudgetLine { id: string; label: string; side: "revenue" | "spending"; valueB: number; growthBasis: GrowthBasis; citationId: string }`
  - `interface LineDelta { lineId: string; amountB: number; citationId: string; leverId: string }`
  - `interface Provenance { source: "baseline" | string; amountB: number; citationId: string }`
  - `interface YearData { year: number; lines: BudgetLine[]; revenueB: number; spendingB: number; deficitB: number; debtT: number; gdpT: number; debtToGdp: number; provenance: Record<string, Provenance[]>; isProjected: boolean }`

- [ ] **Step 1:** Add Vitest. `npm i -D vitest @vitest/ui`. Add `"test": "vitest run"`, `"test:watch": "vitest"` to scripts.
- [ ] **Step 2:** Create `vitest.config.ts` with `test: { environment: 'node', include: ['tests/**/*.test.ts'] }` and the `@/*` path alias mirrored from tsconfig.
- [ ] **Step 3:** Write `lib/citations.ts` with the `Citation` interface and an empty-but-typed `SOURCES: Record<string, Citation>` to be filled per task.
- [ ] **Step 4:** Write `lib/ledger/types.ts` with the interfaces above.
- [ ] **Step 5:** `tests/setup.test.ts`: trivial `expect(true).toBe(true)` to confirm the runner.
- [ ] **Step 6:** Run `npm test`. Expected: PASS.
- [ ] **Step 7:** Commit: `chore: add vitest + core ledger types`.

---

### Task 1: Baseline ledger (FY2025) + reconciliation test

**Files:**
- Create: `lib/ledger/baseline.ts`
- Modify: `lib/citations.ts` (add baseline sources)
- Test: `tests/ledger/baseline.test.ts`

**Interfaces:**
- Consumes: `BudgetLine`, `Citation` (Task 0).
- Produces: `BASELINE_2025: BudgetLine[]`, `BASELINE_DEBT_T = 36.6`, `BASELINE_GDP_T = 29.3`.

**Real numbers:** pulled and verified from CBO Monthly Budget Review FY2025 + OMB Historical Tables 2.1/3.2 during this task. Anchors (verify exact): individual income ~2450, payroll ~1720, corporate ~530, excise ~100, customs ~80, estate&gift ~35, misc ~90 (revenue ~5005). Social Security ~1520, Medicare net ~1050, Medicaid ~620, other mandatory ~1000, defense ~900, nondefense discretionary ~950, net interest ~1000 (outlays ~6040 ex-interest... NOTE: reconcile so revenue ~5.0T, outlays ~6.9T, deficit ~1.9T; adjust "other mandatory" to the residual that closes to the real headline, and document it).

- [ ] **Step 1: Write the failing test**
```ts
import { describe, it, expect } from "vitest";
import { BASELINE_2025 } from "@/lib/ledger/baseline";

const sum = (side: "revenue" | "spending") =>
  BASELINE_2025.filter(l => l.side === side).reduce((s, l) => s + l.valueB, 0);

describe("FY2025 baseline reconciliation", () => {
  it("revenue totals ~5.0T within 2%", () => {
    expect(sum("revenue")).toBeGreaterThan(4900);
    expect(sum("revenue")).toBeLessThan(5100);
  });
  it("spending totals ~6.9T within 2%", () => {
    expect(sum("spending")).toBeGreaterThan(6760);
    expect(sum("spending")).toBeLessThan(7040);
  });
  it("deficit is ~1.9T", () => {
    expect(sum("spending") - sum("revenue")).toBeGreaterThan(1800);
    expect(sum("spending") - sum("revenue")).toBeLessThan(2000);
  });
  it("every line has a real citation", () => {
    for (const l of BASELINE_2025) {
      expect(l.citationId).toBeTruthy();
    }
  });
});
```
- [ ] **Step 2:** Run `npm test tests/ledger/baseline.test.ts`. Expected: FAIL (module missing).
- [ ] **Step 3:** Pull verified FY2025 values from CBO/OMB. Write `BASELINE_2025` with each line `{id,label,side,valueB,growthBasis,citationId}` and add the matching `Citation`s to `SOURCES`.
- [ ] **Step 4:** Run the test. Expected: PASS.
- [ ] **Step 5:** Commit: `feat(ledger): FY2025 itemized baseline with reconciliation test`.

---

### Task 2: Growth + interest model

**Files:**
- Create: `lib/ledger/growth.ts`, `lib/ledger/interest.ts`
- Test: `tests/ledger/growth.test.ts`, `tests/ledger/interest.test.ts`

**Interfaces:**
- Consumes: `GrowthBasis`.
- Produces:
  - `interface EconAssumptions { realGdpGrowth: number; inflation: number; newIssueRate: number; avgMaturityYears: number }`
  - `DEFAULT_ASSUMPTIONS` (CBO 2025: realGdpGrowth 1.9, inflation 2.3, newIssueRate 4.0, avgMaturityYears 6)
  - `growthFactor(basis: GrowthBasis, a: EconAssumptions): number` (annual multiplier; e.g. nominalGDP = (1+real/100)(1+infl/100), inflation = 1+infl/100, wages = nominalGDP, healthCost = nominalGDP + ~1.5pt, ssCOLA = inflation + demographics ~1pt, computed = 1)
  - `effectiveRate(prevEffective: number, a: EconAssumptions): number` (blends toward newIssueRate by 1/avgMaturity each year)

- [ ] **Step 1: Write failing tests**
```ts
import { describe, it, expect } from "vitest";
import { growthFactor, effectiveRate, DEFAULT_ASSUMPTIONS as A } from "@/lib/ledger/growth";
// interest exported from growth or interest; keep import path consistent with impl

describe("growth", () => {
  it("nominalGDP ~= real+inflation compounded", () => {
    expect(growthFactor("nominalGDP", A)).toBeCloseTo(1.042, 2);
  });
  it("inflation basis tracks inflation only", () => {
    expect(growthFactor("inflation", A)).toBeCloseTo(1.023, 3);
  });
  it("computed basis does not grow on its own", () => {
    expect(growthFactor("computed", A)).toBe(1);
  });
});
describe("interest rollover", () => {
  it("effective rate moves toward new-issue rate, not instantly", () => {
    const next = effectiveRate(3.2, A); // old 3.2 toward 4.0
    expect(next).toBeGreaterThan(3.2);
    expect(next).toBeLessThan(4.0);
  });
});
```
- [ ] **Step 2:** Run tests. Expected: FAIL.
- [ ] **Step 3:** Implement `growth.ts` (and `effectiveRate`, either here or in `interest.ts` with a re-export). Health/SS premiums (1.5pt, 1pt) are cited assumptions; add citations.
- [ ] **Step 4:** Run tests. Expected: PASS.
- [ ] **Step 5:** Commit: `feat(ledger): real/nominal growth bases + interest rollover`.

---

### Task 3: Lever framework + apply

**Files:**
- Create: `lib/levers/types.ts`, `lib/levers/apply.ts`
- Test: `tests/levers/apply.test.ts`

**Interfaces:**
- Consumes: `BudgetLine`, `LineDelta`, `Provenance`.
- Produces:
  - `type Tier = "calibrated" | "estimate"`
  - `interface LeverConfig { [leverId: string]: number | boolean }` (slider/toggle values)
  - `interface Lever { id: string; label: string; category: "tax"|"program"|"revenue"|"experimental"; tier: Tier; targets: string[]; conventional(cfg: LeverConfig): LineDelta[]; dynamic?(cfg: LeverConfig): LineDelta[]; citationIds: string[]; contested?: boolean }`
  - `applyLevers(lines: BudgetLine[], levers: Lever[], cfg: LeverConfig, useDynamic: boolean): { lines: BudgetLine[]; provenance: Record<string, Provenance[]> }`

- [ ] **Step 1: Write failing test**
```ts
import { describe, it, expect } from "vitest";
import { applyLevers } from "@/lib/levers/apply";
import type { Lever } from "@/lib/levers/types";
import type { BudgetLine } from "@/lib/ledger/types";

const lines: BudgetLine[] = [
  { id: "corp", label: "Corporate", side: "revenue", valueB: 530, growthBasis: "profits", citationId: "c" },
];
const lever: Lever = {
  id: "corpRate", label: "Corporate rate", category: "tax", tier: "calibrated",
  targets: ["corp"], citationIds: ["c"],
  conventional: (cfg) => [{ lineId: "corp", amountB: ((cfg.corpRate as number) - 21) * 18, citationId: "c", leverId: "corpRate" }],
};

describe("applyLevers", () => {
  it("adds conventional delta to the target line and records provenance", () => {
    const { lines: out, provenance } = applyLevers(lines, [lever], { corpRate: 28 }, false);
    expect(out.find(l => l.id === "corp")!.valueB).toBeCloseTo(530 + 7 * 18, 6);
    expect(provenance.corp.some(p => p.source === "corpRate")).toBe(true);
  });
  it("ignores dynamic deltas when useDynamic is false", () => {
    const withDyn: Lever = { ...lever, dynamic: () => [{ lineId: "corp", amountB: -50, citationId: "c", leverId: "corpRate" }] };
    const off = applyLevers(lines, [withDyn], { corpRate: 28 }, false);
    const on = applyLevers(lines, [withDyn], { corpRate: 28 }, true);
    expect(on.lines.find(l=>l.id==="corp")!.valueB).toBeCloseTo(off.lines.find(l=>l.id==="corp")!.valueB - 50, 6);
  });
});
```
- [ ] **Step 2:** Run. Expected: FAIL.
- [ ] **Step 3:** Implement `apply.ts`: clone lines, for each lever sum `conventional` (+`dynamic` if `useDynamic`) deltas into matching `lineId`, push `Provenance` entries keyed by lineId. Baseline value is recorded as the first provenance entry per touched line.
- [ ] **Step 4:** Run. Expected: PASS.
- [ ] **Step 5:** Commit: `feat(levers): lever type + applyLevers with provenance`.

---

### Task 4: Tax levers + golden-number tests

**Files:**
- Create: `lib/levers/tax-brackets.ts`, `payroll.ts`, `corporate.ts`, `capital-gains.ts`, `estate.ts`
- Modify: `lib/citations.ts`
- Test: `tests/levers/tax.test.ts`

**Interfaces:**
- Consumes: `Lever`, `LineDelta`, `applyLevers`.
- Produces: exported `Lever` objects: `topRateLever`, `bracketLevers` (per bracket), `payrollCapLever`, `corporateLever`, `capGainsLever`, `estateLever`; plus `SOI_TAXABLE_BY_BRACKET` (cited IRS SOI income stacked per bracket).

**Golden numbers (verify against citation during build; tolerances stated):**
- Top rate 37 -> 39.6 raises ~ +$30-40B/yr conventional (JCT-consistent). Tolerance: within the cited figure +/-15%.
- Corporate 21 -> 28 raises ~ +$120-130B/yr (JCT 10yr annualized). Tolerance +/-15%.
- Remove SS cap raises ~ +$120-150B/yr (CBO/SSA). Tolerance +/-15%.
- Capital gains: revenue at 28-30% > revenue at 20% AND > revenue at 50% (peak in between).
- Estate doubling rate roughly doubles estate revenue (linear), small magnitude.

- [ ] **Step 1: Write failing tests**
```ts
import { describe, it, expect } from "vitest";
import { BASELINE_2025 } from "@/lib/ledger/baseline";
import { applyLevers } from "@/lib/levers/apply";
import { corporateLever, payrollCapLever, capGainsLever, topRateLever } from "@/lib/levers/registry-tax"; // or individual files

const rev = (lines:any[]) => lines.filter(l=>l.side==="revenue").reduce((s,l)=>s+l.valueB,0);
const base = rev(BASELINE_2025);

describe("tax lever golden numbers", () => {
  it("top rate 37->39.6 raises 25-45B", () => {
    const d = rev(applyLevers(BASELINE_2025,[topRateLever],{topRate:39.6},false).lines) - base;
    expect(d).toBeGreaterThan(25); expect(d).toBeLessThan(45);
  });
  it("corporate 21->28 raises 100-150B", () => {
    const d = rev(applyLevers(BASELINE_2025,[corporateLever],{corpRate:28},false).lines) - base;
    expect(d).toBeGreaterThan(100); expect(d).toBeLessThan(150);
  });
  it("remove SS cap raises 110-160B", () => {
    const d = rev(applyLevers(BASELINE_2025,[payrollCapLever],{removeSsCap:true},false).lines) - base;
    expect(d).toBeGreaterThan(110); expect(d).toBeLessThan(160);
  });
  it("capital gains revenue peaks between 20% and 50%", () => {
    const at = (r:number)=> rev(applyLevers(BASELINE_2025,[capGainsLever],{capGains:r},false).lines);
    expect(at(29)).toBeGreaterThan(at(20));
    expect(at(29)).toBeGreaterThan(at(50));
  });
});
```
- [ ] **Step 2:** Run. Expected: FAIL.
- [ ] **Step 3:** Implement each lever. Brackets: `SOI_TAXABLE_BY_BRACKET` x marginal-rate delta. Payroll: wages above cap x 12.4% (cited wage distribution). Corporate: `(rate-21)*perPointB`. Cap gains: `realizations(rate) = base * exp(-elasticity*(rate-20)/100)`, revenue = realizations*rate; tune elasticity so peak ~28-30% (cited CBO). Estate: linear. Add all citations.
- [ ] **Step 4:** Run. Expected: PASS. If a golden number misses, fix the coefficient against the citation (not the test).
- [ ] **Step 5:** Commit: `feat(levers): calibrated tax levers with golden-number tests`.

---

### Task 5: Programs + revenue options

**Files:**
- Create: `lib/levers/programs.ts`, `lib/levers/revenue-options.ts`, `lib/levers/registry.ts`
- Modify: `lib/citations.ts`
- Test: `tests/levers/programs.test.ts`

**Interfaces:**
- Produces: `PROGRAM_LEVERS: Lever[]`, `REVENUE_LEVERS: Lever[]`, `ALL_LEVERS: Lever[]`, `LEVERS_BY_ID: Map<string,Lever>`.

Programs port from the current `data/programs.ts` net-cost figures, each offset re-verified against its source; spending programs add to spending lines, revenue options add to revenue lines. Contested levers (wealth tax) set `contested: true` and expose a range via two citations.

- [ ] **Step 1: Write failing test**
```ts
import { describe, it, expect } from "vitest";
import { ALL_LEVERS, LEVERS_BY_ID } from "@/lib/levers/registry";
describe("lever registry", () => {
  it("every lever has tier + at least one citation", () => {
    for (const l of ALL_LEVERS) {
      expect(["calibrated","estimate"]).toContain(l.tier);
      expect(l.citationIds.length).toBeGreaterThan(0);
    }
  });
  it("healthcare program is calibrated and adds spending", () => {
    expect(LEVERS_BY_ID.get("healthcare")!.tier).toBe("calibrated");
  });
  it("wealth tax is flagged contested", () => {
    expect(LEVERS_BY_ID.get("wealth_tax")!.contested).toBe(true);
  });
});
```
- [ ] **Step 2:** Run. Expected: FAIL.
- [ ] **Step 3:** Implement `programs.ts`, `revenue-options.ts`, `registry.ts`. Tier each lever per spec (big programs calibrated; long-tail estimate).
- [ ] **Step 4:** Run. Expected: PASS.
- [ ] **Step 5:** Commit: `feat(levers): programs + revenue options + registry`.

---

### Task 6: Forward engine + no-compounding regression

**Files:**
- Create: `lib/engine/year-data.ts`, `lib/engine/project-forward.ts`
- Test: `tests/engine/project-forward.test.ts`

**Interfaces:**
- Consumes: baseline, growth, interest, applyLevers, registry.
- Produces: `projectForward(cfg: LeverConfig, a: EconAssumptions, opts: { useDynamic: boolean; endYear: number }): YearData[]`.

Per year: grow each baseline line by its `growthFactor`; recompute net interest from prior debt x `effectiveRate`; apply levers fresh (deltas, never folded in); revenue/spending/deficit/debt/debtToGdp computed; provenance attached. GDP grown at nominalGDP factor.

- [ ] **Step 1: Write failing tests** (the bug-class regression)
```ts
import { describe, it, expect } from "vitest";
import { projectForward } from "@/lib/engine/project-forward";
import { DEFAULT_ASSUMPTIONS as A } from "@/lib/ledger/growth";

describe("projectForward", () => {
  it("a flat program does not compound (delta ~ inflation only, plus interest on extra debt)", () => {
    const base = projectForward({}, A, { useDynamic:false, endYear:2035 });
    const prog = projectForward({ healthcare:true }, A, { useDynamic:false, endYear:2035 });
    const y1 = prog[0].spendingB - base[0].spendingB;
    const y10 = prog[9].spendingB - base[9].spendingB;
    // year-10 delta is program cost grown by inflation (~1.28x) PLUS interest on accumulated
    // extra debt, but must be far below the old balloon (which was >10x). Assert < 2.2x y1.
    expect(y10).toBeLessThan(y1 * 2.2);
    expect(y10).toBeGreaterThan(y1); // does grow a bit via real interest
  });
  it("debt-to-GDP is finite and nominal/nominal", () => {
    const r = projectForward({}, A, { useDynamic:false, endYear:2050 });
    expect(r[r.length-1].debtToGdp).toBeGreaterThan(0);
    expect(Number.isFinite(r[r.length-1].debtToGdp)).toBe(true);
  });
  it("every projected year carries provenance for revenue and spending", () => {
    const r = projectForward({ corpRate:28 }, A, { useDynamic:false, endYear:2030 });
    expect(Object.keys(r[0].provenance).length).toBeGreaterThan(0);
  });
});
```
- [ ] **Step 2:** Run. Expected: FAIL.
- [ ] **Step 3:** Implement `year-data.ts` (assembles a `YearData` from lines+debt+gdp) and `project-forward.ts`.
- [ ] **Step 4:** Run. Expected: PASS.
- [ ] **Step 5:** Commit: `feat(engine): project-forward with no-compounding regression test`.

---

### Task 7: Counterfactual engine + event catalog

**Files:**
- Create: `lib/events/catalog.ts`, `lib/engine/replay-counterfactual.ts`
- Modify: `lib/citations.ts`
- Test: `tests/engine/counterfactual.test.ts`

**Interfaces:**
- Consumes: `HISTORICAL_DATA` (kept), citations.
- Produces:
  - `interface CounterEvent { id: string; label: string; startYear: number; endYear: number; annualCostB: number; sign: 1 | -1; citationId: string }`
  - `COUNTER_EVENTS: CounterEvent[]` (Bush tax cuts, Iraq, Afghanistan, TARP, COVID)
  - `replayCounterfactual(selectedIds: string[], a: EconAssumptions): { actual: YearData[]; counterfactual: YearData[] }`

Counterfactual = real history, with each selected event's `annualCostB` removed within its window AND the interest never paid on the avoided debt compounded forward at `effectiveRate`. Actual = real history mapped to YearData.

- [ ] **Step 1: Write failing test**
```ts
import { describe, it, expect } from "vitest";
import { replayCounterfactual } from "@/lib/engine/replay-counterfactual";
import { DEFAULT_ASSUMPTIONS as A } from "@/lib/ledger/growth";

describe("replayCounterfactual", () => {
  it("removing Bush tax cuts lowers 2010 debt vs actual", () => {
    const { actual, counterfactual } = replayCounterfactual(["bush_tax_cuts"], A);
    const a2010 = actual.find(d=>d.year===2010)!.debtT;
    const c2010 = counterfactual.find(d=>d.year===2010)!.debtT;
    expect(c2010).toBeLessThan(a2010);
  });
  it("with no events selected, counterfactual equals actual", () => {
    const { actual, counterfactual } = replayCounterfactual([], A);
    const a = actual.find(d=>d.year===2010)!.debtT;
    const c = counterfactual.find(d=>d.year===2010)!.debtT;
    expect(c).toBeCloseTo(a, 6);
  });
});
```
- [ ] **Step 2:** Run. Expected: FAIL.
- [ ] **Step 3:** Implement `catalog.ts` (cited per-event costs) and `replay-counterfactual.ts`.
- [ ] **Step 4:** Run. Expected: PASS.
- [ ] **Step 5:** Commit: `feat(engine): counterfactual replay + cited event catalog`.

---

### Task 8: Incidence (who pays / who benefits)

**Files:**
- Create: `lib/incidence/tables.ts`, `lib/incidence/compute.ts`
- Modify: `lib/citations.ts`
- Test: `tests/incidence/compute.test.ts`

**Interfaces:**
- Produces:
  - `type BracketId = "top1" | "next9" | "middle40" | "bottom50"`
  - `INCIDENCE: Record<string /*leverId*/, Record<BracketId, number /*share of burden/benefit, -1..1*/>>` (cited TPC/CBO/ITEP)
  - `computeIncidence(cfg: LeverConfig): Record<BracketId, number /*$ per year, + = net benefit*/>`

- [ ] **Step 1: Write failing test**
```ts
import { describe, it, expect } from "vitest";
import { computeIncidence } from "@/lib/incidence/compute";
describe("incidence", () => {
  it("raising the top rate hits top1 more than bottom50", () => {
    const inc = computeIncidence({ topRate: 45 });
    expect(inc.top1).toBeLessThan(inc.bottom50); // top pays more (more negative)
  });
  it("UBI nets positive for the bottom 50%", () => {
    const inc = computeIncidence({ ubi: true });
    expect(inc.bottom50).toBeGreaterThan(0);
  });
});
```
- [ ] **Step 2:** Run. Expected: FAIL.
- [ ] **Step 3:** Implement cited tables + compute (burden of each active lever distributed by its incidence shares times its $ size).
- [ ] **Step 4:** Run. Expected: PASS.
- [ ] **Step 5:** Commit: `feat(incidence): cited who-pays/who-benefits engine`.

---

### Task 9: Rewire UI state to the new engine

**Files:**
- Modify: `hooks/` simulation hook(s), `lib/url-state.ts`, `lib/types.ts` (bridge or replace), `components/layout/SinglePageLayout.tsx`, `components/sidebar/TaxControls.tsx`, `components/visualization/*` chart inputs.
- Delete (after green): `lib/engine/simulate.ts`, `simulate-revision.ts`, `tax-revenue.ts`, `wealth-redistribution.ts`, `what-if.ts`.
- Test: manual via dev server + `npm test` still green.

**Interfaces:**
- Consumes: `projectForward`, `replayCounterfactual`, `ALL_LEVERS`, `computeIncidence`.
- Produces: a `useSimulation()` hook returning `{ mode, cfg, setLever, useDynamic, setUseDynamic, years: YearData[], incidence }`.

- [ ] **Step 1:** Build `useSimulation()` mapping the lever registry to slider/toggle state and calling the right engine per mode. URL state encodes `cfg` + mode + dynamic toggle.
- [ ] **Step 2:** Point existing charts (RevenueSpendingChart, debt chart, etc.) at `years` from the new engine. Adapt prop shapes minimally.
- [ ] **Step 3:** Replace the lever sidebar to render `ALL_LEVERS` grouped by category with the Calibrated/Estimate badge.
- [ ] **Step 4:** Run `npm test` (green) and `npm run build` (typecheck/compile clean).
- [ ] **Step 5:** Start dev server, load `/`, confirm 200 + no console errors, baseline deficit/debt render.
- [ ] **Step 6:** Delete the five dead engine files; re-run build green.
- [ ] **Step 7:** Commit: `refactor(ui): wire SimEcon UI to the new itemized engine; remove old engine`.

---

### Task 10: Live money-flow Sankey

**Files:**
- Create: `components/visualization/MoneyFlowSankey.tsx`
- Modify: tab/layout to mount it.
- Test: manual (renders, updates on slider).

**Interfaces:**
- Consumes: current-year `YearData` (revenue lines -> spending lines).

- [ ] **Step 1:** Build Sankey from revenue lines (left) to spending lines (right) using Recharts `Sankey` (already in deps) or a focused custom SVG if Recharts Sankey is too rigid.
- [ ] **Step 2:** Re-flow on `cfg` change; animate transitions.
- [ ] **Step 3:** Dev-server verify it reacts to a slider.
- [ ] **Step 4:** Commit: `feat(viz): live revenue-to-spending Sankey`.

---

### Task 11: Gamified incidence (bracket characters + household)

**Files:**
- Create: `components/visualization/BracketCharacters.tsx`
- Modify: `components/visualization/KitchenTableView.tsx`, `PersonalCalculator.tsx` to consume `computeIncidence`.
- Test: manual.

- [ ] **Step 1:** Four bracket characters with animated counters + "+/-$/yr" floaters driven by `computeIncidence(cfg)`; hover shows the citation.
- [ ] **Step 2:** Rewire the kitchen-table household to the cited incidence path.
- [ ] **Step 3:** Dev-server verify coins/counters react live.
- [ ] **Step 4:** Commit: `feat(viz): gamified bracket characters + household incidence`.

---

### Task 12: Show Your Work + badges + uncertainty cone

**Files:**
- Modify: `components/shared/ShowYourWork.tsx`, headline number components, debt chart.
- Test: manual.

- [ ] **Step 1:** Render each headline number's `provenance` (baseline + each lever contribution + citation link) in an expandable panel.
- [ ] **Step 2:** Calibrated/Estimate badge on every lever control; contested badge + range where set.
- [ ] **Step 3:** Widening uncertainty band on the debt chart for years > 10 past the start.
- [ ] **Step 4:** Dev-server verify a number expands to its sourced breakdown.
- [ ] **Step 5:** Commit: `feat(ui): first-class Show Your Work + honesty badges + uncertainty cone`.

---

### Task 13: Adversarial pressure-test pass

**Files:**
- Create: `docs/superpowers/adversarial-review-2026-06-28.md`
- Modify: whatever findings require.

- [ ] **Step 1:** For every slider, result, and graph: compare the on-screen number to its citation and to an independent external sanity source. Each candidate finding is verified (skeptic-first) before it is accepted.
- [ ] **Step 2:** Log confirmed findings; fix each at the source (lever coefficient or baseline value, never the test).
- [ ] **Step 3:** Re-run `npm test` (all golden numbers green) and rebuild.
- [ ] **Step 4:** Commit: `test: adversarial pressure-test pass + calibration fixes`.

---

## Self-Review

- **Spec coverage:** baseline (T1), levers+tiers+Laffer (T4-5), conventional/dynamic (T3-4), forward 2050 + no-compound + interest rollover (T2,T6), counterfactual 2000-2025 (T7), incidence replacing wealth projection (T8), gamified characters (T11), Sankey (T10), Show Your Work + badges + cone (T12), adversarial verification (T13). All five spec sections + the verification section map to tasks.
- **Placeholder scan:** real values are pulled-and-verified inside T1/T4/T7/T8 (gated, with cited tolerance tests), not left as prose TODOs. No "add error handling" style steps.
- **Type consistency:** `BudgetLine`, `LineDelta`, `Provenance`, `YearData`, `Lever`, `LeverConfig`, `EconAssumptions` defined in T0/T2/T3 and used consistently downstream.
