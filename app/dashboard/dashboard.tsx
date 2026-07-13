// app/dashboard/Dashboard.tsx
import { useEffect, useState } from "react";
import { View, Text, StyleSheet, ScrollView } from "react-native";
import { useTranslation } from "react-i18next";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { LineChart, PieChart } from "react-native-gifted-charts";
import { Screen } from "@/components/Screen";
import { Badge } from "@/components/ui/Badge";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { Skeleton } from "@/components/ui/Skeleton";
import { EmptyState } from "@/components/ui/EmptyState";
import { KpiCard } from "@/components/dashboard/KpiCard";
import { fontFamily } from "@/constants/typography";
import { auth } from "@/services/firebase";
import { getCurrentOwner } from "@/services/authService";
import { useOwnerStats } from "@/hooks/useOwnerStats";
import { getPhotoLimit } from "@/constants/plans";
import {
  hasActiveAccess,
  effectivePlan,
  isTrialActive,
  trialDaysLeft,
} from "@/lib/access";
import { formatPrice } from "@/constants/currency";
import { useTheme } from "@/context/ThemeContext";
import { Owner } from "@/types/Owner";

const STATUS_TONES: Record<
  string,
  "neutral" | "primary" | "success" | "warning" | "danger" | "info"
> = {
  new: "primary",
  confirmed: "info",
  in_process: "warning",
  ready: "warning",
  out_for_delivery: "info",
  completed: "success",
  cancelled: "danger",
};

const DONUT_COLORS = [
  "#22c55e",
  "#3b82f6",
  "#f59e0b",
  "#f97316",
  "#8b5cf6",
  "#06b6d4",
];

