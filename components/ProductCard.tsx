import { Image, Text, View, StyleSheet } from 'react-native';
import { Product } from '@/types/Product';
import { Card } from './Card';
import { Button } from './Button';
import { Colors } from '@/constants/colors';
export function ProductCard({ product, onAdd }: { product: Product; onAdd?: () => void }) {
  return <Card style={styles.card}>
    {product.imageUrl ? <Image source={{ uri: product.imageUrl }} style={styles.image} /> : <View style={[styles.image, styles.placeholder]}><Text>Photo</Text></View>}
    <Text style={styles.name}>{product.name}</Text>
    <Text style={styles.desc}>{product.description}</Text>
    <Text style={styles.price}>${product.price.toFixed(2)}</Text>
    {onAdd && <Button title="Add to Cart" onPress={onAdd} />}
  </Card>;
}
const styles = StyleSheet.create({ card: { gap: 8 }, image: { width: '100%', height: 140, borderRadius: 16, backgroundColor: '#F3F4F6' }, placeholder: { alignItems: 'center', justifyContent: 'center' }, name: { fontSize: 18, fontWeight: '800', color: Colors.text }, desc: { color: Colors.muted }, price: { fontSize: 17, fontWeight: '900', color: Colors.primary } });
