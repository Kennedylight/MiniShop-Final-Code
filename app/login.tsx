import { useState } from "react";
import {
  Alert,
  Text,
  View,
  StyleSheet,
  Pressable,
} from "react-native";
import { useTranslation } from "react-i18next";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { Screen } from "@/components/Screen";
import { Button } from "@/components/Button";
import { Input } from "@/components/Input";
import { loginOwner } from "@/services/authService";
import { KeyboardAwareScrollView } from "react-native-keyboard-controller";
import { useTheme } from "@/context/ThemeContext";
import { fontFamily } from "@/constants/typography";
import { getErrorMessage } from "@/lib/errors";

export default function Login() {
  const { t } = useTranslation();
  const { colors } = useTheme();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const submit = async () => {
    try {
      setLoading(true);
      await loginOwner(email, password);
      router.replace("/dashboard/products");
    } catch (e) {
      Alert.alert(t("auth.login.loginFailed"), getErrorMessage(e));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Screen>
      <KeyboardAwareScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
        bottomOffset={40}
      >
        {/* Logo / Icon */}
        <View style={styles.logoWrap}>
          <View style={[styles.logoCircle, { backgroundColor: colors.primary, shadowColor: colors.shadow }]}>
            <Ionicons name="storefront" size={30} color="#fff" />
          </View>
        </View>

        {/* Centered header */}
        <View style={styles.header}>
          <Text style={[styles.title, { color: colors.text }]}>{t("auth.login.title")}</Text>
          <Text style={[styles.subtitle, { color: colors.muted }]}>{t("auth.login.subtitle")}</Text>
        </View>

        {/* Email field */}
        <View style={styles.field}>
          <Input
            label={t("auth.login.email")}
            icon="mail-outline"
            placeholder={t("auth.login.emailPlaceholder")}
            autoCapitalize="none"
            keyboardType="email-address"
            autoComplete="email"
            value={email}
            onChangeText={setEmail}
          />
        </View>

        {/* Password field */}
        <View style={styles.field}>
          <Input
            label={t("auth.login.password")}
            icon="lock-closed-outline"
            placeholder={t("auth.login.passwordPlaceholder")}
            secureTextEntry={!showPassword}
            autoCapitalize="none"
            value={password}
            onChangeText={setPassword}
            rightSlot={
              <Pressable onPress={() => setShowPassword((v) => !v)} hitSlop={10}>
                <Ionicons
                  name={showPassword ? "eye-off-outline" : "eye-outline"}
                  size={20}
                  color={colors.muted}
                />
              </Pressable>
            }
          />
        </View>

        {/* Forgot password */}
        <Pressable
          onPress={() => router.push("/reset-password")}
          style={styles.forgotWrap}
          hitSlop={8}
        >
          <Text style={[styles.forgotText, { color: colors.orange }]}>
            {t("auth.login.forgotPassword")}
          </Text>
        </Pressable>

        {/* Login button */}
        <Button
          title={t("auth.login.signIn")}
          onPress={submit}
          loading={loading}
        />

        {/* Sign up link */}
        <View style={styles.signupRow}>
          <Text style={[styles.signupText, { color: colors.muted }]}>{t("auth.login.noAccount")} </Text>
          <Pressable onPress={() => router.push("/signup")} hitSlop={8}>
            <Text style={[styles.signupLink, { color: colors.orange }]}>{t("auth.login.createOne")}</Text>
          </Pressable>
        </View>
      </KeyboardAwareScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  scrollContent: {
    flexGrow: 1,
    justifyContent: "center",
    paddingVertical: 40,
    paddingBottom: 20,
  },
  logoWrap: {
    alignItems: "center",
    marginBottom: 24,
  },
  logoCircle: {
    width: 68,
    height: 68,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
    shadowOpacity: 0.24,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 10 },
    elevation: 6,
  },
  header: {
    alignItems: "center",
    marginBottom: 32,
  },
  title: {
    fontFamily: fontFamily.displaySemiBold,
    fontSize: 28,
    textAlign: "center",
    letterSpacing: -0.4,
  },
  subtitle: {
    fontFamily: fontFamily.sansRegular,
    fontSize: 14,
    marginTop: 8,
    textAlign: "center",
  },
  field: {
    marginBottom: 16,
  },
  forgotWrap: {
    alignSelf: "flex-end",
    marginBottom: 24,
  },
  forgotText: {
    fontFamily: fontFamily.sansSemiBold,
    fontSize: 13,
  },
  signupRow: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 24,
  },
  signupText: {
    fontFamily: fontFamily.sansRegular,
    fontSize: 14,
  },
  signupLink: {
    fontFamily: fontFamily.sansBold,
    fontSize: 14,
  },
});
