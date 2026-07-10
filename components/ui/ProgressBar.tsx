// components/ui/ProgressBar.tsx
import { View, StyleSheet } from "react-native";
import { useTheme } from "@/context/ThemeContext";

type Tone = "primary" | "success" | "danger";

export function ProgressBar({ value, max, tone = "primary" }: { value: number; max: number; tone?: Tone }) {
  const { colors } = useTheme();
  const pct = max > 0 ? Math.min(value / max, 1) : 0;

  const getToneColor = (): string => {
    switch (tone) {
      case "primary":
        return colors.primary;
      case "success":
        return "#16a34a";
      case "danger":
        return "#ef4444";
      default:
        return colors.primary;
    }
  };

  return (
    <View style={[styles.track, { backgroundColor: colors.border || "rgba(0,0,0,0.08)" }]}>
      <View style={[styles.fill, { width: `${pct * 100}%`, backgroundColor: getToneColor() }]} />
    </View>
  );
}

const styles = StyleSheet.create({
  track: { 
    height: 6, 
    borderRadius: 3, 
    overflow: "hidden" 
  },
  fill: { 
    height: "100%", 
    borderRadius: 3 
  },
});