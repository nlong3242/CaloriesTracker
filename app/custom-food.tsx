import { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { TextInput, Button, HelperText } from 'react-native-paper';
import { createCustomFood } from '../src/db/queries/foods';

interface Field {
  key: string;
  label: string;
  unit: string;
  required?: boolean;
}

const BASIC_FIELDS: Field[] = [
  { key: 'calories', label: 'Calories', unit: 'kcal', required: true },
  { key: 'protein_g', label: 'Protein', unit: 'g', required: true },
  { key: 'carbs_g', label: 'Carbohydrates', unit: 'g', required: true },
  { key: 'fat_g', label: 'Fat', unit: 'g', required: true },
];

const EXTRA_FIELDS: Field[] = [
  { key: 'fiber_g', label: 'Fiber', unit: 'g' },
  { key: 'sugar_g', label: 'Sugar', unit: 'g' },
  { key: 'sodium_mg', label: 'Sodium', unit: 'mg' },
  { key: 'saturated_fat_g', label: 'Saturated Fat', unit: 'g' },
  { key: 'cholesterol_mg', label: 'Cholesterol', unit: 'mg' },
  { key: 'vitamin_a_mcg', label: 'Vitamin A', unit: 'mcg' },
  { key: 'vitamin_c_mg', label: 'Vitamin C', unit: 'mg' },
  { key: 'vitamin_d_mcg', label: 'Vitamin D', unit: 'mcg' },
  { key: 'calcium_mg', label: 'Calcium', unit: 'mg' },
  { key: 'iron_mg', label: 'Iron', unit: 'mg' },
  { key: 'potassium_mg', label: 'Potassium', unit: 'mg' },
];

type Values = Record<string, string>;

export default function CustomFoodScreen() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [brand, setBrand] = useState('');
  const [servingG, setServingG] = useState('100');
  const [servingDesc, setServingDesc] = useState('100g');
  const [values, setValues] = useState<Values>({});
  const [showExtra, setShowExtra] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  function set(key: string, val: string) {
    setValues(v => ({ ...v, [key]: val }));
  }

  function validate() {
    const e: Record<string, string> = {};
    if (!name.trim()) e.name = 'Name is required';
    if (!servingG || Number(servingG) <= 0) e.servingG = 'Enter a valid serving size';
    for (const f of BASIC_FIELDS) {
      if (!values[f.key] || isNaN(Number(values[f.key]))) {
        e[f.key] = 'Required';
      }
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  function handleSave() {
    if (!validate()) return;
    createCustomFood({
      name: name.trim(),
      brand: brand.trim() || null,
      serving_size_g: Number(servingG),
      serving_description: servingDesc.trim() || `${servingG}g`,
      calories: Number(values.calories ?? 0),
      protein_g: Number(values.protein_g ?? 0),
      carbs_g: Number(values.carbs_g ?? 0),
      fat_g: Number(values.fat_g ?? 0),
      fiber_g: Number(values.fiber_g ?? 0),
      sugar_g: Number(values.sugar_g ?? 0),
      sodium_mg: Number(values.sodium_mg ?? 0),
      saturated_fat_g: Number(values.saturated_fat_g ?? 0),
      cholesterol_mg: Number(values.cholesterol_mg ?? 0),
      vitamin_a_mcg: Number(values.vitamin_a_mcg ?? 0),
      vitamin_c_mg: Number(values.vitamin_c_mg ?? 0),
      vitamin_d_mcg: Number(values.vitamin_d_mcg ?? 0),
      calcium_mg: Number(values.calcium_mg ?? 0),
      iron_mg: Number(values.iron_mg ?? 0),
      potassium_mg: Number(values.potassium_mg ?? 0),
      source: 'custom',
      external_id: null,
      barcode: null,
    });
    Alert.alert('Saved!', `${name} added to your custom foods.`);
    router.back();
  }

  return (
    <ScrollView style={styles.scroll} contentContainerStyle={styles.container}>
      <TextInput label="Food Name *" value={name} onChangeText={setName} mode="outlined" style={styles.input} />
      {errors.name && <HelperText type="error">{errors.name}</HelperText>}

      <TextInput label="Brand (optional)" value={brand} onChangeText={setBrand} mode="outlined" style={styles.input} />

      <View style={styles.row}>
        <View style={styles.halfInput}>
          <TextInput
            label="Serving Size *"
            value={servingG}
            onChangeText={setServingG}
            keyboardType="numeric"
            mode="outlined"
            right={<TextInput.Affix text="g" />}
          />
          {errors.servingG && <HelperText type="error">{errors.servingG}</HelperText>}
        </View>
        <View style={styles.halfInput}>
          <TextInput
            label="Label (e.g. 1 cup)"
            value={servingDesc}
            onChangeText={setServingDesc}
            mode="outlined"
          />
        </View>
      </View>

      <Text style={styles.sectionLabel}>Nutrition per serving</Text>

      {BASIC_FIELDS.map(f => (
        <View key={f.key}>
          <TextInput
            label={`${f.label} *`}
            value={values[f.key] ?? ''}
            onChangeText={v => set(f.key, v)}
            keyboardType="numeric"
            mode="outlined"
            style={styles.input}
            right={<TextInput.Affix text={f.unit} />}
          />
          {errors[f.key] && <HelperText type="error">{errors[f.key]}</HelperText>}
        </View>
      ))}

      <Button
        onPress={() => setShowExtra(v => !v)}
        style={styles.toggleBtn}
        icon={showExtra ? 'chevron-up' : 'chevron-down'}
      >
        {showExtra ? 'Hide' : 'Add'} Micronutrients (optional)
      </Button>

      {showExtra && EXTRA_FIELDS.map(f => (
        <TextInput
          key={f.key}
          label={f.label}
          value={values[f.key] ?? ''}
          onChangeText={v => set(f.key, v)}
          keyboardType="numeric"
          mode="outlined"
          style={styles.input}
          right={<TextInput.Affix text={f.unit} />}
        />
      ))}

      <Button mode="contained" onPress={handleSave} style={styles.saveBtn} contentStyle={styles.saveBtnContent}>
        Save Custom Food
      </Button>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: { flex: 1, backgroundColor: '#fff' },
  container: { padding: 16, paddingBottom: 48 },
  input: { marginBottom: 4 },
  row: { flexDirection: 'row', gap: 8, marginBottom: 4 },
  halfInput: { flex: 1 },
  sectionLabel: { fontSize: 14, fontWeight: '600', color: '#2d3748', marginTop: 16, marginBottom: 8 },
  toggleBtn: { marginVertical: 8 },
  saveBtn: { marginTop: 20, borderRadius: 12 },
  saveBtnContent: { height: 52 },
});
