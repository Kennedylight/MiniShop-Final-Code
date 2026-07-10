import { useState } from "react";
import {
  Alert,
  Text,
  View,
  TextInput,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Pressable,
} from "react-native";
import { useTranslation } from "react-i18next";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { Screen } from "@/components/Screen";
import { Button } from "@/components/Button";
import { loginOwner } from "@/services/authService";
import { KeyboardAwareScrollView } from "react-native-keyboard-controller";
import { useTheme } from "@/context/ThemeContext";

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
      router.replace("/dashboard");
    } catch (e: any) {
      Alert.alert(t("auth.login.loginFailed"), e.message);
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
          <View style={[styles.logoCircle, { backgroundColor: colors.primary }]}>
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
          <Text style={[styles.label, { color: colors.text }]}>{t("auth.login.email")}</Text>
          <View style={styles.inputWrap}>
            <Ionicons
              name="mail-outline"
              size={19}
              color={colors.muted}
              style={styles.inputIcon}
            />
            <TextInput
              placeholder={t("auth.login.emailPlaceholder")}
              placeholderTextColor={colors.muted}
              autoCapitalize="none"
              keyboardType="email-address"
              autoComplete="email"
              value={email}
              onChangeText={setEmail}
              style={[styles.input, { color: colors.text }]}
            />
          </View>
        </View>

        {/* Password field */}
        <View style={styles.field}>
          <Text style={[styles.label, { color: colors.text }]}>{t("auth.login.password")}</Text>
          <View style={styles.inputWrap}>
            <Ionicons
              name="lock-closed-outline"
              size={19}
              color={colors.muted}
              style={styles.inputIcon}
            />
            <TextInput
              placeholder={t("auth.login.passwordPlaceholder")}
              placeholderTextColor={colors.muted}
              secureTextEntry={!showPassword}
              autoCapitalize="none"
              value={password}
              onChangeText={setPassword}
              style={[styles.input, { paddingRight: 40 }]}
            />
            <Pressable
              onPress={() => setShowPassword((v) => !v)}
              style={styles.eyeButton}
              hitSlop={10}
            >
              <Ionicons
                name={showPassword ? "eye-off-outline" : "eye-outline"}
                size={20}
                color={colors.muted}
              />
            </Pressable>
          </View>
        </View>

        {/* Forgot password */}
        <Pressable
          onPress={() => router.push("/reset-password")}
          style={styles.forgotWrap}
          hitSlop={8}
        >
          <Text style={[styles.forgotText, { color: colors.primary }]}> 
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
            <Text style={[styles.signupLink, { color: colors.primary }]}>{t("auth.login.createOne")}</Text>
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
    marginBottom: 20,
  },
  logoCircle: {
    width: 64,
    height: 64,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  header: {
    alignItems: "center",
    marginBottom: 32,
  },
  title: {
    fontSize: 26,
    fontWeight: "800",
    textAlign: "center",
    letterSpacing: -0.3,
  },
  subtitle: {
    fontSize: 14,
    marginTop: 6,
    textAlign: "center",
  },
  field: {
    marginBottom: 16,
  },
  label: {
    fontSize: 13,
    fontWeight: "600",
    marginBottom: 6,
  },
  inputWrap: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 14,
    borderWidth: 1,
    paddingHorizontal: 14,
  },
  inputIcon: {
    marginRight: 8,
  },
  input: {
    flex: 1,
    height: 50,
    fontSize: 15,
  },
  eyeButton: {
    position: "absolute",
    right: 14,
    padding: 4,
  },
  forgotWrap: {
    alignSelf: "flex-end",
    marginBottom: 20,
  },
  forgotText: {
    fontSize: 13,
    fontWeight: "600",
  },
  signupRow: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 20,
  },
  signupText: {
    fontSize: 14,
  },
  signupLink: {
    fontSize: 14,
    fontWeight: "700",
  },
});
