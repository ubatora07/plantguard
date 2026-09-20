import * as ImagePicker from 'expo-image-picker';
import { useRouter } from 'expo-router';
import {
  Camera,
  Image as ImageIcon,
  Sparkles,
  Info,
  ChevronRight,
} from 'lucide-react-native';
import React from 'react';
import {
  Alert,
  Image,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { ASSETS } from '../../constants/assets';
import { AppBadge } from '../../components/ui/AppBadge';
import { AppCard } from '../../components/ui/AppCard';
import { AppScreen } from '../../components/ui/AppScreen';
import { LeafVisual } from '../../components/ui/LeafVisual';
import { PLANTVILLAGE_IMAGES } from '../../data/plantvillage-images';
import { DEMO_SCENARIOS, type DemoScenario } from '../../data/demo-scenarios';
import { useSettings } from '../../features/settings/SettingsContext';
import { colors, radii, spacing } from '../../theme';

import { i18n } from '../../i18n';
import { useTheme, useStyles } from '../../theme';

export default function AnalyzeTabScreen() {
  const router = useRouter();
  const { mode } = useSettings();
  const { colors } = useTheme();
  const styles = useStyles(createStyles);

  const handlePickFromGallery = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.85,
      });

      if (!result.canceled && result.assets[0]?.uri) {
        router.push({
          pathname: '/preview',
          params: { uri: result.assets[0].uri, isCustom: 'true' },
        });
      }
    } catch {
      Alert.alert('Ошибка', 'Не удалось открыть галерею фото');
    }
  };

  const handleSelectDemo = (scenario: DemoScenario) => {
    let assetSource = ASSETS.diseases.earlyBlight;
    if (scenario.id === 'tomato-healthy-demo') {
      assetSource = ASSETS.diseases.healthy;
    } else if (scenario.id === 'tomato-late-blight-demo') {
      assetSource = PLANTVILLAGE_IMAGES['Tomato___Late_blight'] || ASSETS.diseases.earlyBlight;
    } else if (scenario.id === 'tomato-uncertain-demo') {
      assetSource = ASSETS.guide.badBlurry;
    }
    const resolvedUri = Image.resolveAssetSource(assetSource)?.uri || '';

    router.push({
      pathname: '/preview',
      params: {
        scenarioId: scenario.id,
        isDemo: 'true',
        uri: resolvedUri,
        cropId: scenario.cropId,
      },
    });
  };

  return (
    <AppScreen padded={true}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>{i18n.t('scan.title')}</Text>
        <AppBadge
          label={mode === 'demo' ? 'Демо-режим' : 'AI-режим'}
          variant={mode === 'demo' ? 'demo' : 'success'}
        />
      </View>

      <Text style={styles.subtitle}>
        Сфотографируйте лист томата или выберите подготовленный обучающий пример
      </Text>

      {/* Main Action Buttons */}
      <View style={styles.actionsRow}>
        <AppCard
          onPress={() => router.push('/camera')}
          style={styles.actionCard}>
          <View style={styles.actionIconBox}>
            <Camera size={28} color={colors.primary} strokeWidth={2.2} />
          </View>
          <Text style={styles.actionTitle}>Сделать фото</Text>
          <Text style={styles.actionDesc}>Камера устройства</Text>
        </AppCard>

        <AppCard
          onPress={handlePickFromGallery}
          style={styles.actionCard}>
          <View style={styles.actionIconBox}>
            <ImageIcon size={28} color={colors.primary} strokeWidth={2.2} />
          </View>
          <Text style={styles.actionTitle}>Из галереи</Text>
          <Text style={styles.actionDesc}>Выбрать готовое фото</Text>
        </AppCard>
      </View>

      {/* PlantVillage Benchmark Card (Track 3) */}
      <AppCard
        onPress={() => router.push('/plantvillage-explorer')}
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          backgroundColor: colors.surface,
          borderRadius: 20,
          padding: 16,
          borderWidth: 1.5,
          borderColor: colors.primary,
          marginBottom: spacing.md,
          gap: 12,
        }}>
        <View
          style={{
            width: 44,
            height: 44,
            borderRadius: 14,
            backgroundColor: colors.primarySoft,
            alignItems: 'center',
            justifyContent: 'center',
          }}>
          <Sparkles size={22} color={colors.primary} strokeWidth={2.2} />
        </View>
        <View style={{ flex: 1 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 2 }}>
            <Text style={{ fontSize: 15, fontWeight: '700', color: colors.text }}>
              Бенчмарк PlantVillage
            </Text>
            <View
              style={{
                backgroundColor: colors.primary,
                borderRadius: 8,
                paddingHorizontal: 6,
                paddingVertical: 2,
              }}>
              <Text style={{ fontSize: 10, fontWeight: '700', color: colors.white }}>
                Track 3
              </Text>
            </View>
          </View>
          <Text style={{ fontSize: 12, color: colors.textSecondary }}>
            38 классов заболеваний, 14 культур для тестирования ИИ
          </Text>
        </View>
        <ChevronRight size={18} color={colors.primary} strokeWidth={2.4} />
      </AppCard>

      {/* Honest Demo Mode Explanation Notice */}
      <AppCard variant="muted" style={styles.noticeCard}>
        <View style={styles.noticeHeader}>
          <Info size={18} color={colors.info} strokeWidth={2.2} />
          <Text style={styles.noticeTitle}>Принцип честной диагностики</Text>
        </View>
        <Text style={styles.noticeText}>
          В демонстрационном режиме обучающие примеры показывают структуру диагноза. Если вы загрузите собственное фото, приложение честно покажет снимок и уведомит, что серверная модель ещё не подключена.
        </Text>
      </AppCard>

      {/* Demo Scenarios Section */}
      <View style={styles.scenariosHeader}>
        <View style={styles.scenariosTitleRow}>
          <Sparkles size={20} color={colors.primary} strokeWidth={2.2} />
          <Text style={styles.scenariosTitle}>Обучающие примеры (Демо)</Text>
        </View>
        <Text style={styles.scenariosSub}>
          Нажмите на пример, чтобы увидеть карточку анализа и рекомендации
        </Text>
      </View>

      <View style={styles.scenariosList}>
        {DEMO_SCENARIOS.map((item) => (
          <AppCard
            key={item.id}
            onPress={() => handleSelectDemo(item)}
            style={styles.scenarioCard}>
            <View style={styles.scenarioThumbWrapper}>
              <Image
                source={
                  item.id === 'tomato-healthy-demo'
                    ? ASSETS.diseases.healthy
                    : item.id === 'tomato-late-blight-demo'
                    ? PLANTVILLAGE_IMAGES['Tomato___Late_blight']
                    : item.id === 'tomato-uncertain-demo'
                    ? ASSETS.guide.badBlurry
                    : ASSETS.diseases.earlyBlight
                }
                style={{ width: '100%', height: '100%' }}
                resizeMode="cover"
              />
            </View>

            <View style={styles.scenarioInfo}>
              <View style={styles.scenarioBadgeRow}>
                <Text style={styles.scenarioCrop}>{item.crop}</Text>
                <AppBadge label="Демо" variant="demo" />
              </View>
              <Text style={styles.scenarioLabel}>{item.label}</Text>
              {item.latinName ? (
                <Text style={styles.scenarioLatin}>{item.latinName}</Text>
              ) : null}
            </View>

            <ChevronRight size={20} color={colors.textSecondary} strokeWidth={2} />
          </AppCard>
        ))}
      </View>
    </AppScreen>
  );
}

