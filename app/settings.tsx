import { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Alert, ScrollView } from 'react-native';
import { TextInput, Button } from 'react-native-paper';
import { getApiKey, saveApiKey, deleteApiKey } from '../src/api/claude';

export default function SettingsScreen() {
  const [apiKey, setApiKey] = useState('');
  const [saved, setSaved] = useState(false);
  const [hasKey, setHasKey] = useState(false);

  useEffect(() => {
    getApiKey().then(k => {
      if (k) { setHasKey(true); setApiKey('•'.repeat(20)); }
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

  async function handleRemove() {
    Alert.alert('Remove API Key', 'This will disable AI features.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Remove', style: 'destructive',
        onPress: async () => {
          await deleteApiKey();
          setApiKey('');
          setHasKey(false);
        },
      },
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
