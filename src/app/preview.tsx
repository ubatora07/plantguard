import { useLocalSearchParams, useRouter } from 'expo-router';
import {
  Trash2,
  CheckCircle2,
  ChevronDown,
  Search,
  X,
  ZoomIn,
  RotateCw,
  Crop,
  AlertTriangle,
  Undo2,
  Sprout,
  Sparkles,
} from 'lucide-react-native';
import React, { useState, useMemo, useEffect } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { AppBadge } from '../components/ui/AppBadge';
import { AppButton } from '../components/ui/AppButton';
import { AppCard } from '../components/ui/AppCard';
import { AppScreen } from '../components/ui/AppScreen';
import { LeafVisual } from '../components/ui/LeafVisual';
import { ScreenHeader } from '../components/ui/ScreenHeader';
import { CROPS, cropById } from '../config';
import { PLANTVILLAGE_CROPS } from '../data/plantvillage-taxonomy';
import { useSettings } from '../features/settings/SettingsContext';
import { i18n } from '../i18n';
import { useTheme, useStyles } from '../theme';
import type { CropId, CropSelection } from '../types';
import { safeBack } from '../utils/navigation';
import { ASSETS } from '../constants/assets';
import { PLANTVILLAGE_IMAGES } from '../data/plantvillage-images';
import { VisualCropEditorModal } from '../components/ui/VisualCropEditorModal';
import {
  assessImageQuality,
  cropCenterLeaf,
  rotateImage,
  cropImageWithPreset,
  type CropPreset,
  type ImageQualityReport,
} from '../utils/image-processing';

const POPULAR_CROP_IDS: CropId[] = ['tomato', 'potato', 'apple', 'grape', 'corn', 'pepper'];

