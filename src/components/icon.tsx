import { LucideIcon } from 'lucide-react-native';
import React from 'react';
import { colors } from '../theme';

/**
 * Icon wrapper so all icons share consistent size, stroke width and color.
 * Every icon used without a text label gets an accessibilityLabel.
 */
interface AppIconProps {
  size?: number;
  color?: string;
  strokeWidth?: number;
  accessibilityLabel?: string;
}

export function iconOf(Icon: LucideIcon) {
  return function AppIcon({ size = 22, color = colors.primary, strokeWidth = 2, accessibilityLabel }: AppIconProps) {
    return (
      <Icon
        size={size}
        color={color}
        strokeWidth={strokeWidth}
        accessibilityLabel={accessibilityLabel}
      />
    );
  };
}
