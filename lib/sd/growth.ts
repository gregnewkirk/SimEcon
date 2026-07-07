import type { SdAssumptions, SdGrowthBasis } from "./types";
import { registerSources } from "../citations";

registerSources([
  {
    id: "sd_fy26_outlook",
    agency: "City of San Diego Department of Finance",
    dataset: "FY2026-2030 Five-Year Financial Outlook (revenue growth assumptions)",
    year: 2024,
    url: "https://www.sandiego.gov/finance/annual",
    accessed: "2026-07-07",
  },
]);

/**
 * Default growth assumptions, calibrated to the city's own Five-Year Financial Outlook.
 * Property tax grows ~4%/yr (Prop 13's 2% cap on existing parcels plus turnover and new
 * construction); sales and hotel taxes track the local economy; personnel costs outrun
 * inflation because of negotiated raises and pension/benefit drift - that spread between
 * personnel growth and revenue growth IS San Diego's structural deficit.
 */
export const SD_DEFAULT_ASSUMPTIONS: SdAssumptions = {
  assessedValueGrowth: 4.0,
  salesGrowth: 2.5,
  tourismGrowth: 3.0,
  inflation: 2.5,
  personnelGrowth: 4.5,
  pensionDiscountRate: 6.5,
};

/** Annual multiplier for a budget line of the given growth basis. */
export function sdGrowthFactor(basis: SdGrowthBasis, a: SdAssumptions): number {
  switch (basis) {
    case "assessedValue":
      return 1 + a.assessedValueGrowth / 100;
    case "salesEconomy":
      return 1 + a.salesGrowth / 100;
    case "touristEconomy":
      return 1 + a.tourismGrowth / 100;
    case "cpi":
      return 1 + a.inflation / 100;
    case "personnel":
      return 1 + a.personnelGrowth / 100;
    case "computed":
    case "flat":
      return 1;
    case "oneTime":
      return 0; // gone the first projected year - the structural deficit revealed
  }
}
