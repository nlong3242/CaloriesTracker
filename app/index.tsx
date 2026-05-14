import { useEffect } from 'react';
import { Redirect } from 'expo-router';
import { useUserStore } from '../src/store/userStore';
import { View, ActivityIndicator } from 'react-native';

export default function Index() {
  const { profile, isLoaded } = useUserStore();

  if (!isLoaded) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#38a169" />
      </View>
    );
  }

  if (!profile || !profile.setup_complete) {
    return <Redirect href="/onboarding" />;
  }

  return <Redirect href="/(tabs)" />;
}
