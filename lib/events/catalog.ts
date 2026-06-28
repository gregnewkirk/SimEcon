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
    id: "watson_costs_of_war",
    agency: "Watson Institute, Brown University",
    dataset: "Costs of War: budgetary costs of post-9/11 wars",
    year: 2021,
    url: "https://watson.brown.edu/costsofwar/",
    accessed: "2026-06-28",
  },
  {
    id: "cbo_crisis_response",
    agency: "Congressional Budget Office",
    dataset: "Budgetary effects of TARP and the 2020-2021 pandemic response",
    year: 2021,
    url: "https://www.cbo.gov/topics/budget",
    accessed: "2026-06-28",
  },
]);

/**
 * A real, dated fiscal event for the "What if we had..." retrospective. annualCostB is the
 * approximate annual budgetary cost (2025 dollars not adjusted; nominal-of-period) within
 * its window. sign = +1 means the event added cost, so de-selecting/removing it avoids that
 * cost; the engine subtracts sign * annualCostB from the counterfactual when selected.
 */
export interface CounterEvent {
  id: string;
  label: string;
  startYear: number;
  endYear: number;
  annualCostB: number;
  sign: 1 | -1;
  citationId: string;
}

export const COUNTER_EVENTS: CounterEvent[] = [
  { id: "bush_tax_cuts", label: "Bush tax cuts (2001-2003)", startYear: 2002, endYear: 2025, annualCostB: 300, sign: 1, citationId: "crs_bush_cuts" },
  { id: "iraq_war", label: "Iraq War", startYear: 2003, endYear: 2011, annualCostB: 200, sign: 1, citationId: "watson_costs_of_war" },
  { id: "afghan_war", label: "Afghanistan War", startYear: 2002, endYear: 2014, annualCostB: 100, sign: 1, citationId: "watson_costs_of_war" },
  { id: "tarp", label: "TARP (financial crisis bailout)", startYear: 2008, endYear: 2009, annualCostB: 200, sign: 1, citationId: "cbo_crisis_response" },
  { id: "covid", label: "COVID relief (CARES + ARP)", startYear: 2020, endYear: 2021, annualCostB: 2500, sign: 1, citationId: "cbo_crisis_response" },
];

export const EVENTS_BY_ID = new Map(COUNTER_EVENTS.map((e) => [e.id, e]));
