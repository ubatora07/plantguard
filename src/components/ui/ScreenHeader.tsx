import { ChevronLeft } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { colors, spacing, typography } from '../../theme';
import { useTheme, useStyles } from '../../theme';
import { safeBack } from '../../utils/navigation';

interface ScreenHeaderProps {
  title: string;
  /** Show the back button (default true). */
  back?: boolean;
  /** Right-side action element (e.g. share icon). */
  rightAction?: React.ReactNode;
}

/** Screen header with back navigation and an optional action. */
export function ScreenHeader({ title, back = true, rightAction }: ScreenHeaderProps) {
  const { colors } = useTheme();
  const styles = useStyles(createStyles);
  return (
    <View style={styles.container}>
      <View style={styles.side}>{back ? <BackButton /> : null}</View>
      <Text style={styles.title} numberOfLines={1} accessibilityRole="header">
        {title}
      </Text>
      <View style={[styles.side, styles.right]}>{rightAction}</View>
    </View>
  );
}

function BackButton() {
  const router = useRouter();
  const { colors } = useTheme();
  const styles = useStyles(createStyles);
  return (
    <Pressable
      onPress={() => safeBack(router, '/(tabs)')}
      style={styles.backButton}
      hitSlop={8}
      accessibilityLabel="Назад"
      accessibilityRole="button">
      <ChevronLeft size={24} color={colors.text} strokeWidth={2.2} />
    </Pressable>
  );
}

const createStyles = ({ colors, radii, spacing, typography, softShadow }: any) => StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: 48,
    marginVertical: spacing.sm,
  },
  side: {
    minWidth: 40,
    alignItems: 'flex-start',
  },
  right: {
    alignItems: 'flex-end',
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  title: {
    flex: 1,
    textAlign: 'center',
    color: colors.text,
    ...typography.screenTitle,
  },
});
