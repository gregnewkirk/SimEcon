import type { SdLever, SdLeverConfig } from "./types";
import { registerSources } from "../citations";

registerSources([
  {
    id: "sd_sworn_staffing",
    agency: "IBA / NBC San Diego",
    dataset: "SDPD staffing: 2,040 budgeted sworn vs ~1,797 filled (April 2025); ~$191K first-year cost per officer",
    year: 2025,
    url: "https://www.nbcsandiego.com/news/local/san-diego-police-fire-rescue-face-job-eliminations-in-proposed-city-budget/4021610/",
    accessed: "2026-07-07",
  },
  {
    id: "sd_ot_audit",
    agency: "San Diego City Auditor (OCA-24-08) / inewsource",
    dataset: "SDPD overtime: FY2026 budget $45.3M; exceeded budget 10 of last 11 years (FY2023: $40.2M budget, $50.8M actual)",
    year: 2024,
    url: "https://www.sandiego.gov/sites/default/files/2024-02/24-08_performance_audit_sdpd_ot.pdf",
    accessed: "2026-07-07",
  },
  {
    id: "sd_civilianization",
    agency: "SDPD Chief testimony / Police1",
    dataset: "Civilian vacancies (32 dispatch, 31 parking, 113 investigative aides) push sworn officers onto desk work and overtime",
    year: 2025,
    url: "https://www.police1.com/police-recruiting/articles/civilian-vacancies-at-san-diego-pd-swelling-overtime-for-officers-53W3eDHsQJrHQtop/",
    accessed: "2026-07-07",
  },
  {
    id: "sd_poa_raises",
    agency: "City of San Diego / CBS8",
    dataset: "POA contracts: 10% raise 2022-23; FY2026 police budget +$28.6M from negotiated raises; ~$6M GF per 1% SDPD raise (derived)",
    year: 2025,
    url: "https://www.sandiego.gov/sites/default/files/2024-06/poa-fy25-mou.pdf",
    accessed: "2026-07-07",
  },
  {
    id: "sd_library_hours",
    agency: "KPBS / Library Foundation SD",
    dataset: "FY2026: >$8M library cut = all 37 branches closed Sundays and Mondays (Mondays later restored at 16 branches)",
    year: 2025,
    url: "https://www.kpbs.org/news/politics/2025/04/15/libraries-rec-centers-slashed-in-glorias-proposed-san-diego-budget",
    accessed: "2026-07-07",
  },
  {
    id: "sd_rec_hours",
    agency: "KPBS / Times of San Diego",
    dataset: "FY2026 proposal cut rec centers from 60 to 40 hours/week; Council restored hours as part of +$26M add-backs",
    year: 2025,
    url: "https://www.kpbs.org/news/politics/2025/06/11/san-diego-city-council-restores-rec-center-and-some-library-hours-in-budget",
    accessed: "2026-07-07",
  },
  {
    id: "sd_fire_academy",
    agency: "NBC San Diego / SDFD union",
    dataset: "FY2026 proposed Fire-Rescue cuts: eliminating a fire academy, reducing helicopter staffing and dispatch",
    year: 2025,
    url: "https://www.nbcsandiego.com/news/local/san-diego-fire-rescue-department-proposed-budget-cuts/3732122/",
    accessed: "2026-07-07",
  },
  {
    id: "sd_restrooms",
    agency: "NBC San Diego",
    dataset: "Closing dozens of beach/park restrooms was scored at ~$1.7M/yr in the FY2026 debate",
    year: 2025,
    url: "https://www.nbcsandiego.com/news/local/san-diego-releases-list-of-dozens-of-beach-park-bathrooms-that-may-close-to-save-1-7m/3814343/",
    accessed: "2026-07-07",
  },
  {
    id: "sd_trees",
    agency: "San Diego Reader",
    dataset: "Shade-tree pruning stretched past a 20-year cycle vs the 7-year industry standard (~250K street trees)",
    year: 2025,
    url: "https://www.sandiegoreader.com/news/2025/may/28/citys-trees-need-green/",
    accessed: "2026-07-07",
  },
  {
    id: "sd_paving",
    agency: "City of San Diego / Times of San Diego",
    dataset: "FY2026 paving: ~390 lane miles, $83.1M program; average street condition 63/100 vs goal of 70",
    year: 2025,
    url: "https://www.insidesandiego.org/draft-fy26-city-budget-includes-390-miles-road-repair",
    accessed: "2026-07-07",
  },
  {
    id: "sd_vacancy_savings",
    agency: "City of San Diego / Governing",
    dataset: "Dec 2024 hiring freeze and vacancy holds; Council funded FY2026 restorations partly by holding management vacancies open",
    year: 2025,
    url: "https://www.governing.com/finance/facing-1-5b-budget-hole-san-diego-considers-emergency-cuts",
    accessed: "2026-07-07",
  },
  {
    id: "sd_measure_e_lever",
    agency: "City of San Diego (fiscal impact statement)",
    dataset: "A 1-cent city sales tax = ~$400M/yr (Measure E, Nov 2024, failed 49.7%-50.3%)",
    year: 2024,
    url: "https://www.sandiego.gov/sites/default/files/2024-08/24-22-fiscal-impact-statment-for-city-measure-on-november-5-2024-ballot-measure-e.pdf",
    accessed: "2026-07-07",
  },
  {
    id: "sd_tot_lever",
    agency: "City of San Diego FY2026 Adopted Budget",
    dataset: "General Fund gets 5.5 cents of the 10.5-cent TOT = $170.3M, so ~$31M per additional cent (derived; requires a vote)",
    year: 2025,
    url: "https://www.sandiego.gov/sites/default/files/2025-08/fy26ab_v1generalfundrevenues.pdf",
    accessed: "2026-07-07",
  },
  {
    id: "sd_cannabis_lever",
    agency: "KPBS / CBS8",
    dataset: "Cannabis tax raised 8%->10% (May 2025), budgeted $21.3M FY2026; receipts running ~$1.5M short - elasticity is real",
    year: 2025,
    url: "https://www.kpbs.org/news/economy/2025/12/29/san-diegos-10-cannabis-business-tax-comes-up-short",
    accessed: "2026-07-07",
  },
  {
    id: "sd_parking_lever",
    agency: "IBA (25-17) / NBC San Diego",
    dataset: "FY2026 parking package: meters doubled to $2.50/hr, Sunday enforcement, surge pricing = +$18.4M planned",
    year: 2025,
    url: "https://www.sandiego.gov/sites/default/files/2025-05/25-17-parking-meter-reform-final.pdf",
    accessed: "2026-07-07",
  },
  {
    id: "sd_trash_lever",
    agency: "City of San Diego (Measure B) / inewsource",
    dataset: "FY2026 moved $80.8M of residential trash collection off the General Fund onto the new $43.60/mo fee",
    year: 2025,
    url: "https://www.sandiego.gov/environmental-services/trash-service-updates/measure-b",
    accessed: "2026-07-07",
  },
  {
    id: "sd_stormwater_lever",
    agency: "Voice of San Diego / Fox5",
    dataset: "The withdrawn 2024 stormwater parcel tax would have raised ~$129.6M/yr toward a $4B+ backlog",
    year: 2024,
    url: "https://fox5sandiego.com/news/local-news/san-diego-ditches-ballot-measure-to-create-tax-for-stormwater-projects/",
    accessed: "2026-07-07",
  },
  {
    id: "sd_franchise_lever",
    agency: "KPBS / NewGen Strategies",
    dataset: "SDG&E bid exactly the $80M minimum as sole bidder; municipalization studies claim large ratepayer savings (hotly disputed)",
    year: 2021,
    url: "https://www.kpbs.org/news/economy/2026/04/16/new-study-finds-a-public-utility-company-could-save-san-diegans-500-every-year-sdg-e-calls-it-flawed",
    accessed: "2026-07-07",
  },
  {
    id: "sd_balboa_parking_lever",
    agency: "City of San Diego FY2026 Adopted Budget",
    dataset: "New Balboa Park & Zoo paid parking budgeted at +$15.5M in FY2026 (partially rolled back in a 2026 settlement)",
    year: 2025,
    url: "https://www.sandiego.gov/sites/default/files/2025-08/fy26ab_v1executivesummary.pdf",
    accessed: "2026-07-07",
  },
  {
    id: "sd_homeless_lever",
    agency: "City of San Diego",
    dataset: "FY2026 homelessness: $71.1M General Fund across 17 shelters, safe parking and outreach",
    year: 2025,
    url: "https://www.sandiego.gov/sites/default/files/2025-05/2025-5-8-draft-fy26-budget-continues-city-of-san-diego-s-progress-on-addressing-homelessness.pdf",
    accessed: "2026-07-07",
  },
  {
    id: "sd_pension_lever",
    agency: "SDCERS / San Diego City Attorney (history)",
    dataset: "Paying less than the actuarially determined contribution is exactly what MP1 (1996) and MP2 (2002) did",
    year: 2025,
    url: "https://www.sdcers.org/financials-investments/actuarial-valuation-reports",
    accessed: "2026-07-07",
  },
]);

