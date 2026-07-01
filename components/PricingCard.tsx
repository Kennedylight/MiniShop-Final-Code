import { Text, StyleSheet, View } from 'react-native';
import { Card } from './Card';
import { Button } from './Button';
import { PLANS, PlanId } from '@/constants/plans';
import { Colors } from '@/constants/colors';
export function PricingCard({ planId, onChoose }: { planId: PlanId; onChoose: () => void }) {
  const plan = PLANS[planId];
  return <Card style={planId === 'business' ? styles.popular : undefined}>
    {planId === 'business' && <Text style={styles.badge}>Most Popular</Text>}
    <Text style={styles.name}>{plan.name}</Text>
    <Text style={styles.price}>{plan.priceLabel}</Text>
    <View style={styles.limit}><Text style={styles.limitText}>Up to {plan.photoLimit} photos{plan.photoLimit === 15 ? ' (MAX)' : ''}</Text></View>
    <Text style={styles.item}>✓ Create your store</Text>
    <Text style={styles.item}>✓ Share on WhatsApp & social media</Text>
    <Text style={styles.item}>✓ Receive customer orders</Text>
    <Text style={styles.item}>✓ Owner dashboard</Text>
    <Text style={styles.item}>✓ Payment handled outside MiniShop</Text>
    <Button title="Choose Plan" onPress={onChoose} variant={planId === 'premium' ? 'secondary' : 'primary'} />
  </Card>;
}
const styles = StyleSheet.create({ name: { fontSize: 22, fontWeight: '900', color: Colors.text }, price: { fontSize: 28, fontWeight: '900', color: Colors.primary, marginTop: 6 }, limit: { backgroundColor: '#EEF2FF', padding: 10, borderRadius: 12, marginVertical: 10 }, limitText: { fontWeight: '900', color: Colors.primary }, item: { color: Colors.text, marginVertical: 3 }, popular: { borderColor: Colors.secondary, borderWidth: 2 }, badge: { alignSelf: 'flex-start', backgroundColor: Colors.secondary, color: '#fff', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 999, overflow: 'hidden', fontWeight: '800' } });
