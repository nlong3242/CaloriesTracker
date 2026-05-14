import { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { Button, TextInput, HelperText } from 'react-native-paper';
import { useUserStore } from '../../src/store/userStore';
import { suggestMacros, macroCalories } from '../../src/utils/tdee';

export default function MacrosSetup() {
  const router = useRouter();
  const { profile, completeSetup } = useUserStore();
  const tdee = profile?.tdee ?? 2000;

  const suggested = suggestMacros(tdee);
  const [targetCal, setTargetCal] = useState(String(tdee));
  const [protein, setProtein] = useState(String(suggested.protein_g));
  const [carbs, setCarbs] = useState(String(suggested.carbs_g));
  const [fat, setFat] = useState(String(suggested.fat_g));
  const [errors, setErrors] = useState<Record<string, string>>({});

  const macroCals = macroCalories(Number(protein), Number(carbs), Number(fat));
  const calDiff = Number(targetCal) - macroCals;

  // Editing the calorie target re-derives the macro split via the default
  // 30/40/30 ratio. Editing any macro rolls the calorie target up to whatever
  // the new macros sum to, so what you see is what gets saved.
  function onChangeCal(v: string) {
    setTargetCal(v);
    const n = Number(v);
    if (n > 0) {
      const s = suggestMacros(n);
      setProtein(String(s.protein_g));
      setCarbs(String(s.carbs_g));
      setFat(String(s.fat_g));
    }
  }

  function onChangeMacro(which: 'p' | 'c' | 'f', value: string) {
    const p = which === 'p' ? value : protein;
    const c = which === 'c' ? value : carbs;
    const f = which === 'f' ? value : fat;
    if (which === 'p') setProtein(value);
    if (which === 'c') setCarbs(value);
    if (which === 'f') setFat(value);
    setTargetCal(String(macroCalories(Number(p) || 0, Number(c) || 0, Number(f) || 0)));
  }

  function fillSuggested() {
    const s = suggestMacros(Number(targetCal) || tdee);
    setProtein(String(s.protein_g));
    setCarbs(String(s.carbs_g));
    setFat(String(s.fat_g));
  }

  function validate() {
    const e: Record<string, string> = {};
    if (!targetCal || Number(targetCal) < 800 || Number(targetCal) > 10000) e.cal = 'Enter 800–10000';
    if (!protein || Number(protein) < 0) e.protein = 'Must be ≥ 0';
    if (!carbs || Number(carbs) < 0) e.carbs = 'Must be ≥ 0';
    if (!fat || Number(fat) < 0) e.fat = 'Must be ≥ 0';
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  function handleFinish() {
    if (!validate() || !profile) return;
    completeSetup({
      age: profile.age!,
      sex: profile.sex!,
      height_cm: profile.height_cm!,
      weight_kg: profile.weight_kg!,
      activity_level: profile.activity_level!,
      target_calories: Number(targetCal),
      target_protein_g: Number(protein),
      target_carbs_g: Number(carbs),
      target_fat_g: Number(fat),
    });
    router.replace('/(tabs)');
  }

  return (
    <ScrollView style={styles.scroll} contentContainerStyle={styles.container}>
      <Text style={styles.title}>Set Your Targets</Text>
      <Text style={styles.subtitle}>
        Your estimated TDEE is{' '}
        <Text style={styles.tdeeHighlight}>{tdee} kcal/day</Text>
      </Text>

      <TextInput
        label="Daily Calorie Target"
        value={targetCal}
        onChangeText={onChangeCal}
        keyboardType="numeric"
        mode="outlined"
        style={styles.input}
        right={<TextInput.Affix text="kcal" />}
      />
      {errors.cal && <HelperText type="error">{errors.cal}</HelperText>}

      <View style={styles.row}>
        <Text style={styles.sectionLabel}>Macro Targets</Text>
        <Button onPress={fillSuggested} compact>Auto-fill</Button>
      </View>

      <View style={styles.macroRow}>
        <View style={styles.macroInput}>
          <TextInput
            label="Protein"
            value={protein}
            onChangeText={v => onChangeMacro('p', v)}
            keyboardType="numeric"
            mode="outlined"
            right={<TextInput.Affix text="g" />}
          />
          {errors.protein && <HelperText type="error">{errors.protein}</HelperText>}
          <Text style={styles.macroSub}>{Number(protein) * 4} kcal</Text>
        </View>
        <View style={styles.macroInput}>
          <TextInput
            label="Carbs"
            value={carbs}
            onChangeText={v => onChangeMacro('c', v)}
            keyboardType="numeric"
            mode="outlined"
            right={<TextInput.Affix text="g" />}
          />
          {errors.carbs && <HelperText type="error">{errors.carbs}</HelperText>}
          <Text style={styles.macroSub}>{Number(carbs) * 4} kcal</Text>
        </View>
        <View style={styles.macroInput}>
          <TextInput
            label="Fat"
            value={fat}
            onChangeText={v => onChangeMacro('f', v)}
            keyboardType="numeric"
            mode="outlined"
            right={<TextInput.Affix text="g" />}
          />
          {errors.fat && <HelperText type="error">{errors.fat}</HelperText>}
          <Text style={styles.macroSub}>{Number(fat) * 9} kcal</Text>
        </View>
      </View>

      <View style={[styles.calCard, Math.abs(calDiff) > 50 && styles.calCardWarn]}>
        <Text style={styles.calCardText}>
          Macro total: <Text style={styles.bold}>{macroCals} kcal</Text>
          {Math.abs(calDiff) > 0 && (
            <Text>  ({calDiff > 0 ? '+' : ''}{calDiff} from target)</Text>
          )}
        </Text>
      </View>

      <Button
        mode="contained"
        onPress={handleFinish}
        style={styles.btn}
        contentStyle={styles.btnContent}
      >
        Start Tracking
      </Button>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: { flex: 1, backgroundColor: '#fff' },
  container: { padding: 24, paddingBottom: 48 },
  title: { fontSize: 26, fontWeight: '700', color: '#1a202c', marginBottom: 4 },
  subtitle: { fontSize: 15, color: '#718096', marginBottom: 28 },
  tdeeHighlight: { color: '#38a169', fontWeight: '700' },
  input: { marginBottom: 4 },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 16, marginBottom: 8 },
  sectionLabel: { fontSize: 14, fontWeight: '600', color: '#2d3748' },
  macroRow: { flexDirection: 'row', gap: 8, marginBottom: 8 },
  macroInput: { flex: 1 },
  macroSub: { fontSize: 11, color: '#888', textAlign: 'center', marginTop: 2 },
  calCard: {
    backgroundColor: '#f0fff4',
    borderRadius: 10,
    padding: 14,
    marginVertical: 16,
    borderWidth: 1,
    borderColor: '#c6f6d5',
  },
  calCardWarn: { backgroundColor: '#fffaf0', borderColor: '#fbd38d' },
  calCardText: { fontSize: 14, color: '#2d3748' },
  bold: { fontWeight: '700' },
  btn: { borderRadius: 12 },
  btnContent: { height: 52 },
});
