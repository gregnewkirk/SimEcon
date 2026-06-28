# SimEcon Engine Rebuild - Design Spec

Date: 2026-06-28
Status: Approved design, pre-implementation
Author: CC2 (with Greg)

## Why

The current engine is a top-down fudge. It computes one revenue scalar and one
spending scalar, with "income-to-wealth ratios" hand-tuned to hit a ~$5T total. The
total looks right while every lever underneath misbehaves, and no number is traceable.
A stream viewer correctly flagged that yearly additions did not move the budget
precisely and long-run projections broke (an already-fixed compounding bug, commit
2ebbaff, was one symptom). The goal of this rebuild: a sandbox economy game that feels
like SimCity / Factorio for the federal budget, where every number is defensible,
cited, and traceable, because "it is embarrassing if this is incorrect."

## Goal and scope (locked decisions)

- **Fidelity: real where it counts (hybrid).** Headline levers people will poke (income
  brackets, payroll, corporate, capital gains, estate, and the big programs) are
  calibrated to actual CBO / JCT / Treasury scores within a few percent. Long-tail
  experimental levers stay clearly labeled as rougher estimates. Every number cites a
  source.
- **Play loop: pure sandbox.** No win state. A live what-if engine: tweak levers, watch
  the budget, debt-to-GDP, money flows, who-pays, and a sample household update live.
- **Scoring: conventional by default, dynamic opt-in.** Levers show their static
  CBO/JCT conventional score by default. Behavioral / dynamic effects (multipliers,
  elasticities, Laffer) live behind a clearly labeled "Dynamic effects" toggle so the
  contestable assumptions are opt-in and visible.
- **Approach A:** rebuild the engine from a real itemized ledger; keep and rewire the
  existing Next.js / shadcn / Recharts UI shell. Add the live money-flow Sankey.

## Two modes, two time directions

Both modes share the same itemized ledger and lever-scoring core and emit the same
`YearData[]` shape, so graphs and the transparency layer work identically.

1. **"What if we had..." (counterfactual retrospective) - 2000 to 2025.**
   Anchored on 2000-01, the last balanced budget. The player adds or removes real world
   events (Bush tax cuts, Iraq, Afghanistan, TARP, COVID). Computed as **real
   historical data plus or minus that event's cited fiscal cost, with interest
   savings/costs compounded forward** (a signed delta off reality), NOT a 25-year
   economic re-simulation that would drift from real history.
   Sources: CBO / Treasury actuals; CRS / Watson Institute event-cost estimates.

2. **"Fix this mess" (forward sandbox) - 2025 to 2050.**
   The long-term budget mode. 2050 is the point, so it shows the full 25-year forward
   view by default (not a 10-year window). Levers apply each year to 2050. CBO
   calibration holds (scores are annual). The uncertainty cone is the honesty mechanism
   for far years, not a reason to shorten the view. The symmetry is deliberate: 25 years
   back from the last balanced budget, 25 years forward to try to rebalance it.

Engine entry points:
- `projectForward(baseline2025, levers, assumptions, endYear=2050) -> YearData[]`
- `replayCounterfactual(history, selectedEvents, assumptions, endYear=2025) -> { actual, counterfactual }`

## Section 1 - The baseline ledger (the anchor)

The model hangs off a real, itemized FY2025 federal budget. No single revenue/spending
scalars. Each line is a typed object carrying value, growth basis, and citation. Values
below are approximate anchors; during the build each is pulled from its cited source and
verified in a gated step.

Line shape:
```ts
interface BudgetLine {
  id: string;
  label: string;
  valueB: number;          // FY2025 nominal billions
  growthBasis: GrowthBasis;// "nominalGDP" | "wages" | "profits" | "ssCOLA+demographics"
                           // | "healthCostCurve" | "inflation" | "computed"
  citation: Citation;
}
```

Revenue lines (sources: CBO Monthly Budget Review FY2025, OMB Historical Table 2.1,
Treasury Combined Statement):

| Line | ~FY2025 | Growth basis |
| --- | --- | --- |
| Individual income tax | ~$2.45T | nominalGDP |
| Payroll / social insurance | ~$1.72T | wages (NEW - missing today) |
| Corporate income tax | ~$530B | profits |
| Excise | ~$100B | inflation |
| Customs duties | ~$80B | nominalGDP |
| Estate & gift | ~$35B | nominalGDP |
| Misc (Fed remittances, fees) | ~$90B | nominalGDP |

Spending lines (sources: CBO Budget & Economic Outlook 2025, OMB Table 3.2):

