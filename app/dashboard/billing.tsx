import { useEffect, useState } from "react";
import { Alert, Linking, Text, View, StyleSheet, Pressable, ActivityIndicator } from "react-native";
import { useTranslation } from "react-i18next";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { Screen } from "@/components/Screen";
import { createCustomerPortal } from "@/services/subscriptionService";
import { getCurrentOwner } from "@/services/authService";
import { auth } from "@/services/firebase";
import { PlanId, getPhotoLimit } from "@/constants/plans";
import { useTheme } from "@/context/ThemeContext";
import { fontFamily } from "@/constants/typography";
import { getErrorMessage } from "@/lib/errors";

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
    } catch (e) {
      Alert.alert(t("billing.title"), getErrorMessage(e));
    } finally {
      setPortalLoading(false);
    }
  };

  const limit = plan ? getPhotoLimit(plan) : null;

  return (
    <Screen topInset={false}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: colors.text }]}>
          {t("billing.title")}
        </Text>
        <Text style={[styles.subtitle, { color: colors.muted }]}>
          {t("billing.subtitle")}
        </Text>
      </View>

      {/* Current plan card */}
      <LinearGradient
        colors={[colors.primary, colors.primaryDark]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[styles.planCard, { shadowColor: colors.primaryDark }]}
      >
        <View style={styles.planTop}>
          <View>
            <Text style={styles.planLabel}>{t("billing.currentPlan")}</Text>
            {loadingPlan ? (
              <ActivityIndicator size="small" color="#fff" style={{ marginTop: 8 }} />
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
      </LinearGradient>

      {/* Actions */}
      <Text style={[styles.sectionLabel, { color: colors.muted }]}>
        {t("billing.manage")}
      </Text>

      <Pressable
        onPress={() => router.push("/pricing")}
        style={({ pressed }) => [
          styles.row,
          { backgroundColor: colors.card, borderColor: colors.border, shadowColor: colors.shadow },
          pressed && styles.pressed
        ]}
      >
        <View style={[styles.rowIconWrap, { backgroundColor: colors.orangeSoft }]}>
          <Ionicons name="trending-up-outline" size={18} color={colors.orange} />
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
          { backgroundColor: colors.card, borderColor: colors.border, shadowColor: colors.shadow },
          pressed && styles.pressed
        ]}
      >
        <View style={[styles.rowIconWrap, { backgroundColor: colors.infoSoft }]}>
          {portalLoading ? (
            <ActivityIndicator size="small" color={colors.info} />
          ) : (
            <Ionicons name="card-outline" size={18} color={colors.info} />
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
  header: { marginBottom: 24 },
  title: {
    fontFamily: fontFamily.displaySemiBold,
    fontSize: 28,
    letterSpacing: -0.3,
  },
  subtitle: {
    fontFamily: fontFamily.sansRegular,
    fontSize: 14,
    marginTop: 6,
  },
  planCard: {
    borderRadius: RADIUS,
    padding: 22,
    marginBottom: 28,
    shadowOpacity: 0.3,
    shadowRadius: 22,
    shadowOffset: { width: 0, height: 12 },
    elevation: 8,
  },
  planTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  planLabel: {
    fontFamily: fontFamily.sansBold,
    fontSize: 12,
    color: "rgba(255,255,255,0.7)",
    textTransform: "uppercase",
    letterSpacing: 0.6,
  },
  planName: {
    fontFamily: fontFamily.displaySemiBold,
    fontSize: 24,
    color: "#fff",
    marginTop: 6,
  },
  planIconWrap: {
    width: 42,
    height: 42,
    borderRadius: 14,
    backgroundColor: "rgba(255,255,255,0.15)",
    alignItems: "center",
    justifyContent: "center",
  },
  planFeature: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginTop: 18,
  },
  planFeatureText: {
    fontFamily: fontFamily.sansSemiBold,
    fontSize: 13,
    color: "rgba(255,255,255,0.85)",
  },
  sectionLabel: {
    fontFamily: fontFamily.sansBold,
    fontSize: 13,
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginBottom: 12,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    borderRadius: RADIUS,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    shadowOpacity: 0.04,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 1,
  },
  rowIconWrap: {
    width: 38,
    height: 38,
    borderRadius: 13,
    alignItems: "center",
    justifyContent: "center",
  },
  rowTitle: {
    fontFamily: fontFamily.sansBold,
    fontSize: 15,
  },
  rowSubtitle: {
    fontFamily: fontFamily.sansRegular,
    fontSize: 12,
    marginTop: 2,
  },
  pressed: { opacity: 0.7 },
});