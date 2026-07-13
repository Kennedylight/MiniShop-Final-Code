import { ReactNode, useState } from 'react';
import { TextInput, View, Text, StyleSheet, TextInputProps } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/context/ThemeContext';
import { fontFamily } from '@/constants/typography';

type Props = TextInputProps & {
  label?: string;
  icon?: keyof typeof Ionicons.glyphMap;
  rightSlot?: ReactNode;
};

export function Input({ label, icon, rightSlot, multiline, ...props }: Props) {
  const { colors } = useTheme();
  const [focused, setFocused] = useState(false);

  return (
    <View>
      {label && <Text style={[styles.label, { color: colors.text }]}>{label}</Text>}
      <View
        style={[
          styles.wrap,
          multiline && styles.wrapMultiline,
          {
            backgroundColor: colors.card,
            borderColor: focused ? colors.orange : colors.border,
            borderWidth: focused ? 1.5 : 1,
          },
        ]}
      >
        {icon && <Ionicons name={icon} size={19} color={colors.muted} style={styles.icon} />}
        <TextInput
          placeholderTextColor={colors.muted}
          multiline={multiline}
          {...props}
          onFocus={(e) => {
            setFocused(true);
            props.onFocus?.(e);
          }}
          onBlur={(e) => {
            setFocused(false);
            props.onBlur?.(e);
          }}
          style={[
            styles.input,
            { color: colors.text },
            multiline && styles.inputMultiline,
          ]}
        />
        {rightSlot}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  label: {
    fontFamily: fontFamily.sansSemiBold,
    fontSize: 13,
    marginBottom: 8,
  },
  wrap: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 18,
    paddingHorizontal: 16,
  },
  wrapMultiline: {
    alignItems: 'flex-start',
    paddingVertical: 14,
  },
  icon: {
    marginRight: 10,
    marginTop: 2,
  },
  input: {
    flex: 1,
    height: 54,
    fontFamily: fontFamily.sansRegular,
    fontSize: 15,
  },
  inputMultiline: {
    height: undefined,
    minHeight: 72,
    textAlignVertical: 'top',
    paddingVertical: 0,
  },
});
