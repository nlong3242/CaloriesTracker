// USDA FoodData Central API
// Personal keys come from https://fdc.nal.usda.gov/api-key-signup.html and
// raise the rate limit from 30/hr (shared DEMO_KEY) to 1000/hr per IP.
import * as SecureStore from 'expo-secure-store';

const BASE_URL = 'https://api.nal.usda.gov/fdc/v1';
const STORAGE_KEY = 'usda_api_key';
const FALLBACK_KEY = 'DEMO_KEY';

let cachedKey: string | null = null;

async function loadKey(): Promise<string> {
  if (cachedKey !== null) return cachedKey;
  const stored = await SecureStore.getItemAsync(STORAGE_KEY);
  cachedKey = stored ?? FALLBACK_KEY;
  return cachedKey;
}

export async function getUsdaApiKey(): Promise<string | null> {
  return SecureStore.getItemAsync(STORAGE_KEY);
}

export async function saveUsdaApiKey(key: string): Promise<void> {
  await SecureStore.setItemAsync(STORAGE_KEY, key);
  cachedKey = key;
}

export async function deleteUsdaApiKey(): Promise<void> {
  await SecureStore.deleteItemAsync(STORAGE_KEY);
  cachedKey = null;
}

export class UsdaApiError extends Error {
  status: number;
  constructor(status: number, message: string) {
    super(message);
    this.status = status;
    this.name = 'UsdaApiError';
  }
}

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

// USDA nutrient IDs we care about. Energy is handled separately because USDA
// uses multiple IDs depending on the food's data type (Foundation vs Branded
// vs SR Legacy), and some entries only carry one of them.
const NUTRIENT_MAP: Record<number, Exclude<keyof ParsedNutrients, 'calories'>> = {
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

// Priority order: prefer reported calories, then Atwater General, then Atwater Specific.
const CALORIE_NUTRIENT_IDS = [1008, 2047, 2048];

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
  for (const id of CALORIE_NUTRIENT_IDS) {
    const found = nutrients.find(n => n.nutrientId === id);
    if (found?.value) { result.calories = found.value; break; }
  }
  if (!result.calories && (result.protein_g || result.carbs_g || result.fat_g)) {
    result.calories = Math.round(result.protein_g * 4 + result.carbs_g * 4 + result.fat_g * 9);
  }
  return result;
}

export async function searchFoods(query: string, pageSize = 25): Promise<UsdaSearchResult[]> {
  const apiKey = await loadKey();
  const params = new URLSearchParams({
    query,
    dataType: 'Foundation,SR Legacy,Branded',
    pageSize: String(pageSize),
    api_key: apiKey,
  });
  const res = await fetch(`${BASE_URL}/foods/search?${params}`);
  if (!res.ok) throw new UsdaApiError(res.status, `USDA search failed: ${res.status}`);
  const data = await res.json();
  return data.foods ?? [];
}

export async function getFoodById(fdcId: number): Promise<UsdaFood> {
  const apiKey = await loadKey();
  const res = await fetch(`${BASE_URL}/food/${fdcId}?api_key=${apiKey}`);
  if (!res.ok) throw new UsdaApiError(res.status, `USDA food fetch failed: ${res.status}`);
  return res.json();
}
