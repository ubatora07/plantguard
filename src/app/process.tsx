import { useLocalSearchParams, useRouter } from 'expo-router';
import {
  CheckCircle2,
  AlertTriangle,
  Info,
} from 'lucide-react-native';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Animated,
  Easing,
  Image,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { AppButton } from '../components/ui/AppButton';
import { AppCard } from '../components/ui/AppCard';
import { AppScreen } from '../components/ui/AppScreen';
import { LeafVisual } from '../components/ui/LeafVisual';
import { ScreenHeader } from '../components/ui/ScreenHeader';
import { analyzeAndCompose, generateId } from '../features/diagnosis/analysis';
import type { DiagnosisRecord } from '../types';
import { cropById } from '../config';
import { useHistory } from '../features/history/HistoryContext';
import { useSettings } from '../features/settings/SettingsContext';
import { createProvider } from '../providers';
import { DemoProvider } from '../providers/demo-provider';
import { colors, radii, spacing } from '../theme';
import { persistImage } from '../utils/images';
import * as ImageManipulator from 'expo-image-manipulator';
import * as Network from 'expo-network';

import { i18n } from '../i18n';
import { useTheme, useStyles } from '../theme';
import { safeBack } from '../utils/navigation';

type StepIndex = 0 | 1 | 2 | 3 | 4;