| Line | ~FY2025 | Growth basis |
| --- | --- | --- |
| Social Security | ~$1.52T | ssCOLA+demographics |
| Medicare (net) | ~$1.05T | healthCostCurve |
| Medicaid | ~$620B | healthCostCurve |
| Other mandatory | ~$1.0T | nominalGDP |
| Defense discretionary | ~$900B | inflation |
| Non-defense discretionary | ~$950B | inflation |
| Net interest | ~$1.0T | computed (debt x effective rate) |

These sum to roughly $5.0T revenue / $6.9T outlays / ~$1.9T deficit / ~$36.6T debt,
matching the real FY2025 headline so the app opens on a defensible baseline. Structural
wins: payroll exists, corporate is right-sized, net interest is derived not pinned. The
baseline is data, not logic, so it is auditable and swappable as new CBO releases land.

## Section 2 - Lever scoring (how sliders behave)

Every lever scores itself against the baseline lines:
```ts
interface Lever {
  id: string;
  label: string;
  category: "tax" | "program" | "revenue" | "experimental";
  targets: string[];                 // baseline line ids it modifies
  conventional(config): LineDelta[];  // static CBO/JCT score, always on
  dynamic?(config): LineDelta[];      // behavioral adj, only when toggle is ON
  citations: Citation[];
  tier: "calibrated" | "estimate";    // honesty badge in the UI
}
```

Scoring method per lever type (conventional/static first, dynamic optional):
- **Income tax brackets** - scored off the real IRS SOI distribution of taxable income
  by bracket. A rate change multiplies the income actually stacked in that bracket,
  yielding a JCT-consistent number. Source: IRS SOI Tax Stats; JCT for behavioral offset.
- **Payroll / SS cap** - real OASDI wage base x 12.4%; "remove the cap" taxes wages above
  ~$168.6K. Possible now that payroll is a line. Source: SSA OACT, CBO budget options.
- **Corporate** - linear in rate around the 21% baseline, calibrated to JCT's 10-year
  score for a 21->28 change, annualized. Source: JCT, CBO.
- **Capital gains** - non-linear (Laffer-shaped): revenue peaks around ~28-30% because
  realizations fall as the rate rises; past ~50% revenue should DROP. This is the one
  behavioral response included even in the toggle-OFF conventional score, because CBO
  itself bakes realization elasticity into its official cap-gains scores; it is therefore
  "conventional," not a dynamic add-on. The Dynamic toggle layers any further macro
  feedback on top. This exception is stated explicitly in the UI source note for the
  lever. Source: CBO realization elasticity.
- **Estate / wealth tax / carbon / FTT, etc.** - cited deltas. Genuinely contested ones
  (wealth tax especially) show a RANGE and a "contested estimate" badge, not a false
  point number.

Two honesty tiers (how "real where it counts" shows up):
- **Calibrated** - income brackets, payroll, corporate, cap gains, estate, and the big
  programs (M4A, UBI, Social Security, Medicare/Medicaid changes, defense). To CBO/JCT
  within a few percent.
- **Estimate** - long-tail levers (robot tax, sugar tax, sports-betting tax,
  land-value tax). Cited best-estimate, visibly badged as rougher.

Programs keep "net cost = gross minus cited offsets," but every offset is re-verified
against its source during the build.

## Section 3 - Forward projection

Real vs nominal made explicit. Two drivers from CBO's 10-year projections: real GDP
growth (~1.9%) and inflation (~2.3%). Nominal GDP grows ~their sum (~4.2%). Every budget
line is nominal and grows on its own basis (Section 1 table). Debt-to-GDP is
nominal/nominal. Source: CBO Budget & Economic Outlook 2025.

Levers persist as deltas, never folded into the base. Each year, every active lever
re-scores against that year's lines and applies its delta fresh, grown on the line's own
basis. This is the generalized form of the shipped compounding fix: program cost is never
stored inside the carried-forward spending total, so the bug class cannot recur.

Interest done properly. Net interest is not `debt x current rate`. Existing debt is locked
at old rates and rolls over slowly (~6-year average maturity), so the effective rate blends
old and new-issue rates, converging over time. Source: CBO interest-rate path + average
maturity.

Horizon and uncertainty. "Fix this mess" defaults to 2025->2050. Forward years past ~10
are visibly labeled "projection, widening uncertainty" via a widening cone on the debt
chart.

## Section 4 - Distribution / who pays, who benefits (gamified)

Replace the indefensible forward wealth-share projection (and its sum-to-0.891 +
renormalization-discontinuity bugs) with **static distributional incidence**: for the
current configuration, show how each group's annual taxes/benefits change, now.
- Raise the top bracket -> top 1% pays $X more/year.
- Add UBI -> bottom 50% nets $Z more/year.
- Remove SS cap -> over-$168K earners pay $W more/year.
Each figure comes from cited incidence tables (Tax Policy Center / CBO distributional
analysis / ITEP). Today's distribution is kept only as a cited static snapshot (Fed
Distributional Financial Accounts) for context; we do not forecast it forward.

