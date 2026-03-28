import type { Program } from "../types";

export const PROGRAMS: Program[] = [
  {
    id: "healthcare",
    name: "Universal Healthcare",
    icon: "🏥",
    annualCostBillions: 3500,
    annualSavingsBillions: 3050,
    netCostBillions: 450,
    source: {
      value: 450,
      agency: "Congressional Budget Office",
      dataset: "Single-Payer Health Care Systems Analysis",
      year: 2022,
      url: "https://www.cbo.gov/publication/56898",
      accessedDate: "2025-01-15",
    },
    description:
      "Single-payer system replacing private insurance. Gross cost offset by elimination of premiums, deductibles, and administrative overhead.",
  },
  {
    id: "college",
    name: "Free Public College",
    icon: "🎓",
    annualCostBillions: 80,
    annualSavingsBillions: 0,
    netCostBillions: 80,
    source: {
      value: 80,
      agency: "Department of Education",
      dataset: "College Affordability Estimates",
      year: 2023,
      url: "https://www.ed.gov/college-affordability",
      accessedDate: "2025-01-15",
    },
    description:
      "Tuition-free attendance at all public 2-year and 4-year institutions for families earning under $125,000/year.",
  },
  {
    id: "prek",
    name: "Universal Pre-K",
    icon: "💒",
    annualCostBillions: 40,
    annualSavingsBillions: 0,
    netCostBillions: 40,
    source: {
      value: 40,
      agency: "Department of Health and Human Services",
      dataset: "Universal Pre-K Cost Estimates",
      year: 2023,
      url: "https://www.hhs.gov/early-childhood",
      accessedDate: "2025-01-15",
    },
    description:
      "Free pre-kindergarten for all 3- and 4-year-olds. Long-term ROI estimated at $7 per $1 spent via reduced crime, higher earnings.",
  },
  {
    id: "housing",
    name: "Affordable Housing",
    icon: "🏠",
    annualCostBillions: 75,
    annualSavingsBillions: 0,
    netCostBillions: 75,
    source: {
      value: 75,
      agency: "National Low Income Housing Coalition",
      dataset: "Housing Investment Gap Analysis",
      year: 2023,
      url: "https://nlihc.org/gap",
      accessedDate: "2025-01-15",
    },
    description:
      "Construction of 2M+ affordable housing units over 10 years, plus expanded Section 8 vouchers and rental assistance.",
  },
  {
    id: "ubi",
    name: "Universal Basic Income",
    icon: "💵",
    annualCostBillions: 2800,
    annualSavingsBillions: 0,
    netCostBillions: 2800,
    source: {
      value: 2800,
      agency: "Urban Institute",
      dataset: "UBI Cost Projections",
      year: 2023,
      url: "https://www.urban.org/research",
      accessedDate: "2025-01-15",
    },
    description:
      "$1,000/month to every adult American (approx. 233M adults). Does not replace existing safety-net programs in this model.",
    warning:
      "At $2.8T/year, UBI alone exceeds total federal revenue. Most proposals pair it with a VAT, wealth tax, or replacement of existing programs — none of which are modeled here. Results will show extreme deficits.",
  },
  {
    id: "infrastructure",
    name: "Infrastructure Modernization",
    icon: "🌉",
    annualCostBillions: 370,
    annualSavingsBillions: 0,
    netCostBillions: 370,
    source: {
      value: 370,
      agency: "American Society of Civil Engineers",
      dataset: "2025 Report Card — Bridging the Gap Economic Analysis",
      year: 2025,
      url: "https://bridgingthegap.infrastructurereportcard.org",
      accessedDate: "2025-03-28",
    },
    description:
      "ASCE estimates a $3.7T investment gap over 2024-2033 (~$370B/yr) across roads, bridges, broadband, water systems, and the electric grid. The 2021 IIJA provided ~$240B/yr but authorizations expire in 2026.",
  },
];

export const PROGRAMS_MAP = new Map(PROGRAMS.map((p) => [p.id, p]));
