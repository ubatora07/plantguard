import { useLocalSearchParams } from 'expo-router';
import {
  Scissors,
  Wind,
  Droplets,
  Sprout,
  AlertTriangle,
  ChevronRight,
} from 'lucide-react-native';
import React, { useState } from 'react';
import {
  Modal,
  StyleSheet,
  Text,
  View,
  Image,
} from 'react-native';
import { AppBadge } from '../components/ui/AppBadge';
import { AppButton } from '../components/ui/AppButton';
import { AppCard } from '../components/ui/AppCard';
import { AppScreen } from '../components/ui/AppScreen';
import { LeafVisual } from '../components/ui/LeafVisual';
import { ScreenHeader } from '../components/ui/ScreenHeader';
import { useHistory } from '../features/history/HistoryContext';
import { colors, radii, spacing } from '../theme';


import { i18n } from '../i18n';
import { useTheme, useStyles } from '../theme';
import { getConditionProfile, findProfileByDiagnosisClass, PlantConditionProfile } from '../data/knowledge-base';

export default function RecommendationsScreen() {
  const params = useLocalSearchParams<{ id?: string }>();
  const { records } = useHistory();
  const { colors } = useTheme();
  const styles = useStyles(createStyles);

  const record = records.find((r) => r.id === params.id) ?? records[0];
  const [selectedSimilar, setSelectedSimilar] = useState<PlantConditionProfile | null>(null);

  const currentProfile = record?.diagnosisClass ? findProfileByDiagnosisClass(record.diagnosisClass) : null;
  const similarProfiles = (currentProfile?.similarConditions || []).map(id => getConditionProfile(id)).filter(Boolean) as PlantConditionProfile[];

  // Recommendations: prioritize safe general recommendations from record or safe defaults
  const recommendations =
    record?.recommendations && record.recommendations.length > 0
      ? record.recommendations
      : [
          'Удалите сильно поражённые листья',
          'Обеспечьте хорошую вентиляцию',
          'Избегайте избыточного полива',
          'При необходимости обратитесь к агроному для подтверждения',
        ];

  const getIconForIndex = (index: number) => {
    switch (index % 4) {
      case 0:
        return <Scissors size={20} color={colors.primary} strokeWidth={2.2} />;
      case 1:
        return <Wind size={20} color={colors.primary} strokeWidth={2.2} />;
      case 2:
        return <Droplets size={20} color={colors.primary} strokeWidth={2.2} />;
      default:
        return <Sprout size={20} color={colors.primary} strokeWidth={2.2} />;
    }
  };

  return (
    <AppScreen padded={true}>
      <ScreenHeader title="Рекомендации" />

      {/* Origin Banner */}
      {record?.resultOrigin === 'model_prediction' ? (
        <View style={styles.originRow}>
          <AppBadge label="PlantGuard AI" variant="success" />
        </View>
      ) : null}

      {/* Section: "Что делать?" */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Что делать?</Text>
        <View style={styles.cardsList}>
          {recommendations.map((item, idx) => (
            <AppCard key={idx} style={styles.recommendationCard}>
              <View style={styles.recIconCircle}>{getIconForIndex(idx)}</View>
              <Text style={styles.recText}>{item}</Text>
            </AppCard>
          ))}
        </View>
      </View>

      {/* Warning Box: "Важно" */}
      <AppCard style={styles.warningCard}>
        <View style={styles.warningHeader}>
          <View style={styles.warningIconCircle}>
            <AlertTriangle size={18} color="#D97706" strokeWidth={2.4} />
          </View>
          <Text style={styles.warningTitle}>Важно</Text>
        </View>
        <Text style={styles.warningText}>
          Это предварительная оценка. Для точного диагноза и назначения средств защиты обратитесь к специалисту. Приложение не назначает химикаты и дозировки.
        </Text>
      </AppCard>

      {/* Agronomic Sources Card */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Источники рекомендаций</Text>
        <AppCard variant="surface" style={styles.sourcesCard}>
          <View style={styles.sourceItem}>
            <Text style={styles.sourceName}>Cornell Vegetable MD Online</Text>
            <Text style={styles.sourceDesc}>Диагностические ключи заболеваний томатов (CCE)</Text>
          </View>
          <View style={styles.sourceItem}>
            <Text style={styles.sourceName}>UC IPM Tomato Guidelines</Text>
            <Text style={styles.sourceDesc}>Интегрированная защита растений Университета Калифорнии</Text>
          </View>
          <View style={styles.sourceItem}>
            <Text style={styles.sourceName}>FAO Integrated Pest Management</Text>
            <Text style={styles.sourceDesc}>Международные стандарты защиты овощных культур</Text>
          </View>
        </AppCard>
      </View>

      {/* Section: "Похожие заболевания" */}
      {similarProfiles.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Похожие заболевания</Text>
          <View style={styles.similarList}>
            {similarProfiles.map((disease) => (
              <AppCard
                key={disease.id}
                onPress={() => setSelectedSimilar(disease)}
                style={styles.similarCard}>
                
                {disease.referenceImages && disease.referenceImages.length > 0 ? (
                  <Image source={{ uri: disease.referenceImages[0] }} style={styles.similarThumb} />
                ) : (
                  <View style={styles.similarThumb}>
                    <LeafVisual type="uncertain" width={50} height={50} />
                  </View>
                )}

                <View style={styles.similarInfo}>
                  <Text style={styles.similarName}>{disease.label}</Text>
                  <Text style={styles.similarLatin}>{disease.latinName}</Text>
                </View>

                <ChevronRight size={20} color={colors.textSecondary} strokeWidth={2} />
              </AppCard>
            ))}
          </View>
        </View>
      )}


      {/* Similar Disease Detail Modal */}
      <Modal
        visible={Boolean(selectedSimilar)}
        animationType="fade"
        transparent={true}
        onRequestClose={() => setSelectedSimilar(null)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            {selectedSimilar && (
              <>
                <View style={styles.modalThumbCenter}>
                  {selectedSimilar.referenceImages && selectedSimilar.referenceImages.length > 0 ? (
                    <Image source={{ uri: selectedSimilar.referenceImages[0] }} style={{ width: 90, height: 90, borderRadius: 16 }} />
                  ) : (
                    <LeafVisual type="uncertain" width={90} height={90} />
                  )}
                </View>
                <Text style={styles.modalTitle}>{selectedSimilar.label}</Text>
                <Text style={styles.modalLatin}>{selectedSimilar.latinName}</Text>
                <Text style={styles.modalDesc}>{selectedSimilar.description}</Text>

                <AppButton
                  label="Закрыть"
                  onPress={() => setSelectedSimilar(null)}
                  style={styles.modalButton}
                />
              </>
            )}
          </View>
        </View>
      </Modal>
    </AppScreen>
  );
}

const createStyles = ({ colors, radii, spacing }: any) => StyleSheet.create({
  section: {
    marginBottom: spacing.lg,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 12,
  },
  cardsList: {
    gap: 10,
  },
  recommendationCard: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 16,
  },
  recIconCircle: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: colors.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  recText: {
    flex: 1,
    fontSize: 14,
    fontWeight: '500',
    color: colors.text,
    lineHeight: 20,
  },
  warningCard: {
    backgroundColor: colors.warningSoft,
    borderColor: '#F0DCA8',
    padding: spacing.md,
    marginBottom: spacing.xl,
  },
  warningHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 6,
  },
  warningIconCircle: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: '#FBEDC4',
    alignItems: 'center',
    justifyContent: 'center',
  },
  warningTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.warning,
  },
  warningText: {
    fontSize: 13,
    color: '#6B4E00',
    lineHeight: 19,
  },
  similarList: {
    gap: 10,
    marginBottom: 32,
  },
  similarCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
  },
  similarThumb: {
    width: 50,
    height: 50,
    borderRadius: radii.input,
    overflow: 'hidden',
    backgroundColor: colors.photoPlaceholder,
    marginRight: 12,
  },
  similarInfo: {
    flex: 1,
  },
  similarName: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 2,
  },
  similarLatin: {
    fontSize: 12,
    fontStyle: 'italic',
    color: colors.textSecondary,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.55)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  modalContent: {
    width: '100%',
    backgroundColor: colors.surface,
    borderRadius: radii.card,
    padding: 24,
    alignItems: 'center',
  },
  modalThumbCenter: {
    marginBottom: 16,
    borderRadius: 16,
    overflow: 'hidden',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 2,
  },
  modalLatin: {
    fontSize: 13,
    fontStyle: 'italic',
    color: colors.textSecondary,
    marginBottom: 14,
  },
  modalDesc: {
    fontSize: 14,
    color: colors.text,
    lineHeight: 21,
    textAlign: 'center',
    marginBottom: 20,
  },
  modalButton: {
    width: '100%',
  },
  originRow: {
    marginBottom: spacing.md,
  },
  sourcesCard: {
    padding: spacing.md,
    gap: 12,
  },
  sourceItem: {
    gap: 2,
  },
  sourceName: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
  },
  sourceDesc: {
    fontSize: 12,
    color: colors.textSecondary,
    lineHeight: 16,
  },
});

