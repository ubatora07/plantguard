import { useLocalSearchParams, useRouter } from 'expo-router';
import {
  ChevronLeft,
  Share2,
  MoreHorizontal,
  Check,
  ChevronRight,
  AlertTriangle,
  Camera,
  BookOpen,
  Sparkles,
  Send,
  Volume2,
  VolumeX,
  FileText,
  Leaf,
  Clock,
  Trash2,
  Database,
  ExternalLink,
} from 'lucide-react-native';
import React, { useState, useEffect } from 'react';
import {
  Alert,
  Image,
  Linking,
  Pressable,
  ScrollView,
  Share,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ASSETS } from '../constants/assets';
import { XaiPhotoViewer } from '../components/ui/XaiPhotoViewer';
import { EconomicCard } from '../components/ui/EconomicCard';
import { PhytoActModal } from '../components/ui/PhytoActModal';
import { ConfirmDeleteModal } from '../components/ui/ConfirmDeleteModal';
import { calculateEconomicImpact } from '../data/economic-models';
import { getPlantVillageImage } from '../data/plantvillage-images';
import { PLANTVILLAGE_TAXONOMY } from '../data/plantvillage-taxonomy';
import { useHistory } from '../features/history/HistoryContext';
import { useSettings } from '../features/settings/SettingsContext';
import { recordTitle } from '../features/diagnosis/analysis';
import i18n from '../i18n';
import { useTheme, useStyles } from '../theme';
import { safeBack } from '../utils/navigation';

interface QaItem {
  id: string;
  icon: typeof AlertTriangle;
  titleRu: string;
  titleKk: string;
  titleEn: string;
  answer: (rec: any, lang: string) => string;
}

const QA_ITEMS: QaItem[] = [
  {
    id: 'spread',
    icon: AlertTriangle,
    titleRu: 'Опасно для соседей?',
    titleKk: 'Көрші өсімдіктерге қауіпті ме?',
    titleEn: 'Spreads to neighbors?',
    answer: (rec: any, lang: string) => {
      const isOk = rec.status === 'no_signs' || rec.severity === 'healthy';
      if (lang === 'kk') {
        return isOk
          ? 'Өсімдік сау — көрші дақылдарға ешқандай қауіп жоқ. Алдын алуды жалғастырыңыз.'
          : `Иә, ${rec.diagnosisClass || 'аурудың'} споралары жел және су арқылы тарайды. Зақымдалған жапырақтарды алып тастап, бұтаны оқшаулау ұсынылады.`;
      }
      if (lang === 'en') {
        return isOk
          ? 'The plant is healthy — neighboring plants are safe. Continue routine monitoring.'
          : `Yes, spores of ${rec.diagnosisClass || 'this pathogen'} spread via wind and rain splash. Remove infected leaves and isolate the plant.`;
      }
      return isOk
        ? 'Растение здорово — соседним посадкам ничего не угрожает. Продолжайте профилактический осмотр.'
        : `Да, споры ${rec.diagnosisClass || 'заболевания'} переносятся ветром и водой при поливе. Рекомендуется удалить больные листья и изолировать куст.`;
    },
  },
  {
    id: 'organic',
    icon: Leaf,
    titleRu: 'Защита без химии',
    titleKk: 'Химиясыз қорғау',
    titleEn: 'Organic Protection',
    answer: (rec: any, lang: string) => {
      const isOk = rec.status === 'no_signs' || rec.severity === 'healthy';
      if (lang === 'kk') {
        return isOk
          ? 'Иммунитетті қолдау үшін органикалық мульча мен биологиялық өсу стимуляторларын қолданыңыз.'
          : 'FAO/IPM стандарты: Bacillus subtilis (Фитоспорин-М) немесе Триходерма негізіндегі биопрепараттарды қолданыңыз. Гүлдеу кезінде химиялық пестицидтерді пайдаланбаңыз.';
      }
      if (lang === 'en') {
        return isOk
          ? 'Apply organic mulch and bio-stimulants to maintain plant immunity.'
          : 'FAO/IPM standard: use biological agents based on Bacillus subtilis or Trichoderma. Avoid harsh chemicals during flowering.';
      }
      return isOk
        ? 'Для поддержания иммунитета применяйте мульчирование и биологические стимуляторы роста.'
        : 'Стандарт FAO/IPM: используйте биопрепараты на основе сенной палочки (Фитоспорин-М/Bacillus subtilis) или триходермы. Избегайте химикатов во время цветения.';
    },
  },
  {
    id: 'timeline',
    icon: Clock,
    titleRu: 'Сроки и прогноз',
    titleKk: 'Мерзімі мен болжам',
    titleEn: 'Timeline & Outlook',
    answer: (rec: any, lang: string) => {
      const isSevere = rec.severity === 'severe';
      if (lang === 'kk') {
        return isSevere
          ? 'Ылғалды ауа-райында аурудың дамуы 3–5 күнді алуы мүмкін. Дереу шара қолдану қажет.'
          : 'Санитарлық бұтау және құрғақ микроклимат сақталғанда оқшаулау кезеңі 7–10 күнді құрайды.';
      }
      if (lang === 'en') {
        return isSevere
          ? 'In high humidity, pathogen spread takes 3–5 days. Immediate intervention required.'
          : 'Recovery and containment takes 7–10 days with sanitation and reduced canopy humidity.';
      }
      return isSevere
        ? 'При влажной погоде развитие может занять 3–5 дней. Действовать нужно незамедлительно.'
        : 'Период локализации составляет 7–10 дней при соблюдении санитарной обрезки и сухом микроклимате.';
    },
  },
];

