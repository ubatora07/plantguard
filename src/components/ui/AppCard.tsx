import React from 'react';
import { Pressable, StyleProp, StyleSheet, View, ViewStyle } from 'react-native';
import { colors, radii, softShadow, spacing } from '../../theme';
import { useTheme, useStyles } from '../../theme';

interface AppCardProps {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  onPress?: () => void;
  variant?: 'surface' | 'primary' | 'muted' | 'outline';
  padded?: boolean;
}

export function AppCard({
  children,
  style,
  onPress,
  variant = 'surface',
  padded = true,
}: AppCardProps) {
  const { colors } = useTheme();
  const styles = useStyles(createStyles);
  const containerStyle = [
    styles.card,
    styles[variant],
    padded && styles.padded,
    style,
  ];

  if (onPress) {
    return (
      <Pressable
        onPress={onPress}
        style={({ pressed }) => [
          containerStyle,
          pressed && styles.pressed,
        ]}
        accessibilityRole="button">
        {children}
      </Pressable>
    );
  }

  return <View style={containerStyle}>{children}</View>;
}

const createStyles = ({ colors, radii, spacing, typography, softShadow }: any) => StyleSheet.create({
  card: {
    borderRadius: radii.card,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: 'hidden',
    ...softShadow,
  },
  padded: {
    padding: spacing.md,
  },
  surface: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
  },
  primary: {
    backgroundColor: colors.primary,
    borderColor: colors.primaryDark,
  },
  muted: {
    backgroundColor: '#F0F5F1',
    borderColor: colors.border,
  },
  outline: {
    backgroundColor: 'transparent',
    borderColor: colors.border,
  },
  pressed: {
    opacity: 0.92,
    transform: [{ scale: 0.995 }],
  },
});
