import { Text, View, StyleSheet } from "react-native";
import { ReactNode } from "react";
import { useTheme } from "@/context/ThemeContext";
import { fontFamily } from "@/constants/typography";

type Tone = "neutral" | "primary" | "success" | "warning" | "danger" | "info";

export function Badge({ tone = "neutral", children }: { tone?: Tone; children: ReactNode }) {
  const { colors } = useTheme();

  const getToneStyles = (): { bg: string; text: string } => {
    switch (tone) {
      case "primary":
        return { bg: colors.orangeSoft, text: colors.orange };
      case "success":
        return { bg: colors.success + "1E", text: colors.success };
      case "warning":
        return { bg: colors.warningSoft, text: colors.warning };
      case "danger":
        return { bg: colors.danger + "1A", text: colors.danger };
      case "info":
        return { bg: colors.infoSoft, text: colors.info };
      default:
        return { bg: colors.border, text: colors.muted };
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
    paddingHorizontal: 12,
    paddingVertical: 6,
    alignSelf: "flex-start",
  },
  text: {
    fontFamily: fontFamily.sansBold,
    fontSize: 11,
    letterSpacing: 0.2,
  },
});
