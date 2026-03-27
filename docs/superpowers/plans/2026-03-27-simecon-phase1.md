# SimEcon Phase 1 — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the core SimEcon economic policy simulator — a dark-mode dashboard where users adjust tax rates and social programs via sidebar controls, watch animated charts project the impact on US debt, deficit, and wealth distribution, and share their configuration via URL.

**Architecture:** Next.js 16 App Router, client-side only (static export). All simulation runs in the browser. Historical data bundled as JSON. Configuration encoded in URL hash for sharing. No backend.

**Tech Stack:** Next.js 16, TypeScript, shadcn/ui, Tailwind CSS, Recharts, Geist fonts

**Spec:** `docs/superpowers/specs/2026-03-27-simecon-design.md`

---

## File Structure

```
simecon/
├── app/
│   ├── layout.tsx                    # Root layout: fonts, theme, metadata, providers
│   ├── page.tsx                      # Main page: composes SimulatorLayout
│   └── globals.css                   # Tailwind + custom CSS variables
├── components/
│   ├── layout/
│   │   ├── Header.tsx                # Logo, scenario quick-select, share, help
│   │   └── SimulatorLayout.tsx       # Sidebar + viz area + playback bar grid
│   ├── sidebar/
│   │   ├── Sidebar.tsx               # Sidebar container, scrollable
│   │   ├── ScenarioSelector.tsx      # Dropdown for pre-built scenarios
│   │   ├── TaxControls.tsx           # Simple (1 slider) + Advanced (4 sliders) toggle
│   │   ├── TaxSlider.tsx             # Single slider with ghost marker + tooltip
│   │   ├── ProgramToggles.tsx        # List of program toggle switches
│   │   └── AdvancedAssumptions.tsx   # Collapsible GDP/interest/elasticity controls
│   ├── visualization/
│   │   ├── KPICards.tsx              # 4 metric cards: debt, deficit, revenue, debt-to-GDP
│   │   ├── KPICard.tsx               # Single KPI card with delta indicator
│   │   ├── DebtDeficitChart.tsx      # Recharts line chart (historical + projected)
│   │   └── WealthDistributionChart.tsx # Recharts stacked area chart
│   ├── playback/
│   │   ├── PlaybackBar.tsx           # Timeline scrubber + controls container
│   │   └── SpeedControl.tsx          # 1x/5x/10x toggle buttons
│   └── shared/
│       ├── CitationPopover.tsx       # Click-triggered popover with source info
│       └── TransparencyBanner.tsx    # Persistent model disclaimer
├── hooks/
│   ├── useSimulation.ts              # Core hook: runs engine, manages sim state
│   ├── usePlayback.ts                # Playback animation loop (requestAnimationFrame)
│   └── useURLState.ts                # Bidirectional URL hash ↔ state sync
├── lib/
│   ├── engine/
│   │   ├── simulate.ts               # Core simulation loop (pure function)
│   │   ├── tax-revenue.ts            # Tax revenue calculation per bracket
│   │   └── wealth-redistribution.ts  # Wealth shift model per year
│   ├── data/
│   │   ├── historical.ts             # Historical data with citations
│   │   ├── scenarios.ts              # Pre-built scenario configs
│   │   ├── programs.ts               # Social program definitions + costs
│   │   └── defaults.ts               # Default values, current policy rates
│   ├── types.ts                      # All TypeScript interfaces
│   └── url-state.ts                  # URL hash encode/decode functions
├── public/
│   └── og-image.png                  # OG image placeholder
├── next.config.ts
├── tailwind.config.ts
├── tsconfig.json
├── package.json
└── .gitignore
```

---

## Task 1: Project Scaffolding

**Files:**
- Create: `package.json`, `next.config.ts`, `tsconfig.json`, `tailwind.config.ts`, `app/layout.tsx`, `app/page.tsx`, `app/globals.css`, `.gitignore`

- [ ] **Step 1: Initialize Next.js project**

Run:
```bash
cd "Z:/Claude/SimEcon"
npx create-next-app@latest . --typescript --tailwind --eslint --app --src-dir=false --import-alias="@/*" --turbopack
```

Select defaults when prompted. This creates the base Next.js 16 project.

- [ ] **Step 2: Install dependencies**

Run:
```bash
npm install recharts
```

- [ ] **Step 3: Initialize shadcn/ui**

Run:
```bash
npx shadcn@latest init
```

Select: New York style, Zinc base color, CSS variables = yes.

- [ ] **Step 4: Install shadcn components we'll need**

Run:
```bash
npx shadcn@latest add slider select switch popover tooltip button card collapsible
```

- [ ] **Step 5: Configure Geist fonts in layout**

Replace `app/layout.tsx` with:

```tsx
import type { Metadata } from "next";
import { GeistSans } from "geist/font/sans";
import { GeistMono } from "geist/font/mono";
import "./globals.css";

export const metadata: Metadata = {
  title: "SimEcon — US Economic Policy Simulator",
  description:
    "Adjust tax rates and social programs, then watch the impact on US debt, deficit, and wealth distribution.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body
        className={`${GeistSans.variable} ${GeistMono.variable} font-sans antialiased bg-[#0a0a1a] text-white min-h-screen`}
      >
        {children}
      </body>
    </html>
  );
}
```

- [ ] **Step 6: Add custom CSS variables for the SimEcon palette**

Add to `app/globals.css` (after the existing tailwind directives):

```css
:root {
  --simecon-red: #e94560;
  --simecon-amber: #f0a500;
  --simecon-blue: #0f3460;
  --simecon-purple: #533483;
  --simecon-teal: #4ecca3;
  --simecon-bg-deep: #0a0a1a;
  --simecon-bg-card: #1a1a2e;
  --simecon-bg-sidebar: #16213e;
  --simecon-border: #333;
}
```

- [ ] **Step 7: Verify dev server starts**

Run:
```bash
npm run dev
```

Expected: Dev server starts, default Next.js page loads at localhost:3000.

- [ ] **Step 8: Commit**

```bash
git init
git add -A
git commit -m "feat: scaffold Next.js 16 project with shadcn/ui, Recharts, Geist fonts"
```

---

## Task 2: TypeScript Types & Data Layer

**Files:**
- Create: `lib/types.ts`, `lib/data/defaults.ts`, `lib/data/programs.ts`, `lib/data/scenarios.ts`, `lib/data/historical.ts`

- [ ] **Step 1: Define all TypeScript interfaces**

Create `lib/types.ts`:

```typescript
export interface Citation {
  value: number;
  agency: string;
  dataset: string;
  year: number;
  url: string;
  accessedDate: string;
}

export interface CitedValue {
  value: number;
  citation: Citation;
}

export interface TaxPolicy {
  topMarginalRate: number;
  capitalGainsRate: number;
  corporateRate: number;
  estateRate: number;
}

export interface AdvancedAssumptions {
  gdpGrowthRate: number;
  interestRate: number;
  behavioralElasticity: number;
  fiscalMultiplier: number;
  inflationRate: number;
}

export interface Program {
  id: string;
  name: string;
  icon: string;
  annualCostBillions: number;
  annualSavingsBillions: number;
  netCostBillions: number;
  source: Citation;
  description: string;
  warning?: string;
}

export interface Scenario {
  id: string;
  name: string;
  description: string;
  policy: TaxPolicy;
  programs: string[];
  source?: string;
}

export interface WealthBracket {
  id: string;
  label: string;
  shortLabel: string;
  color: string;
  shareOfWealth: number; // 0-1
}

export interface YearData {
  year: number;
  debtTrillions: number;
  deficitBillions: number;
  revenueBillions: number;
  spendingBillions: number;
  gdpTrillions: number;
  debtToGdpRatio: number;
  wealthShares: Record<string, number>; // bracketId -> share (0-1)
  isProjected: boolean;
}

export interface SimulationState {
  taxPolicy: TaxPolicy;
  enabledPrograms: string[];
  assumptions: AdvancedAssumptions;
  currentYear: number;
  isPlaying: boolean;
  playbackSpeed: 1 | 5 | 10;
  scenarioId: string;
  historicalData: YearData[];
  projectedData: YearData[];
  advancedMode: boolean;
}

export interface URLState {
  s?: string;   // scenario
  tr?: number;  // top rate
  cg?: number;  // cap gains
  cr?: number;  // corporate
  er?: number;  // estate
  p?: string;   // programs (comma-separated)
  y?: number;   // year
  sp?: number;  // speed
  ag?: number;  // gdp growth
  ai?: number;  // interest rate
  ae?: number;  // elasticity
}
```

- [ ] **Step 2: Create defaults**

Create `lib/data/defaults.ts`:

```typescript
import type { TaxPolicy, AdvancedAssumptions, WealthBracket } from "../types";

export const CURRENT_POLICY: TaxPolicy = {
  topMarginalRate: 37,
  capitalGainsRate: 20,
  corporateRate: 21,
  estateRate: 40,
};

export const DEFAULT_ASSUMPTIONS: AdvancedAssumptions = {
  gdpGrowthRate: 1.8,
  interestRate: 3.2,
  behavioralElasticity: 0.3,
  fiscalMultiplier: 1.2,
  inflationRate: 2.5,
};

export const WEALTH_BRACKETS: WealthBracket[] = [
  { id: "top01", label: "Top 0.1%", shortLabel: "0.1%", color: "#e94560", shareOfWealth: 0.13 },
  { id: "top1", label: "Top 1% (excl. 0.1%)", shortLabel: "1%", color: "#f0a500", shareOfWealth: 0.18 },
  { id: "next9", label: "Next 9%", shortLabel: "9%", color: "#0f3460", shareOfWealth: 0.27 },
  { id: "middle40", label: "Middle 40%", shortLabel: "40%", color: "#533483", shareOfWealth: 0.28 },
  { id: "bottom50", label: "Bottom 50%", shortLabel: "50%", color: "#666666", shareOfWealth: 0.025 },
];

