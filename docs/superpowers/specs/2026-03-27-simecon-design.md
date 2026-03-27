# SimEcon — Design Specification

> Interactive US economic policy simulator. Named after SimCity/SimTower.
> Lets users adjust tax rates and social programs, then watch the effects
> on national debt, deficit, and wealth distribution over time.

---

## 1. Product Vision

SimEcon is a dual-audience tool:

- **Casual users** (TikTok/social media traffic): approachable, one-slider interface, pre-built scenarios, shareable links and video exports
- **Power users** (policy nerds, economists, educators): full bracket controls, exposed assumptions, citation layer, exportable data

The core interaction is Factorio-inspired: configure your economic policy, hit play, and watch the simulation run in accelerated time.

---

## 2. Architecture

### Approach: Static Site with URL State

- **Framework:** Next.js (App Router, static export for Phase 1-2)
- **Computation:** All simulation runs client-side in the browser
- **Data:** Historical data bundled as static JSON at build time
- **State sharing:** Entire configuration encoded in URL hash
- **Deployment:** Vercel (free tier sufficient for Phase 1-2)
- **Backend:** None for Phase 1-2. Phase 3 adds lightweight backend for multiplayer/community.

### Why This Approach

- Zero running costs
- Every configuration is a shareable URL
- Fast iteration — no API to maintain
- Economic model is just math on ~10 years of data points
- Can graduate to full-stack (Phase 3) without rewriting

---

## 3. Data Model

### 3.1 Historical Data (2015–2025)

Real data, fully cited. Sources:

| Dataset | Source | Format |
|---------|--------|--------|
| National debt (annual) | Treasury Direct, CBO Historical Budget Data | JSON |
| Annual deficit | CBO Historical Budget Data | JSON |
| Tax revenue by category | IRS Statistics of Income (SOI) | JSON |
| Wealth distribution by bracket | Federal Reserve Distributional Financial Accounts (DFA) | JSON |
| GDP, inflation, wage growth | BEA/BLS via FRED API | JSON |
| Federal spending by category | CBO Budget & Economic Outlook | JSON |

Each data point carries a citation object:

```typescript
interface Citation {
  value: number;
  agency: string;       // "CBO", "IRS", "Federal Reserve"
  dataset: string;      // "Historical Budget Data, Table 1.1"
  year: number;
  url: string;          // Direct link to source
  accessedDate: string; // ISO date
}
```

### 3.2 Wealth Brackets

Five brackets tracked over time:

| Bracket | Label | ~Share of Wealth (2024) |
|---------|-------|------------------------|
| Top 0.1% | Billionaires | ~13% |
| Top 1% (excl. 0.1%) | Ultra-wealthy | ~18% |
| Next 9% | Upper class | ~27% |
| Middle 40% | Middle class | ~28% |
| Bottom 50% | Working class | ~2.5% |

Data from Federal Reserve DFA, updated quarterly.

### 3.3 Tax Policy Parameters

```typescript
interface TaxPolicy {
  // Simple mode: only topMarginalRate is shown
  topMarginalRate: number;      // 0-100%, default: current (37%)
  capitalGainsRate: number;     // 0-100%, default: current (20%)
  corporateRate: number;        // 0-100%, default: current (21%)
  estateRate: number;           // 0-100%, default: current (40%)
}
```

### 3.4 Social Programs

```typescript
interface Program {
  id: string;
  name: string;
  icon: string;
  annualCost: number;          // CBO-scored estimate (billions)
  annualSavings: number;       // Estimated offsets (billions)
  netCost: number;             // cost - savings
  source: Citation;
  description: string;
}
```

Programs available:

| Program | Est. Annual Net Cost | Source |
|---------|---------------------|--------|
| Universal Healthcare (Medicare for All) | ~$300-600B net | CBO, Lancet study |
| Free Public College | ~$80B | Dept. of Education estimates |
| Universal Pre-K | ~$40B | CBO score of various proposals |
| Housing Guarantee | ~$50-100B | Urban Institute estimates |
| Universal Basic Income ($1K/mo) | ~$2.8T gross | Various policy analyses |
| Infrastructure (Green New Deal scale) | ~$200-400B/yr | CBO, policy proposals |

