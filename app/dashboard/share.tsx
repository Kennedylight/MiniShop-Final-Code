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
import { useTheme } from "@/context/ThemeContext";

type LinkStatus = "loading" | "ready" | "signInRequired" | "profileIncomplete" | "error";

export default function SharePage() {
  const { t } = useTranslation();
  const { colors } = useTheme();
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
        <Text style={[styles.title, { color: colors.text }]}>
          {t("share.title")}
        </Text>
        <Text style={[styles.subtitle, { color: colors.muted }]}>
          {t("share.subtitle")}
        </Text>
      </View>

      {/* QR Code */}
      <Card style={[styles.qrCard, { backgroundColor: colors.card || "#f5f5f7" }]}>
        {status === "loading" ? (
          <View style={styles.qrPlaceholder}>
            <Ionicons name="qr-code-outline" size={40} color={colors.muted} />
          </View>
        ) : qrUrl ? (
          <Image source={{ uri: qrUrl }} style={styles.qrImage} resizeMode="contain" />
        ) : (
          <View style={styles.qrPlaceholder}>
            <Ionicons name="alert-circle-outline" size={32} color={colors.muted} />
            <Text style={[styles.qrErrorText, { color: colors.muted }]}>
              {statusMessage[status as Exclude<LinkStatus, "ready">]}
            </Text>
          </View>
        )}
        {isReady && (
          <Text style={[styles.qrHint, { color: colors.muted }]}>
            {t("share.scanToVisit")}
          </Text>
        )}
      </Card>

      {/* Link card with copy */}
      <View style={[styles.linkCard, { backgroundColor: colors.card || "#f5f5f7" }]}>
        <View style={[styles.linkIconWrap, { backgroundColor: colors.background || "#fff" }]}>
          <Ionicons name="link-outline" size={18} color={colors.orange} />
        </View>
        <Text style={[styles.linkText, { color: colors.text }]} numberOfLines={1}>
          {status === "loading" ? t("share.loadingLink") : isReady ? url : statusMessage[status as Exclude<LinkStatus, "ready">]}
        </Text>
        <Pressable
          onPress={handleCopy}
          hitSlop={8}
          style={({ pressed }) => [
            styles.copyButton, 
            { backgroundColor: colors.background || "#fff" },
            pressed && { opacity: 0.7 }
          ]}
        >
          <Ionicons
            name={copied ? "checkmark" : "copy-outline"}
            size={18}
            color={copied ? colors.orange : colors.text}
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
            { 
              backgroundColor: colors.card || "#f5f5f7",
              borderColor: colors.border || "rgba(0,0,0,0.06)"
            },
            pressed && { opacity: 0.85 },
          ]}
        >
          <Ionicons name="share-social-outline" size={22} color={colors.text} />
          <Text style={[styles.shareText, { color: colors.text }]}>
            {t("share.moreOptions")}
          </Text>
        </Pressable>
      </View>
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
  qrCard: { 
    alignItems: "center", 
    borderRadius: RADIUS, 
    paddingVertical: 24, 
    marginBottom: 16 
  },
  qrImage: { 
    width: 180, 
    height: 180 
  },
  qrPlaceholder: { 
    width: 180, 
    height: 180, 
    alignItems: "center", 
    justifyContent: "center", 
    gap: 8 
  },
  qrErrorText: { 
    fontSize: 12, 
    textAlign: "center", 
    paddingHorizontal: 12 
  },
  qrHint: { 
    fontSize: 13, 
    fontWeight: "600", 
    marginTop: 14 
  },
  linkCard: {
    flexDirection: "row",
    alignItems: "center",
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
    alignItems: "center",
    justifyContent: "center",
  },
  linkText: { 
    flex: 1, 
    fontSize: 14, 
    fontWeight: "700" 
  },
  copyButton: {
    width: 32,
    height: 32,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  actionsRow: { 
    flexDirection: "row", 
    gap: 12 
  },
  actionCard: { 
    flex: 1, 
    borderRadius: RADIUS, 
    paddingVertical: 16, 
    alignItems: "center", 
    justifyContent: "center", 
    gap: 6 
  },
  whatsappCard: { 
    backgroundColor: "#25D366" 
  },
  whatsappText: { 
    fontSize: 13, 
    fontWeight: "700", 
    color: "#fff" 
  },
  shareCard: {
    borderWidth: 1,
  },
  shareText: { 
    fontSize: 13, 
    fontWeight: "700" 
  },
});