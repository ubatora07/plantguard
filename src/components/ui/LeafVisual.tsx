import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import Svg, { Path, Circle, Rect, Defs, LinearGradient, Stop } from 'react-native-svg';
import { useTheme, useStyles } from '../../theme';

export type LeafVisualType =
  | 'healthy'
  | 'early-blight'
  | 'late-blight'
  | 'uncertain'
  | 'good-example'
  | 'bad-far'
  | 'bad-blurry';

interface LeafVisualProps {
  type?: LeafVisualType;
  width?: number;
  height?: number;
  style?: ViewStyle;
}

export function LeafVisual({
  type = 'early-blight',
  width = 120,
  height = 120,
  style,
}: LeafVisualProps) {
  const { colors } = useTheme();
  const styles = useStyles(createStyles);
  if (type === 'healthy') {
    return (
      <View style={[styles.container, { width, height }, style]}>
        <Svg width="100%" height="100%" viewBox="0 0 100 100">
          <Defs>
            <LinearGradient id="healthyGrad" x1="0" y1="0" x2="1" y2="1">
              <Stop offset="0%" stopColor="#48BB78" />
              <Stop offset="50%" stopColor="#2F855A" />
              <Stop offset="100%" stopColor="#22543D" />
            </LinearGradient>
            <LinearGradient id="bgGrad" x1="0" y1="0" x2="0" y2="1">
              <Stop offset="0%" stopColor="#E6F4EA" />
              <Stop offset="100%" stopColor="#D1E7DD" />
            </LinearGradient>
          </Defs>
          <Rect x="0" y="0" width="100" height="100" rx="14" fill="url(#bgGrad)" />
          {/* Stem */}
          <Path d="M 50 85 Q 50 50 50 15" stroke="#22543D" strokeWidth="2.5" fill="none" strokeLinecap="round" />
          {/* Main leaf body */}
          <Path
            d="M 50 15 C 25 30 20 65 50 85 C 80 65 75 30 50 15 Z"
            fill="url(#healthyGrad)"
          />
          {/* Veins */}
          <Path d="M 50 35 Q 38 30 32 32" stroke="#68D391" strokeWidth="1.2" fill="none" strokeLinecap="round" />
          <Path d="M 50 35 Q 62 30 68 32" stroke="#68D391" strokeWidth="1.2" fill="none" strokeLinecap="round" />
          <Path d="M 50 50 Q 35 45 28 50" stroke="#68D391" strokeWidth="1.2" fill="none" strokeLinecap="round" />
          <Path d="M 50 50 Q 65 45 72 50" stroke="#68D391" strokeWidth="1.2" fill="none" strokeLinecap="round" />
          <Path d="M 50 65 Q 38 62 34 68" stroke="#68D391" strokeWidth="1.2" fill="none" strokeLinecap="round" />
          <Path d="M 50 65 Q 62 62 66 68" stroke="#68D391" strokeWidth="1.2" fill="none" strokeLinecap="round" />
        </Svg>
      </View>
    );
  }

  if (type === 'early-blight') {
    return (
      <View style={[styles.container, { width, height }, style]}>
        <Svg width="100%" height="100%" viewBox="0 0 100 100">
          <Defs>
            <LinearGradient id="blightGrad" x1="0" y1="0" x2="1" y2="1">
              <Stop offset="0%" stopColor="#48BB78" />
              <Stop offset="60%" stopColor="#38A169" />
              <Stop offset="100%" stopColor="#22543D" />
            </LinearGradient>
            <LinearGradient id="spotGrad" x1="0" y1="0" x2="1" y2="1">
              <Stop offset="0%" stopColor="#4A3000" />
              <Stop offset="100%" stopColor="#291800" />
            </LinearGradient>
            <LinearGradient id="bgGrad2" x1="0" y1="0" x2="0" y2="1">
              <Stop offset="0%" stopColor="#F4F8F4" />
              <Stop offset="100%" stopColor="#E2EAE2" />
            </LinearGradient>
          </Defs>
          <Rect x="0" y="0" width="100" height="100" rx="14" fill="url(#bgGrad2)" />
          {/* Leaf Body */}
          <Path
            d="M 50 15 C 24 30 18 66 50 85 C 82 66 76 30 50 15 Z"
            fill="url(#blightGrad)"
          />
          {/* Veins */}
          <Path d="M 50 85 Q 50 50 50 15" stroke="#1C4532" strokeWidth="2" fill="none" />
          <Path d="M 50 35 Q 38 30 32 32" stroke="#68D391" strokeWidth="1" fill="none" />
          <Path d="M 50 35 Q 62 30 68 32" stroke="#68D391" strokeWidth="1" fill="none" />
          <Path d="M 50 52 Q 35 48 28 52" stroke="#68D391" strokeWidth="1" fill="none" />
          <Path d="M 50 52 Q 65 48 72 52" stroke="#68D391" strokeWidth="1" fill="none" />
          {/* Target-board concentric spots characteristic of Alternaria solani */}
          {/* Spot 1: Center-left */}
          <Circle cx="40" cy="42" r="9" fill="#D69E2E" opacity={0.65} />
          <Circle cx="40" cy="42" r="6.5" fill="#744210" />
          <Circle cx="40" cy="42" r="4" fill="#975A16" />
          <Circle cx="40" cy="42" r="2" fill="#291800" />
          {/* Spot 2: Upper-right */}
          <Circle cx="62" cy="36" r="6" fill="#D69E2E" opacity={0.65} />
          <Circle cx="62" cy="36" r="4.2" fill="#744210" />
          <Circle cx="62" cy="36" r="2.2" fill="#291800" />
          {/* Spot 3: Lower right */}
          <Circle cx="56" cy="62" r="7.5" fill="#D69E2E" opacity={0.65} />
          <Circle cx="56" cy="62" r="5" fill="#744210" />
          <Circle cx="56" cy="62" r="2.5" fill="#291800" />
          {/* Spot 4: Small satellite spot */}
          <Circle cx="35" cy="66" r="3.5" fill="#744210" />
          <Circle cx="68" cy="50" r="3" fill="#744210" />
        </Svg>
      </View>
    );
  }

  if (type === 'late-blight') {
    return (
      <View style={[styles.container, { width, height }, style]}>
        <Svg width="100%" height="100%" viewBox="0 0 100 100">
          <Defs>
            <LinearGradient id="lateGrad" x1="0" y1="0" x2="1" y2="1">
              <Stop offset="0%" stopColor="#48BB78" />
              <Stop offset="70%" stopColor="#2F855A" />
              <Stop offset="100%" stopColor="#1C4532" />
            </LinearGradient>
            <LinearGradient id="bgGrad3" x1="0" y1="0" x2="0" y2="1">
              <Stop offset="0%" stopColor="#F5F7F5" />
              <Stop offset="100%" stopColor="#E2E8E2" />
            </LinearGradient>
          </Defs>
          <Rect x="0" y="0" width="100" height="100" rx="14" fill="url(#bgGrad3)" />
          {/* Leaf */}
          <Path
            d="M 50 15 C 24 30 18 66 50 85 C 82 66 76 30 50 15 Z"
            fill="url(#lateGrad)"
          />
          <Path d="M 50 85 Q 50 50 50 15" stroke="#1C4532" strokeWidth="2" fill="none" />
          {/* Large irregular water-soaked dark patches (Phytophthora infestans) */}
          <Path
            d="M 35 28 Q 20 40 25 55 Q 38 52 42 42 Q 45 32 35 28 Z"
            fill="#2D3748"
            opacity={0.85}
          />
          <Path
            d="M 52 50 Q 68 45 74 60 Q 65 72 52 70 Q 48 58 52 50 Z"
            fill="#2D3748"
            opacity={0.88}
          />
          <Path
            d="M 45 65 Q 40 76 50 82 Q 55 75 52 68 Z"
            fill="#1A202C"
            opacity={0.9}
          />
        </Svg>
      </View>
    );
  }

  if (type === 'good-example') {
    return (
      <View style={[styles.container, { width, height }, style]}>
        <Svg width="100%" height="100%" viewBox="0 0 100 100">
          <Rect x="0" y="0" width="100" height="100" rx="12" fill="#EBF8EE" />
          {/* Crisp focused leaf filling most of frame */}
          <Path
            d="M 50 12 C 18 28 12 70 50 88 C 88 70 82 28 50 12 Z"
            fill="#2F855A"
          />
          <Path d="M 50 88 L 50 12" stroke="#22543D" strokeWidth="2.5" />
          <Path d="M 50 35 Q 32 30 26 34" stroke="#68D391" strokeWidth="1.5" fill="none" />
          <Path d="M 50 35 Q 68 30 74 34" stroke="#68D391" strokeWidth="1.5" fill="none" />
          <Path d="M 50 55 Q 28 50 20 56" stroke="#68D391" strokeWidth="1.5" fill="none" />
          <Path d="M 50 55 Q 72 50 80 56" stroke="#68D391" strokeWidth="1.5" fill="none" />
          {/* Green checkmark badge */}
          <Circle cx="80" cy="20" r="12" fill="#1A4D2E" />
          <Path
            d="M 74 20 L 78 24 L 86 16"
            stroke="#FFFFFF"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            fill="none"
          />
        </Svg>
      </View>
    );
  }

  if (type === 'bad-far') {
    return (
      <View style={[styles.container, { width, height }, style]}>
        <Svg width="100%" height="100%" viewBox="0 0 100 100">
          <Rect x="0" y="0" width="100" height="100" rx="12" fill="#F7FAFC" />
          {/* Very tiny leaf in center, too far */}
          <Path
            d="M 50 42 C 42 46 40 56 50 62 C 60 56 58 46 50 42 Z"
            fill="#68D391"
          />
          {/* Red X badge */}
          <Circle cx="80" cy="20" r="12" fill="#C43D46" />
          <Path
            d="M 75 15 L 85 25 M 85 15 L 75 25"
            stroke="#FFFFFF"
            strokeWidth="2.5"
            strokeLinecap="round"
            fill="none"
          />
        </Svg>
      </View>
    );
  }

  if (type === 'bad-blurry') {
    return (
      <View style={[styles.container, { width, height }, style]}>
        <Svg width="100%" height="100%" viewBox="0 0 100 100">
          <Rect x="0" y="0" width="100" height="100" rx="12" fill="#F7FAFC" />
          {/* Blurry, unfocused blobs */}
          <Circle cx="50" cy="50" r="28" fill="#9AE6B4" opacity={0.4} />
          <Circle cx="50" cy="50" r="20" fill="#48BB78" opacity={0.35} />
          <Circle cx="52" cy="48" r="12" fill="#2F855A" opacity={0.3} />
          {/* Red X badge */}
          <Circle cx="80" cy="20" r="12" fill="#C43D46" />
          <Path
            d="M 75 15 L 85 25 M 85 15 L 75 25"
            stroke="#FFFFFF"
            strokeWidth="2.5"
            strokeLinecap="round"
            fill="none"
          />
        </Svg>
      </View>
    );
  }

  // Fallback / uncertain
  return (
    <View style={[styles.container, { width, height }, style]}>
      <Svg width="100%" height="100%" viewBox="0 0 100 100">
        <Rect x="0" y="0" width="100" height="100" rx="14" fill="#EDF2EE" />
        <Path
          d="M 50 20 C 30 35 26 65 50 80 C 74 65 70 35 50 20 Z"
          fill="#A0AEC0"
          opacity={0.6}
        />
        <Circle cx="50" cy="46" r="4" fill="#4A5568" />
        <Path d="M 50 56 L 50 64" stroke="#4A5568" strokeWidth="3" strokeLinecap="round" />
      </Svg>
    </View>
  );
}

const createStyles = ({ colors, radii, spacing, typography, softShadow }: any) => StyleSheet.create({
  container: {
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
