import { useState } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity,
  Alert, Modal, TextInput as RNTextInput
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { TextInput, Button, ActivityIndicator } from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';
import { useQuery } from '@tanstack/react-query';
import { searchFoods, UsdaSearchResult, parseNutrients } from '../../src/api/usda';
import { searchCustomFoods } from '../../src/db/queries/foods';
import { addDiaryEntry, MealType } from '../../src/db/queries/diary';
import { todayString } from '../../src/utils/nutrition';

type FoodItem =
  | { type: 'usda'; data: UsdaSearchResult }
  | { type: 'custom'; data: ReturnType<typeof searchCustomFoods>[0] };

const MEAL_OPTIONS: MealType[] = ['breakfast', 'lunch', 'dinner', 'snack'];

export default function SearchScreen() {
  const params = useLocalSearchParams<{ meal?: string }>();
  const router = useRouter();

  const [query, setQuery] = useState('');
  const [submitted, setSubmitted] = useState('');
  const [selectedMeal, setSelectedMeal] = useState<MealType>(
    (params.meal as MealType) ?? 'lunch'
  );
  const [logModal, setLogModal] = useState<FoodItem | null>(null);
  const [amount, setAmount] = useState('100');

  const { data: usdaResults, isFetching } = useQuery({
    queryKey: ['usda-search', submitted],
    queryFn: () => searchFoods(submitted),
    enabled: submitted.length > 1,
    staleTime: 5 * 60 * 1000,
  });

  const customResults = submitted.length > 1 ? searchCustomFoods(submitted) : [];

  const items: FoodItem[] = [
    ...customResults.map(d => ({ type: 'custom' as const, data: d })),
    ...(usdaResults ?? []).map(d => ({ type: 'usda' as const, data: d })),
  ];

  function handleSearch() {
    setSubmitted(query.trim());
  }

  function openLog(item: FoodItem) {
    setAmount('100');
    setLogModal(item);
  }

  function confirmLog() {
    if (!logModal) return;
    const g = Number(amount);
    if (isNaN(g) || g <= 0) { Alert.alert('Enter a valid amount'); return; }

    const ratio = g / 100;
    const entry = (() => {
      if (logModal.type === 'custom') {
        const f = logModal.data;
        const scale = g / f.serving_size_g;
        return {
          food_name: f.name,
          food_id: f.id,
          calories: f.calories * scale,
          protein_g: f.protein_g * scale,
          carbs_g: f.carbs_g * scale,
          fat_g: f.fat_g * scale,
          fiber_g: f.fiber_g * scale,
          sugar_g: f.sugar_g * scale,
          sodium_mg: f.sodium_mg * scale,
          saturated_fat_g: f.saturated_fat_g * scale,
          cholesterol_mg: f.cholesterol_mg * scale,
          vitamin_a_mcg: f.vitamin_a_mcg * scale,
          vitamin_c_mg: f.vitamin_c_mg * scale,
          vitamin_d_mcg: f.vitamin_d_mcg * scale,
          calcium_mg: f.calcium_mg * scale,
          iron_mg: f.iron_mg * scale,
          potassium_mg: f.potassium_mg * scale,
        };
      } else {
        const f = logModal.data;
        const n = parseNutrients(f.foodNutrients);
        return {
          food_name: f.description,
          food_id: null,
          calories: n.calories * ratio,
          protein_g: n.protein_g * ratio,
          carbs_g: n.carbs_g * ratio,
          fat_g: n.fat_g * ratio,
          fiber_g: n.fiber_g * ratio,
          sugar_g: n.sugar_g * ratio,
          sodium_mg: n.sodium_mg * ratio,
          saturated_fat_g: n.saturated_fat_g * ratio,
          cholesterol_mg: n.cholesterol_mg * ratio,
          vitamin_a_mcg: n.vitamin_a_mcg * ratio,
          vitamin_c_mg: n.vitamin_c_mg * ratio,
          vitamin_d_mcg: n.vitamin_d_mcg * ratio,
          calcium_mg: n.calcium_mg * ratio,
          iron_mg: n.iron_mg * ratio,
          potassium_mg: n.potassium_mg * ratio,
        };
      }
    })();

    addDiaryEntry({
      date: todayString(),
      meal_type: selectedMeal,
      recipe_id: null,
      amount_g: g,
      ...entry,
    } as any);

    setLogModal(null);
    Alert.alert('Added!', `${entry.food_name} logged to ${selectedMeal}.`, [
      { text: 'OK', onPress: () => router.back() },
      { text: 'Add another', style: 'cancel' },
    ]);
  }

  function getNutrients(item: FoodItem) {
    if (item.type === 'custom') {
      const f = item.data;
      return { cal: f.calories, p: f.protein_g, c: f.carbs_g, fa: f.fat_g };
    }
    const n = parseNutrients(item.data.foodNutrients);
    return { cal: n.calories, p: n.protein_g, c: n.carbs_g, fa: n.fat_g };
  }

  return (
    <View style={styles.root}>
      {/* Meal selector */}
      <View style={styles.mealRow}>
        {MEAL_OPTIONS.map(m => (
          <TouchableOpacity
            key={m}
            style={[styles.mealChip, selectedMeal === m && styles.mealChipActive]}
            onPress={() => setSelectedMeal(m)}
          >
            <Text style={[styles.mealChipText, selectedMeal === m && styles.mealChipTextActive]}>
              {m.charAt(0).toUpperCase() + m.slice(1)}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Search bar */}
      <View style={styles.searchRow}>
        <TextInput
          mode="outlined"
          placeholder="Search foods..."
          value={query}
          onChangeText={setQuery}
          onSubmitEditing={handleSearch}
          style={styles.searchInput}
          dense
          right={isFetching ? <TextInput.Icon icon="loading" /> : undefined}
        />
        <Button mode="contained" onPress={handleSearch} style={styles.searchBtn}>
          Go
        </Button>
      </View>

      <FlatList
        data={items}
        keyExtractor={(item, i) =>
          item.type === 'usda' ? `usda-${item.data.fdcId}` : `custom-${item.data.id}`
        }
        renderItem={({ item }) => {
          const n = getNutrients(item);
          const name = item.type === 'usda' ? item.data.description : item.data.name;
          const brand = item.type === 'usda'
            ? (item.data.brandOwner ?? item.data.brandName)
            : item.data.brand;
          return (
            <TouchableOpacity style={styles.foodCard} onPress={() => openLog(item)}>
              <View style={styles.foodInfo}>
                <Text style={styles.foodName} numberOfLines={2}>{name}</Text>
                {brand && <Text style={styles.foodBrand}>{brand}</Text>}
                <Text style={styles.foodMacros}>
                  P:{Math.round(n.p)}g  C:{Math.round(n.c)}g  F:{Math.round(n.fa)}g  (per 100g)
                </Text>
              </View>
              <View style={styles.foodRight}>
                <Text style={styles.foodCal}>{Math.round(n.cal)}</Text>
                <Text style={styles.foodCalLabel}>kcal</Text>
                {item.type === 'custom' && (
                  <Text style={styles.customBadge}>Custom</Text>
                )}
              </View>
            </TouchableOpacity>
          );
        }}
        contentContainerStyle={{ padding: 12 }}
        ListEmptyComponent={
          submitted ? (
            <Text style={styles.empty}>
              {isFetching ? 'Searching...' : 'No results found'}
            </Text>
          ) : (
            <Text style={styles.hint}>Search USDA database + your custom foods</Text>
          )
        }
      />

      {/* Log modal */}
      <Modal visible={!!logModal} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle} numberOfLines={2}>
              {logModal?.type === 'usda' ? logModal.data.description : logModal?.data?.name}
            </Text>
            <Text style={styles.modalSub}>Logging to: {selectedMeal}</Text>
            <TextInput
              label="Amount (g)"
              value={amount}
              onChangeText={setAmount}
              keyboardType="numeric"
              mode="outlined"
              style={styles.amountInput}
              right={<TextInput.Affix text="g" />}
            />
            {logModal && (() => {
              const n = getNutrients(logModal);
              const ratio = Number(amount) / 100;
              return (
                <Text style={styles.preview}>
                  {Math.round(n.cal * ratio)} kcal · P:{Math.round(n.p * ratio)}g · C:{Math.round(n.c * ratio)}g · F:{Math.round(n.fa * ratio)}g
                </Text>
              );
            })()}
            <View style={styles.modalBtns}>
              <Button onPress={() => setLogModal(null)} style={styles.modalBtn}>Cancel</Button>
              <Button mode="contained" onPress={confirmLog} style={styles.modalBtn}>Log</Button>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#f7fafc' },
  mealRow: { flexDirection: 'row', padding: 12, gap: 8, backgroundColor: '#fff', borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: '#e2e8f0' },
  mealChip: { flex: 1, paddingVertical: 6, borderRadius: 20, borderWidth: 1.5, borderColor: '#e2e8f0', alignItems: 'center' },
  mealChipActive: { backgroundColor: '#38a169', borderColor: '#38a169' },
  mealChipText: { fontSize: 12, color: '#718096' },
  mealChipTextActive: { color: '#fff', fontWeight: '600' },
  searchRow: { flexDirection: 'row', padding: 12, gap: 8, backgroundColor: '#fff' },
  searchInput: { flex: 1 },
  searchBtn: { alignSelf: 'center', borderRadius: 8 },
  foodCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 14,
    marginBottom: 8,
    flexDirection: 'row',
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 1,
  },
  foodInfo: { flex: 1, marginRight: 12 },
  foodName: { fontSize: 14, fontWeight: '600', color: '#2d3748' },
  foodBrand: { fontSize: 12, color: '#718096', marginTop: 2 },
  foodMacros: { fontSize: 11, color: '#a0aec0', marginTop: 4 },
  foodRight: { alignItems: 'flex-end', justifyContent: 'center' },
  foodCal: { fontSize: 20, fontWeight: '700', color: '#2d3748' },
  foodCalLabel: { fontSize: 11, color: '#a0aec0' },
  customBadge: { fontSize: 10, color: '#38a169', backgroundColor: '#f0fff4', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 6, marginTop: 4 },
  empty: { textAlign: 'center', color: '#a0aec0', marginTop: 40, fontSize: 15 },
  hint: { textAlign: 'center', color: '#cbd5e0', marginTop: 40, fontSize: 14 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modalCard: { backgroundColor: '#fff', borderTopLeftRadius: 20, borderTopRightRadius: 20, padding: 24 },
  modalTitle: { fontSize: 17, fontWeight: '700', color: '#1a202c', marginBottom: 4 },
  modalSub: { fontSize: 13, color: '#718096', marginBottom: 16 },
  amountInput: { marginBottom: 8 },
  preview: { fontSize: 14, color: '#38a169', fontWeight: '600', marginBottom: 16, textAlign: 'center' },
  modalBtns: { flexDirection: 'row', gap: 12 },
  modalBtn: { flex: 1 },
});
