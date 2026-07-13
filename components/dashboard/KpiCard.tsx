import { Text, View, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LineChart } from "react-native-gifted-charts";
import { useTheme } from "@/context/ThemeContext";
import { fontFamily } from "@/constants/typography";

type Tone = "primary" | "info" | "success" | "warning" | "danger";

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

  const toneColor: Record<Tone, string> = {
    primary: colors.orange,
    info: colors.info,
    success: colors.success,
    warning: colors.warning,
    danger: colors.danger,
  };

  const color = toneColor[tone];

  return (
    <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border, shadowColor: colors.shadow }]}>
      <View style={[styles.iconWrap, { backgroundColor: color + "1E" }]}>
        <Ionicons name={icon} size={18} color={color} />
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
            color={color}
            hideDataPoints
            hideRules
            hideAxesAndRules
            areaChart
            startFillColor={color}
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
    borderRadius: 24,
    padding: 20,
    borderWidth: 1,
    shadowOpacity: 0.05,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 8 },
    elevation: 2,
  },
  iconWrap: {
    width: 40,
    height: 40,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
  },
  label: {
    fontFamily: fontFamily.sansBold,
    fontSize: 11,
    textTransform: "uppercase",
    letterSpacing: 0.4,
  },
  value: {
    fontFamily: fontFamily.sansExtraBold,
    fontSize: 26,
    marginTop: 4,
    fontVariant: ["tabular-nums"],
  },
  sparkline: {
    marginTop: 10,
    marginLeft: -16,
  },
});
