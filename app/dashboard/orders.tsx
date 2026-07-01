import { useEffect, useState } from 'react';
import { Alert, Text, StyleSheet, View } from 'react-native';
import { auth } from '@/services/firebase';
import { subscribeOwnerOrders, updateOrderStatus } from '@/services/orderService';
import { Order, OrderStatus } from '@/types/Order';
import { Screen } from '@/components/Screen';
import { Card } from '@/components/Card';
import { Button } from '@/components/Button';
import { Colors } from '@/constants/colors';

const STATUS_ORDER: OrderStatus[] = ['new', 'confirmed', 'in_process', 'ready', 'out_for_delivery', 'completed'];

function nextStatuses(current: OrderStatus): OrderStatus[] {
  if (current === 'cancelled' || current === 'completed') return [];
  const idx = STATUS_ORDER.indexOf(current);
  return STATUS_ORDER.slice(idx + 1);
}

export default function Orders() {
  const [orders, setOrders] = useState<Order[]>([]);
  useEffect(() => {
    const uid = auth.currentUser?.uid;
    if (!uid) return;
    return subscribeOwnerOrders(uid, setOrders);
  }, []);
  return (
    <Screen>
      <Text style={styles.title}>Orders</Text>
      {orders.map(o => (
        <Card key={o.orderId}>
          <Text style={styles.order}>#{o.orderId.slice(0, 6)} • {o.customerName}</Text>
          <Text style={styles.text}>{o.customerPhone} • {o.deliveryAddress}</Text>
          <Text style={styles.text}>${o.estimatedTotal.toFixed(2)} • {o.status.replaceAll('_', ' ')}</Text>
          {o.items.map(i => <Text key={i.productId}>{i.quantity}x {i.name}</Text>)}
          <View style={{ height: 10 }} />
          {nextStatuses(o.status).map(s => (
            <Button
              key={s}
              title={`Mark ${s.replaceAll('_', ' ')}`}
              onPress={() => updateOrderStatus(o.orderId, s).catch(e => Alert.alert('Error', e.message))}
              variant="outline"
            />
          ))}
        </Card>
      ))}
    </Screen>
  );
}

const styles = StyleSheet.create({
  title: { fontSize: 32, fontWeight: '900', color: Colors.text },
  order: { fontSize: 18, fontWeight: '900' },
  text: { color: Colors.muted, marginVertical: 2 },
});
