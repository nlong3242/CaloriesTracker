import { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Alert, ScrollView, Platform } from 'react-native';
import { TextInput, Button } from 'react-native-paper';
import { getApiKey, saveApiKey, deleteApiKey } from '../src/api/claude';
import { getUsdaApiKey, saveUsdaApiKey, deleteUsdaApiKey } from '../src/api/usda';

function webConfirm(message: string): boolean {
  return Platform.OS === 'web' && typeof window !== 'undefined' && window.confirm(message);
}

export default function SettingsScreen() {
  const [apiKey, setApiKey] = useState('');
  const [saved, setSaved] = useState(false);
  const [hasKey, setHasKey] = useState(false);

  const [usdaKey, setUsdaKey] = useState('');
  const [usdaSaved, setUsdaSaved] = useState(false);
  const [hasUsdaKey, setHasUsdaKey] = useState(false);

  useEffect(() => {
    getApiKey().then(k => {
      if (k) { setHasKey(true); setApiKey('•'.repeat(20)); }
    });
    getUsdaApiKey().then(k => {
      if (k) { setHasUsdaKey(true); setUsdaKey('•'.repeat(20)); }
    });
  }, []);

  async function handleSave() {
    if (!apiKey.startsWith('sk-ant-')) {
      Alert.alert('Invalid key', 'Anthropic API keys start with "sk-ant-"');
      return;
    }
    await saveApiKey(apiKey);
    setHasKey(true);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
    Alert.alert('Saved', 'API key saved securely on your device.');
  }

  async function doRemove() {
    await deleteApiKey();
    setApiKey('');
    setHasKey(false);
  }

  function handleRemove() {
    if (Platform.OS === 'web') {
      if (webConfirm('Remove Anthropic API key? This will disable AI features.')) doRemove();
      return;
    }
    Alert.alert('Remove API Key', 'This will disable AI features.', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Remove', style: 'destructive', onPress: doRemove },
    ]);
  }

  async function handleSaveUsda() {
    if (!usdaKey.trim() || usdaKey.length < 20) {
      Alert.alert('Invalid key', 'Paste your USDA FoodData Central API key.');
      return;
    }
    await saveUsdaApiKey(usdaKey.trim());
    setHasUsdaKey(true);
    setUsdaSaved(true);
    setTimeout(() => setUsdaSaved(false), 2000);
    Alert.alert('Saved', 'USDA key saved. Rate limit is now 1000 req/hour.');
  }

  async function doRemoveUsda() {
    await deleteUsdaApiKey();
    setUsdaKey('');
    setHasUsdaKey(false);
  }

  function handleRemoveUsda() {
    if (Platform.OS === 'web') {
      if (webConfirm('Remove USDA API key? Search will fall back to the 30/hr DEMO_KEY.')) doRemoveUsda();
      return;
    }
    Alert.alert('Remove USDA key', 'Search will fall back to the 30/hr DEMO_KEY.', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Remove', style: 'destructive', onPress: doRemoveUsda },
    ]);
  }

  return (
    <ScrollView style={styles.scroll} contentContainerStyle={styles.container}>
      <View style={styles.card}>
        <Text style={styles.title}>Anthropic API Key</Text>
        <Text style={styles.desc}>
          Required for AI Recipe Import and Nutrition Label scanning.{'\n'}
          Get a free key at console.anthropic.com
        </Text>

        <TextInput
          label="API Key"
          value={apiKey}
          onChangeText={v => { setApiKey(v); setHasKey(false); }}
          mode="outlined"
          secureTextEntry={hasKey}
          style={styles.input}
          placeholder="sk-ant-..."
          autoCapitalize="none"
          autoCorrect={false}
        />

        <View style={styles.btnRow}>
          <Button
            mode="contained"
            onPress={handleSave}
            disabled={hasKey}
            style={styles.btn}
          >
            {saved ? 'Saved ✓' : 'Save Key'}
          </Button>
          {hasKey && (
            <Button mode="outlined" onPress={handleRemove} style={styles.btn} textColor="#e53e3e">
              Remove
            </Button>
          )}
        </View>
      </View>

      <View style={styles.card}>
        <Text style={styles.title}>USDA API Key</Text>
        <Text style={styles.desc}>
          Without a personal key, food search uses the shared DEMO_KEY (30 req/hour, often rate-limited).{'\n'}
          Free key at fdc.nal.usda.gov/api-key-signup.html bumps you to 1000/hour.
        </Text>

        <TextInput
          label="USDA API Key"
          value={usdaKey}
          onChangeText={v => { setUsdaKey(v); setHasUsdaKey(false); }}
          mode="outlined"
          secureTextEntry={hasUsdaKey}
          style={styles.input}
          placeholder="Paste your USDA key"
          autoCapitalize="none"
          autoCorrect={false}
        />

        <View style={styles.btnRow}>
          <Button
            mode="contained"
            onPress={handleSaveUsda}
            disabled={hasUsdaKey}
            style={styles.btn}
          >
            {usdaSaved ? 'Saved ✓' : 'Save Key'}
          </Button>
          {hasUsdaKey && (
            <Button mode="outlined" onPress={handleRemoveUsda} style={styles.btn} textColor="#e53e3e">
              Remove
            </Button>
          )}
        </View>
      </View>

      <View style={styles.infoCard}>
        <Text style={styles.infoTitle}>Privacy</Text>
        <Text style={styles.infoText}>
          Your API key is stored securely in your device's secure storage and never sent to any server other than Anthropic's API.
          Recipe text and nutrition label images are sent directly to Anthropic when you use AI features.
        </Text>
      </View>

      <View style={styles.infoCard}>
        <Text style={styles.infoTitle}>Cost</Text>
        <Text style={styles.infoText}>
          AI recipe parsing costs approximately $0.001 per recipe. Label scanning is similar. You pay directly to Anthropic via your account — there's no markup.
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: { flex: 1, backgroundColor: '#f7fafc' },
  container: { padding: 16, paddingBottom: 40 },
  card: {
    backgroundColor: '#fff',
    borderRadius: 14,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 1,
  },
  title: { fontSize: 17, fontWeight: '700', color: '#1a202c', marginBottom: 6 },
  desc: { fontSize: 13, color: '#718096', lineHeight: 18, marginBottom: 16 },
  input: { marginBottom: 12 },
  btnRow: { flexDirection: 'row', gap: 12 },
  btn: { flex: 1 },
  infoCard: {
    backgroundColor: '#fff',
    borderRadius: 14,
    padding: 16,
    marginBottom: 12,
  },
  infoTitle: { fontSize: 14, fontWeight: '700', color: '#2d3748', marginBottom: 6 },
  infoText: { fontSize: 13, color: '#718096', lineHeight: 18 },
});
