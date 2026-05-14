import { getDatabase } from '../database';

export interface UserProfile {
  id: number;
  name: string | null;
  age: number | null;
  sex: 'male' | 'female' | null;
  height_cm: number | null;
  weight_kg: number | null;
  activity_level: 'sedentary' | 'light' | 'moderate' | 'active' | 'very_active' | null;
  tdee: number | null;
  target_calories: number | null;
  target_protein_g: number | null;
  target_carbs_g: number | null;
  target_fat_g: number | null;
  setup_complete: number;
  updated_at: string;
}

export function getUserProfile(): UserProfile | null {
  const db = getDatabase();
  return db.getFirstSync<UserProfile>('SELECT * FROM user_profile WHERE id = 1') ?? null;
}

export function upsertUserProfile(profile: Partial<Omit<UserProfile, 'id' | 'updated_at'>>): void {
  const db = getDatabase();
  const existing = getUserProfile();
  if (existing) {
    const fields = Object.keys(profile).map(k => `${k} = ?`).join(', ');
    const values = [...Object.values(profile), new Date().toISOString()];
    db.runSync(
      `UPDATE user_profile SET ${fields}, updated_at = ? WHERE id = 1`,
      values
    );
  } else {
    const keys = ['id', ...Object.keys(profile), 'updated_at'];
    const placeholders = keys.map(() => '?').join(', ');
    const values = [1, ...Object.values(profile), new Date().toISOString()];
    db.runSync(
      `INSERT INTO user_profile (${keys.join(', ')}) VALUES (${placeholders})`,
      values
    );
  }
}
