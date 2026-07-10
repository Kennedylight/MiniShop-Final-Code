import { useState } from 'react';
import { View, Text, TouchableOpacity, Modal, FlatList, StyleSheet } from 'react-native';
import { useTheme } from '@/context/ThemeContext';
import { COUNTRY_CODES, CountryCode } from '@/constants/countryCodes';

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
      <Text style={[styles.label, { color: colors.muted }]}>{label}</Text>
      <TouchableOpacity style={[styles.button, { borderColor: colors.border, backgroundColor: colors.card }]} onPress={() => setOpen(true)}>
        <Text style={[styles.buttonText, { color: colors.text }]}>{current.flag}  {current.name} — {current.currency}</Text>
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
  label: { fontSize: 13, marginBottom: 6 },
  button: {
    borderWidth: 1,
    borderRadius: 14,
    padding: 14,
  },
  buttonText: { fontWeight: '700' },
  backdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'flex-end' },
  sheet: { borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 20, maxHeight: '70%' },
  sheetTitle: { fontWeight: '900', fontSize: 18, marginBottom: 12 },
  optionRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 12, borderBottomWidth: 1 },
  optionText: { fontSize: 15 },
  optionCurrency: { fontWeight: '700' },
});