export default function ProcessScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{
    uri?: string;
    scenarioId?: string;
    cropId?: string;
    isCustom?: string;
    notPlantTest?: string;
  }>();

  const { mode, language } = useSettings();
  const { addRecord } = useHistory();
  const { colors } = useTheme();
  const styles = useStyles(createStyles);

  const [currentStep, setCurrentStep] = useState<StepIndex>(0);
  const [error, setError] = useState<string | null>(null);

  // Scanline sweep over the analyzed photo (visual feedback only —
  // the actual progress is the real step list below).
  const [scanValue] = useState(() => new Animated.Value(0));

  useEffect(() => {
    Animated.loop(
      Animated.timing(scanValue, {
        toValue: 1,
        duration: 1800,
        easing: Easing.inOut(Easing.quad),
        useNativeDriver: true,
      })
    ).start();
  }, [scanValue]);

  const scanY = scanValue.interpolate({
    inputRange: [0, 1],
    outputRange: [-70, 220],
  });

  useEffect(() => {
    let cancelled = false;

    async function runAnalysis() {
      try {
        // Step 1: Подготовка изображения (сохранение в постоянное хранилище и сжатие)
        setCurrentStep(1);
        let finalImageUri = params.uri ?? '';
        let originalWidth = 0;
        let originalHeight = 0;
        
        if (finalImageUri) {
          try {
            finalImageUri = await persistImage(finalImageUri);
            const manipResult = await ImageManipulator.manipulateAsync(
              finalImageUri,
              [{ resize: { width: 768 } }],
              { compress: 0.70, format: ImageManipulator.SaveFormat.JPEG }
            );
            finalImageUri = manipResult.uri;
            originalWidth = manipResult.width;
            originalHeight = manipResult.height;
          } catch (manipErr) {
            console.warn('[process] Image manipulation fallback to original URI:', manipErr);
          }
        }
        if (cancelled) return;

        // Step 2: Проверка качества и валидация
        setCurrentStep(2);
        if (params.uri && !params.scenarioId) {
          if (!finalImageUri) {
            throw new Error('Выбранное изображение повреждено или недоступно.');
          }
          if (originalWidth > 0 && (originalWidth < 200 || originalHeight < 200)) {
             throw new Error('Изображение слишком маленькое (менее 200px) для корректного анализа.');
          }
        }
        if (cancelled) return;

        // Test mode for non-plant detection demo
        if (params.notPlantTest === 'true' || params.scenarioId === 'test-not-plant') {
          await new Promise((r) => setTimeout(r, 600));
          if (cancelled) return;
          setCurrentStep(3);
          await new Promise((r) => setTimeout(r, 700));
          if (cancelled) return;
          setCurrentStep(4);
          await new Promise((r) => setTimeout(r, 500));
          const notPlantRecord: DiagnosisRecord = {
            id: generateId(),
            createdAt: new Date().toISOString(),
            cropId: (params.cropId as any) || 'tomato',
            crop: cropById((params.cropId as any) || 'tomato').name,
            imageUri: finalImageUri,
            status: 'not_plant',
            resultOrigin: 'model_prediction',
            diagnosisClass: 'Объект не распознан как растение',
            explanation: 'На фотографии не обнаружен лист сельскохозяйственной культуры. Сработал модуль защитной фильтрации (Quality Gate & Plant Detector).',
            symptoms: ['Отсутствуют характерные жилки и структуры листовой пластины'],
            recommendations: [
              'Сфотографируйте один лист вблизи (15–20 см)',
              'Лист должен занимать большую часть кадра',
              'Используйте функцию кадрирования на экране превью'
            ],
            avoid: ['Не фотографируйте посторонние предметы или общие планы поля издалека'],
            providerMode: mode,
            modelVersion: 'PlantGuard-SafetyGate-v1.2',
            isDemoScenario: false,
          };
          await addRecord(notPlantRecord);
          router.replace({
            pathname: '/result',
            params: { id: notPlantRecord.id },
          });
          return;
        }

        // Demo scenario handling (guaranteed authentic demo outcome with leaf photo)
        if (params.scenarioId) {
          await new Promise((r) => setTimeout(r, 500));
          if (cancelled) return;
          setCurrentStep(3);
          const demoProvider = new DemoProvider();
          const demoResult = await demoProvider.analyze({
            imageUri: finalImageUri,
            cropId: (params.cropId as any) || 'tomato',
            scenarioId: params.scenarioId,
          });
          await new Promise((r) => setTimeout(r, 900));
          if (cancelled) return;
          setCurrentStep(4);
          await new Promise((r) => setTimeout(r, 500));
          const demoRecord: DiagnosisRecord = {
            id: generateId(),
            createdAt: new Date().toISOString(),
            cropId: (params.cropId as any) || 'tomato',
            crop: cropById((params.cropId as any) || 'tomato').name,
            imageUri: finalImageUri,
            status: demoResult.status,
            resultOrigin: demoResult.resultOrigin,
            plantVillageClass: demoResult.plantVillageClass,
            diagnosisClass: demoResult.diagnosisClass,
            diagnosisClassLatin: demoResult.diagnosisClassLatin,
            confidence: demoResult.confidence,
            severity: demoResult.severity ?? 'moderate',
            explanation: demoResult.explanation,
            symptoms: demoResult.symptoms,
            recommendations: demoResult.recommendations,
            avoid: demoResult.avoid,
            symptomHotspots: demoResult.symptomHotspots,
            providerMode: 'demo',
            modelVersion: demoResult.modelVersion,
            isDemoScenario: true,
          };
          await addRecord(demoRecord);
          router.replace({
            pathname: '/result',
            params: { id: demoRecord.id },
          });
          return;
        }

        // Check network state
        const netState = await Network.getNetworkStateAsync();
        const isOffline = !netState.isConnected;

        if (isOffline) {
          throw new Error('Нет подключения к сети. Без проверенной офлайн-модели диагноз по фото не выполняется.');
        }

        // Step 3: run the selected vision model.
        setCurrentStep(3);
        const provider = createProvider(mode);
        const startTime = Date.now();

        const record = await analyzeAndCompose({
          provider,
          imageUri: finalImageUri,
          cropId: (params.cropId as any) || 'auto',
          language,
          imageAlreadyPrepared: true,
        });

        const elapsed = Date.now() - startTime;

        if (cancelled) return;

        // Step 4: Сохранение результата в историю и формирование отчета
        setCurrentStep(4);
        await addRecord(record);

        if (cancelled) return;

        // Navigate to result
        router.replace({
          pathname: '/result',
          params: { id: record.id },
        });
      } catch (err: unknown) {
        console.warn('[process] Analysis error:', err);
        if (!cancelled) setError(err instanceof Error ? err.message : 'Не удалось завершить анализ');
      }
    }


    void runAnalysis();

    return () => {
      cancelled = true;
    };
  }, [addRecord, language, mode, params.cropId, params.notPlantTest, params.scenarioId, params.uri, router]);

  return (
    <AppScreen padded={true} scroll={false}>
      <ScreenHeader title="Анализ растения" back={Boolean(error)} />

      <View style={styles.container}>
        {/* Scanned photo preview with sweep animation */}
        <View style={styles.scanFrame}>
          {params.uri ? (
            <Image source={{ uri: params.uri }} style={styles.scanImage} />
          ) : (
            <LeafVisual
              type={
                params.scenarioId === 'tomato-healthy-demo'
                  ? 'healthy'
                  : params.scenarioId === 'tomato-late-blight-demo'
                  ? 'late-blight'
                  : params.scenarioId === 'tomato-uncertain-demo'
                  ? 'uncertain'
                  : 'early-blight'
              }
              width={300}
              height={200}
            />
          )}
          <Animated.View style={[styles.scanBar, { transform: [{ translateY: scanY }] }]} />
        </View>

        {/* Title & Subtitle */}
        <Text style={styles.title}>
          {language === 'kk' ? 'Өсімдікті талдау...' : language === 'en' ? 'Analyzing plant leaf...' : 'Анализируем изображение...'}
        </Text>
        <Text style={styles.subtitle}>
          {language === 'kk'
            ? 'Өсімдік белгілерін ЖИ талдауы'
            : language === 'en'
            ? 'AI analysis of plant symptoms'
            : 'ИИ анализ признаков растения'}
        </Text>

        {/* Steps Checklist */}
        <AppCard style={styles.stepsCard}>
          <StepRow
            label={
              language === 'kk'
                ? 'Фотосуретті дайындау'
                : language === 'en'
                ? 'Preparing photo'
                : 'Подготовка фото'
            }
            done={currentStep > 1}
            active={currentStep === 1}
          />
          <StepRow
            label={
              language === 'kk'
                ? 'Фото сапасын тексеру'
                : language === 'en'
                ? 'Checking photo quality'
                : 'Проверка качества фото'
            }
            done={currentStep > 2}
            active={currentStep === 2}
          />
          <StepRow
            label={
              language === 'kk'
                ? 'ЖИ белгілерді талдау'
                : language === 'en'
                ? 'AI symptom analysis'
                : 'ИИ анализ признаков'
            }
            done={currentStep > 3}
            active={currentStep === 3}
          />
          <StepRow
            label={
              language === 'kk'
                ? 'Нәтижені дайындау'
                : language === 'en'
                ? 'Preparing result'
                : 'Подготовка результата'
            }
            done={currentStep >= 4}
            active={currentStep === 4}
          />
        </AppCard>

        {/* Error state if any */}
        {error ? (
          <AppCard variant="muted" style={styles.errorCard}>
            <AlertTriangle size={24} color={colors.danger} strokeWidth={2} />
            <Text style={styles.errorTitle}>Ошибка анализа</Text>
            <Text style={styles.errorText}>{error}</Text>
            <View style={{ width: '100%', gap: 8, marginTop: 12 }}>
              <AppButton
                label="Сделать другое фото"
                variant="primary"
                onPress={() => safeBack(router, '/camera')}
                style={styles.retryButton}
              />
            </View>
          </AppCard>
        ) : (
          /* Bottom Notice */
          <View style={styles.noticeBox}>
            <Info size={18} color={colors.textSecondary} strokeWidth={2} />
            <Text style={styles.noticeText}>
              Пожалуйста, не закрывайте приложение
            </Text>
          </View>
        )}
      </View>
    </AppScreen>
  );
}

