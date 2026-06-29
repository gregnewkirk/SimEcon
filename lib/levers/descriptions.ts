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
};
