import { TextInput, StyleSheet, TextInputProps } from 'react-native';
import { Colors } from '@/constants/colors';
export function Input(props: TextInputProps) { return <TextInput placeholderTextColor="#9CA3AF" {...props} style={[styles.input, props.style]} />; }
const styles = StyleSheet.create({ input: { backgroundColor: '#fff', borderWidth: 1, borderColor: Colors.border, borderRadius: 14, padding: 14, fontSize: 16, color: Colors.text } });