const createStyles = ({ colors, radii, spacing }: any) => StyleSheet.create({
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: spacing.md,
    marginBottom: spacing.xs,
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: colors.text,
  },
  subtitle: {
    fontSize: 14,
    color: colors.textSecondary,
    lineHeight: 20,
    marginBottom: spacing.lg,
  },
  actionsRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: spacing.lg,
  },
  actionCard: {
    flex: 1,
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionIconBox: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: colors.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  actionTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 2,
  },
  actionDesc: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  noticeCard: {
    padding: spacing.md,
    marginBottom: spacing.xl,
    backgroundColor: '#F0F6F2',
    borderColor: '#D8E6DA',
  },
  noticeHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 6,
  },
  noticeTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
  },
  noticeText: {
    fontSize: 13,
    color: colors.textSecondary,
    lineHeight: 18,
  },
  scenariosHeader: {
    marginBottom: spacing.md,
  },
  scenariosTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  scenariosTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: colors.text,
  },
  scenariosSub: {
    fontSize: 13,
    color: colors.textSecondary,
  },
  scenariosList: {
    gap: 10,
    paddingBottom: 20,
  },
  scenarioCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
  },
  scenarioThumbWrapper: {
    width: 56,
    height: 56,
    borderRadius: radii.input,
    overflow: 'hidden',
    marginRight: 12,
    backgroundColor: colors.photoPlaceholder,
  },
  scenarioInfo: {
    flex: 1,
  },
  scenarioBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 2,
  },
  scenarioCrop: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.primary,
  },
  scenarioLabel: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.text,
  },
  scenarioLatin: {
    fontSize: 12,
    fontStyle: 'italic',
    color: colors.textSecondary,
    marginTop: 1,
  },
});
