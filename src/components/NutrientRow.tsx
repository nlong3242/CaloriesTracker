import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { NutrientDV } from '../constants/fdaDailyValues';

interface Props {
  nutrientKey: string;
  value: number;
  dv: NutrientDV;
}

export default function NutrientRow({ nutrientKey, value, dv }: Props) {
  const pct = dv.dv > 0 ? Math.min((value / dv.dv) * 100, 100) : 0;
  const pctDisplay = Math.round((value / dv.dv) * 100);
  const color = pct >= 100 ? '#38a169' : pct >= 50 ? '#d69e2e' : '#3182ce';

  return (
    <View style={styles.row}>
      <Text style={styles.label}>{dv.label}</Text>
      <View style={styles.right}>
        <Text style={styles.value}>
          {Math.round(value * 10) / 10}{dv.unit}
        </Text>
        <View style={styles.track}>
          <View style={[styles.fill, { width: `${pct}%`, backgroundColor: color }]} />
        </View>
        <Text style={styles.pct}>{pctDisplay}%</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#eee',
  },
  label: { flex: 1, fontSize: 14, color: '#333' },
  right: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 8 },
  value: { fontSize: 12, color: '#555', width: 70, textAlign: 'right' },
  track: {
    flex: 1,
    height: 6,
    backgroundColor: '#e8e8e8',
    borderRadius: 3,
    overflow: 'hidden',
  },
  fill: { height: '100%', borderRadius: 3 },
  pct: { fontSize: 12, color: '#888', width: 36, textAlign: 'right' },
});
