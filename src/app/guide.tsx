import * as ImagePicker from 'expo-image-picker';
import { useRouter } from 'expo-router';
import {
  ChevronLeft,
  ChevronRight,
  BookOpen,
  Leaf,
  Sprout,
  Sparkles,
  X,
  Check,
  AlertTriangle,
  AlertCircle,
  Lightbulb,
  Focus,
  Scan,
  Sun,
  Camera,
  Image as ImageIcon,
  XCircle,
} from 'lucide-react-native';
import React, { useState } from 'react';
import {
  Alert,
  Image,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { AppScreen } from '../components/ui/AppScreen';
import { ASSETS } from '../constants/assets';
import { useSettings } from '../features/settings/SettingsContext';
import { useTheme, useStyles } from '../theme';
import { safeBack } from '../utils/navigation';

export default function GuideScreen() {
  const router = useRouter();
  const { colors } = useTheme();
  const styles = useStyles(createStyles);
  const { language } = useSettings();

  // Section 1: Page 0 = 1/3, Column 1 = "Идеально" (active with emerald border)
  const [section1Page, setSection1Page] = useState<number>(0);
  const [selectedColIndex, setSelectedColIndex] = useState<number>(1);

  // Section 2: Page 3 = "4/4"
  const [featurePage, setFeaturePage] = useState<number>(3);
  const [showTipsModal, setShowTipsModal] = useState<boolean>(false);

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
          params: {
            uri: result.assets[0].uri,
            isCustom: 'true',
          },
        });
      }
    } catch {
      Alert.alert(
        language === 'kk'
          ? 'Қате'
          : language === 'en'
          ? 'Error'
          : 'Ошибка',
        language === 'kk'
          ? 'Галереяны ашу мүмкін болмады'
          : language === 'en'
          ? 'Could not open gallery'
          : 'Не удалось открыть галерею'
      );
    }
  };

  const handleUseSample = () => {
    try {
      const resolved = Image.resolveAssetSource(ASSETS.guide.good);
      const sampleUri = resolved?.uri || '';
      router.push({
        pathname: '/preview',
        params: {
          uri: sampleUri,
          isCustom: 'false',
          cropId: 'tomato',
        },
      });
    } catch {
      Alert.alert(
        language === 'kk'
          ? 'Қате'
          : language === 'en'
          ? 'Error'
          : 'Ошибка',
        language === 'kk'
          ? 'Үлгіні ашу мүмкін болмады'
          : language === 'en'
          ? 'Could not load sample'
          : 'Не удалось открыть пример'
      );
    }
  };

  const handleTakePhoto = () => {
    router.push('/camera');
  };

  const nextCol = () => {
    setSection1Page((prev) => (prev + 1) % 3);
    setSelectedColIndex((prev) => (prev + 1) % 3);
  };

  const prevCol = () => {
    setSection1Page((prev) => (prev - 1 + 3) % 3);
    setSelectedColIndex((prev) => (prev - 1 + 3) % 3);
  };

  const nextFeature = () => {
    setFeaturePage((prev) => (prev + 1) % 4);
  };

  const prevFeature = () => {
    setFeaturePage((prev) => (prev - 1 + 4) % 4);
  };

  const rules = [
    {
      icon: Sun,
      titleRu: 'Мягкий естественный свет',
      titleKk: 'Жұмсақ табиғи жарық',
      titleEn: 'Soft Natural Lighting',
      descRu:
        'Снимайте днем без прямых слепящих солнечных бликов и глубоких черных теней. Избегайте резкой вспышки в упор.',
      descKk:
        'Тікелей күн сәулесі мен қалың көлеңкесіз күндіз түсіріңіз. Жарқылды (вспышка) жақыннан қолданбаңыз.',
      descEn:
        'Shoot in diffuse daylight without harsh blinding glare or deep shadows. Avoid direct harsh flash.',
    },
    {
      icon: Focus,
      titleRu: 'Четкая фокусировка на симптоме',
      titleKk: 'Ауру белгісіне нақты фокус',
      titleEn: 'Sharp Focus on Disease Lesion',
      descRu:
        'Перед съемкой коснитесь экрана смартфона в месте пятна, налета или увядания, чтобы навести фокус.',
      descKk:
        'Түсіру алдында телефон экранындағы дақ немесе зақымдалған жерге басып, камераның фокусын реттеңіз.',
      descEn:
        'Tap your smartphone screen right on the lesion, spot, or mold to lock crisp camera focus.',
    },
    {
      icon: Scan,
      titleRu: 'Лист крупным планом (70–85%)',
      titleKk: 'Жапырақ ірі планда (70–85%)',
      titleEn: 'Fill 70–85% of the Frame',
      descRu:
        'Лист должен занимать большую часть видоискателя. Убирайте из кадра землю, обувь, пальцы и посторонние сорняки.',
      descKk:
        'Жапырақ экранның негізгі бөлігін алуы тиіс. Кадрдан топырақты, аяқ киімді және бөтен шөптерді алып тастаңыз.',
      descEn:
        'The leaf blade should occupy most of the frame. Keep hands, shoes, bare soil, and greenhouse pipes out.',
    },
    {
      icon: Leaf,
      titleRu: 'Осмотр обеих сторон листа',
      titleKk: 'Жапырақтың екі жағын қарау',
      titleEn: 'Inspect Both Leaf Surfaces',
      descRu:
        'Многие болезни (ложная мучнистая роса, паутинный клещ, тля) локализуются на нижней стороне листовой пластины.',
      descKk:
        'Көптеген аурулар (жалған ұнтақты шық, кенелер, тли) жапырақтың астыңғы бетінде көбейеді.',
      descEn:
        'Many pathogens and pests (downy mildew, spider mites, aphids) colonize the lower leaf surface first.',
    },
  ];

  return (
    <AppScreen padded={false} scroll={false}>
      {/* Background Decorative Foliage in Top Right Corner */}
      <View pointerEvents="none" style={styles.topRightFoliageWrapper}>
        <Image
          source={ASSETS.guide.foliage}
          style={styles.topRightFoliage}
          resizeMode="contain"
        />
      </View>

      {/* 1. Header Bar */}
      <View style={styles.headerBar}>
        <Pressable
          onPress={() => safeBack(router, '/(tabs)')}
          style={styles.backButton}
          hitSlop={8}
          accessibilityLabel="Назад"
          accessibilityRole="button">
          <ChevronLeft size={22} color="#111827" strokeWidth={2.4} />
        </Pressable>

        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle} numberOfLines={1}>
            {language === 'kk'
              ? 'Қалай суретке түсіру керек'
              : language === 'en'
              ? 'Photography Guide'
              : 'Как фотографировать'}
          </Text>
          <Text style={styles.headerSubtitle} numberOfLines={2}>
            {language === 'kk'
              ? 'Дұрыс түсіріңіз — нақты нәтиже алыңыз'
              : language === 'en'
              ? 'Shoot properly — get accurate results'
              : 'Снимайте правильно — получайте\nточные результаты'}
          </Text>
        </View>

        <TouchableOpacity
          onPress={() => setShowTipsModal(true)}
          style={styles.headerTipsButton}
          activeOpacity={0.85}>
          <BookOpen size={16} color="#1F2937" strokeWidth={2.2} />
          <Text style={styles.headerTipsText}>
            {language === 'kk'
              ? 'Кеңестер'
              : language === 'en'
              ? 'Tips'
              : 'Советы'}
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}>
        {/* 2. Top Advice Banner */}
        <TouchableOpacity
          onPress={() => setShowTipsModal(true)}
          activeOpacity={0.88}
          style={styles.topBanner}>
          <View style={styles.bannerIconSquare}>
            <Leaf size={22} color="#15803D" strokeWidth={2.2} />
          </View>
          <View style={styles.bannerTextContainer}>
            <Text style={styles.bannerTitle}>
              {language === 'kk'
                ? 'Фото сапасы AI дәлдігіне тікелей әсер етеді.'
                : language === 'en'
                ? 'Photo quality directly affects AI accuracy.'
                : 'Качество фото напрямую влияет на точность AI.'}
            </Text>
            <Text style={styles.bannerSubtitle}>
              {language === 'kk'
                ? 'Жақсы түсірілім жасауды түсіну үшін төмендегі мысалдарды қараңыз.'
                : language === 'en'
                ? 'See examples below to understand how to take great photos.'
                : 'Посмотрите примеры ниже, чтобы понять, как делать хорошие снимки.'}
            </Text>
          </View>
          <ChevronRight size={18} color="#4B5563" strokeWidth={2.2} />
        </TouchableOpacity>

        {/* 3. Card 1: "Сравнение одного листа в 1 фото" */}
        <View style={styles.sectionCard}>
          {/* Card Header Row */}
          <View style={styles.sectionHeaderRow}>
            <Sparkles size={20} color="#15803D" strokeWidth={2.4} />
            <View style={styles.sectionHeaderTextCol}>
              <Text style={styles.sectionTitle}>
                {language === 'kk'
                  ? 'Бір жапырақты 1 фотода салыстыру'
                  : language === 'en'
                  ? 'Comparing One Leaf in 1 Shot'
                  : 'Сравнение одного листа в 1 фото'}
              </Text>
              <Text style={styles.sectionSubtitle}>
                {language === 'kk'
                  ? 'Қашықтық, фокус және композиция нәтижеге қалай әсер етеді'
                  : language === 'en'
                  ? 'How distance, focus, and framing impact results'
                  : 'Как расстояние, фокус и композиция влияют на результат'}
              </Text>
            </View>
            {/* Pagination controls top right: < 1/3 > */}
            <View style={styles.paginationRow}>
              <TouchableOpacity
                onPress={prevCol}
                hitSlop={8}
                style={styles.pageArrowButton}>
                <ChevronLeft size={16} color="#4B5563" strokeWidth={2.2} />
              </TouchableOpacity>
              <Text style={styles.paginationCounter}>
                {`${section1Page + 1}/3`}
              </Text>
              <TouchableOpacity
                onPress={nextCol}
                hitSlop={8}
                style={styles.pageArrowButton}>
                <ChevronRight size={16} color="#111827" strokeWidth={2.2} />
              </TouchableOpacity>
            </View>
          </View>

          {/* 3 Columns Side-by-Side */}
          <View style={styles.columnsRow}>
            {/* Column 1: Слишком далеко */}
            <TouchableOpacity
              activeOpacity={0.9}
              onPress={() => {
                setSelectedColIndex(0);
                setSection1Page(0);
              }}
              style={[
                styles.columnCard,
                selectedColIndex === 0 && styles.columnCardActiveRed,
              ]}>
              <View style={styles.columnImageWrapper}>
                <Image
                  source={ASSETS.guide.badFar}
                  style={styles.columnImage}
                  resizeMode="cover"
                />
                {/* Red Corner Reticles */}
                <View style={[styles.reticleCorner, styles.reticleTL, { borderColor: '#EF4444' }]} />
                <View style={[styles.reticleCorner, styles.reticleTR, { borderColor: '#EF4444' }]} />
                <View style={[styles.reticleCorner, styles.reticleBL, { borderColor: '#EF4444' }]} />
                <View style={[styles.reticleCorner, styles.reticleBR, { borderColor: '#EF4444' }]} />

                {/* Red Leaf Target Box */}
                <View style={styles.reticleTargetBoxFar} />

                {/* Top-Right Red Circle with X */}
                <View style={styles.roundBadgeRed}>
                  <X size={12} color="#FFFFFF" strokeWidth={3} />
                </View>
              </View>

              {/* Bottom Info Section */}
              <View style={[styles.columnInfo, { backgroundColor: '#FFF2F3' }]}>
                <View style={styles.pillBadgeRed}>
                  <XCircle size={10} color="#DC2626" strokeWidth={2.5} />
                  <Text style={styles.pillTextRed}>
                    {language === 'kk'
                      ? 'Тым алыс'
                      : language === 'en'
                      ? 'Too far'
                      : 'Слишком далеко'}
                  </Text>
                </View>
                <Text style={styles.columnStat}>
                  {language === 'kk'
                    ? '< 20% кадр'
                    : language === 'en'
                    ? '< 20% frame'
                    : '< 20% кадра'}
                </Text>
                <Text style={styles.columnDesc}>
                  {language === 'kk'
                    ? 'Өсімдік тым аз\nорын алады'
                    : language === 'en'
                    ? 'Plant takes up\ntoo little frame'
                    : 'Растение занимает\nслишком мало места'}
                </Text>
              </View>
            </TouchableOpacity>

            {/* Column 2: Идеально */}
            <TouchableOpacity
              activeOpacity={0.9}
              onPress={() => {
                setSelectedColIndex(1);
                setSection1Page(1);
              }}
              style={[
                styles.columnCard,
                selectedColIndex === 1 && styles.columnCardActiveGreen,
              ]}>
              <View style={styles.columnImageWrapper}>
                <Image
                  source={ASSETS.guide.good}
                  style={styles.columnImage}
                  resizeMode="cover"
                />
                {/* Green Corner Reticles */}
                <View style={[styles.reticleCorner, styles.reticleTL, { borderColor: '#10B981' }]} />
                <View style={[styles.reticleCorner, styles.reticleTR, { borderColor: '#10B981' }]} />
                <View style={[styles.reticleCorner, styles.reticleBL, { borderColor: '#10B981' }]} />
                <View style={[styles.reticleCorner, styles.reticleBR, { borderColor: '#10B981' }]} />

                {/* Central Green Focus Box */}
                <View style={styles.reticleFocusBoxGreen} />

                {/* Top-Right Green Circle with Check */}
                <View style={styles.roundBadgeGreen}>
                  <Check size={12} color="#FFFFFF" strokeWidth={3} />
                </View>
              </View>

              {/* Bottom Info Section */}
              <View style={[styles.columnInfo, { backgroundColor: '#EDFAF1' }]}>
                <View style={styles.pillBadgeGreen}>
                  <Check size={10} color="#10B981" strokeWidth={3} />
                  <Text style={styles.pillTextGreen}>
                    {language === 'kk'
                      ? 'Керемет'
                      : language === 'en'
                      ? 'Ideal'
                      : 'Идеально'}
                  </Text>
                </View>
                <Text style={styles.columnStat}>
                  {language === 'kk'
                    ? '~ 80% кадр'
                    : language === 'en'
                    ? '~ 80% frame'
                    : '~ 80% кадра'}
                </Text>
                <Text style={styles.columnDesc}>
                  {language === 'kk'
                    ? 'Жапырақ ірі, жақсы\nфокус, жарық жеткілікті'
                    : language === 'en'
                    ? 'Large leaf, sharp\nfocus, good light'
                    : 'Лист крупно, хороший\nфокус, достаточно света'}
                </Text>
              </View>
            </TouchableOpacity>

            {/* Column 3: Размыто */}
            <TouchableOpacity
              activeOpacity={0.9}
              onPress={() => {
                setSelectedColIndex(2);
                setSection1Page(2);
              }}
              style={[
                styles.columnCard,
                selectedColIndex === 2 && styles.columnCardActiveAmber,
              ]}>
              <View style={styles.columnImageWrapper}>
                <Image
                  source={ASSETS.guide.badBlurry}
                  style={styles.columnImage}
                  resizeMode="cover"
                />
                {/* Amber Corner Reticles */}
                <View style={[styles.reticleCorner, styles.reticleTL, { borderColor: '#F59E0B' }]} />
                <View style={[styles.reticleCorner, styles.reticleTR, { borderColor: '#F59E0B' }]} />
                <View style={[styles.reticleCorner, styles.reticleBL, { borderColor: '#F59E0B' }]} />
                <View style={[styles.reticleCorner, styles.reticleBR, { borderColor: '#F59E0B' }]} />

                {/* Amber Focus Box with Diagonal Slash */}
                <View style={styles.reticleSlashBoxAmber}>
                  <View style={styles.diagonalLine} />
                </View>

                {/* Top-Right Amber Circle with ! */}
                <View style={styles.roundBadgeAmber}>
                  <AlertCircle size={13} color="#FFFFFF" strokeWidth={2.8} />
                </View>
              </View>

              {/* Bottom Info Section */}
              <View style={[styles.columnInfo, { backgroundColor: '#FFFDF5' }]}>
                <View style={styles.pillBadgeAmber}>
                  <AlertTriangle size={10} color="#D97706" strokeWidth={2.5} />
                  <Text style={styles.pillTextAmber}>
                    {language === 'kk'
                      ? 'Бұлдыр'
                      : language === 'en'
                      ? 'Blurry'
                      : 'Размыто'}
                  </Text>
                </View>
                <Text style={styles.columnStat}>
                  {language === 'kk'
                    ? 'Қол дірілі'
                    : language === 'en'
                    ? 'Camera shake'
                    : 'Смаз от рук'}
                </Text>
                <Text style={styles.columnDesc}>
                  {language === 'kk'
                    ? 'Бөлшектер жоғалған,\nтану қиын'
                    : language === 'en'
                    ? 'Details lost,\nhard to recognize'
                    : 'Потеряны детали,\nтрудно распознать'}
                </Text>
              </View>
            </TouchableOpacity>
          </View>

          {/* 3 Pagination Dots below columns */}
          <View style={styles.dotsRow}>
            <View
              style={[
                styles.dot,
                section1Page === 0 ? styles.dotActive : styles.dotInactive,
              ]}
            />
            <View
              style={[
                styles.dot,
                section1Page === 1 ? styles.dotActive : styles.dotInactive,
              ]}
            />
            <View
              style={[
                styles.dot,
                section1Page === 2 ? styles.dotActive : styles.dotInactive,
              ]}
            />
          </View>
        </View>

        {/* 4. Card 2: "На что обратить внимание" */}
        <View style={styles.sectionCard}>
          {/* Card Header Row */}
          <View style={styles.sectionHeaderRow}>
            <Lightbulb size={20} color="#15803D" strokeWidth={2.2} />
            <View style={styles.sectionHeaderTextCol}>
              <Text style={styles.sectionTitle}>
                {language === 'kk'
                  ? 'Нәрсеге назар аудару керек'
                  : language === 'en'
                  ? 'What to Pay Attention To'
                  : 'На что обратить внимание'}
              </Text>
            </View>
            {/* Pagination counter: < 4/4 > */}
            <View style={styles.paginationRow}>
              <TouchableOpacity
                onPress={prevFeature}
                hitSlop={8}
                style={styles.pageArrowButton}>
                <ChevronLeft size={16} color="#4B5563" strokeWidth={2.2} />
              </TouchableOpacity>
              <Text style={styles.paginationCounter}>
                {`${featurePage + 1}/4`}
              </Text>
              <TouchableOpacity
                onPress={nextFeature}
                hitSlop={8}
                style={styles.pageArrowButton}>
                <ChevronRight size={16} color="#111827" strokeWidth={2.2} />
              </TouchableOpacity>
            </View>
          </View>

          {/* 4 Feature Cards Row */}
          <View style={styles.featureCardsRow}>
            {/* Feature 1: Один лист в кадре */}
            <TouchableOpacity
              activeOpacity={0.85}
              onPress={() => setFeaturePage(0)}
              style={styles.featureCard}>
              <View style={styles.featureIconBox}>
                <Leaf size={19} color="#15803D" strokeWidth={2.2} />
              </View>
              <Text style={styles.featureLabel}>
                {language === 'kk'
                  ? 'Кадрда бір\nжапырақ'
                  : language === 'en'
                  ? 'Single leaf\nin frame'
                  : 'Один лист\nв кадре'}
              </Text>
            </TouchableOpacity>

            {/* Feature 2: Хороший фокус */}
            <TouchableOpacity
              activeOpacity={0.85}
              onPress={() => setFeaturePage(1)}
              style={styles.featureCard}>
              <View style={styles.featureIconBox}>
                <Focus size={19} color="#15803D" strokeWidth={2.2} />
              </View>
              <Text style={styles.featureLabel}>
                {language === 'kk'
                  ? 'Жақсы\nфокус'
                  : language === 'en'
                  ? 'Sharp\nfocus'
                  : 'Хороший\nфокус'}
              </Text>
            </TouchableOpacity>

            {/* Feature 3: Достаточно света */}
            <TouchableOpacity
              activeOpacity={0.85}
              onPress={() => setFeaturePage(2)}
              style={styles.featureCard}>
              <View style={styles.featureIconBox}>
                <Sun size={19} color="#15803D" strokeWidth={2.2} />
              </View>
              <Text style={styles.featureLabel}>
                {language === 'kk'
                  ? 'Жарық\nжеткілікті'
                  : language === 'en'
                  ? 'Sufficient\nlight'
                  : 'Достаточно\nсвета'}
              </Text>
            </TouchableOpacity>

            {/* Feature 4: Лист занимает большую часть кадра */}
            <TouchableOpacity
              activeOpacity={0.85}
              onPress={() => setFeaturePage(3)}
              style={styles.featureCard}>
              <View style={styles.featureIconBox}>
                <Scan size={19} color="#15803D" strokeWidth={2.2} />
              </View>
              <Text style={styles.featureLabelSmall}>
                {language === 'kk'
                  ? 'Жапырақ кадрдың\nкөп бөлігін\nалады'
                  : language === 'en'
                  ? 'Leaf fills\nmost of the\nframe'
                  : 'Лист занимает\nбольшую часть\nкадра'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* 5. Card 3: "Не уверены?" Dark Forest Green Banner */}
        <TouchableOpacity
          activeOpacity={0.92}
          onPress={handleTakePhoto}
          style={styles.notSureBanner}>
          {/* Overlapping Polaroid-like Leaf Photos */}
          <View style={styles.polaroidContainer}>
            {/* Photo 1 (Left tilted) */}
            <View style={styles.polaroidLeft}>
              <Image
                source={ASSETS.guide.good}
                style={styles.polaroidImage}
                resizeMode="cover"
              />
              <View style={styles.polaroidReticleCyan} />
            </View>
            {/* Photo 2 (Right tilted) */}
            <View style={styles.polaroidRight}>
              <Image
                source={ASSETS.guide.good}
                style={styles.polaroidImage}
                resizeMode="cover"
              />
              <View style={styles.polaroidReticleGreen} />
            </View>
          </View>

          {/* Banner Text Center */}
          <View style={styles.notSureTextCol}>
            <Text style={styles.notSureTitle}>
              {language === 'kk'
                ? 'Сенімді емессіз бе?'
                : language === 'en'
                ? 'Not sure?'
                : 'Не уверены?'}
            </Text>
            <Text style={styles.notSureSubtitle}>
              {language === 'kk'
                ? 'Әр түрлі қашықтықтан бірнеше кадр түсіріңіз — AI ең жақсысын таңдайды.'
                : language === 'en'
                ? 'Take multiple shots from different distances — AI will choose the best.'
                : 'Сделайте несколько кадров с разных расстояний — AI выберет лучший.'}
            </Text>
          </View>

          {/* Right Chevron Circle */}
          <View style={styles.notSureArrowCircle}>
            <ChevronRight size={18} color="#FFFFFF" strokeWidth={2.4} />
          </View>
        </TouchableOpacity>

        {/* 6. Main Action Button: Сделать фото */}
        <TouchableOpacity
          activeOpacity={0.88}
          onPress={handleTakePhoto}
          style={styles.primaryActionButton}>
          <Camera size={20} color="#FFFFFF" strokeWidth={2.2} />
          <Text style={styles.primaryActionButtonText}>
            {language === 'kk'
              ? 'Суретке түсіру'
              : language === 'en'
              ? 'Take photo'
              : 'Сделать фото'}
          </Text>
        </TouchableOpacity>

        {/* 7. Row of Two Secondary Buttons */}
        <View style={styles.secondaryButtonsRow}>
          {/* Button 1: Выбрать из галереи */}
          <TouchableOpacity
            activeOpacity={0.88}
            onPress={handlePickFromGallery}
            style={styles.secondaryActionButton}>
            <ImageIcon size={18} color="#114434" strokeWidth={2.2} />
            <Text style={styles.secondaryActionButtonText}>
              {language === 'kk'
                ? 'Галереядан таңдау'
                : language === 'en'
                ? 'Choose from gallery'
                : 'Выбрать из галереи'}
            </Text>
          </TouchableOpacity>

          {/* Button 2: Использовать пример */}
          <TouchableOpacity
            activeOpacity={0.88}
            onPress={handleUseSample}
            style={styles.secondaryActionButton}>
            <Sparkles size={18} color="#114434" strokeWidth={2.2} />
            <Text style={styles.secondaryActionButtonText}>
              {language === 'kk'
                ? 'Мысалды қолдану'
                : language === 'en'
                ? 'Use sample'
                : 'Использовать пример'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* 8. Bottom Quote Pill */}
        <View style={styles.bottomQuotePill}>
          <Sprout size={16} color="#2D6A4F" strokeWidth={2.2} />
          <Text style={styles.bottomQuoteText}>
            {language === 'kk'
              ? 'Жақсы сурет — сау өсімдіктерге алғашқы қадам'
              : language === 'en'
              ? 'A good photo is the first step to healthy crops'
              : 'Хорошее фото — первый шаг к здоровым растениям'}
          </Text>
          <Leaf size={15} color="#2D6A4F" strokeWidth={2.2} />
        </View>
      </ScrollView>

      {/* 9. Agronomist Field Rules Modal */}
      <Modal
        visible={showTipsModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowTipsModal(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                {language === 'kk'
                  ? 'Агрономның алтын ережелері'
                  : language === 'en'
                  ? 'Agronomist Field Rules'
                  : 'Правила съемки для агронома'}
              </Text>
              <TouchableOpacity
                onPress={() => setShowTipsModal(false)}
                hitSlop={8}
                style={styles.modalCloseButton}>
                <X size={20} color="#4B5563" strokeWidth={2.2} />
              </TouchableOpacity>
            </View>

            <ScrollView
              style={styles.modalScroll}
              showsVerticalScrollIndicator={false}>
              {rules.map((rule, idx) => {
                const RuleIcon = rule.icon;
                const title =
                  language === 'kk'
                    ? rule.titleKk
                    : language === 'en'
                    ? rule.titleEn
                    : rule.titleRu;
                const desc =
                  language === 'kk'
                    ? rule.descKk
                    : language === 'en'
                    ? rule.descEn
                    : rule.descRu;

                return (
                  <View key={idx} style={styles.modalRuleCard}>
                    <View style={styles.modalRuleIconCircle}>
                      <RuleIcon size={18} color="#15803D" strokeWidth={2.2} />
                    </View>
                    <View style={styles.modalRuleTextCol}>
                      <Text style={styles.modalRuleTitle}>{title}</Text>
                      <Text style={styles.modalRuleDesc}>{desc}</Text>
                    </View>
                  </View>
                );
              })}
            </ScrollView>

            <TouchableOpacity
              onPress={() => setShowTipsModal(false)}
              style={styles.modalDismissButton}>
              <Text style={styles.modalDismissButtonText}>
                {language === 'kk'
                  ? 'Түсінікті'
                  : language === 'en'
                  ? 'Got it'
                  : 'Понятно'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </AppScreen>
  );
}

const createStyles = ({ colors, spacing }: any) =>
  StyleSheet.create({
    topRightFoliageWrapper: {
      position: 'absolute',
      top: 0,
      right: 0,
      width: 180,
      height: 120,
      overflow: 'hidden',
      zIndex: 0,
    },
    topRightFoliage: {
      width: '100%',
      height: '100%',
      opacity: 0.85,
    },
    headerBar: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: spacing.md,
      paddingTop: spacing.xs,
      paddingBottom: spacing.xs,
      gap: 10,
      maxWidth: 540,
      width: '100%',
      alignSelf: 'center',
    },
    backButton: {
      width: 42,
      height: 42,
      borderRadius: 14,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: '#FFFFFF',
      borderWidth: 1,
      borderColor: '#E5E7EB',
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.05,
      shadowRadius: 2,
      elevation: 1,
    },
    headerCenter: {
      flex: 1,
    },
    headerTitle: {
      fontSize: 18,
      fontWeight: '800',
      color: '#111827',
      letterSpacing: -0.3,
    },
    headerSubtitle: {
      fontSize: 11.5,
      color: '#6B7280',
      marginTop: 1,
      lineHeight: 15,
    },
    headerTipsButton: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
      backgroundColor: '#FFFFFF',
      borderWidth: 1,
      borderColor: '#E5E7EB',
      paddingHorizontal: 13,
      paddingVertical: 8,
      borderRadius: 20,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.04,
      shadowRadius: 2,
      elevation: 1,
    },
    headerTipsText: {
      fontSize: 12.5,
      fontWeight: '700',
      color: '#1F2937',
    },
    scrollContent: {
      paddingHorizontal: spacing.md,
      paddingTop: spacing.xs,
      paddingBottom: spacing.xxl,
      maxWidth: 540,
      width: '100%',
      alignSelf: 'center',
    },
    topBanner: {
      backgroundColor: '#E8F5EB',
      borderWidth: 1,
      borderColor: '#D2EADA',
      borderRadius: 20,
      padding: 12,
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 14,
    },
    bannerIconSquare: {
      width: 44,
      height: 44,
      borderRadius: 14,
      backgroundColor: '#D1EBD9',
      alignItems: 'center',
      justifyContent: 'center',
    },
    bannerTextContainer: {
      flex: 1,
      marginLeft: 12,
      marginRight: 6,
    },
    bannerTitle: {
      fontSize: 13.5,
      fontWeight: '800',
      color: '#111827',
      lineHeight: 17,
    },
    bannerSubtitle: {
      fontSize: 11,
      color: '#6B7280',
      lineHeight: 15,
      marginTop: 2,
    },
    sectionCard: {
      backgroundColor: '#FFFFFF',
      borderRadius: 24,
      borderWidth: 1,
      borderColor: '#E6ECE8',
      padding: 16,
      marginBottom: 14,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.03,
      shadowRadius: 4,
      elevation: 1,
    },
    sectionHeaderRow: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 14,
    },
    sectionHeaderTextCol: {
      flex: 1,
      marginLeft: 8,
      marginRight: 8,
    },
    sectionTitle: {
      fontSize: 15.5,
      fontWeight: '800',
      color: '#111827',
      letterSpacing: -0.2,
    },
    sectionSubtitle: {
      fontSize: 11.5,
      color: '#6B7280',
      marginTop: 2,
    },
    paginationRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 5,
    },
    pageArrowButton: {
      padding: 3,
    },
    paginationCounter: {
      fontSize: 12,
      fontWeight: '600',
      color: '#4B5563',
    },
    columnsRow: {
      flexDirection: 'row',
      gap: 8,
    },
    columnCard: {
      flex: 1,
      borderRadius: 16,
      borderWidth: 1.5,
      borderColor: '#E5E7EB',
      backgroundColor: '#FFFFFF',
      overflow: 'hidden',
    },
    columnCardActiveRed: {
      borderWidth: 2,
      borderColor: '#EF4444',
    },
    columnCardActiveGreen: {
      borderWidth: 2,
      borderColor: '#10B981',
    },
    columnCardActiveAmber: {
      borderWidth: 2,
      borderColor: '#F59E0B',
    },
    columnImageWrapper: {
      width: '100%',
      height: 135,
      backgroundColor: '#1E2522',
      position: 'relative',
    },
    columnImage: {
      width: '100%',
      height: '100%',
    },
    reticleCorner: {
      position: 'absolute',
      width: 12,
      height: 12,
    },
    reticleTL: {
      top: 6,
      left: 6,
      borderTopWidth: 2,
      borderLeftWidth: 2,
    },
    reticleTR: {
      top: 6,
      right: 6,
      borderTopWidth: 2,
      borderRightWidth: 2,
    },
    reticleBL: {
      bottom: 6,
      left: 6,
      borderBottomWidth: 2,
      borderLeftWidth: 2,
    },
    reticleBR: {
      bottom: 6,
      right: 6,
      borderBottomWidth: 2,
      borderRightWidth: 2,
    },
    reticleTargetBoxFar: {
      position: 'absolute',
      bottom: 12,
      left: 10,
      width: 30,
      height: 30,
      borderWidth: 1.5,
      borderColor: '#EF4444',
    },
    reticleFocusBoxGreen: {
      position: 'absolute',
      top: '50%',
      left: '50%',
      width: 34,
      height: 34,
      marginTop: -17,
      marginLeft: -17,
      borderWidth: 1.5,
      borderColor: '#10B981',
    },
    reticleSlashBoxAmber: {
      position: 'absolute',
      top: '50%',
      left: '50%',
      width: 34,
      height: 34,
      marginTop: -17,
      marginLeft: -17,
      borderWidth: 1.5,
      borderColor: '#F59E0B',
      justifyContent: 'center',
      alignItems: 'center',
    },
    diagonalLine: {
      width: 30,
      height: 1.5,
      backgroundColor: '#F59E0B',
      transform: [{ rotate: '45deg' }],
    },
    roundBadgeRed: {
      position: 'absolute',
      top: 6,
      right: 6,
      width: 22,
      height: 22,
      borderRadius: 11,
      backgroundColor: '#EF4444',
      alignItems: 'center',
      justifyContent: 'center',
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.2,
      shadowRadius: 2,
      elevation: 2,
    },
    roundBadgeGreen: {
      position: 'absolute',
      top: 6,
      right: 6,
      width: 22,
      height: 22,
      borderRadius: 11,
      backgroundColor: '#10B981',
      alignItems: 'center',
      justifyContent: 'center',
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.2,
      shadowRadius: 2,
      elevation: 2,
    },
    roundBadgeAmber: {
      position: 'absolute',
      top: 6,
      right: 6,
      width: 22,
      height: 22,
      borderRadius: 11,
      backgroundColor: '#F59E0B',
      alignItems: 'center',
      justifyContent: 'center',
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.2,
      shadowRadius: 2,
      elevation: 2,
    },
    columnInfo: {
      padding: 8,
      alignItems: 'center',
      backgroundColor: '#FFFFFF',
    },
    pillBadgeRed: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 3,
      backgroundColor: '#FEE2E2',
      paddingHorizontal: 6,
      paddingVertical: 2.5,
      borderRadius: 10,
    },
    pillTextRed: {
      fontSize: 9.5,
      fontWeight: '700',
      color: '#DC2626',
    },
    pillBadgeGreen: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 3,
      backgroundColor: '#DCFCE7',
      paddingHorizontal: 6,
      paddingVertical: 2.5,
      borderRadius: 10,
    },
    pillTextGreen: {
      fontSize: 9.5,
      fontWeight: '700',
      color: '#10B981',
    },
    pillBadgeAmber: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 3,
      backgroundColor: '#FEF3C7',
      paddingHorizontal: 6,
      paddingVertical: 2.5,
      borderRadius: 10,
    },
    pillTextAmber: {
      fontSize: 9.5,
      fontWeight: '700',
      color: '#D97706',
    },
    columnStat: {
      fontSize: 11.5,
      fontWeight: '800',
      color: '#111827',
      marginTop: 5,
      marginBottom: 2,
    },
    columnDesc: {
      fontSize: 9.5,
      color: '#6B7280',
      textAlign: 'center',
      lineHeight: 13,
    },
    dotsRow: {
      flexDirection: 'row',
      justifyContent: 'center',
      alignItems: 'center',
      gap: 6,
      marginTop: 14,
    },
    dot: {
      width: 8,
      height: 8,
      borderRadius: 4,
    },
    dotActive: {
      backgroundColor: '#1E3F32',
    },
    dotInactive: {
      backgroundColor: '#D1D5DB',
    },
    featureCardsRow: {
      flexDirection: 'row',
      gap: 6,
    },
    featureCard: {
      flex: 1,
      backgroundColor: '#F4F8F5',
      borderRadius: 16,
      paddingVertical: 12,
      paddingHorizontal: 4,
      alignItems: 'center',
      justifyContent: 'center',
      borderWidth: 1,
      borderColor: 'transparent',
    },
    featureCardSelected: {
      backgroundColor: '#EDF6F0',
      borderColor: '#BBE0C7',
    },
    featureIconBox: {
      width: 38,
      height: 38,
      borderRadius: 12,
      backgroundColor: '#E0F0E4',
      alignItems: 'center',
      justifyContent: 'center',
    },
    featureLabel: {
      fontSize: 10.5,
      fontWeight: '700',
      color: '#1F2937',
      textAlign: 'center',
      marginTop: 8,
      lineHeight: 14,
    },
    featureLabelSmall: {
      fontSize: 10,
      fontWeight: '700',
      color: '#1F2937',
      textAlign: 'center',
      marginTop: 8,
      lineHeight: 13,
    },
    notSureBanner: {
      backgroundColor: '#1E4738',
      borderRadius: 22,
      padding: 14,
      overflow: 'hidden',
      marginBottom: 14,
      flexDirection: 'row',
      alignItems: 'center',
      shadowColor: '#1E4738',
      shadowOffset: { width: 0, height: 3 },
      shadowOpacity: 0.25,
      shadowRadius: 5,
      elevation: 3,
    },
    polaroidContainer: {
      width: 88,
      height: 72,
      position: 'relative',
    },
    polaroidLeft: {
      position: 'absolute',
      left: 2,
      top: 4,
      width: 52,
      height: 64,
      borderRadius: 6,
      borderWidth: 2.5,
      borderColor: '#FFFFFF',
      transform: [{ rotate: '-8deg' }],
      backgroundColor: '#1E2522',
      overflow: 'hidden',
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.35,
      shadowRadius: 3,
      elevation: 2,
    },
    polaroidRight: {
      position: 'absolute',
      left: 30,
      top: 2,
      width: 52,
      height: 64,
      borderRadius: 6,
      borderWidth: 2.5,
      borderColor: '#FFFFFF',
      transform: [{ rotate: '8deg' }],
      backgroundColor: '#1E2522',
      overflow: 'hidden',
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.35,
      shadowRadius: 3,
      elevation: 3,
    },
    polaroidImage: {
      width: '100%',
      height: '100%',
    },
    polaroidReticleCyan: {
      position: 'absolute',
      top: '50%',
      left: '50%',
      width: 22,
      height: 22,
      marginTop: -11,
      marginLeft: -11,
      borderWidth: 1.2,
      borderColor: '#38BDF8',
    },
    polaroidReticleGreen: {
      position: 'absolute',
      top: '50%',
      left: '50%',
      width: 22,
      height: 22,
      marginTop: -11,
      marginLeft: -11,
      borderWidth: 1.2,
      borderColor: '#4ADE80',
    },
    notSureTextCol: {
      flex: 1,
      paddingLeft: 12,
      paddingRight: 6,
    },
    notSureTitle: {
      fontSize: 15,
      fontWeight: '800',
      color: '#FFFFFF',
    },
    notSureSubtitle: {
      fontSize: 11.5,
      color: 'rgba(255, 255, 255, 0.88)',
      lineHeight: 15.5,
      marginTop: 3,
    },
    notSureArrowCircle: {
      width: 36,
      height: 36,
      borderRadius: 18,
      backgroundColor: 'rgba(255, 255, 255, 0.22)',
      alignItems: 'center',
      justifyContent: 'center',
    },
    primaryActionButton: {
      backgroundColor: '#124434',
      borderRadius: 16,
      height: 52,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 8,
      shadowColor: '#124434',
      shadowOffset: { width: 0, height: 3 },
      shadowOpacity: 0.25,
      shadowRadius: 5,
      elevation: 3,
      marginBottom: 10,
    },
    primaryActionButtonText: {
      fontSize: 15.5,
      fontWeight: '700',
      color: '#FFFFFF',
    },
    secondaryButtonsRow: {
      flexDirection: 'row',
      gap: 10,
      marginBottom: 12,
    },
    secondaryActionButton: {
      flex: 1,
      backgroundColor: '#FFFFFF',
      borderWidth: 1.5,
      borderColor: '#E5EAE6',
      borderRadius: 16,
      height: 48,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 8,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.04,
      shadowRadius: 2,
      elevation: 1,
    },
    secondaryActionButtonText: {
      fontSize: 13.5,
      fontWeight: '700',
      color: '#124434',
    },
    bottomQuotePill: {
      backgroundColor: '#EDF5F0',
      borderWidth: 1,
      borderColor: '#DCEDE1',
      borderRadius: 24,
      paddingVertical: 10,
      paddingHorizontal: 16,
      marginTop: 2,
      marginBottom: 26,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 8,
      maxWidth: 540,
      width: '100%',
      alignSelf: 'center',
    },
    bottomQuoteText: {
      fontSize: 12,
      fontWeight: '600',
      color: '#2D6A4F',
    },
    modalOverlay: {
      flex: 1,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      justifyContent: 'center',
      alignItems: 'center',
      padding: 18,
    },
    modalContent: {
      width: '100%',
      maxWidth: 440,
      backgroundColor: '#FFFFFF',
      borderRadius: 22,
      padding: 18,
      maxHeight: '85%',
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.15,
      shadowRadius: 10,
      elevation: 5,
    },
    modalHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: 14,
    },
    modalTitle: {
      fontSize: 16,
      fontWeight: '800',
      color: colors.text,
      flex: 1,
    },
    modalCloseButton: {
      padding: 4,
    },
    modalScroll: {
      maxHeight: 380,
    },
    modalRuleCard: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      backgroundColor: '#F7FAF8',
      padding: 12,
      borderRadius: 14,
      borderWidth: 1,
      borderColor: '#E5ECE7',
      marginBottom: 8,
    },
    modalRuleIconCircle: {
      width: 34,
      height: 34,
      borderRadius: 10,
      backgroundColor: '#DCF0E2',
      alignItems: 'center',
      justifyContent: 'center',
      marginRight: 10,
    },
    modalRuleTextCol: {
      flex: 1,
    },
    modalRuleTitle: {
      fontSize: 13,
      fontWeight: '700',
      color: colors.text,
      marginBottom: 2,
    },
    modalRuleDesc: {
      fontSize: 11.5,
      color: colors.textSecondary,
      lineHeight: 16,
    },
    modalDismissButton: {
      backgroundColor: '#1B4D3E',
      borderRadius: 12,
      height: 44,
      alignItems: 'center',
      justifyContent: 'center',
      marginTop: 12,
    },
    modalDismissButtonText: {
      fontSize: 14,
      fontWeight: '700',
      color: '#FFFFFF',
    },
  });
