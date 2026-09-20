import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Svg, { Circle } from 'react-native-svg';
import { colors } from '../../theme';
import { useTheme, useStyles } from '../../theme';

interface ConfidenceRingProps {
  /** 0..1 */
  progress: number;
  size?: number;
  strokeWidth?: number;
  /** Caption under the percentage, inside the ring. */
  label?: string;
}

/**
 * Radial confidence gauge: large tabular percentage inside a ring.
 * Ring color follows the reliability band: >=80% calm emerald,
 * 50–79% amber, <50% terracotta (uncertainty is never masked).
 */
export function ConfidenceRing({
  progress,
  size = 84,
  strokeWidth = 9,
  label = 'точность',
}: ConfidenceRingProps) {
  const { colors } = useTheme();
  const styles = useStyles(createStyles);
  const clamped = Math.min(Math.max(progress, 0), 1);
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const arcLength = circumference * clamped;

  const ringColor =
    clamped >= 0.8
      ? colors.severityHealthy
      : clamped >= 0.5
      ? colors.severityMild
      : colors.severityModerate;

  return (
    <View style={[styles.wrapper, { width: size, height: size }]}>
      <Svg width={size} height={size}>
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={colors.primarySoft}
          strokeWidth={strokeWidth}
          fill="none"
        />
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={ringColor}
          strokeWidth={strokeWidth}
          fill="none"
          strokeDasharray={`${arcLength} ${circumference - arcLength}`}
          strokeLinecap="round"
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
        />
      </Svg>
      <View style={styles.center}>
        <Text style={[styles.percent, { color: ringColor, fontVariant: ['tabular-nums'] }]}>
          {Math.round(clamped * 100)}%
        </Text>
        <Text style={styles.label}>{label}</Text>
      </View>
    </View>
  );
}

const createStyles = ({ colors, radii, spacing, typography, softShadow }: any) => StyleSheet.create({
  wrapper: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  center: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
  },
  percent: {
    fontSize: 19,
    fontWeight: '700',
    lineHeight: 23,
  },
  label: {
    fontSize: 10,
    fontWeight: '500',
    color: colors.textSecondary,
    letterSpacing: 0.2,
  },
});
