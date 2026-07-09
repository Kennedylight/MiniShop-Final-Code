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
import { Colors } from "@/constants/colors";

export default function Billing() {
  const { t } = useTranslation();
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
        <Text style={styles.title}>{t("billing.title")}</Text>
        <Text style={styles.subtitle}>{t("billing.subtitle")}</Text>
      </View>

      {/* Current plan card */}
      <View style={styles.planCard}>
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
      <Text style={styles.sectionLabel}>{t("billing.manage")}</Text>

      <Pressable
        onPress={() => router.push("/pricing")}
        style={({ pressed }) => [styles.row, pressed && styles.pressed]}
      >
        <View style={[styles.rowIconWrap, { backgroundColor: Colors.primary ?? "#22c55e" }]}>
          <Ionicons name="trending-up-outline" size={18} color="#fff" />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={styles.rowTitle}>{t("billing.changePlan")}</Text>
          <Text style={styles.rowSubtitle}>{t("billing.changePlanSubtitle")}</Text>
        </View>
        <Ionicons name="chevron-forward" size={18} color={Colors.muted} />
      </Pressable>

      <Pressable
        onPress={portal}
        disabled={portalLoading}
        style={({ pressed }) => [styles.row, pressed && styles.pressed]}
      >
        <View style={[styles.rowIconWrap, { backgroundColor: Colors.card ?? "#f5f5f7" }]}>
          {portalLoading ? (
            <ActivityIndicator size="small" color={Colors.text} />
          ) : (
            <Ionicons name="card-outline" size={18} color={Colors.text} />
          )}
        </View>
        <View style={{ flex: 1 }}>
          <Text style={styles.rowTitle}>{t("billing.paymentInvoices")}</Text>
          <Text style={styles.rowSubtitle}>{t("billing.paymentInvoicesSubtitle")}</Text>
        </View>
        <Ionicons name="chevron-forward" size={18} color={Colors.muted} />
      </Pressable>
    </Screen>
  );
}

const RADIUS = 18;

const styles = StyleSheet.create({
  header: { marginBottom: 20 },
  title: { fontSize: 26, fontWeight: "800", color: Colors.text, letterSpacing: -0.3 },
  subtitle: { fontSize: 14, color: Colors.muted, marginTop: 4 },
  planCard: {
    backgroundColor: Colors.text ?? "#111",
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
    color: Colors.muted,
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginBottom: 10,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    backgroundColor: Colors.card ?? "#f5f5f7",
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
  rowTitle: { fontSize: 15, fontWeight: "700", color: Colors.text },
  rowSubtitle: { fontSize: 12, color: Colors.muted, marginTop: 1 },
  pressed: { opacity: 0.7 },
});