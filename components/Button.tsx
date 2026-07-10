import { Pressable, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { useTheme } from '@/context/ThemeContext';

type Props = {
  title: string;
  onPress?: () => void;
  variant?: 'primary' | 'secondary' | 'outline' | 'danger';
  loading?: boolean;
};

export function Button({ title, onPress, variant = 'primary', loading = false }: Props) {
  const { colors } = useTheme();
  const isOutline = variant === 'outline';
  const variantStyle = {
    primary: { backgroundColor: colors.orange },
    secondary: { backgroundColor: colors.secondary },
    outline: { backgroundColor: 'transparent', borderWidth: 1.4, borderColor: colors.orange },
    danger: { backgroundColor: colors.danger },
  }[variant];

  return (
    <Pressable onPress={onPress} style={[styles.btn, variantStyle]} disabled={loading}>
      {loading ? <ActivityIndicator color={isOutline ? colors.orange : '#fff'} /> : <Text style={[styles.text, isOutline && { color: colors.orange }]}>{title}</Text>}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  btn: { borderRadius: 18, paddingVertical: 15, paddingHorizontal: 18, alignItems: 'center', justifyContent: 'center' },
  text: { color: '#fff', fontWeight: '900', fontSize: 16 },
});
