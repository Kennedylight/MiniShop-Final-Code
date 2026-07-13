import { useEffect, useRef, useState } from "react";
import {
  Alert,
  Text,
  StyleSheet,
  View,
  ScrollView,
  Pressable,
  Animated,
  Linking,
  Share,
} from "react-native";
import { useTranslation } from "react-i18next";
import { Ionicons } from "@expo/vector-icons";
import { auth } from "@/services/firebase";
import { subscribeOwnerOrders, updateOrderStatus } from "@/services/orderService";
import { Order, OrderStatus } from "@/types/Order";
import { Screen } from "@/components/Screen";
import { useTheme } from "@/context/ThemeContext";
import { formatPrice } from "@/constants/currency";
import { fontFamily } from "@/constants/typography";
import { getErrorMessage } from "@/lib/errors";

const STATUS_ORDER: OrderStatus[] = [
  "new",
  "confirmed",
  "in_process",
  "ready",
  "out_for_delivery",
  "completed",
];

// Reste hors composant : couleurs/icônes ne dépendent pas de la langue
const STATUS_STYLE: Record<OrderStatus, {
  color: string;
  bg: string;
  icon: keyof typeof Ionicons.glyphMap;
}> = {
  new: { color: "#f59e0b", bg: "rgba(245,158,11,0.12)", icon: "sparkles-outline" },
  confirmed: { color: "#3b82f6", bg: "rgba(59,130,246,0.12)", icon: "checkmark-circle-outline" },
  in_process: { color: "#8b5cf6", bg: "rgba(139,92,246,0.12)", icon: "sync-outline" },
  ready: { color: "#06b6d4", bg: "rgba(6,182,212,0.12)", icon: "cube-outline" },
  out_for_delivery: { color: "#f97316", bg: "rgba(249,115,22,0.12)", icon: "bicycle-outline" },
  completed: { color: "#22c55e", bg: "rgba(34,197,94,0.12)", icon: "checkmark-done-outline" },
  cancelled: { color: "#ef4444", bg: "rgba(239,68,68,0.12)", icon: "close-circle-outline" },
};

function nextStatuses(current: OrderStatus): OrderStatus[] {
  if (current === "cancelled" || current === "completed") return [];
  const idx = STATUS_ORDER.indexOf(current);
  return STATUS_ORDER.slice(idx + 1);
}

function SkeletonRow() {
  const { colors } = useTheme();
  const pulse = useRef(new Animated.Value(0.4)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, { toValue: 1, duration: 700, useNativeDriver: true }),
        Animated.timing(pulse, { toValue: 0.4, duration: 700, useNativeDriver: true }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, []);

  return (
    <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border, shadowColor: colors.shadow }]}>
      <View style={styles.cardTop}>
        <Animated.View style={[styles.skelLine, { width: "40%", opacity: pulse, backgroundColor: colors.border || "rgba(0,0,0,0.1)" }]} />
        <Animated.View style={[styles.skelBadge, { opacity: pulse, backgroundColor: colors.border || "rgba(0,0,0,0.1)" }]} />
      </View>
      <Animated.View style={[styles.skelLine, { width: "70%", marginTop: 10, opacity: pulse, backgroundColor: colors.border || "rgba(0,0,0,0.1)" }]} />
      <Animated.View style={[styles.skelLine, { width: "50%", marginTop: 8, opacity: pulse, backgroundColor: colors.border || "rgba(0,0,0,0.1)" }]} />
      <View style={styles.skelActionsRow}>
        <Animated.View style={[styles.skelAction, { opacity: pulse, backgroundColor: colors.border || "rgba(0,0,0,0.1)" }]} />
        <Animated.View style={[styles.skelAction, { opacity: pulse, backgroundColor: colors.border || "rgba(0,0,0,0.1)" }]} />
      </View>
    </View>
  );
}

