import { getDatabase } from '../database';

export interface CustomFood {
  id: number;
  name: string;
  brand: string | null;
  serving_size_g: number;
  serving_description: string;
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
  source: string;
  external_id: string | null;
  barcode: string | null;
  created_at: string;
}

export type CustomFoodInput = Omit<CustomFood, 'id' | 'created_at'>;

export function getAllCustomFoods(): CustomFood[] {
  const db = getDatabase();
  return db.getAllSync<CustomFood>(
    'SELECT * FROM custom_foods ORDER BY name ASC'
  );
}

export function searchCustomFoods(query: string): CustomFood[] {
  const db = getDatabase();
  return db.getAllSync<CustomFood>(
    'SELECT * FROM custom_foods WHERE name LIKE ? OR brand LIKE ? ORDER BY name ASC LIMIT 30',
    [`%${query}%`, `%${query}%`]
  );
}

export function getCustomFoodById(id: number): CustomFood | null {
  const db = getDatabase();
  return db.getFirstSync<CustomFood>(
    'SELECT * FROM custom_foods WHERE id = ?',
    [id]
  ) ?? null;
}

export function getCustomFoodByBarcode(barcode: string): CustomFood | null {
  const db = getDatabase();
  return db.getFirstSync<CustomFood>(
    'SELECT * FROM custom_foods WHERE barcode = ?',
    [barcode]
  ) ?? null;
}

export function createCustomFood(food: CustomFoodInput): number {
  const db = getDatabase();
  const result = db.runSync(
    `INSERT INTO custom_foods
      (name, brand, serving_size_g, serving_description, calories, protein_g,
       carbs_g, fat_g, fiber_g, sugar_g, sodium_mg, saturated_fat_g,
       cholesterol_mg, vitamin_a_mcg, vitamin_c_mg, vitamin_d_mcg,
       calcium_mg, iron_mg, potassium_mg, source, external_id, barcode)
     VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
    [
      food.name, food.brand, food.serving_size_g, food.serving_description,
      food.calories, food.protein_g, food.carbs_g, food.fat_g,
      food.fiber_g, food.sugar_g, food.sodium_mg, food.saturated_fat_g,
      food.cholesterol_mg, food.vitamin_a_mcg, food.vitamin_c_mg,
      food.vitamin_d_mcg, food.calcium_mg, food.iron_mg, food.potassium_mg,
      food.source, food.external_id, food.barcode,
    ]
  );
  return result.lastInsertRowId;
}

export function updateCustomFood(id: number, food: Partial<CustomFoodInput>): void {
  const db = getDatabase();
  const fields = Object.keys(food).map(k => `${k} = ?`).join(', ');
  const values = [...Object.values(food), id];
  db.runSync(`UPDATE custom_foods SET ${fields} WHERE id = ?`, values);
}

export function deleteCustomFood(id: number): void {
  const db = getDatabase();
  db.runSync('DELETE FROM custom_foods WHERE id = ?', [id]);
}
