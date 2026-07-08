import { useState } from "react";
import {
  Alert,
  Text,
  View,
  TextInput,
  StyleSheet,
  Pressable,
} from "react-native";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { KeyboardAwareScrollView } from "react-native-keyboard-controller";
import { Screen } from "@/components/Screen";
import { Button } from "@/components/Button";
import { resetPassword } from "@/services/authService";
import { Colors } from "@/constants/colors";

export default function ResetPassword() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const submit = async () => {
    try {
      setLoading(true);
      await resetPassword(email);
      setSent(true);
    } catch (e: any) {
      Alert.alert("Error", e.message);
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
          <View style={styles.logoCircle}>
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
              <Text style={styles.title}>Check your email</Text>
              <Text style={styles.subtitle}>
                We sent a reset link to{"\n"}
                <Text style={styles.emailHighlight}>{email}</Text>
              </Text>
            </View>

            <Button title="Back to Login" onPress={() => router.replace("/login")} />

            <Pressable
              onPress={() => setSent(false)}
              style={styles.resendWrap}
              hitSlop={8}
            >
              <Text style={styles.resendText}>Didn't get it? Try again</Text>
            </Pressable>
          </>
        ) : (
          <>
            {/* Form state */}
            <View style={styles.header}>
              <Text style={styles.title}>Reset password</Text>
              <Text style={styles.subtitle}>
                Enter your email and we'll send you a link to reset your
                password
              </Text>
            </View>

            <View style={styles.field}>
              <Text style={styles.label}>Email</Text>
              <View style={styles.inputWrap}>
                <Ionicons
                  name="mail-outline"
                  size={19}
                  color={Colors.muted}
                  style={styles.inputIcon}
                />
                <TextInput
                  placeholder="you@example.com"
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

            <Button
              title="Send Reset Link"
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
    backgroundColor: Colors.primary ?? "#22c55e",
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
    color: Colors.text,
    textAlign: "center",
    letterSpacing: -0.3,
  },
  subtitle: {
    fontSize: 14,
    color: Colors.muted,
    marginTop: 8,
    textAlign: "center",
    lineHeight: 20,
  },
  emailHighlight: {
    fontWeight: "700",
    color: Colors.text,
  },
  field: {
    marginBottom: 20,
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
  resendWrap: {
    alignSelf: "center",
    marginTop: 20,
  },
  resendText: {
    fontSize: 14,
    fontWeight: "600",
    color: Colors.primary ?? "#22c55e",
  },
});