Each program toggles on/off. Cost estimates are fixed per program (not adjustable in Phase 1; adjustable in Phase 2 advanced mode).

**Note on UBI:** At ~$2.8T gross, UBI is an order of magnitude larger than other programs and will dominate the simulation when enabled. This is intentional — it reflects the real cost disparity and is itself an educational data point. The UI should surface a warning when UBI is toggled: "UBI costs ~$2.8T/yr — more than all other programs combined. This reflects real cost estimates."

### 3.5 Pre-Built Scenarios

```typescript
interface Scenario {
  id: string;
  name: string;
  description: string;
  policy: TaxPolicy;
  programs: string[];          // Array of program IDs
  source?: string;             // "Based on Sen. Warren's 2020 proposal"
}
```

Scenarios:

| Scenario | Top Rate | Cap Gains | Corp | Estate | Programs |
|----------|----------|-----------|------|--------|----------|
| Current Policy | 37% | 20% | 21% | 40% | None |
| Nordic Model | 55% | 30% | 25% | 50% | Healthcare, College, Pre-K |
| Warren Plan | 50% | 39.6% | 28% | 45% | Healthcare, College, Infrastructure |
| Sanders Plan | 52% | 39.6% | 35% | 55% | Healthcare, College, Pre-K, Housing, Infrastructure |
| Eisenhower Era | 91% | 25% | 52% | 77% | None (historical reference) |
| Libertarian | 15% | 0% | 10% | 0% | None |
| Custom | (user-defined) | | | | (user-defined) |

---

## 4. Simulation Engine

### 4.1 Core Loop

Runs client-side. For each simulated year after the historical cutoff:

```
for each year from (lastHistoricalYear + 1) to endYear:
  1. taxRevenue = calculateTaxRevenue(wealthBrackets, taxPolicy, gdp)
  2. interestPayment = previousDebt * averageInterestRate
  3. totalSpending = baselineSpending + sum(enabledPrograms.netCost) + interestPayment
  4. deficit = totalSpending - taxRevenue
  5. debt = previousDebt + deficit
  6. gdp = previousGDP * (1 + gdpGrowthRate + fiscalMultiplierEffect)
  7. redistributeWealth(wealthBrackets, taxPolicy, gdpGrowth)
```

### 4.2 Key Assumptions (Exposed & Adjustable in Advanced Mode)

| Assumption | Default | Range | Source |
|------------|---------|-------|--------|
| GDP growth rate | CBO baseline (~1.8%) | 0-5% | CBO 10-Year Outlook |
| Average interest rate on debt | ~3.2% | 1-8% | Treasury, CBO |
| Behavioral elasticity (tax → investment) | 0.3 | 0-1.0 | Economic literature range |
| Fiscal multiplier (spending → GDP) | 1.2 | 0.5-2.5 | CBO, IMF estimates |
| Inflation rate | ~2.5% | 0-10% | Fed target + CBO |

### 4.3 Transparency

The simulation is **explicitly labeled as illustrative, not predictive.** A persistent banner or footer states:

> "SimEcon uses a simplified economic model for illustration. Real economies are vastly more complex. All historical data is real and cited. Projections show directional trends, not forecasts."

### 4.4 Wealth Redistribution Model

Simplified model for how tax policy affects wealth concentration:

- Higher top rates → slower wealth accumulation at top brackets, redistributed to government spending
- Government spending → partial flow to lower brackets (via programs, wages, transfers)
- GDP growth affects all brackets but disproportionately benefits top brackets (historical pattern)
- Behavioral response: higher rates reduce some investment (modulated by elasticity parameter)

---

## 5. UI Design

### 5.1 Layout: Sidebar Control Panel

Dark mode. Sidebar left, visualizations right, playback bar bottom.

