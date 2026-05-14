import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Link, useRouter } from 'expo-router';
import { Button, Divider } from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';
import { useUserStore } from '../../src/store/userStore';
import { ACTIVITY_LABELS } from '../../src/utils/tdee';

function Row({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.row}>
      <Text style={styles.rowLabel}>{label}</Text>
      <Text style={styles.rowValue}>{value}</Text>
    </View>
  );
}

export default function ProfileScreen() {
  const { profile } = useUserStore();
  const router = useRouter();

  if (!profile) return null;

  return (
    <ScrollView style={styles.scroll} contentContainerStyle={styles.container}>
      <View style={styles.card}>
        <Text style={styles.section}>Body Metrics</Text>
        <Row label="Age" value={`${profile.age} years`} />
        <Divider />
        <Row label="Sex" value={profile.sex === 'male' ? '♂ Male' : '♀ Female'} />
        <Divider />
        <Row label="Height" value={`${profile.height_cm} cm`} />
        <Divider />
        <Row label="Weight" value={`${profile.weight_kg} kg`} />
        <Divider />
        <Row label="Activity" value={ACTIVITY_LABELS[profile.activity_level!]} />
        <Divider />
        <Row label="TDEE" value={`${profile.tdee} kcal/day`} />
      </View>

      <View style={styles.card}>
        <Text style={styles.section}>Daily Targets</Text>
        <Row label="Calories" value={`${profile.target_calories} kcal`} />
        <Divider />
        <Row label="Protein" value={`${profile.target_protein_g}g`} />
        <Divider />
        <Row label="Carbs" value={`${profile.target_carbs_g}g`} />
        <Divider />
        <Row label="Fat" value={`${profile.target_fat_g}g`} />
      </View>

      <View style={styles.card}>
        <TouchableOpacity style={styles.navItem} onPress={() => router.push('/settings')}>
          <Ionicons name="key-outline" size={20} color="#38a169" />
          <Text style={styles.navText}>API Key Settings</Text>
          <Ionicons name="chevron-forward" size={16} color="#a0aec0" />
        </TouchableOpacity>
        <Divider />
        <TouchableOpacity style={styles.navItem} onPress={() => router.push('/micronutrients')}>
          <Ionicons name="flask-outline" size={20} color="#38a169" />
          <Text style={styles.navText}>Today's Micronutrients</Text>
          <Ionicons name="chevron-forward" size={16} color="#a0aec0" />
        </TouchableOpacity>
      </View>

      <Link href="/onboarding/tdee" asChild>
        <Button mode="outlined" style={styles.editBtn}>
          Edit Profile & Targets
        </Button>
      </Link>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: { flex: 1, backgroundColor: '#f7fafc' },
  container: { padding: 16, paddingBottom: 40 },
  card: {
    backgroundColor: '#fff',
    borderRadius: 14,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 1,
  },
  section: { fontSize: 13, fontWeight: '700', color: '#38a169', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 12 },
  row: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 12 },
  rowLabel: { fontSize: 14, color: '#718096' },
  rowValue: { fontSize: 14, fontWeight: '600', color: '#2d3748' },
  navItem: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 14 },
  navText: { flex: 1, fontSize: 15, color: '#2d3748' },
  editBtn: { borderRadius: 12, marginTop: 4 },
});
