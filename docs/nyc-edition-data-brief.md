# NYC Edition — Data Collection Brief

**Status: blocked on data, not on code.** The NYC edition is designed but cannot be built until the
figures below are collected from primary sources. This document is the shopping list.

## Why this document exists

Research was attempted from a cloud sandbox whose egress policy returns **HTTP 403 for every
municipal-finance host** — `ibo.nyc.gov`, `comptroller.nyc.gov`, `osc.ny.gov`, `nyc.gov`,
`cbcny.org`, `council.nyc.gov`, `fcb.ny.gov`, `home.treasury.gov`. No primary document could be
opened. Everything below is either (a) a URL confirmed to exist via search results, or (b) a figure
extracted from a **search-result snippet**, which is explicitly *not* the same as reading the source.

**Rule for whoever collects this: no figure enters `lib/nyc/baseline.ts` without opening its source
document.** The San Diego edition holds to that standard (`lib/sd/baseline.ts` registers a source id,
agency, dataset description, URL and access date for every line) and NYC must match it. Snippet-derived
numbers demonstrably garble fiscal years, conflate city with state, and mix measurement bases — several
concrete examples are flagged below.

Run this brief from a machine with unrestricted network (a local Claude Code instance works well).

---

## 1. Baseline budget structure — required for any of the rest

**Series:** FY2025 **$112.4B** → FY2026 **$115.9B** → FY2027 **$125.8B** adopted 2026-06-30 (Council vote
45–6; Mayor Mamdani, Speaker Menin). Executive was $124.7B, Preliminary $127B.

⚠️ **Basis conflict to resolve first:** NYS Comptroller describes FY2026 as **$119.7B**, not $115.9B —
almost certainly a prepayment/accounting-basis difference. A simulator needs one consistent basis, so
settle this before encoding anything else.

| Item | Needed | Primary source |
|---|---|---|
| FY2027 Adopted Budget total | Confirm **$125.8B** (adopted 2026-06-30) | NYC Council; NYC OMB Adopted Budget |
| Revenue detail | Property tax, PIT, sales, business/corporate, RPTT + mortgage recording, hotel, other taxes, federal aid, state aid, fees/fines | NYC OMB Adopted Budget revenue schedules |
| Spending detail by agency | DOE, Medicaid/health, NYPD, FDNY, Correction, Sanitation, DHS, HRA, HPD, Parks, Libraries, DOT, debt service, pensions, fringe | NYC OMB; Council Finance Division agency reports |
| Out-year gaps | FY2028–FY2030 | NYC OMB Financial Plan; Comptroller; FCB staff report |

⚠️ **Reported FY2027 total varies across outlets: $125.8B / $126B / $127B.** The $124.7B figure is the
**Executive** budget (May 2026), a different measurement. Pin the adopted number from OMB directly.

## 2. Reserves — figures found are PRE-ADOPTION

Executive-budget-basis figures surfaced: Rainy Day Fund (RSSRF) **$2.0B**, Retiree Health Benefits Trust
**$5.2B**, General Reserve drawn to the **$100M** Charter statutory minimum in FY2027, Capital
Stabilization Reserve **$250M** in FY2028–30. The Adopted budget then **added $350M in reserves on
2026-06-30 and it is unknown which funds received it.** Collect post-adoption balances.

Highest-value unfetched document for this section: NYC Comptroller, *"How Much Is Enough?"* — the
recommended reserve target as a share of tax revenues. Also NYS Comptroller Report 4-2027 (June 2026),
which urges the City to adopt a formal Rainy Day Fund deposit/withdrawal policy.

## 3. Capital and debt

- **Ten-Year Capital Strategy FY2026–2035**: two totals surfaced — **$170.0B** (Preliminary, Jan 2025)
  and **$173.4B** (Executive, Apr 2025). Confirm which is operative and get **agency dollar amounts**
  (only percentages were obtained: DOT 19%, DEP 19%, Education 14%, Public Buildings 14%, HPD 12%).
  Determine how SCA, NYCHA and Health+Hospitals are treated — they are separate public benefit
  corporations and may sit outside the City TYCS.
