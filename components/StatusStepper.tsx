import { View, Text, StyleSheet } from 'react-native';
import { Colors } from '@/constants/colors';
import { OrderStatus } from '@/types/Order';

const STEPS: OrderStatus[] = ['new', 'confirmed', 'in_process', 'ready', 'out_for_delivery', 'completed'];

const LABELS: Record<OrderStatus, string> = {
  new: 'Order placed',
  confirmed: 'Confirmed',
  in_process: 'In process',
  ready: 'Ready',
  out_for_delivery: 'Out for delivery',
  completed: 'Completed',
  cancelled: 'Cancelled',
};

export function StatusStepper({ status }: { status: OrderStatus }) {
  if (status === 'cancelled') {
    return (
      <View style={styles.cancelledBox}>
        <Text style={styles.cancelledTitle}>Order cancelled</Text>
        <Text style={styles.cancelledNote}>This order will not be fulfilled.</Text>
      </View>
    );
  }

  const currentIndex = STEPS.indexOf(status);

  return (
    <View>
      {STEPS.map((step, i) => {
        const done = i < currentIndex;
        const active = i === currentIndex;
        const isLast = i === STEPS.length - 1;

        return (
          <View key={step} style={styles.row}>
            <View style={styles.dotColumn}>
              <View
                style={[
                  styles.dot,
                  { backgroundColor: done || active ? Colors.primary : Colors.border },
                ]}
              >
                <Text style={styles.dotText}>{done ? '✓' : i + 1}</Text>
              </View>
              {!isLast && (
                <View
                  style={[
                    styles.line,
                    { backgroundColor: done ? Colors.primary : Colors.border },
                  ]}
                />
              )}
            </View>
            <Text style={[styles.label, (active || done) && styles.labelActive]}>
              {LABELS[step]}
            </Text>
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'flex-start', gap: 12 },
  dotColumn: { alignItems: 'center' },
  dot: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dotText: { color: '#FFFFFF', fontWeight: '900', fontSize: 12 },
  line: { width: 2, height: 28 },
  label: { paddingTop: 4, paddingBottom: 20, color: Colors.muted, fontSize: 14 },
  labelActive: { color: Colors.text, fontWeight: '900' },
  cancelledBox: {
    backgroundColor: '#FEE2E2',
    borderRadius: 18,
    padding: 16,
  },
  cancelledTitle: { color: Colors.danger, fontWeight: '900', fontSize: 16 },
  cancelledNote: { color: Colors.muted, marginTop: 4 },
});