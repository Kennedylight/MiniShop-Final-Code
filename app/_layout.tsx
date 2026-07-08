import { useEffect, useState } from "react";
import { ActivityIndicator, View } from "react-native";
import { Stack, useRouter, useSegments } from "expo-router";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { onAuthStateChanged, User } from "firebase/auth";
import { auth } from "@/services/firebase";
import StripeWrapper from "@/components/StripeWrapper";
import { KeyboardProvider } from "react-native-keyboard-controller";

export default function RootLayout() {
  const [user, setUser] = useState<User | null | undefined>(undefined);
  const [isReady, setIsReady] = useState(false);
  const router = useRouter();
  const segments = useSegments();

  useEffect(() => {
    return onAuthStateChanged(auth, (u) => setUser(u));
  }, []);

  useEffect(() => {
    if (user === undefined) return;

    const inProtected = segments[0] === "dashboard" || segments[0] === "admin";
    const inAuthOnly = ["", "login", "signup", "reset-password"].includes(
      segments[0] ?? ""
    );

    if (!user && inProtected) {
      setIsReady(false);
      router.replace("/login");
      return;
    }

    if (user && inAuthOnly) {
      setIsReady(false);
      router.replace("/dashboard");
      return;
    }

    // La route actuelle est cohérente avec l'état de connexion : on peut afficher
    setIsReady(true);
  }, [user, segments, router]);

  if (user === undefined || !isReady) {
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
          <Stack screenOptions={{ headerShown: false }}>
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