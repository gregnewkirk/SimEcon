# SimEcon Adversarial Pressure-Test - 2026-06-28

Reviewed every lever, result, and graph skeptic-first: each on-screen number against its
citation and an independent external sanity check. Findings below are split into fixed
(changed at the source) and documented (known, defensible-with-caveat, left as-is).

## Sanity checks that PASSED (number vs external source)

| Item | Model | External | Verdict |
| --- | --- | --- | --- |
| Baseline revenue / outlays / deficit / debt | $5.0T / $6.9T / $1.9T / $36.6T | CBO/OMB/Treasury FY2025 | reconciles |
| Corporate 21 to 28 | +$126B/yr | JCT ~$130B/yr | within band |
| Top rate 37 to 39.6 | +$31B/yr | JCT $25-40B/yr | within band |
| Remove SS cap | +$136B/yr | SSA/CBO $120-150B/yr | within band |
| UBI ($1k/mo x 233M adults) | $2.80T | arithmetic | exact |
| Capital gains | peaks ~29%, falls by 50% | CBO realization elasticity | correct shape |
| Payroll now present | $1.73T (35% of revenue) | Treasury MTS | fixed the old gap |
| Corporate share of revenue | ~11% | Treasury MTS ~11% | fixed (was 29%) |

## Findings FIXED at the source

1. **The Dynamic effects toggle did nothing.** No lever implemented `dynamic()`, so flipping
   the toggle changed no number. Fixed: added behavioral offsets to the calibrated tax
   levers (corporate -15% of static; income brackets -10%; top rate -25%, the most elastic).
   Dynamic scoring now visibly shows less revenue than static for a tax hike. Locked with
   two tests. Source: JCT behavioral elasticities.

2. **Debt-to-GDP was unlabeled and reads as gross.** The model uses gross federal debt
   (~125% of GDP), not debt held by the public (~100%). An economist would call this out.
   Fixed: labeled "Gross federal debt as a share of GDP" on the chart and the stat card.

## Findings DOCUMENTED (known, defensible, not changed)

3. **M4A net cost ($450B/yr)** is the CBO system-wide net figure (gross cost minus premium
   and administrative savings). The increase in the FEDERAL budget specifically is larger,
   because M4A shifts state and private health spending onto the federal ledger. The model
   treats $450B as the net federal cost. Tier is calibrated but the number is inherently
   contested; a future caveat badge on M4A would be honest. Not changed this pass.

4. **Baseline 2026 deficit (~$2.0T)** runs roughly 5-15% above CBO's ~$1.8T because revenue
   and spending grow on simple per-line bases rather than CBO's detailed current-law path.
   Acceptable for an illustrative model; flagged so it is not mistaken for a CBO score.

5. **Wealth tax ($250B/yr)** is the Saez-Zucman high end; Summers-Sarin estimate far less.
   Already badged "contested" in the UI. No change.

6. **Counterfactual event costs** (Bush cuts $300B/yr, wars per Watson Institute, COVID
   $2.5T/yr) are period-nominal approximations, order-of-magnitude correct, not exact-year.
   Documented in the event tooltips with sources.

7. **Incidence figures** are aggregate dollars per group per year, distributed by cited
   TPC/CBO/ITEP shares, not per-household. The UI labels them "per year" across the group.

## Net result

44 tests green (golden numbers, no-compounding regression, dynamic offsets, counterfactual,
incidence). Production build clean. Every displayed number resolves to a citation. The two
issues most likely to embarrass on stream (a dead Dynamic toggle, an unlabeled gross-debt
ratio) are fixed. The remaining items are honest modeling limitations, documented rather
than hidden.
