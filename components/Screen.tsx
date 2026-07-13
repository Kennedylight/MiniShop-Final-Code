import { ReactNode } from 'react';
import { View, ScrollView, StyleSheet, StyleProp, ViewStyle } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '@/context/ThemeContext';

type Props = {
  children: ReactNode;
  scroll?: boolean;
  /** Passe à false quand un header de navigation gère déjà la zone sûre du haut (onglets du dashboard). */
  topInset?: boolean;
  style?: StyleProp<ViewStyle>;
};

export function Screen({ children, scroll = true, topInset = true, style }: Props) {
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();
  const paddingTop = topInset ? insets.top : 0;

  if (!scroll) {
    return (
      <View style={[styles.safe, { backgroundColor: colors.bg, paddingTop, paddingBottom: insets.bottom }, style]}>
        {children}
      </View>
    );
  }

  return (
    <View style={[styles.safe, { backgroundColor: colors.bg }]}>
      <ScrollView
        contentContainerStyle={[
          styles.content,
          { paddingTop: paddingTop + 20, paddingBottom: insets.bottom + 20 },
        ]}
      >
        {children}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  content: { paddingHorizontal: 20, gap: 16 },
});
