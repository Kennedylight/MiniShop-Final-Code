import { ReactNode } from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { Colors } from '@/constants/colors';
export function Card({ children, style }: { children: ReactNode; style?: ViewStyle }) { return <View style={[styles.card, style]}>{children}</View>; }
const styles = StyleSheet.create({ card: { backgroundColor: Colors.card, borderRadius: 22, padding: 18, borderWidth: 1, borderColor: Colors.border, shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 14, elevation: 2 } });