- **Five-Year Capital Commitment Plan FY2026–2030**: **$117.14B** (+$4.18B / +3.7% vs Preliminary).
- **Debt service as % of tax revenues**: policy ceiling **15.0%**, FY2025 actual **10.2%**, projected
  **~14.2% by FY2033**. The year-by-year series is **Chart 26, p.166** of the Comptroller's FY2027
  Executive Budget comments PDF — fetch that page.
- **Debt limit**: FY2026 limit **$140.6B** vs indebtedness **$96.3B** → **$44.4B** remaining; FY2029
  projected **$158.6B** vs **$131.7B** → **$26.9B**. ⚠️ A conflicting limit figure ($140.0B) also
  surfaced. TFA has a **separate statutory cap**, raised by NYS from **$13.5B → $27.5B** (FY2025 state
  budget). A possible **further +$12B** state-granted capacity needs its date confirmed.

**Control matters for game design:** the debt limit is a **NYS constitutional** provision (10% of
five-year average full value of taxable real estate) — changing it requires a state constitutional
amendment, not a city vote. TFA capacity is **Albany statute**. This city/state/federal control split
should be encoded per lever, since it is the most under-appreciated fact about municipal budgets.

## 4. The distinctive pressures (what makes NYC dramatic)

### Asylum seeker / migrant costs — the strongest counterfactual in the set
Two official trackers disagree slightly and **must not be silently merged**:

| FY | NYC Comptroller | NYS Comptroller (thru 1/31/26) |
|---|---|---|
| FY23 | $1.41B | $1.47B |
| FY24 | $3.70B (also stated $3.75B) | $3.75B |
| FY25 | $3.02B | $3.02B |

