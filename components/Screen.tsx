import { ReactNode } from 'react';
import { View, ScrollView, StyleSheet, ViewStyle } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Colors } from '@/constants/colors';

export function Screen({ children, scroll = true, style }: { children: ReactNode; scroll?: boolean; style?: ViewStyle }) {
  const insets = useSafeAreaInsets();
  const safe = [styles.safe, { paddingTop: insets.top, paddingBottom: insets.bottom }, style];

  if (!scroll) return <View style={safe}>{children}</View>;
  return (
    <View style={safe}>
      <ScrollView contentContainerStyle={styles.content}>{children}</ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.bg },
  content: { padding: 20, gap: 16 },
});
