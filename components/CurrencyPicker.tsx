import { useState } from 'react';
import { View, Text, TouchableOpacity, Modal, FlatList, StyleSheet } from 'react-native';
import { Colors } from '@/constants/colors';
import { COUNTRY_CODES, CountryCode } from '@/constants/countryCodes';

type Props = {
  value?: string; // currency code, e.g. 'USD'
  onChange: (currency: string, country: CountryCode) => void;
  label?: string;
};

export function CurrencyPicker({ value, onChange, label = 'Your country / currency' }: Props) {
  const [open, setOpen] = useState(false);
  const current = COUNTRY_CODES.find(c => c.currency === value) ?? COUNTRY_CODES[0];

  return (
    <View>
      <Text style={styles.label}>{label}</Text>
      <TouchableOpacity style={styles.button} onPress={() => setOpen(true)}>
        <Text style={styles.buttonText}>{current.flag}  {current.name} — {current.currency}</Text>
      </TouchableOpacity>

      <Modal visible={open} animationType="slide" transparent onRequestClose={() => setOpen(false)}>
        <TouchableOpacity style={styles.backdrop} activeOpacity={1} onPress={() => setOpen(false)}>
          <View style={styles.sheet}>
            <Text style={styles.sheetTitle}>Select your country</Text>
            <FlatList
              data={COUNTRY_CODES}
              keyExtractor={item => item.dial + item.name}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.optionRow}
                  onPress={() => {
                    onChange(item.currency, item);
                    setOpen(false);
                  }}
                >
                  <Text style={styles.optionText}>{item.flag}  {item.name}</Text>
                  <Text style={styles.optionCurrency}>{item.currency}</Text>
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
  label: { color: Colors.muted, fontSize: 13, marginBottom: 6 },
  button: {
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 14,
    padding: 14,
    backgroundColor: '#FFFFFF',
  },
  buttonText: { fontWeight: '700', color: Colors.text },
  backdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'flex-end' },
  sheet: { backgroundColor: '#FFFFFF', borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 20, maxHeight: '70%' },
  sheetTitle: { fontWeight: '900', fontSize: 18, color: Colors.text, marginBottom: 12 },
  optionRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: Colors.border },
  optionText: { color: Colors.text, fontSize: 15 },
  optionCurrency: { color: Colors.muted, fontWeight: '700' },
});
