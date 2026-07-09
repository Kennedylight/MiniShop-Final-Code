import { useEffect, useState } from "react";
import { ActivityIndicator, View } from "react-native";
import { Stack, useRouter, useSegments } from "expo-router";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { onAuthStateChanged, User } from "firebase/auth";
import { auth } from "@/services/firebase";
import StripeWrapper from "@/components/StripeWrapper";
import { KeyboardProvider } from "react-native-keyboard-controller";
import { loadStoredLanguage } from "@/services/i18n";

export default function RootLayout() {
  const [user, setUser] = useState<User | null | undefined>(undefined);
  const [isReady, setIsReady] = useState(false);
  const [languageLoaded, setLanguageLoaded] = useState(false);
  const router = useRouter();
  const segments = useSegments();
  const screenOptions = { headerShown: false };

  useEffect(() => {
    return onAuthStateChanged(auth, (u) => setUser(u));
  }, []);

  useEffect(() => {
    loadStoredLanguage().finally(() => setLanguageLoaded(true));
  }, []);

useEffect(() => {
  if (user === undefined || !languageLoaded) return;

  const currentRoute = segments[0] ?? "";

  const inProtected =
    currentRoute === "dashboard" || currentRoute === "admin";

  const inAuthOnly = ["", "login", "signup", "reset-password"].includes(
    currentRoute
  );

  if (!user && inProtected) {
    router.replace("/login");
    return;
  }

  if (user && inAuthOnly) {
    router.replace("/dashboard");
  }
}, [user, segments, languageLoaded]);

  if (user === undefined || !languageLoaded) {
    return (
      <SafeAreaProvider>
        <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
          <ActivityIndicator size="large" />
        </View>
      </SafeAreaProvider>
    );
  }

  return (
    <KeyboardProvider>
      <SafeAreaProvider>
        <StripeWrapper>
          <Stack screenOptions={screenOptions}>
            <Stack.Screen name="index" />
            <Stack.Screen name="login" />
            <Stack.Screen name="signup" />
            <Stack.Screen name="reset-password" />
            <Stack.Screen name="pricing" />
            <Stack.Screen name="dashboard" />
            <Stack.Screen name="admin" />
          </Stack>
        </StripeWrapper>
      </SafeAreaProvider>
    </KeyboardProvider>
  );
}