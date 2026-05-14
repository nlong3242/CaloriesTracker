import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { getDiaryTotals } from '../src/db/queries/diary';
import { FDA_DAILY_VALUES, MICRONUTRIENT_KEYS } from '../src/constants/fdaDailyValues';
import NutrientRow from '../src/components/NutrientRow';
import { todayString, formatDate } from '../src/utils/nutrition';

export default function MicronutrientsScreen() {
  const today = todayString();
  const totals = getDiaryTotals(today);

  const macro_keys = ['fat_g', 'saturated_fat_g', 'carbs_g', 'fiber_g', 'sugar_g', 'protein_g', 'sodium_mg', 'cholesterol_mg'];
  const vitamin_keys = ['vitamin_a_mcg', 'vitamin_c_mg', 'vitamin_d_mcg'];
  const mineral_keys = ['calcium_mg', 'iron_mg', 'potassium_mg'];

  function renderSection(title: string, keys: string[]) {
    return (
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>{title}</Text>
        {keys.map(key => {
          const dv = FDA_DAILY_VALUES[key];
          if (!dv) return null;
          const value = (totals as unknown as Record<string, number>)[key] ?? 0;
          return <NutrientRow key={key} nutrientKey={key} value={value} dv={dv} />;
        })}
      </View>
    );
  }

  return (
    <ScrollView style={styles.scroll} contentContainerStyle={styles.container}>
      <Text style={styles.date}>{formatDate(today)}</Text>
      <Text style={styles.note}>% based on FDA 2,000 kcal Daily Values</Text>

      {renderSection('Macronutrients', macro_keys)}
      {renderSection('Vitamins', vitamin_keys)}
      {renderSection('Minerals', mineral_keys)}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: { flex: 1, backgroundColor: '#fff' },
  container: { padding: 16, paddingBottom: 40 },
  date: { fontSize: 18, fontWeight: '700', color: '#1a202c', marginBottom: 2 },
  note: { fontSize: 12, color: '#a0aec0', marginBottom: 20 },
  section: {
    backgroundColor: '#f7fafc',
    borderRadius: 12,
    padding: 12,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#38a169',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 8,
  },
});
