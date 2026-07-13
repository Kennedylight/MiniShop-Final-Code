import { useEffect, useState, useCallback, type ReactNode } from "react";
import { ActivityIndicator, View } from "react-native";
import { Stack, useRouter, useSegments } from "expo-router";
import { SafeAreaProvider } from "react-native-safe-area-context";
import {
  DefaultTheme,
  DarkTheme,
  ThemeProvider as NavigationThemeProvider,
} from "@react-navigation/native";
import { onAuthStateChanged, User } from "firebase/auth";
import * as SplashScreen from "expo-splash-screen";
import { auth } from "@/services/firebase";
// eslint-disable-next-line import/no-unresolved -- résolu via les fichiers .native.tsx/.web.tsx (Metro), que le resolver ESLint ne comprend pas
import StripeWrapper from "@/components/StripeWrapper";
import { KeyboardProvider } from "react-native-keyboard-controller";
import { loadStoredLanguage } from "@/services/i18n";
import { ThemeProvider, useTheme } from "@/context/ThemeContext";
import { useAppFonts } from "@/constants/typography";

SplashScreen.preventAutoHideAsync().catch(() => undefined);

// Aligne le fond des écrans natifs (react-native-screens) et de la zone
// derrière la tab bar aux coins arrondis sur nos propres couleurs : sans ça,
// ces zones retombent sur le blanc/noir par défaut de React Navigation.
function NavigationThemeBridge({ children }: { children: ReactNode }) {
  const { resolved, colors } = useTheme();
  const base = resolved === "dark" ? DarkTheme : DefaultTheme;
  const navTheme = {
    ...base,
    dark: resolved === "dark",
    colors: {
      ...base.colors,
      primary: colors.orange,
      background: colors.bg,
      card: colors.card,
      text: colors.text,
      border: colors.border,
      notification: colors.orange,
    },
  };
  return <NavigationThemeProvider value={navTheme}>{children}</NavigationThemeProvider>;
}

export default function RootLayout() {
  const [user, setUser] = useState<User | null | undefined>(undefined);
  const [languageLoaded, setLanguageLoaded] = useState(false);
  const [fontsLoaded] = useAppFonts();
  const router = useRouter();
  const segments = useSegments();
  const screenOptions = { headerShown: false };

  useEffect(() => {
    return onAuthStateChanged(auth, (u) => setUser(u));
  }, []);

  useEffect(() => {
    loadStoredLanguage().finally(() => setLanguageLoaded(true));
  }, []);

  const onLayoutRootView = useCallback(() => {
    if (user !== undefined && languageLoaded && fontsLoaded) {
      SplashScreen.hideAsync().catch(() => undefined);
    }
  }, [user, languageLoaded, fontsLoaded]);

  useEffect(() => {
    onLayoutRootView();
  }, [onLayoutRootView]);

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
    router.replace("/dashboard/products");
  }
}, [user, segments, languageLoaded]);

  if (user === undefined || !languageLoaded || !fontsLoaded) {
    return (
      <SafeAreaProvider>
        <ThemeProvider>
          <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
            <ActivityIndicator size="large" />
          </View>
        </ThemeProvider>
      </SafeAreaProvider>
    );
  }

  return (
    <KeyboardProvider>
      <SafeAreaProvider>
        <StripeWrapper>
          <ThemeProvider>
            <NavigationThemeBridge>
              <Stack screenOptions={screenOptions}>
                <Stack.Screen name="index" />
                <Stack.Screen name="login" />
                <Stack.Screen name="signup" />
                <Stack.Screen name="reset-password" />
                <Stack.Screen name="pricing" />
                <Stack.Screen name="dashboard" />
                <Stack.Screen name="admin" />
              </Stack>
            </NavigationThemeBridge>
          </ThemeProvider>
        </StripeWrapper>
      </SafeAreaProvider>
    </KeyboardProvider>
  );
}