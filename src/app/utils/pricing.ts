export const DIRT_LEVELS = [
  { label: "Well Maintained", cost: 0 },
  { label: "Minimum", cost: 120 },
  { label: "Moderate", cost: 150 },
  { label: "Medium", cost: 200 },
  { label: "Above Average", cost: 300 },
  { label: "Extreme", cost: 500 }
];

export const SQ_FT_RANGES = [
  "0 - 500", "501 - 900", "901 - 1100", "1101 - 1300", 
  "1301 - 1500", "1501 - 1700", "1701 - 1900", "1901 - 2100", 
  "2101 - 2300", "2301 - 2500", "2501 - 2900", "2901 - 3100", 
  "3101 - 3300", "3301 - 3500", "3501 - 3700", "3701 - 3900", "3901 - 4000+"
];

const BASE_PRICES: Record<string, number[]> = {
  "Deep Cleaning": [135, 243, 297, 351, 405, 459, 567, 567, 621, 675, 783, 837, 891, 945, 999, 1053, 1080],
  "Move In/Out": [135, 243, 297, 351, 405, 459, 567, 567, 621, 675, 783, 837, 891, 945, 999, 1053, 1080],
  "Post Construction": [160, 288, 352, 416, 480, 544, 608, 672, 736, 864, 928, 992, 1056, 1120, 1184, 1248, 1312],
  "Office Cleaning": [65, 117, 143, 169, 195, 221, 247, 273, 299, 325, 377, 403, 429, 455, 481, 507, 533]
};

export const ADDON_PRICES = {
  bedrooms: 25,
  fullBathrooms: 50,
  halfBathrooms: 30,
  kitchens: 80,
  hallways: 20,
  sidewalk: 20,
  staircases: 20,
  lobby: 30,
  laundryRoom: 30,
  externalStaircase: 50
};

export interface BookingDetails {
  serviceType: string;
  dirtLevel: string;
  sqFtRangeIndex: number;
  bedrooms: number;
  fullBathrooms: number;
  halfBathrooms: number;
  kitchens: number;
  hallways: number;
  sidewalk: number;
  staircases: number;
  lobby: number;
  laundryRoom: number;
  externalStaircase: number;
}

export const calculateTotalCost = (details: BookingDetails): number => {
  let total = 0;

  // Add Dirt Level Cost
  const dirtLevelObj = DIRT_LEVELS.find(dl => dl.label === details.dirtLevel);
  if (dirtLevelObj) {
    total += dirtLevelObj.cost;
  }

  // Base Price for SQ FT
  if (details.serviceType !== "Building Cleaning") {
    const prices = BASE_PRICES[details.serviceType];
    if (prices && prices[details.sqFtRangeIndex] !== undefined) {
      total += prices[details.sqFtRangeIndex];
    }
  }

  // Add-ons
  total += details.bedrooms * ADDON_PRICES.bedrooms;
  total += details.fullBathrooms * ADDON_PRICES.fullBathrooms;
  total += details.halfBathrooms * ADDON_PRICES.halfBathrooms;
  total += details.kitchens * ADDON_PRICES.kitchens;
  total += details.hallways * ADDON_PRICES.hallways;
  total += details.sidewalk * ADDON_PRICES.sidewalk;
  total += details.staircases * ADDON_PRICES.staircases;
  total += details.lobby * ADDON_PRICES.lobby;
  total += details.laundryRoom * ADDON_PRICES.laundryRoom;
  total += details.externalStaircase * ADDON_PRICES.externalStaircase;

  return total > 0 ? total : 1; // Ensure at least 1 credit
};
