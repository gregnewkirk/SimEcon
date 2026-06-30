import { registerSources } from "../citations";

registerSources([
  {
    id: "crs_bush_cuts",
    agency: "Congressional Research Service / CBO",
    dataset: "Revenue effect of the 2001-2003 (EGTRRA/JGTRRA) tax cuts",
    year: 2012,
    url: "https://crsreports.congress.gov/",
    accessed: "2026-06-28",
  },
  {
    id: "jct_tcja",
    agency: "Joint Committee on Taxation / CBO",
    dataset: "Budgetary effects of the 2017 Tax Cuts and Jobs Act",
    year: 2018,
    url: "https://www.jct.gov/publications/",
    accessed: "2026-06-28",
  },
  {
    id: "watson_costs_of_war",
    agency: "Watson Institute, Brown University",
    dataset: "Costs of War: budgetary costs of post-9/11 wars and veterans care",
    year: 2021,
    url: "https://watson.brown.edu/costsofwar/",
    accessed: "2026-06-28",
  },
  {
    id: "cbo_crisis_response",
    agency: "Congressional Budget Office",
    dataset: "Budgetary effects of TARP, ARRA, and the 2020-2021 pandemic response",
    year: 2021,
    url: "https://www.cbo.gov/topics/budget",
    accessed: "2026-06-28",
  },
  {
    id: "cms_part_d",
    agency: "CMS / Congressional Budget Office",
    dataset: "Cost of the Medicare Part D prescription drug benefit",
    year: 2023,
    url: "https://www.cms.gov/",
    accessed: "2026-06-28",
  },
  {
    id: "cbo_aca",
    agency: "Congressional Budget Office",
    dataset: "Federal subsidies for ACA marketplace coverage",
    year: 2023,
    url: "https://www.cbo.gov/topics/health-care",
    accessed: "2026-06-28",
  },
  {
    id: "cbo_iija",
    agency: "Congressional Budget Office",
    dataset: "Budgetary effects of the 2021 Infrastructure Investment and Jobs Act",
    year: 2021,
    url: "https://www.cbo.gov/publication/57406",
    accessed: "2026-06-28",
  },
]);

export type EventCategory =
  | "Wars & military"
  | "Tax cuts"
  | "Crises & bailouts"
  | "Program expansions";

/**
 * A real, dated fiscal event for the "What if we had..." retrospective. annualCostB is the
 * approximate annual budgetary cost within its window. sign = +1 means the event added cost,
 * so de-selecting/removing it avoids that cost; the engine subtracts sign * annualCostB from
 * the counterfactual when selected, plus the interest never paid on the avoided debt.
 */
export interface CounterEvent {
  id: string;
  label: string;
  category: EventCategory;
  startYear: number;
  endYear: number;
  annualCostB: number;
  sign: 1 | -1;
  citationId: string;
}

export const COUNTER_EVENTS: CounterEvent[] = [
  // Wars & military
  { id: "iraq_war", label: "Iraq War", category: "Wars & military", startYear: 2003, endYear: 2011, annualCostB: 200, sign: 1, citationId: "watson_costs_of_war" },
  { id: "afghan_war", label: "Afghanistan War", category: "Wars & military", startYear: 2002, endYear: 2014, annualCostB: 100, sign: 1, citationId: "watson_costs_of_war" },
  { id: "veterans_care", label: "Post-9/11 veterans care", category: "Wars & military", startYear: 2002, endYear: 2025, annualCostB: 120, sign: 1, citationId: "watson_costs_of_war" },

  // Tax cuts
  { id: "bush_tax_cuts", label: "Bush tax cuts (2001-2003)", category: "Tax cuts", startYear: 2002, endYear: 2025, annualCostB: 300, sign: 1, citationId: "crs_bush_cuts" },
  { id: "tcja_2017", label: "Trump tax cuts (TCJA 2017)", category: "Tax cuts", startYear: 2018, endYear: 2025, annualCostB: 200, sign: 1, citationId: "jct_tcja" },

  // Crises & bailouts
  { id: "tarp", label: "TARP bank bailout (2008)", category: "Crises & bailouts", startYear: 2008, endYear: 2009, annualCostB: 200, sign: 1, citationId: "cbo_crisis_response" },
  { id: "arra_2009", label: "ARRA stimulus (2009)", category: "Crises & bailouts", startYear: 2009, endYear: 2010, annualCostB: 400, sign: 1, citationId: "cbo_crisis_response" },
  { id: "covid_cares", label: "COVID CARES Act (2020)", category: "Crises & bailouts", startYear: 2020, endYear: 2020, annualCostB: 2200, sign: 1, citationId: "cbo_crisis_response" },
  { id: "covid_arp", label: "American Rescue Plan (2021)", category: "Crises & bailouts", startYear: 2021, endYear: 2021, annualCostB: 1900, sign: 1, citationId: "cbo_crisis_response" },

  // Program expansions
  { id: "medicare_part_d", label: "Medicare Part D drug benefit", category: "Program expansions", startYear: 2006, endYear: 2025, annualCostB: 90, sign: 1, citationId: "cms_part_d" },
  { id: "aca_subsidies", label: "ACA marketplace subsidies", category: "Program expansions", startYear: 2014, endYear: 2025, annualCostB: 80, sign: 1, citationId: "cbo_aca" },
  { id: "iija_infra", label: "Infrastructure law (IIJA 2021)", category: "Program expansions", startYear: 2022, endYear: 2026, annualCostB: 110, sign: 1, citationId: "cbo_iija" },
];

export const EVENT_CATEGORIES: EventCategory[] = ["Wars & military", "Tax cuts", "Crises & bailouts", "Program expansions"];

export const EVENTS_BY_ID = new Map(COUNTER_EVENTS.map((e) => [e.id, e]));
