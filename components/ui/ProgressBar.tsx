import { View, StyleSheet } from "react-native";
import { useTheme } from "@/context/ThemeContext";

type Tone = "primary" | "success" | "danger";

export function ProgressBar({ value, max, tone = "primary" }: { value: number; max: number; tone?: Tone }) {
  const { colors } = useTheme();
  const pct = max > 0 ? Math.min(value / max, 1) : 0;

  const toneColor = {
    primary: colors.orange,
    success: colors.success,
    danger: colors.danger,
  }[tone];

  return (
    <View style={[styles.track, { backgroundColor: colors.border }]}>
      <View style={[styles.fill, { width: `${pct * 100}%`, backgroundColor: toneColor }]} />
    </View>
  );
}

const styles = StyleSheet.create({
  track: {
    height: 8,
    borderRadius: 4,
    overflow: "hidden",
  },
  fill: {
    height: "100%",
    borderRadius: 4,
  },
});
