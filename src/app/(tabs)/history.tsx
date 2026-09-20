import { useRouter } from 'expo-router';
import {
  SlidersHorizontal,
  Search,
  ChevronRight,
  Sparkles,
  Trash2,
} from 'lucide-react-native';
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
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ASSETS } from '../../constants/assets';
import { getPlantVillageImage } from '../../data/plantvillage-images';
import { useHistory } from '../../features/history/HistoryContext';
import { useSettings } from '../../features/settings/SettingsContext';
import i18n from '../../i18n';
import { useTheme, useStyles } from '../../theme';
import { ConfirmDeleteModal } from '../../components/ui/ConfirmDeleteModal';

interface HistoryDisplayItem {
  id: string;
  title: string;
  crop: string;
  cropKey: string;
  dateStr: string;
  image: any;
  confidence?: number;
  latin?: string;
  desc?: string;
}

export default function HistoryScreen() {
  const router = useRouter();
  const { records, removeRecord, clearAll } = useHistory();
  const { language } = useSettings();
  const { colors } = useTheme();
  const styles = useStyles(createStyles);

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCrop, setSelectedCrop] = useState('all');

  const [deleteTarget, setDeleteTarget] = useState<{ id: string; title: string } | null>(null);
  const [isClearAllVisible, setIsClearAllVisible] = useState(false);

  const handleDeleteItem = (id: string, title: string) => {
    setDeleteTarget({ id, title });
  };

  const handleClearAll = () => {
    setIsClearAllVisible(true);
  };

  const chipFilters = useMemo(() => [
    { id: 'all', label: i18n.t('history.filter_all') },
    { id: 'tomato', label: i18n.t('crops.names.tomato') },
    { id: 'apple', label: i18n.t('crops.names.apple') },
    { id: 'potato', label: i18n.t('crops.names.potato') },
    { id: 'grape', label: i18n.t('crops.names.grape') },
    { id: 'cherry', label: i18n.t('crops.names.cherry') },
  ], [language]);

  const localeCode = language === 'kk' ? 'kk-KZ' : language === 'en' ? 'en-US' : 'ru-RU';

  // Real items from user scans
  const allItems: HistoryDisplayItem[] = useMemo(() => {
    return records.map((r) => {
      const isHealthy =
        r.diagnosisClass?.toLowerCase().includes('healthy') ||
        r.diagnosisClass?.toLowerCase().includes('сау') ||
        r.diagnosisClass?.toLowerCase().includes('здоров');
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
        title: r.diagnosisClass ?? (language === 'kk' ? 'Жапырақты тексеру' : language === 'en' ? 'Leaf Analysis' : 'Проверка листа'),
        crop: r.crop ?? (language === 'kk' ? 'Өсімдік' : language === 'en' ? 'Plant' : 'Растение'),
        cropKey: r.cropId ?? 'tomato',
        dateStr: new Date(r.createdAt).toLocaleDateString(localeCode, {
          day: 'numeric',
          month: 'long',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
        }),
        image: img,
        confidence: r.confidence,
        latin: r.diagnosisClassLatin,
        desc: r.explanation,
      };
    });
  }, [records, language, localeCode]);

  // Filter based on search query and selected chip
  const filteredItems = useMemo(() => {
    return allItems.filter((item) => {
      const matchSearch =
        searchQuery.trim() === '' ||
        item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.crop.toLowerCase().includes(searchQuery.toLowerCase());

      const matchCrop =
        selectedCrop === 'all' ||
        item.cropKey === selectedCrop;

      return matchSearch && matchCrop;
    });
  }, [allItems, searchQuery, selectedCrop]);

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      {/* Top Header */}
      <View style={styles.header}>
        <View style={styles.headerTitleGroup}>
          <Text style={styles.headerTitle}>{i18n.t('history.title')}</Text>
          {records.length > 0 ? (
            <View style={styles.countBadge}>
              <Text style={styles.countBadgeText}>{records.length}</Text>
            </View>
          ) : null}
        </View>

        <View style={styles.headerActions}>
          {records.length > 0 ? (
            <Pressable
              style={styles.clearAllBtn}
              onPress={handleClearAll}
              hitSlop={8}
              accessibilityLabel={i18n.t('history.clear_all')}
              accessibilityRole="button">
              <Trash2 size={15} color="#DC2626" strokeWidth={2.2} />
              <Text style={styles.clearAllBtnText}>{i18n.t('history.clear_all')}</Text>
            </Pressable>
          ) : null}
          <Pressable
            style={styles.filterBtn}
            hitSlop={8}
            accessibilityLabel="Filter">
            <SlidersHorizontal size={18} color={colors.text} strokeWidth={2.2} />
          </Pressable>
        </View>
      </View>

      {/* Search Bar */}
      <View style={styles.searchBar}>
        <Search size={18} color="#7A8B7E" strokeWidth={2.2} />
        <TextInput
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholder={i18n.t('history.search_placeholder')}
          placeholderTextColor="#7A8B7E"
          style={styles.searchInput}
        />
      </View>

      {/* Filter Chips Row */}
      <View style={styles.chipsContainer}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.chipsScroll}>
          {chipFilters.map((chip) => {
            const isActive = selectedCrop === chip.id;
            return (
              <Pressable
                key={chip.id}
                onPress={() => setSelectedCrop(chip.id)}
                style={[styles.chip, isActive && styles.chipActive]}
                accessibilityRole="button">
                <Text
                  style={[styles.chipText, isActive && styles.chipTextActive]}>
                  {chip.label}
                </Text>
              </Pressable>
            );
          })}
        </ScrollView>
      </View>

      {/* History Items List */}
      <ScrollView
        contentContainerStyle={styles.listScroll}
        showsVerticalScrollIndicator={false}>
        {filteredItems.map((item) => (
          <Pressable
            key={item.id}
            onPress={() =>
              router.push({
                pathname: '/result',
                params: { id: item.id },
              })
            }
            style={({ pressed }) => [
              styles.itemCard,
              pressed && styles.itemCardPressed,
            ]}>
            {/* Thumbnail */}
            <View style={styles.thumbWrapper}>
              <Image source={item.image} style={styles.thumbImage} resizeMode="cover" />
            </View>

            {/* Info Column */}
            <View style={styles.infoCol}>
              <Text style={styles.itemTitle}>{item.title}</Text>
              <Text style={styles.itemCrop}>{item.crop}</Text>
              <Text style={styles.itemDate}>{item.dateStr}</Text>
            </View>

            {/* Quick Delete Item Button */}
            <Pressable
              onPress={(e) => {
                e.stopPropagation?.();
                handleDeleteItem(item.id, item.title);
              }}
              style={styles.itemDeleteBtn}
              hitSlop={8}
              accessibilityLabel="Удалить запись"
              accessibilityRole="button">
              <Trash2 size={16} color="#9CA3AF" strokeWidth={2.2} />
            </Pressable>

            {/* Chevron */}
            <ChevronRight size={18} color="#A6B5A9" strokeWidth={2.2} />
          </Pressable>
        ))}

        {records.length === 0 ? (
          <View style={styles.emptyState}>
            <Sparkles size={36} color={colors.primary} style={{ marginBottom: 12 }} />
            <Text style={styles.emptyTitle}>{i18n.t('history.empty')}</Text>
            <Text style={styles.emptyText}>{i18n.t('history.empty_desc')}</Text>
            <Pressable
              style={styles.scanBtn}
              onPress={() => router.push('/camera')}>
              <Text style={styles.scanBtnText}>{i18n.t('home.scan_button')}</Text>
            </Pressable>
          </View>
        ) : filteredItems.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyText}>{i18n.t('history.no_results')}</Text>
          </View>
        ) : null}
      </ScrollView>

      {/* Custom styled single record delete confirmation modal */}
      <ConfirmDeleteModal
        visible={Boolean(deleteTarget)}
        title={language === 'kk' ? 'Жазбаны өшіру' : language === 'en' ? 'Delete Record' : 'Удалить запись'}
        message={
          language === 'kk'
            ? `«${deleteTarget?.title}» жазбасын тарихтан өшіруді растайсыз ба?`
            : language === 'en'
            ? `Are you sure you want to delete "${deleteTarget?.title}" from history?`
            : `Удалить «${deleteTarget?.title}» из истории?`
        }
        confirmText={language === 'kk' ? 'Өшіру' : language === 'en' ? 'Delete' : 'Удалить'}
        cancelText={language === 'kk' ? 'Бас тарту' : language === 'en' ? 'Cancel' : 'Отмена'}
        onConfirm={async () => {
          if (deleteTarget) {
            await removeRecord(deleteTarget.id);
            setDeleteTarget(null);
          }
        }}
        onCancel={() => setDeleteTarget(null)}
      />

      {/* Custom styled clear all records confirmation modal */}
      <ConfirmDeleteModal
        visible={isClearAllVisible}
        title={language === 'kk' ? 'Тарихты тазалау' : language === 'en' ? 'Clear History' : 'Очистить историю'}
        message={
          language === 'kk'
            ? 'Барлық талдау тарихын толық өшіргіңіз келе ме?'
            : language === 'en'
            ? 'Are you sure you want to delete all diagnosis history? This cannot be undone.'
            : 'Вы уверены, что хотите полностью очистить историю анализов? Это действие необратимо.'
        }
        confirmText={language === 'kk' ? 'Тазалау' : language === 'en' ? 'Clear All' : 'Очистить всё'}
        cancelText={language === 'kk' ? 'Бас тарту' : language === 'en' ? 'Cancel' : 'Отмена'}
        onConfirm={async () => {
          await clearAll();
          setIsClearAllVisible(false);
        }}
        onCancel={() => setIsClearAllVisible(false)}
      />
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
    headerTitleGroup: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
    },
    headerTitle: {
      fontSize: 26,
      fontWeight: '700',
      color: colors.text,
      letterSpacing: -0.4,
    },
    countBadge: {
      backgroundColor: '#DCFCE7',
      borderRadius: 12,
      paddingHorizontal: 8,
      paddingVertical: 2,
    },
    countBadgeText: {
      fontSize: 12,
      fontWeight: '700',
      color: '#15803D',
    },
    headerActions: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
    },
    clearAllBtn: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 5,
      backgroundColor: '#FEE2E2',
      paddingHorizontal: 10,
      paddingVertical: 7,
      borderRadius: 12,
    },
    clearAllBtnText: {
      fontSize: 12,
      fontWeight: '700',
      color: '#DC2626',
    },
    filterBtn: {
      width: 38,
      height: 38,
      borderRadius: 12,
      backgroundColor: '#EAEFEA',
      alignItems: 'center',
      justifyContent: 'center',
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
      fontSize: 14,
      color: colors.text,
      paddingVertical: 0,
    },
    chipsContainer: {
      marginBottom: spacing.md,
    },
    chipsScroll: {
      paddingHorizontal: spacing.lg,
      gap: 8,
    },
    chip: {
      paddingHorizontal: 16,
      paddingVertical: 8,
      borderRadius: 20,
      backgroundColor: '#EBF0EB',
    },
    chipActive: {
      backgroundColor: colors.primary,
    },
    chipText: {
      fontSize: 13,
      fontWeight: '500',
      color: colors.textSecondary,
    },
    chipTextActive: {
      color: colors.white,
      fontWeight: '600',
    },
    listScroll: {
      paddingHorizontal: spacing.lg,
      paddingBottom: spacing.xxl,
      gap: 12,
    },
    itemCard: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: colors.surface,
      borderRadius: 20,
      padding: 14,
      borderWidth: 1,
      borderColor: colors.border,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.04,
      shadowRadius: 6,
      elevation: 2,
    },
    itemCardPressed: {
      opacity: 0.9,
      transform: [{ scale: 0.99 }],
    },
    thumbWrapper: {
      width: 58,
      height: 58,
      borderRadius: 14,
      overflow: 'hidden',
      backgroundColor: '#E2EBE4',
      marginRight: 14,
    },
    thumbImage: {
      width: '100%',
      height: '100%',
    },
    infoCol: {
      flex: 1,
      justifyContent: 'center',
    },
    itemTitle: {
      fontSize: 15,
      fontWeight: '700',
      color: colors.text,
      letterSpacing: -0.2,
      marginBottom: 2,
    },
    itemCrop: {
      fontSize: 13,
      color: colors.textSecondary,
      marginBottom: 2,
    },
    itemDate: {
      fontSize: 11,
      color: colors.textMuted,
    },
    itemDeleteBtn: {
      padding: 8,
      borderRadius: 10,
      marginRight: 4,
    },
    emptyState: {
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: 56,
      paddingHorizontal: 24,
    },
    emptyTitle: {
      fontSize: 18,
      fontWeight: '700',
      color: colors.text,
      marginBottom: 6,
      textAlign: 'center',
    },
    emptyText: {
      fontSize: 14,
      color: colors.textSecondary,
      textAlign: 'center',
      lineHeight: 20,
      marginBottom: 20,
    },
    scanBtn: {
      backgroundColor: colors.primary,
      paddingHorizontal: 20,
      paddingVertical: 12,
      borderRadius: 14,
    },
    scanBtnText: {
      color: '#FFFFFF',
      fontWeight: '600',
      fontSize: 15,
    },
  });
