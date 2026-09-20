import React from 'react';
import { View, StyleSheet } from 'react-native';
import Svg, { Rect, Circle, Path, G, ClipPath, Defs } from 'react-native-svg';

interface CountryFlagProps {
  code: 'ru' | 'kk' | 'en';
  size?: number;
}

export function CountryFlag({ code, size = 28 }: CountryFlagProps) {
  const clipId = `flag-clip-${code}-${size}`;
  const r = size / 2;

  const renderContent = () => {
    switch (code) {
      case 'ru':
        return (
          <G>
            {/* Top white stripe */}
            <Rect x={0} y={0} width={size} height={size / 3} fill="#FFFFFF" />
            {/* Middle blue stripe */}
            <Rect x={0} y={size / 3} width={size} height={size / 3} fill="#0039A6" />
            {/* Bottom red stripe */}
            <Rect x={0} y={(size * 2) / 3} width={size} height={size / 3} fill="#D52B1E" />
          </G>
        );

      case 'kk':
        return (
          <G>
            {/* Sky blue background */}
            <Rect x={0} y={0} width={size} height={size} fill="#00AFCA" />
            {/* National Kazakh ornament stripe on left */}
            <Path
              d={`M ${size * 0.12} ${size * 0.15} Q ${size * 0.18} ${size * 0.3} ${size * 0.12} ${size * 0.5} Q ${size * 0.06} ${size * 0.7} ${size * 0.12} ${size * 0.85}`}
              stroke="#FDC010"
              strokeWidth={size * 0.08}
              fill="none"
              strokeLinecap="round"
            />
            {/* Sun circle */}
            <Circle cx={size * 0.56} cy={size * 0.44} r={size * 0.18} fill="#FDC010" />
            {/* Steppe eagle wing underneath sun */}
            <Path
              d={`M ${size * 0.36} ${size * 0.65} Q ${size * 0.56} ${size * 0.58} ${size * 0.76} ${size * 0.65} Q ${size * 0.56} ${size * 0.72} ${size * 0.36} ${size * 0.65} Z`}
              fill="#FDC010"
            />
          </G>
        );

      case 'en':
        return (
          <G>
            {/* Deep Blue background */}
            <Rect x={0} y={0} width={size} height={size} fill="#012169" />
            {/* Diagonal white saltire */}
            <Path
              d={`M 0 0 L ${size} ${size} M ${size} 0 L 0 ${size}`}
              stroke="#FFFFFF"
              strokeWidth={size * 0.22}
            />
            {/* Diagonal red saltire */}
            <Path
              d={`M 0 0 L ${size} ${size} M ${size} 0 L 0 ${size}`}
              stroke="#C8102E"
              strokeWidth={size * 0.1}
            />
            {/* White cross */}
            <Path
              d={`M ${size / 2} 0 L ${size / 2} ${size} M 0 ${size / 2} L ${size} ${size / 2}`}
              stroke="#FFFFFF"
              strokeWidth={size * 0.3}
            />
            {/* Red cross */}
            <Path
              d={`M ${size / 2} 0 L ${size / 2} ${size} M 0 ${size / 2} L ${size} ${size / 2}`}
              stroke="#C8102E"
              strokeWidth={size * 0.18}
            />
          </G>
        );
    }
  };

  return (
    <View style={[styles.container, { width: size, height: size, borderRadius: r }]}>
      <Svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <Defs>
          <ClipPath id={clipId}>
            <Circle cx={r} cy={r} r={r} />
          </ClipPath>
        </Defs>
        <G clipPath={`url(#${clipId})`}>{renderContent()}</G>
        {/* Subtle border to frame light colors */}
        <Circle
          cx={r}
          cy={r}
          r={r - 0.5}
          fill="none"
          stroke="rgba(0, 0, 0, 0.12)"
          strokeWidth={1}
        />
      </Svg>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
