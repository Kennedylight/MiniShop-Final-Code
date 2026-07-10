import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useLocalSearchParams, router } from 'expo-router';
import { View, Text, ActivityIndicator, StyleSheet } from 'react-native';
import { Screen } from '@/components/Screen';
import { Card } from '@/components/Card';
import { Button } from '@/components/Button';
import { StatusStepper } from '@/components/StatusStepper';
import { subscribeToOrder } from '@/services/orderService';
import { Order } from '@/types/Order';
import { formatPrice } from '@/constants/currency';
import { useTheme } from '@/context/ThemeContext';

export default function TrackOrder() {
  const { t } = useTranslation();
  const { colors } = useTheme();
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
        <ActivityIndicator style={{ marginTop: 40 }} color={colors.primary} />
      </Screen>
    );
  }

  if (order === null) {
    return (
      <Screen>
        <Text style={[styles.notFoundTitle, { color: colors.text }]}>{t('track.notFoundTitle')}</Text>
        <Text style={[styles.notFoundBody, { color: colors.muted }]}>
          {t('track.notFoundBody')}
        </Text>
        <Button title={t('shop.backHome')} variant="outline" onPress={() => router.replace('/')} />
      </Screen>
    );
  }

  return (
    <Screen>
      <Text style={[styles.label, { color: colors.muted }]}>{t('track.orderNumber')}</Text>
      <Text style={[styles.orderId, { color: colors.text }]}>#{order.orderId.slice(0, 8).toUpperCase()}</Text>
      <Text style={[styles.shopName, { color: colors.muted }]}>{order.shopName}</Text>

      <Card style={{ marginTop: 20 }}>
        <StatusStepper status={order.status} />
      </Card>

      <Card style={{ marginTop: 16 }}>
        <Text style={[styles.itemsTitle, { color: colors.text }]}>Items</Text>
        {order.items.map((item) => (
          <View key={item.productId} style={styles.itemRow}>
            <Text style={[styles.itemName, { color: colors.text }]}>
              {item.quantity}× {item.name}
            </Text>
            <Text style={[styles.itemPrice, { color: colors.text }]}>
              {formatPrice(item.price * item.quantity, item.currency ?? order.currency)}
            </Text>
          </View>
        ))}
        <View style={[styles.totalRow, { borderTopColor: colors.border }]}> 
          <Text style={[styles.totalLabel, { color: colors.text }]}>Total</Text>
          <Text style={[styles.totalValue, { color: colors.text }]}>{formatPrice(order.estimatedTotal, order.currency)}</Text>
        </View>
      </Card>
    </Screen>
  );
}

const styles = StyleSheet.create({
  label: { fontSize: 13 },
  orderId: { fontSize: 24, fontWeight: '900' },
  shopName: { marginBottom: 4 },
  itemsTitle: { fontWeight: '900', marginBottom: 8 },
  itemRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 4 },
  itemName: {},
  itemPrice: { fontWeight: '700' },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    marginTop: 8,
    paddingTop: 8,
  },
  totalLabel: { fontWeight: '900' },
  totalValue: { fontWeight: '900' },
  notFoundTitle: { fontSize: 20, fontWeight: '900', marginTop: 24 },
  notFoundBody: { marginTop: 8, marginBottom: 20 },
});