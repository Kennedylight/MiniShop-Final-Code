import { useLocalSearchParams, router } from "expo-router";
import { useState } from "react";
import { Alert, Text, StyleSheet } from "react-native";
import { useTranslation } from "react-i18next";
import { Screen } from "@/components/Screen";
import { Input } from "@/components/Input";
import { Button } from "@/components/Button";
import { createOrder } from "@/services/orderService";
import { OrderItem } from "@/types/Order";
import { formatPrice } from "@/constants/currency";
import { useTheme } from "@/context/ThemeContext";
export default function Checkout() {
  const { t } = useTranslation();
   const { colors } = useTheme();
  const params = useLocalSearchParams<{
    ownerId: string;
    shopName: string;
    slug: string;
    item: string;
  }>();
  const item: OrderItem = params.item ? JSON.parse(params.item) : null;
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [customerWhatsapp, setCustomerWhatsapp] = useState("");
  const [deliveryAddress, setDeliveryAddress] = useState("");
  const [notes, setNotes] = useState("");
  const submit = async () => {
    try {
      if (!item) throw new Error(t("shop.cartEmpty"));
      const orderId = await createOrder({
        ownerId: params.ownerId,
        shopName: params.shopName,
        customerName,
        customerPhone,
        customerWhatsapp,
        deliveryAddress,
        notes,
        items: [item],
        estimatedTotal: item.price * item.quantity,
        currency: item.currency,
      });
      router.replace({
        pathname: "/shop/confirmation",
        params: { orderId, shopName: params.shopName },
      });
    } catch (e: any) {
      Alert.alert(t("shop.orderError"), e.message);
    }
  };
  const continueShopping = () => {
    if (params.slug) {
      router.replace(`/shop/${params.slug}`);
    } else if (router.canGoBack()) {
      router.back();
    } else {
      router.replace("/");
    }
  };
  return (
    <Screen>
      <Text style={[styles.title, { color: colors.text }]}>{t("shop.checkout")}</Text>
      <Text style={[styles.notice, { color: colors.bg }]  }>{t("shop.paymentNotice")}</Text>
      {item && (
        <Text style={[styles.summary, { color: colors.text }]}>
          {item.quantity}x {item.name} —{" "}
          {formatPrice(item.price * item.quantity, item.currency)}
        </Text>
      )}
      <Input
        placeholder={t("shop.fullName")}
        value={customerName}
        onChangeText={setCustomerName}
      />
      <Input
        placeholder={t("shop.phone")}
        value={customerPhone}
        onChangeText={setCustomerPhone}
      />
      <Input
        placeholder={t("shop.whatsapp")}
        value={customerWhatsapp}
        onChangeText={setCustomerWhatsapp}
      />
      <Input
        placeholder={t("shop.deliveryLocation")}
        value={deliveryAddress}
        onChangeText={setDeliveryAddress}
      />
      <Input
        placeholder={t("shop.specialNotes")}
        value={notes}
        onChangeText={setNotes}
      />
      <Button title={t("shop.submitOrder")} onPress={submit} />
      <Button
        title={t("shop.continueShopping")}
        variant="outline"
        onPress={continueShopping}
      />
    </Screen>
  );
}
const styles = StyleSheet.create({
  title: { fontSize: 34, fontWeight: "900" },
  notice: {
    backgroundColor: "#ECFDF5",
    padding: 12,
    borderRadius: 12,
    color: "#065F46",
    fontWeight: "700",
  },
  summary: { fontSize: 16, fontWeight: "800" },
});