export default function ResultScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ id?: string }>();
  const { records, removeRecord } = useHistory();
  const { language } = useSettings();
  const { colors } = useTheme();
  const styles = useStyles(createStyles);
  const [activeTab, setActiveTab] = useState<'desc' | 'treatment' | 'prevention'>('desc');
  const [activeQa, setActiveQa] = useState<string | null>(null);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [showActModal, setShowActModal] = useState(false);
  const [selectedHotspotIndex, setSelectedHotspotIndex] = useState<number | null>(null);
  const [isDeleteModalVisible, setIsDeleteModalVisible] = useState(false);

  const handleDeleteRecord = () => {
    setIsDeleteModalVisible(true);
  };

  const confirmDelete = async () => {
    setIsDeleteModalVisible(false);
    if (record?.id) {
      await removeRecord(record.id);
    }
    safeBack(router, '/(tabs)/history');
  };

  useEffect(() => {
    return () => {
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  // Match selected record or fallback to default early-blight record
  const record = records.find((r) => r.id === params.id) ?? records[0] ?? {
    id: 'demo-initial-1',
    createdAt: '2025-06-12T14:32:00.000Z',
    crop: 'Томат',
    diagnosisClass: 'Ранняя пятнистость',
    diagnosisClassLatin: 'Alternaria solani',
    confidence: 0.85,
    explanation:
      'Грибковое заболевание, которое чаще всего поражает томаты. Проявляется тёмными круглыми пятнами с жёлтой каймой.',
    symptoms: [
      'Круглые тёмные пятна на листьях',
      'Жёлтая кайма вокруг пятен',
      'Постепенное пожелтение и засыхание',
      'Снижение урожайности',
    ],
    recommendations: [
      'Удалите и уничтожьте поражённые листья',
      'Обеспечьте проветривание и снизьте влажность',
      'Поливайте строго под корень, избегая попадания воды на ботву',
      'Примените разрешённые медьсодержащие фунгициды',
    ],
    avoid: [
      'Не высаживайте томаты на одном месте два года подряд',
      'Мульчируйте почву соломой или агроволокном',
      'Регулярно осматривайте нижние листья на ранней стадии',
      'Дезинфицируйте садовый инвентарь после работы',
    ],
    imageUri: '',
  };

  const isNotPlant = record.status === 'not_plant';
  const isHealthy = record.status === 'no_signs' || record.severity === 'healthy';
  const displayTitle = recordTitle(record);

  const handleShare = async () => {
    try {
      const message = isNotPlant
        ? `PlantGuard AI\n${language === 'kk' ? 'Нәтиже' : language === 'en' ? 'Result' : 'Результат'}: ${displayTitle}\n${language === 'kk' ? 'Дақыл' : language === 'en' ? 'Crop' : 'Культура'}: ${record.crop}\n${record.explanation || ''}`
        : `*PlantGuard AI — ${language === 'kk' ? 'Агроном қорытындысы' : language === 'en' ? 'Agronomist Report' : 'Экспресс-заключение агронома'}*\n` +
          `━━━━━━━━━━━━━━━━━━━━\n` +
          `*${language === 'kk' ? 'Дақыл' : language === 'en' ? 'Crop' : 'Культура'}:* ${record.crop}\n` +
          `*${language === 'kk' ? 'Диагноз' : language === 'en' ? 'Diagnosis' : 'Диагноз'}:* ${record.diagnosisClass ?? displayTitle} ${record.diagnosisClassLatin ? `(${record.diagnosisClassLatin})` : ''}\n` +
          `*${language === 'kk' ? 'Дәлдік' : language === 'en' ? 'Confidence' : 'Точность'}:* ${confidencePercent}%\n` +
          (record.severity ? `*${language === 'kk' ? 'Ауырлығы' : language === 'en' ? 'Severity' : 'Тяжесть'}:* ${record.severity === 'severe' ? 'Severe' : record.severity === 'moderate' ? 'Moderate' : 'Mild'}\n` : '') +
          `\n*${language === 'kk' ? 'Белгілері' : language === 'en' ? 'Symptoms' : 'Симптомы'}:*\n${symptomsList.map((s) => `• ${s}`).join('\n')}\n` +
          `\n*${language === 'kk' ? 'Қорғау шаралары (FAO)' : language === 'en' ? 'Treatment & Bio-protection (FAO)' : 'Меры защиты (FAO)'}:*\n${treatmentList.slice(0, 3).map((t) => `• ${t}`).join('\n')}\n` +
          `\n*${language === 'kk' ? 'Болмайтын әрекеттер' : language === 'en' ? 'What to Avoid' : 'Чего делать НЕЛЬЗЯ'}:*\n${preventionList.slice(0, 2).map((p) => `• ${p}`).join('\n')}\n` +
          `━━━━━━━━━━━━━━━━━━━━\n` +
          `*PlantGuard AI*`;

      await Share.share({
        message,
        title: `PlantGuard AI: ${record.crop} - ${record.diagnosisClass ?? displayTitle}`,
      });
    } catch {
      // Ignored
    }
  };

  // Resolve authentic PlantVillage benchmark class and reference image
  const resolvedPvClassKey =
    record.plantVillageClass ||
    (() => {
      const match = Object.values(PLANTVILLAGE_TAXONOMY).find(
        (item) =>
          (record.diagnosisClass &&
            item.conditionRu.toLowerCase().includes(record.diagnosisClass.toLowerCase())) ||
          (record.diagnosisClassLatin &&
            item.latinName &&
            item.latinName.toLowerCase().includes(record.diagnosisClassLatin.toLowerCase()))
      );
      if (match) return match.key;
      if (record.cropId === 'tomato') return isHealthy ? 'Tomato___healthy' : 'Tomato___Early_blight';
      if (record.cropId === 'potato') return isHealthy ? 'Potato___healthy' : 'Potato___Early_blight';
      if (record.cropId === 'apple') return isHealthy ? 'Apple___healthy' : 'Apple___Apple_scab';
      if (record.cropId === 'grape') return isHealthy ? 'Grape___healthy' : 'Grape___Black_rot';
      return isHealthy ? 'Tomato___healthy' : 'Tomato___Early_blight';
    })();

  const pvReferenceImage = getPlantVillageImage(resolvedPvClassKey);
  const pvImage = record.plantVillageClass ? getPlantVillageImage(record.plantVillageClass) : pvReferenceImage;
  const imageSource = record.imageUri
    ? { uri: record.imageUri }
    : pvImage
    ? pvImage
    : ASSETS.diseases.earlyBlight;

  // Never render a plausible confidence value when the provider did not return one.
  const confidencePercent = Math.round((record.confidence ?? 0) * 100);
  const sourceLabel = record.modelVersion
    ? `Источник анализа: ${record.modelVersion}`
    : 'Источник анализа не подтверждён';

  const defaultSymptoms = [
    language === 'kk' ? 'Жапырақтарда дөңгелек қара дақтар' : language === 'en' ? 'Circular dark leaf spots' : 'Круглые тёмные пятна на листьях',
    language === 'kk' ? 'Дақтар айналасында сары жиек' : language === 'en' ? 'Yellow halos around spots' : 'Жёлтая кайма вокруг пятен',
    language === 'kk' ? 'Жапырақтардың сарғаюы және кебуі' : language === 'en' ? 'Progressive leaf yellowing' : 'Постепенное пожелтение и засыхание',
    language === 'kk' ? 'Өнімділіктің төмендеуі' : language === 'en' ? 'Reduced crop yield' : 'Снижение урожайности',
  ];

  const defaultTreatment = [
    language === 'kk' ? 'Зақымдалған жапырақтарды кесіп тастаңыз' : language === 'en' ? 'Prune and destroy infected leaves' : 'Удалите поражённые листья и побеги',
    language === 'kk' ? 'Жақсы желдетуді қамтамасыз етіңіз' : language === 'en' ? 'Ensure proper airflow in canopy' : 'Обеспечьте циркуляцию сухого воздуха',
    language === 'kk' ? 'Суды таңертең тек түбіне құйыңыз' : language === 'en' ? 'Water at soil level in early morning' : 'Поливайте строго под корень утром',
    language === 'kk' ? 'Биофунгицидпен өңдеңіз (Bacillus subtilis)' : language === 'en' ? 'Apply biofungicide (Bacillus subtilis)' : 'Обработайте биофунгицидом (Фитоспорин)',
  ];

  const defaultPrevention = [
    language === 'kk' ? 'Ауыспалы егістікті сақтаңыз (3-4 жыл)' : language === 'en' ? 'Practice 3-4 year crop rotation' : 'Соблюдайте севооборот культур (3-4 года)',
    language === 'kk' ? 'Топырақты сабанмен мульчалаңыз' : language === 'en' ? 'Mulch soil surface around plants' : 'Мульчируйте почву вокруг кустов',
    language === 'kk' ? 'Төменгі жапырақтарды жиі тексеріңіз' : language === 'en' ? 'Regularly scout lower foliage' : 'Регулярно осматривайте нижний ярус листьев',
    language === 'kk' ? 'Құрал-саймандарды залалсыздандырыңыз' : language === 'en' ? 'Sanitize garden shears between cuts' : 'Очищайте теплицу и инструмент осенью',
  ];

  const hasConfirmedAssessment = record.status === 'prediction' || record.status === 'no_signs';
  const symptomsList = record.symptoms && record.symptoms.length > 0
    ? record.symptoms
    : hasConfirmedAssessment ? defaultSymptoms : [];

  const treatmentList = record.recommendations && record.recommendations.length > 0
    ? record.recommendations
    : hasConfirmedAssessment ? defaultTreatment : [];

  const preventionList = record.avoid && record.avoid.length > 0
    ? record.avoid
    : hasConfirmedAssessment ? defaultPrevention : [];

  const toggleSpeech = () => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      if (isSpeaking) {
        window.speechSynthesis.cancel();
        setIsSpeaking(false);
      } else {
        let textToSpeak = '';
        if (language === 'kk') {
          textToSpeak = isNotPlant
            ? 'Назар аударыңыз: нысан өсімдік емес. Өсімдік жапырағын қайта суретке түсіріңіз.'
            : isHealthy
            ? `Дақыл: ${record.crop}. Өсімдік сау, инфекция белгілері анықталмаған.`
            : `Дақыл: ${record.crop}. Диагноз: ${record.diagnosisClass || 'Ауру'}. Сенімділік: ${confidencePercent} пайыз. Қорғау шаралары: ${treatmentList.slice(0, 2).join('. ')}`;
        } else if (language === 'en') {
          textToSpeak = isNotPlant
            ? 'Warning: Non-plant object detected. Please take a photo of a plant leaf.'
            : isHealthy
            ? `Crop: ${record.crop}. The plant is healthy with no infection signs.`
            : `Crop: ${record.crop}. Diagnosis: ${record.diagnosisClass || 'Disease'}. Confidence: ${confidencePercent} percent. Recommendations: ${treatmentList.slice(0, 2).join('. ')}`;
        } else {
          textToSpeak = isNotPlant
            ? 'Внимание: объект не является растением. Пожалуйста, сфотографируйте лист растения.'
            : isHealthy
            ? `Культура: ${record.crop}. Растение здорово, признаков инфекции не обнаружено.`
            : `Культура: ${record.crop}. Диагноз: ${record.diagnosisClass || 'Заболевание'}. Точность: ${confidencePercent} процентов. Рекомендации по защите: ${treatmentList.slice(0, 2).join('. ')}`;
        }

        const utterance = new SpeechSynthesisUtterance(textToSpeak);
        utterance.lang = language === 'kk' ? 'kk-KZ' : language === 'en' ? 'en-US' : 'ru-RU';
        utterance.onend = () => setIsSpeaking(false);
        utterance.onerror = () => setIsSpeaking(false);
        setIsSpeaking(true);
        window.speechSynthesis.speak(utterance);
      }
    } else {
      Alert.alert(
        language === 'kk' ? 'Аудио-қорытынды' : language === 'en' ? 'Audio Diagnosis' : 'Аудио-заключение',
        isNotPlant
          ? (language === 'kk' ? 'Нысан өсімдік емес.' : language === 'en' ? 'Not a plant leaf.' : 'Объект не является растением.')
          : `${record.crop}: ${record.diagnosisClass || (language === 'kk' ? 'Сау' : language === 'en' ? 'Healthy' : 'Здорово')}\n${treatmentList[0] || ''}`
      );
    }
  };

  const economicData = hasConfirmedAssessment
    ? record.economicImpact ?? calculateEconomicImpact({
        cropId: record.cropId,
        severity: record.severity,
        isHealthy,
      })
    : undefined;

  return (
    <View style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        bounces={false}>
        {/* Top Hero Photo Section with Interactive XAI Hotspots */}
        <View style={styles.heroPhotoWrapper}>
          <XaiPhotoViewer
            imageSource={imageSource}
            hotspots={record.symptomHotspots}
            isHealthy={isHealthy}
            isNotPlant={isNotPlant}
            diseaseName={record.diagnosisClass ?? displayTitle}
            confidencePercent={confidencePercent}
            height={340}
            selectedIndex={selectedHotspotIndex}
            onSelectIndex={setSelectedHotspotIndex}
          />

          {/* Floating Navigation Buttons */}
          <SafeAreaView style={styles.floatingTopBar} edges={['top']}>
            <Pressable
              onPress={() => safeBack(router, '/(tabs)')}
              style={styles.floatingCircleBtn}
              hitSlop={8}
              accessibilityLabel="Назад">
              <ChevronLeft size={22} color={colors.white} strokeWidth={2.4} />
            </Pressable>

            <View style={styles.floatingRightBtns}>
              <Pressable
                onPress={toggleSpeech}
                style={[styles.floatingCircleBtn, isSpeaking && styles.floatingCircleBtnActive]}
                hitSlop={8}
                accessibilityLabel="Озвучить диагноз">
                {isSpeaking ? (
                  <VolumeX size={18} color={colors.white} strokeWidth={2.2} />
                ) : (
                  <Volume2 size={18} color={colors.white} strokeWidth={2.2} />
                )}
              </Pressable>

              <Pressable
                onPress={handleShare}
                style={styles.floatingCircleBtn}
                hitSlop={8}
                accessibilityLabel="Поделиться">
                <Share2 size={18} color={colors.white} strokeWidth={2.2} />
              </Pressable>

              <Pressable
                onPress={() => setShowActModal(true)}
                style={styles.floatingCircleBtn}
                hitSlop={8}
                accessibilityLabel="Фитосанитарный акт">
                <FileText size={18} color={colors.white} strokeWidth={2.2} />
              </Pressable>

              <Pressable
                onPress={handleDeleteRecord}
                style={[styles.floatingCircleBtn, styles.floatingDeleteBtn]}
                hitSlop={8}
                accessibilityLabel="Удалить запись">
                <Trash2 size={18} color="#FF6B6B" strokeWidth={2.2} />
              </Pressable>
            </View>
          </SafeAreaView>

          {/* Floating Confidence Badge */}
          <View style={[styles.confidenceBadge, isNotPlant && styles.confidenceBadgeWarn]}>
            {isNotPlant ? (
              <>
                <AlertTriangle size={14} color="#FFFFFF" strokeWidth={2.4} />
                <Text style={styles.confidenceText}>
                  {language === 'kk' ? 'Өсімдік емес' : language === 'en' ? 'Not a plant' : 'Не растение'}
                </Text>
              </>
            ) : isHealthy ? (
              <>
                <Check size={14} color="#FFFFFF" strokeWidth={2.5} />
                <Text style={styles.confidenceText}>
                  {language === 'kk' ? `Сау (${confidencePercent}%)` : language === 'en' ? `Healthy (${confidencePercent}%)` : `Здорово (${confidencePercent}%)`}
                </Text>
              </>
            ) : (
              <>
                <View style={styles.signalBars}>
                  <View style={[styles.signalBar, { height: 7 }]} />
                  <View style={[styles.signalBar, { height: 10 }]} />
                  <View style={[styles.signalBar, { height: 13 }]} />
                </View>
                <Text style={styles.confidenceText}>
                  {confidencePercent}% {language === 'kk' ? 'сенімділік' : language === 'en' ? 'confidence' : 'уверенность'}
                </Text>
              </>
            )}
          </View>
        </View>

        {/* Sliding Bottom Sheet Card */}
        <View style={styles.sheetCard}>
          {/* Title Row */}
          <View style={styles.titleRow}>
            <View style={styles.titleCol}>
              <Text style={[styles.diseaseTitle, isNotPlant && styles.diseaseTitleWarn]}>
                {displayTitle}
              </Text>
              <Text style={styles.diseaseLatin}>
                {isNotPlant ? `${language === 'kk' ? 'Дақыл' : language === 'en' ? 'Crop' : 'Культура'}: ${record.crop}` : (record.diagnosisClassLatin ?? record.crop)}
              </Text>
              {record.isAutoDetectedCrop ? (
                <View style={styles.autoCropDetectedBadge}>
                  <Sparkles size={12} color="#15803D" strokeWidth={2.4} />
                  <Text style={styles.autoCropDetectedText}>
                    {language === 'kk'
                      ? `ИИ анықтаған дақыл: ${record.crop}`
                      : language === 'en'
                      ? `AI Detected Crop: ${record.crop}`
                      : `Культура определена ИИ: ${record.crop}`}
                  </Text>
                </View>
              ) : null}
              <Text style={styles.diseaseLatin}>{sourceLabel}</Text>
            </View>

            {/* Thumbnail */}
            <View style={styles.leafThumbnailBox}>
              <Image source={imageSource} style={styles.leafThumbnail} />
            </View>
          </View>

          {/* Description Paragraph */}
          <Text style={styles.diseaseDescription}>
            {record.explanation ??
              'Результат анализа листовой пластины на основе агрономических стандартов.'}
          </Text>

          {/* Explainable AI (XAI) Hotspots Bar */}
          {record.symptomHotspots && record.symptomHotspots.length > 0 && !isHealthy && !isNotPlant && (
            <View style={styles.xaiSummaryCard}>
              <View style={styles.xaiSummaryHeader}>
                <View style={styles.xaiSummaryTitleRow}>
                  <Sparkles size={16} color={colors.primary} strokeWidth={2.4} />
                  <Text style={styles.xaiSummaryTitle}>
                    {language === 'kk' ? 'Патоген ошағы (XAI):' : language === 'en' ? 'Pathogen Localization (XAI):' : 'Локализация патогена (XAI):'}
                  </Text>
                </View>
                <View style={styles.xaiSummaryCountBadge}>
                  <Text style={styles.xaiSummaryCountText}>
                    {record.symptomHotspots.length} {language === 'kk' ? 'ошақ' : language === 'en' ? 'hotspots' : (record.symptomHotspots.length === 1 ? 'очаг' : 'очага')}
                  </Text>
                </View>
              </View>

              <Text style={styles.xaiSummarySub}>
                {language === 'kk'
                  ? 'Жүйе суреттегі сипатты аймақтар бойынша диагнозды растады (жоғарыдағы [1], [2] маркерлер):'
                  : language === 'en'
                  ? 'AI confirmed diagnosis based on highlighted lesion spots (markers [1], [2] above):'
                  : 'Нейросеть подтвердила диагноз по характерным зонам на фото (маркеры [1], [2] на фото выше):'}
              </Text>

              <View style={styles.xaiChipsList}>
                {record.symptomHotspots.map((spot, idx) => {
                  const isSelected = selectedHotspotIndex === idx;
                  const dotColor =
                    spot.type === 'necrosis'
                      ? '#EF4444'
                      : spot.type === 'halo'
                      ? '#F59E0B'
                      : spot.type === 'mildew'
                      ? '#06B6D4'
                      : '#F97316';

                  return (
                    <Pressable
                      key={idx}
                      onPress={() => setSelectedHotspotIndex(isSelected ? null : idx)}
                      style={[styles.xaiChipItem, isSelected && styles.xaiChipItemSelected]}>
                      <View style={[styles.xaiChipDot, { backgroundColor: dotColor }]} />
                      <View style={{ flex: 1 }}>
                        <Text style={[styles.xaiChipLabel, isSelected && styles.xaiChipLabelSelected]}>
                          [{idx + 1}] {spot.label}
                        </Text>
                        {spot.description ? (
                          <Text style={styles.xaiChipDesc}>
                            {spot.description}
                          </Text>
                        ) : (
                          <Text style={styles.xaiChipCoords}>Координаты: {spot.x}%, {spot.y}%</Text>
                        )}
                      </View>
                    </Pressable>
                  );
                })}
              </View>
            </View>
          )}

          {isNotPlant ? (
            /* Special View when Not a Plant */
            <View style={styles.notPlantContainer}>
              <View style={styles.notPlantAlertBox}>
                <AlertTriangle size={24} color="#B45309" strokeWidth={2.2} />
                <View style={{ flex: 1 }}>
                  <Text style={styles.notPlantAlertTitle}>
                    {language === 'kk' ? 'Жапырақ анықталмады' : language === 'en' ? 'No leaf detected' : 'Лист не обнаружен'}
                  </Text>
                  <Text style={styles.notPlantAlertText}>
                    {language === 'kk'
                      ? 'Суретте бөгде зат, топырақ немесе бұлыңғыр кадр анықталды. Жүйе қате диагноздардан қорғалған.'
                      : language === 'en'
                      ? 'Non-plant object, background, or blurry frame detected. The system prevents false diagnoses.'
                      : 'На фотографии зафиксирован посторонний предмет, почва или кадр смазан. Система защищена от ложных диагнозов.'}
                  </Text>
                </View>
              </View>

              <View style={styles.tipsSection}>
                <Text style={styles.contentSectionTitle}>
                  {language === 'kk' ? 'Дәл түсіру бойынша кеңестер:' : language === 'en' ? 'Tips for accurate scanning:' : 'Рекомендации для точной съёмки:'}
                </Text>
                <View style={styles.checklist}>
                  <View style={styles.checkItemRow}>
                    <View style={styles.checkCircle}>
                      <Check size={13} color={colors.primary} strokeWidth={3} />
                    </View>
                    <Text style={styles.checkItemText}>
                      {language === 'kk' ? 'Бір жапырақты жақыннан суретке түсіріңіз (15–20 см)' : language === 'en' ? 'Photograph a single leaf close-up (15–20 cm)' : 'Сфотографируйте один лист вблизи (15–20 см)'}
                    </Text>
                  </View>
                  <View style={styles.checkItemRow}>
                    <View style={styles.checkCircle}>
                      <Check size={13} color={colors.primary} strokeWidth={3} />
                    </View>
                    <Text style={styles.checkItemText}>
                      {language === 'kk' ? 'Жапырақ кадрдың басым бөлігін алуы керек' : language === 'en' ? 'Leaf should occupy most of the frame' : 'Лист должен занимать большую часть кадра'}
                    </Text>
                  </View>
                  <View style={styles.checkItemRow}>
                    <View style={styles.checkCircle}>
                      <Check size={13} color={colors.primary} strokeWidth={3} />
                    </View>
                    <Text style={styles.checkItemText}>
                      {language === 'kk' ? 'Алдын ала қарау экранында «1.3x фокус» пайдаланыңыз' : language === 'en' ? 'Use "1.3x Focus" on preview screen' : 'Используйте кнопку «Фокус 1.3x» на экране превью'}
                    </Text>
                  </View>
                </View>
              </View>

              <View style={styles.actionButtonsCol}>
                <Pressable
                  onPress={() => router.push('/camera')}
                  style={({ pressed }) => [
                    styles.ctaButton,
                    pressed && styles.ctaButtonPressed,
                  ]}
                  accessibilityRole="button">
                  <Camera size={18} color={colors.white} strokeWidth={2.4} />
                  <Text style={styles.ctaButtonText}>
                    {language === 'kk' ? 'Жаңа суретке түсіру' : language === 'en' ? 'Take new photo' : 'Сделать новый снимок'}
                  </Text>
                </Pressable>

                <Pressable
                  onPress={() => router.push('/plantvillage-explorer')}
                  style={({ pressed }) => [
                    styles.secondaryOutlineBtn,
                    pressed && styles.ctaButtonPressed,
                  ]}
                  accessibilityRole="button">
                  <BookOpen size={18} color={colors.primary} strokeWidth={2.4} />
                  <Text style={styles.secondaryOutlineBtnText}>
                    {language === 'kk' ? 'PlantVillage анықтамалығы' : language === 'en' ? 'Open PlantVillage guide' : 'Открыть справочник PlantVillage'}
                  </Text>
                </Pressable>
              </View>
            </View>
          ) : (
            <>
              {/* Differential Diagnosis (XAI probabilities) */}
              {record.differentialDiagnosis && record.differentialDiagnosis.length > 0 && (
                <View style={styles.diffContainer}>
                  <Text style={styles.diffHeader}>
                    {language === 'kk' ? 'Дифференциалды диагностика (AI):' : language === 'en' ? 'Differential Diagnosis (AI):' : 'Дифференциальная диагностика (AI):'}
                  </Text>
                  {record.differentialDiagnosis.map((item, idx) => (
                    <View key={idx} style={styles.diffRow}>
                      <View style={styles.diffTextRow}>
                        <Text style={styles.diffName}>{item.condition}</Text>
                        <Text style={styles.diffScore}>{Math.round(item.confidence * 100)}%</Text>
                      </View>
                      <View style={styles.diffTrack}>
                        <View
                          style={[
                            styles.diffFill,
                            {
                              width: `${Math.round(item.confidence * 100)}%`,
                              backgroundColor: idx === 0 ? colors.primary : '#94A3B8',
                            },
                          ]}
                        />
                      </View>
                    </View>
                  ))}
                </View>
              )}

              {/* Segmented Tabs */}
              <View style={styles.segmentedTabRow}>
                <Pressable
                  onPress={() => setActiveTab('desc')}
                  style={[
                    styles.tabBtn,
                    activeTab === 'desc' && styles.tabBtnActive,
                  ]}>
                  <Text
                    style={[
                      styles.tabBtnText,
                      activeTab === 'desc' && styles.tabBtnTextActive,
                    ]}>
                    {language === 'kk' ? 'Сипаттама' : language === 'en' ? 'Overview' : 'Описание'}
                  </Text>
                </Pressable>

                <Pressable
                  onPress={() => setActiveTab('treatment')}
                  style={[
                    styles.tabBtn,
                    activeTab === 'treatment' && styles.tabBtnActive,
                  ]}>
                  <Text
                    style={[
                      styles.tabBtnText,
                      activeTab === 'treatment' && styles.tabBtnTextActive,
                    ]}>
                    {language === 'kk' ? 'Емдеу' : language === 'en' ? 'Treatment' : 'Лечение'}
                  </Text>
                </Pressable>

                <Pressable
                  onPress={() => setActiveTab('prevention')}
                  style={[
                    styles.tabBtn,
                    activeTab === 'prevention' && styles.tabBtnActive,
                  ]}>
                  <Text
                    style={[
                      styles.tabBtnText,
                      activeTab === 'prevention' && styles.tabBtnTextActive,
                    ]}>
                    {language === 'kk' ? 'Алдын алу' : language === 'en' ? 'Prevention' : 'Профилактика'}
                  </Text>
                </Pressable>
              </View>

              {/* Tab Content */}
              {activeTab === 'desc' && (
                <View style={styles.tabSectionContent}>
                  <Text style={styles.contentSectionTitle}>
                    {language === 'kk' ? 'Симптомдар' : language === 'en' ? 'Symptoms' : 'Симптомы'}
                  </Text>
                  <View style={styles.checklist}>
                    {symptomsList.map((symptom, idx) => (
                      <View key={idx} style={styles.checkItemRow}>
                        <View style={styles.checkCircle}>
                          <Check size={13} color={colors.primary} strokeWidth={3} />
                        </View>
                        <Text style={styles.checkItemText}>{symptom}</Text>
                      </View>
                    ))}
                  </View>
                </View>
              )}

              {activeTab === 'treatment' && (
                <View style={styles.tabSectionContent}>
                  <Text style={styles.contentSectionTitle}>
                    {language === 'kk' ? 'Емдеу және био-қорғау (FAO)' : language === 'en' ? 'Treatment & Bio-protection (FAO)' : 'Лечение и био-меры (FAO)'}
                  </Text>
                  <View style={styles.checklist}>
                    {treatmentList.map((item, idx) => (
                      <View key={idx} style={styles.checkItemRow}>
                        <View style={styles.checkCircle}>
                          <Check size={13} color={colors.primary} strokeWidth={3} />
                        </View>
                        <Text style={styles.checkItemText}>{item}</Text>
                      </View>
                    ))}
                  </View>
                </View>
              )}

              {activeTab === 'prevention' && (
                <View style={styles.tabSectionContent}>
                  <Text style={styles.contentSectionTitle}>
                    {language === 'kk' ? 'Алдын алу шаралары' : language === 'en' ? 'Preventive Measures' : 'Профилактика'}
                  </Text>
                  <View style={styles.checklist}>
                    {preventionList.map((item, idx) => (
                      <View key={idx} style={styles.checkItemRow}>
                        <View style={styles.checkCircle}>
                          <Check size={13} color={colors.primary} strokeWidth={3} />
                        </View>
                        <Text style={styles.checkItemText}>{item}</Text>
                      </View>
                    ))}
                  </View>
                </View>
              )}

              {/* Economic Impact & ROI Card */}
              {economicData ? (
                <EconomicCard
                  impact={economicData}
                  cropName={record.crop}
                  isHealthy={isHealthy}
                />
              ) : null}

              {/* Interactive "Ask AI-Agronomist" Q&A Section */}
              <View style={styles.qaSection}>
                <View style={styles.qaHeaderRow}>
                  <Sparkles size={16} color={colors.primary} />
                  <Text style={styles.qaSectionTitle}>
                    {language === 'kk' ? 'Агрономға сұрақ (AI-экспресс):' : language === 'en' ? 'Ask Agronomist (AI Express):' : 'Спроси агронома (AI-экспресс):'}
                  </Text>
                </View>
                <View style={styles.qaChipsRow}>
                  {QA_ITEMS.map((item) => {
                    const isSelected = activeQa === item.id;
                    const chipTitle = language === 'kk' ? item.titleKk : language === 'en' ? item.titleEn : item.titleRu;
                    const ItemIcon = item.icon;
                    return (
                      <Pressable
                        key={item.id}
                        style={[styles.qaChip, isSelected && styles.qaChipActive]}
                        onPress={() => setActiveQa(isSelected ? null : item.id)}>
                        <ItemIcon
                          size={14}
                          color={isSelected ? colors.primaryDark : colors.textSecondary}
                          strokeWidth={2.2}
                        />
                        <Text style={[styles.qaChipText, isSelected && styles.qaChipTextActive]}>
                          {chipTitle}
                        </Text>
                      </Pressable>
                    );
                  })}
                </View>

                {activeQa && (
                  <View style={styles.qaAnswerCard}>
                    <Text style={styles.qaAnswerText}>
                      {QA_ITEMS.find((q) => q.id === activeQa)?.answer(record, language)}
                    </Text>
                  </View>
                )}
              </View>

              {/* Action Buttons: PhytoAct, Recommendations & Delete */}
              <View style={styles.actionButtonsCol}>
                <Pressable
                  onPress={() => setShowActModal(true)}
                  style={({ pressed }) => [
                    styles.actBtn,
                    pressed && styles.ctaButtonPressed,
                  ]}
                  accessibilityRole="button">
                  <FileText size={16} color={colors.primary} strokeWidth={2.2} />
                  <Text style={styles.actBtnText}>
                    {language === 'kk' ? 'Фитосанитарлық акт (PDF)' : language === 'en' ? 'Phytosanitary Act (PDF)' : 'Фитосанитарный акт (PDF / Экспорт)'}
                  </Text>
                </Pressable>

                <Pressable
                  onPress={() =>
                    router.push({
                      pathname: '/recommendations',
                      params: { id: record.id },
                    })
                  }
                  style={({ pressed }) => [
                    styles.ctaButton,
                    pressed && styles.ctaButtonPressed,
                  ]}
                  accessibilityRole="button">
                  <Text style={styles.ctaButtonText}>
                    {language === 'kk' ? 'Толық ұсыныстар' : language === 'en' ? 'Full Recommendations' : 'Полные рекомендации'}
                  </Text>
                  <ChevronRight size={18} color={colors.white} strokeWidth={2.4} />
                </Pressable>

                <Pressable
                  onPress={handleDeleteRecord}
                  style={({ pressed }) => [
                    styles.deleteRecordBtn,
                    pressed && styles.ctaButtonPressed,
                  ]}
                  accessibilityRole="button">
                  <Trash2 size={16} color="#DC2626" strokeWidth={2.2} />
                  <Text style={styles.deleteRecordBtnText}>
                    {language === 'kk' ? 'Тарихтан өшіру' : language === 'en' ? 'Delete from History' : 'Удалить из истории'}
                  </Text>
                </Pressable>
              </View>
            </>
          )}
        </View>
      </ScrollView>

      <PhytoActModal
        visible={showActModal}
        record={record}
        onClose={() => setShowActModal(false)}
      />

      <ConfirmDeleteModal
        visible={isDeleteModalVisible}
        title={language === 'kk' ? 'Жазбаны өшіру' : language === 'en' ? 'Delete Record' : 'Удалить запись'}
        message={
          language === 'kk'
            ? 'Бұл жазбаны тарихтан жойғыңыз келе ме?'
            : language === 'en'
            ? 'Are you sure you want to delete this record from history?'
            : 'Вы уверены, что хотите удалить эту запись из истории?'
        }
        confirmText={language === 'kk' ? 'Өшіру' : language === 'en' ? 'Delete' : 'Удалить'}
        cancelText={language === 'kk' ? 'Бас тарту' : language === 'en' ? 'Cancel' : 'Отмена'}
        isDestructive={true}
        onConfirm={confirmDelete}
        onCancel={() => setIsDeleteModalVisible(false)}
      />
    </View>
  );
}

