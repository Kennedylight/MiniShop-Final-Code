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
import { Colors } from "@/constants/colors";

import { CurrencyPicker } from "@/components/CurrencyPicker";
import { KeyboardAwareScrollView } from "react-native-keyboard-controller";
import { DEFAULT_CURRENCY } from "@/constants/currency";

export default function Signup() {
  const { t } = useTranslation();
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
      await registerOwner({ fullName, shopName, email, password, whatsapp });
      router.replace("/pricing");
    } catch (e: any) {
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
          <View style={styles.logoCircle}>
            <Ionicons name="storefront" size={30} color="#fff" />
          </View>
        </View>

        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>{t("auth.signup.title")}</Text>
          <Text style={styles.subtitle}>{t("auth.signup.subtitle")}</Text>
        </View>

        {/* Full name */}
        <View style={styles.field}>
          <Text style={styles.label}>{t("auth.signup.fullName")}</Text>
          <View style={styles.inputWrap}>
            <Ionicons
              name="person-outline"
              size={19}
              color={Colors.muted}
              style={styles.inputIcon}
            />
            <TextInput
              placeholder={t("auth.signup.fullName")}
              placeholderTextColor={Colors.muted}
              autoCapitalize="words"
              value={fullName}
              onChangeText={setFullName}
              style={styles.input}
            />
          </View>
        </View>

        {/* Shop name */}
        <View style={styles.field}>
          <Text style={styles.label}>{t("auth.signup.shopName")}</Text>
          <View style={styles.inputWrap}>
            <Ionicons
              name="storefront-outline"
              size={19}
              color={Colors.muted}
              style={styles.inputIcon}
            />
            <TextInput
              placeholder={t("auth.signup.shopName")}
              placeholderTextColor={Colors.muted}
              autoCapitalize="words"
              value={shopName}
              onChangeText={setShopName}
              style={styles.input}
            />
          </View>
        </View>

        {/* Email */}
        <View style={styles.field}>
          <Text style={styles.label}>{t("auth.signup.email")}</Text>
          <View style={styles.inputWrap}>
            <Ionicons
              name="mail-outline"
              size={19}
              color={Colors.muted}
              style={styles.inputIcon}
            />
            <TextInput
              placeholder={t("auth.signup.emailPlaceholder")}
              placeholderTextColor={Colors.muted}
              autoCapitalize="none"
              keyboardType="email-address"
              autoComplete="email"
              value={email}
              onChangeText={setEmail}
              style={styles.input}
            />
          </View>
        </View>

        {/* WhatsApp */}
        <View style={styles.field}>
          <Text style={styles.label}>{t("auth.signup.whatsapp")}</Text>
          <View style={styles.inputWrap}>
            <Ionicons
              name="logo-whatsapp"
              size={19}
              color={Colors.muted}
              style={styles.inputIcon}
            />
            <TextInput
              placeholder={t("auth.signup.whatsapp")}
              placeholderTextColor={Colors.muted}
              keyboardType="phone-pad"
              value={whatsapp}
              onChangeText={setWhatsapp}
              style={styles.input}
            />
          </View>
        </View>

        {/*choice the device that we will use */}
        <View style={styles.fieldWrap}>
          <Text style={styles.fieldLabel}>{t("auth.signup.currency")}</Text>
          <CurrencyPicker value={currency} onChange={setCurrency} />
        </View>
        {/* Password */}
        <View style={styles.field}>
          <Text style={styles.label}>{t("auth.signup.password")}</Text>
          <View style={styles.inputWrap}>
            <Ionicons
              name="lock-closed-outline"
              size={19}
              color={Colors.muted}
              style={styles.inputIcon}
            />
            <TextInput
              placeholder={t("auth.signup.passwordPlaceholder")}
              placeholderTextColor={Colors.muted}
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
                color={Colors.muted}
              />
            </Pressable>
          </View>
        </View>

        {/* Submit */}
        <Button title={t("auth.signup.createAccount")} onPress={submit} loading={loading} />

        {/* Login link */}
        <View style={styles.loginRow}>
          <Text style={styles.loginText}>{t("auth.signup.alreadyHaveAccount")} </Text>
          <Pressable onPress={() => router.push("/login")} hitSlop={8}>
            <Text style={styles.loginLink}>{t("auth.signup.login")}</Text>
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
    backgroundColor: Colors.primary ?? "#22c55e",
    alignItems: "center",
    justifyContent: "center",
  },
  fieldWrap: { marginBottom: 16 },
  fieldLabel: {
    fontSize: 13,
    fontWeight: "600",
    color: Colors.text,
    marginBottom: 6,
  },
  header: {
    alignItems: "center",
    marginBottom: 28,
  },
  title: {
    fontSize: 26,
    fontWeight: "800",
    color: Colors.text,
    textAlign: "center",
    letterSpacing: -0.3,
  },
  subtitle: {
    fontSize: 14,
    color: Colors.muted,
    marginTop: 6,
    textAlign: "center",
  },
  field: {
    marginBottom: 16,
  },
  label: {
    fontSize: 13,
    fontWeight: "600",
    color: Colors.text,
    marginBottom: 6,
  },
  inputWrap: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.card ?? "#f5f5f7",
    borderRadius: 14,
    borderWidth: 1,
    borderColor: Colors.border ?? "rgba(0,0,0,0.06)",
    paddingHorizontal: 14,
  },
  inputIcon: {
    marginRight: 8,
  },
  input: {
    flex: 1,
    height: 50,
    fontSize: 15,
    color: Colors.text,
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
    color: Colors.muted,
  },
  loginLink: {
    fontSize: 14,
    fontWeight: "700",
    color: Colors.primary ?? "#22c55e",
  },
});