export default function PhotoPreviewScreen() {
  const router = useRouter();
  const { mode, language } = useSettings();
  const { colors } = useTheme();
  const styles = useStyles(createStyles);

  const params = useLocalSearchParams<{
    uri?: string;
    scenarioId?: string;
    isCustom?: string;
    isDemo?: string;
    cropId?: string;
    notPlantTest?: string;
  }>();

  const initialCropId: CropSelection = useMemo(() => {
    if (params.cropId === 'auto') return 'auto';
    if (params.cropId && CROPS.some((c) => c.id === params.cropId)) {
      return params.cropId as CropId;
    }
    return 'auto';
  }, [params.cropId]);

  const initialUri = useMemo(() => {
    if (params.uri) return params.uri;
    if (params.scenarioId) {
      let asset = ASSETS.diseases.earlyBlight;
      if (params.scenarioId === 'tomato-healthy-demo') {
        asset = ASSETS.diseases.healthy;
      } else if (params.scenarioId === 'tomato-late-blight-demo') {
        asset = PLANTVILLAGE_IMAGES['Tomato___Late_blight'] || ASSETS.diseases.earlyBlight;
      } else if (params.scenarioId === 'tomato-uncertain-demo') {
        asset = ASSETS.guide.badBlurry;
      }
      return Image.resolveAssetSource(asset)?.uri || '';
    }
    return '';
  }, [params.uri, params.scenarioId]);

  const [selectedCropId, setSelectedCropId] = useState<CropSelection>(initialCropId);
  const [baseImageUri, setBaseImageUri] = useState<string>(initialUri);
  const [currentUri, setCurrentUri] = useState<string>(initialUri);
  const [focusLevel, setFocusLevel] = useState<number>(1.0);
  const [showFocusBar, setShowFocusBar] = useState<boolean>(false);
  const [showCropModal, setShowCropModal] = useState<boolean>(false);
  const [qualityReport, setQualityReport] = useState<ImageQualityReport | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    if (initialUri && !currentUri) {
      setCurrentUri(initialUri);
      setBaseImageUri(initialUri);
    }
  }, [initialUri, currentUri]);

  useEffect(() => {
    let isMounted = true;
    if (!currentUri) {
      return;
    }
    assessImageQuality(currentUri)
      .then((report) => {
        if (isMounted) setQualityReport(report);
      })
      .catch((err) => {
        console.warn('Image quality assessment error:', err);
      });
    return () => {
      isMounted = false;
    };
  }, [currentUri]);

  const handleSetFocusLevel = async (level: number) => {
    if (isProcessing || !baseImageUri) return;
    setFocusLevel(level);
    if (level === 1.0) {
      setCurrentUri(baseImageUri);
      return;
    }
    setIsProcessing(true);
    try {
      const cropped = await cropCenterLeaf(baseImageUri, level);
      setCurrentUri(cropped);
    } catch {
      Alert.alert('Ошибка', 'Не удалось изменить фокус');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCycleFocus = async () => {
    setShowFocusBar((prev) => !prev);
    const levels = [1.0, 1.3, 1.6, 2.0];
    const currentIndex = levels.indexOf(focusLevel);
    const nextIndex = (currentIndex + 1) % levels.length;
    await handleSetFocusLevel(levels[nextIndex]);
  };

  const handleRotate = async () => {
    if (!currentUri || isProcessing) return;
    setIsProcessing(true);
    try {
      const rotated = await rotateImage(currentUri, 90);
      setCurrentUri(rotated);
    } catch {
      Alert.alert('Ошибка', 'Не удалось повернуть изображение');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleApplyCropPreset = async (preset: CropPreset) => {
    if (!currentUri || isProcessing) return;
    setIsProcessing(true);
    try {
      const cropped = await cropImageWithPreset(currentUri, preset);
      setCurrentUri(cropped);
      setShowCropModal(false);
    } catch {
      Alert.alert('Ошибка', 'Не удалось кадрировать фото');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleReset = () => {
    if (baseImageUri) {
      setCurrentUri(baseImageUri);
      setFocusLevel(1.0);
    }
  };

  const isAuto = selectedCropId === 'auto';
  const currentCrop = cropById(selectedCropId);

  // Quick chips: include top crops, plus the currently selected crop if it's not in the top list
  const displayChips = useMemo(() => {
    const list = POPULAR_CROP_IDS.map((id) => cropById(id));
    if (selectedCropId !== 'auto' && !POPULAR_CROP_IDS.includes(selectedCropId as CropId)) {
      list.unshift(currentCrop);
    }
    return list;
  }, [selectedCropId, currentCrop]);

  const filteredAllCrops = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) return CROPS;
    return CROPS.filter(
      (c) => c.name.toLowerCase().includes(query) || c.id.toLowerCase().includes(query)
    );
  }, [searchQuery]);

  const proceedToAnalysis = () => {
    router.push({
      pathname: '/process',
      params: {
        uri: currentUri,
        cropId: selectedCropId,
        scenarioId: params.scenarioId,
        isCustom: params.isCustom ?? 'false',
        isDemo: params.isDemo ?? 'false',
        notPlantTest: params.notPlantTest ?? 'false',
      },
    });
  };

  const handleAnalyze = () => {
    if (qualityReport && !qualityReport.acceptable) {
      Alert.alert(
        language === 'kk' ? 'Түсірілім сапасына назар аударыңыз' : language === 'en' ? 'Photo Quality Notice' : 'Внимание к качеству снимка',
        `${qualityReport.warningText ?? (language === 'kk' ? 'Сурет сапасы төмен' : language === 'en' ? 'Reduced image quality' : 'Качество снимка снижено')}.\n${
          qualityReport.recommendationText ?? ''
        }\n\n${language === 'kk' ? 'Жапырақты жақындату үшін «Фокус» батырмасын басыңыз немесе қайта түсіріңіз.' : language === 'en' ? 'Consider using "Focus" to zoom into the leaf or retake.' : 'Рекомендуется использовать кнопку «Фокус» для приближения листа или сделать новый снимок.'}`,
        [
          { text: language === 'kk' ? 'Суретті жақсарту' : language === 'en' ? 'Retake' : 'Улучшить фото', style: 'cancel' },
          {
            text: language === 'kk' ? 'Бәрібір жалғастыру' : language === 'en' ? 'Continue anyway' : 'Всё равно продолжить',
            onPress: () => {
              proceedToAnalysis();
            },
          },
        ]
      );
      return;
    }

    proceedToAnalysis();
  };

  const handleDelete = () => {
    safeBack(router, '/camera');
  };

  return (
    <AppScreen padded={true}>
      <ScreenHeader title={i18n.t('preview.title')} />

      {/* Large Photo Preview Card */}
      <View style={styles.photoContainer}>
        {currentUri ? (
          <Image
            source={{ uri: currentUri }}
            style={styles.photoImage}
            onError={(e) => {
              console.warn('[preview] Image load error:', e.nativeEvent.error);
            }}
          />
        ) : (
          <LeafVisual
            type="healthy"
            width={320}
            height={260}
          />
        )}

        {isProcessing && (
          <View style={styles.processingOverlay}>
            <ActivityIndicator size="large" color={colors.primary} />
            <Text style={styles.processingText}>Обработка фото...</Text>
          </View>
        )}

        {/* Quality indicator badge on image */}
        {Boolean(currentUri) && Boolean(qualityReport) ? (
          <View style={[styles.qualityBadge, !qualityReport?.acceptable && styles.qualityBadgeWarn]}>
            {qualityReport?.acceptable ? (
              <CheckCircle2 size={13} color="#FFFFFF" strokeWidth={2.5} />
            ) : (
              <AlertTriangle size={13} color="#FFFFFF" strokeWidth={2.5} />
            )}
            <Text style={styles.qualityBadgeText}>
              Качество {qualityReport?.score}%
            </Text>
          </View>
        ) : null}

        {/* Delete / Clear button in top-right */}
        <Pressable
          onPress={handleDelete}
          style={styles.deleteButton}
          hitSlop={8}
          accessibilityRole="button"
          accessibilityLabel="Удалить фото">
          <Trash2 size={20} color={colors.white} strokeWidth={2.2} />
        </Pressable>
      </View>

      {/* CV Toolbar for In-The-Wild Photos (Focus Zoom, Rotate, In-Place Crop) */}
      {currentUri ? (
        <View style={styles.toolBarWrapper}>
          <View style={styles.toolBar}>
            <Pressable
              style={[styles.toolBtn, focusLevel > 1.0 && styles.toolBtnActive]}
              onPress={handleCycleFocus}
              disabled={isProcessing}
              accessibilityRole="button"
              accessibilityLabel="Настроить фокус">
              <ZoomIn size={15} color={focusLevel > 1.0 ? '#FFFFFF' : colors.primaryDark} strokeWidth={2.2} />
              <Text style={[styles.toolBtnText, focusLevel > 1.0 && styles.toolBtnTextActive]}>
                {focusLevel > 1.0 ? `Фокус: ${focusLevel}x` : 'Фокус'}
              </Text>
            </Pressable>

            <Pressable
              style={styles.toolBtn}
              onPress={handleRotate}
              disabled={isProcessing}
              accessibilityRole="button"
              accessibilityLabel="Повернуть на 90 градусов">
              <RotateCw size={15} color={colors.primaryDark} strokeWidth={2.2} />
              <Text style={styles.toolBtnText}>90°</Text>
            </Pressable>

            <Pressable
              style={styles.toolBtn}
              onPress={() => setShowCropModal(true)}
              disabled={isProcessing}
              accessibilityRole="button"
              accessibilityLabel="Кадрировать снимок">
              <Crop size={15} color={colors.primaryDark} strokeWidth={2.2} />
              <Text style={styles.toolBtnText}>Кадрировать</Text>
            </Pressable>

            {(currentUri !== baseImageUri || focusLevel !== 1.0) && (
              <Pressable
                style={[styles.toolBtn, styles.toolBtnReset]}
                onPress={handleReset}
                disabled={isProcessing}
                accessibilityRole="button"
                accessibilityLabel="Сбросить изменения">
                <Undo2 size={15} color={colors.textSecondary} strokeWidth={2.2} />
                <Text style={styles.toolBtnTextReset}>Сброс</Text>
              </Pressable>
            )}
          </View>

          {/* Quick Focus Selector Pills */}
          {showFocusBar && (
            <View style={styles.focusPillsRow}>
              {[
                { label: '1.0x (Откат)', level: 1.0 },
                { label: '1.3x (Центр)', level: 1.3 },
                { label: '1.6x (Лист)', level: 1.6 },
                { label: '2.0x (Макро)', level: 2.0 },
              ].map((f) => (
                <Pressable
                  key={f.level}
                  onPress={() => handleSetFocusLevel(f.level)}
                  style={[
                    styles.focusPill,
                    focusLevel === f.level && styles.focusPillActive,
                  ]}>
                  <Text
                    style={[
                      styles.focusPillText,
                      focusLevel === f.level && styles.focusPillTextActive,
                    ]}>
                    {f.label}
                  </Text>
                </Pressable>
              ))}
            </View>
          )}
        </View>
      ) : null}

      {/* Quality Warning Box */}
      {Boolean(qualityReport?.warningText) ? (
        <View style={styles.qualityWarningBox}>
          <AlertTriangle size={18} color={colors.warning} strokeWidth={2.2} />
          <View style={styles.qualityWarningTextCol}>
            <Text style={styles.qualityWarningTitle}>{qualityReport?.warningText}</Text>
            {qualityReport?.recommendationText ? (
              <Text style={styles.qualityWarningDesc}>{qualityReport?.recommendationText}</Text>
            ) : null}
          </View>
        </View>
      ) : null}

      {/* Select Crop Section */}
      <View style={styles.cropSection}>
        <View style={styles.sectionHeaderRow}>
          <Text style={styles.sectionLabel}>{i18n.t('preview.select_crop')}</Text>
          <Pressable
            style={styles.allCropsButton}
            onPress={() => setIsModalVisible(true)}>
            <Text style={styles.allCropsButtonText}>Все культуры ({CROPS.length})</Text>
            <ChevronDown size={16} color={colors.primary} />
          </Pressable>
        </View>

        {/* Dedicated Prominent AI Auto-Detect Button */}
        <Pressable
          style={[styles.autoCropCard, isAuto && styles.autoCropCardActive]}
          onPress={() => setSelectedCropId('auto')}
          accessibilityRole="button"
          accessibilityLabel="ИИ сам определяет культуру">
          <View style={[styles.autoCropIconCircle, isAuto && styles.autoCropIconCircleActive]}>
            <Sparkles size={20} color={isAuto ? '#FFFFFF' : '#16A34A'} strokeWidth={2.4} />
          </View>
          <View style={styles.autoCropTextCol}>
            <View style={styles.autoCropTitleRow}>
              <Text style={[styles.autoCropTitle, isAuto && styles.autoCropTitleActive]}>
                {language === 'kk'
                  ? '✨ AI дақылды автоматты анықтау'
                  : language === 'en'
                  ? '✨ AI Auto-Detect Crop'
                  : '✨ ИИ сам определит культуру'}
              </Text>
              {isAuto ? (
                <View style={styles.autoCropActiveBadge}>
                  <Text style={styles.autoCropActiveBadgeText}>
                    {language === 'kk' ? 'Таңдалды' : language === 'en' ? 'Active' : 'Активно'}
                  </Text>
                </View>
              ) : null}
            </View>
            <Text style={[styles.autoCropSubtitle, isAuto && styles.autoCropSubtitleActive]}>
              {language === 'kk'
                ? 'Нейрожелі суреттегі өсімдік түрін өзі танып, диагноз қояды'
                : language === 'en'
                ? 'Vision AI automatically identifies the plant species & diseases'
                : 'Нейросеть распознает культуру по фото и выявит патологии'}
            </Text>
          </View>
          {isAuto ? (
            <CheckCircle2 size={20} color="#16A34A" strokeWidth={2.5} style={{ marginLeft: 6 }} />
          ) : null}
        </Pressable>

        <Text style={styles.orSelectSpecificText}>
          {language === 'kk'
            ? 'немесе нақты дақылды қолмен таңдаңыз:'
            : language === 'en'
            ? 'or select specific crop manually:'
            : 'или выберите культуру вручную:'}
        </Text>

        {/* Quick horizontal scrollable / wrapped chip grid */}
        <View style={styles.cropGrid}>
          {displayChips.map((c) => {
            const isSelected = selectedCropId === c.id;
            return (
              <Pressable
                key={c.id}
                style={[styles.cropChip, isSelected && styles.cropChipSelected]}
                onPress={() => setSelectedCropId(c.id)}>
                <Sprout
                  size={15}
                  color={isSelected ? colors.white : colors.primary}
                  strokeWidth={2.2}
                />
                <Text
                  numberOfLines={1}
                  style={[styles.cropChipText, isSelected && styles.cropChipTextSelected]}>
                  {c.name}
                </Text>
              </Pressable>
            );
          })}
        </View>
      </View>

      {/* Analyze Button */}
      <AppButton
        label={
          isAuto
            ? language === 'kk'
              ? 'Талдау (дақылды анықтаумен)'
              : language === 'en'
              ? 'Analyze (Auto-detect crop)'
              : 'Анализ (ИИ определит культуру)'
            : i18n.t('preview.analyze_btn')
        }
        onPress={handleAnalyze}
        style={styles.analyzeButton}
      />

      {/* Tips for Best Results */}
      <AppCard variant="surface" style={styles.tipsCard}>
        <Text style={styles.tipsTitle}>Советы для лучшего результата:</Text>
        <View style={styles.tipsList}>
          <View style={styles.tipItem}>
            <CheckCircle2 size={18} color={colors.primary} strokeWidth={2.2} />
            <Text style={styles.tipText}>Фокусируйтесь на листовой пластине, а не на почве</Text>
          </View>
          <View style={styles.tipItem}>
            <CheckCircle2 size={18} color={colors.primary} strokeWidth={2.2} />
            <Text style={styles.tipText}>Избегайте прямого слепящего солнца и глубоких теней</Text>
          </View>
          <View style={styles.tipItem}>
            <CheckCircle2 size={18} color={colors.primary} strokeWidth={2.2} />
            <Text style={styles.tipText}>Очаг пятнистости должен занимать центр кадра</Text>
          </View>
        </View>
      </AppCard>

      {/* Modal for selecting all 20 crops */}
      <Modal
        visible={isModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setIsModalVisible(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Выберите культуру</Text>
              <Pressable
                onPress={() => setIsModalVisible(false)}
                hitSlop={10}
                style={styles.modalCloseButton}>
                <X size={20} color={colors.textSecondary} />
              </Pressable>
            </View>

            {/* Search input */}
            <View style={styles.searchBar}>
              <Search size={18} color={colors.textMuted} />
              <TextInput
                style={styles.searchInput}
                placeholder="Поиск культуры..."
                placeholderTextColor={colors.textMuted}
                value={searchQuery}
                onChangeText={setSearchQuery}
                clearButtonMode="while-editing"
              />
            </View>

            {/* Crops list */}
            <ScrollView
              style={styles.modalScroll}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.modalScrollContent}>
              {/* Option to select AI Auto-detection in modal */}
              {(!searchQuery || 'автоопределение ai auto'.includes(searchQuery.toLowerCase())) && (
                <Pressable
                  style={[styles.modalCropItem, isAuto && styles.modalCropItemSelected]}
                  onPress={() => {
                    setSelectedCropId('auto');
                    setIsModalVisible(false);
                  }}>
                  <View
                    style={[
                      styles.modalCropIconCircle,
                      isAuto && styles.modalCropIconCircleSelected,
                    ]}>
                    <Sparkles
                      size={18}
                      color={isAuto ? colors.white : '#16A34A'}
                      strokeWidth={2.4}
                    />
                  </View>
                  <View style={styles.modalCropInfo}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                      <Text style={[styles.modalCropName, isAuto && styles.modalCropNameSelected]}>
                        {language === 'kk'
                          ? '✨ AI дақылды автоматты анықтау'
                          : language === 'en'
                          ? '✨ AI Auto-Detect Crop'
                          : '✨ ИИ сам определит культуру'}
                      </Text>
                      <View style={[styles.modalPvBadge, { backgroundColor: '#E0F2FE' }]}>
                        <Text style={[styles.modalPvBadgeText, { color: '#0284C7' }]}>AI Auto</Text>
                      </View>
                    </View>
                    <Text style={styles.modalCropId}>
                      {language === 'kk'
                        ? 'Барлық дақылдар үшін әмбебап'
                        : language === 'en'
                        ? 'Universal vision identifier'
                        : 'Универсальное распознавание по фото'}
                    </Text>
                  </View>
                  {isAuto && <CheckCircle2 size={18} color={colors.primary} strokeWidth={2.4} />}
                </Pressable>
              )}

              {filteredAllCrops.map((c) => {
                const isSelected = selectedCropId === c.id;
                const pvCrop = PLANTVILLAGE_CROPS.find((p) => p.cropId === c.id);
                return (
                  <Pressable
                    key={c.id}
                    style={[styles.modalCropItem, isSelected && styles.modalCropItemSelected]}
                    onPress={() => {
                      setSelectedCropId(c.id);
                      setIsModalVisible(false);
                    }}>
                    <View
                      style={[
                        styles.modalCropIconCircle,
                        isSelected && styles.modalCropIconCircleSelected,
                      ]}>
                      <Sprout
                        size={18}
                        color={isSelected ? colors.white : colors.primary}
                        strokeWidth={2.2}
                      />
                    </View>
                    <View style={styles.modalCropInfo}>
                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                        <Text style={[styles.modalCropName, isSelected && styles.modalCropNameSelected]}>
                          {c.name}
                        </Text>
                        {pvCrop ? (
                          <View style={styles.modalPvBadge}>
                            <Text style={styles.modalPvBadgeText}>PV • {pvCrop.classesCount} кл.</Text>
                          </View>
                        ) : null}
                      </View>
                      <Text style={styles.modalCropId}>
                        {pvCrop ? `PlantVillage Benchmark (${pvCrop.nameEn})` : `Полевая ИИ-диагностика`}
                      </Text>
                    </View>
                    {isSelected ? (
                      <CheckCircle2 size={20} color={colors.primary} strokeWidth={2.5} />
                    ) : null}
                  </Pressable>
                );
              })}
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Interactive Visual Crop Editor Modal */}
      <VisualCropEditorModal
        visible={showCropModal}
        imageUri={currentUri || ''}
        onClose={() => setShowCropModal(false)}
        onApplyCrop={(croppedUri) => {
          setCurrentUri(croppedUri);
        }}
      />
    </AppScreen>
  );
}

const createStyles = ({ colors, radii, spacing }: any) =>
  StyleSheet.create({
    photoContainer: {
      width: '100%',
      height: 250,
      borderRadius: radii.photo ?? 20,
      overflow: 'hidden',
      backgroundColor: colors.photoPlaceholder,
      position: 'relative',
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: spacing.md,
    },
    photoImage: {
      width: '100%',
      height: '100%',
      resizeMode: 'cover',
    },
    deleteButton: {
      position: 'absolute',
      top: 14,
      right: 14,
      width: 38,
      height: 38,
      borderRadius: 19,
      backgroundColor: 'rgba(0, 0, 0, 0.55)',
      alignItems: 'center',
      justifyContent: 'center',
    },
    demoBadgeOverlay: {
      position: 'absolute',
      bottom: 14,
      left: 14,
    },
    processingOverlay: {
      ...StyleSheet.absoluteFill,
      backgroundColor: 'rgba(0,0,0,0.45)',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 8,
    },
    processingText: {
      color: '#FFFFFF',
      fontSize: 13,
      fontWeight: '600',
    },
    qualityBadge: {
      position: 'absolute',
      bottom: 12,
      left: 12,
      flexDirection: 'row',
      alignItems: 'center',
      gap: 5,
      paddingHorizontal: 10,
      paddingVertical: 5,
      borderRadius: radii.full ?? 16,
      backgroundColor: 'rgba(22, 101, 52, 0.88)',
    },
    qualityBadgeWarn: {
      backgroundColor: 'rgba(180, 83, 9, 0.9)',
    },
    qualityBadgeText: {
      color: '#FFFFFF',
      fontSize: 12,
      fontWeight: '700',
    },
    toolBar: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
      marginBottom: spacing.md,
    },
    toolBtn: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 5,
      paddingVertical: 10,
      paddingHorizontal: 6,
      backgroundColor: colors.primarySoft,
      borderRadius: radii.card,
    },
    toolBtnText: {
      fontSize: 12,
      fontWeight: '600',
      color: colors.primaryDark,
    },
    toolBtnReset: {
      backgroundColor: colors.surface,
      borderWidth: 1,
      borderColor: colors.border,
      flex: 0.8,
    },
    toolBtnTextReset: {
      fontSize: 12,
      fontWeight: '500',
      color: colors.textSecondary,
    },
    qualityWarningBox: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      gap: 10,
      backgroundColor: colors.warningSoft ?? '#FEF3C7',
      borderRadius: radii.card,
      padding: 12,
      marginBottom: spacing.md,
      borderWidth: 1,
      borderColor: '#FDE68A',
    },
    qualityWarningTextCol: {
      flex: 1,
    },
    qualityWarningTitle: {
      fontSize: 13,
      fontWeight: '700',
      color: '#92400E',
      marginBottom: 2,
    },
    qualityWarningDesc: {
      fontSize: 12,
      color: '#B45309',
      lineHeight: 16,
    },
    cropSection: {
      marginBottom: spacing.md,
    },
    sectionHeaderRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 10,
    },
    sectionLabel: {
      fontSize: 14,
      fontWeight: '600',
      color: colors.text,
    },
    allCropsButton: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
      paddingVertical: 4,
      paddingHorizontal: 8,
      borderRadius: radii.sm,
      backgroundColor: colors.primarySoft,
    },
    allCropsButtonText: {
      fontSize: 12,
      fontWeight: '600',
      color: colors.primaryDark,
    },
    autoCropCard: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: colors.surface,
      borderRadius: radii.card ?? 16,
      padding: 13,
      borderWidth: 2,
      borderColor: colors.border,
      marginBottom: 10,
    },
    autoCropCardActive: {
      borderColor: '#16A34A',
      backgroundColor: 'rgba(22, 163, 74, 0.08)',
    },
    autoCropIconCircle: {
      width: 42,
      height: 42,
      borderRadius: 21,
      backgroundColor: 'rgba(22, 163, 74, 0.12)',
      alignItems: 'center',
      justifyContent: 'center',
      marginRight: 12,
    },
    autoCropIconCircleActive: {
      backgroundColor: '#16A34A',
    },
    autoCropTextCol: {
      flex: 1,
    },
    autoCropTitleRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: 2,
    },
    autoCropTitle: {
      fontSize: 14.5,
      fontWeight: '700',
      color: colors.text,
    },
    autoCropTitleActive: {
      color: '#15803D',
      fontWeight: '800',
    },
    autoCropSubtitle: {
      fontSize: 12,
      color: colors.textSecondary,
      lineHeight: 16,
    },
    autoCropSubtitleActive: {
      color: '#166534',
    },
    autoCropActiveBadge: {
      backgroundColor: '#DCFCE7',
      paddingHorizontal: 8,
      paddingVertical: 2,
      borderRadius: 8,
    },
    autoCropActiveBadgeText: {
      fontSize: 11,
      fontWeight: '700',
      color: '#15803D',
    },
    orSelectSpecificText: {
      fontSize: 12,
      color: colors.textMuted,
      marginBottom: 8,
      marginLeft: 2,
    },
    cropGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 8,
    },
    cropChip: {
      flexBasis: '31%',
      flexGrow: 1,
      flexDirection: 'column',
      alignItems: 'center',
      paddingVertical: 10,
      paddingHorizontal: 6,
      backgroundColor: colors.surface,
      borderRadius: radii.card,
      borderWidth: 2,
      borderColor: 'transparent',
    },
    cropChipSelected: {
      borderColor: colors.primary,
      backgroundColor: colors.primarySoft,
    },
    cropEmoji: {
      fontSize: 22,
      marginBottom: 4,
    },
    cropChipText: {
      fontSize: 12,
      fontWeight: '500',
      color: colors.textSecondary,
      textAlign: 'center',
    },
    cropChipTextSelected: {
      color: colors.primaryDark,
      fontWeight: '700',
    },
    analyzeButton: {
      marginBottom: spacing.md,
    },
    tipsCard: {
      padding: spacing.md,
      marginBottom: spacing.lg,
    },
    tipsTitle: {
      fontSize: 14,
      fontWeight: '600',
      color: colors.text,
      marginBottom: 10,
    },
    tipsList: {
      gap: 8,
    },
    tipItem: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 10,
    },
    tipText: {
      fontSize: 13,
      color: colors.textSecondary,
      flex: 1,
    },
    modalOverlay: {
      flex: 1,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      justifyContent: 'flex-end',
    },
    modalContainer: {
      backgroundColor: colors.background,
      borderTopLeftRadius: 24,
      borderTopRightRadius: 24,
      paddingTop: 18,
      paddingHorizontal: spacing.lg,
      paddingBottom: 36,
      maxHeight: '80%',
    },
    modalHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 14,
    },
    modalTitle: {
      fontSize: 18,
      fontWeight: '700',
      color: colors.text,
    },
    modalCloseButton: {
      padding: 6,
      borderRadius: 16,
      backgroundColor: colors.surface,
    },
    searchBar: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: colors.surface,
      borderRadius: radii.input ?? 12,
      paddingHorizontal: 12,
      paddingVertical: 8,
      marginBottom: 12,
      borderWidth: 1,
      borderColor: colors.border,
      gap: 8,
    },
    searchInput: {
      flex: 1,
      fontSize: 14,
      color: colors.text,
      padding: 0,
    },
    modalScroll: {
      maxHeight: 380,
    },
    modalScrollContent: {
      paddingBottom: 16,
      gap: 8,
    },
    modalCropItem: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: 12,
      paddingHorizontal: 14,
      backgroundColor: colors.surface,
      borderRadius: radii.card,
      borderWidth: 1.5,
      borderColor: 'transparent',
    },
    modalCropItemSelected: {
      borderColor: colors.primary,
      backgroundColor: colors.primarySoft,
    },
    modalCropIconCircle: {
      width: 36,
      height: 36,
      borderRadius: 12,
      backgroundColor: '#EBF1EB',
      alignItems: 'center',
      justifyContent: 'center',
      marginRight: 12,
    },
    modalCropIconCircleSelected: {
      backgroundColor: colors.primary,
    },
    modalCropInfo: {
      flex: 1,
    },
    modalCropName: {
      fontSize: 15,
      fontWeight: '600',
      color: colors.text,
    },
    modalCropNameSelected: {
      color: colors.primaryDark,
      fontWeight: '700',
    },
    modalCropId: {
      fontSize: 12,
      color: colors.textMuted,
      textTransform: 'capitalize',
    },
    modalPvBadge: {
      backgroundColor: '#E6F4EA',
      paddingHorizontal: 6,
      paddingVertical: 1.5,
      borderRadius: 6,
    },
    modalPvBadgeText: {
      fontSize: 10,
      fontWeight: '700',
      color: '#059669',
    },
    toolBarWrapper: {
      marginBottom: spacing.sm,
    },
    toolBtnActive: {
      backgroundColor: colors.primary,
      borderColor: colors.primary,
    },
    toolBtnTextActive: {
      color: '#FFFFFF',
      fontWeight: '700',
    },
    focusPillsRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      backgroundColor: colors.surface,
      borderRadius: radii.card ?? 14,
      padding: 6,
      marginTop: 8,
      borderWidth: 1,
      borderColor: colors.border,
      gap: 6,
    },
    focusPill: {
      flex: 1,
      paddingVertical: 7,
      borderRadius: 10,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: 'transparent',
    },
    focusPillActive: {
      backgroundColor: colors.primarySoft,
      borderWidth: 1,
      borderColor: colors.primary,
    },
    focusPillText: {
      fontSize: 11,
      color: colors.textSecondary,
      fontWeight: '600',
    },
    focusPillTextActive: {
      color: colors.primaryDark,
      fontWeight: '800',
    },
    cropModalOverlay: {
      flex: 1,
      backgroundColor: 'rgba(0, 0, 0, 0.55)',
      justifyContent: 'flex-end',
    },
    cropModalContent: {
      backgroundColor: colors.background,
      borderTopLeftRadius: 24,
      borderTopRightRadius: 24,
      paddingTop: 18,
      paddingHorizontal: spacing.lg,
      paddingBottom: 36,
    },
    cropModalHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 8,
    },
    cropModalTitle: {
      fontSize: 18,
      fontWeight: '800',
      color: colors.text,
    },
    closeButton: {
      padding: 6,
      borderRadius: 16,
      backgroundColor: colors.surface,
    },
    cropModalSubtitle: {
      fontSize: 13,
      color: colors.textSecondary,
      marginBottom: 16,
      lineHeight: 18,
    },
    cropPresetsGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 10,
      marginBottom: 18,
    },
    cropPresetCard: {
      flexBasis: '47%',
      flexGrow: 1,
      backgroundColor: colors.surface,
      borderRadius: 16,
      padding: 14,
      borderWidth: 1.5,
      borderColor: colors.border,
      alignItems: 'center',
    },
    cropPresetIconBox: {
      width: 44,
      height: 44,
      borderRadius: 12,
      backgroundColor: colors.primarySoft,
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: 8,
    },
    cropPresetRatioText: {
      fontSize: 14,
      fontWeight: '800',
      color: colors.primary,
    },
    cropPresetLabel: {
      fontSize: 14,
      fontWeight: '700',
      color: colors.text,
      marginBottom: 2,
    },
    cropPresetDesc: {
      fontSize: 11,
      color: colors.textSecondary,
    },
    cropModalActions: {
      flexDirection: 'row',
      gap: 10,
      alignItems: 'center',
    },
    cropRotateBtn: {
      flex: 1,
      height: 46,
      borderRadius: 14,
      backgroundColor: colors.surface,
      borderWidth: 1.5,
      borderColor: colors.border,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 6,
    },
    cropRotateBtnText: {
      fontSize: 13.5,
      fontWeight: '700',
      color: colors.primary,
    },
    cropDoneBtn: {
      flex: 1,
      height: 46,
      borderRadius: 14,
      backgroundColor: colors.primary,
      alignItems: 'center',
      justifyContent: 'center',
    },
    cropDoneBtnText: {
      fontSize: 14,
      fontWeight: '700',
      color: '#FFFFFF',
    },
  });
