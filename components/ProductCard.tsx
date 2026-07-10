import { Image, Text, View, StyleSheet } from 'react-native';
import { Product } from '@/types/Product';
import { Card } from './Card';
import { Button } from './Button';
import { useTheme } from '@/context/ThemeContext';
import { formatPrice } from '@/constants/currency';

export function ProductCard({ product, onAdd }: { product: Product; onAdd?: () => void }) {
  const { colors } = useTheme();
  return <Card style={styles.card}>
    {product.imageUrl ? <Image source={{ uri: product.imageUrl }} style={styles.image} /> : <View style={[styles.image, styles.placeholder]}><Text>Photo</Text></View>}
    <Text style={[styles.name, { color: colors.text }]}>{product.name}</Text>
    <Text style={[styles.desc, { color: colors.muted }]}>{product.description}</Text>
    <Text style={[styles.price, { color: colors.primary }]}>{formatPrice(product.price, product.currency)}</Text>
    {onAdd && <Button title="Add to Cart" onPress={onAdd} />}
  </Card>;
}
const styles = StyleSheet.create({ card: { gap: 8 }, image: { width: '100%', height: 140, borderRadius: 16, backgroundColor: '#F3F4F6' }, placeholder: { alignItems: 'center', justifyContent: 'center' }, name: { fontSize: 18, fontWeight: '800' }, desc: {}, price: { fontSize: 17, fontWeight: '900' } });
