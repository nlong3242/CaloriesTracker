import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

interface Props {
  label: string;
  current: number;
  target: number;
  unit: string;
  color: string;
}

export default function MacroBar({ label, current, target, unit, color }: Props) {
  const pct = target > 0 ? Math.min(current / target, 1) : 0;
  const remaining = target - Math.round(current);
  const over = remaining < 0;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.label}>{label}</Text>
        <Text style={styles.values}>
          {Math.round(current)}/{target}{unit}
        </Text>
      </View>
      <View style={styles.track}>
        <View style={[styles.fill, { width: `${pct * 100}%`, backgroundColor: color }]} />
      </View>
      <Text style={[styles.remaining, over && styles.over]}>
        {over ? `${Math.abs(remaining)}${unit} over` : `${remaining}${unit} left`}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { marginBottom: 12 },
  header: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 },
  label: { fontSize: 13, fontWeight: '600', color: '#333' },
  values: { fontSize: 13, color: '#555' },
  track: {
    height: 8,
    backgroundColor: '#e8e8e8',
    borderRadius: 4,
    overflow: 'hidden',
  },
  fill: { height: '100%', borderRadius: 4 },
  remaining: { fontSize: 11, color: '#888', marginTop: 2 },
  over: { color: '#e53e3e' },
});
