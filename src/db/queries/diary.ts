import { getDatabase } from '../database';

export type MealType = 'breakfast' | 'lunch' | 'dinner' | 'snack';

export interface DiaryEntry {
  id: number;
  date: string;
  meal_type: MealType;
  food_id: number | null;
  recipe_id: number | null;
  food_name: string;
  amount_g: number;
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
  created_at: string;
}

export interface DiaryTotals {
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

export function getDiaryEntries(date: string): DiaryEntry[] {
  const db = getDatabase();
  return db.getAllSync<DiaryEntry>(
    'SELECT * FROM diary_entries WHERE date = ? ORDER BY created_at ASC',
    [date]
  );
}

export function getDiaryTotals(date: string): DiaryTotals {
  const db = getDatabase();
  const result = db.getFirstSync<DiaryTotals>(
    `SELECT
      COALESCE(SUM(calories), 0) as calories,
      COALESCE(SUM(protein_g), 0) as protein_g,
      COALESCE(SUM(carbs_g), 0) as carbs_g,
      COALESCE(SUM(fat_g), 0) as fat_g,
      COALESCE(SUM(fiber_g), 0) as fiber_g,
      COALESCE(SUM(sugar_g), 0) as sugar_g,
      COALESCE(SUM(sodium_mg), 0) as sodium_mg,
      COALESCE(SUM(saturated_fat_g), 0) as saturated_fat_g,
      COALESCE(SUM(cholesterol_mg), 0) as cholesterol_mg,
      COALESCE(SUM(vitamin_a_mcg), 0) as vitamin_a_mcg,
      COALESCE(SUM(vitamin_c_mg), 0) as vitamin_c_mg,
      COALESCE(SUM(vitamin_d_mcg), 0) as vitamin_d_mcg,
      COALESCE(SUM(calcium_mg), 0) as calcium_mg,
      COALESCE(SUM(iron_mg), 0) as iron_mg,
      COALESCE(SUM(potassium_mg), 0) as potassium_mg
    FROM diary_entries WHERE date = ?`,
    [date]
  );
  return result ?? {
    calories: 0, protein_g: 0, carbs_g: 0, fat_g: 0,
    fiber_g: 0, sugar_g: 0, sodium_mg: 0, saturated_fat_g: 0,
    cholesterol_mg: 0, vitamin_a_mcg: 0, vitamin_c_mg: 0,
    vitamin_d_mcg: 0, calcium_mg: 0, iron_mg: 0, potassium_mg: 0,
  };
}

export function addDiaryEntry(entry: Omit<DiaryEntry, 'id' | 'created_at'>): number {
  const db = getDatabase();
  const result = db.runSync(
    `INSERT INTO diary_entries
      (date, meal_type, food_id, recipe_id, food_name, amount_g, calories,
       protein_g, carbs_g, fat_g, fiber_g, sugar_g, sodium_mg, saturated_fat_g,
       cholesterol_mg, vitamin_a_mcg, vitamin_c_mg, vitamin_d_mcg,
       calcium_mg, iron_mg, potassium_mg)
     VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
    [
      entry.date, entry.meal_type, entry.food_id, entry.recipe_id,
      entry.food_name, entry.amount_g, entry.calories,
      entry.protein_g, entry.carbs_g, entry.fat_g, entry.fiber_g,
      entry.sugar_g, entry.sodium_mg, entry.saturated_fat_g,
      entry.cholesterol_mg, entry.vitamin_a_mcg, entry.vitamin_c_mg,
      entry.vitamin_d_mcg, entry.calcium_mg, entry.iron_mg, entry.potassium_mg,
    ]
  );
  return result.lastInsertRowId;
}

export function deleteDiaryEntry(id: number): void {
  const db = getDatabase();
  db.runSync('DELETE FROM diary_entries WHERE id = ?', [id]);
}
