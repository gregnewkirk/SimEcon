export const EXPLAINERS: Record<string, { title: string; simple: string; detail: string }> = {
  // Programs
  healthcare: {
    title: "Universal Healthcare",
    simple: "Everyone gets health insurance paid by taxes, like Medicare but for all ages. No more premiums, deductibles, or surprise bills.",
    detail: "A single-payer system where the federal government replaces private insurance. You pay through taxes instead of premiums. CBO estimates the gross cost is $3.5T/yr but saves $3.05T in eliminated premiums, deductibles, and administrative overhead — net cost ~$450B/yr. Countries like Canada, UK, and Australia have versions of this.",
  },
  college: {
    title: "Free Public College",
    simple: "Public universities and community colleges become tuition-free for families under $125K/year.",
    detail: "Covers tuition at all public 2-year and 4-year institutions. Room and board are not included. Cost: ~$80B/yr. For comparison, the federal government already spends ~$150B/yr on student financial aid. Many European countries (Germany, Norway, Sweden) already have free public universities.",
  },
  ss_cap: {
    title: "Remove Social Security Tax Cap",
    simple: "Right now, you only pay Social Security tax on your first $168,000 of income. This removes that cap so millionaires pay the same rate as everyone else.",
    detail: "The Social Security payroll tax is 12.4% (split employer/employee) but only applies to the first ~$168K of earnings. A person making $168K and a person making $10M pay the same dollar amount. Removing the cap generates ~$150B/yr and extends Social Security solvency by 40+ years. About 6% of workers earn above the cap.",
  },
  irs_enforcement: {
    title: "IRS Enforcement Funding",
    simple: "Hire more IRS agents to catch wealthy tax cheats. For every $1 spent, the government recovers $5-6 in unpaid taxes.",
    detail: "The IRS estimates a $600B+ annual 'tax gap' — taxes legally owed but not collected. Most of this comes from wealthy individuals and businesses with complex returns. The 2022 Inflation Reduction Act allocated $80B over 10 years for enforcement, but political pushback has reduced funding. Sustained investment at $15B/yr could recover ~$90B/yr.",
  },
  defense_cut: {
    title: "Defense Budget Reduction",
    simple: "Cut 10% from the ~$900B/yr military budget. That's still more than the next 10 countries combined.",
    detail: "The U.S. spends more on defense than China, India, UK, Russia, France, Germany, Saudi Arabia, Japan, South Korea, and Australia combined. A 10% cut (~$100B/yr) could come from base closures, equipment modernization reform, and reducing overseas deployments while maintaining core capabilities.",
  },
  carbon_tax: {
    title: "Carbon Tax",
    simple: "Companies pay $25 per ton of CO2 they emit. This makes clean energy cheaper by comparison and raises ~$120B/yr.",
    detail: "A $25/ton carbon tax rising 5% annually. CBO estimates ~$120B/yr in revenue. Also reduces carbon emissions 10-15%. 46 countries already have some form of carbon pricing. Revenue can offset costs to low-income households via rebates (a 'carbon dividend').",
  },
  financial_tx_tax: {
    title: "Financial Transaction Tax",
    simple: "A tiny 0.1% tax on every stock trade. You'd barely notice it, but it raises $55B/yr from Wall Street.",
    detail: "A 0.1% tax on stock, bond, and derivative transactions. Used in 40+ countries — the UK has a 0.5% stamp duty on stocks since 1694. Mainly affects high-frequency traders who execute millions of trades per second. Long-term investors (401k, index funds) barely affected. CBO estimates ~$55B/yr.",
  },
  medicare_negotiation: {
    title: "Medicare Drug Negotiation",
    simple: "Let Medicare negotiate drug prices like the VA already does. The VA pays 40-50% less for the same drugs.",
    detail: "Until the 2022 Inflation Reduction Act, Medicare was banned from negotiating drug prices. The IRA allows negotiation for 20 drugs. Expanding this to all Medicare drugs could save ~$100B/yr. The VA already negotiates and pays dramatically less. The U.S. pays 2-3x more for drugs than other developed countries.",
  },
  ubi: {
    title: "Universal Basic Income",
    simple: "$1,000/month to every American adult, no strings attached. Costs $2.8 trillion/year — more than total federal revenue.",
    detail: "$12,000/year to each of ~233M adults. At $2.8T/yr, this exceeds the entire federal income tax revenue. Most serious UBI proposals pair it with a VAT, wealth tax, or elimination of existing safety net programs to offset the cost. Alaska has a mini-UBI (the Permanent Fund Dividend, ~$1,600/yr) funded by oil revenue.",
  },
  infrastructure: {
    title: "Infrastructure Modernization",
    simple: "Fix America's crumbling roads, bridges, water pipes, and power grid. We're $3.7 trillion behind on maintenance.",
    detail: "ASCE's 2025 Report Card gives U.S. infrastructure a C- grade. The $3.7T investment gap over 2024-2033 (~$370B/yr) covers roads, bridges, broadband, water systems, and the electric grid. The 2021 IIJA provided ~$240B/yr but authorizations expire in 2026. Every $1 invested in infrastructure generates $1.50-$2.00 in economic returns.",
  },
  housing: {
    title: "Affordable Housing",
    simple: "Build 2 million affordable homes and expand rental assistance for families spending over 30% of income on housing.",
    detail: "The U.S. is short ~7 million affordable housing units. 10.8 million renter households spend over 50% of income on housing. The program funds construction of 2M+ units over 10 years plus expanded Section 8 vouchers. Cost: ~$75B/yr. Housing unaffordability is the #1 driver of homelessness and a major drag on economic mobility.",
  },
  prek: {
    title: "Universal Pre-K",
    simple: "Free preschool for all 3 and 4 year olds. Studies show every $1 spent returns $7 in reduced crime and higher future earnings.",
    detail: "Universal access to quality pre-kindergarten for all 3 and 4 year olds. Currently only 34% of 3-year-olds and 43% of 4-year-olds attend preschool. The Perry Preschool Study and others show long-term ROI of $7-$12 per $1 invested through reduced crime, higher earnings, and lower welfare usage. Cost: ~$40B/yr.",
  },
  // What-if events
  tcja2017: {
    title: "Tax Cuts and Jobs Act (2017)",
    simple: "The 2017 tax cuts mostly benefited corporations and high earners. CBO estimated they'd add $1.9 trillion to the debt over 10 years.",
    detail: "Lowered the corporate rate from 35% to 21% (permanent) and the top individual rate from 39.6% to 37% (temporary, expiring 2025). CBO estimated $1.9T added to deficits over 10 years. Tax Policy Center found 83% of benefits went to the top 1% by 2027. The individual cuts are set to expire in 2025 unless extended.",
  },
  egtrra2001: {
    title: "Bush Tax Cuts (2001)",
    simple: "The 2001 tax cuts turned a budget surplus into a deficit. They cost $1.35 trillion over 10 years in lost revenue.",
    detail: "Passed during a transition from budget surpluses to deficits. Reduced the top rate from 39.6% to 35%, created a new 10% bracket, and increased the child tax credit. CBO estimated $1.35T in revenue reduction over 10 years. The U.S. had a budget surplus in 2000 ($236B) — it was gone by 2002.",
  },
  iraq2003: {
    title: "Iraq War (2003-2011)",
    simple: "The Iraq War cost $1.9 trillion total — that's $5,758 per American, or enough to fund free college for 23 years.",
    detail: "U.S. military operations in Iraq from March 2003 through December 2011. Direct DoD spending: $815B. Including State Department ops, veterans' care, and interest on war-related borrowing: $1.9T total (Watson Institute, Brown University). Peak deployment: 170,000 troops in 2007. No WMDs were found.",
  },
  afghanistan2001: {
    title: "Afghanistan War (2001-2021)",
    simple: "The longest war in U.S. history cost $2.3 trillion over 20 years — $6,970 per American.",
    detail: "U.S. operations from October 2001 through August 2021. Direct DoD spending: $933B. Total including veterans' care and interest: $2.3T (Watson Institute). Peak deployment: 100,000 troops in 2011. The Taliban retook control within weeks of U.S. withdrawal.",
  },
  covid2020: {
    title: "COVID Relief Spending (2020-2021)",
    simple: "Six major relief bills totaling $5.2 trillion — stimulus checks, PPP loans, expanded unemployment. The largest peacetime spending in U.S. history.",
    detail: "Across six bills signed by Presidents Trump and Biden: CARES Act ($2.2T), Consolidated Appropriations ($900B), American Rescue Plan ($1.9T), plus others. Funded $1,200 + $600 + $1,400 stimulus checks, $800B in PPP loans, expanded unemployment, healthcare funding, and state/local aid. Contributed significantly to 2021-2023 inflation.",
  },
  tarp2008: {
    title: "Bank Bailouts / TARP (2008)",
    simple: "The government spent $450 billion bailing out banks that caused the financial crisis. Most was repaid, but the net cost to taxpayers was ~$31 billion.",
    detail: "The Troubled Asset Relief Program authorized $700B, disbursed $443B. Most was repaid with interest — CBO estimated net taxpayer cost of ~$31B. Broader bailout-related programs (AIG, auto industry, Fannie/Freddie) brought total net federal outlay to ~$450B. The crisis itself cost the economy an estimated $12.8T in lost output.",
  },
};
