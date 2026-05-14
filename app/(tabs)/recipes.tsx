import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Link } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Button } from 'react-native-paper';

export default function RecipesScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.emoji}>🍳</Text>
      <Text style={styles.title}>Recipes</Text>
      <Text style={styles.sub}>
        Import a recipe by pasting ingredients or create your own custom foods.
      </Text>
      <Link href="/recipe-import" asChild>
        <Button mode="contained" icon="robot" style={styles.btn} contentStyle={styles.btnContent}>
          AI Recipe Import
        </Button>
      </Link>
      <Link href="/custom-food" asChild>
        <Button mode="outlined" icon="plus" style={styles.btn} contentStyle={styles.btnContent}>
          Create Custom Food
        </Button>
      </Link>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f7fafc', justifyContent: 'center', alignItems: 'center', padding: 32 },
  emoji: { fontSize: 64, marginBottom: 16 },
  title: { fontSize: 26, fontWeight: '700', color: '#1a202c', marginBottom: 8 },
  sub: { fontSize: 15, color: '#718096', textAlign: 'center', marginBottom: 40, lineHeight: 22 },
  btn: { width: '100%', borderRadius: 12, marginBottom: 12 },
  btnContent: { height: 52 },
});
