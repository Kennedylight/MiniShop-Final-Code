// components/ui/Skeleton.tsx
import { useEffect, useRef } from "react";
import { Animated, StyleSheet, ViewStyle } from "react-native";
import { useTheme } from "@/context/ThemeContext";

export function Skeleton({ style }: { style?: ViewStyle }) {
  const { colors } = useTheme();
  const pulse = useRef(new Animated.Value(0.4)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, { toValue: 1, duration: 700, useNativeDriver: true }),
        Animated.timing(pulse, { toValue: 0.4, duration: 700, useNativeDriver: true }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, []);

  return (
    <Animated.View 
      style={[
        styles.base, 
        { 
          backgroundColor: colors.border || "rgba(0,0,0,0.1)",
          opacity: pulse 
        }, 
        style
      ]} 
    />
  );
}

const styles = StyleSheet.create({
  base: { 
    borderRadius: 12 
  },
});