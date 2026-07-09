import { useEffect, useState } from "react";
import {
  Alert,
  Share,
  Text,
  StyleSheet,
  View,
  Pressable,
  Image,
  Linking,
} from "react-native";
import { useTranslation } from "react-i18next";
import * as Clipboard from "expo-clipboard";
import { Ionicons } from "@expo/vector-icons";
import { auth } from "@/services/firebase";
import { getCurrentOwner } from "@/services/authService";
import { Screen } from "@/components/Screen";
import { Card } from "@/components/Card";
import { Button } from "@/components/Button";
import { Colors } from "@/constants/colors";

type LinkStatus = "loading" | "ready" | "signInRequired" | "profileIncomplete" | "error";

export default function SharePage() {
  const { t } = useTranslation();
  const [url, setUrl] = useState("");
  const [status, setStatus] = useState<LinkStatus>("loading");
  const [copied, setCopied] = useState(false);

  const isReady = status === "ready";

  const statusMessage: Record<Exclude<LinkStatus, "ready">, string> = {
    loading: t("share.loadingLink"),
    signInRequired: t("share.signInFirst"),
    profileIncomplete: t("share.completeProfileFirst"),
    error: t("share.couldNotLoadLink"),
  };

  useEffect(() => {
    async function loadStoreLink() {
      try {
        const uid = auth.currentUser?.uid;

        if (!uid) {
          setStatus("signInRequired");
          return;
        }

        const owner = await getCurrentOwner(uid);

        const baseUrl =
          process.env.EXPO_PUBLIC_PUBLIC_STORE_BASE_URL ||
          process.env.EXPO_PUBLIC_STORE_BASE_URL ||
          "https://ministores.shop";

        const cleanBaseUrl = baseUrl.replace(/\/$/, "");
        const shopSlug = owner?.shopSlug || uid;

        if (!shopSlug) {
          setStatus("profileIncomplete");
          return;
        }

        setUrl(`${cleanBaseUrl}/${shopSlug}`);
        setStatus("ready");
      } catch (error) {
        console.log("SharePage error:", error);
        setStatus("error");
      }
    }

    loadStoreLink();
  }, []);

  const handleShare = async () => {
    if (!isReady) {
      Alert.alert(t("share.storeLink"), statusMessage[status as Exclude<LinkStatus, "ready">]);
      return;
    }
    await Share.share({
      message: t("share.shareMessage", { url }),
    });
  };

  const handleWhatsApp = () => {
    if (!isReady) {
      Alert.alert(t("share.storeLink"), statusMessage[status as Exclude<LinkStatus, "ready">]);
      return;
    }
    const message = encodeURIComponent(t("share.shareMessage", { url }));
    Linking.openURL(`whatsapp://send?text=${message}`).catch(() => {
      Alert.alert(t("share.whatsappNotInstalled"), t("share.tryGeneralShare"));
    });
  };

  const handleCopy = async () => {
    if (!isReady) {
      Alert.alert(t("share.storeLink"), statusMessage[status as Exclude<LinkStatus, "ready">]);
      return;
    }
    await Clipboard.setStringAsync(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const qrUrl = isReady
    ? `https://api.qrserver.com/v1/create-qr-code/?size=240x240&data=${encodeURIComponent(url)}`
    : null;

  return (
    <Screen>
      <View style={styles.header}>
        <Text style={styles.title}>{t("share.title")}</Text>
        <Text style={styles.subtitle}>{t("share.subtitle")}</Text>
      </View>

      {/* QR Code */}
      <Card style={styles.qrCard}>
        {status === "loading" ? (
          <View style={styles.qrPlaceholder}>
            <Ionicons name="qr-code-outline" size={40} color={Colors.muted} />
          </View>
        ) : qrUrl ? (
          <Image source={{ uri: qrUrl }} style={styles.qrImage} resizeMode="contain" />
        ) : (
          <View style={styles.qrPlaceholder}>
            <Ionicons name="alert-circle-outline" size={32} color={Colors.muted} />
            <Text style={styles.qrErrorText}>
              {statusMessage[status as Exclude<LinkStatus, "ready">]}
            </Text>
          </View>
        )}
        {isReady && (
          <Text style={styles.qrHint}>{t("share.scanToVisit")}</Text>
        )}
      </Card>

      {/* Link card with copy */}
      <View style={styles.linkCard}>
        <View style={styles.linkIconWrap}>
          <Ionicons name="link-outline" size={18} color={Colors.primary ?? "#22c55e"} />
        </View>
        <Text style={styles.linkText} numberOfLines={1}>
          {status === "loading" ? t("share.loadingLink") : isReady ? url : statusMessage[status as Exclude<LinkStatus, "ready">]}
        </Text>
        <Pressable
          onPress={handleCopy}
          hitSlop={8}
          style={({ pressed }) => [styles.copyButton, pressed && { opacity: 0.7 }]}
        >
          <Ionicons
            name={copied ? "checkmark" : "copy-outline"}
            size={18}
            color={copied ? Colors.primary ?? "#22c55e" : Colors.text}
          />
        </Pressable>
      </View>

      {/* Quick actions */}
      <View style={styles.actionsRow}>
        <Pressable
          onPress={handleWhatsApp}
          style={({ pressed }) => [
            styles.actionCard,
            styles.whatsappCard,
            pressed && { opacity: 0.85 },
          ]}
        >
          <Ionicons name="logo-whatsapp" size={22} color="#fff" />
          <Text style={styles.whatsappText}>{t("share.whatsapp")}</Text>
        </Pressable>

        <Pressable
          onPress={handleShare}
          style={({ pressed }) => [
            styles.actionCard,
            styles.shareCard,
            pressed && { opacity: 0.85 },
          ]}
        >
          <Ionicons name="share-social-outline" size={22} color={Colors.text} />
          <Text style={styles.shareText}>{t("share.moreOptions")}</Text>
        </Pressable>
      </View>
    </Screen>
  );
}

const RADIUS = 18;

const styles = StyleSheet.create({
  header: { marginBottom: 20 },
  title: { fontSize: 26, fontWeight: "800", color: Colors.text, letterSpacing: -0.3 },
  subtitle: { fontSize: 14, color: Colors.muted, marginTop: 4 },
  qrCard: { alignItems: "center", borderRadius: RADIUS, paddingVertical: 24, marginBottom: 16 },
  qrImage: { width: 180, height: 180 },
  qrPlaceholder: { width: 180, height: 180, alignItems: "center", justifyContent: "center", gap: 8 },
  qrErrorText: { fontSize: 12, color: Colors.muted, textAlign: "center", paddingHorizontal: 12 },
  qrHint: { fontSize: 13, fontWeight: "600", color: Colors.muted, marginTop: 14 },
  linkCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.card ?? "#f5f5f7",
    borderRadius: RADIUS,
    paddingVertical: 12,
    paddingHorizontal: 14,
    marginBottom: 20,
    gap: 10,
  },
  linkIconWrap: {
    width: 32,
    height: 32,
    borderRadius: 10,
    backgroundColor: Colors.background ?? "#fff",
    alignItems: "center",
    justifyContent: "center",
  },
  linkText: { flex: 1, fontSize: 14, fontWeight: "700", color: Colors.text },
  copyButton: {
    width: 32,
    height: 32,
    borderRadius: 10,
    backgroundColor: Colors.background ?? "#fff",
    alignItems: "center",
    justifyContent: "center",
  },
  actionsRow: { flexDirection: "row", gap: 12 },
  actionCard: { flex: 1, borderRadius: RADIUS, paddingVertical: 16, alignItems: "center", justifyContent: "center", gap: 6 },
  whatsappCard: { backgroundColor: "#25D366" },
  whatsappText: { fontSize: 13, fontWeight: "700", color: "#fff" },
  shareCard: {
    backgroundColor: Colors.card ?? "#f5f5f7",
    borderWidth: 1,
    borderColor: Colors.border ?? "rgba(0,0,0,0.06)",
  },
  shareText: { fontSize: 13, fontWeight: "700", color: Colors.text },
});