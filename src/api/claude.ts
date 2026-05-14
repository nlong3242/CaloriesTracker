import Anthropic from '@anthropic-ai/sdk';
import * as SecureStore from 'expo-secure-store';

const API_KEY_STORAGE_KEY = 'anthropic_api_key';

export async function getApiKey(): Promise<string | null> {
  return SecureStore.getItemAsync(API_KEY_STORAGE_KEY);
}

export async function saveApiKey(key: string): Promise<void> {
  await SecureStore.setItemAsync(API_KEY_STORAGE_KEY, key);
}

export async function deleteApiKey(): Promise<void> {
  await SecureStore.deleteItemAsync(API_KEY_STORAGE_KEY);
}

function getClient(apiKey: string): Anthropic {
  return new Anthropic({ apiKey, dangerouslyAllowBrowser: true });
}

export interface ParsedIngredient {
  name: string;
  amount: number;
  unit: string;
  amount_g: number | null;
}

export async function parseRecipeText(
  recipeText: string,
  apiKey: string
): Promise<ParsedIngredient[]> {
  const client = getClient(apiKey);

  const message = await client.messages.create({
    model: 'claude-haiku-4-5',
    max_tokens: 1024,
    messages: [
      {
        role: 'user',
        content: `Extract all ingredients from this recipe. Return ONLY a JSON array with no markdown formatting.

Each item must have: name (string), amount (number), unit (string), amount_g (number or null - convert to grams if possible, null if can't convert).

Common conversions: 1 cup flour≈125g, 1 cup sugar≈200g, 1 cup water≈240g, 1 tbsp≈15g, 1 tsp≈5g, 1 oz≈28g, 1 lb≈454g.

Recipe:
${recipeText}

Return only the JSON array, nothing else.`,
      },
    ],
  });

  const content = message.content[0];
  if (content.type !== 'text') throw new Error('Unexpected response from Claude');

  const text = content.text.trim();
  const parsed = JSON.parse(text);
  if (!Array.isArray(parsed)) throw new Error('Expected array from Claude');
  return parsed as ParsedIngredient[];
}

export async function parseNutritionLabel(
  base64Image: string,
  mediaType: 'image/jpeg' | 'image/png' | 'image/webp',
  apiKey: string
) {
  const client = getClient(apiKey);

  const message = await client.messages.create({
    model: 'claude-haiku-4-5',
    max_tokens: 1024,
    messages: [
      {
        role: 'user',
        content: [
          {
            type: 'image',
            source: { type: 'base64', media_type: mediaType, data: base64Image },
          },
          {
            type: 'text',
            text: `Read this nutrition facts label. Return ONLY a JSON object with no markdown.

Fields (all numbers, use 0 if not present):
{
  "product_name": string,
  "serving_size_g": number,
  "serving_description": string,
  "calories": number,
  "protein_g": number,
  "carbs_g": number,
  "fat_g": number,
  "fiber_g": number,
  "sugar_g": number,
  "sodium_mg": number,
  "saturated_fat_g": number,
  "cholesterol_mg": number,
  "vitamin_a_mcg": number,
  "vitamin_c_mg": number,
  "vitamin_d_mcg": number,
  "calcium_mg": number,
  "iron_mg": number,
  "potassium_mg": number
}

Return only the JSON object, nothing else.`,
          },
        ],
      },
    ],
  });

  const content = message.content[0];
  if (content.type !== 'text') throw new Error('Unexpected response from Claude');
  return JSON.parse(content.text.trim());
}
