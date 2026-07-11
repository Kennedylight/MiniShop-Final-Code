import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Alert, Text, View, StyleSheet, Modal, Pressable } from 'react-native';
import { auth, db } from '@/services/firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { Screen } from '@/components/Screen';
import { Input } from '@/components/Input';
import { Button } from '@/components/Button';
import { LanguagePicker } from '@/components/LanguagePicker';
import { CurrencyPicker } from '@/components/CurrencyPicker';
import { setOwnerCurrencyOnce } from '@/services/authService';
import { fixLegacyCurrency } from '@/services/currencyMigrationService';
import { DEFAULT_CURRENCY } from '@/constants/currency';
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
  const [currency, setCurrency] = useState<string | undefined>(undefined);
  const [pendingCurrency, setPendingCurrency] = useState(DEFAULT_CURRENCY);
  const [savingCurrency, setSavingCurrency] = useState(false);
  const [fixingLegacy, setFixingLegacy] = useState(false);

  const loadCurrency = () => {
    const uid = auth.currentUser?.uid;
    if (!uid) return;
    getDoc(doc(db, 'owners', uid)).then((s) => {
      setCurrency(s.data()?.currency);
    });
  };

  useEffect(() => {
    loadCurrency();
  }, []);

  const confirmCurrency = () => {
    Alert.alert(
      t('profile.currencyConfirmTitle'),
      t('profile.currencyConfirmMessage', { currency: pendingCurrency }),
      [
        { text: t('products.cancel'), style: 'cancel' },
        {
          text: t('profile.currencyConfirmAction'),
          onPress: async () => {
            const uid = auth.currentUser?.uid;
            if (!uid) return;
            try {
              setSavingCurrency(true);
              await setOwnerCurrencyOnce(uid, pendingCurrency);
              loadCurrency();
            } catch {
              Alert.alert(t('profile.currencyErrorTitle'), t('profile.currencyErrorMessage'));
            } finally {
              setSavingCurrency(false);
            }
          },
        },
      ],
    );
  };

  const confirmFixLegacy = () => {
    if (!currency) return;
    Alert.alert(
      t('profile.fixLegacyConfirmTitle'),
      t('profile.fixLegacyConfirmMessage'),
      [
        { text: t('products.cancel'), style: 'cancel' },
        {
          text: t('profile.fixLegacyAction'),
          onPress: async () => {
            const uid = auth.currentUser?.uid;
            if (!uid) return;
            try {
              setFixingLegacy(true);
              const { products, orders } = await fixLegacyCurrency(uid, currency);
              Alert.alert(
                t('profile.fixLegacyDoneTitle'),
                t('profile.fixLegacyDoneMessage', { products, orders }),
              );
            } catch {
              Alert.alert(t('profile.currencyErrorTitle'), t('profile.fixLegacyErrorMessage'));
            } finally {
              setFixingLegacy(false);
            }
          },
        },
      ],
    );
  };

  return (
    <Screen>
      <Text style={[styles.title, { color: colors.text }]}>{t('profile.title')}</Text>

      <View style={styles.section}>
        <Text style={[styles.sectionLabel, { color: colors.text }]}>{t('profile.title')}</Text>
        <Button title={t('profile.save')} onPress={() => setProfileModalVisible(true)} />
      </View>

      <View style={styles.section}>
        <Text style={[styles.sectionLabel, { color: colors.text }]}>{t('profile.currency')}</Text>
        {currency ? (
          <>
            <View style={[styles.currencyLockedRow, { borderColor: colors.border, backgroundColor: colors.card }]}>
              <Ionicons name="lock-closed" size={16} color={colors.muted} />
              <Text style={[styles.currencyLockedText, { color: colors.text }]}>{currency}</Text>
            </View>
            <Text style={[styles.currencyHint, { color: colors.muted }]}>
              {t('profile.fixLegacyHint')}
            </Text>
            <Button
              title={t('profile.fixLegacyAction')}
              onPress={confirmFixLegacy}
              loading={fixingLegacy}
            />
          </>
        ) : (
          <>
            <CurrencyPicker value={pendingCurrency} onChange={setPendingCurrency} />
            <Text style={[styles.currencyHint, { color: colors.muted }]}>
              {t('profile.currencyHint')}
            </Text>
            <Button
              title={t('profile.currencyConfirmAction')}
              onPress={confirmCurrency}
              loading={savingCurrency}
            />
          </>
        )}
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
  currencyLockedRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    borderWidth: 1,
    borderRadius: 14,
    padding: 14,
  },
  currencyLockedText: {
    fontSize: 15,
    fontWeight: '700',
  },
  currencyHint: {
    fontSize: 12,
    marginTop: 6,
    marginBottom: 12,
  },
});