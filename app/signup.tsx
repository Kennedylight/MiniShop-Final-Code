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
import { registerOwner } from "@/services/authService";
import { CurrencyPicker } from "@/components/CurrencyPicker";
import { useTheme } from "@/context/ThemeContext";
import { KeyboardAwareScrollView } from "react-native-keyboard-controller";
import { DEFAULT_CURRENCY } from "@/constants/currency";

export default function Signup() {
  const { t } = useTranslation();
  const { colors } = useTheme();
  const [fullName, setFullName] = useState("");
  const [shopName, setShopName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [whatsapp, setWhatsapp] = useState("");

  const [currency, setCurrency] = useState(DEFAULT_CURRENCY);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const submit = async () => {
    try {
      setLoading(true);
      await registerOwner({ fullName, shopName, email, password, whatsapp, currency });
      router.replace("/pricing");
    } catch (e: any) {
      console.log("Signup error:", e);
      console.log("Response:", e?.response?.data);
      console.log("Status:", e?.response?.status);
      console.log("URL:", e?.config?.url);
      console.log("Method:", e?.config?.method);
      Alert.alert(t("auth.signup.signupFailed"), e.message);
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
        {/* Logo */}
        <View style={styles.logoWrap}>
          <View style={[styles.logoCircle, { backgroundColor: colors.primary }]}>
            <Ionicons name="storefront" size={30} color="#fff" />
          </View>
        </View>

        {/* Header */}
        <View style={styles.header}>
          <Text style={[styles.title, { color: colors.text }]}>
            {t("auth.signup.title")}
          </Text>
          <Text style={[styles.subtitle, { color: colors.muted }]}>
            {t("auth.signup.subtitle")}
          </Text>
        </View>

        {/* Full name */}
        <View style={styles.field}>
          <Text style={[styles.label, { color: colors.text }]}>
            {t("auth.signup.fullName")}
          </Text>
          <View style={[styles.inputWrap, { 
            backgroundColor: colors.card,
            borderColor: colors.border || 'rgba(0,0,0,0.06)'
          }]}>
            <Ionicons
              name="person-outline"
              size={19}
              color={colors.muted}
              style={styles.inputIcon}
            />
            <TextInput
              placeholder={t("auth.signup.fullName")}
              placeholderTextColor={colors.muted}
              autoCapitalize="words"
              value={fullName}
              onChangeText={setFullName}
              style={[styles.input, { color: colors.text }]}
            />
          </View>
        </View>

        {/* Shop name */}
        <View style={styles.field}>
          <Text style={[styles.label, { color: colors.text }]}>
            {t("auth.signup.shopName")}
          </Text>
          <View style={[styles.inputWrap, { 
            backgroundColor: colors.card,
            borderColor: colors.border || 'rgba(0,0,0,0.06)'
          }]}>
            <Ionicons
              name="storefront-outline"
              size={19}
              color={colors.muted}
              style={styles.inputIcon}
            />
            <TextInput
              placeholder={t("auth.signup.shopName")}
              placeholderTextColor={colors.muted}
              autoCapitalize="words"
              value={shopName}
              onChangeText={setShopName}
              style={[styles.input, { color: colors.text }]}
            />
          </View>
        </View>

        {/* Email */}
        <View style={styles.field}>
          <Text style={[styles.label, { color: colors.text }]}>
            {t("auth.signup.email")}
          </Text>
          <View style={[styles.inputWrap, { 
            backgroundColor: colors.card,
            borderColor: colors.border || 'rgba(0,0,0,0.06)'
          }]}>
            <Ionicons
              name="mail-outline"
              size={19}
              color={colors.muted}
              style={styles.inputIcon}
            />
            <TextInput
              placeholder={t("auth.signup.emailPlaceholder")}
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

        {/* WhatsApp */}
        <View style={styles.field}>
          <Text style={[styles.label, { color: colors.text }]}>
            {t("auth.signup.whatsapp")}
          </Text>
          <View style={[styles.inputWrap, { 
            backgroundColor: colors.card,
            borderColor: colors.border || 'rgba(0,0,0,0.06)'
          }]}>
            <Ionicons
              name="logo-whatsapp"
              size={19}
              color={colors.muted}
              style={styles.inputIcon}
            />
            <TextInput
              placeholder={t("auth.signup.whatsapp")}
              placeholderTextColor={colors.muted}
              keyboardType="phone-pad"
              value={whatsapp}
              onChangeText={setWhatsapp}
              style={[styles.input, { color: colors.text }]}
            />
          </View>
        </View>

        {/* Currency */}
        <View style={styles.fieldWrap}>
          <Text style={[styles.fieldLabel, { color: colors.text }]}>
            {t("auth.signup.currency")}
          </Text>
          <CurrencyPicker value={currency} onChange={setCurrency} />
          <Text style={[styles.currencyHint, { color: colors.muted }]}>
            {t("auth.signup.currencyLocked")}
          </Text>
        </View>

        {/* Password */}
        <View style={styles.field}>
          <Text style={[styles.label, { color: colors.text }]}>
            {t("auth.signup.password")}
          </Text>
          <View style={[styles.inputWrap, { 
            backgroundColor: colors.card,
            borderColor: colors.border || 'rgba(0,0,0,0.06)'
          }]}>
            <Ionicons
              name="lock-closed-outline"
              size={19}
              color={colors.muted}
              style={styles.inputIcon}
            />
            <TextInput
              placeholder={t("auth.signup.passwordPlaceholder")}
              placeholderTextColor={colors.muted}
              secureTextEntry={!showPassword}
              autoCapitalize="none"
              value={password}
              onChangeText={setPassword}
              style={[styles.input, { color: colors.text, paddingRight: 40 }]}
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

        {/* Submit */}
        <Button title={t("auth.signup.createAccount")} onPress={submit} loading={loading} />

        {/* Login link */}
        <View style={styles.loginRow}>
          <Text style={[styles.loginText, { color: colors.muted }]}>
            {t("auth.signup.alreadyHaveAccount")}{" "}
          </Text>
          <Pressable onPress={() => router.push("/login")} hitSlop={8}>
            <Text style={[styles.loginLink, { color: colors.primary }]}>
              {t("auth.signup.login")}
            </Text>
          </Pressable>
        </View>
      </KeyboardAwareScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 20,
    justifyContent: "center",
    paddingVertical: 40,
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
  fieldWrap: {
    marginBottom: 16
  },
  currencyHint: {
    fontSize: 12,
    marginTop: 6,
  },
  fieldLabel: {
    fontSize: 13,
    fontWeight: "600",
    marginBottom: 6,
  },
  header: {
    alignItems: "center",
    marginBottom: 28,
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
  loginRow: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 20,
  },
  loginText: {
    fontSize: 14,
  },
  loginLink: {
    fontSize: 14,
    fontWeight: "700",
  },
});