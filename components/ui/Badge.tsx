// components/ui/Badge.tsx
import { Text, View, StyleSheet } from "react-native";
import { ReactNode } from "react";
import { useTheme } from "@/context/ThemeContext";

type Tone = "neutral" | "primary" | "success" | "warning" | "danger" | "info";

export function Badge({ tone = "neutral", children }: { tone?: Tone; children: ReactNode }) {
  const { colors } = useTheme();

  const getToneStyles = (): { bg: string; text: string } => {
    switch (tone) {
      case "neutral":
        return { bg: colors.card || "#f5f5f7", text: colors.text };
      case "primary":
        return { bg: colors.primary + '1E', text: colors.primary };
      case "success":
        return { bg: "rgba(34,197,94,0.12)", text: "#16a34a" };
      case "warning":
        return { bg: "rgba(245,158,11,0.12)", text: "#d97706" };
      case "danger":
        return { bg: "rgba(239,68,68,0.12)", text: "#ef4444" };
      case "info":
        return { bg: "rgba(59,130,246,0.12)", text: "#3b82f6" };
      default:
        return { bg: colors.card || "#f5f5f7", text: colors.text };
    }
  };

  const t = getToneStyles();

  return (
    <View style={[styles.badge, { backgroundColor: t.bg }]}>
      <Text style={[styles.text, { color: t.text }]}>{children}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: { 
    borderRadius: 20, 
    paddingHorizontal: 10, 
    paddingVertical: 5, 
    alignSelf: "flex-start" 
  },
  text: { 
    fontSize: 12, 
    fontWeight: "700" 
  },
});