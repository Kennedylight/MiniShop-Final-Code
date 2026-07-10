import { useState } from "react";
import { View, Text, Pressable, StyleSheet } from "react-native";
import { useTranslation } from "react-i18next";
import { saveLanguage, supportedLanguages } from "@/services/i18n";
import { useTheme } from "@/context/ThemeContext";

export function LanguagePicker() {
  const { t, i18n } = useTranslation();
  const { colors } = useTheme();
  const [current, setCurrent] = useState(i18n.language || "en");

  const handleChange = async (code: string) => {
    await saveLanguage(code);
    setCurrent(code);
  };

  return (
    <View style={styles.container}>
      <Text style={[styles.label, { color: colors.text }]}>
        {t("common.selectLanguage")}
      </Text>
      <View style={styles.buttonsRow}>
        {supportedLanguages.map((lang) => {
          const isActive = current === lang.code;
          return (
            <Pressable
              key={lang.code}
              onPress={() => handleChange(lang.code)}
              style={[
                styles.button,
                { 
                  borderColor: colors.border || "rgba(0,0,0,0.12)",
                  backgroundColor: isActive ? colors.primary : (colors.card || "#f5f5f7"),
                },
                isActive && styles.buttonActive,
              ]}
              hitSlop={8}
            >
              <Text style={[
                styles.buttonText, 
                { color: isActive ? "#fff" : colors.text },
                isActive && styles.buttonTextActive
              ]}>
                {lang.label}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
    paddingHorizontal: 20,
  },
  label: {
    fontSize: 13,
    fontWeight: "600",
    marginBottom: 8,
  },
  buttonsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 10,
  },
  button: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 14,
    borderWidth: 1,
    alignItems: "center",
  },
  buttonActive: {
    borderColor: "transparent",
  },
  buttonText: {
    fontSize: 13,
    fontWeight: "700",
  },
  buttonTextActive: {
    color: "#fff",
  },
});