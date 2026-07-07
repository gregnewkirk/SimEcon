import type { SdLeverConfig } from "./types";

/**
 * One-click preset plans for the San Diego sandbox. Each is a recognizable position from
 * the city's actual budget debates, expressed as lever settings. Unset levers stay at the
 * FY2026 adopted baseline.
 */
export interface SdScenario {
  id: string;
  label: string;
  blurb: string;
  config: SdLeverConfig;
}

export const SD_SCENARIOS: SdScenario[] = [
  {
    id: "measure_e_passes",
    label: "Measure E passes",
    blurb: "The 1-cent sales tax that failed by 3,500 votes. The structural deficit vanishes; the argument moves to what to fund.",
    config: {
      sales_tax_measure: 1,
      stormwater_invest: 40,
      street_paving: 30,
      library_days: 7,
    },
  },
  {
    id: "back_the_badge",
    label: "Back the badge",
    blurb: "Fill the force: more budgeted officers, a retention raise, and the overtime to cover the gap while academies catch up.",
    config: {
      sworn_officers: 2200,
      police_raise: 5,
      police_overtime: 60,
      fire_academies: 3,
    },
  },
  {
    id: "reimagine_safety",
    label: "Reimagine safety",
    blurb: "Shrink the sworn force toward what's actually filled, civilianize desk roles, and move the savings to shelters and libraries.",
    config: {
      sworn_officers: 1850,
      civilianization: 176,
      police_overtime: 35,
      police_nonpersonnel: 10,
      homeless_shelters: 50,
      library_days: 7,
    },
  },
  {
    id: "austerity",
    label: "Austerity budget",
    blurb: "The April 2025 proposal, uncushioned: library and rec cuts stick, restrooms close, vacancies stay frozen. Balance by subtraction.",
    config: {
      library_days: 4.5,
      rec_hours: 40,
      close_restrooms: true,
      vacancy_holds: true,
      police_nonpersonnel: 10,
      fire_academies: 1,
      homeless_shelters: -25,
    },
  },
  {
    id: "1996_again",
    label: "1996 all over again",
    blurb: "Shortchange the pension $100M/yr and spend it on services, just like MP1. Feels great. Watch the pension line after 2030.",
    config: {
      pension_payment: -100,
      library_days: 7,
      rec_hours: 70,
      street_paving: 40,
    },
  },
  {
    id: "fix_it_city",
    label: "Fix-it city",
    blurb: "Attack the $6.5B backlog: stormwater tax on the ballot, paving and channels funded, paid for with hotel tax and parking money.",
    config: {
      stormwater_parcel_tax: true,
      stormwater_invest: 60,
      street_paving: 60,
      tree_trimming: true,
      tot_hike: 1.5,
      parking_expansion: true,
    },
  },
];