export default function Dashboard() {
  const { t } = useTranslation();
  const { colors } = useTheme();
  const uid = auth.currentUser?.uid;
  const [owner, setOwner] = useState<Owner | null>(null);

  useEffect(() => {
    if (uid) getCurrentOwner(uid).then(setOwner);
  }, [uid]);

  const { data: stats, isLoading } = useOwnerStats(uid);

  const limit = getPhotoLimit(effectivePlan(owner)) || 1;
  const photosUsed = stats?.productsCount ?? 0;
  const access = hasActiveAccess(owner);
  const trialActive = isTrialActive(owner);
  const daysLeft = trialDaysLeft(owner);

  const orderTrend = stats?.timeline.map((b) => b.count) ?? [];

  const donutData = stats
    ? Object.entries(stats.byStatus)
        .filter(([, v]) => (v as number) > 0)
        .map(([k, v], i) => ({
          value: v as number,
          color: DONUT_COLORS[i % DONUT_COLORS.length],
          text: t(`orders.status.${k}`),
        }))
    : [];

  return (
    <Screen topInset={false}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scroll}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={[styles.eyebrow, { color: colors.primary }]}>
            {t("dashboard.greetingEyebrow")}
          </Text>
          <Text style={[styles.title, { color: colors.text }]}>
            {owner?.fullName
              ? t("dashboard.helloName", { name: owner.fullName.split(" ")[0] })
              : t("dashboard.title")}
          </Text>
          <Text style={[styles.subtitle, { color: colors.muted }]}>
            {owner?.shopName ?? t("dashboard.storeReady")}
          </Text>

          <View style={styles.badgeRow}>
            <Badge tone={access ? "success" : "warning"}>
              {access ? "●" : "○"}{" "}
              {trialActive
                ? t("dashboard.trialBadge", { days: daysLeft })
                : owner?.subscriptionStatus ?? "inactive"}
            </Badge>
            <Badge tone="neutral">{owner?.plan ?? t("billing.noPlan")}</Badge>
          </View>
        </View>

        {/* Bandeau essai / accès */}
        {trialActive ? (
          <View
            style={[
              styles.trialBanner,
              {
                backgroundColor: colors.orangeSoft,
                borderColor: colors.orange + "40",
              },
            ]}
          >
            <Ionicons name="sparkles" size={20} color={colors.orange} />
            <View style={{ flex: 1 }}>
              <Text style={[styles.bannerTitle, { color: colors.text }]}>
                {t("dashboard.trialTitle", { days: daysLeft })}
              </Text>
              <Text style={[styles.bannerHint, { color: colors.muted }]}>
                {t("dashboard.trialHint")}
              </Text>
            </View>
          </View>
        ) : (
          !access && (
            <View
              style={[
                styles.trialBanner,
                { backgroundColor: colors.warningSoft, borderColor: colors.warning + "40" },
              ]}
            >
              <Ionicons name="alert-circle" size={20} color={colors.warning} />
              <View style={{ flex: 1 }}>
                <Text style={[styles.bannerTitle, { color: colors.text }]}>
                  {t("dashboard.trialExpiredTitle")}
                </Text>
                <Text style={[styles.bannerHint, { color: colors.muted }]}>
                  {t("dashboard.noticeSubscription")}
                </Text>
              </View>
            </View>
          )
        )}

        {/* KPI grid */}
        <View style={styles.kpiGrid}>
          {isLoading || !stats ? (
            [1, 2, 3, 4].map((i) => (
              <Skeleton key={i} style={styles.kpiSkeleton} />
            ))
          ) : (
            <>
              <KpiCard
                label={t("dashboard.stats.ordersTotal")}
                value={stats.totalOrders}
                tone="primary"
                icon="bag-outline"
                trend={orderTrend}
              />
              <KpiCard
                label={t("dashboard.stats.ordersActive")}
                value={stats.activeOrders}
                tone="info"
                icon="sync-outline"
                trend={orderTrend}
              />
              <KpiCard
                label={t("dashboard.stats.revenue")}
                value={Math.round(stats.revenue)}
                tone="success"
                icon="cash-outline"
                format={(v) => formatPrice(v, owner?.currency ?? "USD")}
              />
              <KpiCard
                label={t("dashboard.stats.products")}
                value={stats.productsCount}
                tone="warning"
                icon="cube-outline"
              />
            </>
          )}
        </View>

        {/* Quota photos */}
        <View
          style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border, shadowColor: colors.shadow }]}
        >
          <View style={styles.rowBetween}>
            <Text style={[styles.quotaText, { color: colors.text }]}>
              {t("products.usageText", { count: photosUsed, limit })}
            </Text>
            <Text
              onPress={() => router.push("/dashboard/products")}
              style={[styles.link, { color: colors.primary }]}
            >
              {t("nav.products")} →
            </Text>
          </View>
          <ProgressBar
            value={photosUsed}
            max={limit}
            tone={photosUsed >= limit ? "danger" : "primary"}
          />
        </View>

        {/* Courbe des commandes */}
        <View
          style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border, shadowColor: colors.shadow }]}
        >
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            {t("dashboard.ordersChartTitle")}
          </Text>
          {!stats || stats.timeline.length === 0 ? (
            <EmptyState icon="bar-chart-outline" title={t("empty.noResults")} />
          ) : (
            <LineChart
              data={stats.timeline.map((b) => ({ value: b.count }))}
              height={180}
              areaChart
              curved
              color={colors.primary}
              startFillColor={colors.primary}
              startOpacity={0.3}
              endOpacity={0}
              thickness={2}
              hideDataPoints
              yAxisTextStyle={{ color: colors.muted, fontSize: 10 }}
              xAxisLabelTextStyle={{ color: colors.muted, fontSize: 9 }}
              noOfSections={3}
            />
          )}
        </View>

        {/* Donut par statut */}
        <View
          style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border, shadowColor: colors.shadow }]}
        >
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            {t("dashboard.statusBreakdown")}
          </Text>
          {donutData.length === 0 ? (
            <EmptyState icon="pie-chart-outline" title={t("empty.noResults")} />
          ) : (
            <View style={styles.donutRow}>
              <PieChart data={donutData} donut radius={70} innerRadius={45} />
              <View style={styles.legend}>
                {donutData.map((d) => (
                  <View key={d.text} style={styles.legendRow}>
                    <View
                      style={[styles.legendDot, { backgroundColor: d.color }]}
                    />
                    <Text style={[styles.legendText, { color: colors.muted }]}>
                      {d.text}
                    </Text>
                    <Text style={[styles.legendValue, { color: colors.text }]}>
                      {d.value}
                    </Text>
                  </View>
                ))}
              </View>
            </View>
          )}
        </View>

        {/* Commandes récentes */}
        <View
          style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border, shadowColor: colors.shadow }]}
        >
          <View style={styles.rowBetween}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>
              {t("orders.title")}
            </Text>
            <Text
              onPress={() => router.push("/dashboard/orders")}
              style={[styles.link, { color: colors.primary }]}
            >
              {t("common.all")} →
            </Text>
          </View>
          {!stats ? (
            [1, 2, 3].map((i) => (
              <Skeleton key={i} style={styles.orderSkeleton} />
            ))
          ) : stats.recent.length === 0 ? (
            <EmptyState icon="receipt-outline" title={t("orders.emptyTitle")} />
          ) : (
            stats.recent.map((o) => (
              <View
                key={o.orderId}
                style={[
                  styles.orderRow,
                  { borderBottomColor: colors.border || "rgba(0,0,0,0.06)" },
                ]}
              >
                <View
                  style={[
                    styles.orderIdBadge,
                    { backgroundColor: colors.primary + "1E" },
                  ]}
                >
                  <Text style={[styles.orderIdText, { color: colors.primary }]}>
                    {o.orderId.slice(0, 2).toUpperCase()}
                  </Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text
                    style={[styles.orderName, { color: colors.text }]}
                    numberOfLines={1}
                  >
                    {o.customerName}
                  </Text>
                  <Text
                    style={[styles.orderMeta, { color: colors.muted }]}
                    numberOfLines={1}
                  >
                    {o.items.length} ×{" "}
                    {o.items
                      .map((i) => i.name)
                      .join(", ")
                      .toLowerCase()}
                  </Text>
                </View>
                <View style={{ alignItems: "flex-end", gap: 4 }}>
                  <Text style={[styles.orderPrice, { color: colors.text }]}>
                    {formatPrice(o.estimatedTotal || 0, o.currency)}
                  </Text>
                  <Badge tone={STATUS_TONES[o.status]}>
                    {t(`orders.status.${o.status}`)}
                  </Badge>
                </View>
              </View>
            ))
          )}
        </View>
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  scroll: { paddingBottom: 40, gap: 20 },
  header: { marginBottom: 4 },
  eyebrow: {
    fontFamily: fontFamily.sansBold,
    fontSize: 11,
    textTransform: "uppercase",
    letterSpacing: 0.6,
  },
  title: {
    fontFamily: fontFamily.displaySemiBold,
    fontSize: 30,
    marginTop: 6,
  },
  subtitle: {
    fontFamily: fontFamily.sansRegular,
    fontSize: 14,
    marginTop: 4,
  },
  badgeRow: {
    flexDirection: "row",
    gap: 8,
    marginTop: 16,
  },
  trialBanner: {
    flexDirection: "row",
    gap: 12,
    borderWidth: 1,
    borderRadius: 20,
    padding: 16,
    alignItems: "flex-start",
  },
  bannerTitle: {
    fontFamily: fontFamily.sansBold,
    fontSize: 14,
  },
  bannerHint: {
    fontFamily: fontFamily.sansRegular,
    fontSize: 12,
    marginTop: 2,
  },
  kpiGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  kpiSkeleton: {
    flexBasis: "47.5%",
    flexGrow: 1,
    height: 130,
    borderRadius: 24,
  },
  card: {
    borderRadius: 24,
    padding: 20,
    borderWidth: 1,
    shadowOpacity: 0.05,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 8 },
    elevation: 2,
  },
  rowBetween: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  quotaText: {
    fontFamily: fontFamily.sansBold,
    fontSize: 13,
  },
  link: {
    fontFamily: fontFamily.sansBold,
    fontSize: 13,
  },
  sectionTitle: {
    fontFamily: fontFamily.displaySemiBold,
    fontSize: 18,
    marginBottom: 16,
  },
  donutRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
  },
  legend: {
    flex: 1,
    gap: 10,
  },
  legendRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  legendDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  legendText: {
    flex: 1,
    fontFamily: fontFamily.sansMedium,
    fontSize: 12,
  },
  legendValue: {
    fontFamily: fontFamily.sansExtraBold,
    fontSize: 12,
  },
  orderRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  orderIdBadge: {
    width: 36,
    height: 36,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  orderIdText: {
    fontFamily: fontFamily.sansExtraBold,
    fontSize: 11,
  },
  orderName: {
    fontFamily: fontFamily.sansBold,
    fontSize: 14,
  },
  orderMeta: {
    fontFamily: fontFamily.sansRegular,
    fontSize: 12,
    marginTop: 1,
  },
  orderPrice: {
    fontFamily: fontFamily.sansExtraBold,
    fontSize: 14,
    fontVariant: ["tabular-nums"],
  },
  orderSkeleton: {
    height: 56,
    borderRadius: 14,
    marginBottom: 8,
  },
});
