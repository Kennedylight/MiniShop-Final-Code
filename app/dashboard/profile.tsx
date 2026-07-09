import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Alert, Text, View, StyleSheet } from 'react-native';
import { auth, db } from '@/services/firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { Screen } from '@/components/Screen';
import { Input } from '@/components/Input';
import { Button } from '@/components/Button';
import { LanguagePicker } from '@/components/LanguagePicker';
import { Colors } from '@/constants/colors';

export default function Profile() {
  const { t } = useTranslation();
  const [shopName, setShopName] = useState('');
  const [description, setDescription] = useState('');
  const [delivery, setDelivery] = useState('');
  const [whatsapp, setWhatsapp] = useState('');

  useEffect(() => {
    const uid = auth.currentUser?.uid;
    if (uid)
      getDoc(doc(db, 'owners', uid)).then((s) => {
        const d = s.data();
        if (d) {
          setShopName(d.shopName || '');
          setDescription(d.businessDescription || '');
          setDelivery(d.deliveryInfo || '');
          setWhatsapp(d.whatsapp || '');
        }
      });
  }, []);

  const save = async () => {
    const uid = auth.currentUser?.uid;
    if (!uid) return;
    await setDoc(
      doc(db, 'owners', uid),
      { shopName, businessDescription: description, deliveryInfo: delivery, whatsapp, updatedAt: Date.now() },
      { merge: true }
    );
    Alert.alert(t('profile.saved'), t('profile.profileUpdated'));
  };

  return (
    <Screen>
      <Text style={styles.title}>{t('profile.title')}</Text>

      <Input placeholder={t('profile.shopName')} value={shopName} onChangeText={setShopName} />
      <Input placeholder={t('profile.whatsapp')} value={whatsapp} onChangeText={setWhatsapp} />
      <Input placeholder={t('profile.description')} value={description} onChangeText={setDescription} multiline />
      <Input placeholder={t('profile.delivery')} value={delivery} onChangeText={setDelivery} multiline />

      <View style={styles.languageSection}>
        <Text style={styles.sectionLabel}>{t('profile.language')}</Text>
        <LanguagePicker />
      </View>

      <Button title={t('profile.save')} onPress={save} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  title: { fontSize: 32, fontWeight: '900', color: Colors.text },
  languageSection: { marginTop: 24, marginBottom: 8 },
  sectionLabel: { fontSize: 13, fontWeight: '600', color: Colors.text, marginBottom: 8 },
});