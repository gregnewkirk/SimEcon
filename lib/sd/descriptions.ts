/**
 * Plain-English descriptions for every San Diego lever, kept separate from the scoring so
 * copy edits never touch numbers. Same convention as lib/levers/descriptions.ts.
 */
export const SD_LEVER_DESCRIPTIONS: Record<string, string> = {
  // Police
  sworn_officers:
    "SDPD budgets 2,040 sworn positions but only ~1,797 were filled as of spring 2025 - the city already banks the vacancy savings. This dial moves the budgeted force at roughly $200K per officer fully loaded (the city says just recruiting and training one costs $191K in year one). Cutting positions the department can't fill anyway saves paper money; cutting real officers changes response times.",
  police_overtime:
    "The FY2026 overtime budget is $45.3M, and SDPD has blown through its OT budget in 10 of the last 11 years (FY2023: $40.2M budgeted, $50.8M spent). One officer collected $1.28M in OT over five years. The city auditor found no cap on hours, with fatigue risks. Cutting the budget without fixing staffing just moves the overrun.",
  police_raise:
    "Police raises are the main driver of the department's +$28.6M personnel growth in FY2026, and raises are pensionable - the 2025 raises added over $140M to the long-term pension liability. Negative values model a pay freeze (recruiting suffers; SDPD already loses ~150 officers a year).",
  civilianization:
    "The chief himself says civilian vacancies (32 dispatchers, 31 parking enforcement, 113 investigative aides) force sworn officers onto desk work and swell overtime. Filling those roles with civilians costs less per seat and frees officers for patrol. Savings estimates are genuinely contested - hence the badge.",
  police_nonpersonnel:
    "Fleet, fuel, equipment, and contracts - roughly $85M of the police budget that isn't a person. A percentage cut here is the classic 'cut without touching staffing' move, and it has real limits: aging fleets and radios come back as bigger bills.",

  // Departments
  library_days:
    "The FY2026 budget closed all 37 branches on Sundays and Mondays to save just over $8M; the Council later bought Monday back at 16 branches. Each day of citywide service costs about $4M a year. San Diegans checked out 5M+ items last year.",
  rec_hours:
    "The April 2025 proposal cut every rec center from 60 to 40 hours a week (~$10M); the Council restored the hours after public backlash. This dial replays that fight.",
  close_restrooms:
    "Closing dozens of beach and park restrooms was scored at ~$1.7M/yr during the FY2026 debate. The Council kept most open. Cheap on paper, visible in every headline.",
  fire_academies:
    "The FY2026 proposal eliminated a fire academy and trimmed helicopter staffing. Each academy costs ~$3M and is the only pipeline for future firefighters - skip years show up as vacancies and overtime later (ask the police department).",
  street_paving:
    "The city paved ~390 lane miles in FY2026 (~$83M program). Average street condition is 63/100 against a goal of 70. Extra money moves the needle at roughly $215K per lane mile; deferring it is how the $6.5B infrastructure backlog got built.",
  stormwater_invest:
    "Stormwater has a $4B+ five-year need and no dedicated revenue. The system that failed in the January 2024 floods (1,200+ displaced, 50+ lawsuits) gets maintained at ~4 of 200 channel segments a year. The FY2026 draft actually CUT stormwater ~$14M before partial restoration.",
  tree_trimming:
    "Shade trees are on a 20+ year pruning cycle against a 7-year industry standard. Restoring it costs ~$6M/yr across ~250K street trees. Falling limbs are a liability line item too.",
  homeless_shelters:
    "The $71.1M General Fund homelessness program funds 17 shelters, safe parking, and outreach ($105.3M with state grants). This dial scales it. Note the causality debate: shelter cuts can shift costs to police, ERs, and courts rather than save them.",
  vacancy_holds:
    "The Council funded its FY2026 restorations partly by leaving executive and management vacancies unfilled (~$25M). Free-feeling money that quietly degrades service delivery - the classic one-time fix.",

  // Revenue
  sales_tax_measure:
    "Measure E (Nov 2024) - a 1-cent general sales tax worth ~$400M/yr - failed by ~3,500 votes out of 573,000. A quarter-cent is ~$100M. Needs a simple majority at the ballot; sales taxes fall hardest on lower-income households.",
  tot_hike:
    "The General Fund keeps 5.5¢ of the 10.5% hotel tax (~$170M). Each extra cent is ~$31M, paid mostly by visitors. Hotel-tax hikes have a rough electoral history here (Measure C 2016 for the stadium: 43%).",
  stormwater_parcel_tax:
    "The parcel tax the Council withdrew in July 2024 before it reached the ballot: ~$129.6M/yr dedicated to flood control. It would have needed two-thirds approval, so passage was never a sure thing.",
  cannabis_rate:
    "The rate went from 8% to 10% in May 2025; FY2026 assumed $21.3M and receipts are running ~$1.5M short - legal shops compete with the untaxed market, so each point yields a bit less than the last.",
  parking_expansion:
    "The FY2026 parking package doubled meter rates to $2.50/hr and added Sunday enforcement and surge pricing (+$18.4M planned; actuals are tracking under). This toggle models a further ~$12M expansion - meters in new neighborhoods, stricter enforcement.",
  repeal_trash_fee:
    "For 103 years the People's Ordinance made single-family trash pickup 'free' (paid by everyone's General Fund taxes). Measure B (2022) allowed a fee; the $43.60/mo fee took effect July 2025, moving $80.8M off the General Fund. Flip this to bring the subsidy back - and the hole with it.",
  repeal_balboa_parking:
    "Paid parking at Balboa Park and the Zoo was budgeted at $15.5M in FY2026. A 2026 legal settlement already partially rolled it back. Popular to repeal, expensive to lose.",
  franchise_renegotiation:
    "SDG&E was the only bidder for the 2021 franchise - twice - and bid exactly the $80M minimum. City studies say public power could save households ~$500/yr; SDG&E's study says the grid would cost $9.3B to buy. The $20M/yr here is a deliberately modest stand-in for unclaimed leverage; the honest range is enormous and disputed.",

  // New ideas from other cities
  mansion_tax:
    "LA's Measure ULA (2023): 4%/5.5% on property sales over $5M/$10M. Projected $600M-1.1B/yr; actually collects ~$288M/yr, because $5M+ transactions dropped 30-50% - a real Laffer lesson. Scaled to San Diego's thinner luxury market: ~$13M per point, ~$52M at LA's 4%. Citizen-initiative transfer taxes need only a simple majority in California.",
  pied_a_terre:
    "New York enacted this in May 2026 (effective July 1): an annual surcharge on $5M+ homes that aren't a primary residence, projected $350-500M/yr there. San Diego's supply of $5M second homes is much thinner (~$15M/yr modeled). Sobering local fact: SD's broader Measure A empty-homes tax just failed 56.5-43.9 in June 2026, and San Francisco's was struck down in court.",
  payroll_tax:
    "Seattle's JumpStart (2020): 0.7-2.4% on salaries over ~$150K at large employers. Real money - $360M in 2024 - but volatile: it came in $47M under forecast when Amazon cut 5,000 Seattle jobs. San Diego's corporate payroll base (Qualcomm, Illumina, biotech) is smaller and HQ-light: ~$48M per point modeled, with the same relocation risk.",
  streaming_tax:
    "Chicago taxes streaming subscriptions (10.25%) and cloud/SaaS leases (15% from 2026), several hundred million a year all-in. No California city has one; Prop 218's voter-approval rules and the lack of an SD utility-users tax to piggyback make this legally adventurous. Modeled at $65M/yr - half the naive Chicago scaling - to reflect that.",
  delivery_fee:
    "Colorado charges ~28 cents per retail delivery statewide: $93M in FY2024. A San Diego city version scaled by population is ~$20M/yr. Every Amazon box and DoorDash run pays; retailers hate administering it. No major city has done it alone yet.",
  naming_rights:
    "San Diego already sold the trolley's Blue Line name to UCSD Health ($30M over 30 years). Salesforce paid $110M over 25 for a San Francisco transit center. Squeezing libraries, rec centers, and bridges for sponsorships nets a modeled ~$3M/yr - real, but budget dust.",
  muni_grocery:
    "Mamdani's New York allocated $70M for five city-owned groceries (first two sites announced 2026, none open yet); Atlanta's Azalea Fresh Market opened 2025 as a city-financed, privately-run store with 150K+ customers in year one. Small-town precedents are rough: Baldwin, FL closed after never breaking even. Modeled as a 2-store SD pilot: ~$28M capital amortized plus subsidy, ~$6M/yr. The evidence says partner with an operator; don't run it yourself.",
  guaranteed_income:
    "Stockton's SEED gave 125 residents $500/mo for two years: full-time employment rose 28%->40% in year one, mental health improved. San Diego already ran one - 150 families in Paradise Hills, Encanto, National City, San Ysidro (2022-24) - but philanthropy and the state paid, not the General Fund. This dial funds it municipally at $6,000/family/yr.",
  free_buses:
    "The Mamdani flagship that hasn't happened: NYC's free-bus pilot ended in 2024 and the citywide version is still unfunded in 2026. San Diego's wrinkle is bigger: MTS is a regional agency the city doesn't control, so 'free buses' means buying out ~$60M/yr of fares the city doesn't collect. Ridership would jump; the check is annual and forever.",

  // Pension
  pension_payment:
    "The full FY2026 pension bill was $533M citywide (~$378M General Fund) against a $3.4B unfunded liability. Slide left to pay less - exactly what the city did in 1996 (MP1) and 2002 (MP2) when it was 92% funded, which is how the hole got dug. Slide right to pay it down early and watch future bills shrink. The compounding is the whole game.",
};
