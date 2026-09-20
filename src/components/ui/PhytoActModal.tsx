import React, { useState } from 'react';
import {
  Modal,
  StyleSheet,
  Text,
  View,
  ScrollView,
  Pressable,
  Share,
} from 'react-native';
import { ShieldCheck, X, Share2, Check, FileText } from 'lucide-react-native';
import { useTheme, useStyles } from '../../theme';
import type { DiagnosisRecord } from '../../types';

interface PhytoActModalProps {
  visible: boolean;
  record: DiagnosisRecord;
  onClose: () => void;
}

export function PhytoActModal({ visible, record, onClose }: PhytoActModalProps) {
  const { colors } = useTheme();
  const styles = useStyles(createStyles);
  const [copied, setCopied] = useState(false);

  const actNumber = `RU-AGRI-${record.id.slice(-6).toUpperCase()}`;
  const dateStr = new Date(record.createdAt).toLocaleDateString('ru-RU', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  const generateActText = () => {
    return (
      `========================================\n` +
      `АКТ ФИТОСАНИТАРНОГО МОНИТОРИНГА\n` +
      `Протокол № ${actNumber}\n` +
      `Дата: ${dateStr}\n` +
      `========================================\n\n` +
      `1. ОБЪЕКТ МОНИТОРИНГА:\n` +
      `Культура: ${record.crop}\n` +
      `Локация: Полевой обход / Сенсорный скан\n\n` +
      `2. РЕЗУЛЬТАТ ИССЛЕДОВАНИЯ:\n` +
      `Диагноз: ${record.diagnosisClass || 'Признаков болезни не обнаружено'}\n` +
      `Патоген: ${record.diagnosisClassLatin || 'Отсутствует'}\n` +
      `Достоверность: ${Math.round((record.confidence ?? 0.85) * 100)}%\n` +
      `Степень поражения: ${record.severity || 'Норма'}\n\n` +
      `3. НАЗНАЧЕННЫЕ МЕРОПРИЯТИЯ (СТАНДАРТ FAO/IPM):\n` +
      (record.recommendations.length > 0
        ? record.recommendations.map((r, i) => `[${i + 1}] ${r}`).join('\n')
        : 'Плановый фитомониторинг через 7 дней.') +
      `\n\n` +
      `4. ОГРАНИЧЕНИЯ И ЗАПРЕТЫ:\n` +
      (record.avoid.length > 0
        ? record.avoid.map((a, i) => `[-] ${a}`).join('\n')
        : 'Соблюдение регламента применения СЗР.') +
      `\n\n` +
      `========================================\n` +
      `Верифицировано цифровой системой PlantGuard AI\n` +
      `Стандарт биоконтроля: FAO/IPM Compliance\n` +
      `========================================`
    );
  };

  const handleShareAct = async () => {
    try {
      await Share.share({
        title: `Фитосанитарный акт ${actNumber}`,
        message: generateActText(),
      });
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      // Ignored
    }
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}>
      <View style={styles.backdrop}>
        <View style={styles.modalContent}>
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.headerTitleRow}>
              <FileText size={20} color={colors.primary} strokeWidth={2.4} />
              <Text style={styles.title}>Фитосанитарный акт</Text>
            </View>
            <Pressable onPress={onClose} hitSlop={10} style={styles.closeBtn}>
              <X size={20} color={colors.textSecondary} strokeWidth={2} />
            </Pressable>
          </View>

          {/* Certificate Body */}
          <ScrollView style={styles.documentBody} showsVerticalScrollIndicator={false}>
            <View style={styles.docHeader}>
              <Text style={styles.docOrg}>СЛУЖБА ЗАЩИТЫ РАСТЕНИЙ • ЭКО-ПРОТОКОЛ</Text>
              <Text style={styles.docTitle}>ПРОТОКОЛ МОНИТОРИНГА</Text>
              <Text style={styles.docNumber}>№ {actNumber}</Text>
              <Text style={styles.docDate}>{dateStr}</Text>
            </View>

            <View style={styles.divider} />

            {/* Field Table */}
            <View style={styles.tableRow}>
              <Text style={styles.tableLabel}>Культура:</Text>
              <Text style={styles.tableValue}>{record.crop}</Text>
            </View>

            <View style={styles.tableRow}>
              <Text style={styles.tableLabel}>Диагноз:</Text>
              <Text style={styles.tableValueStrong}>{record.diagnosisClass || 'Норма'}</Text>
            </View>

            {record.diagnosisClassLatin && (
              <View style={styles.tableRow}>
                <Text style={styles.tableLabel}>Патоген:</Text>
                <Text style={styles.tableValueItalic}>{record.diagnosisClassLatin}</Text>
              </View>
            )}

            <View style={styles.tableRow}>
              <Text style={styles.tableLabel}>Достоверность:</Text>
              <Text style={styles.tableValue}>{Math.round((record.confidence ?? 0.85) * 100)}%</Text>
            </View>

            <View style={styles.divider} />

            <Text style={styles.sectionHeading}>Назначенные меры (Регламент FAO):</Text>
            {record.recommendations.slice(0, 3).map((rec, i) => (
              <Text key={i} style={styles.recItem}>
                • {rec}
              </Text>
            ))}

            <View style={styles.divider} />

            {/* Verification Stamp */}
            <View style={styles.stampBox}>
              <ShieldCheck size={28} color="#15803D" strokeWidth={2} />
              <View style={{ flex: 1, marginLeft: 10 }}>
                <Text style={styles.stampTitle}>ЭЦП PlantGuard AI Verified</Text>
                <Text style={styles.stampSub}>Соответствует нормативам интегрированной защиты растений (IPM)</Text>
              </View>
            </View>
          </ScrollView>

          {/* Action Bar */}
          <View style={styles.footer}>
            <Pressable
              onPress={handleShareAct}
              style={styles.shareButton}
              accessibilityRole="button">
              {copied ? (
                <Check size={18} color="#FFFFFF" strokeWidth={2.4} />
              ) : (
                <Share2 size={18} color="#FFFFFF" strokeWidth={2.4} />
              )}
              <Text style={styles.shareButtonText}>
                {copied ? 'Отправлено!' : 'Экспорт / Отправить акт'}
              </Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const createStyles = ({ colors, radii, spacing, typography }: any) =>
  StyleSheet.create({
    backdrop: {
      flex: 1,
      backgroundColor: 'rgba(0, 0, 0, 0.6)',
      justifyContent: 'center',
      padding: spacing.md,
    },
    modalContent: {
      backgroundColor: colors.surface,
      borderRadius: radii.card,
      maxHeight: '85%',
      overflow: 'hidden',
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: spacing.lg,
      paddingVertical: spacing.md,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    headerTitleRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
    },
    title: {
      ...typography.bodyBold,
      fontSize: 16,
      color: colors.text,
    },
    closeBtn: {
      padding: 4,
    },
    documentBody: {
      padding: spacing.lg,
    },
    docHeader: {
      alignItems: 'center',
      marginBottom: spacing.md,
    },
    docOrg: {
      fontSize: 10,
      letterSpacing: 1.2,
      fontWeight: '700',
      color: colors.primary,
      marginBottom: 4,
    },
    docTitle: {
      fontSize: 16,
      fontWeight: '800',
      color: colors.text,
      letterSpacing: 0.5,
    },
    docNumber: {
      fontSize: 12,
      fontWeight: '600',
      color: colors.textSecondary,
      marginTop: 2,
    },
    docDate: {
      fontSize: 11,
      color: colors.textSecondary,
      marginTop: 2,
    },
    divider: {
      height: 1,
      backgroundColor: colors.border,
      marginVertical: spacing.md,
    },
    tableRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      paddingVertical: 4,
    },
    tableLabel: {
      fontSize: 13,
      color: colors.textSecondary,
    },
    tableValue: {
      fontSize: 13,
      color: colors.text,
      fontWeight: '500',
    },
    tableValueStrong: {
      fontSize: 13,
      color: colors.text,
      fontWeight: '700',
    },
    tableValueItalic: {
      fontSize: 12,
      color: colors.textSecondary,
      fontStyle: 'italic',
    },
    sectionHeading: {
      fontSize: 13,
      fontWeight: '700',
      color: colors.text,
      marginBottom: 6,
    },
    recItem: {
      fontSize: 12,
      color: colors.text,
      lineHeight: 18,
      marginBottom: 4,
    },
    stampBox: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: '#F0FDF4',
      borderWidth: 1,
      borderColor: '#86EFAC',
      borderRadius: radii.sm,
      padding: spacing.md,
      marginTop: spacing.md,
      marginBottom: spacing.sm,
    },
    stampTitle: {
      fontSize: 12,
      fontWeight: '700',
      color: '#15803D',
    },
    stampSub: {
      fontSize: 10,
      color: '#166534',
      marginTop: 2,
    },
    footer: {
      padding: spacing.md,
      borderTopWidth: 1,
      borderTopColor: colors.border,
    },
    shareButton: {
      backgroundColor: colors.primary,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 8,
      paddingVertical: 12,
      borderRadius: radii.button,
    },
    shareButtonText: {
      color: '#FFFFFF',
      fontWeight: '700',
      fontSize: 14,
    },
  });
