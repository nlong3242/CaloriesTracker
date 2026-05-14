import { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { Button, TextInput, HelperText } from 'react-native-paper';
import { ActivityLevel, ACTIVITY_LABELS, calculateTDEE } from '../../src/utils/tdee';
import { useUserStore } from '../../src/store/userStore';

const ACTIVITY_LEVELS: ActivityLevel[] = ['sedentary', 'light', 'moderate', 'active', 'very_active'];

export default function TDEESetup() {
  const router = useRouter();
  const saveProfile = useUserStore(s => s.saveProfile);

  const [age, setAge] = useState('');
  const [sex, setSex] = useState<'male' | 'female' | null>(null);
  const [heightCm, setHeightCm] = useState('');
  const [weightKg, setWeightKg] = useState('');
  const [activity, setActivity] = useState<ActivityLevel | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});

  function validate() {
    const e: Record<string, string> = {};
    if (!age || isNaN(Number(age)) || Number(age) < 10 || Number(age) > 120) e.age = 'Enter a valid age (10-120)';
    if (!sex) e.sex = 'Select your sex';
    if (!heightCm || isNaN(Number(heightCm)) || Number(heightCm) < 100 || Number(heightCm) > 250) e.height = 'Enter height in cm (100-250)';
    if (!weightKg || isNaN(Number(weightKg)) || Number(weightKg) < 20 || Number(weightKg) > 300) e.weight = 'Enter weight in kg (20-300)';
    if (!activity) e.activity = 'Select your activity level';
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  function handleNext() {
    if (!validate()) return;
    const tdee = calculateTDEE(Number(weightKg), Number(heightCm), Number(age), sex!, activity!);
    saveProfile({
      age: Number(age),
      sex: sex!,
      height_cm: Number(heightCm),
      weight_kg: Number(weightKg),
      activity_level: activity!,
      tdee,
      target_calories: tdee,
    });
    router.push('/onboarding/macros');
  }

  return (
    <ScrollView style={styles.scroll} contentContainerStyle={styles.container}>
      <Text style={styles.title}>About You</Text>
      <Text style={styles.subtitle}>We'll calculate your daily calorie needs</Text>

      <TextInput
        label="Age"
        value={age}
        onChangeText={setAge}
        keyboardType="numeric"
        style={styles.input}
        mode="outlined"
        right={<TextInput.Affix text="years" />}
      />
      {errors.age && <HelperText type="error">{errors.age}</HelperText>}

      <Text style={styles.sectionLabel}>Biological Sex</Text>
      <View style={styles.sexRow}>
        {(['male', 'female'] as const).map(s => (
          <TouchableOpacity
            key={s}
            style={[styles.sexBtn, sex === s && styles.sexBtnActive]}
            onPress={() => setSex(s)}
          >
            <Text style={[styles.sexBtnText, sex === s && styles.sexBtnTextActive]}>
              {s === 'male' ? '♂ Male' : '♀ Female'}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
      {errors.sex && <HelperText type="error">{errors.sex}</HelperText>}

      <TextInput
        label="Height"
        value={heightCm}
        onChangeText={setHeightCm}
        keyboardType="numeric"
        style={styles.input}
        mode="outlined"
        right={<TextInput.Affix text="cm" />}
      />
      {errors.height && <HelperText type="error">{errors.height}</HelperText>}

      <TextInput
        label="Weight"
        value={weightKg}
        onChangeText={setWeightKg}
        keyboardType="numeric"
        style={styles.input}
        mode="outlined"
        right={<TextInput.Affix text="kg" />}
      />
      {errors.weight && <HelperText type="error">{errors.weight}</HelperText>}

      <Text style={styles.sectionLabel}>Activity Level</Text>
      {ACTIVITY_LEVELS.map(level => (
        <TouchableOpacity
          key={level}
          style={[styles.activityBtn, activity === level && styles.activityBtnActive]}
          onPress={() => setActivity(level)}
        >
          <Text style={[styles.activityText, activity === level && styles.activityTextActive]}>
            {ACTIVITY_LABELS[level]}
          </Text>
        </TouchableOpacity>
      ))}
      {errors.activity && <HelperText type="error">{errors.activity}</HelperText>}

      <Button
        mode="contained"
        onPress={handleNext}
        style={styles.btn}
        contentStyle={styles.btnContent}
      >
        Next: Set Targets
      </Button>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: { flex: 1, backgroundColor: '#fff' },
  container: { padding: 24, paddingBottom: 48 },
  title: { fontSize: 26, fontWeight: '700', color: '#1a202c', marginBottom: 4 },
  subtitle: { fontSize: 15, color: '#718096', marginBottom: 28 },
  input: { marginBottom: 4 },
  sectionLabel: { fontSize: 14, fontWeight: '600', color: '#2d3748', marginTop: 16, marginBottom: 8 },
  sexRow: { flexDirection: 'row', gap: 12, marginBottom: 4 },
  sexBtn: {
    flex: 1,
    padding: 14,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#e2e8f0',
    alignItems: 'center',
  },
  sexBtnActive: { borderColor: '#38a169', backgroundColor: '#f0fff4' },
  sexBtnText: { fontSize: 15, color: '#4a5568' },
  sexBtnTextActive: { color: '#38a169', fontWeight: '600' },
  activityBtn: {
    padding: 14,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#e2e8f0',
    marginBottom: 8,
  },
  activityBtnActive: { borderColor: '#38a169', backgroundColor: '#f0fff4' },
  activityText: { fontSize: 14, color: '#4a5568' },
  activityTextActive: { color: '#38a169', fontWeight: '600' },
  btn: { marginTop: 28, borderRadius: 12 },
  btnContent: { height: 52 },
});