```
┌─────────────────────────────────────────────────────┐
│  ⚡ SimEcon                              [Share] [?] │
├──────────────┬──────────────────────────────────────┤
│              │  ┌──────┐ ┌──────┐ ┌──────┐ ┌─────┐ │
│  SCENARIO    │  │ DEBT │ │DEFCT │ │ REV  │ │D/GDP│ │
│  [dropdown]  │  └──────┘ └──────┘ └──────┘ └─────┘ │
│              │                                      │
│  TAX RATES   │  ┌──────────────────────────────────┐│
│  Top ──●── 52%  │  Debt & Deficit Over Time       ││
│              │  │  ═══════════╌╌╌╌╌╌╌╌╌           ││
│  [Advanced▾] │  │  (solid=actual, dashed=projected)││
│  CapGains    │  └──────────────────────────────────┘│
│  Corporate   │                                      │
│  Estate      │  ┌──────────────────────────────────┐│
│              │  │  Wealth Distribution Over Time   ││
│  PROGRAMS    │  │  ▓▓▓▒▒▒░░░░                     ││
│  🏥 Health ●│  │  (stacked area, 5 brackets)      ││
│  🎓 College ○│  └──────────────────────────────────┘│
│  🏠 Housing ○│                                      │
│  👶 Pre-K  ○│                                      │
│  💵 UBI    ○│                                      │
│  🔧 Infra  ○│                                      │
│              │                                      │
│  ⚙ Advanced │                                      │
├──────────────┴──────────────────────────────────────┤
│  ▶  ════════════●══════════  2024   [1x][5x][10x]  │
└─────────────────────────────────────────────────────┘
```

### 5.2 Visual Design