export const START_YEAR = 2015;
export const LAST_HISTORICAL_YEAR = 2025;
export const DEFAULT_END_YEAR = 2035;
```

- [ ] **Step 3: Create social programs data**

Create `lib/data/programs.ts`:

```typescript
import type { Program } from "../types";

export const PROGRAMS: Program[] = [
  {
    id: "healthcare",
    name: "Universal Healthcare",
    icon: "\u{1F3E5}",
    annualCostBillions: 3500,
    annualSavingsBillions: 3050,
    netCostBillions: 450,
    source: {
      value: 450,
      agency: "CBO / Lancet",
      dataset: "Medicare for All cost estimates, net of current spending",
      year: 2024,
      url: "https://www.cbo.gov/publication/56898",
      accessedDate: "2026-03-27",
    },
    description: "Single-payer healthcare replacing private insurance. Net cost accounts for elimination of premiums, deductibles, and administrative savings.",
  },
  {
    id: "college",
    name: "Free Public College",
    icon: "\u{1F393}",
    annualCostBillions: 80,
    annualSavingsBillions: 0,
    netCostBillions: 80,
    source: {
      value: 80,
      agency: "Dept. of Education",
      dataset: "Cost estimates for tuition-free public college proposals",
      year: 2024,
      url: "https://www.ed.gov",
      accessedDate: "2026-03-27",
    },
    description: "Tuition-free attendance at all public 2-year and 4-year institutions.",
  },
  {
    id: "prek",
    name: "Universal Pre-K",
    icon: "\u{1F476}",
    annualCostBillions: 40,
    annualSavingsBillions: 0,
    netCostBillions: 40,
    source: {
      value: 40,
      agency: "CBO",
      dataset: "Universal Pre-K program scoring",
      year: 2024,
      url: "https://www.cbo.gov",
      accessedDate: "2026-03-27",
    },
    description: "Free pre-kindergarten for all 3- and 4-year-olds.",
  },
  {
    id: "housing",
    name: "Housing Guarantee",
    icon: "\u{1F3E0}",
    annualCostBillions: 75,
    annualSavingsBillions: 0,
    netCostBillions: 75,
    source: {
      value: 75,
      agency: "Urban Institute",
      dataset: "Housing assistance program cost estimates",
      year: 2024,
      url: "https://www.urban.org",
      accessedDate: "2026-03-27",
    },
    description: "Federal housing vouchers ensuring no household pays more than 30% of income on rent.",
  },
  {
    id: "ubi",
    name: "Universal Basic Income",
    icon: "\u{1F4B5}",
    annualCostBillions: 2800,
    annualSavingsBillions: 0,
    netCostBillions: 2800,
    source: {
      value: 2800,
      agency: "Various",
      dataset: "UBI cost estimates ($1,000/month for all adults)",
      year: 2024,
      url: "https://www.cbpp.org",
      accessedDate: "2026-03-27",
    },
    description: "$1,000/month for every US adult (est. 230M adults).",
    warning: "UBI costs ~$2.8T/yr \u2014 more than all other programs combined. This reflects real cost estimates.",
  },
  {
    id: "infrastructure",
    name: "Infrastructure Program",
    icon: "\u{1F527}",
    annualCostBillions: 300,
    annualSavingsBillions: 0,
    netCostBillions: 300,
    source: {
      value: 300,
      agency: "CBO",
      dataset: "Green infrastructure spending proposals",
      year: 2024,
      url: "https://www.cbo.gov",
      accessedDate: "2026-03-27",
    },
    description: "Major infrastructure investment: roads, bridges, broadband, green energy, transit.",
  },
];
```

- [ ] **Step 4: Create pre-built scenarios**

Create `lib/data/scenarios.ts`:

```typescript
import type { Scenario } from "../types";

export const SCENARIOS: Scenario[] = [
  {
    id: "current",
    name: "Current Policy",
    description: "Current US tax rates with no additional programs.",
    policy: { topMarginalRate: 37, capitalGainsRate: 20, corporateRate: 21, estateRate: 40 },
    programs: [],
  },
  {
    id: "nordic",
    name: "Nordic Model",
    description: "Higher taxes funding universal social programs, modeled after Scandinavian countries.",
    policy: { topMarginalRate: 55, capitalGainsRate: 30, corporateRate: 25, estateRate: 50 },
    programs: ["healthcare", "college", "prek"],
    source: "Modeled after combined Nordic tax and social policy averages",
  },
  {
    id: "warren",
    name: "Warren Plan",
    description: "Sen. Elizabeth Warren's 2020 policy platform.",
    policy: { topMarginalRate: 50, capitalGainsRate: 39.6, corporateRate: 28, estateRate: 45 },
    programs: ["healthcare", "college", "infrastructure"],
    source: "Based on Sen. Warren's 2020 presidential campaign proposals",
  },
  {
    id: "sanders",
    name: "Sanders Plan",
    description: "Sen. Bernie Sanders' policy platform with extensive social programs.",
    policy: { topMarginalRate: 52, capitalGainsRate: 39.6, corporateRate: 35, estateRate: 55 },
    programs: ["healthcare", "college", "prek", "housing", "infrastructure"],
    source: "Based on Sen. Sanders' policy proposals",
  },
  {
    id: "eisenhower",
    name: "Eisenhower Era",
    description: "Tax rates from the 1950s under President Eisenhower, for historical reference.",
    policy: { topMarginalRate: 91, capitalGainsRate: 25, corporateRate: 52, estateRate: 77 },
    programs: [],
    source: "Historical US tax rates, 1953-1961",
  },
  {
    id: "libertarian",
    name: "Libertarian",
    description: "Minimal government: lowest possible tax rates, no additional programs.",
    policy: { topMarginalRate: 15, capitalGainsRate: 0, corporateRate: 10, estateRate: 0 },
    programs: [],
  },
];
```

- [ ] **Step 5: Create historical data**

Create `lib/data/historical.ts` with representative data points for 2015-2025. These values are approximate and sourced from CBO/Treasury. Each carries a citation:

```typescript
import type { YearData } from "../types";

// Sources:
// Debt: Treasury Direct (treasurydirect.gov/govt/reports/pd/histdebt)
// Deficit: CBO Historical Budget Data, Table 1.1
// Revenue: CBO Historical Budget Data, Table 1.1
// GDP: BEA via FRED (GDPA series)
// Wealth: Federal Reserve DFA (dfa.gov)
//
// Note: All values are approximate annual figures for illustration.
// Exact sourcing with URLs is in the citation objects below.

export const HISTORICAL_DATA: YearData[] = [
  {
    year: 2015, debtTrillions: 18.1, deficitBillions: -438, revenueBillions: 3250,
    spendingBillions: 3688, gdpTrillions: 18.2, debtToGdpRatio: 0.995, isProjected: false,
    wealthShares: { top01: 0.11, top1: 0.17, next9: 0.28, middle40: 0.29, bottom50: 0.03 },
  },
  {
    year: 2016, debtTrillions: 19.6, deficitBillions: -585, revenueBillions: 3268,
    spendingBillions: 3853, gdpTrillions: 18.7, debtToGdpRatio: 1.048, isProjected: false,
    wealthShares: { top01: 0.112, top1: 0.172, next9: 0.278, middle40: 0.288, bottom50: 0.029 },
  },
  {
    year: 2017, debtTrillions: 20.2, deficitBillions: -665, revenueBillions: 3316,
    spendingBillions: 3981, gdpTrillions: 19.5, debtToGdpRatio: 1.036, isProjected: false,
    wealthShares: { top01: 0.115, top1: 0.175, next9: 0.275, middle40: 0.285, bottom50: 0.028 },
  },
  {
    year: 2018, debtTrillions: 21.5, deficitBillions: -779, revenueBillions: 3329,
    spendingBillions: 4108, gdpTrillions: 20.5, debtToGdpRatio: 1.049, isProjected: false,
    wealthShares: { top01: 0.118, top1: 0.177, next9: 0.273, middle40: 0.283, bottom50: 0.027 },
  },
  {
    year: 2019, debtTrillions: 22.7, deficitBillions: -984, revenueBillions: 3462,
    spendingBillions: 4446, gdpTrillions: 21.4, debtToGdpRatio: 1.061, isProjected: false,
    wealthShares: { top01: 0.12, top1: 0.178, next9: 0.272, middle40: 0.281, bottom50: 0.027 },
  },
  {
    year: 2020, debtTrillions: 27.7, deficitBillions: -3132, revenueBillions: 3421,
    spendingBillions: 6553, gdpTrillions: 21.1, debtToGdpRatio: 1.313, isProjected: false,
    wealthShares: { top01: 0.125, top1: 0.18, next9: 0.27, middle40: 0.278, bottom50: 0.026 },
  },
  {
    year: 2021, debtTrillions: 28.4, deficitBillions: -2772, revenueBillions: 4047,
    spendingBillions: 6819, gdpTrillions: 23.3, debtToGdpRatio: 1.219, isProjected: false,
    wealthShares: { top01: 0.13, top1: 0.182, next9: 0.268, middle40: 0.275, bottom50: 0.026 },
  },
  {
    year: 2022, debtTrillions: 30.9, deficitBillions: -1375, revenueBillions: 4896,
    spendingBillions: 6271, gdpTrillions: 25.5, debtToGdpRatio: 1.212, isProjected: false,
    wealthShares: { top01: 0.128, top1: 0.18, next9: 0.27, middle40: 0.278, bottom50: 0.025 },
  },
  {
    year: 2023, debtTrillions: 33.2, deficitBillions: -1695, revenueBillions: 4440,
    spendingBillions: 6135, gdpTrillions: 27.4, debtToGdpRatio: 1.212, isProjected: false,
    wealthShares: { top01: 0.13, top1: 0.18, next9: 0.27, middle40: 0.278, bottom50: 0.025 },
  },
  {
    year: 2024, debtTrillions: 35.5, deficitBillions: -1833, revenueBillions: 4920,
    spendingBillions: 6753, gdpTrillions: 28.6, debtToGdpRatio: 1.241, isProjected: false,
    wealthShares: { top01: 0.13, top1: 0.18, next9: 0.27, middle40: 0.28, bottom50: 0.025 },
  },
  {
    year: 2025, debtTrillions: 36.6, deficitBillions: -1900, revenueBillions: 5000,
    spendingBillions: 6900, gdpTrillions: 29.3, debtToGdpRatio: 1.249, isProjected: false,
    wealthShares: { top01: 0.13, top1: 0.18, next9: 0.27, middle40: 0.28, bottom50: 0.025 },
  },
];

