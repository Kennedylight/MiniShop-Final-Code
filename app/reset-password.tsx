import { useState } from "react";
import {
  Alert,
  Text,
  View,
  TextInput,
  StyleSheet,
  Pressable,
} from "react-native";
import { useTranslation } from "react-i18next";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { KeyboardAwareScrollView } from "react-native-keyboard-controller";
import { Screen } from "@/components/Screen";
import { Button } from "@/components/Button";
import { resetPassword } from "@/services/authService";
import { useTheme } from "@/context/ThemeContext";

export default function ResetPassword() {
  const { t } = useTranslation();
  const { colors } = useTheme();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const submit = async () => {
    try {
      setLoading(true);
      await resetPassword(email);
      setSent(true);
    } catch (e: any) {
      Alert.alert(t("auth.resetPassword.error"), e.message);
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

        {/* Icon */}
        <View style={styles.logoWrap}>
          <View style={[styles.logoCircle, { backgroundColor: colors.primary }]}>
            <Ionicons
              name={sent ? "checkmark" : "key-outline"}
              size={28}
              color="#fff"
            />
          </View>
        </View>

        {sent ? (
          <>
            {/* Success state */}
            <View style={styles.header}>
              <Text style={[styles.title, { color: colors.text }]}>
                Check your email
              </Text>
              <Text style={[styles.subtitle, { color: colors.muted }]}>
                We sent a reset link to{"\n"}
                <Text style={[styles.emailHighlight, { color: colors.text }]}>
                  {email}
                </Text>
              </Text>
            </View>

            <Button title={t("auth.resetPassword.backToLogin")} onPress={() => router.replace("/login")} />

            <Pressable
              onPress={() => setSent(false)}
              style={styles.resendWrap}
              hitSlop={8}
            >
              <Text style={[styles.resendText, { color: colors.primary }]}>
                {t("auth.resetPassword.didntGetIt")}
              </Text>
            </Pressable>
          </>
        ) : (
          <>
            {/* Form state */}
            <View style={styles.header}>
              <Text style={[styles.title, { color: colors.text }]}>
                {t("auth.resetPassword.title")}
              </Text>
              <Text style={[styles.subtitle, { color: colors.muted }]}>
                {t("auth.resetPassword.subtitle")}
              </Text>
            </View>

            <View style={styles.field}>
              <Text style={[styles.label, { color: colors.text }]}>
                {t("auth.resetPassword.email")}
              </Text>
              <View style={[styles.inputWrap, { 
                backgroundColor: colors.card || "#f5f5f7",
                borderColor: colors.border || "rgba(0,0,0,0.06)"
              }]}>
                <Ionicons
                  name="mail-outline"
                  size={19}
                  color={colors.muted}
                  style={styles.inputIcon}
                />
                <TextInput
                  placeholder={t("auth.resetPassword.emailPlaceholder")}
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

            <Button
              title={t("auth.resetPassword.sendResetLink")}
              onPress={submit}
              loading={loading}
            />
          </>
        )}
      </KeyboardAwareScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  scrollContent: {
    flexGrow: 1,
    justifyContent: "center",
    paddingVertical: 40,
  },
  backButton: {
    position: "absolute",
    top: 4,
    left: 4,
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
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
    marginBottom: 28,
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 26,
    fontWeight: "800",
    textAlign: "center",
    letterSpacing: -0.3,
  },
  subtitle: {
    fontSize: 14,
    marginTop: 8,
    textAlign: "center",
    lineHeight: 20,
  },
  emailHighlight: {
    fontWeight: "700",
  },
  field: {
    marginBottom: 20,
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
  resendWrap: {
    alignSelf: "center",
    marginTop: 20,
  },
  resendText: {
    fontSize: 14,
    fontWeight: "600",
  },
});