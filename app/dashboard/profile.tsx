import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Alert, Text, View, StyleSheet, Modal, Pressable } from 'react-native';
import { auth, db } from '@/services/firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { Screen } from '@/components/Screen';
import { Card } from '@/components/Card';
import { Input } from '@/components/Input';
import { Button } from '@/components/Button';
import { LanguagePicker } from '@/components/LanguagePicker';
import { CurrencyPicker } from '@/components/CurrencyPicker';
import { setOwnerCurrencyOnce } from '@/services/authService';
import { fixLegacyCurrency } from '@/services/currencyMigrationService';
import { DEFAULT_CURRENCY } from '@/constants/currency';
import { useTheme } from '@/context/ThemeContext';
import { fontFamily } from '@/constants/typography';
import { Ionicons } from '@expo/vector-icons';

const THEME_OPTIONS = [
  { key: 'light', label: 'Clair', icon: 'sunny-outline' as const },
  { key: 'dark', label: 'Sombre', icon: 'moon-outline' as const },
  { key: 'system', label: 'Système', icon: 'phone-portrait-outline' as const },
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
    <Screen topInset={false}>
      <Text style={[styles.title, { color: colors.text }]}>{t('profile.title')}</Text>

      <Pressable onPress={() => setProfileModalVisible(true)}>
        <Card style={[styles.card, styles.editRow, { shadowColor: colors.shadow }]}>
          <View style={[styles.editIconWrap, { backgroundColor: colors.orangeSoft }]}>
            <Ionicons name="storefront-outline" size={18} color={colors.orange} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={[styles.rowTitle, { color: colors.text }]}>{t('profile.title')}</Text>
            <Text style={[styles.rowSubtitle, { color: colors.muted }]}>{t('profile.save')}</Text>
          </View>
          <Ionicons name="chevron-forward" size={18} color={colors.muted} />
        </Card>
      </Pressable>

      <Card style={[styles.card, { shadowColor: colors.shadow }]}>
        <Text style={[styles.sectionLabel, { color: colors.text }]}>{t('profile.currency')}</Text>
        {currency ? (
          <>
            <View style={[styles.currencyLockedRow, { borderColor: colors.border, backgroundColor: colors.bg }]}>
              <Ionicons name="lock-closed" size={16} color={colors.muted} />
              <Text style={[styles.currencyLockedText, { color: colors.text }]}>{currency}</Text>
            </View>
            <Text style={[styles.currencyHint, { color: colors.muted }]}>
              {t('profile.fixLegacyHint')}
            </Text>
            <Button
              title={t('profile.fixLegacyAction')}
              variant="outline"
              onPress={confirmFixLegacy}
              loading={fixingLegacy}
            />
          </>
        ) : (
          <>
            <CurrencyPicker value={pendingCurrency} onChange={setPendingCurrency} label="" />
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
      </Card>

      <Card style={[styles.card, { shadowColor: colors.shadow }]}>
        <Text style={[styles.sectionLabel, { color: colors.text }]}>Thème</Text>
        <View style={styles.themeRow}>
          {THEME_OPTIONS.map((opt) => {
            const active = mode === opt.key;
            return (
              <Pressable
                key={opt.key}
                onPress={() => setMode(opt.key)}
                style={[
                  styles.themeOption,
                  { borderColor: colors.border, backgroundColor: colors.bg },
                  active && { backgroundColor: colors.orange, borderColor: colors.orange },
                ]}
              >
                <Ionicons name={opt.icon} size={16} color={active ? '#fff' : colors.muted} />
                <Text style={[styles.themeOptionText, { color: active ? '#fff' : colors.text }]}>
                  {opt.label}
                </Text>
              </Pressable>
            );
          })}
        </View>
      </Card>

      <Card style={[styles.card, { shadowColor: colors.shadow }]}>
        <Text style={[styles.sectionLabel, { color: colors.text }]}>{t('profile.language')}</Text>
        <LanguagePicker />
      </Card>

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
      <Pressable onPress={onClose} style={[styles.closeButton, { backgroundColor: colors.card }]} hitSlop={8}>
        <Ionicons name="close" size={22} color={colors.text} />
      </Pressable>
      <Text style={[styles.title, { color: colors.text }]}>{t('profile.title')}</Text>

      <View style={styles.formField}>
        <Input label={t('profile.shopName')} value={shopName} onChangeText={setShopName} />
      </View>
      <View style={styles.formField}>
        <Input label={t('profile.whatsapp')} value={whatsapp} onChangeText={setWhatsapp} />
      </View>
      <View style={styles.formField}>
        <Input label={t('profile.description')} value={description} onChangeText={setDescription} multiline />
      </View>
      <View style={styles.formField}>
        <Input label={t('profile.delivery')} value={delivery} onChangeText={setDelivery} multiline />
      </View>

      <Button title={t('profile.save')} onPress={save} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  title: { fontFamily: fontFamily.displaySemiBold, fontSize: 32, marginBottom: 20 },
  card: {
    marginBottom: 16,
    shadowOpacity: 0.05,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 8 },
    elevation: 2,
  },
  editRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  editIconWrap: {
    width: 40,
    height: 40,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rowTitle: { fontFamily: fontFamily.sansBold, fontSize: 15 },
  rowSubtitle: { fontFamily: fontFamily.sansRegular, fontSize: 12, marginTop: 2 },
  sectionLabel: { fontFamily: fontFamily.sansSemiBold, fontSize: 13, marginBottom: 12 },
  themeRow: { flexDirection: 'row', gap: 8 },
  themeOption: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 14,
    borderWidth: 1,
  },
  themeOptionText: {
    fontFamily: fontFamily.sansSemiBold,
    fontSize: 13,
  },
  closeButton: {
    alignSelf: 'flex-end',
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
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
    fontFamily: fontFamily.sansBold,
    fontSize: 15,
  },
  currencyHint: {
    fontFamily: fontFamily.sansRegular,
    fontSize: 12,
    marginTop: 8,
    marginBottom: 14,
  },
  formField: {
    marginBottom: 16,
  },
});
