import { useRef } from 'react';
import { Pressable, Text, StyleSheet, ActivityIndicator, Animated, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/context/ThemeContext';
import { fontFamily } from '@/constants/typography';

type Props = {
  title: string;
  onPress?: () => void;
  variant?: 'primary' | 'secondary' | 'outline' | 'danger' | 'ghost';
  icon?: keyof typeof Ionicons.glyphMap;
  loading?: boolean;
  disabled?: boolean;
};

export function Button({ title, onPress, variant = 'primary', icon, loading = false, disabled = false }: Props) {
  const { colors } = useTheme();
  const scale = useRef(new Animated.Value(1)).current;
  const isSubtle = variant === 'outline' || variant === 'ghost';
  const isDisabled = loading || disabled;

  const variantStyle = {
    primary: { backgroundColor: colors.orange },
    secondary: { backgroundColor: colors.primary },
    outline: { backgroundColor: 'transparent', borderWidth: 1.5, borderColor: colors.orange },
    danger: { backgroundColor: colors.danger },
    ghost: { backgroundColor: colors.orangeSoft },
  }[variant];

  const textColor = isSubtle ? colors.orange : '#fff';
  const shadowStyle = variant === 'primary'
    ? { shadowColor: colors.orange, shadowOpacity: 0.32, shadowRadius: 16, shadowOffset: { width: 0, height: 8 }, elevation: 6 }
    : variant === 'secondary' || variant === 'danger'
      ? { shadowColor: colors.shadow, shadowOpacity: 0.18, shadowRadius: 12, shadowOffset: { width: 0, height: 6 }, elevation: 4 }
      : null;

  const onPressIn = () => Animated.spring(scale, { toValue: 0.97, useNativeDriver: true, speed: 60, bounciness: 0 }).start();
  const onPressOut = () => Animated.spring(scale, { toValue: 1, useNativeDriver: true, speed: 20, bounciness: 6 }).start();

  return (
    <Animated.View style={{ transform: [{ scale }], opacity: isDisabled ? 0.55 : 1 }}>
      <Pressable
        onPress={onPress}
        onPressIn={onPressIn}
        onPressOut={onPressOut}
        disabled={isDisabled}
        style={[styles.btn ,variantStyle]}
      >
        {loading ? (
          <ActivityIndicator color={textColor} />
        ) : (
          <View style={styles.content}>
            {icon && <Ionicons name={icon} size={18} color={textColor} />}
            <Text style={[styles.text, { color: textColor }]}>{title}</Text>
          </View>
        )}
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  btn: {
    borderRadius: 20,
    paddingVertical: 17,
    paddingHorizontal: 20,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 56,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  text: {
    fontFamily: fontFamily.sansBold,
    fontSize: 16,
  },
});
