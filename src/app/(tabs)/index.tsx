import { useRouter } from 'expo-router';
import {
  Camera,
  History,
  Lightbulb,
  ChevronRight,
  Leaf,
  Sprout,
  User,
  BookOpen,
  Calendar,
  Wifi,
} from 'lucide-react-native';
import React, { useMemo } from 'react';
import {
  Image,
  ImageBackground,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ASSETS } from '../../constants/assets';
import { getPlantVillageImage } from '../../data/plantvillage-images';
import { useHistory } from '../../features/history/HistoryContext';
import { useSettings } from '../../features/settings/SettingsContext';
import { useTheme, useStyles } from '../../theme';

export default function HomeScreen() {
  const router = useRouter();
  const { language, activeProvider } = useSettings();
  const { colors } = useTheme();
  const styles = useStyles(createStyles);
  const { records } = useHistory();

  // Dynamic greeting based on current hour
  const greetingText = useMemo(() => {
    const hour = new Date().getHours();
    if (hour < 12) {
      return language === 'kk' ? 'Қайырлы таң!' : language === 'en' ? 'Good morning!' : 'Доброе утро!';
    }
    if (hour < 18) {
      return language === 'kk' ? 'Қайырлы күн!' : language === 'en' ? 'Good afternoon!' : 'Добрый день!';
    }
    return language === 'kk' ? 'Қайырлы кеш!' : language === 'en' ? 'Good evening!' : 'Добрый вечер!';
  }, [language]);

  // AI Online Status Text
  const aiStatusText = useMemo(() => {
    if (activeProvider === 'offline') {
      return language === 'kk' ? 'Офлайн Core' : language === 'en' ? 'Offline Core' : 'Офлайн Core';
    }
    return language === 'kk' ? 'AI Онлайн' : language === 'en' ? 'AI Online' : 'AI Онлайн';
  }, [activeProvider, language]);

  // Realistic starter inspection samples with authentic photos
  const defaultRecentSamples = useMemo(() => [
    {
      id: 'demo-initial-1',
      crop: language === 'kk' ? 'Томат' : language === 'en' ? 'Tomato' : 'Томат',
      status: language === 'kk' ? 'Ауру' : language === 'en' ? 'Disease' : 'Болезнь',
      isHealthy: false,
      title:
        language === 'kk'
          ? 'Ерте дақтар'
          : language === 'en'
          ? 'Early Blight'
          : 'Ранняя пятнистость',
      dateStr:
        language === 'kk'
          ? '12 маусым 2025 • 19:32'
          : language === 'en'
          ? 'June 12, 2025 • 19:32'
          : '12 июня 2025 • 19:32',
      image: ASSETS.diseases.earlyBlight,
    },
    {
      id: 'demo-initial-2',
      crop: language === 'kk' ? 'Томат' : language === 'en' ? 'Tomato' : 'Томат',
      status: language === 'kk' ? 'Сау' : language === 'en' ? 'Healthy' : 'Здоров',
      isHealthy: true,
      title:
        language === 'kk'
          ? 'Сау жапырақ'
          : language === 'en'
          ? 'Healthy Leaf'
          : 'Здоровый лист',
      dateStr:
        language === 'kk'
          ? '8 маусым 2025 • 14:18'
          : language === 'en'
          ? 'June 8, 2025 • 14:18'
          : '8 июня 2025 • 14:18',
      image: ASSETS.diseases.healthy,
    },
    {
      id: 'demo-initial-3',
      crop: language === 'kk' ? 'Алма' : language === 'en' ? 'Apple' : 'Яблоня',
      status: language === 'kk' ? 'Ауру' : language === 'en' ? 'Disease' : 'Болезнь',
      isHealthy: false,
      title:
        language === 'kk'
          ? 'Ұнтақты шық'
          : language === 'en'
          ? 'Powdery Mildew'
          : 'Мучнистая роса',
      dateStr:
        language === 'kk'
          ? '5 маусым 2025 • 11:05'
          : language === 'en'
          ? 'June 5, 2025 • 11:05'
          : '5 июня 2025 • 11:05',
      image: ASSETS.diseases.powderyMildew,
    },
    {
      id: 'demo-initial-4',
      crop: language === 'kk' ? 'Картоп' : language === 'en' ? 'Potato' : 'Картофель',
      status: language === 'kk' ? 'Ауру' : language === 'en' ? 'Disease' : 'Болезнь',
      isHealthy: false,
      title:
        language === 'kk'
          ? 'Фитофтороз'
          : language === 'en'
          ? 'Late Blight'
          : 'Фитофтороз картофеля',
      dateStr:
        language === 'kk'
          ? '28 мамыр 2025 • 16:40'
          : language === 'en'
          ? 'May 28, 2025 • 16:40'
          : '28 мая 2025 • 16:40',
      image: ASSETS.diseases.earlyBlight,
    },
  ], [language]);

  // Combined recent items: actual user records first, supplemented with starter cards so it's NEVER empty
  const displayRecentItems = useMemo(() => {
    const userItems = (records || []).map((r) => {
      const isHealthy =
        r.diagnosisClass?.toLowerCase().includes('healthy') ||
        r.diagnosisClass?.toLowerCase().includes('здоров') ||
        r.diagnosisClass?.toLowerCase().includes('сау');
      const img = r.imageUri
        ? { uri: r.imageUri }
        : r.plantVillageClass
        ? getPlantVillageImage(r.plantVillageClass)
        : r.cropId === 'apple'
        ? ASSETS.diseases.powderyMildew
        : isHealthy
        ? ASSETS.diseases.healthy
        : ASSETS.diseases.earlyBlight;

      return {
        id: r.id,
        crop: r.crop ?? (language === 'kk' ? 'Өсімдік' : language === 'en' ? 'Plant' : 'Томат'),
        status: isHealthy
          ? (language === 'kk' ? 'Сау' : language === 'en' ? 'Healthy' : 'Здоров')
          : (language === 'kk' ? 'Ауру' : language === 'en' ? 'Disease' : 'Болезнь'),
        isHealthy,
        title: r.diagnosisClass ?? (language === 'kk' ? 'Анықталды' : language === 'en' ? 'Diagnosis' : 'Диагностика'),
        dateStr: new Date(r.createdAt).toLocaleDateString(
          language === 'kk' ? 'kk-KZ' : language === 'en' ? 'en-US' : 'ru-RU',
          { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' }
        ),
        image: img,
      };
    });

    if (userItems.length < 4) {
      const existingIds = new Set(userItems.map((u) => u.id));
      const needed = defaultRecentSamples.filter((s) => !existingIds.has(s.id));
      return [...userItems, ...needed.slice(0, 4 - userItems.length)];
    }

    return userItems.slice(0, 6);
  }, [records, language, defaultRecentSamples]);

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}>
        {/* 1. Header Bar */}
        <View style={styles.headerRow}>
          <View style={styles.brandContainer}>
            <Image
              source={ASSETS.logo}
              style={styles.headerLogoImage}
              resizeMode="contain"
            />
            <View style={styles.brandTextWrapper}>
              <Text style={styles.brandTitle}>PlantGuard AI</Text>
              <Text style={styles.brandSubtitle}>
                {language === 'kk'
                  ? 'Әрбір жапыраққа қамқорлық'
                  : language === 'en'
                  ? 'Care for every leaf'
                  : 'Забота о каждом листе'}
              </Text>
            </View>
          </View>

          <View style={styles.headerRightGroup}>
            {/* AI Online Status Pill */}
            <TouchableOpacity
              activeOpacity={0.85}
              onPress={() => router.push('/(tabs)/profile')}
              style={styles.aiStatusPill}>
              <Wifi size={13} color="#15803D" strokeWidth={2.4} />
              <Text style={styles.aiStatusText}>{aiStatusText}</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* 2. Greeting Section */}
        <View style={styles.greetingContainer}>
          <View style={styles.greetingHeaderRow}>
            <View style={styles.greetingTitleRow}>
              <Text style={styles.greetingTitle}>{greetingText}</Text>
              <Sprout size={24} color="#15803D" strokeWidth={2.4} />
            </View>
            <View style={styles.mottoPill}>
              <Leaf size={12} color="#15803D" strokeWidth={2.2} />
              <Text style={styles.mottoText}>
                {language === 'kk'
                  ? '«Сау өсімдік — мол өнім»'
                  : language === 'en'
                  ? '«Healthy leaf — rich yield»'
                  : '«Здоровый лист — богатый урожай»'}
              </Text>
            </View>
          </View>
          <Text style={styles.greetingSubtitle}>
            {language === 'kk'
              ? 'Өсімдіктерді тексеріп, агрономиялық ұсыныстар алып, сау өнімді сақтаңыз.'
              : language === 'en'
              ? 'Scan plants, get actionable agronomic recommendations and protect your yield.'
              : 'Проверяйте растения, получайте рекомендации агронома и сохраняйте здоровый урожай.'}
          </Text>
        </View>

        {/* 3. Main Hero Card: Сканировать растение */}
        <TouchableOpacity
          activeOpacity={0.94}
          onPress={() => router.push('/camera')}
          style={styles.heroCardContainer}>
          <ImageBackground
            source={ASSETS.heroLeafBg}
            style={styles.heroBackground}
            imageStyle={styles.heroBackgroundImage}>
            {/* Gradient Dark Overlay */}
            <View style={styles.heroOverlay}>
              {/* Top Row with Camera Icon and Tagline */}
              <View style={styles.heroTopRow}>
                <View style={styles.heroCameraCircle}>
                  <Camera size={22} color="#FFFFFF" strokeWidth={2.2} />
                </View>
                <Text style={styles.heroTagline}>
                  {language === 'kk'
                    ? 'Жылдам • Нақты • Қауіпсіз'
                    : language === 'en'
                    ? 'Fast • Accurate • Safe'
                    : 'Быстро • Точно • Безопасно'}
                </Text>
              </View>

              {/* Bottom Row with Action Title and Arrow */}
              <View style={styles.heroBottomRow}>
                <View style={styles.heroTextCol}>
                  <Text style={styles.heroTitle}>
                    {language === 'kk'
                      ? 'Өсімдікті сканерлеу'
                      : language === 'en'
                      ? 'Scan plant'
                      : 'Сканировать растение'}
                  </Text>
                  <Text style={styles.heroSubtitle}>
                    {language === 'kk'
                      ? 'Фотоға түсіріңіз немесе галереядан жүктеңіз'
                      : language === 'en'
                      ? 'Take a photo or upload from gallery'
                      : 'Сделайте фото или загрузите из галереи'}
                  </Text>
                </View>

                <View style={styles.heroArrowButton}>
                  <ChevronRight size={22} color="#111827" strokeWidth={2.6} />
                </View>
              </View>
            </View>
          </ImageBackground>
        </TouchableOpacity>

        {/* 4. PlantVillage 38 Offline Core & Encyclopedia Card */}
        <TouchableOpacity
          activeOpacity={0.9}
          onPress={() => router.push('/crops')}
          style={styles.plantVillageCard}>
          <View style={styles.pvIconBadge}>
            <BookOpen size={22} color="#15803D" strokeWidth={2.2} />
          </View>

          <View style={styles.pvTextCol}>
            <View style={styles.pvTitleRow}>
              <Text style={styles.pvTitle}>PlantVillage 38</Text>
              <View style={styles.pvBadge}>
                <Text style={styles.pvBadgeText}>
                  {language === 'kk' ? '54K+ фото' : language === 'en' ? '54K+ photos' : '54K+ фото'}
                </Text>
              </View>
            </View>
            <Text style={styles.pvSubtitle}>
              {language === 'kk'
                ? '14 дақыл, 38 класс, офлайн қолжетімділік және AI'
                : language === 'en'
                ? '14 crops, 38 classes with offline access and AI'
                : '14 культур, 38 классов с офлайн-доступом и AI'}
            </Text>
          </View>

          {/* Photo Collage Thumbnails + Arrow */}
          <View style={styles.pvRightCol}>
            <View style={styles.pvCollageRow}>
              <Image source={ASSETS.diseases.earlyBlight} style={[styles.pvMiniThumb, { zIndex: 3 }]} />
              <Image source={ASSETS.diseases.healthy} style={[styles.pvMiniThumb, { marginLeft: -10, zIndex: 2 }]} />
              <Image source={ASSETS.diseases.powderyMildew} style={[styles.pvMiniThumb, { marginLeft: -10, zIndex: 1 }]} />
            </View>
            <View style={styles.pvArrowCircle}>
              <ChevronRight size={16} color="#4B5563" strokeWidth={2.2} />
            </View>
          </View>
        </TouchableOpacity>

        {/* 5. 2x2 Quick Action Grid */}
        <View style={styles.quickGrid}>
          {/* Row 1 */}
          <View style={styles.gridRow}>
            {/* Item 1: История */}
            <TouchableOpacity
              activeOpacity={0.88}
              onPress={() => router.push('/(tabs)/history')}
              style={styles.gridActionCard}>
              <View style={styles.gridIconSquare}>
                <History size={20} color="#15803D" strokeWidth={2.2} />
              </View>
              <View style={styles.gridTextCol}>
                <Text style={styles.gridCardTitle}>
                  {language === 'kk' ? 'Тарих' : language === 'en' ? 'History' : 'История'}
                </Text>
                <Text style={styles.gridCardSubtitle}>
                  {language === 'kk'
                    ? 'Тексерістеріңіз\nмен нәтижелер'
                    : language === 'en'
                    ? 'Your scans\nand results'
                    : 'Ваши проверки\nи результаты'}
                </Text>
              </View>
              <ChevronRight size={15} color="#9CA3AF" strokeWidth={2} />
            </TouchableOpacity>

            {/* Item 2: Выбор культуры */}
            <TouchableOpacity
              activeOpacity={0.88}
              onPress={() => router.push('/crops')}
              style={styles.gridActionCard}>
              <View style={styles.gridIconSquare}>
                <Leaf size={20} color="#15803D" strokeWidth={2.2} />
              </View>
              <View style={styles.gridTextCol}>
                <Text style={styles.gridCardTitle}>
                  {language === 'kk' ? 'Дақылды таңдау' : language === 'en' ? 'Select Crop' : 'Выбор культуры'}
                </Text>
                <Text style={styles.gridCardSubtitle}>
                  {language === 'kk'
                    ? 'Қызанақ, бұрыш,\nкартоп және т.б.'
                    : language === 'en'
                    ? 'Tomato, pepper,\npotato and more'
                    : 'Томаты, перец,\nкартофель и другие'}
                </Text>
              </View>
              <ChevronRight size={15} color="#9CA3AF" strokeWidth={2} />
            </TouchableOpacity>
          </View>

          {/* Row 2 */}
          <View style={styles.gridRow}>
            {/* Item 3: Советы */}
            <TouchableOpacity
              activeOpacity={0.88}
              onPress={() => router.push('/guide')}
              style={styles.gridActionCard}>
              <View style={styles.gridIconSquare}>
                <Lightbulb size={20} color="#15803D" strokeWidth={2.2} />
              </View>
              <View style={styles.gridTextCol}>
                <Text style={styles.gridCardTitle}>
                  {language === 'kk' ? 'Кеңестер' : language === 'en' ? 'Tips' : 'Советы'}
                </Text>
                <Text style={styles.gridCardSubtitle}>
                  {language === 'kk'
                    ? 'Нақты талдау үшін\nқалай түсіру керек'
                    : language === 'en'
                    ? 'How to photograph\nfor best accuracy'
                    : 'Как фотографировать\nдля точного анализа'}
                </Text>
              </View>
              <ChevronRight size={15} color="#9CA3AF" strokeWidth={2} />
            </TouchableOpacity>

            {/* Item 4: Профиль */}
            <TouchableOpacity
              activeOpacity={0.88}
              onPress={() => router.push('/(tabs)/profile')}
              style={styles.gridActionCard}>
              <View style={styles.gridIconSquare}>
                <User size={20} color="#15803D" strokeWidth={2.2} />
              </View>
              <View style={styles.gridTextCol}>
                <Text style={styles.gridCardTitle}>
                  {language === 'kk' ? 'Профиль' : language === 'en' ? 'Profile' : 'Профиль'}
                </Text>
                <Text style={styles.gridCardSubtitle}>
                  {language === 'kk'
                    ? 'Баптаулар, тіл\nжәне AI қосылымы'
                    : language === 'en'
                    ? 'Settings, language\nand AI keys'
                    : 'Настройки, язык\nи AI-подключение'}
                </Text>
              </View>
              <ChevronRight size={15} color="#9CA3AF" strokeWidth={2} />
            </TouchableOpacity>
          </View>
        </View>

        {/* 6. Tip of the Day Banner */}
        <TouchableOpacity
          activeOpacity={0.9}
          onPress={() => router.push('/guide')}
          style={styles.tipBannerCard}>
          <View style={styles.tipBannerIconSquare}>
            <Sprout size={22} color="#15803D" strokeWidth={2.2} />
          </View>

          <View style={styles.tipBannerTextCol}>
            <View style={styles.tipBannerHeaderRow}>
              <Text style={styles.tipBannerTitle}>
                {language === 'kk' ? 'Бүгінгі кеңес' : language === 'en' ? "Today's Tip" : 'Сегодняшняя подсказка'}
              </Text>
              <View style={styles.tipBannerLinkRow}>
                <Text style={styles.tipBannerLinkText}>
                  {language === 'kk' ? 'Барлық кеңестер' : language === 'en' ? 'All tips' : 'Все советы'}
                </Text>
                <ChevronRight size={13} color="#15803D" strokeWidth={2.4} />
              </View>
            </View>
            <Text style={styles.tipBannerDesc}>
              {language === 'kk'
                ? 'Жапырақтың астыңғы жағын үнемі тексеріңіз — зиянкестер көбінесе сонда жасырынады.'
                : language === 'en'
                ? 'Regularly inspect the underside of leaves — pests often hide there.'
                : 'Регулярно осматривайте нижнюю сторону листьев — там часто скрываются вредители.'}
            </Text>
          </View>
        </TouchableOpacity>

        {/* 7. Recent Analyses Section */}
        <View style={styles.recentSectionHeader}>
          <Text style={styles.recentSectionTitle}>
            {language === 'kk' ? 'Соңғы талдаулар' : language === 'en' ? 'Recent Analyses' : 'Недавние анализы'}
          </Text>
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => router.push('/(tabs)/history')}
            style={styles.recentSeeAllButton}>
            <Text style={styles.recentSeeAllText}>
              {language === 'kk' ? 'Барлығы' : language === 'en' ? 'All' : 'Все'}
            </Text>
            <ChevronRight size={15} color="#15803D" strokeWidth={2.4} />
          </TouchableOpacity>
        </View>

        {/* Horizontal Scroll of Recent Analysis Cards */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.recentScrollRow}>
          {displayRecentItems.map((item) => (
            <TouchableOpacity
              key={item.id}
              activeOpacity={0.88}
              onPress={() => router.push('/(tabs)/history')}
              style={styles.recentCard}>
              <Image source={item.image} style={styles.recentThumbnail} resizeMode="cover" />

              <View style={styles.recentInfoCol}>
                <View style={styles.recentTagsRow}>
                  <View style={styles.recentCropBadge}>
                    <Text style={styles.recentCropBadgeText}>{item.crop}</Text>
                  </View>
                  <View
                    style={[
                      styles.recentStatusBadge,
                      item.isHealthy ? styles.recentStatusHealthy : styles.recentStatusDisease,
                    ]}>
                    <Text
                      style={[
                        styles.recentStatusText,
                        item.isHealthy ? styles.recentStatusTextHealthy : styles.recentStatusTextDisease,
                      ]}>
                      {item.status}
                    </Text>
                  </View>
                </View>

                <Text style={styles.recentDiseaseTitle} numberOfLines={1}>
                  {item.title}
                </Text>

                <View style={styles.recentDateRow}>
                  <Calendar size={11} color="#6B7280" strokeWidth={2} />
                  <Text style={styles.recentDateText}>{item.dateStr}</Text>
                </View>
              </View>

              <ChevronRight size={15} color="#9CA3AF" strokeWidth={2} />
            </TouchableOpacity>
          ))}
        </ScrollView>
      </ScrollView>
    </SafeAreaView>
  );
}

