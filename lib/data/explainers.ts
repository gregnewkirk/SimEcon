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
  // ─── Experimental Programs ───
  wealth_tax: {
    title: "Wealth Tax",
    simple: "Tax the super-rich on what they OWN, not just what they earn. 2% on wealth over $50M, 3% over $1B. Raises ~$250B/yr.",
    detail: "The top 0.1% holds more wealth than the bottom 90% combined. Income taxes miss most of this because the wealthy hold assets, not salaries. A 2% annual tax on net worth above $50M (3% above $1B) would generate ~$250B/yr. Norway, Spain, and Switzerland have versions. Enforcement uses IRS wealth reporting. Economists Saez & Zucman at UC Berkeley designed the model.",
  },
  sports_betting_tax: {
    title: "Federal Sports Betting Tax",
    simple: "Tax the booming sports gambling industry at 15%. Americans bet $120B+/yr — might as well fund schools with it.",
    detail: "Legal sports betting has exploded since the 2018 Supreme Court ruling. Americans wagered $120B+ in 2024. Currently, states tax this at wildly different rates (6-51%). A federal 15% tax on gross gaming revenue would generate ~$18B/yr. This is a voluntary sin tax — nobody has to gamble. The UK has taxed betting at 15% for decades.",
  },
  robot_tax: {
    title: "Automation / Robot Tax",
    simple: "When a company replaces a human worker with AI or a robot, they pay a fee. Funds retraining for displaced workers.",
    detail: "Bill Gates proposed taxing robots at the same rate we tax the human workers they replace. As AI automates millions of jobs (McKinsey estimates 30% of hours worked by 2030), the income tax base erodes. A displacement fee of ~$25K per automated position funds retraining and generates ~$50B/yr. South Korea reduced its automation tax incentives in 2018 — a step in this direction.",
  },
  sugar_tax: {
    title: "Sugar / Junk Food Tax",
    simple: "A 20% tax on sugary drinks and ultra-processed food. Raises $30B AND cuts healthcare costs by reducing obesity and diabetes.",
    detail: "Obesity costs the U.S. healthcare system $173B/yr. A 20% tax on sugary drinks and ultra-processed foods generates ~$30B/yr in direct revenue while reducing consumption 10-15%. Mexico's 2014 sugar tax cut soda consumption 12%. The UK's sugar levy reduced sugar in drinks 44%. Long-term healthcare savings of $50-80B/yr as obesity-related disease declines.",
  },
  land_value_tax: {
    title: "Federal Land Value Tax",
    simple: "Tax the land, not the building on it. Discourages empty lots and speculation, encourages building homes and businesses.",
    detail: "A 1% tax on unimproved land value (not structures). Milton Friedman called it 'the least bad tax' because it doesn't distort economic behavior — you can't create more land. It encourages development (building adds no tax) and discourages speculation (holding empty lots costs money). Generates ~$100B/yr. Used in parts of Pennsylvania, Denmark, Estonia, and Singapore.",
  },
  baby_bonds: {
    title: "Baby Bonds",
    simple: "Every newborn gets $1,000 in a government savings account that grows until they turn 18. Costs just $4B/yr.",
    detail: "Senator Cory Booker's proposal: $1,000 at birth plus up to $2,000/yr for low-income families, invested in a government-managed index fund. By 18, accounts could reach $20,000-$50,000. Estimated to close the racial wealth gap by 50% in one generation. Cost: ~$4B/yr — one of the cheapest programs with the highest long-term ROI. Connecticut and DC have pilot programs.",
  },
  mental_health: {
    title: "Federal Mental Health Corps",
    simple: "Free therapy for every American. 1 in 5 adults has a mental health condition, and untreated illness costs $280B/yr in lost productivity.",
    detail: "A national mental health service providing free therapy, counseling, and crisis intervention. The U.S. has 350,000 therapists but needs 500,000+. Program trains and deploys 150,000 new mental health workers, especially in rural areas. Cost: ~$50B/yr. But untreated mental illness costs $280B/yr in lost productivity, $100B in criminal justice costs, and $50B in homelessness services. Net economic benefit is strongly positive.",
  },
  public_internet: {
    title: "Federal Public Internet",
    simple: "Treat broadband like electricity — a public utility. 42 million Americans don't have it. Municipal broadband is faster AND cheaper.",
    detail: "42M Americans lack broadband access. Rural areas and low-income neighborhoods are worst hit. Municipal broadband (like Chattanooga, TN) delivers 10Gbps at $70/mo — private ISPs charge more for 1/10th the speed. A federal program building infrastructure in underserved areas costs ~$40B/yr for 10 years. Internet access is now essential for education, healthcare, and economic participation.",
  },
  green_jobs: {
    title: "Green Jobs Corps",
    simple: "A modern version of FDR's Civilian Conservation Corps — 1 million government jobs building solar farms, restoring ecosystems, and climate-proofing infrastructure.",
    detail: "During the Great Depression, the CCC employed 3M young men in conservation work. A modern version would create 1M+ jobs in renewable energy installation, ecosystem restoration, wildfire prevention, and climate resilience infrastructure. Cost: ~$60B/yr. Creates jobs in coal/oil communities hit by the energy transition. Every $1 in clean energy investment creates 3x more jobs than fossil fuel investment.",
  },
  rd_moonshot: {
    title: "R&D Moonshot Fund",
    simple: "Triple federal research spending. The internet, GPS, mRNA vaccines, and touchscreens ALL came from government-funded research.",
    detail: "Federal basic research funding is ~$100B/yr — down from 2% of GDP in the 1960s to 0.7% today. Every $1 of federal R&D generates $4-8 in economic returns. The internet (DARPA), GPS (DoD), mRNA vaccines (NIH), touchscreens (DOE), Google's PageRank (NSF grant) — all government-funded research. Tripling the budget to ~$300B/yr costs $200B/yr additional but could generate $800B-$1.6T in economic returns over a decade.",
  },
};
