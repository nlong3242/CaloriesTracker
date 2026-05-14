import { useState, useCallback } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  RefreshControl, Alert
} from 'react-native';
import { Link, useFocusEffect } from 'expo-router';
import { FAB } from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';
import { useUserStore } from '../../src/store/userStore';
import { getDiaryEntries, getDiaryTotals, deleteDiaryEntry, DiaryEntry, MealType } from '../../src/db/queries/diary';
import MacroBar from '../../src/components/MacroBar';
import { todayString, formatCalories } from '../../src/utils/nutrition';

const MEALS: { key: MealType; label: string; icon: string }[] = [
  { key: 'breakfast', label: 'Breakfast', icon: '☀️' },
  { key: 'lunch', label: 'Lunch', icon: '🌤️' },
  { key: 'dinner', label: 'Dinner', icon: '🌙' },
  { key: 'snack', label: 'Snack', icon: '🍎' },
];

export default function DiaryScreen() {
  const { profile } = useUserStore();
  const today = todayString();
  const [entries, setEntries] = useState<DiaryEntry[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(() => {
    setEntries(getDiaryEntries(today));
  }, [today]);

  useFocusEffect(useCallback(() => { load(); }, [load]));

  const totals = getDiaryTotals(today);
  const targetCal = profile?.target_calories ?? 2000;
  const targetProtein = profile?.target_protein_g ?? 50;
  const targetCarbs = profile?.target_carbs_g ?? 275;
  const targetFat = profile?.target_fat_g ?? 78;

  const calRemaining = targetCal - Math.round(totals.calories);

  function confirmDelete(entry: DiaryEntry) {
    Alert.alert('Remove entry', `Remove ${entry.food_name}?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Remove', style: 'destructive',
        onPress: () => { deleteDiaryEntry(entry.id); load(); },
      },
    ]);
  }

  const entriesByMeal = (meal: MealType) => entries.filter(e => e.meal_type === meal);

  return (
    <View style={styles.root}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.container}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); load(); setRefreshing(false); }} />}
      >
        {/* Calorie summary */}
        <View style={styles.calCard}>
          <View style={styles.calRow}>
            <View style={styles.calItem}>
              <Text style={styles.calLabel}>Goal</Text>
              <Text style={styles.calValue}>{targetCal}</Text>
            </View>
            <View style={styles.calMain}>
              <Text style={styles.calMainValue}>{formatCalories(totals.calories)}</Text>
              <Text style={styles.calMainLabel}>kcal eaten</Text>
            </View>
            <View style={styles.calItem}>
              <Text style={styles.calLabel}>{calRemaining >= 0 ? 'Remaining' : 'Over'}</Text>
              <Text style={[styles.calValue, calRemaining < 0 && styles.over]}>
                {Math.abs(calRemaining)}
              </Text>
            </View>
          </View>

          <View style={styles.macros}>
            <MacroBar label="Protein" current={totals.protein_g} target={targetProtein} unit="g" color="#3182ce" />
            <MacroBar label="Carbs" current={totals.carbs_g} target={targetCarbs} unit="g" color="#d69e2e" />
            <MacroBar label="Fat" current={totals.fat_g} target={targetFat} unit="g" color="#e53e3e" />
          </View>

          <Link href="/micronutrients" asChild>
            <TouchableOpacity style={styles.microLink}>
              <Text style={styles.microLinkText}>View Micronutrients</Text>
              <Ionicons name="chevron-forward" size={14} color="#38a169" />
            </TouchableOpacity>
          </Link>
        </View>

        {/* Meals */}
        {MEALS.map(({ key, label, icon }) => {
          const mealEntries = entriesByMeal(key);
          const mealCals = mealEntries.reduce((s, e) => s + e.calories, 0);
          return (
            <View key={key} style={styles.mealSection}>
              <View style={styles.mealHeader}>
                <Text style={styles.mealTitle}>{icon} {label}</Text>
                <Text style={styles.mealCals}>{Math.round(mealCals)} kcal</Text>
              </View>
              {mealEntries.map(entry => (
                <View key={entry.id} style={styles.entryRow}>
                  <View style={styles.entryInfo}>
                    <Text style={styles.entryName} numberOfLines={1}>{entry.food_name}</Text>
                    <Text style={styles.entrySub}>
                      {entry.amount_g}g · P:{Math.round(entry.protein_g)}g C:{Math.round(entry.carbs_g)}g F:{Math.round(entry.fat_g)}g
                    </Text>
                  </View>
                  <View style={styles.entryRight}>
                    <Text style={styles.entryCals}>{Math.round(entry.calories)}</Text>
                    <TouchableOpacity onPress={() => confirmDelete(entry)} hitSlop={8}>
                      <Ionicons name="trash-outline" size={16} color="#fc8181" />
                    </TouchableOpacity>
                  </View>
                </View>
              ))}
              <Link href={{ pathname: '/search', params: { meal: key } }} asChild>
                <TouchableOpacity style={styles.addBtn}>
                  <Ionicons name="add" size={16} color="#38a169" />
                  <Text style={styles.addBtnText}>Add food</Text>
                </TouchableOpacity>
              </Link>
            </View>
          );
        })}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#f7fafc' },
  scroll: { flex: 1 },
  container: { padding: 16, paddingBottom: 40 },
  calCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  calRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 20 },
  calItem: { flex: 1, alignItems: 'center' },
  calLabel: { fontSize: 12, color: '#718096', marginBottom: 4 },
  calValue: { fontSize: 22, fontWeight: '700', color: '#2d3748' },
  calMain: { flex: 1.4, alignItems: 'center' },
  calMainValue: { fontSize: 36, fontWeight: '800', color: '#1a202c' },
  calMainLabel: { fontSize: 12, color: '#718096' },
  over: { color: '#e53e3e' },
  macros: { marginBottom: 8 },
  microLink: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 8,
    gap: 4,
  },
  microLinkText: { fontSize: 13, color: '#38a169', fontWeight: '600' },
  mealSection: {
    backgroundColor: '#fff',
    borderRadius: 14,
    padding: 14,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 1,
  },
  mealHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  mealTitle: { fontSize: 16, fontWeight: '700', color: '#2d3748' },
  mealCals: { fontSize: 13, color: '#718096' },
  entryRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 8, borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: '#edf2f7' },
  entryInfo: { flex: 1 },
  entryName: { fontSize: 14, color: '#2d3748', fontWeight: '500' },
  entrySub: { fontSize: 12, color: '#a0aec0', marginTop: 2 },
  entryRight: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  entryCals: { fontSize: 14, fontWeight: '600', color: '#2d3748' },
  addBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingTop: 10,
    paddingLeft: 2,
  },
  addBtnText: { fontSize: 14, color: '#38a169' },
});