/**
 * Police cost model, derived from IBA 26-09 and city pay scales:
 * - ~$0.20M per sworn officer per year fully loaded (salary + fringe + equipment share;
 *   the city cites $191K just to recruit and train one in year one).
 * - ~$6M General Fund per 1% SDPD raise (personnel base ~ $618M).
 */
const PER_OFFICER_M = 0.2;
const PER_RAISE_PCT_M = 6.0;

/** Dollars per point/unit for the department dials (see citations). */
const LIBRARY_PER_DAY_M = 4.0; // the 2-day (Sun+Mon) closure was scored at >$8M, so ~$4M/day
const REC_PER_HOUR_M = 0.5; // 60->40 hrs saved ~$10M
const TOT_PER_CENT_M = 31.0;
const CANNABIS_PER_PCT_M = 1.8; // ~$2.1M/pt at 10% less elasticity slippage
const SALES_PER_QUARTER_CENT_M = 100.0; // Measure E: $400M per full cent

function dial(
  o: Omit<SdLever, "conventional" | "defaultValue" | "onValue"> & {
    perUnitM: number;
    baseline: number;
    onValue: number;
  }
): SdLever {
  return {
    ...o,
    defaultValue: o.baseline,
    onValue: o.onValue,
    conventional: (cfg: SdLeverConfig) => [
      {
        lineId: o.targets[0],
        amountM: (((cfg[o.id] as number) ?? o.baseline) - o.baseline) * o.perUnitM,
        citationId: o.citationIds[0],
        leverId: o.id,
      },
    ],
  };
}

