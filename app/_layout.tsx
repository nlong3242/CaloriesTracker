import { useEffect } from 'react';
import { Stack } from 'expo-router';
import { PaperProvider, MD3LightTheme } from 'react-native-paper';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { initDatabase } from '../src/db/database';
import { useUserStore } from '../src/store/userStore';

const queryClient = new QueryClient({
  defaultOptions: { queries: { staleTime: 5 * 60 * 1000 } },
});

const theme = {
  ...MD3LightTheme,
  colors: {
    ...MD3LightTheme.colors,
    primary: '#38a169',
    secondary: '#3182ce',
  },
};

export default function RootLayout() {
  const loadProfile = useUserStore(s => s.loadProfile);

  useEffect(() => {
    initDatabase()
      .then(() => loadProfile())
      .catch((err) => console.error('Database init failed:', err));
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <PaperProvider theme={theme}>
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="index" />
          <Stack.Screen name="onboarding/index" />
          <Stack.Screen name="onboarding/tdee" />
          <Stack.Screen name="onboarding/macros" />
          <Stack.Screen name="(tabs)" />
          <Stack.Screen name="custom-food" options={{ presentation: 'modal', headerShown: true, title: 'Create Custom Food' }} />
          <Stack.Screen name="recipe-import" options={{ presentation: 'modal', headerShown: true, title: 'Import Recipe' }} />
          <Stack.Screen name="micronutrients" options={{ headerShown: true, title: 'Micronutrients' }} />
          <Stack.Screen name="settings" options={{ headerShown: true, title: 'Settings' }} />
        </Stack>
      </PaperProvider>
    </QueryClientProvider>
  );
}
