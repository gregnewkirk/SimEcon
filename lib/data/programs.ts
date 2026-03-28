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

  // ─── REVENUE GENERATORS (negative net cost = makes money) ───

  {
    id: "ss_cap",
    name: "Remove SS Tax Cap",
    icon: "\uD83D\uDCCA",
    annualCostBillions: 0,
    annualSavingsBillions: 150,
    netCostBillions: -150,
    source: {
      value: 150,
      agency: "Congressional Budget Office",
      dataset: "Options for Reducing the Deficit: Social Security",
      year: 2023,
      url: "https://www.cbo.gov/budget-options",
      accessedDate: "2025-03-28",
    },
    description:
      "Currently, Social Security payroll tax (12.4%) only applies to the first ~$168K of income. Removing the cap taxes all earned income equally. CBO estimates this generates $150B+/yr and extends SS solvency by 40+ years.",
  },
  {
    id: "irs_enforcement",
    name: "IRS Enforcement Funding",
    icon: "\uD83D\uDD0D",
    annualCostBillions: 15,
    annualSavingsBillions: 90,
    netCostBillions: -75,
    source: {
      value: 75,
      agency: "Congressional Budget Office",
      dataset: "IRS Enforcement Initiative Revenue Estimates",
      year: 2023,
      url: "https://www.cbo.gov/publication/57444",
      accessedDate: "2025-03-28",
    },
    description:
      "Fund 87,000 IRS agents to close the $600B+ annual tax gap. CBO estimates every $1 spent on enforcement returns $5-6 in revenue. The 2022 IRA allocated $80B over 10 years; this models sustained funding at $15B/yr.",
  },
  {
    id: "defense_cut",
    name: "Defense Budget Reduction",
    icon: "\u2694\uFE0F",
    annualCostBillions: 0,
    annualSavingsBillions: 100,
    netCostBillions: -100,
    source: {
      value: 100,
      agency: "Congressional Budget Office",
      dataset: "Budget Options: National Defense",
      year: 2024,
      url: "https://www.cbo.gov/budget-options",
      accessedDate: "2025-03-28",
    },
    description:
      "Reduce the ~$900B/yr defense budget by ~10%. Proposals include base closures, equipment modernization reform, and reducing overseas deployments. Savings of ~$100B/yr. Adjustable via cost slider.",
  },
  {
    id: "carbon_tax",
    name: "Carbon Tax",
    icon: "\uD83C\uDF0D",
    annualCostBillions: 0,
    annualSavingsBillions: 120,
    netCostBillions: -120,
    source: {
      value: 120,
      agency: "Congressional Budget Office",
      dataset: "Effects of a Carbon Tax on the Economy and the Environment",
      year: 2023,
      url: "https://www.cbo.gov/publication/58861",
      accessedDate: "2025-03-28",
    },
    description:
      "A $25/ton carbon tax rising 5% annually. CBO estimates ~$120B/yr in revenue. Also reduces emissions 10-15%. Revenue can offset costs to low-income households via rebates (not modeled here).",
  },
  {
    id: "financial_tx_tax",
    name: "Financial Transaction Tax",
    icon: "\uD83D\uDCB1",
    annualCostBillions: 0,
    annualSavingsBillions: 55,
    netCostBillions: -55,
    source: {
      value: 55,
      agency: "Congressional Budget Office",
      dataset: "Impose a Tax on Financial Transactions",
      year: 2023,
      url: "https://www.cbo.gov/budget-options",
      accessedDate: "2025-03-28",
    },
    description:
      "A 0.1% tax on stock, bond, and derivative trades. Used in 40+ countries (UK stamp duty, EU proposals). CBO estimates ~$55B/yr. Reduces high-frequency speculation while barely affecting long-term investors.",
  },
  {
    id: "medicare_negotiation",
    name: "Medicare Drug Negotiation",
    icon: "\uD83D\uDC8A",
    annualCostBillions: 0,
    annualSavingsBillions: 100,
    netCostBillions: -100,
    source: {
      value: 100,
      agency: "Congressional Budget Office",
      dataset: "Medicare Drug Price Negotiation Estimates",
      year: 2024,
      url: "https://www.cbo.gov/publication/59800",
      accessedDate: "2025-03-28",
    },
    description:
      "Expand the 2022 IRA drug negotiation provisions to all Medicare drugs (currently limited to 20). CBO estimates full negotiation saves ~$100B/yr. The VA already negotiates and pays 40-50% less than Medicare.",
  },
];

export const PROGRAMS_MAP = new Map(PROGRAMS.map((p) => [p.id, p]));