Gamified presentation (the fun, on top of defensible numbers):
- Four bracket "characters" (top 1%, next 9%, middle 40%, bottom 50%). Dragging a slider
  flows coins to/from each in real time, with animated counters and "+$1,240/yr" floaters.
- Kitchen-table household view (single parent on $60K, retiree, founder): personal
  net $/year reacts live, with a reaction. Reuses existing KitchenTableView /
  PersonalCalculator.
- Every amount is hover-to-source.

## Section 5 - Transparency + game-feel

- Live money-flow Sankey: revenue lines flowing into spending lines, re-flowing as
  sliders move. The SimCity/Factorio centerpiece.
- Instant ripple: every slider/toggle updates deficit, debt-to-GDP, Sankey, bracket
  characters, and household number in one animated tick. Numbers animate, never snap.
- Two tabs: "What if we had..." (2000->2025) and "Fix this mess" (2025->2050).
- "Show Your Work" is first-class: every headline number expands to
  `baseline value + each lever's contribution + citation`. Calibrated/Estimate badge on
  each lever; uncertainty cone past ~10 years.
- Keep the existing shell (Next.js, shadcn, Recharts, dark mode), rewire to the new engine.

## Module structure (target)

```
lib/
  ledger/
    baseline.ts        // BudgetLine[] FY2025, cited (data, not logic)
    growth.ts          // GrowthBasis -> per-year growth factor (real/nominal split)
    interest.ts        // effective-rate rollover model
  levers/
    types.ts           // Lever, LineDelta, config
    tax-brackets.ts     // income bracket scoring off SOI distribution
    payroll.ts          // payroll + SS cap
    corporate.ts
    capital-gains.ts    // Laffer-shaped
    programs.ts         // spending programs (re-verified costs)
    revenue-options.ts  // wealth tax, carbon, FTT, etc. (ranges where contested)
    registry.ts         // all levers + tier metadata
  incidence/
    tables.ts          // cited incidence by bracket per lever
    compute.ts         // per-config who-pays / who-benefits
  engine/
    project-forward.ts  // 2025->2050
    replay-counterfactual.ts // 2000->2025 (real history +/- cited event delta)
    year-data.ts        // YearData with itemized lines + provenance
  events/
    catalog.ts          // counterfactual events with cited fiscal costs
  citations.ts          // Citation type + source registry
```

`YearData` carries the itemized lines and a `provenance` array per headline number
(`{ source: "baseline" | leverId, amountB, citation }`) so Show Your Work and the
badges render directly from engine output.

## Correctness and adversarial verification (non-negotiable)

This is the whole point of the rebuild, so verification is part of the plan, not an
afterthought:
1. **Baseline reconciliation test:** itemized lines sum to the real FY2025 headline
   (revenue ~$5.0T, outlays ~$6.9T, deficit ~$1.9T, debt ~$36.6T) within tolerance.
2. **Lever golden-number tests:** each calibrated lever's conventional score matches its
   cited CBO/JCT figure within a stated tolerance (e.g., top-rate 37->39.6, corporate
   21->28, remove SS cap, M4A, UBI). Test asserts against the citation's number.
3. **No-compounding regression test:** a flat program adds a flat (inflation-only) delta
   each year; spend delta does not grow except via interest on the extra debt.
4. **Cap-gains Laffer test:** revenue rises then falls as the rate increases past ~28-30%.
5. **Incidence sign/magnitude tests:** progressive levers hit upper brackets more; UBI
   nets positive for the bottom 50%.
6. **Adversarial pressure-test pass:** independent review of every slider, result, and
   graph against its citation and against an external sanity source, with each finding
   verified before it is accepted (skeptic-first). Findings that survive get fixed.
7. **Every displayed number traces to a citation** (provenance present, no orphan numbers).

## Out of scope (YAGNI)

- Multiplayer / community gallery / AI narrator (prior Phase 3 ideas).
- A stock-and-flow sectoral simulation (Approach C) - too hard to keep CBO-consistent.
- Scored win conditions / challenges - pure sandbox only.
- Forecasting the wealth distribution forward - replaced by static incidence.

## Open items to resolve during implementation (not blocking design)

- Exact FY2025 line values and per-lever scores: pull from cited sources and verify
  (gated). Approximate anchors here are for structure only.
- Final list of counterfactual events and their cited per-event costs.
- Whether to break Social Security / Medicare into finer sub-lines (current granularity
  approved as the starting point).
