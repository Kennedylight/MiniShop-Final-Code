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
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { Screen } from "@/components/Screen";
import { Button } from "@/components/Button";
import { loginOwner } from "@/services/authService";
import { Colors } from "@/constants/colors";
import { KeyboardAwareScrollView } from "react-native-keyboard-controller";

export default function Login() {
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
      Alert.alert("Login Failed", e.message);
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
            <View style={styles.logoCircle}>
              <Ionicons name="storefront" size={30} color="#fff" />
            </View>
          </View>

          {/* Centered header */}
          <View style={styles.header}>
            <Text style={styles.title}>Welcome Back</Text>
            <Text style={styles.subtitle}>
              Sign in to manage your store
            </Text>
          </View>

          {/* Email field */}
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

          {/* Password field */}
          <View style={styles.field}>
            <Text style={styles.label}>Password</Text>
            <View style={styles.inputWrap}>
              <Ionicons
                name="lock-closed-outline"
                size={19}
                color={Colors.muted}
                style={styles.inputIcon}
              />
              <TextInput
                placeholder="••••••••"
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

          {/* Forgot password */}
          <Pressable
            onPress={() => router.push("/reset-password")}
            style={styles.forgotWrap}
            hitSlop={8}
          >
            <Text style={styles.forgotText}>Forgot password?</Text>
          </Pressable>

          {/* Login button */}
          <Button title="Sign In" onPress={submit} loading={loading} />

          {/* Sign up link */}
          <View style={styles.signupRow}>
            <Text style={styles.signupText}>Don't have an account? </Text>
            <Pressable onPress={() => router.push("/signup")} hitSlop={8}>
              <Text style={styles.signupLink}>Create one</Text>
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
    paddingBottom: 20 
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
    marginBottom: 32,
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
  forgotWrap: {
    alignSelf: "flex-end",
    marginBottom: 20,
  },
  forgotText: {
    fontSize: 13,
    fontWeight: "600",
    color: Colors.primary ?? "#22c55e",
  },
  signupRow: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 20,
  },
  signupText: {
    fontSize: 14,
    color: Colors.muted,
  },
  signupLink: {
    fontSize: 14,
    fontWeight: "700",
    color: Colors.primary ?? "#22c55e",
  },
});

