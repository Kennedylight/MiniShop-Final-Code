import { useEffect, useState } from "react";
import { Alert, Share, Text, StyleSheet } from "react-native";
import { auth } from "@/services/firebase";
import { getCurrentOwner } from "@/services/authService";
import { Screen } from "@/components/Screen";
import { Card } from "@/components/Card";
import { Button } from "@/components/Button";
import { Colors } from "@/constants/colors";

export default function SharePage() {
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadStoreLink() {
      try {
        const uid = auth.currentUser?.uid;

        if (!uid) {
          setUrl("Please sign in first.");
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
          setUrl("Please complete your store profile first.");
          return;
        }

        setUrl(`${cleanBaseUrl}/${shopSlug}`);
      } catch (error) {
        console.log("SharePage error:", error);
        setUrl("Could not load store link.");
      } finally {
        setLoading(false);
      }
    }

    loadStoreLink();
  }, []);

  const handleShare = async () => {
    if (!url || url.includes("Please") || url.includes("Could not")) {
      Alert.alert("Store Link", url || "Store link is not ready yet.");
      return;
    }

    await Share.share({
      message: `Shop with us on MiniShop: ${url}`,
    });
  };

  const handleCopyManual = () => {
    Alert.alert("Store Link", url || "Store link is not ready yet.");
  };

  return (
    <Screen>
      <Text style={styles.title}>Share your store</Text>

      <Card>
        <Text style={styles.url}>
          {loading ? "Loading store link..." : url}
        </Text>
      </Card>

      <Button title="Share Link" onPress={handleShare} />
      <Button
        title="Copy manually"
        onPress={handleCopyManual}
        variant="outline"
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  title: {
    fontSize: 32,
    fontWeight: "900",
    color: Colors.text,
  },
  url: {
    fontWeight: "800",
    color: Colors.primary,
  },
});
