import { useEffect, useState } from 'react';
import { ActivityIndicator, View } from 'react-native';
import { Stack, useRouter, useSegments } from 'expo-router';
import { StripeProvider } from '@stripe/stripe-react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { onAuthStateChanged, User } from 'firebase/auth';
import { auth } from '@/services/firebase';

export default function RootLayout() {
  const [user, setUser] = useState<User | null | undefined>(undefined);
  const router = useRouter();
  const segments = useSegments();

  useEffect(() => {
    return onAuthStateChanged(auth, u => setUser(u));
  }, []);

  useEffect(() => {
    if (user === undefined) return;
    const inProtected = segments[0] === 'dashboard' || segments[0] === 'admin';
    const inAuthOnly = ['', 'login', 'signup', 'reset-password'].includes(segments[0] ?? '');
    if (!user && inProtected) {
      router.replace('/login');
    } else if (user && inAuthOnly) {
      router.replace('/dashboard');
    }
  }, [user, segments]);

  if (user === undefined) {
    return (
      <SafeAreaProvider>
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
          <ActivityIndicator size="large" />
        </View>
      </SafeAreaProvider>
    );
  }

  return (
    <SafeAreaProvider>
      <StripeProvider publishableKey={process.env.EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY || ''}>
        <Stack screenOptions={{ headerShown: false }} />
      </StripeProvider>
    </SafeAreaProvider>
  );
}
