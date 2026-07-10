import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Alert, Text, View, StyleSheet, Modal, Pressable } from 'react-native';
import { auth, db } from '@/services/firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { Screen } from '@/components/Screen';
import { Input } from '@/components/Input';
import { Button } from '@/components/Button';
import { LanguagePicker } from '@/components/LanguagePicker';
import { useTheme } from '@/context/ThemeContext';
import { Ionicons } from '@expo/vector-icons';

const THEME_OPTIONS = [
  { key: 'light', label: 'Clair' },
  { key: 'dark', label: 'Sombre' },
  { key: 'system', label: 'Système' },
] as const;

export default function Profile() {
  const { t } = useTranslation();
  const { mode, setMode, colors } = useTheme();
  const [profileModalVisible, setProfileModalVisible] = useState(false);

  return (
    <Screen>
      <Text style={[styles.title, { color: colors.text }]}>{t('profile.title')}</Text>

      <View style={styles.section}>
        <Text style={[styles.sectionLabel, { color: colors.text }]}>{t('profile.title')}</Text>
        <Button title={t('profile.save')} onPress={() => setProfileModalVisible(true)} />
      </View>

      <View style={styles.section}>
        <Text style={[styles.sectionLabel, { color: colors.text }]}>Thème</Text>
        <View style={styles.themeRow}>
          {THEME_OPTIONS.map((opt) => (
            <Pressable
              key={opt.key}
              onPress={() => setMode(opt.key)}
              style={[
                styles.themeOption,
                { borderColor: colors.border },
                mode === opt.key && { backgroundColor: colors.primary, borderColor: colors.primary },
              ]}
            >
              <Text style={{ color: mode === opt.key ? '#fff' : colors.text }}>
                {opt.label}
              </Text>
            </Pressable>
          ))}
        </View>
      </View>

      <View style={styles.section}>
        <Text style={[styles.sectionLabel, { color: colors.text }]}>{t('profile.language')}</Text>
        <LanguagePicker />
      </View>

      <Modal
        visible={profileModalVisible}
        animationType="slide"
        onRequestClose={() => setProfileModalVisible(false)}
      >
        <ProfileEditForm onClose={() => setProfileModalVisible(false)} />
      </Modal>
    </Screen>
  );
}

function ProfileEditForm({ onClose }: { onClose: () => void }) {
  const { t } = useTranslation();
  const { colors } = useTheme();
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
    onClose();
  };

  return (
    <Screen>
     <Pressable onPress={onClose} style={styles.closeButton}>
  <Ionicons name="close" size={28} color={colors.text} />
</Pressable>
      <Text style={[styles.title, { color: colors.text }]}>{t('profile.title')}</Text>

      <Input placeholder={t('profile.shopName')} value={shopName} onChangeText={setShopName} />
      <Input placeholder={t('profile.whatsapp')} value={whatsapp} onChangeText={setWhatsapp} />
      <Input placeholder={t('profile.description')} value={description} onChangeText={setDescription} multiline />
      <Input placeholder={t('profile.delivery')} value={delivery} onChangeText={setDelivery} multiline />

      <Button title={t('profile.save')} onPress={save} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  title: { fontSize: 32, fontWeight: '900' },
  section: { marginTop: 24, marginBottom: 8 },
  sectionLabel: { fontSize: 13, fontWeight: '600', marginBottom: 8 },
  themeRow: { flexDirection: 'row', gap: 8 },
  themeOption: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 1,
  },
  closeButton: {
  alignSelf: 'flex-end',
  padding: 8,
},
});