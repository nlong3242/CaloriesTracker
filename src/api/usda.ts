// USDA FoodData Central API — no key required for basic search
const BASE_URL = 'https://api.nal.usda.gov/fdc/v1';
const API_KEY = 'DEMO_KEY'; // Rate: 30 req/hr. Replace with free key from https://fdc.nal.usda.gov/api-key-signup.html

export interface UsdaFood {
  fdcId: number;
  description: string;
  brandOwner?: string;
  brandName?: string;
  servingSize?: number;
  servingSizeUnit?: string;
  foodNutrients: UsdaNutrient[];
}

export interface UsdaNutrient {
  nutrientId: number;
  nutrientName: string;
  unitName: string;
  value: number;
}

export interface UsdaSearchResult {
  fdcId: number;
  description: string;
  brandOwner?: string;
  brandName?: string;
  dataType: string;
  servingSize?: number;
  servingSizeUnit?: string;
  foodNutrients: Array<{
    nutrientId: number;
    nutrientName: string;
    unitName: string;
    value: number;
  }>;
}

// USDA nutrient IDs we care about
const NUTRIENT_MAP: Record<number, string> = {
  1008: 'calories',
  1003: 'protein_g',
  1005: 'carbs_g',
  1004: 'fat_g',
  1079: 'fiber_g',
  2000: 'sugar_g',
  1093: 'sodium_mg',
  1258: 'saturated_fat_g',
  1253: 'cholesterol_mg',
  1106: 'vitamin_a_mcg',
  1162: 'vitamin_c_mg',
  1114: 'vitamin_d_mcg',
  1087: 'calcium_mg',
  1089: 'iron_mg',
  1092: 'potassium_mg',
};

export interface ParsedNutrients {
  calories: number;
  protein_g: number;
  carbs_g: number;
  fat_g: number;
  fiber_g: number;
  sugar_g: number;
  sodium_mg: number;
  saturated_fat_g: number;
  cholesterol_mg: number;
  vitamin_a_mcg: number;
  vitamin_c_mg: number;
  vitamin_d_mcg: number;
  calcium_mg: number;
  iron_mg: number;
  potassium_mg: number;
}

export function parseNutrients(nutrients: UsdaSearchResult['foodNutrients']): ParsedNutrients {
  const result: ParsedNutrients = {
    calories: 0, protein_g: 0, carbs_g: 0, fat_g: 0, fiber_g: 0,
    sugar_g: 0, sodium_mg: 0, saturated_fat_g: 0, cholesterol_mg: 0,
    vitamin_a_mcg: 0, vitamin_c_mg: 0, vitamin_d_mcg: 0,
    calcium_mg: 0, iron_mg: 0, potassium_mg: 0,
  };
  for (const n of nutrients) {
    const key = NUTRIENT_MAP[n.nutrientId];
    if (key) {
      (result as unknown as Record<string, number>)[key] = n.value ?? 0;
    }
  }
  return result;
}

export async function searchFoods(query: string, pageSize = 25): Promise<UsdaSearchResult[]> {
  const params = new URLSearchParams({
    query,
    dataType: 'Foundation,SR Legacy,Branded',
    pageSize: String(pageSize),
    api_key: API_KEY,
  });
  const res = await fetch(`${BASE_URL}/foods/search?${params}`);
  if (!res.ok) throw new Error(`USDA search failed: ${res.status}`);
  const data = await res.json();
  return data.foods ?? [];
}

export async function getFoodById(fdcId: number): Promise<UsdaFood> {
  const res = await fetch(`${BASE_URL}/food/${fdcId}?api_key=${API_KEY}`);
  if (!res.ok) throw new Error(`USDA food fetch failed: ${res.status}`);
  return res.json();
}
