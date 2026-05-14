// Scale all nutrient values by a multiplier (e.g. when user changes serving size)
export function scaleNutrients<T extends Record<string, number>>(
  nutrients: T,
  multiplier: number
): T {
  return Object.fromEntries(
    Object.entries(nutrients).map(([k, v]) => [k, Math.round(v * multiplier * 10) / 10])
  ) as T;
}

export function formatCalories(cal: number): string {
  return Math.round(cal).toString();
}

export function formatGrams(g: number): string {
  return g < 10 ? `${Math.round(g * 10) / 10}g` : `${Math.round(g)}g`;
}

export function formatMg(mg: number): string {
  return mg < 10 ? `${Math.round(mg * 10) / 10}mg` : `${Math.round(mg)}mg`;
}

export function formatMcg(mcg: number): string {
  return `${Math.round(mcg)}mcg`;
}

// Today's date string in YYYY-MM-DD format
export function todayString(): string {
  return new Date().toISOString().split('T')[0];
}

export function formatDate(dateStr: string): string {
  const d = new Date(dateStr + 'T00:00:00');
  return d.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' });
}
