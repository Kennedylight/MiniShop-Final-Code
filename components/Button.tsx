import { Pressable, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { Colors } from '@/constants/colors';

type Props = {
  title: string;
  onPress?: () => void;
  variant?: 'primary' | 'secondary' | 'outline' | 'danger';
  loading?: boolean;
};

export function Button({ title, onPress, variant = 'primary', loading = false }: Props) {
  const isOutline = variant === 'outline';
  return (
    <Pressable onPress={onPress} style={[styles.btn, styles[variant]]} disabled={loading}>
      {loading ? <ActivityIndicator color={isOutline ? Colors.orange : '#fff'} /> : <Text style={[styles.text, isOutline && styles.outlineText]}>{title}</Text>}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  btn: { borderRadius: 18, paddingVertical: 15, paddingHorizontal: 18, alignItems: 'center', justifyContent: 'center' },
  primary: { backgroundColor: Colors.orange },
  secondary: { backgroundColor: Colors.secondary },
  outline: { backgroundColor: 'transparent', borderWidth: 1.4, borderColor: Colors.orange },
  danger: { backgroundColor: Colors.danger },
  text: { color: '#fff', fontWeight: '900', fontSize: 16 },
  outlineText: { color: Colors.orange }
});
