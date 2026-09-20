import type { DiagnosisRecord } from '../types';
import { colors } from '../theme';

/**
 * Phytosanitary severity scale for the UI.
 * Derived ONLY from the record's status or a verified class (latin name) —
 * never invented for arbitrary photos.
 */
export type SeverityId = 'healthy' | 'mild' | 'moderate' | 'severe' | 'unknown';

export interface SeverityInfo {
  id: SeverityId;
  /** Short badge label in Russian. */
  label: string;
  color: string;
  soft: string;
}

export function severityForRecord(record: DiagnosisRecord): SeverityInfo {
  // Приоритет ответа модели
  if (record.severity) {
    if (record.severity === 'severe') {
      return { id: 'severe', label: 'Тяжёлая степень', color: colors.severitySevere, soft: colors.severitySevereSoft };
    }
    if (record.severity === 'moderate') {
      return { id: 'moderate', label: 'Умеренная степень', color: colors.severityModerate, soft: colors.severityModerateSoft };
    }
    if (record.severity === 'mild') {
      return { id: 'mild', label: 'Лёгкая степень', color: colors.severityModerate, soft: colors.severityModerateSoft };
    }
    if (record.severity === 'healthy') {
      return { id: 'healthy', label: 'Норма', color: colors.severityHealthy, soft: colors.severityHealthySoft };
    }
  }

  const latin = record.diagnosisClassLatin?.toLowerCase() ?? '';

  if (record.status === 'no_signs') {
    return { id: 'healthy', label: 'Норма', color: colors.severityHealthy, soft: colors.severityHealthySoft };
  }
  if (latin.includes('phytophthora')) {
    return { id: 'severe', label: 'Тяжёлая степень', color: colors.severitySevere, soft: colors.severitySevereSoft };
  }
  if (latin.includes('alternaria')) {
    return { id: 'moderate', label: 'Умеренная степень', color: colors.severityModerate, soft: colors.severityModerateSoft };
  }
  if (
    record.status === 'uncertain' ||
    record.status === 'insufficient_data' ||
    record.status === 'insufficient_quality'
  ) {
    return { id: 'unknown', label: 'Нужны данные', color: colors.info, soft: colors.infoSoft };
  }
  if (record.status === 'queued') {
    return { id: 'unknown', label: 'В очереди', color: colors.warning, soft: colors.warningSoft };
  }
  if (record.status === 'prediction' && record.diagnosisClass) {
    return { id: 'unknown', label: 'Предварительно', color: colors.info, soft: colors.infoSoft };
  }
  return { id: 'unknown', label: 'Без диагноза', color: colors.textSecondary, soft: '#EDF2EE' };
}
