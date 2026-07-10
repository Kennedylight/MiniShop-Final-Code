import { useState } from 'react';
import { View, Text, TouchableOpacity, Modal, FlatList, StyleSheet } from 'react-native';
import { Input } from './Input';
import { useTheme } from '@/context/ThemeContext';
import { COUNTRY_CODES, CountryCode } from '@/constants/countryCodes';

type Props = {
  placeholder: string;
  value: string;
  onChangeText: (value: string) => void;
  defaultDialCode?: string;
};

export function PhoneInput({ placeholder, value, onChangeText, defaultDialCode = '+237' }: Props) {
  const { colors } = useTheme();
  const [pickerOpen, setPickerOpen] = useState(false);

  const currentCountry =
    COUNTRY_CODES.find(c => value.startsWith(c.dial)) ??
    COUNTRY_CODES.find(c => c.dial === defaultDialCode) ??
    COUNTRY_CODES[0];

  const localNumber = value.startsWith(currentCountry.dial)
    ? value.slice(currentCountry.dial.length)
    : value;

  const setCountry = (country: CountryCode) => {
    onChangeText(country.dial + localNumber.replace(/\D/g, ''));
    setPickerOpen(false);
  };

  const setLocalNumber = (text: string) => {
    const digits = text.replace(/\D/g, '');
    onChangeText(currentCountry.dial + digits);
  };

  return (
    <View>
      <View style={styles.row}>
        <TouchableOpacity style={[styles.codeButton, { borderColor: colors.border, backgroundColor: colors.card }]} onPress={() => setPickerOpen(true)}>
          <Text style={[styles.codeText, { color: colors.text }]}>{currentCountry.flag} {currentCountry.dial}</Text>
        </TouchableOpacity>
        <View style={{ flex: 1 }}>
          <Input
            placeholder={placeholder}
            value={localNumber}
            onChangeText={setLocalNumber}
            keyboardType="phone-pad"
          />
        </View>
      </View>

      <Modal visible={pickerOpen} animationType="slide" transparent onRequestClose={() => setPickerOpen(false)}>
        <TouchableOpacity style={styles.backdrop} activeOpacity={1} onPress={() => setPickerOpen(false)}>
          <View style={[styles.sheet, { backgroundColor: colors.card }]}> 
            <Text style={[styles.sheetTitle, { color: colors.text }]}>Select country code</Text>
            <FlatList
              data={COUNTRY_CODES}
              keyExtractor={item => item.dial + item.name}
              renderItem={({ item }) => (
                <TouchableOpacity style={[styles.optionRow, { borderBottomColor: colors.border }]} onPress={() => setCountry(item)}>
                  <Text style={[styles.optionText, { color: colors.text }]}>{item.flag}  {item.name}</Text>
                  <Text style={[styles.optionDial, { color: colors.muted }]}>{item.dial}</Text>
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
  row: { flexDirection: 'row', gap: 8, alignItems: 'center' },
  codeButton: {
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 14,
  },
  codeText: { fontWeight: '700' },
  backdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'flex-end' },
  sheet: { borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 20, maxHeight: '70%' },
  sheetTitle: { fontWeight: '900', fontSize: 18, marginBottom: 12 },
  optionRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 12, borderBottomWidth: 1 },
  optionText: { fontSize: 15 },
  optionDial: { fontWeight: '700' },
});