/**
 * Plain-English explanation for each lever, shown in the click-to-open detail panel.
 * Keyed by lever id. Kept separate from scoring logic so copy can evolve independently.
 */
export const LEVER_DESCRIPTIONS: Record<string, string> = {
  // Income brackets
  b1: "The 10% bracket on the first dollars of taxable income. Changing it touches nearly every filer.",
  b2: "The 12% bracket. Covers most working- and lower-middle-class taxable income.",
  b3: "The 22% bracket, roughly the middle class.",
  b4: "The 24% bracket, upper-middle income.",
  b5: "The 32% bracket, high earners below the top tiers.",
  b6: "The 35% bracket, just under the top rate.",
  topRate: "The top marginal rate on income above ~$578K. Only the income above that line is taxed at this rate.",
  corpRate: "The federal corporate income tax rate. Was cut from 35% to 21% by the 2017 TCJA.",
  removeSsCap: "Social Security tax (12.4%) only applies to the first ~$168.6K of wages. Removing the cap taxes all wages and extends SS solvency.",
  capGains: "The tax rate on profits from selling assets. Revenue peaks near 28-30%: push it higher and investors simply realize fewer gains.",
  estateRate: "The tax on estates above the exemption (~$13.6M). Affects a few thousand estates a year.",

  // Programs (spending)
  healthcare: "Single-payer health care replacing private insurance. Gross cost is offset by eliminating premiums and administrative overhead; the figure here is the net.",
  ubi: "$1,000/month to every adult (~233M people). At $2.8T/yr it exceeds total individual income tax. Most real proposals pair it with a VAT or program replacement, not modeled here.",
  college: "Tuition-free public 2- and 4-year college for families under ~$125K.",
  prek: "Free pre-K for all 3- and 4-year-olds. Long-run ROI estimated at ~$7 per $1 via higher earnings and lower crime.",
  housing: "2M+ affordable units over a decade plus expanded rental assistance.",
  infrastructure: "Closes the ASCE-estimated ~$3.7T investment gap (~$370B/yr) in roads, bridges, water, grid, and broadband.",
  rd_moonshot: "Triples federal basic research. Government R&D seeded the internet, GPS, and mRNA vaccines; returns are estimated at $4-8 per $1.",
  mental_health: "Federal therapy and counseling access. Untreated mental illness costs ~$280B/yr in lost productivity.",
  public_internet: "Treats broadband as a utility in underserved areas. 42M Americans lack broadband today.",
  green_jobs: "A modern CCC: ~1M jobs in renewable energy and climate resilience.",
  baby_bonds: "$1,000 at birth in a government investment account, growing to age 18. Estimated to cut the racial wealth gap by ~50% in a generation.",

  // Revenue and savings options
  irs_enforcement: "Sustained IRS enforcement funding. CBO estimates every $1 returns $5-6 by closing the ~$600B/yr tax gap.",
  defense_cut: "A ~10% cut to the ~$900B defense budget via base closures and procurement reform.",
  carbon_tax: "A $25/ton carbon tax rising 5%/yr. Raises revenue and cuts emissions 10-15%; rebates to low-income households are not modeled.",
  financial_tx_tax: "A 0.1% tax on stock, bond, and derivative trades. Used in 40+ countries; barely touches long-term investors.",
  medicare_negotiation: "Expands Medicare drug-price negotiation to all drugs. The VA already negotiates and pays 40-50% less.",
  wealth_tax: "2% on net worth above $50M, 3% above $1B. Revenue is genuinely disputed: Saez-Zucman estimate far more than Summers-Sarin.",
  sports_betting_tax: "A 15% federal tax on a $120B+ and growing sports-gambling market.",
  robot_tax: "A displacement fee on automation that replaces workers, funding retraining. Proposed by Bill Gates.",
  sugar_tax: "A 20% tax on sugary drinks and ultra-processed food. Mexico's version cut soda consumption 12%.",
  land_value_tax: "A 1% tax on unimproved land value (not buildings). Milton Friedman called it 'the least bad tax.'",

  // Next-gen spending moonshots
  child_tax_credit: "A permanent $300/month per child, fully refundable. The 2021 version cut child poverty ~40% in six months before it expired. ~$110B/yr.",
  child_care: "Caps child care at 7% of income for families and funds early learning for ages 0-5. Care often costs more than college today.",
  paid_leave: "Federal paid family and medical leave. The US is the only wealthy country without it; ~$250B/yr depending on design.",
  job_guarantee: "A standing federal offer of a public job at a living wage to anyone who wants one. ~$500B/yr gross, partly offset by lower safety-net spending.",
  school_meals: "Free breakfast and lunch for every public-school student, no paperwork. ~$25B/yr, and it ends lunch debt.",

  // The giants people underestimate
  vat5: "A 5% value-added tax, the consumption tax every other rich country uses. At ~$1.4T/yr it is the single largest untapped federal revenue source. Regressive unless paired with rebates (not modeled).",
  cap_employer_health: "The exclusion of employer health insurance from taxable income is the single largest tax break in the code (~$300B/yr) and almost invisible. Capping it claws back a big chunk.",
  billionaire_min_tax: "A 25% minimum tax on the income of households worth over $100M, counting unrealized gains. Targets billionaires who borrow against stock instead of selling. Different from a wealth tax: it taxes gains, not net worth.",
  buyback_tax: "Raises the 2022 stock-buyback excise tax from 1% to 4%. Corporations spend ~$1T/yr buying back their own shares to lift the stock price.",

  // The reveals people overestimate
  carried_interest: "Lets private-equity and hedge-fund managers pay the lower capital-gains rate on fees that are really wages. Famous and hated, but closing it raises only ~$1.5B/yr. Mostly symbolic.",
  end_fossil_subsidies: "Repeals explicit federal tax preferences for oil, gas, and coal (intangible drilling costs, percentage depletion). Only ~$15B/yr: the 'trillions' figure people cite is the IMF's implicit, unpriced-pollution number, not a federal line item.",
  cannabis_tax: "Legalize cannabis federally and tax it like alcohol or tobacco. A growing legal market; ~$10B/yr in federal excise.",
};
