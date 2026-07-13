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
import { useTheme } from "@/context/ThemeContext";
import { fontFamily } from "@/constants/typography";

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
        console.warn("SharePage error:", error);
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
    <Screen topInset={false}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: colors.text }]}>
          {t("share.title")}
        </Text>
        <Text style={[styles.subtitle, { color: colors.muted }]}>
          {t("share.subtitle")}
        </Text>
      </View>

      {/* QR Code */}
      <Card style={styles.qrCard}>
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
      <View style={[styles.linkCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <View style={[styles.linkIconWrap, { backgroundColor: colors.orangeSoft }]}>
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
            { backgroundColor: colors.orangeSoft },
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
            { shadowColor: "#25D366" },
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
              backgroundColor: colors.card,
              borderColor: colors.border,
              shadowColor: colors.shadow,
              shadowOpacity: 0.06,
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
  qrCard: {
    alignItems: "center",
    borderRadius: RADIUS,
    paddingVertical: 28,
    marginBottom: 16,
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
    fontFamily: fontFamily.sansSemiBold,
    fontSize: 13,
    marginTop: 16,
  },
  linkCard: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: RADIUS,
    paddingVertical: 14,
    paddingHorizontal: 16,
    marginBottom: 20,
    gap: 12,
    borderWidth: 1,
  },
  linkIconWrap: {
    width: 34,
    height: 34,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  linkText: {
    flex: 1,
    fontFamily: fontFamily.sansBold,
    fontSize: 14,
  },
  copyButton: {
    width: 34,
    height: 34,
    borderRadius: 12,
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
    paddingVertical: 18,
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    shadowOpacity: 0.28,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 8 },
    elevation: 4,
  },
  whatsappCard: {
    backgroundColor: "#25D366"
  },
  whatsappText: {
    fontFamily: fontFamily.sansBold,
    fontSize: 13,
    color: "#fff",
  },
  shareCard: {
    borderWidth: 1,
  },
  shareText: {
    fontFamily: fontFamily.sansBold,
    fontSize: 13,
  },
});