const createStyles = ({ colors, radii, spacing }: any) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.surface,
    },
    scrollContent: {
      flexGrow: 1,
      paddingBottom: 40,
    },
    heroPhotoWrapper: {
      width: '100%',
      height: 320,
      position: 'relative',
      backgroundColor: '#1E2C22',
    },
    heroPhoto: {
      width: '100%',
      height: '100%',
    },
    floatingTopBar: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: 16,
      paddingTop: 8,
    },
    floatingRightBtns: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 10,
    },
    floatingCircleBtn: {
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: 'rgba(20, 32, 23, 0.5)',
      borderWidth: 1,
      borderColor: 'rgba(255, 255, 255, 0.2)',
      alignItems: 'center',
      justifyContent: 'center',
    },
    confidenceBadge: {
      position: 'absolute',
      bottom: 36,
      left: 18,
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
      backgroundColor: 'rgba(20, 32, 23, 0.68)',
      borderRadius: 16,
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderWidth: 1,
      borderColor: 'rgba(255, 255, 255, 0.15)',
    },
    signalBars: {
      flexDirection: 'row',
      alignItems: 'flex-end',
      gap: 2,
    },
    signalBar: {
      width: 3,
      backgroundColor: colors.white,
      borderRadius: 1.5,
    },
    confidenceText: {
      fontSize: 12,
      fontWeight: '600',
      color: colors.white,
    },
    sheetCard: {
      backgroundColor: colors.surface,
      borderTopLeftRadius: 28,
      borderTopRightRadius: 28,
      marginTop: -22,
      paddingHorizontal: 20,
      paddingTop: 24,
      paddingBottom: 24,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: -4 },
      shadowOpacity: 0.08,
      shadowRadius: 10,
      elevation: 6,
    },
    titleRow: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      justifyContent: 'space-between',
      marginBottom: 12,
    },
    titleCol: {
      flex: 1,
      paddingRight: 12,
    },
    diseaseTitle: {
      fontSize: 22,
      fontWeight: '700',
      color: colors.text,
      letterSpacing: -0.3,
    },
    diseaseLatin: {
      fontSize: 13,
      fontStyle: 'italic',
      color: colors.textSecondary,
      marginTop: 2,
    },
    autoCropDetectedBadge: {
      flexDirection: 'row',
      alignItems: 'center',
      alignSelf: 'flex-start',
      gap: 5,
      backgroundColor: '#DCFCE7',
      paddingHorizontal: 8,
      paddingVertical: 3,
      borderRadius: 12,
      marginTop: 6,
      borderWidth: 1,
      borderColor: '#86EFAC',
    },
    autoCropDetectedText: {
      fontSize: 11.5,
      fontWeight: '700',
      color: '#15803D',
    },
    leafThumbnailBox: {
      width: 54,
      height: 54,
      borderRadius: 14,
      overflow: 'hidden',
      borderWidth: 1,
      borderColor: colors.border,
    },
    leafThumbnail: {
      width: '100%',
      height: '100%',
    },
    diseaseDescription: {
      fontSize: 14,
      color: colors.textSecondary,
      lineHeight: 21,
      marginBottom: 18,
    },
    segmentedTabRow: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: '#EFF3F0',
      borderRadius: 24,
      padding: 4,
      marginBottom: 20,
    },
    tabBtn: {
      flex: 1,
      paddingVertical: 8,
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: 20,
    },
    tabBtnActive: {
      backgroundColor: colors.primary,
    },
    tabBtnText: {
      fontSize: 13,
      fontWeight: '500',
      color: colors.textSecondary,
    },
    tabBtnTextActive: {
      color: colors.white,
      fontWeight: '600',
    },
    tabSectionContent: {
      marginBottom: 24,
    },
    contentSectionTitle: {
      fontSize: 16,
      fontWeight: '700',
      color: colors.text,
      marginBottom: 14,
    },
    checklist: {
      gap: 12,
    },
    checkItemRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
    },
    checkCircle: {
      width: 24,
      height: 24,
      borderRadius: 12,
      backgroundColor: colors.primarySoft,
      alignItems: 'center',
      justifyContent: 'center',
    },
    checkItemText: {
      flex: 1,
      fontSize: 14,
      color: colors.text,
      lineHeight: 20,
    },
    ctaButton: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: colors.primary,
      borderRadius: 24,
      height: 52,
      gap: 8,
      shadowColor: colors.primaryDark,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.2,
      shadowRadius: 10,
      elevation: 4,
    },
    ctaButtonPressed: {
      opacity: 0.92,
      transform: [{ scale: 0.985 }],
    },
    ctaButtonText: {
      fontSize: 15,
      fontWeight: '700',
      color: colors.white,
      letterSpacing: -0.2,
    },
    confidenceBadgeWarn: {
      backgroundColor: 'rgba(180, 83, 9, 0.85)',
      borderColor: 'rgba(253, 230, 138, 0.3)',
    },
    diseaseTitleWarn: {
      color: '#B45309',
    },
    notPlantContainer: {
      marginTop: 4,
    },
    notPlantAlertBox: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      gap: 12,
      backgroundColor: colors.warningSoft ?? '#FEF3C7',
      borderRadius: radii.card,
      padding: 14,
      marginBottom: 20,
      borderWidth: 1,
      borderColor: '#FDE68A',
    },
    notPlantAlertTitle: {
      fontSize: 14,
      fontWeight: '700',
      color: '#92400E',
      marginBottom: 4,
    },
    notPlantAlertText: {
      fontSize: 13,
      color: '#B45309',
      lineHeight: 18,
    },
    tipsSection: {
      marginBottom: 24,
    },
    actionButtonsCol: {
      gap: 12,
      marginTop: 8,
    },
    deleteRecordBtn: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: '#FEF2F2',
      borderWidth: 1.5,
      borderColor: '#FCA5A5',
      borderRadius: 24,
      height: 48,
      gap: 8,
    },
    deleteRecordBtnText: {
      fontSize: 14,
      fontWeight: '600',
      color: '#DC2626',
    },
    floatingDeleteBtn: {
      borderColor: 'rgba(239, 68, 68, 0.4)',
    },
    secondaryOutlineBtn: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: colors.surface,
      borderWidth: 1.5,
      borderColor: colors.border,
      borderRadius: 24,
      height: 50,
      gap: 8,
    },
    secondaryOutlineBtnText: {
      fontSize: 14,
      fontWeight: '600',
      color: colors.text,
    },
    qaSection: {
      marginBottom: 20,
      paddingTop: 14,
      borderTopWidth: 1,
      borderTopColor: colors.border,
    },
    qaHeaderRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
      marginBottom: 10,
    },
    qaSectionTitle: {
      fontSize: 13,
      fontWeight: '700',
      color: colors.text,
      letterSpacing: 0.2,
    },
    qaChipsRow: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 8,
    },
    qaChip: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
      paddingVertical: 7,
      paddingHorizontal: 12,
      borderRadius: 16,
      backgroundColor: colors.surfaceSubtle ?? '#F8FAF8',
      borderWidth: 1,
      borderColor: colors.border,
    },
    qaChipActive: {
      backgroundColor: colors.primarySoft,
      borderColor: colors.primary,
    },
    qaChipText: {
      fontSize: 12,
      fontWeight: '500',
      color: colors.textSecondary,
    },
    qaChipTextActive: {
      color: colors.primaryDark,
      fontWeight: '700',
    },
    qaAnswerCard: {
      marginTop: 10,
      padding: 12,
      backgroundColor: colors.primarySoft,
      borderRadius: radii.card,
      borderLeftWidth: 3,
      borderLeftColor: colors.primary,
    },
    qaAnswerText: {
      fontSize: 13,
      lineHeight: 19,
      color: colors.text,
    },
    xaiSummaryCard: {
      marginTop: 14,
      marginBottom: 10,
      padding: 12,
      backgroundColor: colors.surfaceSubtle ?? '#F8FAF8',
      borderRadius: radii.card,
      borderWidth: 1,
      borderColor: colors.border,
    },
    xaiSummaryHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: 6,
    },
    xaiSummaryTitleRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
    },
    xaiSummaryTitle: {
      fontSize: 13,
      fontWeight: '700',
      color: colors.text,
      letterSpacing: 0.1,
    },
    xaiSummaryCountBadge: {
      backgroundColor: colors.primarySoft,
      paddingHorizontal: 7,
      paddingVertical: 2,
      borderRadius: 10,
    },
    xaiSummaryCountText: {
      fontSize: 11,
      fontWeight: '700',
      color: colors.primaryDark,
    },
    xaiSummarySub: {
      fontSize: 11,
      color: colors.textSecondary,
      lineHeight: 15,
      marginBottom: 8,
    },
    xaiChipsList: {
      gap: 6,
    },
    xaiChipItem: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      backgroundColor: colors.surface,
      paddingHorizontal: 10,
      paddingVertical: 8,
      borderRadius: 10,
      borderWidth: 1.5,
      borderColor: colors.border,
      gap: 6,
    },
    xaiChipItemSelected: {
      borderColor: colors.primary,
      backgroundColor: colors.primarySoft,
    },
    xaiChipDot: {
      width: 9,
      height: 9,
      borderRadius: 4.5,
      marginTop: 3,
    },
    xaiChipLabel: {
      fontSize: 12.5,
      fontWeight: '700',
      color: colors.text,
      marginBottom: 2,
    },
    xaiChipLabelSelected: {
      color: colors.primaryDark,
      fontWeight: '800',
    },
    xaiChipDesc: {
      fontSize: 11,
      color: colors.textSecondary,
      flex: 1,
      marginLeft: 4,
    },
    xaiChipCoords: {
      fontSize: 11,
      color: colors.textSecondary,
      marginLeft: 4,
    },
    floatingCircleBtnActive: {
      backgroundColor: '#DC2626',
    },
    diffContainer: {
      marginBottom: 16,
      padding: 12,
      backgroundColor: colors.surfaceSubtle ?? '#F8FAF8',
      borderRadius: radii.card,
      borderWidth: 1,
      borderColor: colors.border,
    },
    diffHeader: {
      fontSize: 13,
      fontWeight: '700',
      color: colors.text,
      marginBottom: 8,
    },
    diffRow: {
      marginBottom: 8,
    },
    diffTextRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginBottom: 3,
    },
    diffName: {
      fontSize: 12,
      color: colors.text,
      fontWeight: '500',
    },
    diffScore: {
      fontSize: 12,
      fontWeight: '700',
      color: colors.textSecondary,
    },
    diffTrack: {
      height: 6,
      backgroundColor: colors.border,
      borderRadius: 3,
      overflow: 'hidden',
    },
    diffFill: {
      height: 6,
      borderRadius: 3,
    },
    actBtn: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: colors.surface,
      borderWidth: 1.5,
      borderColor: colors.primary,
      borderRadius: 24,
      height: 50,
      gap: 8,
    },
    actBtnText: {
      fontSize: 14,
      fontWeight: '600',
      color: colors.primaryDark,
    },
    pvCard: {
      backgroundColor: colors.surfaceSubtle ?? '#F8FAF8',
      borderRadius: radii.card,
      borderWidth: 1.5,
      borderColor: '#BBEFCA',
      padding: 14,
      marginBottom: 16,
    },
    pvHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 10,
      marginBottom: 12,
    },
    pvIconBadge: {
      width: 32,
      height: 32,
      borderRadius: 16,
      backgroundColor: '#E8F5E9',
      alignItems: 'center',
      justifyContent: 'center',
    },
    pvCardTitle: {
      fontSize: 13,
      fontWeight: '700',
      color: colors.text,
      letterSpacing: 0.1,
    },
    pvCardSubtitle: {
      fontSize: 11,
      color: colors.textSecondary,
      marginTop: 2,
    },
    pvCompareRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: 8,
      marginVertical: 8,
    },
    pvCompareCol: {
      flex: 1,
      alignItems: 'center',
    },
    pvCompareLabel: {
      fontSize: 11,
      fontWeight: '600',
      color: colors.textSecondary,
      marginBottom: 6,
    },
    pvImageFrame: {
      width: '100%',
      height: 100,
      borderRadius: radii.sm ?? 8,
      overflow: 'hidden',
      backgroundColor: '#1E2C22',
      borderWidth: 1.5,
      borderColor: colors.border,
    },
    pvThumbImage: {
      width: '100%',
      height: '100%',
      resizeMode: 'cover',
    },
    pvCompareCenterDivider: {
      alignItems: 'center',
      justifyContent: 'center',
      width: 60,
    },
    pvMatchBadge: {
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: '#E8F5E9',
      paddingHorizontal: 6,
      paddingVertical: 4,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: '#BBEFCA',
    },
    pvMatchPercent: {
      fontSize: 13,
      fontWeight: '800',
      color: '#15803D',
      marginTop: 2,
    },
    pvMatchText: {
      fontSize: 9,
      color: '#15803D',
      fontWeight: '600',
    },
    pvClassMetaBox: {
      backgroundColor: colors.surface,
      borderRadius: 8,
      padding: 10,
      marginVertical: 8,
      borderWidth: 1,
      borderColor: colors.border,
    },
    pvClassRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 4,
    },
    pvClassKeyText: {
      fontSize: 11,
      fontWeight: '700',
      color: '#15803D',
      fontFamily: 'monospace',
      flex: 1,
    },
    pvClassLatinText: {
      fontSize: 11,
      fontStyle: 'italic',
      color: colors.textSecondary,
      marginLeft: 6,
    },
    pvVerifiedNote: {
      fontSize: 11,
      color: colors.textSecondary,
      lineHeight: 15,
    },
    pvGithubBtn: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 6,
      paddingVertical: 8,
      borderRadius: 8,
      backgroundColor: '#E8F5E9',
      borderWidth: 1,
      borderColor: '#BBEFCA',
      marginTop: 4,
    },
    pvGithubBtnText: {
      fontSize: 12,
      fontWeight: '600',
      color: '#15803D',
    },
  });
