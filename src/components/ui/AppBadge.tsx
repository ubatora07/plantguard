import React from 'react';
import { StyleSheet, Text, View, ViewStyle } from 'react-native';
import { colors, radii } from '../../theme';
import { useTheme, useStyles } from '../../theme';

export type BadgeVariant = 'demo' | 'pro' | 'success' | 'warning' | 'danger' | 'info' | 'neutral';

interface AppBadgeProps {
  label: string;
  variant?: BadgeVariant;
  style?: ViewStyle;
}

export function AppBadge({ label, variant = 'demo', style }: AppBadgeProps) {
  const { colors } = useTheme();
  const styles = useStyles(createStyles);
  return (
    <View style={[styles.badge, styles[variant], style]}>
      <Text style={[styles.text, styles[`text_${variant}`]]}>{label}</Text>
    </View>
  );
}

const createStyles = ({ colors, radii, spacing, typography, softShadow }: any) => StyleSheet.create({
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: radii.badge,
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  // Demo tag is amber: it flags "training example, not a real diagnosis".
  demo: {
    backgroundColor: colors.severityMildSoft,
    borderWidth: 1,
    borderColor: '#F0DCA8',
  },
  pro: {
    backgroundColor: colors.primarySoft,
    borderWidth: 1,
    borderColor: '#BFD8C4',
  },
  success: {
    backgroundColor: colors.successSoft,
  },
  warning: {
    backgroundColor: colors.warningSoft,
  },
  danger: {
    backgroundColor: colors.dangerSoft,
  },
  info: {
    backgroundColor: colors.infoSoft,
  },
  neutral: {
    backgroundColor: '#EDF2EE',
  },
  text: {
    fontSize: 11,
    fontWeight: '600',
    letterSpacing: 0.2,
  },
  text_demo: {
    color: '#7A5600',
  },
  text_pro: {
    color: colors.primary,
  },
  text_success: {
    color: colors.success,
  },
  text_warning: {
    color: colors.warning,
  },
  text_danger: {
    color: colors.danger,
  },
  text_info: {
    color: colors.info,
  },
  text_neutral: {
    color: colors.textSecondary,
  },
});
