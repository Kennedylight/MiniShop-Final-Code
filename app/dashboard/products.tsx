import { useEffect, useState } from 'react';
import { Alert, Text, StyleSheet, View } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { auth } from '@/services/firebase';
import { getCurrentOwner } from '@/services/authService';
import { addProduct, deleteProduct, listOwnerProducts, updateProduct, uploadProductImage } from '@/services/productService';
import { Product } from '@/types/Product';
import { PlanId, getPhotoLimit } from '@/constants/plans';
import { Screen } from '@/components/Screen';
import { Input } from '@/components/Input';
import { Button } from '@/components/Button';
import { ProductCard } from '@/components/ProductCard';
import { Colors } from '@/constants/colors';

export default function Products() {
  const [products, setProducts] = useState<Product[]>([]);
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [desc, setDesc] = useState('');
  const [image, setImage] = useState<string | undefined>();
  const [plan, setPlan] = useState<PlanId>('starter');
  const [editingId, setEditingId] = useState<string | null>(null);

  const uid = auth.currentUser?.uid;

  const load = async () => {
    if (!uid) return;
    const owner = await getCurrentOwner(uid);
    setPlan((owner?.plan as PlanId) || 'starter');
    setProducts(await listOwnerProducts(uid));
  };

  useEffect(() => { load(); }, []);

  const pick = async () => {
    const res = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ['images'], quality: 0.75 });
    if (!res.canceled) setImage(res.assets[0].uri);
  };

  const clearForm = () => { setName(''); setPrice(''); setDesc(''); setImage(undefined); setEditingId(null); };

  const startEdit = (p: Product) => {
    setEditingId(p.productId);
    setName(p.name);
    setPrice(String(p.price));
    setDesc(p.description ?? '');
    setImage(p.imageUrl);
  };

  const submit = async () => {
    try {
      if (!uid) throw new Error('Login required');
      let imageUrl = image;
      if (image && !image.startsWith('http')) imageUrl = await uploadProductImage(uid, image);

      if (editingId) {
        await updateProduct(editingId, { name, price: Number(price), description: desc, imageUrl });
      } else {
        await addProduct(uid, plan, { name, price: Number(price), description: desc, imageUrl, isAvailable: true });
      }
      clearForm();
      await load();
    } catch (e: any) {
      Alert.alert('Product error', e.message);
    }
  };

  const remove = (productId: string) => {
    Alert.alert('Delete product', 'Are you sure?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: async () => {
        await deleteProduct(productId).catch(e => Alert.alert('Error', e.message));
        await load();
      }},
    ]);
  };

  const limit = getPhotoLimit(plan);

  return (
    <Screen>
      <Text style={styles.title}>Products</Text>
      <Text style={styles.sub}>{products.length}/{limit} photos used. MiniShop maximum is 15.</Text>

      <Input placeholder="Product name" value={name} onChangeText={setName} />
      <Input placeholder="Price" keyboardType="decimal-pad" value={price} onChangeText={setPrice} />
      <Input placeholder="Description" value={desc} onChangeText={setDesc} />
      <View style={{ gap: 10 }}>
        <Button title={image ? 'Photo selected' : 'Choose Photo'} onPress={pick} variant="outline" />
        <Button title={editingId ? 'Save Changes' : 'Add Product'} onPress={submit} />
        {editingId && <Button title="Cancel Edit" onPress={clearForm} variant="outline" />}
      </View>

      {products.map(p => (
        <View key={p.productId}>
          <ProductCard product={p} />
          <View style={styles.actions}>
            <Button title="Edit" onPress={() => startEdit(p)} variant="outline" />
            <Button title="Delete" onPress={() => remove(p.productId)} variant="danger" />
          </View>
        </View>
      ))}
    </Screen>
  );
}

const styles = StyleSheet.create({
  title: { fontSize: 32, fontWeight: '900', color: Colors.text },
  sub: { color: Colors.muted },
  actions: { flexDirection: 'row', gap: 10, marginTop: 6 },
});
