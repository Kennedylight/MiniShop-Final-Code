import {
  Alert,
  Linking,
  Text,
  View,
  StyleSheet,
  Pressable,
} from "react-native";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { Screen } from "@/components/Screen";
import { PricingCard } from "@/components/PricingCard";
import { createCheckoutSession } from "@/services/subscriptionService";
import { PlanId } from "@/constants/plans";
import { Colors } from "@/constants/colors";

export default function Pricing() {
  const choose = async (plan: PlanId) => {
    try {
      const url = await createCheckoutSession(plan);
      await Linking.openURL(url);
    } catch (e: any) {
      Alert.alert("Billing error", e.message);
    }
  };

  return (
    <Screen>
      {/* Back button — utile car cet écran est aussi ouvert depuis Billing (dashboard) */}
      {router.canGoBack() && (
        <Pressable
          onPress={() => router.back()}
          style={styles.backButton}
          hitSlop={10}
        >
          <Ionicons name="arrow-back" size={22} color={Colors.text} />
        </Pressable>
      )}

      <View style={styles.header}>
        <Text style={styles.title}>Choose your plan</Text>
        <Text style={styles.subtitle}>
          Pick a plan based on how many product photos you need. 15 photos is
          the maximum.
        </Text>
      </View>

      <View style={styles.plansWrap}>
        <PricingCard planId="starter" onChoose={() => choose("starter")} />
        <PricingCard planId="business" onChoose={() => choose("business")} />
        <PricingCard planId="premium" onChoose={() => choose("premium")} />
      </View>

      <View style={styles.footerNote}>
        <Ionicons
          name="shield-checkmark-outline"
          size={16}
          color={Colors.muted}
        />
        <Text style={styles.footerNoteText}>
          Cancel or change your plan anytime from Billing
        </Text>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: Colors.card ?? "#f5f5f7",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
  },
  header: { marginBottom: 24 },
  badgeWrap: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    alignSelf: "flex-start",
    backgroundColor: Colors.card ?? "#f5f5f7",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    marginBottom: 12,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: "700",
    color: Colors.primary ?? "#22c55e",
  },
  title: {
    fontSize: 28,
    fontWeight: "800",
    color: Colors.text,
    letterSpacing: -0.5,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: Colors.muted,
    lineHeight: 20,
  },
  plansWrap: {
    gap: 14,
  },
  footerNote: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    marginTop: 20,
  },
  footerNoteText: {
    fontSize: 12,
    color: Colors.muted,
  },
});