function toggle(
  o: Omit<SdLever, "conventional" | "defaultValue" | "onValue" | "range" | "unit"> & {
    amountM: number;
  }
): SdLever {
  return {
    ...o,
    defaultValue: false,
    onValue: true,
    conventional: (cfg: SdLeverConfig) => [
      {
        lineId: o.targets[0],
        amountM: cfg[o.id] === true ? o.amountM : 0,
        citationId: o.citationIds[0],
        leverId: o.id,
      },
    ],
  };
}

/** ——— Police: several sliders pointed at the biggest line in the budget ——— */
export const SD_POLICE_LEVERS: SdLever[] = [
  dial({
    id: "sworn_officers",
    label: "Sworn officers (budgeted)",
    category: "police",
    tier: "calibrated",
    targets: ["police"],
    citationIds: ["sd_sworn_staffing"],
    group: "Police (SDPD)",
    unit: "officers",
    range: { min: 1600, max: 2400, step: 10, baseline: 2040 },
    perUnitM: PER_OFFICER_M,
    baseline: 2040,
    onValue: 2040,
  }),
  dial({
    id: "police_overtime",
    label: "Overtime budget",
    category: "police",
    tier: "calibrated",
    targets: ["police"],
    citationIds: ["sd_ot_audit"],
    group: "Police (SDPD)",
    unit: "$M",
    range: { min: 20, max: 90, step: 1, baseline: 45 },
    perUnitM: 1,
    baseline: 45,
    onValue: 45,
  }),
  dial({
    id: "police_raise",
    label: "Officer raise beyond current contract",
    category: "police",
    tier: "estimate",
    targets: ["police"],
    citationIds: ["sd_poa_raises"],
    group: "Police (SDPD)",
    unit: "%",
    range: { min: -5, max: 10, step: 0.5, baseline: 0 },
    perUnitM: PER_RAISE_PCT_M,
    baseline: 0,
    onValue: 0,
  }),
  dial({
    id: "civilianization",
    label: "Civilianize desk & dispatch roles",
    category: "police",
    tier: "estimate",
    contested: true,
    targets: ["police"],
    citationIds: ["sd_civilianization"],
    group: "Police (SDPD)",
    unit: " roles",
    range: { min: 0, max: 176, step: 8, baseline: 0 },
    perUnitM: -0.05, // civilian costs less than the sworn time + OT it replaces
    baseline: 0,
    onValue: 176,
  }),
  dial({
    id: "police_nonpersonnel",
    label: "Non-personnel cut (fleet, equipment, contracts)",
    category: "police",
    tier: "estimate",
    targets: ["police"],
    citationIds: ["sd_iba_police"],
    group: "Police (SDPD)",
    unit: "% cut",
    range: { min: 0, max: 25, step: 1, baseline: 0 },
    perUnitM: -0.85, // non-personnel base ~$85M
    baseline: 0,
    onValue: 10,
  }),
];

