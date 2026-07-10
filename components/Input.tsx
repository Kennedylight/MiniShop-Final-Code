import { TextInput, StyleSheet, TextInputProps } from 'react-native';
import { useTheme } from '@/context/ThemeContext';

export function Input(props: TextInputProps) {
  const { colors } = useTheme();
  return <TextInput placeholderTextColor="#9CA3AF" {...props} style={[styles.input, { backgroundColor: colors.card, borderColor: colors.border, color: colors.text }, props.style]} />;
}

const styles = StyleSheet.create({ input: { borderWidth: 1, borderRadius: 14, padding: 14, fontSize: 16 } });