export default function Orders() {
  const { t } = useTranslation();
  const { colors } = useTheme();
  const [orders, setOrders] = useState<Order[] | null>(null);

  // Déplacé DANS le composant : les labels se retraduisent à chaque changement de langue
  const STATUS_LABEL: Record<OrderStatus, string> = {
    new: t("orders.status.new"),
    confirmed: t("orders.status.confirmed"),
    in_process: t("orders.status.inProcess"),
    ready: t("orders.status.ready"),
    out_for_delivery: t("orders.status.outForDelivery"),
    completed: t("orders.status.completed"),
    cancelled: t("orders.status.cancelled"),
  };

  useEffect(() => {
    const uid = auth.currentUser?.uid;
    if (!uid) {
      setOrders([]);
      return;
    }
    return subscribeOwnerOrders(uid, setOrders, () => setOrders([]));
  }, []);

  const loading = orders === null;

  const whatsappOrder = (o: Order) => {
    const phone = o.customerPhone?.replace(/[^\d+]/g, "");
    if (!phone) {
      Alert.alert(t("orders.noPhoneTitle"), t("orders.noPhoneText"));
      return;
    }

    const baseUrl =
      process.env.EXPO_PUBLIC_PUBLIC_STORE_BASE_URL ||
      process.env.EXPO_PUBLIC_STORE_BASE_URL ||
      "https://ministores.shop";

    const shopSlug = o.shopName
      .trim()
      .toLowerCase()
      .replace(/\s+/g, "-");

    const trackUrl = `${baseUrl.replace(/\/$/, "")}/${shopSlug}/track/${o.orderId}`;

    const message = encodeURIComponent(
      t("orders.whatsappMessage", {
        name: o.customerName,
        link: trackUrl,
      })
    );

    Linking.openURL(`whatsapp://send?phone=${phone}&text=${message}`).catch(() => {
      Alert.alert(
        t("orders.whatsappUnavailableTitle"),
        t("orders.whatsappUnavailableText")
      );
    });
  };

  const sendTrackingLink = async (o: Order) => {
    const baseUrl =
      process.env.EXPO_PUBLIC_PUBLIC_STORE_BASE_URL ||
      process.env.EXPO_PUBLIC_STORE_BASE_URL ||
      "https://ministores.shop";
    const shopSlug = o.shopName
      .trim()
      .toLowerCase()
      .replace(/\s+/g, "-");

    const trackUrl = `${baseUrl.replace(/\/$/, "")}/${shopSlug}/track/${o.orderId}`;

    await Share.share({
      message: t("orders.trackingMessage", { name: o.customerName, url: trackUrl }),
    });
  };

  const handleStatusChange = (orderId: string, status: OrderStatus) => {
    updateOrderStatus(orderId, status).catch((e) =>
      Alert.alert(t("orders.errorTitle"), getErrorMessage(e))
    );
  };

  return (
    <Screen topInset={false}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <Text style={[styles.title, { color: colors.text }]}>
            {t("orders.title")}
          </Text>
          {!loading && orders.length > 0 && (
            <Text style={[styles.count, { color: colors.muted }]}>
              {t("orders.totalCount", { count: orders.length })}
            </Text>
          )}
        </View>

        {loading ? (
          <>
            <SkeletonRow />
            <SkeletonRow />
            <SkeletonRow />
          </>
        ) : orders.length === 0 ? (
          <View style={styles.emptyState}>
            <View style={[styles.emptyIconWrap, { backgroundColor: colors.orangeSoft }]}>
              <Ionicons name="receipt-outline" size={32} color={colors.orange} />
            </View>
            <Text style={[styles.emptyTitle, { color: colors.text }]}>
              {t("orders.emptyTitle")}
            </Text>
            <Text style={[styles.emptyText, { color: colors.muted }]}>
              {t("orders.emptyText")}
            </Text>
          </View>
        ) : (
          orders.map((o) => {
            const style = STATUS_STYLE[o.status];
            const upcoming = nextStatuses(o.status);

            return (
              <View key={o.orderId} style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border, shadowColor: colors.shadow }]}>
                <View style={styles.cardTop}>
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.orderId, { color: colors.text }]}>
                      #{o.orderId.slice(0, 6)} · {o.customerName}
                    </Text>
                    <Text style={[styles.meta, { color: colors.muted }]}>
                      {o.customerPhone} · {o.deliveryAddress}
                    </Text>
                  </View>
                  <View style={[styles.statusBadge, { backgroundColor: style.bg }]}>
                    <Ionicons name={style.icon} size={12} color={style.color} />
                    <Text style={[styles.statusText, { color: style.color }]}>
                      {STATUS_LABEL[o.status]}
                    </Text>
                  </View>
                </View>

                <View style={[styles.itemsBox, { backgroundColor: colors.background || "#fff" }]}>
                  {o.items.map((i) => (
                    <View key={i.productId} style={styles.itemRow}>
                      <Text style={[styles.itemQty, { color: colors.text }]}>
                        {i.quantity}x
                      </Text>
                      <Text style={[styles.itemName, { color: colors.muted }]} numberOfLines={1}>
                        {i.name}
                      </Text>
                    </View>
                  ))}
                </View>

                <View style={[styles.totalRow, { borderTopColor: colors.border || "rgba(0,0,0,0.06)" }]}>
                  <Text style={[styles.totalLabel, { color: colors.muted }]}>
                    {t("orders.total")}
                  </Text>
                  <Text style={[styles.totalValue, { color: colors.text }]}>
                    {formatPrice(o.estimatedTotal, o.currency)}
                  </Text>
                </View>

                {/* Contact & tracking */}
                <View style={styles.contactRow}>
                  <Pressable
                    onPress={() => whatsappOrder(o)}
                    style={({ pressed }) => [
                      styles.contactButton,
                      styles.whatsappButton,
                      pressed && { opacity: 0.85 },
                    ]}
                  >
                    <Ionicons name="logo-whatsapp" size={16} color="#fff" />
                    <Text style={styles.whatsappButtonText}>{t("orders.whatsapp")}</Text>
                  </Pressable>

                  <Pressable
                    onPress={() => sendTrackingLink(o)}
                    style={({ pressed }) => [
                      styles.contactButton,
                      styles.trackButton,
                      { 
                        backgroundColor: colors.background || "#fff",
                        borderColor: colors.border || "rgba(0,0,0,0.08)"
                      },
                      pressed && { opacity: 0.85 },
                    ]}
                  >
                    <Ionicons name="navigate-outline" size={16} color={colors.text} />
                    <Text style={[styles.trackButtonText, { color: colors.text }]}>
                      {t("orders.sendTracking")}
                    </Text>
                  </Pressable>
                </View>

                {/* Status progression */}
                {upcoming.length > 0 && (
                  <View style={styles.statusActionsRow}>
                    {upcoming.map((s) => (
                      <Pressable
                        key={s}
                        onPress={() => handleStatusChange(o.orderId, s)}
                        style={({ pressed }) => [
                          styles.statusChip,
                          { backgroundColor: colors.primary },
                          pressed && { opacity: 0.7 },
                        ]}
                      >
                        <Text style={styles.statusChipText}>
                          {t("orders.markAs", { status: STATUS_LABEL[s] })}
                        </Text>
                      </Pressable>
                    ))}
                  </View>
                )}
              </View>
            );
          })
        )}
      </ScrollView>
    </Screen>
  );
}

