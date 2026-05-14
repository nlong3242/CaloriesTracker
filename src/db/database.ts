import * as SQLite from 'expo-sqlite';

let db: SQLite.SQLiteDatabase | null = null;

export function getDatabase(): SQLite.SQLiteDatabase {
  if (!db) {
    db = SQLite.openDatabaseSync('calories_tracker.db');
  }
  return db;
}

export async function initDatabase(): Promise<void> {
  const database = getDatabase();

  await database.execAsync(`
    PRAGMA journal_mode = WAL;
    PRAGMA foreign_keys = ON;

    CREATE TABLE IF NOT EXISTS user_profile (
      id INTEGER PRIMARY KEY DEFAULT 1,
      name TEXT,
      age INTEGER,
      sex TEXT CHECK(sex IN ('male', 'female')),
      height_cm REAL,
      weight_kg REAL,
      activity_level TEXT CHECK(activity_level IN ('sedentary', 'light', 'moderate', 'active', 'very_active')),
      tdee INTEGER,
      target_calories INTEGER,
      target_protein_g INTEGER,
      target_carbs_g INTEGER,
      target_fat_g INTEGER,
      setup_complete INTEGER DEFAULT 0,
      updated_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS custom_foods (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      brand TEXT,
      serving_size_g REAL NOT NULL DEFAULT 100,
      serving_description TEXT DEFAULT '100g',
      calories REAL NOT NULL,
      protein_g REAL NOT NULL DEFAULT 0,
      carbs_g REAL NOT NULL DEFAULT 0,
      fat_g REAL NOT NULL DEFAULT 0,
      fiber_g REAL DEFAULT 0,
      sugar_g REAL DEFAULT 0,
      sodium_mg REAL DEFAULT 0,
      saturated_fat_g REAL DEFAULT 0,
      cholesterol_mg REAL DEFAULT 0,
      vitamin_a_mcg REAL DEFAULT 0,
      vitamin_c_mg REAL DEFAULT 0,
      vitamin_d_mcg REAL DEFAULT 0,
      calcium_mg REAL DEFAULT 0,
      iron_mg REAL DEFAULT 0,
      potassium_mg REAL DEFAULT 0,
      source TEXT DEFAULT 'custom',
      external_id TEXT,
      barcode TEXT,
      created_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS recipes (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      servings INTEGER NOT NULL DEFAULT 1,
      notes TEXT,
      created_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS recipe_ingredients (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      recipe_id INTEGER NOT NULL REFERENCES recipes(id) ON DELETE CASCADE,
      food_id INTEGER REFERENCES custom_foods(id) ON DELETE SET NULL,
      food_name TEXT NOT NULL,
      amount_g REAL NOT NULL,
      display_amount TEXT,
      display_unit TEXT
    );

    CREATE TABLE IF NOT EXISTS diary_entries (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      date TEXT NOT NULL,
      meal_type TEXT NOT NULL CHECK(meal_type IN ('breakfast', 'lunch', 'dinner', 'snack')),
      food_id INTEGER REFERENCES custom_foods(id) ON DELETE SET NULL,
      recipe_id INTEGER REFERENCES recipes(id) ON DELETE SET NULL,
      food_name TEXT NOT NULL,
      amount_g REAL NOT NULL,
      calories REAL NOT NULL,
      protein_g REAL NOT NULL DEFAULT 0,
      carbs_g REAL NOT NULL DEFAULT 0,
      fat_g REAL NOT NULL DEFAULT 0,
      fiber_g REAL DEFAULT 0,
      sugar_g REAL DEFAULT 0,
      sodium_mg REAL DEFAULT 0,
      saturated_fat_g REAL DEFAULT 0,
      cholesterol_mg REAL DEFAULT 0,
      vitamin_a_mcg REAL DEFAULT 0,
      vitamin_c_mg REAL DEFAULT 0,
      vitamin_d_mcg REAL DEFAULT 0,
      calcium_mg REAL DEFAULT 0,
      iron_mg REAL DEFAULT 0,
      potassium_mg REAL DEFAULT 0,
      created_at TEXT DEFAULT (datetime('now'))
    );

    CREATE INDEX IF NOT EXISTS idx_diary_date ON diary_entries(date);
    CREATE INDEX IF NOT EXISTS idx_diary_meal ON diary_entries(date, meal_type);
  `);
}
