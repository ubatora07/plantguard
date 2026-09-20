import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { TrendingDown, TrendingUp, ShieldCheck, DollarSign } from 'lucide-react-native';
import { useTheme, useStyles } from '../../theme';
import { useSettings } from '../../features/settings/SettingsContext';
import type { EconomicImpact } from '../../types';

interface EconomicCardProps {
  impact: EconomicImpact;
  cropName: string;
  isHealthy?: boolean;
}

export function EconomicCard({ impact, cropName, isHealthy }: EconomicCardProps) {
  const { colors } = useTheme();
  const { language } = useSettings();
  const styles = useStyles(createStyles);

  if (isHealthy) {
    return (
      <View style={styles.card}>
        <View style={styles.headerRow}>
          <View style={styles.iconCircleSuccess}>
            <ShieldCheck size={20} color="#15803D" strokeWidth={2.4} />
          </View>
          <View style={styles.headerText}>
            <Text style={styles.cardTitle}>
              {language === 'kk' ? 'Егіс денсаулығының экономикасы' : language === 'en' ? 'Crop Health Economics' : 'Экономика здоровья посевов'}
            </Text>
            <Text style={styles.cardSubtitle}>
              {language === 'kk' ? 'Тұрақты мониторинг шығынды азайтады' : language === 'en' ? 'Regular scouting saves budget' : 'Регулярный мониторинг экономит бюджет'}
            </Text>
          </View>
        </View>
        <View style={styles.healthyBanner}>
          <Text style={styles.healthyText}>
            {language === 'kk'
              ? 'Өнім 100% сақталды. Профилактикалық биоөңдеу кенеттен пайда болатын ауру қаупін 85%-ға төмендетеді.'
              : language === 'en'
              ? 'Yield preserved at 100%. Preventative bio-treatments reduce disease outbreak risk by 85%.'
              : 'Урожай сохранён на 100%. Профилактические биообработки снижают риск внезапных вспышек на 85%.'}
          </Text>
        </View>
      </View>
    );
  }

  const lossFormatted = impact.estimatedLossRubPerHa.toLocaleString('ru-RU');
  const costFormatted = impact.treatmentCostRubPerHa.toLocaleString('ru-RU');

  return (
    <View style={styles.card}>
      <View style={styles.headerRow}>
        <View style={styles.iconCircleWarning}>
          <TrendingDown size={20} color="#B45309" strokeWidth={2.4} />
        </View>
        <View style={styles.headerText}>
          <Text style={styles.cardTitle}>
            {language === 'kk' ? 'Экономикалық болжам (1 га)' : language === 'en' ? 'Economic Forecast (per 1 ha)' : 'Экономический прогноз (на 1 га)'}
          </Text>
          <Text style={styles.cardSubtitle}>
            {language === 'kk' ? 'Баға мен түсім нормативі бойынша (теңге)' : language === 'en' ? 'Yield & market benchmark calculation (₸)' : 'Расчет по нормативам урожайности и цен (в тенге)'}
          </Text>
        </View>
      </View>

      <View style={styles.metricsGrid}>
        {/* Metric 1: Potential Loss */}
        <View style={styles.metricItem}>
          <Text style={styles.metricLabel}>
            {language === 'kk' ? 'Шарасыз шығын' : language === 'en' ? 'Loss without action' : 'Потери без мер'}
          </Text>
          <Text style={styles.metricValueDanger}>-{impact.estimatedLossPercent}%</Text>
          <Text style={styles.metricSub}>~{lossFormatted} ₸/га</Text>
        </View>

        {/* Metric 2: Treatment Cost */}
        <View style={styles.metricItem}>
          <Text style={styles.metricLabel}>
            {language === 'kk' ? 'Биоқорғаныс (FAO)' : language === 'en' ? 'Bio-Protection (FAO)' : 'Биозащита (FAO)'}
          </Text>
          <Text style={styles.metricValueNeutral}>~{costFormatted} ₸</Text>
          <Text style={styles.metricSub}>
            {language === 'kk' ? 'биоөңдеу/га' : language === 'en' ? 'bioprotection/ha' : 'биозащита/га'}
          </Text>
        </View>

        {/* Metric 3: ROI */}
        <View style={styles.metricItem}>
          <Text style={styles.metricLabel}>
            {language === 'kk' ? 'Өтелімділік (ROI)' : language === 'en' ? 'Return (ROI)' : 'Окупаемость (ROI)'}
          </Text>
          <Text style={styles.metricValueSuccess}>{impact.roiMultiplier}x</Text>
          <Text style={styles.metricSub}>
            {language === 'kk' ? 'үнемделген қаражат' : language === 'en' ? 'capital saved' : 'сохранённых средств'}
          </Text>
        </View>
      </View>

      <View style={styles.faoBadgeRow}>
        <ShieldCheck size={14} color={colors.primary} strokeWidth={2.2} />
        <Text style={styles.faoText}>
          {language === 'kk'
            ? 'Ұсынылған биопротокол алғашқы апталарда өз шығынын толық ақтайды.'
            : language === 'en'
            ? 'Recommended bio-protection protocol pays off investment within the first few weeks.'
            : 'Рекомендованный биопротокол окупает затраты в первые недели применения.'}
        </Text>
      </View>
    </View>
  );
}

const createStyles = ({ colors, radii, spacing, typography }: any) =>
  StyleSheet.create({
    card: {
      backgroundColor: colors.surface,
      borderRadius: radii.card,
      borderWidth: 1,
      borderColor: colors.border,
      padding: spacing.md,
      marginVertical: spacing.sm,
    },
    headerRow: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: spacing.md,
      gap: spacing.sm,
    },
    iconCircleWarning: {
      width: 36,
      height: 36,
      borderRadius: 18,
      backgroundColor: '#FEF3C7',
      alignItems: 'center',
      justifyContent: 'center',
    },
    iconCircleSuccess: {
      width: 36,
      height: 36,
      borderRadius: 18,
      backgroundColor: '#DCFCE7',
      alignItems: 'center',
      justifyContent: 'center',
    },
    headerText: {
      flex: 1,
    },
    cardTitle: {
      ...typography.bodyBold,
      color: colors.text,
    },
    cardSubtitle: {
      ...typography.caption,
      color: colors.textSecondary,
    },
    metricsGrid: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      backgroundColor: colors.background,
      borderRadius: radii.sm,
      padding: spacing.sm,
      marginBottom: spacing.sm,
    },
    metricItem: {
      flex: 1,
      alignItems: 'center',
    },
    metricLabel: {
      fontSize: 11,
      color: colors.textSecondary,
      marginBottom: 2,
    },
    metricValueDanger: {
      fontSize: 16,
      fontWeight: '700',
      color: colors.danger,
    },
    metricValueNeutral: {
      fontSize: 16,
      fontWeight: '700',
      color: colors.text,
    },
    metricValueSuccess: {
      fontSize: 16,
      fontWeight: '700',
      color: '#15803D',
    },
    metricSub: {
      fontSize: 10,
      color: colors.textSecondary,
      marginTop: 2,
    },
    faoBadgeRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
      marginTop: 4,
    },
    faoText: {
      fontSize: 11,
      color: colors.textSecondary,
      flex: 1,
      lineHeight: 15,
    },
    healthyBanner: {
      backgroundColor: '#DCFCE7',
      padding: spacing.sm,
      borderRadius: radii.sm,
    },
    healthyText: {
      fontSize: 12,
      color: '#166534',
      lineHeight: 18,
    },
  });