const RADIUS = 18;

const styles = StyleSheet.create({
  scrollContent: { paddingBottom: 32 },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 20
  },
  title: {
    fontFamily: fontFamily.displaySemiBold,
    fontSize: 28,
    letterSpacing: -0.3,
  },
  count: {
    fontFamily: fontFamily.sansSemiBold,
    fontSize: 13,
  },
  card: {
    borderRadius: RADIUS,
    padding: 18,
    marginBottom: 16,
    borderWidth: 1,
    shadowOpacity: 0.05,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 8 },
    elevation: 2,
  },
  cardTop: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: 8
  },
  orderId: {
    fontFamily: fontFamily.sansExtraBold,
    fontSize: 15,
  },
  meta: {
    fontSize: 12,
    marginTop: 3
  },
  statusBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20
  },
  statusText: {
    fontFamily: fontFamily.sansBold,
    fontSize: 11,
  },
  itemsBox: {
    marginTop: 12,
    borderRadius: 14,
    padding: 12,
    gap: 4
  },
  itemRow: {
    flexDirection: "row",
    gap: 6
  },
  itemQty: {
    fontFamily: fontFamily.sansBold,
    fontSize: 13,
  },
  itemName: {
    fontFamily: fontFamily.sansRegular,
    fontSize: 13,
    flex: 1,
  },
  totalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
  },
  totalLabel: {
    fontFamily: fontFamily.sansSemiBold,
    fontSize: 13,
  },
  totalValue: {
    fontFamily: fontFamily.sansExtraBold,
    fontSize: 17,
    fontVariant: ["tabular-nums"],
  },
  contactRow: {
    flexDirection: "row",
    gap: 8,
    marginTop: 14
  },
  contactButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    borderRadius: 14,
    paddingVertical: 12
  },
  whatsappButton: {
    backgroundColor: "#25D366"
  },
  whatsappButtonText: {
    fontFamily: fontFamily.sansBold,
    fontSize: 12,
    color: "#fff",
  },
  trackButton: {
    borderWidth: 1
  },
  trackButtonText: {
    fontFamily: fontFamily.sansBold,
    fontSize: 12,
  },
  statusActionsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginTop: 14
  },
  statusChip: {
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 8
  },
  statusChipText: {
    fontFamily: fontFamily.sansBold,
    fontSize: 11,
    color: "#fff",
  },
  emptyState: {
    alignItems: "center",
    paddingVertical: 60
  },
  emptyIconWrap: {
    width: 64,
    height: 64,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 14
  },
  emptyTitle: {
    fontFamily: fontFamily.sansBold,
    fontSize: 16,
    marginBottom: 4,
  },
  emptyText: {
    fontSize: 13,
    textAlign: "center"
  },
  skelLine: { 
    height: 12, 
    borderRadius: 6 
  },
  skelBadge: { 
    width: 70, 
    height: 20, 
    borderRadius: 10 
  },
  skelActionsRow: { 
    flexDirection: "row", 
    gap: 8, 
    marginTop: 14 
  },
  skelAction: { 
    flex: 1, 
    height: 36, 
    borderRadius: 12 
  },
});