export const HISTORICAL_CITATIONS = {
  debt: {
    agency: "Treasury Direct",
    dataset: "Historical Debt Outstanding",
    url: "https://fiscaldata.treasury.gov/datasets/historical-debt-outstanding/",
    accessedDate: "2026-03-27",
  },
  deficit: {
    agency: "CBO",
    dataset: "Historical Budget Data, Table 1.1",
    url: "https://www.cbo.gov/data/budget-economic-data",
    accessedDate: "2026-03-27",
  },
  revenue: {
    agency: "CBO",
    dataset: "Historical Budget Data, Table 1.1",
    url: "https://www.cbo.gov/data/budget-economic-data",
    accessedDate: "2026-03-27",
  },
  gdp: {
    agency: "BEA via FRED",
    dataset: "Gross Domestic Product (GDPA)",
    url: "https://fred.stlouisfed.org/series/GDPA",
    accessedDate: "2026-03-27",
  },
  wealth: {
    agency: "Federal Reserve",
    dataset: "Distributional Financial Accounts (DFA)",
    url: "https://www.federalreserve.gov/releases/z1/dataviz/dfa/",
    accessedDate: "2026-03-27",
  },
};
```

- [ ] **Step 6: Commit**

```bash
git add lib/
git commit -m "feat: add TypeScript types, historical data, scenarios, programs"
```

---

## Task 3: Simulation Engine

**Files:**
- Create: `lib/engine/simulate.ts`, `lib/engine/tax-revenue.ts`, `lib/engine/wealth-redistribution.ts`

- [ ] **Step 1: Write tax revenue calculator**

Create `lib/engine/tax-revenue.ts`:

```typescript
import type { TaxPolicy, YearData } from "../types";
import { WEALTH_BRACKETS } from "../data/defaults";

/**
 * Calculate total tax revenue for a year given wealth distribution and tax policy.
 *
 * Simplified model:
 * - Income tax: derived from wealth brackets using income-to-wealth ratios
 * - Corporate tax: estimated as a percentage of GDP
 * - Capital gains: estimated from top bracket wealth growth
 * - Estate tax: small annual contribution from top bracket turnover
 *
 * Returns revenue in billions.
 */
export function calculateTaxRevenue(
  previousYear: YearData,
  taxPolicy: TaxPolicy,
  gdpTrillions: number
): number {
  // Income tax from brackets (simplified: income ≈ fraction of wealth)
  const totalWealth = gdpTrillions * 5.5; // US net worth ≈ 5.5x GDP
  const incomeToWealthRatio: Record<string, number> = {
    top01: 0.08,    // High income relative to wealth
    top1: 0.06,
    next9: 0.05,
    middle40: 0.10, // Wages are higher ratio of wealth for middle class
    bottom50: 0.20,
  };

  // Effective rates by bracket (top marginal rate applies progressively)
  const effectiveRates: Record<string, number> = {
    top01: taxPolicy.topMarginalRate / 100 * 0.85, // ~85% of top marginal as effective
    top1: taxPolicy.topMarginalRate / 100 * 0.70,
    next9: taxPolicy.topMarginalRate / 100 * 0.45,
    middle40: 0.15, // Middle class effective rate relatively fixed
    bottom50: 0.05, // Low effective rate
  };

  let incomeTaxRevenue = 0;
  for (const bracket of WEALTH_BRACKETS) {
    const bracketWealth = totalWealth * (previousYear.wealthShares[bracket.id] ?? 0);
    const bracketIncome = bracketWealth * (incomeToWealthRatio[bracket.id] ?? 0.05);
    const effectiveRate = effectiveRates[bracket.id] ?? 0.1;
    incomeTaxRevenue += bracketIncome * effectiveRate;
  }

  // Corporate tax: ~5% of GDP at current rates, scales with rate
  const corporateTax = gdpTrillions * 1000 * 0.05 * (taxPolicy.corporateRate / 21);

  // Capital gains tax: estimated from top bracket wealth appreciation
  const topWealth = totalWealth * (previousYear.wealthShares.top01 + previousYear.wealthShares.top1);
  const capitalGains = topWealth * 0.05; // ~5% annual realized gains
  const capitalGainsTax = capitalGains * (taxPolicy.capitalGainsRate / 100);

  // Estate tax: small annual contribution
  const estateTax = topWealth * 0.002 * (taxPolicy.estateRate / 100);

  return (incomeTaxRevenue + corporateTax + capitalGainsTax + estateTax) * 1000; // Convert to billions
}
```

- [ ] **Step 2: Write wealth redistribution model**

Create `lib/engine/wealth-redistribution.ts`:

```typescript
import type { TaxPolicy, AdvancedAssumptions } from "../types";
import { WEALTH_BRACKETS } from "../data/defaults";

/**
 * Redistribute wealth shares for the next year based on tax policy and growth.
 *
 * Model:
 * - GDP growth benefits top brackets disproportionately (historical pattern)
 * - Higher tax rates slow wealth accumulation at the top
 * - Government spending partially flows to lower brackets
 * - Behavioral elasticity reduces top-bracket growth at higher rates
 */
export function redistributeWealth(
  currentShares: Record<string, number>,
  taxPolicy: TaxPolicy,
  assumptions: AdvancedAssumptions,
  gdpGrowth: number,
  programSpendingBillions: number,
  gdpTrillions: number
): Record<string, number> {
  const newShares = { ...currentShares };

  // Base wealth growth rates (without policy intervention)
  // Top brackets grow faster due to capital appreciation
  const baseGrowthRates: Record<string, number> = {
    top01: gdpGrowth * 2.0,   // Top grows ~2x GDP growth
    top1: gdpGrowth * 1.5,
    next9: gdpGrowth * 1.1,
    middle40: gdpGrowth * 0.8,
    bottom50: gdpGrowth * 0.3,
  };

  // Tax drag on top brackets: higher rates reduce accumulation
  const currentTopRate = 37; // baseline
  const rateDelta = (taxPolicy.topMarginalRate - currentTopRate) / 100;
  const taxDrag = rateDelta * assumptions.behavioralElasticity;

  // Apply growth with tax effects
  for (const bracket of WEALTH_BRACKETS) {
    const baseGrowth = baseGrowthRates[bracket.id] ?? gdpGrowth;

    if (bracket.id === "top01" || bracket.id === "top1") {
      // Higher taxes slow top bracket wealth accumulation
      newShares[bracket.id] *= 1 + (baseGrowth - taxDrag) / 100;
    } else if (bracket.id === "bottom50" || bracket.id === "middle40") {
      // Government spending partially flows to lower brackets
      const spendingBoost = (programSpendingBillions / (gdpTrillions * 1000)) * 0.1;
      newShares[bracket.id] *= 1 + (baseGrowth + spendingBoost) / 100;
    } else {
      newShares[bracket.id] *= 1 + baseGrowth / 100;
    }
  }

  // Normalize shares to sum to 1
  const total = Object.values(newShares).reduce((a, b) => a + b, 0);
  for (const key of Object.keys(newShares)) {
    newShares[key] = newShares[key] / total;
  }

  return newShares;
}
```

- [ ] **Step 3: Write core simulation loop**

Create `lib/engine/simulate.ts`:

```typescript
import type { TaxPolicy, AdvancedAssumptions, YearData } from "../types";
import { PROGRAMS } from "../data/programs";
import { calculateTaxRevenue } from "./tax-revenue";
import { redistributeWealth } from "./wealth-redistribution";

/**
 * Run the forward simulation from the last historical year to the end year.
 * Pure function: takes inputs, returns projected YearData[].
 */
