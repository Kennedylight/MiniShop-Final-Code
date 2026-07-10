// components/dashboard/KpiCard.tsx
import { Text, View, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LineChart } from "react-native-gifted-charts";
import { useTheme } from "@/context/ThemeContext";

type Tone = "primary" | "info" | "success" | "warning" | "danger";

const TONE_COLOR: Record<Tone, string> = {
  primary: "", // Sera défini dynamiquement
  info: "#3b82f6",
  success: "#16a34a",
  warning: "#d97706",
  danger: "#ef4444",
};

export function KpiCard({
  label,
  value,
  icon,
  tone,
  trend,
  format,
}: {
  label: string;
  value: number;
  icon: keyof typeof Ionicons.glyphMap;
  tone: Tone;
  trend?: number[];
  format?: (v: number) => string;
}) {
  const { colors } = useTheme();
  const chartData = trend && trend.length > 1 ? trend.map((v) => ({ value: v })) : undefined;

  // Déterminer la couleur dynamique en fonction du ton
  const getToneColor = (): string => {
    if (tone === "primary") return colors.primary;
    return TONE_COLOR[tone];
  };

  const getToneBg = (): string => {
    const color = getToneColor();
    return color + '1E'; // 12% d'opacité
  };

  const toneColor = getToneColor();
  const toneBg = getToneBg();

  return (
    <View style={[styles.card, { backgroundColor: colors.background || "#fff" }]}>
      <View style={[styles.iconWrap, { backgroundColor: toneBg }]}>
        <Ionicons name={icon} size={18} color={toneColor} />
      </View>
      <Text style={[styles.label, { color: colors.muted }]}>{label}</Text>
      <Text style={[styles.value, { color: colors.text }]}>
        {format ? format(value) : value.toLocaleString()}
      </Text>

      {chartData && (
        <View style={styles.sparkline}>
          <LineChart
            data={chartData}
            height={32}
            width={120}
            thickness={2}
            color={toneColor}
            hideDataPoints
            hideRules
            hideAxesAndRules
            areaChart
            startFillColor={toneColor}
            startOpacity={0.25}
            endOpacity={0}
            curved
            disableScroll
          />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flexBasis: "47.5%",
    flexGrow: 1,
    borderRadius: 20,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  iconWrap: { 
    width: 40, 
    height: 40, 
    borderRadius: 14, 
    alignItems: "center", 
    justifyContent: "center", 
    marginBottom: 14 
  },
  label: { 
    fontSize: 11, 
    fontWeight: "700", 
    textTransform: "uppercase", 
    letterSpacing: 0.4 
  },
  value: { 
    fontSize: 26, 
    fontWeight: "800", 
    marginTop: 4 
  },
  sparkline: { 
    marginTop: 10, 
    marginLeft: -16 
  },
});