import React from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, TextStyle, View, ViewStyle } from 'react-native';
import { colors, radii, spacing, typography } from '../../theme';
import { useTheme, useStyles } from '../../theme';

type Variant = 'primary' | 'secondary' | 'text' | 'destructive';

interface AppButtonProps {
  label: string;
  onPress: () => void;
  variant?: Variant;
  /** Disable interaction and show a spinner. */
  loading?: boolean;
  disabled?: boolean;
  icon?: React.ReactNode;
  style?: ViewStyle;
  /** Smaller horizontal padding for inline layouts. */
  compact?: boolean;
}

export function AppButton({
  label,
  onPress,
  variant = 'primary',
  loading = false,
  disabled = false,
  icon,
  style,
  compact = false,
}: AppButtonProps) {
  const { colors } = useTheme();
  const styles = useStyles(createStyles);
  const inactive = disabled || loading;
  const getLabelStyle = () => {
    switch (variant) {
      case 'primary': return styles.labelPrimary;
      case 'secondary': return styles.labelSecondary;
      case 'destructive': return styles.labelDestructive;
      default: return styles.labelText;
    }
  };

  return (
    <Pressable
      onPress={onPress}
      disabled={inactive}
      style={({ pressed }) => [
        styles.base,
        styles[variant],
        compact && styles.compact,
        pressed && !inactive && styles.pressed,
        inactive && styles.disabled,
        style,
      ]}
      accessibilityRole="button"
      accessibilityState={{ disabled: inactive, busy: loading }}>
      {loading ? (
        <ActivityIndicator
          size="small"
          color={variant === 'primary' || variant === 'destructive' ? colors.white : colors.primary}
        />
      ) : icon ? (
        <View style={styles.icon}>{icon}</View>
      ) : null}
      <Text style={getLabelStyle()}>{label}</Text>
    </Pressable>
  );
}

const createStyles = ({ colors, radii, spacing, typography, softShadow }: any) => StyleSheet.create({
  base: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    minHeight: 52,
    borderRadius: radii.button,
    paddingHorizontal: spacing.xl,
  },
  compact: {
    minHeight: 48,
    paddingHorizontal: spacing.lg,
  },
  pressed: {
    opacity: 0.85,
  },
  disabled: {
    opacity: 0.5,
  },
  primary: {
    backgroundColor: colors.primary,
  },
  secondary: {
    backgroundColor: colors.surface,
    borderWidth: 1.5,
    borderColor: colors.primary,
  },
  text: {
    backgroundColor: 'transparent',
    minHeight: 44,
  },
  destructive: {
    backgroundColor: colors.danger,
  },
  icon: {
    marginRight: -spacing.xs,
  },
  labelPrimary: {
    color: colors.white,
    ...typography.button,
  },
  labelSecondary: {
    color: colors.primary,
    ...typography.button,
  },
  labelText: {
    color: colors.primary,
    ...typography.button,
  },
  labelDestructive: {
    color: colors.white,
    ...typography.button,
  },
});
