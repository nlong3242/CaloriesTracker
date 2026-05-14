export type ActivityLevel = 'sedentary' | 'light' | 'moderate' | 'active' | 'very_active';

const ACTIVITY_MULTIPLIERS: Record<ActivityLevel, number> = {
  sedentary: 1.2,
  light: 1.375,
  moderate: 1.55,
  active: 1.725,
  very_active: 1.9,
};

export const ACTIVITY_LABELS: Record<ActivityLevel, string> = {
  sedentary: 'Sedentary (little or no exercise)',
  light: 'Lightly active (1-3 days/week)',
  moderate: 'Moderately active (3-5 days/week)',
  active: 'Very active (6-7 days/week)',
  very_active: 'Extra active (physical job or 2x training)',
};

export function calculateBMR(
  weightKg: number,
  heightCm: number,
  age: number,
  sex: 'male' | 'female'
): number {
  // Mifflin-St Jeor equation
  const base = 10 * weightKg + 6.25 * heightCm - 5 * age;
  return sex === 'male' ? base + 5 : base - 161;
}

export function calculateTDEE(
  weightKg: number,
  heightCm: number,
  age: number,
  sex: 'male' | 'female',
  activityLevel: ActivityLevel
): number {
  const bmr = calculateBMR(weightKg, heightCm, age, sex);
  return Math.round(bmr * ACTIVITY_MULTIPLIERS[activityLevel]);
}

export interface MacroSuggestion {
  protein_g: number;
  carbs_g: number;
  fat_g: number;
}

export function suggestMacros(targetCalories: number): MacroSuggestion {
  // Default 30% protein / 40% carbs / 30% fat
  return {
    protein_g: Math.round((targetCalories * 0.30) / 4),
    carbs_g: Math.round((targetCalories * 0.40) / 4),
    fat_g: Math.round((targetCalories * 0.30) / 9),
  };
}

export function macroCalories(protein_g: number, carbs_g: number, fat_g: number): number {
  return protein_g * 4 + carbs_g * 4 + fat_g * 9;
}