The counterfactual: **$12B projected** (Mayor's Office, Aug 2023, FY23–FY25) → **~$8.1–8.2B actual**.
The August 2023 $12B covers FY23–FY25; the November 2023 **$10.8B** covers only FY24–FY25 — **these are
different windows and cannot be read as a declining series.** IBO's December 2023 mid-range was **$6.7B**
against OMB's $10.8B, and IBO was closer: FY24 came in at **$3.8B, about $1B under budget**. Census peaked
near **69,000–70,000 in January 2024**, down about **51% by September 2025**. Per-diem fell from **$383**
(2023) toward a projected **$326–336** (FY26). Comptroller Lander publicly stated the administration
"inflated projections… by billions."

### Uniformed overtime — chronic, structural overspending
NYPD uniformed overtime, actual vs. adopted: **FY2023 $821M vs $372M · FY2024 $955M vs $437M ·
FY2025 $960M vs $478M** — three consecutive years at **more than double** the adopted budget. The FCB
identifies uniformed overtime as the single largest expenditure risk, underbudgeted by **>$710M annually
beginning FY2027**. (A conflicting $890M figure appeared in one outlet — different scope, resolve it.)

### NYPD true cost — the "budget line understates by ~70%" fact
Citizens Budget Commission all-in figures: **FY2024 $10.8B total** = $5.1B agency operating + $5.8B
centrally allocated (fringe $2.9B, pension $2.7B, debt service $208M). Compare to the headline NYPD
budget line of roughly **$6.1–6.4B**. Uniformed health and pension benefits are richer than for other
city employees, so centrally allocated costs skew high. This is a *great* game mechanic: pull the NYPD
lever and show both numbers.

### Other pressures to quantify
Class-size mandate compliance (drove **+4,284 DOE positions** in the FY2026 Adopted headcount);
Medicaid local share; expiring federal COVID aid; the "budget dance"/PEG cycle; CityFHEPS vouchers;
Fair Fares (city-controlled) vs. MTA operating subsidies (mixed city/Albany).

## 5. Historical counterfactuals for "What if we had…" mode

| Event | What's established | What's missing |
|---|---|---|
| **1975 fiscal crisis** | Total debt **~$14B** (~$6B short-term). **MAC** created June 1975, issued **$9.5B** over nine years, last original bond retired 2008-07-01. Federal Seasonal Financing Act (Dec 1975) authorized up to **$2.3B**. **1975-10-17: Albert Shanker committed $150M of teachers' pension money to MAC bonds, averting default by hours.** EFCB directed ~**$200M/yr** in cuts (~6% of operating expenses) for three years. **CUNY imposed tuition in AY1976-77, ending 129 years of free tuition** ($650 fresh/soph, $800 jr/sr). ~60,000 positions cut, mostly attrition | Layoff figures came back **internally contradictory** (threatened vs. executed conflated — do not use). Operating deficit cited as both ">$600M" and "$2.2B", unreconciled. Trough headcount unsupported |
| **2008 crash** | FY2009 tax revenue fell **$2.8B to $34.7B**; FY2010 gap **$4.3B (10.4% of city-funded revenues)**, FY2011 gap **~$7.0B (15.9%)**; Wall Street bonus pool **$32.9B (2007) → $18.4B (2008, −44%) → $20.3B (2009)**; the 7% property tax cut was **rescinded effective 2009-01-01**, yielding **$576M in FY2009** and **~$1.3B/yr** after | FY2008 peak revenue; ARRA dollars to NYC *specifically* (only the ~$35B **state** figure was found) |
| **COVID** | Forecast **$7.4B** two-year tax hit (OMB) / **$9.5B** (IBO) → FY2021 actually came in **$6.9B above** the Adopted Budget. **22,000 layoffs were threatened for 2020-10-01 and never happened** — the DC 37 no-layoff deal was explicitly contingent on the city receiving **≥$5B** in state/federal aid. Retiree Health Benefits Trust drawn **$1.0B (FY20) + $1.6B (FY21)**, balance **$4.7B → ~$2.1B**. The $7B operating-borrowing authority was **requested and never granted** | Federal COVID aid total to NYC is **contested**: components sum to $24.10B against a stated $26.5B; ARPA SLFRF is reported as both **$4.3B** (Treasury metropolitan-city allocation) and **$5.88B** (city's own tracking). **Do not ship the commonly cited "$14B" — it could not be substantiated at all** |
| **Hurricane Sandy** | Nothing — never researched | Everything. ⚠️ Highest conflation risk in the whole brief: ~$19B (city damage), ~$32B / ~$42B (state damage vs. damage-plus-mitigation-request), $50.5B appropriated vs $60.4B requested federally — **none of which is the amount that reached NYC** |
| **Amazon HQ2** | Nothing — never researched | The **$1.525B** discretionary package (Excelsior + ESD capital grant) vs. the **~$3B** headline that folds in as-of-right REAP/ICAP over 25 years. These are constantly conflated in press coverage; source them separately from the Nov 2018 ESD MOU |
| **421-a / 485-x** | Nothing — never researched | NYC Dept. of Finance *Annual Report on Tax Expenditures* is the authoritative forgone-revenue series. Record whether each figure is 421-a alone or all housing exemptions bundled |

## 5b. Candidate levers with scored magnitudes

These are the game's actual controls. Figures are snippet-level leads — verify each, but the *shape*
of the lever set is right. **The jurisdiction column is the most interesting mechanic in a city
edition:** unlike the federal game, a mayor cannot pull half of these alone.

| Lever | Scored magnitude (verify) | Control |
|---|---|---|
| **Universal childcare** (6wk–5yr) | **~$6B/yr** at full scale. FY2027 city ECE lines include $380M baselined shortfall, $234.8M UPK, $73M 2-K rising to $425M in FY28, $40M provider rate enhancement | Spending **CITY**; the funding mechanism (corporate franchise tax + 2pt PIT surcharge over $1M) is **ALBANY** |
| **Childcare wage parity** (CBO → DOE) | **$41.6M/yr**; median disparity $19,952 for master's-degree teachers | CITY |
| **Fare-free buses** | **$700–800M/yr** (Mamdani) vs **~$1B** (MTA chair). The 2023–24 pilot cost **$12.3M over 9 months** and lifted ridership **+30% weekday / +38% weekend** | **ALBANY/MTA** — the city can only offer a subsidy the MTA accepts |
| **CityFHEPS vouchers** | FY2027 deal: **$175M**, baselined at **$125M/yr** from FY2028, reaching ~30,000 people. Historical: budgeted **$135M** against **$357M** actual — chronically under-budgeted by $105–236M every year | CITY |
| **Rent freeze** | RGB voted **7–1 for 0%** on 1- and 2-year leases (~1M stabilized units). No direct appropriation — the budget channel is indirect, via Class 2 assessed values | Board **CITY**, statute **ALBANY** |
| **City-owned groceries** | **$70M capital** for 5 sites ($30M for a 9,000 sq ft East Harlem flagship — verify, that's ~$3,333/sq ft) | CITY |
| **NYPD headcount** | FY2027 Executive **$6.59B**, budgeted **35,555** uniformed vs **34,497** actual. Cost of +1,000 officers: only stale figures found (**$94.3M** first-year, 2014) — but CBC's key finding holds: **out-year cost roughly doubles first-year cost** as steps and pension accrual land outside the plan window | CITY |
| **NYPD overtime** | See §4. ⚠️ FY2026 has a live conflict: $890M vs $1.13B — likely uniformed-only vs total | CITY |
| **Class-size mandate** | Full compliance **$1.6–1.9B/yr** (IBO, ~17,700 teachers); net of budgeted staff, **$635–720M** for ~6,900 more teachers by FY2028. Construction for full compliance **$17–22B** (contested minority report). 🔑 **The phase-in was DELAYED two years** — Hochul, the legislature and Mamdani agreed to 70% (SY26-27) → 80% → 90% → full compliance **SY2029-30**, worth **~$500M of FY2027 relief** | **ALBANY mandate, CITY cost** — the cleanest unfunded-mandate lever, and now also a live example of a mandate being renegotiated |
| **Pension re-amortization** | The FY2027 balancing move: UAL for four of five systems stretched **2032 → 2037**, saving **$1.64B in FY2027** but adding **>$7.6B in total cost through FY2037**. Systems hold **$294.6B** in assets (83% funded); UAL payments ~$6.0B FY2025 peaking $7.2B FY2032 | CITY — and a perfect "cheap now, expensive later" game lever |
| **Libraries** | **$31.7M baselined** (first time ever), ~**$530M** total FY2027 across NYPL/BPL/QPL | CITY |
| **Homeless services** | DHS **$4.63B** (FY27 Preliminary); asylum response $1.20B FY27 dropping to $498M FY28 | CITY, with a **$2.7B assumed state reimbursement Albany has neither appropriated nor promised** — a headline risk worth modeling |
| **Composting/organics** | Explicit program **~$21M** vs **~$215M** implicit organics cost already inside DSNY's ~$500M/yr export spend — the diversion economics look completely different at the honest denominator | CITY |

## 5c. Revenue levers — most require Albany, and most did NOT pass

This is the sharpest illustration of the control mechanic: Mamdani's two headline revenue asks both
died in Albany, and the budget was balanced by other means.

| Lever | Scored | Outcome |
|---|---|---|
| **2% millionaire's surtax** (>$1M, ~34,000 households) | **$4B/yr** (campaign) / ~$3B (Groundwork) | **Hochul ruled it out — did not pass** |
| **Corporate tax increase** | **$5B/yr** (campaign, 11.5% matching NJ) → scaled back to **~$1.75B/yr** combined corporate + UBT | **Did not pass** |
| **Pied-à-terre tax** | Hochul **$500M**; NYC Comptroller Fiscal Note 2-2026 adjusts to **$340–380M** after behavioral response | ✅ **ENACTED** — signed 2026-05-28, effective 2026-07-01 |
| **Property tax rate increase** | Preliminary proposed 12.283% → 13.450% (+9.5%), yielding **$3.70B FY2027**, explicitly as a "last resort" if Albany refused | 🚩 **Apparently DROPPED** — Executive was balanced without it once Albany aid arrived. **Verify: the $40.349B property-tax line and $91.48B OMB revenue total may both embed the stale increase** |
| Commuter tax restoration; property-tax class-share restructuring (revenue-neutral) | IBO scored menu — the summarizer attributed an identical "$1.2B/yr" to three different options, so **treat all as unverified** | ALBANY |

**Chronic underbudgeting** (Comptroller, ≥$4.0B/yr FY26–29) is itself a great mechanic — the budget is
adopted knowing these lines are too low: CityFHEPS **$515M** · public assistance **$467M** · overtime
**$682M** · MTA subsidies **$268M** · Carter Cases **$131M**.

**Reserves:** total cushion falls **$12.43B → $8.36B** entering FY2027. General Reserve sits at the
**$100M** statutory minimum in the Executive (Council added **+$350M** at adoption); Rainy Day Fund
**$2B**, never once drawn. CBC's framing is the game's stakes in one line: a typical recession costs
**$11–15B over two years**, "which would swamp the City's reserves."

## 6. Known traps — read before collecting

1. **Headcount base mismatch.** CBC reports **311,018 (FY2008) → 293,550 (FY2012)** on a *full-time +
   FTE* basis, and separately **274,061 (end FY2010)** on a *full-time only* basis. Differencing across
   those bases invents a cliff that never happened. Also: CBC puts the all-time peak at **326,739 in
   FY2019**, not FY2020 as is often assumed.
2. **Calendar year vs. fiscal year.** Legal Aid tracks NYPD misconduct payouts by **calendar** year
   (**$117.25M across 1,044 suits in CY2025**); the Comptroller's Claims Report uses **fiscal** years
   (**$1.45B in FY2023 — citywide, all claim types, NOT police**). Never mix them in one series.
3. **City vs. state.** A widely surfaced "$3 billion over projections" figure is **New York State**
   FY2020-21, not the City. NYSED's three ESSER rounds (~$14B) are state totals against DiNapoli's
   **$11.4B** state ESSER figure — and two different "$7B to NYC" figures exist covering *different
   round combinations*.
4. **Projected vs. actual vs. authorized.** Executive budget ≠ adopted budget; capital commitment plan ≠
   capital budget authorization; budgeted headcount ≠ actual headcount (Jan 2026: **292,483 actual vs.
   305,777 authorized**, a 4.3% vacancy rate).
5. **Statewide vs. NYC.** H.R.1/OBBBA impacts are widely reported as **New York State** figures
   ($7.5B/yr Essential Plan + $2.7B/yr shifted = $13.5B/yr at full implementation). The NYC-specific
   pieces are different and smaller: H+H DSH cuts **up to $622M**, SNAP admin cost shift **~$168M/yr**
   from Oct 2026. Never present the state number as the city's.
6. **A useful negative finding:** three targeted searches found **no** new 2025–26 State Medicaid cost
   shift onto NYC. The local share has been **capped at CY2015 levels since SFY2015** — the State
   absorbs 100% of growth, saving localities ~$54B since FY2016. If someone claims otherwise, ask for
   the source.

## 6b. Timing note

The Comptroller's **"Comments on the FY2027 Adopted Budget"** had not yet been published as of July
2026 (promised "in the coming weeks"). That document is normally the single best line-item source for
exactly this work — it may be worth waiting for it, or checking whether it has since landed, before
building the data file.

## 7. Build plan once data lands

The San Diego edition is the template — mirror it exactly:

- `lib/nyc/types.ts` — city ledger semantics (SD's version documents why a city "deficit" is a gap to
  be closed, not accumulating sovereign debt; NYC differs in that it *can* carry debt, has its own
  income tax, and is bound by a state constitutional debt limit — the type comments must say so)
- `lib/nyc/baseline.ts` — every line with `registerSources({id, agency, dataset, year, url, accessed})`
- `lib/nyc/levers.ts`, `apply.ts`, `engine.ts`, `growth.ts`, `events.ts`, `replay.ts`, `scenarios.ts`
- `components/nyc/*` mirroring `components/sd/*`
- `app/new-york/page.tsx` + a `nyc.simecon.app` host rewrite in `next.config.ts`, following the
  existing `sd.simecon.app` pattern

Then repeat for LA, Chicago, Houston, Phoenix — the pattern is the expensive part, and it only has to
be paid once.
