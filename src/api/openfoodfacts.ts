// Open Food Facts API — no key required, completely free
const BASE_URL = 'https://world.openfoodfacts.org';

export interface OFFProduct {
  code: string;
  product_name: string;
  brands?: string;
  serving_size?: string;
  serving_quantity?: number;
  nutriments: {
    'energy-kcal_100g'?: number;
    'energy-kcal_serving'?: number;
    proteins_100g?: number;
    carbohydrates_100g?: number;
    fat_100g?: number;
    fiber_100g?: number;
    sugars_100g?: number;
    sodium_100g?: number;
    'saturated-fat_100g'?: number;
    cholesterol_100g?: number;
    'vitamin-a_100g'?: number;
    'vitamin-c_100g'?: number;
    'vitamin-d_100g'?: number;
    calcium_100g?: number;
    iron_100g?: number;
    potassium_100g?: number;
  };
}

export interface OFFSearchResult {
  status: number;
  product?: OFFProduct;
}

export async function lookupBarcode(barcode: string): Promise<OFFProduct | null> {
  try {
    const res = await fetch(
      `${BASE_URL}/api/v0/product/${barcode}.json?fields=code,product_name,brands,serving_size,serving_quantity,nutriments`,
      { headers: { 'User-Agent': 'CaloriesTracker/1.0' } }
    );
    if (!res.ok) return null;
    const data: OFFSearchResult = await res.json();
    if (data.status !== 1 || !data.product) return null;
    return data.product;
  } catch {
    return null;
  }
}

export function offProductToNutrients(product: OFFProduct) {
  const n = product.nutriments;
  const per100g = {
    calories: n['energy-kcal_100g'] ?? 0,
    protein_g: n.proteins_100g ?? 0,
    carbs_g: n.carbohydrates_100g ?? 0,
    fat_g: n.fat_100g ?? 0,
    fiber_g: n.fiber_100g ?? 0,
    sugar_g: n.sugars_100g ?? 0,
    sodium_mg: (n.sodium_100g ?? 0) * 1000,
    saturated_fat_g: n['saturated-fat_100g'] ?? 0,
    cholesterol_mg: (n.cholesterol_100g ?? 0) * 1000,
    vitamin_a_mcg: (n['vitamin-a_100g'] ?? 0) * 1_000_000,
    vitamin_c_mg: (n['vitamin-c_100g'] ?? 0) * 1000,
    vitamin_d_mcg: (n['vitamin-d_100g'] ?? 0) * 1_000_000,
    calcium_mg: (n.calcium_100g ?? 0) * 1000,
    iron_mg: (n.iron_100g ?? 0) * 1000,
    potassium_mg: (n.potassium_100g ?? 0) * 1000,
  };
  return {
    name: product.product_name || 'Unknown product',
    brand: product.brands ?? null,
    serving_size_g: product.serving_quantity ?? 100,
    serving_description: product.serving_size ?? '100g',
    barcode: product.code,
    ...per100g,
  };
}
