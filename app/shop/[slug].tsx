import { useLocalSearchParams, router } from "expo-router";
import { useEffect, useState } from "react";
import { Alert, Text, StyleSheet } from "react-native";
import { useTranslation } from "react-i18next";
import { collection, getDocs, query, where } from "firebase/firestore";
import { db } from "@/services/firebase";
import { findShopBySlug } from "@/services/orderService";
import { Product } from "@/types/Product";
import { Owner } from "@/types/Owner";
import { Screen } from "@/components/Screen";
import { ProductCard } from "@/components/ProductCard";
import { useTheme } from "@/context/ThemeContext";
export default function PublicShop() {
  const { t } = useTranslation();
   const { colors } = useTheme();
  const { slug } = useLocalSearchParams<{ slug: string }>();
  const [owner, setOwner] = useState<Owner | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  useEffect(() => {
    (async () => {
      if (!slug) return;
      const shop: any = await findShopBySlug(slug);
      setOwner(shop as Owner);
      if (shop) {
        const q = query(
          collection(db, "products"),
          where("ownerId", "==", shop.ownerId),
          where("isAvailable", "==", true),
        );
        const snap = await getDocs(q);
        setProducts(
          snap.docs.map((d) => ({ productId: d.id, ...d.data() }) as Product),
        );
      }
    })();
  }, [slug]);
  const add = (p: Product) => {
    router.push({
      pathname: "/shop/checkout",
      params: {
        ownerId: owner?.ownerId,
        shopName: owner?.shopName,
        slug,
        item: JSON.stringify({
          productId: p.productId,
          name: p.name,
          price: p.price,
          currency: p.currency,
          quantity: 1,
          imageUrl: p.imageUrl,
        }),
      },
    });
  };
  if (!owner)
    return (
      <Screen>
        <Text>{t("shop.notFound")}</Text>
      </Screen>
    );
  if (owner.subscriptionStatus !== "active")
    return (
      <Screen>
        <Text style={[styles.title, { color: colors.text }]}>{t("shop.unavailableTitle")}</Text>
        <Text style={[styles.text, { color: colors.muted }]} >{t("shop.unavailableBody")}</Text>
      </Screen>
    );
  return (
    <Screen>
      <Text style={[styles.title, { color: colors.text }]}>{owner.shopName}</Text>
      <Text style={[styles.text, { color: colors.muted }]}>
        {owner.businessDescription || t("shop.browseDescription")}
      </Text>
      <Text style={styles.notice}>{t("shop.paymentNotice")}</Text>
      {products.map((p) => (
        <ProductCard key={p.productId} product={p} onAdd={() => add(p)} />
      ))}
    </Screen>
  );
}
const styles = StyleSheet.create({
  title: { fontSize: 34, fontWeight: "900"},
  text: {  fontSize: 16 },
  notice: {
    backgroundColor: "#FEF3C7",
    padding: 12,
    borderRadius: 12,
    color: "#92400E",
    fontWeight: "700",
  },
});