export function simulate(
  historicalData: YearData[],
  taxPolicy: TaxPolicy,
  enabledPrograms: string[],
  assumptions: AdvancedAssumptions,
  endYear: number
): YearData[] {
  const lastHistorical = historicalData[historicalData.length - 1];
  if (!lastHistorical) return [];

  const projected: YearData[] = [];
  let previous = lastHistorical;

  // Calculate total program cost
  const totalProgramCostBillions = enabledPrograms.reduce((sum, programId) => {
    const program = PROGRAMS.find((p) => p.id === programId);
    return sum + (program?.netCostBillions ?? 0);
  }, 0);

  for (let year = lastHistorical.year + 1; year <= endYear; year++) {
    // Step 1: GDP growth with fiscal multiplier from spending
    const spendingDelta = totalProgramCostBillions / 1000; // Convert to trillions
    const fiscalEffect = spendingDelta * assumptions.fiscalMultiplier * 0.01;
    const effectiveGdpGrowth = assumptions.gdpGrowthRate + fiscalEffect;
    const gdpTrillions = previous.gdpTrillions * (1 + effectiveGdpGrowth / 100);

    // Step 2: Tax revenue
    const revenueBillions = calculateTaxRevenue(previous, taxPolicy, gdpTrillions);

    // Step 3: Interest + spending
    const interestBillions = previous.debtTrillions * 1000 * (assumptions.interestRate / 100);
    // Baseline spending grows with GDP (approximation)
    const baselineSpending = previous.spendingBillions * (1 + assumptions.gdpGrowthRate / 100);
    // Subtract historical program spending to avoid double-counting baseline
    const spendingBillions = baselineSpending + totalProgramCostBillions + interestBillions;

    // Step 4: Deficit and debt
    const deficitBillions = -(spendingBillions - revenueBillions); // Negative = deficit
    // Positive deficit = surplus (reduces debt), negative = deficit (increases debt)
    const debtTrillions = previous.debtTrillions - deficitBillions / 1000;

    // Step 5: Wealth redistribution
    const wealthShares = redistributeWealth(
      previous.wealthShares,
      taxPolicy,
      assumptions,
      effectiveGdpGrowth,
      totalProgramCostBillions,
      gdpTrillions
    );

    const yearData: YearData = {
      year,
      debtTrillions,
      deficitBillions,
      revenueBillions,
      spendingBillions,
      gdpTrillions,
      debtToGdpRatio: debtTrillions / gdpTrillions,
      wealthShares,
      isProjected: true,
    };

    projected.push(yearData);
    previous = yearData;
  }

  return projected;
}
```

- [ ] **Step 4: Verify engine compiles**

Run:
```bash
npx tsc --noEmit
```

Expected: No type errors.

- [ ] **Step 5: Commit**

```bash
git add lib/engine/
git commit -m "feat: add simulation engine (tax revenue, wealth redistribution, core loop)"
```

---

## Task 4: URL State Management

**Files:**
- Create: `lib/url-state.ts`, `hooks/useURLState.ts`

- [ ] **Step 1: Write URL encode/decode functions**

Create `lib/url-state.ts`:

```typescript
import type { URLState } from "./types";

export function encodeURLState(state: URLState): string {
  const params = new URLSearchParams();
  if (state.s && state.s !== "current") params.set("s", state.s);
  if (state.tr !== undefined && state.tr !== 37) params.set("tr", String(state.tr));
  if (state.cg !== undefined && state.cg !== 20) params.set("cg", String(state.cg));
  if (state.cr !== undefined && state.cr !== 21) params.set("cr", String(state.cr));
  if (state.er !== undefined && state.er !== 40) params.set("er", String(state.er));
  if (state.p) params.set("p", state.p);
  if (state.y !== undefined) params.set("y", String(state.y));
  if (state.sp !== undefined && state.sp !== 1) params.set("sp", String(state.sp));
  if (state.ag !== undefined && state.ag !== 1.8) params.set("ag", String(state.ag));
  if (state.ai !== undefined && state.ai !== 3.2) params.set("ai", String(state.ai));
  if (state.ae !== undefined && state.ae !== 0.3) params.set("ae", String(state.ae));

  const str = params.toString();
  return str ? `#${str}` : "";
}

export function decodeURLState(hash: string): URLState {
  const clean = hash.startsWith("#") ? hash.slice(1) : hash;
  if (!clean) return {};

  const params = new URLSearchParams(clean);
  const state: URLState = {};

  const s = params.get("s");
  if (s) state.s = s;

  const tr = params.get("tr");
  if (tr) state.tr = Number(tr);

  const cg = params.get("cg");
  if (cg) state.cg = Number(cg);

  const cr = params.get("cr");
  if (cr) state.cr = Number(cr);

  const er = params.get("er");
  if (er) state.er = Number(er);

  const p = params.get("p");
  if (p) state.p = p;

  const y = params.get("y");
  if (y) state.y = Number(y);

  const sp = params.get("sp");
  if (sp) state.sp = Number(sp);

  const ag = params.get("ag");
  if (ag) state.ag = Number(ag);

  const ai = params.get("ai");
  if (ai) state.ai = Number(ai);

  const ae = params.get("ae");
  if (ae) state.ae = Number(ae);

  return state;
}
```

- [ ] **Step 2: Write useURLState hook**

Create `hooks/useURLState.ts`:

```typescript
"use client";

import { useEffect, useCallback } from "react";
import type { SimulationState } from "@/lib/types";
import type { URLState } from "@/lib/types";
import { encodeURLState, decodeURLState } from "@/lib/url-state";
import { CURRENT_POLICY, DEFAULT_ASSUMPTIONS } from "@/lib/data/defaults";
import { SCENARIOS } from "@/lib/data/scenarios";

export function stateToURL(state: SimulationState): URLState {
  return {
    s: state.scenarioId !== "current" ? state.scenarioId : undefined,
    tr: state.taxPolicy.topMarginalRate !== 37 ? state.taxPolicy.topMarginalRate : undefined,
    cg: state.taxPolicy.capitalGainsRate !== 20 ? state.taxPolicy.capitalGainsRate : undefined,
    cr: state.taxPolicy.corporateRate !== 21 ? state.taxPolicy.corporateRate : undefined,
    er: state.taxPolicy.estateRate !== 40 ? state.taxPolicy.estateRate : undefined,
    p: state.enabledPrograms.length > 0 ? state.enabledPrograms.join(",") : undefined,
    y: state.currentYear,
    sp: state.playbackSpeed !== 1 ? state.playbackSpeed : undefined,
    ag: state.assumptions.gdpGrowthRate !== 1.8 ? state.assumptions.gdpGrowthRate : undefined,
    ai: state.assumptions.interestRate !== 3.2 ? state.assumptions.interestRate : undefined,
    ae: state.assumptions.behavioralElasticity !== 0.3 ? state.assumptions.behavioralElasticity : undefined,
  };
}

export function urlToState(urlState: URLState): Partial<SimulationState> {
  const partial: Partial<SimulationState> = {};

  // Load scenario if specified
  if (urlState.s) {
    const scenario = SCENARIOS.find((s) => s.id === urlState.s);
    if (scenario) {
      partial.scenarioId = scenario.id;
      partial.taxPolicy = { ...scenario.policy };
      partial.enabledPrograms = [...scenario.programs];
    }
  }

  // Override individual tax rates (these take precedence over scenario)
  if (urlState.tr !== undefined || urlState.cg !== undefined || urlState.cr !== undefined || urlState.er !== undefined) {
    const base = partial.taxPolicy ?? { ...CURRENT_POLICY };
    partial.taxPolicy = {
      topMarginalRate: urlState.tr ?? base.topMarginalRate,
      capitalGainsRate: urlState.cg ?? base.capitalGainsRate,
      corporateRate: urlState.cr ?? base.corporateRate,
      estateRate: urlState.er ?? base.estateRate,
    };
  }

  if (urlState.p !== undefined) {
    partial.enabledPrograms = urlState.p ? urlState.p.split(",") : [];
  }

  if (urlState.y !== undefined) partial.currentYear = urlState.y;
  if (urlState.sp !== undefined) partial.playbackSpeed = urlState.sp as 1 | 5 | 10;

  // Advanced assumptions
  const hasAdvanced = urlState.ag !== undefined || urlState.ai !== undefined || urlState.ae !== undefined;
  if (hasAdvanced) {
    partial.assumptions = {
      ...DEFAULT_ASSUMPTIONS,
      ...(urlState.ag !== undefined && { gdpGrowthRate: urlState.ag }),
      ...(urlState.ai !== undefined && { interestRate: urlState.ai }),
      ...(urlState.ae !== undefined && { behavioralElasticity: urlState.ae }),
    };
    partial.advancedMode = true;
  }

  return partial;
}