- **Theme:** Dark mode, dark navy/charcoal background (#0a0a1a, #1a1a2e)
- **Accent colors:**
  - Red (#e94560) — debt, top bracket, warnings
  - Amber (#f0a500) — deficit, top 1%
  - Blue (#0f3460) — projections, next 9%
  - Purple (#533483) — middle 40%
  - Teal (#4ecca3) — revenue, positive indicators
- **Typography:** Geist Sans for UI, Geist Mono for numbers/data
- **Components:** shadcn/ui primitives, customized for the dark data-viz aesthetic
- **Charts:** Recharts (React-native charting, composable)
- **Responsive:** Desktop-first (dashboard), but sidebar collapses to bottom sheet on mobile

### 5.3 Component Hierarchy

```
App
├── Header (logo, scenario quick-select, share button, help)
├── MainLayout
│   ├── Sidebar
│   │   ├── ScenarioSelector (dropdown)
│   │   ├── TaxControls
│   │   │   ├── SimpleMode (single slider)
│   │   │   └── AdvancedMode (4 sliders, collapsible)
│   │   ├── ProgramToggles (list of toggle switches)
│   │   └── AdvancedAssumptions (collapsible, power-user)
│   └── VisualizationArea
│       ├── KPICards (debt, deficit, revenue, debt-to-GDP)
│       ├── DebtDeficitChart (line/bar chart over time)
│       └── WealthDistributionChart (stacked area over time)
├── PlaybackBar (timeline, play/pause, speed, year indicator)
└── CitationPopover (triggered by clicking any data point)
```

### 5.4 Interaction Patterns

**Slider interaction:**
- Dragging a slider immediately updates all charts (no "apply" button)
- Ghost marker on each slider shows the current real-world rate
- Tooltip on hover shows: "Current: 37% | Your setting: 52% | Delta: +15%"

**Playback:**
- Historical scrubbing (2015-2025): charts replay real data year by year
- Forward simulation (2025+): charts animate projected values
- Speed control affects animation speed, not simulation granularity
- Pausing freezes all charts at the current year
- Charts show a vertical line at the current playback year

**Scenario loading:**
- Selecting a pre-built scenario populates all controls
- Modifying any control after loading switches label to "Custom (based on Nordic Model)"
- "Reset" button returns to Current Policy baseline

**URL state:**
- Every control change updates the URL hash in real-time
- Format: `#s=nordic&tr=52&cg=28&cr=25&er=50&p=health,college&y=2028&sp=5`
- Short keys to keep URLs manageable
- Loading a URL restores exact state

---

## 6. Phase 2 — Viral Features

### 6.1 Historical "What If" Mode

- Header toggle: "Simulate Forward" ↔ "Rewrite History"
- Dropdown of major policy events with year and brief description:
  - 2017: Tax Cuts and Jobs Act (top rate 39.6% → 37%, corporate 35% → 21%)
  - 2013: American Taxpayer Relief Act (restored some higher rates)
  - 2010: Tax Relief Act (extended Bush-era cuts)
  - 2003: Jobs and Growth Tax Relief (cut capital gains, dividends)
  - 2001: Economic Growth and Tax Relief (Bush tax cuts)
- Selecting an event: engine replays from that year using the counterfactual rates
- Chart overlay: actual timeline (solid) + counterfactual (dashed)
- Delta callout box: "Without the TCJA, the 2025 national debt would be approximately $X.XT lower"
- URL-encodable: `#mode=whatif&event=tcja2017`

### 6.2 Animated Sankey Money Flows

- Tab alongside bar charts: "Charts" | "Money Flow"
- Left-to-right flow visualization:
  - Source nodes: wealth brackets (sized by bracket wealth)
  - Middle: tax collection (sized by revenue from each bracket)
  - Right: spending categories (defense, healthcare, education, debt service, social programs)
- Animation:
  - During playback, flow thicknesses pulse and shift as values change year to year
  - Toggling a program on animates a new spending branch appearing
  - Raising a tax rate visibly thickens the flow from that bracket
- Library: D3-sankey or a custom SVG implementation

### 6.3 Household Impact Personas

- Collapsible panel below main charts, or tab: "National" | "Household Impact"
- 5 persona cards:

| Persona | Household Income | Net Worth |
|---------|-----------------|-----------|
| The Nurse | $65K | $80K |
| The Small Business Owner | $180K | $500K |
| The Tech Executive | $450K | $5M |
| The Hedge Fund Manager | $10M | $200M |
| The Billionaire | $50M+ | $2B+ |

- Each card shows:
  - Current effective tax rate → new effective rate under user's policy
  - Annual tax change in dollars
  - Benefits gained from enabled programs (estimated dollar value)
  - Net impact (positive = better off, negative = worse off)
- Updates live as sliders move
- Expandable detail view with methodology

### 6.4 TikTok Video Export

- "Export Video" button in playback bar
- Client-side rendering using canvas + MediaRecorder API
- Output: 15-second MP4 or WebM, 1080x1920 (9:16 vertical)
- Content:
  - Animated chart(s) running through the simulation
  - KPI cards ticking at bottom
  - Year counter
  - Policy summary text overlay (e.g., "Top rate: 52% + Universal Healthcare")
  - Watermark: "SimEcon.app — Try it yourself"
- Auto-generated share text for clipboard:
  - "What if we taxed billionaires at 52%? Watch what happens to the national debt. Try it: [URL]"
- No server needed — all rendered in browser

### 6.5 "Show Your Work" Panel

- Slide-out drawer from right edge, triggered by "Assumptions" button
- Lists every model assumption:
  - Name, current value, default value, adjustable slider
  - Source citation
  - Brief explanation of what it affects
- Methodology section (markdown):
  - How tax revenue is calculated
  - How wealth redistribution is modeled
  - Known limitations and simplifications
- Export options:
  - "Download as PDF" (for academic/policy use)
  - "Download as JSON" (for data reuse)
- "Reset all to defaults" button

---

## 7. Phase 3 — Social & Community

### 7.1 Multiplayer Debate Mode

- Backend required: lightweight WebSocket server (Vercel Functions + Vercel Queues, or a simple signaling server)
- Flow:
  1. User clicks "Start Debate" → generates a room code
  2. Shares room code/link with opponent
  3. Both players see identical starting conditions (split-screen)
  4. Each configures their own policy independently
  5. "Ready" → both hit play → simulations run side-by-side
  6. Winner: lower debt-to-GDP at end of simulation (or other metric)
- Spectator mode: read-only view of both dashboards for audience
- OBS integration: embed spectator URL in a browser source for TikTok live

### 7.2 Community Scenario Gallery

- Backend: Neon Postgres (via Vercel Marketplace)
- Auth: Sign in with Vercel (OAuth) or anonymous + claim
- Schema:

```typescript
interface SavedScenario {
  id: string;
  name: string;
  description: string;
  author: string;
  config: URLState;           // Full simulation config
  previewMetrics: {           // Snapshot for gallery cards
    debtChange: number;
    deficitChange: number;
    revenueChange: number;
  };
  votes: number;
  createdAt: string;
  tags: string[];
}
```

- Gallery views: Trending, Popular (all time), New, Staff Picks
- "Fork" button on any scenario → loads config into simulator with attribution
- Search and filter by tags, programs, tax rate ranges

### 7.3 Mobile Story Mode

- Fullscreen swipeable cards (8-10 screens)
- Progressive narrative:
  1. "The United States has $34.6 trillion in debt."
  2. "That's $X per person." (animated counter)
  3. "Here's where the money went..." (simplified spending breakdown)
  4. "And here's where the wealth went..." (bracket divergence animation)
  5. "What if you could change the rules?" (introduces the slider)
  6. Interactive: user sets one slider (top tax rate)
  7. "Watch what happens." (mini-simulation plays)
  8. "But there's more you can do..." (introduces programs)
  9. "Ready to go deeper?" → full dashboard
- Responsive: works as mobile onboarding AND desktop first-run experience
- Skip button for returning users

### 7.4 AI Narrator

- Toggle: "AI Commentary" on/off
- Implementation: AI SDK + AI Gateway (OIDC auth)
- System prompt: loaded with economic history, tax policy context, historical parallels
- Triggers:
  - Slider change (debounced 500ms): "You set the top rate to 52%. Under Eisenhower, the top rate was 91%..."
  - Program toggle: "Universal Healthcare would cost ~$X/year but could save ~$Y in reduced emergency care..."
  - Simulation milestone: "At year 2031, your policy reaches a balanced budget for the first time since..."
- Streamed into a collapsible text panel below the sidebar
- Uses AI Elements `<MessageResponse>` for rendering

---

## 8. Tech Stack

### Phase 1-2 (Static, Client-Side)

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 16 (App Router, static export) |
| UI Components | shadcn/ui + Tailwind CSS |
| Typography | Geist Sans + Geist Mono |
| Charts | Recharts (bar, line, area) |
| Sankey (Phase 2) | D3-sankey or custom SVG |
| Video Export (Phase 2) | Canvas API + MediaRecorder |
| State Management | React state + URL hash sync |
| Data | Static JSON bundles (build-time) |
| Deployment | Vercel (static) |

### Phase 3 Additions

| Layer | Technology |
|-------|-----------|
| Database | Neon Postgres (Vercel Marketplace) |
| Auth | Sign in with Vercel |
| Realtime | WebSocket via Vercel Functions |
| AI | AI SDK 6 + AI Gateway (OIDC) |
| AI UI | AI Elements (`<MessageResponse>`) |
| Queue (debate rooms) | Vercel Queues |

---

## 9. URL State Schema

Compact encoding for shareable URLs:

```
#s=nordic          // scenario ID
&tr=52             // top marginal rate
&cg=28             // capital gains rate
&cr=25             // corporate rate
&er=50             // estate rate
&p=health,college  // enabled programs (comma-separated IDs)
&y=2028            // current playback year
&sp=5              // playback speed
&m=forward         // mode: forward | whatif
&we=tcja2017       // what-if event ID (Phase 2)
&ag=1.8            // GDP growth override (advanced)
&ai=3.2            // interest rate override (advanced)
&ae=0.3            // behavioral elasticity override (advanced)
```

Defaults are omitted to keep URLs short. Loading a URL with only `#tr=70` means: Current Policy baseline with just the top rate changed to 70%.

---

## 10. File Structure

```
simecon/
├── app/
│   ├── layout.tsx              # Root layout (fonts, theme, metadata)
│   ├── page.tsx                # Main simulator page
│   └── story/                  # Phase 3: Story Mode
│       └── page.tsx
├── components/
│   ├── sidebar/
│   │   ├── Sidebar.tsx
│   │   ├── ScenarioSelector.tsx
│   │   ├── TaxControls.tsx
│   │   ├── ProgramToggles.tsx
│   │   └── AdvancedAssumptions.tsx
│   ├── visualization/
│   │   ├── KPICards.tsx
│   │   ├── DebtDeficitChart.tsx
│   │   ├── WealthDistributionChart.tsx
│   │   ├── SankeyFlow.tsx       # Phase 2
│   │   └── HouseholdPersonas.tsx # Phase 2
│   ├── playback/
│   │   ├── PlaybackBar.tsx
│   │   └── SpeedControl.tsx
│   ├── shared/
│   │   ├── CitationPopover.tsx
│   │   ├── ShowYourWork.tsx      # Phase 2
│   │   └── VideoExport.tsx       # Phase 2
│   └── story/                    # Phase 3
│       └── StoryCard.tsx
├── lib/
│   ├── engine/
│   │   ├── simulate.ts          # Core simulation loop
│   │   ├── tax-revenue.ts       # Tax revenue calculation
│   │   ├── wealth-redistribution.ts
│   │   └── what-if.ts           # Phase 2: historical replay
│   ├── data/
│   │   ├── historical.json      # Bundled historical data
│   │   ├── scenarios.ts         # Pre-built scenario configs
│   │   ├── programs.ts          # Social program definitions
│   │   └── citations.ts         # Citation metadata
│   ├── url-state.ts             # URL hash encode/decode
│   └── types.ts                 # Shared TypeScript interfaces
├── public/
│   └── og-image.png             # Default OG image
├── docs/
│   └── methodology.md           # Full model documentation
└── next.config.ts
```

---

## 11. Phasing & Dependencies

```
Phase 1 (Core Simulator)
├── Data collection & JSON bundling
├── Simulation engine
├── Sidebar controls (simple + advanced)
├── Charts (debt/deficit, wealth distribution)
├── KPI cards
├── Playback bar with animation
├── Pre-built scenarios
├── URL state encoding/sharing
├── Citation popovers
├── Responsive layout (desktop + mobile)
└── Deploy to Vercel

Phase 2 (Viral Features) — depends on Phase 1
├── Historical "What If" mode
├── Animated Sankey money flows
├── Household impact personas
├── TikTok video export
└── "Show Your Work" assumptions panel

Phase 3 (Social & Community) — depends on Phase 2
├── Backend setup (Neon Postgres, auth)
├── Multiplayer debate mode
├── Community scenario gallery
├── Mobile Story Mode
└── AI Narrator (AI SDK + AI Gateway)
```

---

## 12. Success Criteria

**Phase 1 is shippable when:**
- [ ] Dashboard loads with real historical data (2015-2025)
- [ ] Single slider mode works: drag top rate, see debt/deficit/wealth update
- [ ] Advanced mode exposes all 4 tax sliders
- [ ] At least 5 pre-built scenarios load correctly
- [ ] 6 social programs toggle on/off with cost impacts
- [ ] Playback animates historical data, then projects forward
- [ ] Speed controls work (1x, 5x, 10x)
- [ ] Every displayed number has a working citation popover
- [ ] URL state persists and restores full configuration
- [ ] Share button copies URL to clipboard
- [ ] Transparency banner is visible
- [ ] Desktop and mobile layouts work
- [ ] Loads in <2 seconds on desktop
