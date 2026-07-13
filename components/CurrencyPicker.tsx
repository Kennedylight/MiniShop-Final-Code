import { useState } from 'react';
import { View, Text, TouchableOpacity, Modal, FlatList, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/context/ThemeContext';
import { COUNTRY_CODES, CountryCode } from '@/constants/countryCodes';
import { fontFamily } from '@/constants/typography';

type Props = {
  value?: string; // currency code, e.g. 'USD'
  onChange: (currency: string, country: CountryCode) => void;
  label?: string;
};

export function CurrencyPicker({ value, onChange, label = 'Your country / currency' }: Props) {
  const { colors } = useTheme();
  const [open, setOpen] = useState(false);
  const current = COUNTRY_CODES.find(c => c.currency === value) ?? COUNTRY_CODES[0];

  return (
    <View>
      {label !== '' && <Text style={[styles.label, { color: colors.muted }]}>{label}</Text>}
      <TouchableOpacity style={[styles.button, { borderColor: colors.border, backgroundColor: colors.card }]} onPress={() => setOpen(true)}>
        <Text style={[styles.buttonText, { color: colors.text }]}>{current.flag}  {current.name} — {current.currency}</Text>
        <Ionicons name="chevron-down" size={16} color={colors.muted} />
      </TouchableOpacity>

      <Modal visible={open} animationType="slide" transparent onRequestClose={() => setOpen(false)}>
        <TouchableOpacity style={styles.backdrop} activeOpacity={1} onPress={() => setOpen(false)}>
          <View style={[styles.sheet, { backgroundColor: colors.card }]}> 
            <Text style={[styles.sheetTitle, { color: colors.text }]}>Select your country</Text>
            <FlatList
              data={COUNTRY_CODES}
              keyExtractor={item => item.dial + item.name}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[styles.optionRow, { borderBottomColor: colors.border }]}
                  onPress={() => {
                    onChange(item.currency, item);
                    setOpen(false);
                  }}
                >
                  <Text style={[styles.optionText, { color: colors.text }]}>{item.flag}  {item.name}</Text>
                  <Text style={[styles.optionCurrency, { color: colors.muted }]}>{item.currency}</Text>
                </TouchableOpacity>
              )}
            />
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  label: { fontFamily: fontFamily.sansSemiBold, fontSize: 13, marginBottom: 8 },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderRadius: 18,
    padding: 16,
  },
  buttonText: { fontFamily: fontFamily.sansBold, fontSize: 15 },
  backdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'flex-end' },
  sheet: { borderTopLeftRadius: 28, borderTopRightRadius: 28, padding: 24, maxHeight: '70%' },
  sheetTitle: { fontFamily: fontFamily.displaySemiBold, fontSize: 19, marginBottom: 16 },
  optionRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 14, borderBottomWidth: 1 },
  optionText: { fontFamily: fontFamily.sansMedium, fontSize: 15 },
  optionCurrency: { fontFamily: fontFamily.sansBold, fontSize: 14 },
});
