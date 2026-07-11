import { useEffect, useState } from "react";
import { Alert, Linking, Text, View, StyleSheet, Pressable, ActivityIndicator } from "react-native";
import { useTranslation } from "react-i18next";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { Screen } from "@/components/Screen";
import { Button } from "@/components/Button";
import { createCustomerPortal } from "@/services/subscriptionService";
import { getCurrentOwner } from "@/services/authService";
import { auth } from "@/services/firebase";
import { PlanId, getPhotoLimit } from "@/constants/plans";
import { useTheme } from "@/context/ThemeContext";

export default function Billing() {
  const { t } = useTranslation();
  const { colors } = useTheme();
  const [plan, setPlan] = useState<PlanId | null>(null);
  const [loadingPlan, setLoadingPlan] = useState(true);
  const [portalLoading, setPortalLoading] = useState(false);

  const PLAN_LABELS: Record<string, string> = {
    starter: t("billing.plans.starter"),
    business: t("billing.plans.business"),
    premium: t("billing.plans.premium"),
  };

  useEffect(() => {
    (async () => {
      const uid = auth.currentUser?.uid;
      if (!uid) {
        setLoadingPlan(false);
        return;
      }
      const owner = await getCurrentOwner(uid);
      setPlan((owner?.plan as PlanId) || "starter");
      setLoadingPlan(false);
    })();
  }, []);

  const portal = async () => {
    try {
      setPortalLoading(true);
      const url = await createCustomerPortal();
      await Linking.openURL(url);
    } catch (e: any) {
      Alert.alert(t("billing.title"), e.message);
    } finally {
      setPortalLoading(false);
    }
  };

  const limit = plan ? getPhotoLimit(plan) : null;

  return (
    <Screen>
      <View style={styles.header}>
        <Text style={[styles.title, { color: colors.text }]}>
          {t("billing.title")}
        </Text>
        <Text style={[styles.subtitle, { color: colors.muted }]}>
          {t("billing.subtitle")}
        </Text>
      </View>

      {/* Current plan card */}
      <View style={[styles.planCard, { backgroundColor: colors.primary }]}>
        <View style={styles.planTop}>
          <View>
            <Text style={styles.planLabel}>{t("billing.currentPlan")}</Text>
            {loadingPlan ? (
              <ActivityIndicator size="small" color="#fff" style={{ marginTop: 6 }} />
            ) : (
              <Text style={styles.planName}>
                {plan ? PLAN_LABELS[plan] ?? plan : "—"}
              </Text>
            )}
          </View>
          <View style={styles.planIconWrap}>
            <Ionicons name="diamond-outline" size={22} color="#fff" />
          </View>
        </View>

        {limit != null && (
          <View style={styles.planFeature}>
            <Ionicons name="images-outline" size={15} color="rgba(255,255,255,0.85)" />
            <Text style={styles.planFeatureText}>
              {t("billing.photoLimit", { count: limit })}
            </Text>
          </View>
        )}
      </View>

      {/* Actions */}
      <Text style={[styles.sectionLabel, { color: colors.muted }]}>
        {t("billing.manage")}
      </Text>

      <Pressable
        onPress={() => router.push("/pricing")}
        style={({ pressed }) => [
          styles.row, 
          { backgroundColor: colors.card || "#f5f5f7" },
          pressed && styles.pressed
        ]}
      >
        <View style={[styles.rowIconWrap, { backgroundColor: colors.orange }]}>
          <Ionicons name="trending-up-outline" size={18} color="#fff" />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={[styles.rowTitle, { color: colors.text }]}>
            {t("billing.changePlan")}
          </Text>
          <Text style={[styles.rowSubtitle, { color: colors.muted }]}>
            {t("billing.changePlanSubtitle")}
          </Text>
        </View>
        <Ionicons name="chevron-forward" size={18} color={colors.muted} />
      </Pressable>

      <Pressable
        onPress={portal}
        disabled={portalLoading}
        style={({ pressed }) => [
          styles.row, 
          { backgroundColor: colors.card || "#f5f5f7" },
          pressed && styles.pressed
        ]}
      >
        <View style={[styles.rowIconWrap, { backgroundColor: colors.card || "#f5f5f7" }]}>
          {portalLoading ? (
            <ActivityIndicator size="small" color={colors.text} />
          ) : (
            <Ionicons name="card-outline" size={18} color={colors.text} />
          )}
        </View>
        <View style={{ flex: 1 }}>
          <Text style={[styles.rowTitle, { color: colors.text }]}>
            {t("billing.paymentInvoices")}
          </Text>
          <Text style={[styles.rowSubtitle, { color: colors.muted }]}>
            {t("billing.paymentInvoicesSubtitle")}
          </Text>
        </View>
        <Ionicons name="chevron-forward" size={18} color={colors.muted} />
      </Pressable>
    </Screen>
  );
}

const RADIUS = 18;

const styles = StyleSheet.create({
  header: { marginBottom: 20 },
  title: { 
    fontSize: 26, 
    fontWeight: "800", 
    letterSpacing: -0.3 
  },
  subtitle: { 
    fontSize: 14, 
    marginTop: 4 
  },
  planCard: {
    borderRadius: RADIUS,
    padding: 18,
    marginBottom: 24,
  },
  planTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  planLabel: {
    fontSize: 12,
    fontWeight: "600",
    color: "rgba(255,255,255,0.7)",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  planName: {
    fontSize: 22,
    fontWeight: "800",
    color: "#fff",
    marginTop: 4,
  },
  planIconWrap: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: "rgba(255,255,255,0.15)",
    alignItems: "center",
    justifyContent: "center",
  },
  planFeature: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginTop: 16,
  },
  planFeatureText: {
    fontSize: 13,
    color: "rgba(255,255,255,0.85)",
    fontWeight: "600",
  },
  sectionLabel: {
    fontSize: 13,
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginBottom: 10,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    borderRadius: RADIUS,
    padding: 14,
    marginBottom: 10,
  },
  rowIconWrap: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  rowTitle: { 
    fontSize: 15, 
    fontWeight: "700" 
  },
  rowSubtitle: { 
    fontSize: 12, 
    marginTop: 1 
  },
  pressed: { opacity: 0.7 },
});