import { View, Text, StyleSheet, Image } from 'react-native';
import { Link } from 'expo-router';
import { Button } from 'react-native-paper';

export default function OnboardingWelcome() {
  return (
    <View style={styles.container}>
      <Text style={styles.emoji}>🥗</Text>
      <Text style={styles.title}>Calories Tracker</Text>
      <Text style={styles.subtitle}>
        Track your nutrition, hit your goals, and understand what you eat.
      </Text>

      <View style={styles.features}>
        {[
          '📊 Daily macro & calorie tracking',
          '🔬 Micronutrient dashboard',
          '🤖 AI-powered recipe import',
          '📷 Barcode scanner (mobile)',
          '🎯 Personalized TDEE & targets',
        ].map(f => (
          <Text key={f} style={styles.feature}>{f}</Text>
        ))}
      </View>

      <Link href="/onboarding/tdee" asChild>
        <Button mode="contained" style={styles.btn} contentStyle={styles.btnContent}>
          Get Started
        </Button>
      </Link>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 32,
    justifyContent: 'center',
    backgroundColor: '#fff',
  },
  emoji: { fontSize: 64, textAlign: 'center', marginBottom: 16 },
  title: {
    fontSize: 32,
    fontWeight: '800',
    textAlign: 'center',
    color: '#1a202c',
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 16,
    color: '#718096',
    textAlign: 'center',
    marginBottom: 40,
    lineHeight: 24,
  },
  features: { marginBottom: 48, gap: 12 },
  feature: { fontSize: 16, color: '#2d3748', paddingLeft: 4 },
  btn: { borderRadius: 12 },
  btnContent: { height: 52 },
});
