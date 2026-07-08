import { useEffect, useState } from 'react';
import { useLocalSearchParams, router } from 'expo-router';
import { View, Text, ActivityIndicator, StyleSheet } from 'react-native';
import { Screen } from '@/components/Screen';
import { Card } from '@/components/Card';
import { Button } from '@/components/Button';
import { StatusStepper } from '@/components/StatusStepper';
import { subscribeToOrder } from '@/services/orderService';
import { Order } from '@/types/Order';
import { Colors } from '@/constants/colors';
import { formatPrice } from '@/constants/currency';

export default function TrackOrder() {
  const { orderId } = useLocalSearchParams<{ orderId: string }>();
  const [order, setOrder] = useState<Order | null | undefined>(undefined); // undefined = loading

  useEffect(() => {
    if (!orderId) return;
    const unsubscribe = subscribeToOrder(orderId, (result) => {
      setOrder(result);
    });
    return unsubscribe;
  }, [orderId]);

  if (order === undefined) {
    return (
      <Screen>
        <ActivityIndicator style={{ marginTop: 40 }} color={Colors.primary} />
      </Screen>
    );
  }

  if (order === null) {
    return (
      <Screen>
        <Text style={styles.notFoundTitle}>Order not found</Text>
        <Text style={styles.notFoundBody}>
          This tracking link may be invalid or expired.
        </Text>
        <Button title="Back home" variant="outline" onPress={() => router.replace('/')} />
      </Screen>
    );
  }

  return (
    <Screen>
      <Text style={styles.label}>Order number</Text>
      <Text style={styles.orderId}>#{order.orderId.slice(0, 8).toUpperCase()}</Text>
      <Text style={styles.shopName}>{order.shopName}</Text>

      <Card style={{ marginTop: 20 }}>
        <StatusStepper status={order.status} />
      </Card>

      <Card style={{ marginTop: 16 }}>
        <Text style={styles.itemsTitle}>Items</Text>
        {order.items.map((item) => (
          <View key={item.productId} style={styles.itemRow}>
            <Text style={styles.itemName}>
              {item.quantity}× {item.name}
            </Text>
            <Text style={styles.itemPrice}>
              {formatPrice(item.price * item.quantity, item.currency ?? order.currency)}
            </Text>
          </View>
        ))}
        <View style={styles.totalRow}>
          <Text style={styles.totalLabel}>Total</Text>
          <Text style={styles.totalValue}>{formatPrice(order.estimatedTotal, order.currency)}</Text>
        </View>
      </Card>
    </Screen>
  );
}

const styles = StyleSheet.create({
  label: { color: Colors.muted, fontSize: 13 },
  orderId: { color: Colors.text, fontSize: 24, fontWeight: '900' },
  shopName: { color: Colors.muted, marginBottom: 4 },
  itemsTitle: { fontWeight: '900', color: Colors.text, marginBottom: 8 },
  itemRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 4 },
  itemName: { color: Colors.text },
  itemPrice: { color: Colors.text, fontWeight: '700' },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    marginTop: 8,
    paddingTop: 8,
  },
  totalLabel: { fontWeight: '900', color: Colors.text },
  totalValue: { fontWeight: '900', color: Colors.text },
  notFoundTitle: { fontSize: 20, fontWeight: '900', color: Colors.text, marginTop: 24 },
  notFoundBody: { color: Colors.muted, marginTop: 8, marginBottom: 20 },
});