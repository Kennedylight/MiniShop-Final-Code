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
import { registerOwner } from "@/services/authService";
import { useTheme } from "@/context/ThemeContext";
import { KeyboardAwareScrollView } from "react-native-keyboard-controller";
import { fontFamily } from "@/constants/typography";
import { getErrorMessage } from "@/lib/errors";

export default function Signup() {
  const { t } = useTranslation();
  const { colors } = useTheme();
  const [fullName, setFullName] = useState("");
  const [shopName, setShopName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [whatsapp, setWhatsapp] = useState("");

  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const submit = async () => {
    try {
      setLoading(true);
      await registerOwner({ fullName, shopName, email, password, whatsapp });
      router.replace("/pricing");
    } catch (e) {
      Alert.alert(t("auth.signup.signupFailed"), getErrorMessage(e));
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
          <View style={[styles.logoCircle, { backgroundColor: colors.primary, shadowColor: colors.shadow }]}>
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

        <View style={styles.field}>
          <Input
            label={t("auth.signup.fullName")}
            icon="person-outline"
            placeholder={t("auth.signup.fullName")}
            autoCapitalize="words"
            value={fullName}
            onChangeText={setFullName}
          />
        </View>

        <View style={styles.field}>
          <Input
            label={t("auth.signup.shopName")}
            icon="storefront-outline"
            placeholder={t("auth.signup.shopName")}
            autoCapitalize="words"
            value={shopName}
            onChangeText={setShopName}
          />
        </View>

        <View style={styles.field}>
          <Input
            label={t("auth.signup.email")}
            icon="mail-outline"
            placeholder={t("auth.signup.emailPlaceholder")}
            autoCapitalize="none"
            keyboardType="email-address"
            autoComplete="email"
            value={email}
            onChangeText={setEmail}
          />
        </View>

        <View style={styles.field}>
          <Input
            label={t("auth.signup.whatsapp")}
            icon="logo-whatsapp"
            placeholder={t("auth.signup.whatsapp")}
            keyboardType="phone-pad"
            value={whatsapp}
            onChangeText={setWhatsapp}
          />
        </View>

        <View style={styles.field}>
          <Input
            label={t("auth.signup.password")}
            icon="lock-closed-outline"
            placeholder={t("auth.signup.passwordPlaceholder")}
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

        {/* Submit */}
        <Button title={t("auth.signup.createAccount")} onPress={submit} loading={loading} />

        {/* Login link */}
        <View style={styles.loginRow}>
          <Text style={[styles.loginText, { color: colors.muted }]}>
            {t("auth.signup.alreadyHaveAccount")}{" "}
          </Text>
          <Pressable onPress={() => router.push("/login")} hitSlop={8}>
            <Text style={[styles.loginLink, { color: colors.orange }]}>
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
    fontSize: 26,
    textAlign: "center",
    letterSpacing: -0.3,
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
  loginRow: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 24,
  },
  loginText: {
    fontFamily: fontFamily.sansRegular,
    fontSize: 14,
  },
  loginLink: {
    fontFamily: fontFamily.sansBold,
    fontSize: 14,
  },
});
