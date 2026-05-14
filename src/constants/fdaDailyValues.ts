// FDA 2020-2025 Dietary Guidelines Daily Values (2,000 calorie diet)
export interface NutrientDV {
  label: string;
  dv: number;
  unit: string;
  category: 'macro' | 'mineral' | 'vitamin' | 'other';
}

export const FDA_DAILY_VALUES: Record<string, NutrientDV> = {
  calories:         { label: 'Calories',        dv: 2000,  unit: 'kcal', category: 'macro' },
  fat_g:            { label: 'Total Fat',        dv: 78,    unit: 'g',    category: 'macro' },
  saturated_fat_g:  { label: 'Saturated Fat',    dv: 20,    unit: 'g',    category: 'macro' },
  cholesterol_mg:   { label: 'Cholesterol',      dv: 300,   unit: 'mg',   category: 'other' },
  sodium_mg:        { label: 'Sodium',           dv: 2300,  unit: 'mg',   category: 'mineral' },
  carbs_g:          { label: 'Total Carbohydrate', dv: 275, unit: 'g',    category: 'macro' },
  fiber_g:          { label: 'Dietary Fiber',    dv: 28,    unit: 'g',    category: 'macro' },
  sugar_g:          { label: 'Added Sugars',     dv: 50,    unit: 'g',    category: 'other' },
  protein_g:        { label: 'Protein',          dv: 50,    unit: 'g',    category: 'macro' },
  vitamin_d_mcg:    { label: 'Vitamin D',        dv: 20,    unit: 'mcg',  category: 'vitamin' },
  calcium_mg:       { label: 'Calcium',          dv: 1300,  unit: 'mg',   category: 'mineral' },
  iron_mg:          { label: 'Iron',             dv: 18,    unit: 'mg',   category: 'mineral' },
  potassium_mg:     { label: 'Potassium',        dv: 4700,  unit: 'mg',   category: 'mineral' },
  vitamin_a_mcg:    { label: 'Vitamin A',        dv: 900,   unit: 'mcg',  category: 'vitamin' },
  vitamin_c_mg:     { label: 'Vitamin C',        dv: 90,    unit: 'mg',   category: 'vitamin' },
};

export const MICRONUTRIENT_KEYS = [
  'vitamin_a_mcg',
  'vitamin_c_mg',
  'vitamin_d_mcg',
  'calcium_mg',
  'iron_mg',
  'potassium_mg',
  'sodium_mg',
  'saturated_fat_g',
  'cholesterol_mg',
  'fiber_g',
  'sugar_g',
] as const;

export type MicronutrientKey = typeof MICRONUTRIENT_KEYS[number];
