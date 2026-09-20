import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  Image,
  Pressable,
  StyleSheet,
  Animated,
  Easing,
  ImageSourcePropType,
} from 'react-native';
import {
  Sparkles,
  Eye,
  Crosshair,
  AlertCircle,
  ShieldCheck,
  X,
  Target,
} from 'lucide-react-native';
import type { SymptomHotspot } from '../../types';

interface XaiPhotoViewerProps {
  imageSource: ImageSourcePropType;
  hotspots?: SymptomHotspot[];
  isHealthy?: boolean;
  isNotPlant?: boolean;
  diseaseName?: string;
  confidencePercent?: number;
  height?: number;
  selectedIndex?: number | null;
  onSelectIndex?: (index: number | null) => void;
}

export function XaiPhotoViewer({
  imageSource,
  hotspots = [],
  isHealthy = false,
  isNotPlant = false,
  diseaseName,
  confidencePercent,
  height = 340,
  selectedIndex,
  onSelectIndex,
}: XaiPhotoViewerProps) {
  // By default, turn XAI on if there are hotspots or if it's a disease
  const [xaiEnabled, setXaiEnabled] = useState(true);
  const [selectedHotspot, setSelectedHotspot] = useState<SymptomHotspot | null>(null);

  useEffect(() => {
    if (selectedIndex !== undefined) {
      if (selectedIndex !== null && hotspots[selectedIndex]) {
        setSelectedHotspot(hotspots[selectedIndex]);
        setXaiEnabled(true);
      } else {
        setSelectedHotspot(null);
      }
    }
  }, [selectedIndex, hotspots]);

  // Looping radar wave animation for active markers
  const [pulseAnim] = useState(() => new Animated.Value(0));

  useEffect(() => {
    if (xaiEnabled && hotspots.length > 0) {
      const loop = Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 1600,
            easing: Easing.out(Easing.ease),
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 0,
            duration: 0,
            useNativeDriver: true,
          }),
        ])
      );
      loop.start();
      return () => loop.stop();
    }
  }, [xaiEnabled, hotspots.length, pulseAnim]);

  const radarScale = pulseAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 2.4],
  });

  const radarOpacity = pulseAnim.interpolate({
    inputRange: [0, 0.4, 1],
    outputRange: [0.8, 0.4, 0],
  });

  const getHotspotColor = (type?: string) => {
    switch (type) {
      case 'necrosis':
        return { main: '#EF4444', bg: 'rgba(239, 68, 68, 0.25)', label: 'Некроз' };
      case 'halo':
        return { main: '#F59E0B', bg: 'rgba(245, 158, 11, 0.25)', label: 'Хлороз' };
      case 'mildew':
      case 'pustule':
        return { main: '#06B6D4', bg: 'rgba(6, 182, 212, 0.25)', label: 'Мицелий' };
      case 'pest':
        return { main: '#EC4899', bg: 'rgba(236, 72, 153, 0.25)', label: 'Вредитель' };
      default:
        return { main: '#F97316', bg: 'rgba(249, 115, 22, 0.25)', label: 'Очаг' };
    }
  };

  return (
    <View style={[styles.container, { height }]}>
      {/* Base Leaf Photo */}
      <Image source={imageSource} style={styles.image} resizeMode="cover" />

      {/* XAI Overlay Layer */}
      {xaiEnabled && (
        <View style={styles.overlayContainer} pointerEvents="box-none">
          {/* Subtle high-tech grid scanner lines */}
          <View style={styles.gridOverlay} pointerEvents="none" />

          {/* If healthy plant: Show clean scan indicator */}
          {isHealthy && !isNotPlant && (
            <View style={styles.healthyBanner}>
              <ShieldCheck size={18} color="#22C55E" strokeWidth={2.4} />
              <View style={{ flex: 1 }}>
                <Text style={styles.healthyBannerTitle}>XAI-сканирование завершено</Text>
                <Text style={styles.healthyBannerSub}>
                  Очагов некроза и спор не обнаружено. Ткани листа однородны.
                </Text>
              </View>
            </View>
          )}

          {/* If not a plant */}
          {isNotPlant && (
            <View style={styles.notPlantBanner}>
              <AlertCircle size={18} color="#EAB308" strokeWidth={2.4} />
              <Text style={styles.notPlantBannerText}>
                XAI: Растительные структуры не верифицированы.
              </Text>
            </View>
          )}

          {/* Render Disease Symptom Hotspots */}
          {!isHealthy &&
            !isNotPlant &&
            hotspots.map((item, index) => {
              const colorTheme = getHotspotColor(item.type);
              const isSelected = selectedHotspot?.label === item.label;

              return (
                <View
                  key={`hotspot-${index}`}
                  style={[
                    styles.hotspotAnchor,
                    { left: `${item.x}%`, top: `${item.y}%` },
                  ]}
                  pointerEvents="box-none">
                  {/* Outer Pulsing Radar Waves */}
                  <Animated.View
                    style={[
                      styles.radarWave,
                      {
                        backgroundColor: colorTheme.main,
                        transform: [{ scale: radarScale }],
                        opacity: radarOpacity,
                      },
                    ]}
                    pointerEvents="none"
                  />

                  {/* Interactive Pin Marker Button */}
                  <Pressable
                    onPress={() => {
                      const next = selectedHotspot?.label === item.label ? null : item;
                      setSelectedHotspot(next);
                      onSelectIndex?.(next ? index : null);
                    }}
                    style={[
                      styles.pinMarker,
                      {
                        borderColor: isSelected ? '#FFFFFF' : colorTheme.main,
                        backgroundColor: colorTheme.main,
                      },
                      isSelected && styles.pinMarkerActive,
                    ]}
                    hitSlop={12}
                    accessibilityRole="button"
                    accessibilityLabel={`Маркер ${item.label}`}>
                    <Text style={styles.pinNumber}>{index + 1}</Text>
                  </Pressable>

                  {/* Horizontal callout badge shown only when selected */}
                  {isSelected && (
                    <View
                      style={[
                        styles.floatingTag,
                        {
                          borderColor: colorTheme.main,
                          left: item.x > 50 ? -125 : 34,
                        },
                      ]}
                      pointerEvents="none">
                      <View
                        style={[styles.tagTypeDot, { backgroundColor: colorTheme.main }]}
                      />
                      <Text style={styles.floatingTagText} numberOfLines={1}>
                        {item.label}
                      </Text>
                    </View>
                  )}
                </View>
              );
            })}

          {/* Selected Hotspot Detail Card (Pop-up inside photo) */}
          {selectedHotspot && (
            <View style={styles.popoverCard}>
              <View style={styles.popoverHeader}>
                <View style={styles.popoverTitleRow}>
                  <View
                    style={[
                      styles.popoverTypeBadge,
                      { backgroundColor: getHotspotColor(selectedHotspot.type).bg },
                    ]}>
                    <Target
                      size={14}
                      color={getHotspotColor(selectedHotspot.type).main}
                      strokeWidth={2.4}
                    />
                    <Text
                      style={[
                        styles.popoverTypeBadgeText,
                        { color: getHotspotColor(selectedHotspot.type).main },
                      ]}>
                      {getHotspotColor(selectedHotspot.type).label} • X:{selectedHotspot.x}% Y:
                      {selectedHotspot.y}%
                    </Text>
                  </View>
                  <Text style={styles.popoverLabel}>
                    {selectedHotspot.label}
                  </Text>
                </View>

                <Pressable
                  onPress={() => {
                    setSelectedHotspot(null);
                    onSelectIndex?.(null);
                  }}
                  style={styles.popoverCloseBtn}
                  hitSlop={8}>
                  <X size={16} color="#FFFFFF" strokeWidth={2.4} />
                </Pressable>
              </View>

              <Text style={styles.popoverDesc}>
                {selectedHotspot.description ||
                  'Локализация патогенных изменений, зафиксированная нейросетью на листовой пластине.'}
              </Text>
            </View>
          )}
        </View>
      )}

      {/* Floating Mode Toggle Bar (Bottom-Right of Photo) */}
      <View style={styles.toggleBar}>
        <Pressable
          onPress={() => {
            setXaiEnabled(!xaiEnabled);
            if (xaiEnabled) {
              setSelectedHotspot(null);
              onSelectIndex?.(null);
            }
          }}
          style={[styles.toggleBtn, xaiEnabled && styles.toggleBtnActive]}
          accessibilityRole="switch"
          accessibilityState={{ checked: xaiEnabled }}>
          {xaiEnabled ? (
            <>
              <Sparkles size={15} color="#FFFFFF" strokeWidth={2.4} />
              <Text style={styles.toggleBtnTextActive}>Очаги (XAI) ВКЛ</Text>
            </>
          ) : (
            <>
              <Eye size={15} color="rgba(255, 255, 255, 0.8)" strokeWidth={2.2} />
              <Text style={styles.toggleBtnTextInactive}>Исходное фото</Text>
            </>
          )}
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    position: 'relative',
    backgroundColor: '#131F16',
    overflow: 'hidden',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  overlayContainer: {
    ...StyleSheet.absoluteFill,
  },
  gridOverlay: {
    ...StyleSheet.absoluteFill,
    backgroundColor: 'rgba(10, 24, 15, 0.18)',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  hotspotAnchor: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: -16,
    marginTop: -16,
    width: 32,
    height: 32,
  },
  radarWave: {
    position: 'absolute',
    width: 32,
    height: 32,
    borderRadius: 16,
  },
  pinMarker: {
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.35,
    shadowRadius: 4,
    elevation: 6,
  },
  pinMarkerActive: {
    transform: [{ scale: 1.18 }],
    borderWidth: 2.5,
  },
  pinNumber: {
    fontSize: 12,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  floatingTag: {
    position: 'absolute',
    top: 2,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(15, 23, 18, 0.95)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1.5,
    width: 124,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.5,
    shadowRadius: 4,
    elevation: 7,
    zIndex: 20,
  },
  tagTypeDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  floatingTagText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#FFFFFF',
    flexShrink: 0,
  },
  popoverCard: {
    position: 'absolute',
    bottom: 48,
    left: 14,
    right: 14,
    backgroundColor: 'rgba(17, 27, 21, 0.94)',
    borderRadius: 16,
    padding: 12,
    borderWidth: 1.5,
    borderColor: 'rgba(52, 211, 153, 0.4)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.5,
    shadowRadius: 8,
    elevation: 8,
  },
  popoverHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  popoverTitleRow: {
    flex: 1,
    marginRight: 8,
  },
  popoverTypeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
    alignSelf: 'flex-start',
    marginBottom: 4,
  },
  popoverTypeBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  popoverLabel: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  popoverCloseBtn: {
    padding: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
    borderRadius: 12,
  },
  popoverDesc: {
    fontSize: 12,
    color: '#D1D5DB',
    lineHeight: 16,
  },
  healthyBanner: {
    position: 'absolute',
    top: 54,
    left: 14,
    right: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: 'rgba(16, 36, 22, 0.9)',
    borderRadius: 14,
    padding: 10,
    borderWidth: 1,
    borderColor: 'rgba(34, 197, 94, 0.4)',
  },
  healthyBannerTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: '#4ADE80',
  },
  healthyBannerSub: {
    fontSize: 11,
    color: '#D1FAE5',
    marginTop: 1,
  },
  notPlantBanner: {
    position: 'absolute',
    top: 54,
    left: 14,
    right: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: 'rgba(40, 30, 10, 0.88)',
    borderRadius: 12,
    padding: 10,
    borderWidth: 1,
    borderColor: 'rgba(234, 179, 8, 0.4)',
  },
  notPlantBannerText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#FEF08A',
  },
  toggleBar: {
    position: 'absolute',
    bottom: 12,
    right: 14,
    zIndex: 10,
  },
  toggleBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(24, 38, 29, 0.82)',
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.22)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.35,
    shadowRadius: 4,
    elevation: 5,
  },
  toggleBtnActive: {
    backgroundColor: '#15803D',
    borderColor: '#4ADE80',
  },
  toggleBtnTextActive: {
    fontSize: 12,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  toggleBtnTextInactive: {
    fontSize: 12,
    fontWeight: '600',
    color: 'rgba(255, 255, 255, 0.9)',
  },
});