const createStyles = ({ colors, spacing }: any) =>
  StyleSheet.create({
    safeArea: {
      flex: 1,
      backgroundColor: '#F3F6F4',
    },
    topRightFoliageWrapper: {
      position: 'absolute',
      top: 0,
      right: 0,
      width: 170,
      height: 110,
      overflow: 'hidden',
      zIndex: 0,
    },
    topRightFoliage: {
      width: '100%',
      height: '100%',
      opacity: 0.75,
    },
    scrollContent: {
      paddingHorizontal: spacing.md,
      paddingTop: spacing.xs,
      paddingBottom: spacing.xxl,
      maxWidth: 540,
      width: '100%',
      alignSelf: 'center',
    },
    headerRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginTop: spacing.xs,
      marginBottom: spacing.sm,
    },
    brandContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 10,
    },
    headerLogoImage: {
      width: 42,
      height: 42,
      borderRadius: 12,
      overflow: 'hidden',
    },
    logoBadge: {
      width: 44,
      height: 44,
      borderRadius: 14,
      backgroundColor: '#E2F4E7',
      alignItems: 'center',
      justifyContent: 'center',
    },
    brandTextWrapper: {
      justifyContent: 'center',
    },
    brandTitle: {
      fontSize: 17.5,
      fontWeight: '800',
      color: '#111827',
      letterSpacing: -0.3,
    },
    brandSubtitle: {
      fontSize: 12,
      color: '#6B7280',
      marginTop: 1,
    },
    headerRightGroup: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
    },
    aiStatusPill: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 5,
      backgroundColor: '#E8F5EB',
      borderWidth: 1,
      borderColor: '#D4EAD9',
      paddingHorizontal: 11,
      paddingVertical: 7,
      borderRadius: 20,
    },
    aiStatusText: {
      fontSize: 12,
      fontWeight: '700',
      color: '#15803D',
    },
    greetingContainer: {
      marginVertical: 12,
      gap: 6,
    },
    greetingHeaderRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      flexWrap: 'wrap',
      gap: 8,
    },
    greetingTitleRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
    },
    greetingTitle: {
      fontSize: 23,
      fontWeight: '900',
      color: '#111827',
      letterSpacing: -0.4,
    },
    mottoPill: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 5,
      backgroundColor: '#EBF7EE',
      borderWidth: 1,
      borderColor: '#D2ECDA',
      paddingHorizontal: 10,
      paddingVertical: 5,
      borderRadius: 14,
    },
    mottoText: {
      fontSize: 11,
      fontWeight: '700',
      color: '#1B6A3E',
    },
    greetingSubtitle: {
      fontSize: 13,
      color: '#6B7280',
      lineHeight: 18,
    },
    heroCardContainer: {
      height: 195,
      borderRadius: 24,
      overflow: 'hidden',
      marginBottom: 14,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.12,
      shadowRadius: 8,
      elevation: 3,
    },
    heroBackground: {
      width: '100%',
      height: '100%',
    },
    heroBackgroundImage: {
      borderRadius: 24,
    },
    heroOverlay: {
      flex: 1,
      backgroundColor: 'rgba(10, 24, 18, 0.45)',
      justifyContent: 'space-between',
      padding: 16,
    },
    heroTopRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 10,
    },
    heroCameraCircle: {
      width: 48,
      height: 48,
      borderRadius: 24,
      backgroundColor: 'rgba(255, 255, 255, 0.26)',
      alignItems: 'center',
      justifyContent: 'center',
      borderWidth: 1,
      borderColor: 'rgba(255, 255, 255, 0.3)',
    },
    heroTagline: {
      color: '#FFFFFF',
      fontSize: 12,
      fontWeight: '600',
      opacity: 0.92,
    },
    heroBottomRow: {
      flexDirection: 'row',
      alignItems: 'flex-end',
      justifyContent: 'space-between',
    },
    heroTextCol: {
      flex: 1,
      marginRight: 12,
    },
    heroTitle: {
      fontSize: 21,
      fontWeight: '800',
      color: '#FFFFFF',
      letterSpacing: -0.3,
    },
    heroSubtitle: {
      fontSize: 12.5,
      color: 'rgba(255, 255, 255, 0.9)',
      marginTop: 3,
    },
    heroArrowButton: {
      width: 46,
      height: 46,
      borderRadius: 23,
      backgroundColor: '#FFFFFF',
      alignItems: 'center',
      justifyContent: 'center',
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.18,
      shadowRadius: 4,
      elevation: 2,
    },
    plantVillageCard: {
      backgroundColor: '#FFFFFF',
      borderRadius: 20,
      borderWidth: 1,
      borderColor: '#E6ECE8',
      padding: 12,
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 14,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.03,
      shadowRadius: 3,
      elevation: 1,
    },
    pvIconBadge: {
      width: 46,
      height: 46,
      borderRadius: 14,
      backgroundColor: '#E2F4E7',
      alignItems: 'center',
      justifyContent: 'center',
      marginRight: 10,
    },
    pvTextCol: {
      flex: 1,
    },
    pvTitleRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
    },
    pvTitle: {
      fontSize: 15,
      fontWeight: '800',
      color: '#111827',
    },
    pvBadge: {
      backgroundColor: '#DCFCE7',
      borderRadius: 10,
      paddingHorizontal: 6,
      paddingVertical: 2,
    },
    pvBadgeText: {
      fontSize: 10.5,
      fontWeight: '700',
      color: '#15803D',
    },
    pvSubtitle: {
      fontSize: 11.5,
      color: '#6B7280',
      marginTop: 2,
    },
    pvRightCol: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
    },
    pvCollageRow: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    pvMiniThumb: {
      width: 28,
      height: 28,
      borderRadius: 7,
      borderWidth: 1.5,
      borderColor: '#FFFFFF',
    },
    pvArrowCircle: {
      width: 26,
      height: 26,
      borderRadius: 13,
      backgroundColor: '#F3F4F6',
      alignItems: 'center',
      justifyContent: 'center',
    },
    quickGrid: {
      gap: 10,
      marginBottom: 14,
    },
    gridRow: {
      flexDirection: 'row',
      gap: 10,
    },
    gridActionCard: {
      flex: 1,
      backgroundColor: '#FFFFFF',
      borderRadius: 20,
      borderWidth: 1,
      borderColor: '#E6ECE8',
      padding: 13,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.03,
      shadowRadius: 3,
      elevation: 1,
    },
    gridIconSquare: {
      width: 40,
      height: 40,
      borderRadius: 13,
      backgroundColor: '#E8F5EB',
      alignItems: 'center',
      justifyContent: 'center',
      marginRight: 8,
    },
    gridTextCol: {
      flex: 1,
    },
    gridCardTitle: {
      fontSize: 14,
      fontWeight: '800',
      color: '#111827',
    },
    gridCardSubtitle: {
      fontSize: 10.5,
      color: '#6B7280',
      lineHeight: 13.5,
      marginTop: 2,
    },
    tipBannerCard: {
      backgroundColor: '#EDF6F0',
      borderWidth: 1,
      borderColor: '#D4EBDC',
      borderRadius: 20,
      padding: 14,
      flexDirection: 'row',
      alignItems: 'flex-start',
      marginBottom: 18,
    },
    tipBannerIconSquare: {
      width: 44,
      height: 44,
      borderRadius: 14,
      backgroundColor: '#DCF0E2',
      alignItems: 'center',
      justifyContent: 'center',
      marginRight: 12,
    },
    tipBannerTextCol: {
      flex: 1,
    },
    tipBannerHeaderRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    tipBannerTitle: {
      fontSize: 13.5,
      fontWeight: '800',
      color: '#111827',
    },
    tipBannerLinkRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 2,
    },
    tipBannerLinkText: {
      fontSize: 11.5,
      fontWeight: '700',
      color: '#15803D',
    },
    tipBannerDesc: {
      fontSize: 11.5,
      color: '#4B5563',
      lineHeight: 16,
      marginTop: 4,
    },
    recentSectionHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: 12,
    },
    recentSectionTitle: {
      fontSize: 17,
      fontWeight: '800',
      color: '#111827',
      letterSpacing: -0.2,
    },
    recentSeeAllButton: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 3,
    },
    recentSeeAllText: {
      fontSize: 13,
      fontWeight: '700',
      color: '#15803D',
    },
    recentScrollRow: {
      gap: 10,
      paddingBottom: 8,
    },
    recentCard: {
      backgroundColor: '#FFFFFF',
      borderRadius: 18,
      borderWidth: 1,
      borderColor: '#E6ECE8',
      padding: 12,
      flexDirection: 'row',
      alignItems: 'center',
      width: 248,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.03,
      shadowRadius: 3,
      elevation: 1,
    },
    recentThumbnail: {
      width: 56,
      height: 56,
      borderRadius: 12,
      backgroundColor: '#E5E7EB',
      marginRight: 10,
    },
    recentInfoCol: {
      flex: 1,
      marginRight: 6,
    },
    recentTagsRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 5,
    },
    recentCropBadge: {
      backgroundColor: '#F3F4F6',
      borderRadius: 6,
      paddingHorizontal: 6,
      paddingVertical: 2,
    },
    recentCropBadgeText: {
      fontSize: 10,
      color: '#4B5563',
      fontWeight: '600',
    },
    recentStatusBadge: {
      borderRadius: 6,
      paddingHorizontal: 6,
      paddingVertical: 2,
    },
    recentStatusHealthy: {
      backgroundColor: '#DCFCE7',
    },
    recentStatusDisease: {
      backgroundColor: '#FEE2E2',
    },
    recentStatusText: {
      fontSize: 10,
      fontWeight: '700',
    },
    recentStatusTextHealthy: {
      color: '#16A34A',
    },
    recentStatusTextDisease: {
      color: '#DC2626',
    },
    recentDiseaseTitle: {
      fontSize: 12.5,
      fontWeight: '800',
      color: '#111827',
      letterSpacing: -0.2,
      marginTop: 4,
    },
    recentDateRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
      marginTop: 4,
    },
    recentDateText: {
      fontSize: 10,
      color: '#6B7280',
    },
  });