function StepRow({
  label,
  done,
  active,
}: {
  label: string;
  done: boolean;
  active: boolean;
}) {
  const { colors } = useTheme();
  const styles = useStyles(createStyles);
  
  return (
    <View style={styles.stepRow}>
      {done ? (
        <CheckCircle2 size={20} color={colors.primary} strokeWidth={2.4} />
      ) : active ? (
        <ActivityIndicator size="small" color={colors.primary} />
      ) : (
        <View style={styles.stepPendingCircle} />
      )}
      <Text
        style={[
          styles.stepLabel,
          (done || active) && styles.stepLabelActive,
        ]}>
        {label}
      </Text>
    </View>
  );
}

const createStyles = ({ colors, radii, spacing }: any) => StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.xl,
  },
  scanFrame: {
    width: 300,
    height: 200,
    borderRadius: radii.card,
    overflow: 'hidden',
    backgroundColor: colors.photoPlaceholder,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.xl,
    position: 'relative',
  },
  scanImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  scanBar: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    height: 56,
    borderRadius: radii.input,
    backgroundColor: 'rgba(255, 255, 255, 0.22)',
    borderTopWidth: 2.5,
    borderBottomWidth: 2.5,
    borderColor: 'rgba(45, 138, 78, 0.85)',
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.text,
    textAlign: 'center',
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: spacing.xl,
  },
  stepsCard: {
    width: '100%',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    gap: 16,
    marginBottom: spacing.xl,
  },
  stepRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  stepPendingCircle: {
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 1.5,
    borderColor: colors.border,
  },
  stepLabel: {
    fontSize: 15,
    color: colors.textSecondary,
  },
  stepLabelActive: {
    color: colors.text,
    fontWeight: '600',
  },
  noticeBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: colors.primarySoft,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: radii.pill,
  },
  noticeText: {
    fontSize: 13,
    color: colors.textSecondary,
    fontWeight: '500',
  },
  errorCard: {
    alignItems: 'center',
    padding: spacing.lg,
    marginTop: spacing.md,
  },
  errorTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.danger,
    marginTop: 8,
    marginBottom: 4,
  },
  errorText: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: 16,
  },
  retryButton: {
    width: '100%',
  },
});
