import { useRouter } from 'expo-router';
import { ChevronLeft, Search, Sparkles, BookOpen, Camera } from 'lucide-react-native';
import React, { useState, useMemo } from 'react';
import {
  Alert,
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
  useWindowDimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { PLANTVILLAGE_CROP_IMAGES } from '../data/plantvillage-images';
import { useSettings } from '../features/settings/SettingsContext';
import i18n from '../i18n';
import { useTheme, useStyles } from '../theme';
import type { CropId } from '../types';
import { safeBack } from '../utils/navigation';

interface CropGridItem {
  id: CropId;
  nameKey: string;
  category: 'vegetables' | 'fruits' | 'berries' | 'cereals';
  image: any;
  isPlantVillage: boolean;
  classesCount?: number;
  descriptionRu: string;
  descriptionKk: string;
  descriptionEn: string;
}

const ALL_CROPS: CropGridItem[] = [
  // PlantVillage Dataset Crops (14)
  {
    id: 'tomato',
    nameKey: 'tomato',
    category: 'vegetables',
    image: PLANTVILLAGE_CROP_IMAGES.tomato,
    isPlantVillage: true,
    classesCount: 10,
    descriptionRu: '10 классов болезней PlantVillage (фитофтора, альтернариоз, септориоз и др.)',
    descriptionKk: 'PlantVillage бойынша 10 ауру түрі (фитофтороз, септориоз және т.б.)',
    descriptionEn: '10 PlantVillage disease classes (late blight, early blight, septoria, etc.)',
  },
  {
    id: 'potato',
    nameKey: 'potato',
    category: 'vegetables',
    image: PLANTVILLAGE_CROP_IMAGES.potato,
    isPlantVillage: true,
    classesCount: 3,
    descriptionRu: 'Фитофтороз, альтернариоз и здоровый лист',
    descriptionKk: 'Фитофтороз, ерте дақтылық және сау жапырақ',
    descriptionEn: 'Late blight, early blight, and healthy leaf',
  },
  {
    id: 'apple',
    nameKey: 'apple',
    category: 'fruits',
    image: PLANTVILLAGE_CROP_IMAGES.apple,
    isPlantVillage: true,
    classesCount: 4,
    descriptionRu: 'Парша, чёрная гниль, ржавчина и здоровый лист',
    descriptionKk: 'Қотыр, қара шірік, тат және сау жапырақ',
    descriptionEn: 'Apple scab, black rot, cedar rust, and healthy leaf',
  },
  {
    id: 'grape',
    nameKey: 'grape',
    category: 'berries',
    image: PLANTVILLAGE_CROP_IMAGES.grape,
    isPlantVillage: true,
    classesCount: 4,
    descriptionRu: 'Чёрная гниль, эска, пятнистость и здоровый лист',
    descriptionKk: 'Қара шірік, эска, жапырақ дағы және сау жапырақ',
    descriptionEn: 'Black rot, esca, leaf blight, and healthy leaf',
  },
  {
    id: 'pepper',
    nameKey: 'pepper',
    category: 'vegetables',
    image: PLANTVILLAGE_CROP_IMAGES.pepper,
    isPlantVillage: true,
    classesCount: 2,
    descriptionRu: 'Бактериальная пятнистость и здоровый лист',
    descriptionKk: 'Бактериялық дақтылық және сау жапырақ',
    descriptionEn: 'Bacterial spot and healthy leaf',
  },
  {
    id: 'corn',
    nameKey: 'corn',
    category: 'cereals',
    image: PLANTVILLAGE_CROP_IMAGES.corn,
    isPlantVillage: true,
    classesCount: 4,
    descriptionRu: 'Ржавчина, церкоспороз, гельминтоспориоз и здоровый лист',
    descriptionKk: 'Тат, сұр дақтылық, гельминтоспориоз және сау жапырақ',
    descriptionEn: 'Common rust, gray leaf spot, northern leaf blight, and healthy leaf',
  },
  {
    id: 'cherry',
    nameKey: 'cherry',
    category: 'berries',
    image: PLANTVILLAGE_CROP_IMAGES.cherry,
    isPlantVillage: true,
    classesCount: 2,
    descriptionRu: 'Мучнистая роса и здоровый лист',
    descriptionKk: 'Ақұнтақ және сау жапырақ',
    descriptionEn: 'Powdery mildew and healthy leaf',
  },
  {
    id: 'strawberry',
    nameKey: 'strawberry',
    category: 'berries',
    image: PLANTVILLAGE_CROP_IMAGES.strawberry,
    isPlantVillage: true,
    classesCount: 2,
    descriptionRu: 'Пятнистость листьев (Leaf scorch) и здоровый лист',
    descriptionKk: 'Жапырақ күйігі және сау жапырақ',
    descriptionEn: 'Leaf scorch and healthy leaf',
  },
  {
    id: 'peach',
    nameKey: 'peach',
    category: 'fruits',
    image: PLANTVILLAGE_CROP_IMAGES.peach,
    isPlantVillage: true,
    classesCount: 2,
    descriptionRu: 'Бактериальная пятнистость и здоровый лист',
    descriptionKk: 'Бактериялық дақтылық және сау жапырақ',
    descriptionEn: 'Bacterial spot and healthy leaf',
  },
  {
    id: 'orange',
    nameKey: 'orange',
    category: 'fruits',
    image: PLANTVILLAGE_CROP_IMAGES.orange,
    isPlantVillage: true,
    classesCount: 1,
    descriptionRu: 'Хуанлунбин (Citrus greening / HLB)',
    descriptionKk: 'Хуанлунбин (цитрус көгеруі)',
    descriptionEn: 'Huanglongbing (Citrus greening)',
  },
  {
    id: 'squash',
    nameKey: 'squash',
    category: 'vegetables',
    image: PLANTVILLAGE_CROP_IMAGES.squash,
    isPlantVillage: true,
    classesCount: 1,
    descriptionRu: 'Мучнистая роса (Powdery mildew)',
    descriptionKk: 'Ақұнтақ кеселі (Powdery mildew)',
    descriptionEn: 'Powdery mildew',
  },
  {
    id: 'blueberry',
    nameKey: 'blueberry',
    category: 'berries',
    image: PLANTVILLAGE_CROP_IMAGES.blueberry,
    isPlantVillage: true,
    classesCount: 1,
    descriptionRu: 'Здоровый лист из эталонного датасета',
    descriptionKk: 'Эталондық датасеттегі сау жапырақ',
    descriptionEn: 'Healthy leaf from reference dataset',
  },
  {
    id: 'raspberry',
    nameKey: 'raspberry',
    category: 'berries',
    image: PLANTVILLAGE_CROP_IMAGES.raspberry,
    isPlantVillage: true,
    classesCount: 1,
    descriptionRu: 'Здоровый лист из эталонного датасета',
    descriptionKk: 'Эталондық датасеттегі сау жапырақ',
    descriptionEn: 'Healthy leaf from reference dataset',
  },
  {
    id: 'soybean',
    nameKey: 'soybean',
    category: 'cereals',
    image: PLANTVILLAGE_CROP_IMAGES.soybean,
    isPlantVillage: true,
    classesCount: 1,
    descriptionRu: 'Здоровый лист из эталонного датасета',
    descriptionKk: 'Эталондық датасеттегі сау жапырақ',
    descriptionEn: 'Healthy leaf from reference dataset',
  },
];

export default function CropsScreen() {
  const router = useRouter();
  const { language } = useSettings();
  const { colors } = useTheme();
  const styles = useStyles(createStyles);

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  const categories = useMemo(() => [
    { id: 'all', label: i18n.t('crops.categories.all') },
    { id: 'vegetables', label: i18n.t('crops.categories.vegetables') },
    { id: 'fruits', label: i18n.t('crops.categories.fruits') },
    { id: 'berries', label: i18n.t('crops.categories.berries') },
    { id: 'cereals', label: i18n.t('crops.categories.cereals') },
  ], [language]);

  const getCropName = (crop: CropGridItem) => {
    return i18n.t(`crops.names.${crop.nameKey}` as any) || crop.nameKey;
  };

  const getCropDesc = (crop: CropGridItem) => {
    if (language === 'kk') return crop.descriptionKk;
    if (language === 'en') return crop.descriptionEn;
    return crop.descriptionRu;
  };

  const filteredCrops = useMemo(() => {
    return ALL_CROPS.filter((crop) => {
      let matchCategory = true;
      if (selectedCategory !== 'all') {
        matchCategory = crop.category === selectedCategory;
      }

      const query = searchQuery.trim().toLowerCase();
      const cropName = getCropName(crop).toLowerCase();
      const cropDesc = getCropDesc(crop).toLowerCase();
      const matchSearch =
        query === '' ||
        cropName.includes(query) ||
        cropDesc.includes(query);

      return matchCategory && matchSearch;
    });
  }, [searchQuery, selectedCategory, language]);

  const handleSelectCrop = (crop: CropGridItem) => {
    const cropName = getCropName(crop);
    const cropDesc = getCropDesc(crop);
    Alert.alert(
      cropName,
      `PlantVillage (${crop.classesCount || 1} cl.).\n\n${cropDesc}`,
      [
        {
          text: i18n.t('scan.title'),
          onPress: () =>
            router.push({
              pathname: '/camera',
              params: { cropId: crop.id },
            }),
        },
        {
          text: language === 'kk' ? 'Ауруларды қарау' : language === 'en' ? 'Explore Diseases' : `Смотреть болезни (${crop.classesCount})`,
          onPress: () => router.push('/plantvillage-explorer'),
        },
        { text: i18n.t('common.cancel'), style: 'cancel' },
      ]
    );
  };

  const { width: screenWidth } = useWindowDimensions();
  const numColumns = 3;
  const gridGap = 8;
  const gridPadding = 14;
  const cardWidth = Math.floor(
    (screenWidth - gridPadding * 2 - gridGap * (numColumns - 1)) / numColumns
  );

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      {/* Screen Header */}
      <View style={styles.header}>
        <Pressable
          onPress={() => safeBack(router, '/(tabs)')}
          style={styles.backBtn}
          hitSlop={8}
          accessibilityLabel={i18n.t('common.back')}>
          <ChevronLeft size={22} color={colors.text} strokeWidth={2.4} />
        </Pressable>
        <View style={styles.headerTitleCol}>
          <Text style={styles.headerTitle}>{i18n.t('crops.title')}</Text>
          <Text style={styles.headerSubtitle}>
            {language === 'kk' ? '14 дақыл • 38 сынып' : language === 'en' ? '14 crops • 38 classes' : '14 культур • 38 классов датасета'}
          </Text>
        </View>
        <View style={styles.headerRightBadge}>
          <Text style={styles.headerRightBadgeText}>14</Text>
        </View>
      </View>

      {/* Search Input */}
      <View style={styles.searchBar}>
        <Search size={18} color="#7A8B7E" strokeWidth={2.2} />
        <TextInput
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholder={i18n.t('crops.search')}
          placeholderTextColor="#7A8B7E"
          style={styles.searchInput}
        />
      </View>

      {/* Category Chips Row */}
      <View style={styles.categoryContainer}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.categoryScroll}>
          {categories.map((cat) => {
            const isActive = selectedCategory === cat.id;
            return (
              <Pressable
                key={cat.id}
                onPress={() => setSelectedCategory(cat.id)}
                style={[styles.catChip, isActive && styles.catChipActive]}
                accessibilityRole="button">
                <Text
                  style={[
                    styles.catChipText,
                    isActive && styles.catChipTextActive,
                  ]}>
                  {cat.label}
                </Text>
              </Pressable>
            );
          })}
        </ScrollView>
      </View>

      {/* 3-Column Crops Grid */}
      <ScrollView
        contentContainerStyle={[styles.gridScroll, { paddingHorizontal: gridPadding }]}
        showsVerticalScrollIndicator={false}>
        <View style={styles.grid}>
          {filteredCrops.map((crop) => (
            <Pressable
              key={crop.id}
              onPress={() => handleSelectCrop(crop)}
              style={({ pressed }) => [
                styles.cropCard,
                { width: cardWidth },
                pressed && styles.cropCardPressed,
              ]}
              accessibilityRole="button">
              <Image
                source={crop.image}
                style={styles.cropImage}
                resizeMode="cover"
              />

              {/* PlantVillage Indicator Badge */}
              {crop.isPlantVillage && (
                <View style={styles.pvCropBadge}>
                  <Text style={styles.pvCropBadgeText}>PV</Text>
                </View>
              )}

              {/* Dark Pill Label */}
              <View style={styles.cropLabelPill}>
                <Text style={styles.cropLabelText} numberOfLines={1}>
                  {getCropName(crop)}
                </Text>
                {crop.classesCount ? (
                  <Text style={styles.cropClassesCountText}>
                    {crop.classesCount} {language === 'kk' ? 'сынып' : language === 'en' ? 'cl.' : 'кл.'}
                  </Text>
                ) : null}
              </View>
            </Pressable>
          ))}
        </View>

        {filteredCrops.length === 0 && (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>
              {language === 'kk' ? 'Дақылдар табылмады' : language === 'en' ? 'No crops found' : 'Культуры не найдены'}
            </Text>
            <Text style={styles.emptySubtext}>
              {language === 'kk' ? 'Іздеу сұранысын өзгертіңіз немесе «Барлығы» санатын таңдаңыз' : language === 'en' ? 'Try changing your search query or select "All"' : 'Попробуйте изменить поисковый запрос или выбрать категорию «Все»'}
            </Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const createStyles = ({ colors, radii, spacing }: any) =>
  StyleSheet.create({
    safeArea: {
      flex: 1,
      backgroundColor: colors.background,
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: spacing.lg,
      paddingTop: spacing.sm,
      paddingBottom: spacing.xs,
    },
    backBtn: {
      width: 40,
      height: 40,
      borderRadius: 14,
      backgroundColor: '#EAEFEA',
      alignItems: 'center',
      justifyContent: 'center',
    },
    headerTitleCol: {
      flex: 1,
      marginHorizontal: 12,
    },
    headerTitle: {
      fontSize: 18,
      fontWeight: '700',
      color: colors.text,
      letterSpacing: -0.3,
    },
    headerSubtitle: {
      fontSize: 11,
      color: colors.textSecondary,
      marginTop: 1,
    },
    headerRightBadge: {
      backgroundColor: colors.primarySoft,
      paddingHorizontal: 10,
      paddingVertical: 4,
      borderRadius: 12,
    },
    headerRightBadgeText: {
      fontSize: 12,
      fontWeight: '700',
      color: colors.primary,
    },
    searchBar: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: '#EBF0EB',
      borderRadius: 16,
      marginHorizontal: spacing.lg,
      marginVertical: spacing.sm,
      paddingHorizontal: 14,
      height: 46,
      gap: 10,
    },
    searchInput: {
      flex: 1,
      fontSize: 13,
      color: colors.text,
      paddingVertical: 0,
    },
    categoryContainer: {
      marginBottom: spacing.md,
    },
    categoryScroll: {
      paddingHorizontal: spacing.lg,
      gap: 8,
    },
    catChip: {
      paddingHorizontal: 14,
      paddingVertical: 7,
      borderRadius: 18,
      backgroundColor: '#EBF0EB',
    },
    catChipActive: {
      backgroundColor: colors.primary,
    },
    catChipText: {
      fontSize: 12,
      fontWeight: '600',
      color: colors.textSecondary,
    },
    catChipTextActive: {
      color: colors.white,
    },
    gridScroll: {
      paddingBottom: spacing.xxl,
    },
    grid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 8,
    },
    cropCard: {
      aspectRatio: 0.82,
      borderRadius: 16,
      overflow: 'hidden',
      backgroundColor: '#2A362D',
      position: 'relative',
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.08,
      shadowRadius: 6,
      elevation: 2,
    },
    cropCardPressed: {
      opacity: 0.9,
      transform: [{ scale: 0.97 }],
    },
    cropImage: {
      width: '100%',
      height: '100%',
    },
    pvCropBadge: {
      position: 'absolute',
      top: 5,
      left: 5,
      backgroundColor: 'rgba(20, 32, 23, 0.85)',
      paddingHorizontal: 5,
      paddingVertical: 2,
      borderRadius: 5,
      borderWidth: 0.5,
      borderColor: 'rgba(163, 230, 53, 0.4)',
    },
    pvCropBadgeText: {
      fontSize: 8.5,
      fontWeight: '800',
      color: '#A3E635',
      letterSpacing: 0.5,
    },
    cropLabelPill: {
      position: 'absolute',
      bottom: 5,
      left: 4,
      right: 4,
      backgroundColor: 'rgba(16, 26, 18, 0.90)',
      borderRadius: 8,
      paddingHorizontal: 4,
      paddingVertical: 3,
      alignItems: 'center',
      borderWidth: 0.5,
      borderColor: 'rgba(255, 255, 255, 0.15)',
    },
    cropLabelText: {
      fontSize: 10.5,
      fontWeight: '700',
      color: colors.white,
      textAlign: 'center',
    },
    cropClassesCountText: {
      fontSize: 8.5,
      fontWeight: '600',
      color: '#A3E635',
      marginTop: 0.5,
    },
    emptyContainer: {
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: 48,
    },
    emptyText: {
      fontSize: 15,
      fontWeight: '600',
      color: colors.text,
      marginBottom: 4,
    },
    emptySubtext: {
      fontSize: 13,
      color: colors.textSecondary,
      textAlign: 'center',
      paddingHorizontal: 20,
    },
  });
