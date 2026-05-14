import { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Alert, FlatList } from 'react-native';
import { useRouter } from 'expo-router';
import { TextInput, Button, ActivityIndicator } from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';
import { parseRecipeText, ParsedIngredient, getApiKey } from '../src/api/claude';
import { searchFoods, parseNutrients } from '../src/api/usda';
import { searchCustomFoods } from '../src/db/queries/foods';
import { createCustomFood } from '../src/db/queries/foods';

interface MatchedIngredient extends ParsedIngredient {
  matched_name?: string;
  calories?: number;
  protein_g?: number;
  carbs_g?: number;
  fat_g?: number;
}

export default function RecipeImportScreen() {
  const router = useRouter();
  const [recipeName, setRecipeName] = useState('');
  const [servings, setServings] = useState('4');
  const [recipeText, setRecipeText] = useState('');
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState<'input' | 'review'>('input');
  const [ingredients, setIngredients] = useState<MatchedIngredient[]>([]);

  async function handleParse() {
    const apiKey = await getApiKey();
    if (!apiKey) {
      Alert.alert(
        'API Key Required',
        'Please add your Anthropic API key in Profile → Settings to use AI recipe import.',
        [{ text: 'OK' }]
      );
      return;
    }
    if (!recipeText.trim()) {
      Alert.alert('Paste your recipe first');
      return;
    }
    setLoading(true);
    try {
      const parsed = await parseRecipeText(recipeText, apiKey);

      // Match each ingredient to USDA or custom food
      const matched = await Promise.all(
        parsed.map(async (ing): Promise<MatchedIngredient> => {
          try {
            const custom = searchCustomFoods(ing.name);
            if (custom.length > 0) {
              const f = custom[0];
              const ratio = (ing.amount_g ?? 100) / f.serving_size_g;
              return {
                ...ing,
                matched_name: f.name,
                calories: f.calories * ratio,
                protein_g: f.protein_g * ratio,
                carbs_g: f.carbs_g * ratio,
                fat_g: f.fat_g * ratio,
              };
            }
            const results = await searchFoods(ing.name, 1);
            if (results.length > 0) {
              const f = results[0];
              const n = parseNutrients(f.foodNutrients);
              const ratio = (ing.amount_g ?? 100) / 100;
              return {
                ...ing,
                matched_name: f.description,
                calories: n.calories * ratio,
                protein_g: n.protein_g * ratio,
                carbs_g: n.carbs_g * ratio,
                fat_g: n.fat_g * ratio,
              };
            }
          } catch {}
          return ing;
        })
      );
      setIngredients(matched);
      setStep('review');
    } catch (err: any) {
      Alert.alert('Error', err.message ?? 'Failed to parse recipe');
    } finally {
      setLoading(false);
    }
  }

  function saveAsFood() {
    if (!recipeName.trim()) { Alert.alert('Enter a recipe name'); return; }
    const totalServings = Number(servings) || 1;
    const totals = ingredients.reduce(
      (acc, ing) => ({
        cal: acc.cal + (ing.calories ?? 0),
        p: acc.p + (ing.protein_g ?? 0),
        c: acc.c + (ing.carbs_g ?? 0),
        f: acc.f + (ing.fat_g ?? 0),
      }),
      { cal: 0, p: 0, c: 0, f: 0 }
    );
    const totalG = ingredients.reduce((s, i) => s + (i.amount_g ?? 100), 0);

    createCustomFood({
      name: recipeName.trim(),
      brand: null,
      serving_size_g: totalG / totalServings,
      serving_description: `1 serving (of ${totalServings})`,
      calories: totals.cal / totalServings,
      protein_g: totals.p / totalServings,
      carbs_g: totals.c / totalServings,
      fat_g: totals.f / totalServings,
      fiber_g: 0, sugar_g: 0, sodium_mg: 0, saturated_fat_g: 0,
      cholesterol_mg: 0, vitamin_a_mcg: 0, vitamin_c_mg: 0,
      vitamin_d_mcg: 0, calcium_mg: 0, iron_mg: 0, potassium_mg: 0,
      source: 'recipe',
      external_id: null,
      barcode: null,
    });

    Alert.alert('Recipe Saved!', `${recipeName} saved as a custom food. You can now search for it when logging.`);
    router.back();
  }

  if (step === 'review') {
    const totalCal = ingredients.reduce((s, i) => s + (i.calories ?? 0), 0);
    return (
      <View style={styles.root}>
        <ScrollView contentContainerStyle={styles.container}>
          <Text style={styles.title}>Review Ingredients</Text>
          <Text style={styles.sub}>{ingredients.length} ingredients found · {Math.round(totalCal)} kcal total</Text>

          {ingredients.map((ing, i) => (
            <View key={i} style={styles.ingCard}>
              <View style={styles.ingHeader}>
                <Text style={styles.ingName}>{ing.amount} {ing.unit} {ing.name}</Text>
                {ing.amount_g && <Text style={styles.ingG}>{Math.round(ing.amount_g)}g</Text>}
              </View>
              {ing.matched_name ? (
                <Text style={styles.ingMatch}>
                  <Ionicons name="checkmark-circle" size={12} color="#38a169" /> {ing.matched_name}
                  {ing.calories != null && ` · ${Math.round(ing.calories)} kcal`}
                </Text>
              ) : (
                <Text style={styles.ingNoMatch}>⚠ No match found — will be excluded</Text>
              )}
            </View>
          ))}

          <TextInput
            label="Recipe Name"
            value={recipeName}
            onChangeText={setRecipeName}
            mode="outlined"
            style={styles.input}
          />
          <TextInput
            label="Number of Servings"
            value={servings}
            onChangeText={setServings}
            keyboardType="numeric"
            mode="outlined"
            style={styles.input}
          />

          <View style={styles.btnRow}>
            <Button onPress={() => setStep('input')} style={styles.btn}>Back</Button>
            <Button mode="contained" onPress={saveAsFood} style={styles.btn}>Save Recipe</Button>
          </View>
        </ScrollView>
      </View>
    );
  }

  return (
    <View style={styles.root}>
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.title}>AI Recipe Import</Text>
        <Text style={styles.sub}>
          Paste your full recipe below — ingredients, amounts, everything. Claude will extract and match each ingredient automatically.
        </Text>

        <TextInput
          label="Recipe Name"
          value={recipeName}
          onChangeText={setRecipeName}
          mode="outlined"
          style={styles.input}
        />

        <TextInput
          label="Paste recipe here"
          value={recipeText}
          onChangeText={setRecipeText}
          mode="outlined"
          multiline
          numberOfLines={14}
          style={[styles.input, styles.recipeBox]}
          placeholder={'Example:\n2 cups all-purpose flour\n1 cup whole milk\n3 large eggs\n2 tbsp butter\n...'}
        />

        <Button
          mode="contained"
          onPress={handleParse}
          loading={loading}
          disabled={loading}
          style={styles.parseBtn}
          contentStyle={styles.parseBtnContent}
          icon="robot"
        >
          {loading ? 'Analyzing...' : 'Parse with AI'}
        </Button>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#fff' },
  container: { padding: 20, paddingBottom: 48 },
  title: { fontSize: 22, fontWeight: '700', color: '#1a202c', marginBottom: 6 },
  sub: { fontSize: 14, color: '#718096', marginBottom: 20, lineHeight: 20 },
  input: { marginBottom: 12 },
  recipeBox: { minHeight: 180 },
  parseBtn: { borderRadius: 12 },
  parseBtnContent: { height: 52 },
  ingCard: {
    backgroundColor: '#f7fafc',
    borderRadius: 10,
    padding: 12,
    marginBottom: 8,
  },
  ingHeader: { flexDirection: 'row', justifyContent: 'space-between' },
  ingName: { fontSize: 14, fontWeight: '600', color: '#2d3748', flex: 1 },
  ingG: { fontSize: 13, color: '#718096' },
  ingMatch: { fontSize: 12, color: '#38a169', marginTop: 4 },
  ingNoMatch: { fontSize: 12, color: '#e53e3e', marginTop: 4 },
  btnRow: { flexDirection: 'row', gap: 12, marginTop: 20 },
  btn: { flex: 1 },
});