/** ——— The rest of the city ——— */
export const SD_DEPT_LEVERS: SdLever[] = [
  dial({
    id: "library_days",
    label: "Library days per week",
    category: "department",
    tier: "calibrated",
    targets: ["library"],
    citationIds: ["sd_library_hours"],
    group: "Libraries & rec centers",
    unit: " days",
    range: { min: 4, max: 7, step: 0.5, baseline: 5.5 },
    perUnitM: LIBRARY_PER_DAY_M,
    baseline: 5.5,
    onValue: 7,
  }),
  dial({
    id: "rec_hours",
    label: "Rec center hours per week",
    category: "department",
    tier: "calibrated",
    targets: ["parks"],
    citationIds: ["sd_rec_hours"],
    group: "Libraries & rec centers",
    unit: " hrs",
    range: { min: 40, max: 70, step: 5, baseline: 60 },
    perUnitM: REC_PER_HOUR_M,
    baseline: 60,
    onValue: 60,
  }),
  toggle({
    id: "close_restrooms",
    label: "Close beach & park restrooms",
    category: "department",
    tier: "calibrated",
    targets: ["parks"],
    citationIds: ["sd_restrooms"],
    group: "Libraries & rec centers",
    amountM: -1.7,
  }),
  dial({
    id: "fire_academies",
    label: "Fire academies per year",
    category: "department",
    tier: "estimate",
    targets: ["fire"],
    citationIds: ["sd_fire_academy"],
    group: "Fire-Rescue",
    unit: "",
    range: { min: 0, max: 4, step: 1, baseline: 2 },
    perUnitM: 3.0,
    baseline: 2,
    onValue: 2,
  }),
  dial({
    id: "street_paving",
    label: "Extra street paving",
    category: "department",
    tier: "calibrated",
    targets: ["transportation"],
    citationIds: ["sd_paving"],
    group: "Streets & stormwater",
    unit: "$M",
    range: { min: -40, max: 100, step: 5, baseline: 0 },
    perUnitM: 1,
    baseline: 0,
    onValue: 50,
  }),
  dial({
    id: "stormwater_invest",
    label: "Extra stormwater maintenance",
    category: "department",
    tier: "calibrated",
    targets: ["stormwater"],
    citationIds: ["sd_stormwater_lever"],
    group: "Streets & stormwater",
    unit: "$M",
    range: { min: -14, max: 100, step: 2, baseline: 0 },
    perUnitM: 1,
    baseline: 0,
    onValue: 40,
  }),
  toggle({
    id: "tree_trimming",
    label: "Restore 7-year tree pruning cycle",
    category: "department",
    tier: "estimate",
    targets: ["transportation"],
    citationIds: ["sd_trees"],
    group: "Streets & stormwater",
    amountM: 6.0,
  }),
  dial({
    id: "homeless_shelters",
    label: "Homelessness programs",
    category: "department",
    tier: "calibrated",
    targets: ["homelessness"],
    citationIds: ["sd_homeless_lever"],
    group: "Homelessness & housing",
    unit: "% change",
    range: { min: -50, max: 100, step: 5, baseline: 0 },
    perUnitM: 0.71, // of the $71.1M GF program
    baseline: 0,
    onValue: 25,
  }),
  toggle({
    id: "vacancy_holds",
    label: "Hold management vacancies open",
    category: "department",
    tier: "estimate",
    targets: ["other_depts"],
    citationIds: ["sd_vacancy_savings"],
    group: "Citywide",
    amountM: -25.0,
  }),
];