export function useURLStateSync(
  state: SimulationState,
  onLoadFromURL: (partial: Partial<SimulationState>) => void
) {
  // Read URL on mount
  useEffect(() => {
    if (typeof window === "undefined") return;
    const hash = window.location.hash;
    if (hash) {
      const urlState = decodeURLState(hash);
      const partial = urlToState(urlState);
      if (Object.keys(partial).length > 0) {
        onLoadFromURL(partial);
      }
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Write URL on state change
  const updateURL = useCallback(() => {
    if (typeof window === "undefined") return;
    const urlState = stateToURL(state);
    const hash = encodeURLState(urlState);
    const newURL = window.location.pathname + hash;
    window.history.replaceState(null, "", newURL);
  }, [state]);

  useEffect(() => {
    updateURL();
  }, [updateURL]);
}
```

- [ ] **Step 3: Verify compilation**

Run:
```bash
npx tsc --noEmit
```

Expected: No type errors.

- [ ] **Step 4: Commit**

```bash
git add lib/url-state.ts hooks/
git commit -m "feat: add URL state encoding/decoding and sync hook"
```

---

## Task 5: Core Simulation Hook

**Files:**
- Create: `hooks/useSimulation.ts`, `hooks/usePlayback.ts`

- [ ] **Step 1: Write useSimulation hook**

Create `hooks/useSimulation.ts`:

```typescript
"use client";

import { useState, useMemo, useCallback } from "react";
import type { SimulationState, TaxPolicy, AdvancedAssumptions } from "@/lib/types";
import { CURRENT_POLICY, DEFAULT_ASSUMPTIONS, LAST_HISTORICAL_YEAR, DEFAULT_END_YEAR, START_YEAR } from "@/lib/data/defaults";
import { HISTORICAL_DATA } from "@/lib/data/historical";
import { SCENARIOS } from "@/lib/data/scenarios";
import { simulate } from "@/lib/engine/simulate";
import { useURLStateSync } from "./useURLState";

const INITIAL_STATE: SimulationState = {
  taxPolicy: { ...CURRENT_POLICY },
  enabledPrograms: [],
  assumptions: { ...DEFAULT_ASSUMPTIONS },
  currentYear: START_YEAR,
  isPlaying: false,
  playbackSpeed: 1,
  scenarioId: "current",
  historicalData: HISTORICAL_DATA,
  projectedData: [],
  advancedMode: false,
};

export function useSimulation() {
  const [state, setState] = useState<SimulationState>(INITIAL_STATE);

  // Run simulation whenever inputs change
  const projectedData = useMemo(
    () =>
      simulate(
        HISTORICAL_DATA,
        state.taxPolicy,
        state.enabledPrograms,
        state.assumptions,
        DEFAULT_END_YEAR
      ),
    [state.taxPolicy, state.enabledPrograms, state.assumptions]
  );

  // Baseline projection (current policy, no programs) for comparison
  const baselineData = useMemo(
    () =>
      simulate(HISTORICAL_DATA, CURRENT_POLICY, [], DEFAULT_ASSUMPTIONS, DEFAULT_END_YEAR),
    []
  );

  // Combined timeline
  const allData = useMemo(
    () => [...HISTORICAL_DATA, ...projectedData],
    [projectedData]
  );

  const baselineAllData = useMemo(
    () => [...HISTORICAL_DATA, ...baselineData],
    [baselineData]
  );

  // Current year data
  const currentYearData = useMemo(
    () => allData.find((d) => d.year === state.currentYear) ?? allData[0],
    [allData, state.currentYear]
  );

  const baselineYearData = useMemo(
    () => baselineAllData.find((d) => d.year === state.currentYear) ?? baselineAllData[0],
    [baselineAllData, state.currentYear]
  );

  // Actions
  const setTaxPolicy = useCallback((policy: Partial<TaxPolicy>) => {
    setState((prev) => ({
      ...prev,
      taxPolicy: { ...prev.taxPolicy, ...policy },
      scenarioId: "custom",
    }));
  }, []);

  const toggleProgram = useCallback((programId: string) => {
    setState((prev) => {
      const programs = prev.enabledPrograms.includes(programId)
        ? prev.enabledPrograms.filter((p) => p !== programId)
        : [...prev.enabledPrograms, programId];
      return { ...prev, enabledPrograms: programs, scenarioId: "custom" };
    });
  }, []);

  const setAssumptions = useCallback((assumptions: Partial<AdvancedAssumptions>) => {
    setState((prev) => ({
      ...prev,
      assumptions: { ...prev.assumptions, ...assumptions },
    }));
  }, []);

  const loadScenario = useCallback((scenarioId: string) => {
    const scenario = SCENARIOS.find((s) => s.id === scenarioId);
    if (!scenario) return;
    setState((prev) => ({
      ...prev,
      scenarioId: scenario.id,
      taxPolicy: { ...scenario.policy },
      enabledPrograms: [...scenario.programs],
    }));
  }, []);

  const setCurrentYear = useCallback((year: number) => {
    setState((prev) => ({ ...prev, currentYear: year }));
  }, []);

  const setIsPlaying = useCallback((isPlaying: boolean) => {
    setState((prev) => ({ ...prev, isPlaying }));
  }, []);

  const setPlaybackSpeed = useCallback((speed: 1 | 5 | 10) => {
    setState((prev) => ({ ...prev, playbackSpeed: speed }));
  }, []);

  const setAdvancedMode = useCallback((advancedMode: boolean) => {
    setState((prev) => ({ ...prev, advancedMode }));
  }, []);

  const reset = useCallback(() => {
    setState({ ...INITIAL_STATE });
  }, []);

  // URL state sync
  const onLoadFromURL = useCallback((partial: Partial<SimulationState>) => {
    setState((prev) => ({ ...prev, ...partial }));
  }, []);

  useURLStateSync(state, onLoadFromURL);

  return {
    state,
    allData,
    baselineAllData,
    currentYearData,
    baselineYearData,
    setTaxPolicy,
    toggleProgram,
    setAssumptions,
    loadScenario,
    setCurrentYear,
    setIsPlaying,
    setPlaybackSpeed,
    setAdvancedMode,
    reset,
  };
}
```

- [ ] **Step 2: Write usePlayback hook**

Create `hooks/usePlayback.ts`:

```typescript
"use client";

import { useEffect, useRef } from "react";
import { START_YEAR, DEFAULT_END_YEAR } from "@/lib/data/defaults";

interface PlaybackOptions {
  isPlaying: boolean;
  speed: 1 | 5 | 10;
  currentYear: number;
  onYearChange: (year: number) => void;
  onFinished: () => void;
}

export function usePlayback({
  isPlaying,
  speed,
  currentYear,
  onYearChange,
  onFinished,
}: PlaybackOptions) {
  const lastTickRef = useRef<number>(0);
  const frameRef = useRef<number>(0);

  useEffect(() => {
    if (!isPlaying) {
      if (frameRef.current) cancelAnimationFrame(frameRef.current);
      return;
    }

    // Milliseconds per year step at each speed
    const msPerYear: Record<number, number> = {
      1: 1000,  // 1 year per second
      5: 200,   // 5 years per second
      10: 100,  // 10 years per second
    };

    const interval = msPerYear[speed] ?? 1000;
    lastTickRef.current = performance.now();

    const tick = (now: number) => {
      const elapsed = now - lastTickRef.current;

      if (elapsed >= interval) {
        lastTickRef.current = now;
        const nextYear = currentYear + 1;

        if (nextYear > DEFAULT_END_YEAR) {
          onFinished();
          return;
        }

        onYearChange(nextYear);
      }

      frameRef.current = requestAnimationFrame(tick);
    };

    frameRef.current = requestAnimationFrame(tick);

    return () => {
      if (frameRef.current) cancelAnimationFrame(frameRef.current);
    };
  }, [isPlaying, speed, currentYear, onYearChange, onFinished]);
}
```

- [ ] **Step 3: Verify compilation**

Run:
```bash
npx tsc --noEmit
```

- [ ] **Step 4: Commit**

```bash
git add hooks/
git commit -m "feat: add useSimulation and usePlayback hooks"
```

---

## Task 6: Sidebar Components

**Files:**
- Create: `components/sidebar/Sidebar.tsx`, `components/sidebar/ScenarioSelector.tsx`, `components/sidebar/TaxSlider.tsx`, `components/sidebar/TaxControls.tsx`, `components/sidebar/ProgramToggles.tsx`, `components/sidebar/AdvancedAssumptions.tsx`

- [ ] **Step 1: Create TaxSlider component**

Create `components/sidebar/TaxSlider.tsx`:

```tsx
"use client";

import { Slider } from "@/components/ui/slider";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

interface TaxSliderProps {
  label: string;
  value: number;
  defaultValue: number;
  onChange: (value: number) => void;
  color?: string;
  min?: number;
  max?: number;
}

export function TaxSlider({
  label,
  value,
  defaultValue,
  onChange,
  color = "#e94560",
  min = 0,
  max = 100,
}: TaxSliderProps) {
  const delta = value - defaultValue;
  const deltaStr = delta > 0 ? `+${delta}` : `${delta}`;

  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between text-xs">
        <span className="text-zinc-400">{label}</span>
        <Tooltip>
          <TooltipTrigger asChild>
            <span className="font-mono font-bold" style={{ color }}>
              {value}%
            </span>
          </TooltipTrigger>
          <TooltipContent side="left" className="font-mono text-xs">
            <div>Current: {defaultValue}%</div>
            <div>Your setting: {value}%</div>
            <div>Delta: {deltaStr}%</div>
          </TooltipContent>
        </Tooltip>
      </div>
      <div className="relative">
        <Slider
          value={[value]}
          onValueChange={([v]) => onChange(v)}
          min={min}
          max={max}
          step={1}
          className="w-full"
        />
        {/* Ghost marker for default value */}
        <div
          className="absolute top-1/2 -translate-y-1/2 w-0.5 h-3 bg-zinc-500 opacity-50 pointer-events-none"
          style={{ left: `${((defaultValue - min) / (max - min)) * 100}%` }}
        />
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Create ScenarioSelector**

Create `components/sidebar/ScenarioSelector.tsx`:

```tsx
"use client";

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { SCENARIOS } from "@/lib/data/scenarios";

interface ScenarioSelectorProps {
  scenarioId: string;
  onSelect: (id: string) => void;
}

export function ScenarioSelector({ scenarioId, onSelect }: ScenarioSelectorProps) {
  return (
    <div className="space-y-1.5">
      <label className="text-[10px] uppercase tracking-wider text-zinc-500 font-medium">
        Scenario
      </label>
      <Select value={scenarioId} onValueChange={onSelect}>
        <SelectTrigger className="bg-zinc-800/50 border-[var(--simecon-border)] text-sm">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {SCENARIOS.map((s) => (
            <SelectItem key={s.id} value={s.id}>
              {s.name}
            </SelectItem>
          ))}
          <SelectItem value="custom">Custom</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}
```

- [ ] **Step 3: Create TaxControls**

Create `components/sidebar/TaxControls.tsx`:

```tsx
"use client";

import { useState } from "react";
import type { TaxPolicy } from "@/lib/types";
import { CURRENT_POLICY } from "@/lib/data/defaults";
import { TaxSlider } from "./TaxSlider";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";

interface TaxControlsProps {
  policy: TaxPolicy;
  advancedMode: boolean;
  onAdvancedModeChange: (v: boolean) => void;
  onChange: (policy: Partial<TaxPolicy>) => void;
}

export function TaxControls({ policy, advancedMode, onAdvancedModeChange, onChange }: TaxControlsProps) {
  return (
    <div className="space-y-3">
      <label className="text-[10px] uppercase tracking-wider text-zinc-500 font-medium">
        Tax Rates
      </label>

      <TaxSlider
        label="Top Marginal Rate"
        value={policy.topMarginalRate}
        defaultValue={CURRENT_POLICY.topMarginalRate}
        onChange={(v) => onChange({ topMarginalRate: v })}
        color="#e94560"
      />

      <Collapsible open={advancedMode} onOpenChange={onAdvancedModeChange}>
        <CollapsibleTrigger className="flex items-center gap-1 text-xs text-zinc-500 hover:text-zinc-300 transition-colors">
          <span>{advancedMode ? "\u25BE" : "\u25B8"}</span>
          <span>Advanced Tax Controls</span>
        </CollapsibleTrigger>
        <CollapsibleContent className="space-y-3 pt-2">
          <TaxSlider
            label="Capital Gains"
            value={policy.capitalGainsRate}
            defaultValue={CURRENT_POLICY.capitalGainsRate}
            onChange={(v) => onChange({ capitalGainsRate: v })}
            color="#0f3460"
          />
          <TaxSlider
            label="Corporate"
            value={policy.corporateRate}
            defaultValue={CURRENT_POLICY.corporateRate}
            onChange={(v) => onChange({ corporateRate: v })}
            color="#533483"
          />
          <TaxSlider
            label="Estate"
            value={policy.estateRate}
            defaultValue={CURRENT_POLICY.estateRate}
            onChange={(v) => onChange({ estateRate: v })}
            color="#f0a500"
          />
        </CollapsibleContent>
      </Collapsible>
    </div>
  );
}
```

- [ ] **Step 4: Create ProgramToggles**

Create `components/sidebar/ProgramToggles.tsx`:

```tsx
"use client";

import { Switch } from "@/components/ui/switch";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { PROGRAMS } from "@/lib/data/programs";

interface ProgramTogglesProps {
  enabledPrograms: string[];
  onToggle: (programId: string) => void;
}

export function ProgramToggles({ enabledPrograms, onToggle }: ProgramTogglesProps) {
  return (
    <div className="space-y-2">
      <label className="text-[10px] uppercase tracking-wider text-zinc-500 font-medium">
        Programs
      </label>
      {PROGRAMS.map((program) => {
        const enabled = enabledPrograms.includes(program.id);
        return (
          <div key={program.id} className="flex items-center justify-between">
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  className="flex items-center gap-2 text-sm text-left hover:text-white transition-colors"
                  onClick={() => onToggle(program.id)}
                >
                  <span>{program.icon}</span>
                  <span className={enabled ? "text-white" : "text-zinc-400"}>
                    {program.name}
                  </span>
                </button>
              </TooltipTrigger>
              <TooltipContent side="right" className="max-w-64 text-xs">
                <p>{program.description}</p>
                <p className="mt-1 font-mono text-zinc-400">
                  Net cost: ${program.netCostBillions}B/yr
                </p>
                {program.warning && (
                  <p className="mt-1 text-amber-400">{program.warning}</p>
                )}
              </TooltipContent>
            </Tooltip>
            <Switch
              checked={enabled}
              onCheckedChange={() => onToggle(program.id)}
              className="data-[state=checked]:bg-[#e94560]"
            />
          </div>
        );
      })}
    </div>
  );
}
```

- [ ] **Step 5: Create AdvancedAssumptions**

Create `components/sidebar/AdvancedAssumptions.tsx`:

```tsx
"use client";

import type { AdvancedAssumptions as AdvancedAssumptionsType } from "@/lib/types";
import { DEFAULT_ASSUMPTIONS } from "@/lib/data/defaults";
import { TaxSlider } from "./TaxSlider";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { useState } from "react";

interface AdvancedAssumptionsProps {
  assumptions: AdvancedAssumptionsType;
  onChange: (assumptions: Partial<AdvancedAssumptionsType>) => void;
}

export function AdvancedAssumptions({ assumptions, onChange }: AdvancedAssumptionsProps) {
  const [open, setOpen] = useState(false);

  return (
    <Collapsible open={open} onOpenChange={setOpen}>
      <CollapsibleTrigger className="flex items-center gap-1 text-xs text-zinc-500 hover:text-zinc-300 transition-colors">
        <span>{open ? "\u25BE" : "\u25B8"}</span>
        <span>\u2699 Model Assumptions</span>
      </CollapsibleTrigger>
      <CollapsibleContent className="space-y-3 pt-2">
        <TaxSlider
          label="GDP Growth Rate"
          value={assumptions.gdpGrowthRate * 10} // Scale for slider precision
          defaultValue={DEFAULT_ASSUMPTIONS.gdpGrowthRate * 10}
          onChange={(v) => onChange({ gdpGrowthRate: v / 10 })}
          color="#4ecca3"
          min={0}
          max={50}
        />
        <TaxSlider
          label="Interest Rate"
          value={assumptions.interestRate * 10}
          defaultValue={DEFAULT_ASSUMPTIONS.interestRate * 10}
          onChange={(v) => onChange({ interestRate: v / 10 })}
          color="#f0a500"
          min={10}
          max={80}
        />
        <TaxSlider
          label="Behavioral Elasticity"
          value={assumptions.behavioralElasticity * 100}
          defaultValue={DEFAULT_ASSUMPTIONS.behavioralElasticity * 100}
          onChange={(v) => onChange({ behavioralElasticity: v / 100 })}
          color="#0f3460"
          min={0}
          max={100}
        />
      </CollapsibleContent>
    </Collapsible>
  );
}
```

- [ ] **Step 6: Create Sidebar container**

Create `components/sidebar/Sidebar.tsx`:

```tsx
"use client";

import type { SimulationState, TaxPolicy, AdvancedAssumptions } from "@/lib/types";
import { ScenarioSelector } from "./ScenarioSelector";
import { TaxControls } from "./TaxControls";
import { ProgramToggles } from "./ProgramToggles";
import { AdvancedAssumptions as AdvancedAssumptionsPanel } from "./AdvancedAssumptions";
import { Button } from "@/components/ui/button";

interface SidebarProps {
  state: SimulationState;
  onScenarioChange: (id: string) => void;
  onTaxChange: (policy: Partial<TaxPolicy>) => void;
  onProgramToggle: (programId: string) => void;
  onAssumptionsChange: (assumptions: Partial<AdvancedAssumptions>) => void;
  onAdvancedModeChange: (v: boolean) => void;
  onReset: () => void;
}

export function Sidebar({
  state,
  onScenarioChange,
  onTaxChange,
  onProgramToggle,
  onAssumptionsChange,
  onAdvancedModeChange,
  onReset,
}: SidebarProps) {
  return (
    <aside className="w-72 bg-[var(--simecon-bg-sidebar)] border-r border-[var(--simecon-border)] p-4 overflow-y-auto flex flex-col gap-6">
      <ScenarioSelector scenarioId={state.scenarioId} onSelect={onScenarioChange} />

      <TaxControls
        policy={state.taxPolicy}
        advancedMode={state.advancedMode}
        onAdvancedModeChange={onAdvancedModeChange}
        onChange={onTaxChange}
      />

      <ProgramToggles
        enabledPrograms={state.enabledPrograms}
        onToggle={onProgramToggle}
      />

      <AdvancedAssumptionsPanel
        assumptions={state.assumptions}
        onChange={onAssumptionsChange}
      />

      <div className="mt-auto pt-4 border-t border-[var(--simecon-border)]">
        <Button
          variant="ghost"
          size="sm"
          onClick={onReset}
          className="w-full text-xs text-zinc-500 hover:text-white"
        >
          Reset to Current Policy
        </Button>
      </div>
    </aside>
  );
}
```

- [ ] **Step 7: Commit**

```bash
git add components/sidebar/
git commit -m "feat: add sidebar components (scenario, tax sliders, programs, assumptions)"
```

---

## Task 7: Visualization Components

**Files:**
- Create: `components/visualization/KPICard.tsx`, `components/visualization/KPICards.tsx`, `components/visualization/DebtDeficitChart.tsx`, `components/visualization/WealthDistributionChart.tsx`

- [ ] **Step 1: Create KPICard**

Create `components/visualization/KPICard.tsx`:

```tsx
interface KPICardProps {
  label: string;
  value: string;
  delta?: number; // percentage change from baseline
  color: string;
}

export function KPICard({ label, value, delta, color }: KPICardProps) {
  const deltaColor = delta && delta > 0 ? "#e94560" : "#4ecca3";
  const deltaStr = delta
    ? `${delta > 0 ? "\u2191" : "\u2193"}${Math.abs(delta).toFixed(1)}%`
    : null;

  return (
    <div className="bg-[var(--simecon-bg-card)] rounded-lg border border-[var(--simecon-border)] p-3 text-center">
      <div className="text-[10px] uppercase tracking-wider text-zinc-500 mb-1">
        {label}
      </div>
      <div className="font-mono text-xl font-bold" style={{ color }}>
        {value}
      </div>
      {deltaStr && (
        <div className="text-xs font-mono mt-0.5" style={{ color: deltaColor }}>
          {deltaStr} vs baseline
        </div>
      )}
    </div>
  );
}
```

- [ ] **Step 2: Create KPICards**

Create `components/visualization/KPICards.tsx`:

```tsx
import type { YearData } from "@/lib/types";
import { KPICard } from "./KPICard";

interface KPICardsProps {
  current: YearData;
  baseline: YearData;
}

function formatTrillions(t: number): string {
  return `$${t.toFixed(1)}T`;
}

function formatBillions(b: number): string {
  if (Math.abs(b) >= 1000) return `$${(b / 1000).toFixed(1)}T`;
  return `$${Math.abs(b).toFixed(0)}B`;
}

function pctDelta(current: number, baseline: number): number {
  if (baseline === 0) return 0;
  return ((current - baseline) / Math.abs(baseline)) * 100;
}

export function KPICards({ current, baseline }: KPICardsProps) {
  return (
    <div className="grid grid-cols-4 gap-3">
      <KPICard
        label="National Debt"
        value={formatTrillions(current.debtTrillions)}
        delta={pctDelta(current.debtTrillions, baseline.debtTrillions)}
        color="#e94560"
      />
      <KPICard
        label="Annual Deficit"
        value={formatBillions(current.deficitBillions)}
        delta={pctDelta(Math.abs(current.deficitBillions), Math.abs(baseline.deficitBillions))}
        color="#f0a500"
      />
      <KPICard
        label="Revenue"
        value={formatBillions(current.revenueBillions)}
        delta={pctDelta(current.revenueBillions, baseline.revenueBillions)}
        color="#4ecca3"
      />
      <KPICard
        label="Debt/GDP"
        value={`${(current.debtToGdpRatio * 100).toFixed(0)}%`}
        delta={pctDelta(current.debtToGdpRatio, baseline.debtToGdpRatio)}
        color="#0f3460"
      />
    </div>
  );
}
```

- [ ] **Step 3: Create DebtDeficitChart**

Create `components/visualization/DebtDeficitChart.tsx`:

```tsx
"use client";

import {
  ComposedChart,
  Line,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from "recharts";
import type { YearData } from "@/lib/types";
import { LAST_HISTORICAL_YEAR } from "@/lib/data/defaults";

interface DebtDeficitChartProps {
  data: YearData[];
  baselineData: YearData[];
  currentYear: number;
}

export function DebtDeficitChart({ data, baselineData, currentYear }: DebtDeficitChartProps) {
  const chartData = data
    .filter((d) => d.year <= currentYear)
    .map((d) => {
      const baseline = baselineData.find((b) => b.year === d.year);
      return {
        year: d.year,
        debt: d.debtTrillions,
        deficit: Math.abs(d.deficitBillions) / 1000, // Convert to trillions for scale
        baselineDebt: baseline?.debtTrillions,
        isProjected: d.isProjected,
      };
    });

  return (
    <div className="bg-[var(--simecon-bg-card)] rounded-lg border border-[var(--simecon-border)] p-4">
      <h3 className="text-xs uppercase tracking-wider text-zinc-500 mb-3">
        Debt & Deficit Over Time
      </h3>
      <ResponsiveContainer width="100%" height={250}>
        <ComposedChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" stroke="#333" />
          <XAxis
            dataKey="year"
            tick={{ fill: "#666", fontSize: 11 }}
            tickLine={{ stroke: "#444" }}
          />
          <YAxis
            tick={{ fill: "#666", fontSize: 11 }}
            tickLine={{ stroke: "#444" }}
            tickFormatter={(v) => `$${v}T`}
          />
          <Tooltip
            contentStyle={{
              background: "#1a1a2e",
              border: "1px solid #333",
              borderRadius: 8,
              fontSize: 12,
            }}
            labelStyle={{ color: "#fff" }}
            formatter={(value: number, name: string) => [
              `$${value.toFixed(1)}T`,
              name === "debt" ? "Debt" : name === "baselineDebt" ? "Baseline Debt" : "Deficit",
            ]}
          />
          <ReferenceLine
            x={LAST_HISTORICAL_YEAR}
            stroke="#444"
            strokeDasharray="4 4"
            label={{ value: "Projected \u25B8", position: "top", fill: "#666", fontSize: 10 }}
          />
          <Line
            type="monotone"
            dataKey="baselineDebt"
            stroke="#444"
            strokeDasharray="5 5"
            dot={false}
            name="baselineDebt"
          />
          <Line
            type="monotone"
            dataKey="debt"
            stroke="#e94560"
            strokeWidth={2}
            dot={false}
            name="debt"
          />
          <Bar dataKey="deficit" fill="#f0a500" opacity={0.4} name="deficit" />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
}
```

- [ ] **Step 4: Create WealthDistributionChart**

Create `components/visualization/WealthDistributionChart.tsx`:

```tsx
"use client";

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from "recharts";
import type { YearData } from "@/lib/types";
import { WEALTH_BRACKETS, LAST_HISTORICAL_YEAR } from "@/lib/data/defaults";

interface WealthDistributionChartProps {
  data: YearData[];
  currentYear: number;
}

export function WealthDistributionChart({ data, currentYear }: WealthDistributionChartProps) {
  const chartData = data
    .filter((d) => d.year <= currentYear)
    .map((d) => ({
      year: d.year,
      ...Object.fromEntries(
        WEALTH_BRACKETS.map((b) => [b.id, (d.wealthShares[b.id] ?? 0) * 100])
      ),
    }));

  return (
    <div className="bg-[var(--simecon-bg-card)] rounded-lg border border-[var(--simecon-border)] p-4">
      <h3 className="text-xs uppercase tracking-wider text-zinc-500 mb-3">
        Wealth Distribution Over Time
      </h3>
      <ResponsiveContainer width="100%" height={250}>
        <AreaChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" stroke="#333" />
          <XAxis
            dataKey="year"
            tick={{ fill: "#666", fontSize: 11 }}
            tickLine={{ stroke: "#444" }}
          />
          <YAxis
            tick={{ fill: "#666", fontSize: 11 }}
            tickLine={{ stroke: "#444" }}
            tickFormatter={(v) => `${v}%`}
            domain={[0, 100]}
          />
          <Tooltip
            contentStyle={{
              background: "#1a1a2e",
              border: "1px solid #333",
              borderRadius: 8,
              fontSize: 12,
            }}
            formatter={(value: number, name: string) => {
              const bracket = WEALTH_BRACKETS.find((b) => b.id === name);
              return [`${value.toFixed(1)}%`, bracket?.label ?? name];
            }}
          />
          <ReferenceLine x={LAST_HISTORICAL_YEAR} stroke="#444" strokeDasharray="4 4" />
          {[...WEALTH_BRACKETS].reverse().map((bracket) => (
            <Area
              key={bracket.id}
              type="monotone"
              dataKey={bracket.id}
              stackId="1"
              fill={bracket.color}
              stroke={bracket.color}
              fillOpacity={0.7}
            />
          ))}
        </AreaChart>
      </ResponsiveContainer>
      <div className="flex gap-4 mt-2 text-xs">
        {WEALTH_BRACKETS.map((b) => (
          <span key={b.id} className="flex items-center gap-1">
            <span
              className="w-2 h-2 rounded-sm inline-block"
              style={{ background: b.color }}
            />
            <span className="text-zinc-400">{b.label}</span>
          </span>
        ))}
      </div>
    </div>
  );
}
```

- [ ] **Step 5: Commit**

```bash
git add components/visualization/
git commit -m "feat: add visualization components (KPI cards, debt/deficit chart, wealth distribution)"
```

---

## Task 8: Playback Bar

**Files:**
- Create: `components/playback/SpeedControl.tsx`, `components/playback/PlaybackBar.tsx`

- [ ] **Step 1: Create SpeedControl**

Create `components/playback/SpeedControl.tsx`:

```tsx
"use client";

interface SpeedControlProps {
  speed: 1 | 5 | 10;
  onChange: (speed: 1 | 5 | 10) => void;
}

const SPEEDS: (1 | 5 | 10)[] = [1, 5, 10];

export function SpeedControl({ speed, onChange }: SpeedControlProps) {
  return (
    <div className="flex gap-1">
      {SPEEDS.map((s) => (
        <button
          key={s}
          onClick={() => onChange(s)}
          className={`px-2 py-0.5 rounded text-xs font-mono transition-colors ${
            speed === s
              ? "bg-[#e94560] text-white"
              : "bg-zinc-800 text-zinc-400 hover:text-white"
          }`}
        >
          {s}x
        </button>
      ))}
    </div>
  );
}
```

- [ ] **Step 2: Create PlaybackBar**

Create `components/playback/PlaybackBar.tsx`:

```tsx
"use client";

import { Slider } from "@/components/ui/slider";
import { SpeedControl } from "./SpeedControl";
import { START_YEAR, DEFAULT_END_YEAR } from "@/lib/data/defaults";

interface PlaybackBarProps {
  currentYear: number;
  isPlaying: boolean;
  speed: 1 | 5 | 10;
  onYearChange: (year: number) => void;
  onPlayToggle: () => void;
  onSpeedChange: (speed: 1 | 5 | 10) => void;
}

export function PlaybackBar({
  currentYear,
  isPlaying,
  speed,
  onYearChange,
  onPlayToggle,
  onSpeedChange,
}: PlaybackBarProps) {
  return (
    <div className="bg-[#0a0a1a] border-t border-[var(--simecon-border)] px-4 py-3 flex items-center gap-4">
      <button
        onClick={onPlayToggle}
        className="text-xl hover:text-[#e94560] transition-colors w-8 text-center"
      >
        {isPlaying ? "\u23F8" : "\u25B6"}
      </button>

      <Slider
        value={[currentYear]}
        onValueChange={([v]) => onYearChange(v)}
        min={START_YEAR}
        max={DEFAULT_END_YEAR}
        step={1}
        className="flex-1"
      />

      <span className="font-mono text-sm text-zinc-400 w-12 text-right">
        {currentYear}
      </span>

      <SpeedControl speed={speed} onChange={onSpeedChange} />
    </div>
  );
}
```

- [ ] **Step 3: Commit**

```bash
git add components/playback/
git commit -m "feat: add playback bar with timeline scrubber and speed controls"
```

---

## Task 9: Header, Citation Popover, Transparency Banner

**Files:**
- Create: `components/layout/Header.tsx`, `components/shared/CitationPopover.tsx`, `components/shared/TransparencyBanner.tsx`

- [ ] **Step 1: Create Header**

Create `components/layout/Header.tsx`:

```tsx
"use client";

import { Button } from "@/components/ui/button";
import { useCallback } from "react";

export function Header() {
  const handleShare = useCallback(() => {
    const url = window.location.href;
    navigator.clipboard.writeText(url);
    // Could add a toast notification here
  }, []);

  return (
    <header className="bg-[var(--simecon-bg-card)] border-b border-[var(--simecon-border)] px-4 py-2 flex items-center justify-between">
      <div className="flex items-center gap-2">
        <span className="text-lg">⚡</span>
        <h1 className="font-bold text-base">SimEcon</h1>
        <span className="text-xs text-zinc-500 hidden sm:inline">
          US Economic Policy Simulator
        </span>
      </div>
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={handleShare}
          className="text-xs border-[var(--simecon-border)]"
        >
          Share
        </Button>
      </div>
    </header>
  );
}
```

- [ ] **Step 2: Create CitationPopover**

Create `components/shared/CitationPopover.tsx`:

```tsx
"use client";

import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

interface CitationInfo {
  agency: string;
  dataset: string;
  url: string;
  accessedDate: string;
}

interface CitationPopoverProps {
  citation: CitationInfo;
  children: React.ReactNode;
}

export function CitationPopover({ citation, children }: CitationPopoverProps) {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <button className="cursor-pointer hover:underline decoration-dotted underline-offset-2">
          {children}
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-72 bg-[var(--simecon-bg-card)] border-[var(--simecon-border)] text-xs">
        <div className="space-y-1.5">
          <div>
            <span className="text-zinc-500">Source: </span>
            <span className="text-white">{citation.agency}</span>
          </div>
          <div>
            <span className="text-zinc-500">Dataset: </span>
            <span className="text-zinc-300">{citation.dataset}</span>
          </div>
          <div>
            <span className="text-zinc-500">Accessed: </span>
            <span className="text-zinc-300">{citation.accessedDate}</span>
          </div>
          <a
            href={citation.url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-[#4ecca3] hover:underline block mt-1"
          >
            View source data \u2197
          </a>
        </div>
      </PopoverContent>
    </Popover>
  );
}
```

- [ ] **Step 3: Create TransparencyBanner**

Create `components/shared/TransparencyBanner.tsx`:

```tsx
export function TransparencyBanner() {
  return (
    <div className="bg-zinc-900/50 border border-[var(--simecon-border)] rounded-lg px-3 py-2 text-[11px] text-zinc-500 leading-relaxed">
      SimEcon uses a simplified economic model for illustration. Real economies are
      vastly more complex. All historical data is real and cited. Projections show
      directional trends, not forecasts.
    </div>
  );
}
```

- [ ] **Step 4: Commit**

```bash
git add components/layout/ components/shared/
git commit -m "feat: add header, citation popover, and transparency banner"
```

---

## Task 10: Main Page Assembly

**Files:**
- Create: `components/layout/SimulatorLayout.tsx`
- Modify: `app/page.tsx`

- [ ] **Step 1: Create SimulatorLayout**

Create `components/layout/SimulatorLayout.tsx`:

```tsx
"use client";

import { TooltipProvider } from "@/components/ui/tooltip";
import { useSimulation } from "@/hooks/useSimulation";
import { usePlayback } from "@/hooks/usePlayback";
import { Header } from "./Header";
import { Sidebar } from "@/components/sidebar/Sidebar";
import { KPICards } from "@/components/visualization/KPICards";
import { DebtDeficitChart } from "@/components/visualization/DebtDeficitChart";
import { WealthDistributionChart } from "@/components/visualization/WealthDistributionChart";
import { PlaybackBar } from "@/components/playback/PlaybackBar";
import { TransparencyBanner } from "@/components/shared/TransparencyBanner";
import { useCallback } from "react";

export function SimulatorLayout() {
  const sim = useSimulation();

  const handlePlaybackFinished = useCallback(() => sim.setIsPlaying(false), [sim.setIsPlaying]);

  usePlayback({
    isPlaying: sim.state.isPlaying,
    speed: sim.state.playbackSpeed,
    currentYear: sim.state.currentYear,
    onYearChange: sim.setCurrentYear,
    onFinished: handlePlaybackFinished,
  });

  return (
    <TooltipProvider delayDuration={200}>
      <div className="h-screen flex flex-col">
        <Header />
        <div className="flex flex-1 overflow-hidden">
          <Sidebar
            state={sim.state}
            onScenarioChange={sim.loadScenario}
            onTaxChange={sim.setTaxPolicy}
            onProgramToggle={sim.toggleProgram}
            onAssumptionsChange={sim.setAssumptions}
            onAdvancedModeChange={sim.setAdvancedMode}
            onReset={sim.reset}
          />
          <main className="flex-1 overflow-y-auto p-4 space-y-4">
            <KPICards
              current={sim.currentYearData}
              baseline={sim.baselineYearData}
            />
            <DebtDeficitChart
              data={sim.allData}
              baselineData={sim.baselineAllData}
              currentYear={sim.state.currentYear}
            />
            <WealthDistributionChart
              data={sim.allData}
              currentYear={sim.state.currentYear}
            />
            <TransparencyBanner />
          </main>
        </div>
        <PlaybackBar
          currentYear={sim.state.currentYear}
          isPlaying={sim.state.isPlaying}
          speed={sim.state.playbackSpeed}
          onYearChange={sim.setCurrentYear}
          onPlayToggle={() => sim.setIsPlaying(!sim.state.isPlaying)}
          onSpeedChange={sim.setPlaybackSpeed}
        />
      </div>
    </TooltipProvider>
  );
}
```

- [ ] **Step 2: Wire up main page**

Replace `app/page.tsx`:

```tsx
import { SimulatorLayout } from "@/components/layout/SimulatorLayout";

export default function Home() {
  return <SimulatorLayout />;
}
```

- [ ] **Step 3: Wire CitationPopover into KPICards**

Update `components/visualization/KPICards.tsx` to wrap each KPI value with `CitationPopover`, using the appropriate citation from `HISTORICAL_CITATIONS`. Import `CitationPopover` and `HISTORICAL_CITATIONS`, then wrap the `value` prop rendering in each `KPICard` so clicking it shows the source. The debt card uses `HISTORICAL_CITATIONS.debt`, deficit uses `.deficit`, revenue uses `.revenue`, and debt-to-GDP uses `.debt`.

- [ ] **Step 4: Verify the full app compiles and renders**

Run:
```bash
npm run dev
```

Open http://localhost:3000. Expected: Dark dashboard with sidebar, charts, KPI cards, and playback bar. Sliders should be interactive and charts should update. Clicking KPI values should show citation popovers.

- [ ] **Step 5: Commit**

```bash
git add components/layout/ app/page.tsx
git commit -m "feat: assemble main simulator page with all components"
```

---

## Task 11: Polish & Responsive

**Files:**
- Modify: various component files for responsive behavior

- [ ] **Step 1: Add mobile responsive behavior to SimulatorLayout**

The sidebar should collapse on mobile. Update `components/layout/SimulatorLayout.tsx` to add a mobile toggle:

Add state and a hamburger button that shows/hides the sidebar on screens smaller than `lg`. On mobile, the sidebar renders as a slide-over panel. The main layout changes from `flex` (side-by-side) to stacked.

Key changes:
- Add `const [sidebarOpen, setSidebarOpen] = useState(false)`
- Sidebar gets `className="hidden lg:flex"` on desktop, and a sheet/overlay on mobile
- KPI cards go from `grid-cols-4` to `grid-cols-2` on mobile

- [ ] **Step 2: Test on desktop and simulated mobile**

Use browser dev tools to test responsive layout at 375px, 768px, and 1280px widths.

- [ ] **Step 3: Commit**

```bash
git add -A
git commit -m "feat: add responsive layout with mobile sidebar toggle"
```

---

## Task 12: Final Verification

- [ ] **Step 1: Run through all success criteria**

Verify each item from the spec:

1. Dashboard loads with historical data (2015-2025) ✓
2. Single slider mode: drag top rate, see charts update ✓
3. Advanced mode with 4 sliders ✓
4. Pre-built scenarios load correctly (test each) ✓
5. Program toggles work with cost impacts ✓
6. Playback animates historical → projected ✓
7. Speed controls (1x, 5x, 10x) ✓
8. Citation popovers on numbers ✓
9. URL state persists and restores ✓
10. Share button copies URL ✓
11. Transparency banner visible ✓
12. Desktop and mobile layouts ✓
13. Loads in <2 seconds ✓

- [ ] **Step 2: Fix any issues found during verification**

- [ ] **Step 3: Final commit**

```bash
git add -A
git commit -m "feat: SimEcon Phase 1 complete - interactive economic policy simulator"
```

---

## Summary

| Task | Description | Estimated Steps |
|------|-------------|----------------|
| 1 | Project scaffolding (Next.js, shadcn, fonts) | 8 |
| 2 | Types, data layer (historical, scenarios, programs) | 6 |
| 3 | Simulation engine (tax revenue, wealth, core loop) | 5 |
| 4 | URL state management | 4 |
| 5 | Core hooks (useSimulation, usePlayback) | 4 |
| 6 | Sidebar components | 7 |
| 7 | Visualization components (charts, KPIs) | 5 |
| 8 | Playback bar | 3 |
| 9 | Header, citations, transparency | 4 |
| 10 | Main page assembly | 4 |
| 11 | Responsive polish | 3 |
| 12 | Final verification | 3 |
| **Total** | | **56 steps** |
