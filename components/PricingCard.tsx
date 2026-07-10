import { Text, StyleSheet, View } from 'react-native';
import { Card } from './Card';
import { Button } from './Button';
import { PLANS, PlanId } from '@/constants/plans';
import { useTheme } from '@/context/ThemeContext';

export function PricingCard({ planId, onChoose }: { planId: PlanId; onChoose: () => void }) {
  const { colors } = useTheme();
  const plan = PLANS[planId];
  return <Card style={planId === 'business' ? [styles.popular, { borderColor: colors.secondary }] : undefined}>
    {planId === 'business' && <Text style={[styles.badge, { backgroundColor: colors.secondary }]}>Most Popular</Text>}
    <Text style={[styles.name, { color: colors.text }]}>{plan.name}</Text>
    <Text style={[styles.price, { color: colors.primary }]}>{plan.priceLabel}</Text>
    <View style={[styles.limit, { backgroundColor: colors.orangeSoft }]}><Text style={[styles.limitText, { color: colors.primary }]}>Up to {plan.photoLimit} photos{plan.photoLimit === 15 ? ' (MAX)' : ''}</Text></View>
    <Text style={[styles.item, { color: colors.text }]}>✓ Create your store</Text>
    <Text style={[styles.item, { color: colors.text }]}>✓ Share on WhatsApp & social media</Text>
    <Text style={[styles.item, { color: colors.text }]}>✓ Receive customer orders</Text>
    <Text style={[styles.item, { color: colors.text }]}>✓ Owner dashboard</Text>
    <Text style={[styles.item, { color: colors.text }]}>✓ Payment handled outside MiniShop</Text>
    <Button title="Choose Plan" onPress={onChoose} variant={planId === 'premium' ? 'secondary' : 'primary'} />
  </Card>;
}
const styles = StyleSheet.create({ name: { fontSize: 22, fontWeight: '900' }, price: { fontSize: 28, fontWeight: '900', marginTop: 6 }, limit: { padding: 10, borderRadius: 12, marginVertical: 10 }, limitText: { fontWeight: '900' }, item: { marginVertical: 3 }, popular: { borderWidth: 2 }, badge: { alignSelf: 'flex-start', color: '#fff', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 999, overflow: 'hidden', fontWeight: '800' } });
