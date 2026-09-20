import React, { useEffect, useState } from 'react';
import { StyleSheet, View, Text, Animated } from 'react-native';
import type { SymptomHotspot } from '../../types';

interface SymptomHotspotsOverlayProps {
  hotspots?: SymptomHotspot[];
  visible: boolean;
}

export function SymptomHotspotsOverlay({ hotspots, visible }: SymptomHotspotsOverlayProps) {
  const [pulseAnim] = useState(() => new Animated.Value(1));

  useEffect(() => {
    if (!visible) return;
    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.35,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    );
    animation.start();
    return () => animation.stop();
  }, [visible, pulseAnim]);

  if (!visible || !hotspots || hotspots.length === 0) {
    return null;
  }

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      {hotspots.map((spot, idx) => {
        const isPest = spot.type === 'pest';
        return (
          <View
            key={idx}
            style={[
              styles.spotContainer,
              {
                left: `${Math.min(Math.max(spot.x, 15), 85)}%`,
                top: `${Math.min(Math.max(spot.y, 15), 80)}%`,
              },
            ]}>
            {/* Animated Pulse Ring */}
            <Animated.View
              style={[
                styles.pulseRing,
                isPest && styles.pestPulseRing,
                {
                  transform: [{ scale: pulseAnim }],
                },
              ]}
            />
            {/* Target Center Dot */}
            <View style={[styles.centerDot, isPest && styles.pestCenterDot]} />

            {/* Label Tooltip */}
            <View style={[styles.tooltipBadge, isPest && styles.pestTooltipBadge]}>
              <Text style={styles.tooltipText}>{spot.label}</Text>
            </View>
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  spotContainer: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
    transform: [{ translateX: -20 }, { translateY: -20 }],
  },
  pulseRing: {
    position: 'absolute',
    width: 42,
    height: 42,
    borderRadius: 21,
    borderWidth: 2,
    borderColor: '#EF4444',
    backgroundColor: 'rgba(239, 68, 68, 0.25)',
  },
  centerDot: {
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: '#DC2626',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  tooltipBadge: {
    position: 'absolute',
    top: 24,
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
    minWidth: 80,
    alignItems: 'center',
  },
  tooltipText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '700',
    textAlign: 'center',
  },
  pestPulseRing: {
    borderColor: '#F97316',
    backgroundColor: 'rgba(249, 115, 22, 0.28)',
  },
  pestCenterDot: {
    backgroundColor: '#EA580C',
    borderColor: '#FFFFFF',
  },
  pestTooltipBadge: {
    borderColor: 'rgba(249, 115, 22, 0.6)',
    backgroundColor: 'rgba(20, 15, 10, 0.85)',
  },
});