/** ——— Revenue ——— */
export const SD_REVENUE_LEVERS: SdLever[] = [
  dial({
    id: "sales_tax_measure",
    label: "City sales tax measure (Measure E redux)",
    category: "revenue",
    tier: "calibrated",
    targets: ["policy_revenue"],
    citationIds: ["sd_measure_e_lever"],
    group: "Needs a vote",
    unit: "¢",
    range: { min: 0, max: 1, step: 0.25, baseline: 0 },
    perUnitM: SALES_PER_QUARTER_CENT_M * 4,
    baseline: 0,
    onValue: 1,
  }),
  dial({
    id: "tot_hike",
    label: "Hotel tax increase (GF share)",
    category: "revenue",
    tier: "estimate",
    targets: ["tot"],
    citationIds: ["sd_tot_lever"],
    group: "Needs a vote",
    unit: "¢",
    range: { min: 0, max: 3, step: 0.5, baseline: 0 },
    perUnitM: TOT_PER_CENT_M,
    baseline: 0,
    onValue: 1.5,
  }),
  toggle({
    id: "stormwater_parcel_tax",
    label: "Stormwater parcel tax (the withdrawn 2024 measure)",
    category: "revenue",
    tier: "calibrated",
    targets: ["policy_revenue"],
    citationIds: ["sd_stormwater_lever"],
    group: "Needs a vote",
    amountM: 129.6,
  }),
  dial({
    id: "cannabis_rate",
    label: "Cannabis tax rate",
    category: "revenue",
    tier: "calibrated",
    targets: ["cannabis_tax"],
    citationIds: ["sd_cannabis_lever"],
    group: "Council can do this",
    unit: "%",
    range: { min: 8, max: 15, step: 1, baseline: 10 },
    perUnitM: CANNABIS_PER_PCT_M,
    baseline: 10,
    onValue: 12,
  }),
  toggle({
    id: "parking_expansion",
    label: "More meters, Sunday enforcement, surge pricing",
    category: "revenue",
    tier: "estimate",
    targets: ["parking_meters"],
    citationIds: ["sd_parking_lever"],
    group: "Council can do this",
    amountM: 12.0,
  }),
  toggle({
    id: "repeal_trash_fee",
    label: "Repeal the trash fee (back to 'free' pickup)",
    category: "revenue",
    tier: "calibrated",
    targets: ["environmental"],
    citationIds: ["sd_trash_lever"],
    group: "Council can do this",
    amountM: 80.8, // the collection cost lands back on the General Fund
  }),
  toggle({
    id: "repeal_balboa_parking",
    label: "Repeal Balboa Park & Zoo paid parking",
    category: "revenue",
    tier: "calibrated",
    targets: ["other_revenue"],
    citationIds: ["sd_balboa_parking_lever"],
    group: "Council can do this",
    amountM: -15.5,
  }),
  toggle({
    id: "franchise_renegotiation",
    label: "Squeeze the SDG&E franchise harder",
    category: "revenue",
    tier: "estimate",
    contested: true,
    targets: ["franchise_fees"],
    citationIds: ["sd_franchise_lever"],
    group: "Council can do this",
    amountM: 20.0,
  }),
];

/** ——— The pension: relive 1996 or fix it ——— */
export const SD_PENSION_LEVERS: SdLever[] = [
  dial({
    id: "pension_payment",
    label: "Pension payment vs. the full bill",
    category: "pension",
    tier: "calibrated",
    contested: false,
    targets: ["pension_adc"],
    citationIds: ["sd_pension_lever"],
    group: "SDCERS pension",
    unit: "$M",
    range: { min: -150, max: 150, step: 10, baseline: 0 },
    perUnitM: 1,
    baseline: 0,
    onValue: 50,
  }),
];

export const SD_ALL_LEVERS: SdLever[] = [
  ...SD_POLICE_LEVERS,
  ...SD_DEPT_LEVERS,
  ...SD_REVENUE_LEVERS,
  ...SD_PENSION_LEVERS,
];

export const SD_LEVERS_BY_ID = new Map(SD_ALL_LEVERS.map((l) => [l.id, l]));

/** Default config: every lever at its baseline (the FY2026 adopted budget as passed). */
export function sdDefaultConfig(): SdLeverConfig {
  const cfg: SdLeverConfig = {};
  for (const l of SD_ALL_LEVERS) cfg[l.id] = l.defaultValue ?? (l.range ? l.range.baseline : false);
  return cfg;
}
