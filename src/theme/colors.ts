/**
 * Color tokens — AGRO-SCAN botanical palette (design spec §"Спецификация дизайн-токенов").
 *
 * Semantics:
 * - `primary` family — deep conifer green, key actions and accents (9.2:1 on surface).
 * - `text`/`textSecondary` — slate/moss greys, AAA contrast for field use.
 * - `severity` scale — phytosanitary risk levels (healthy → severe).
 */
export const colors = {
  primary: '#245B38',
  primaryDark: '#183F27',
  primarySoft: '#E7F2EB',
  primaryAccent: '#2E7D47',
  background: '#F5F7F5',
  surface: '#FFFFFF',
  card: '#FFFFFF',
  surfaceSubtle: '#F8FAF8',
  text: '#152418',
  textSecondary: '#667768',
  textMuted: '#92A195',
  border: '#E3EAE4',

  // Phytosanitary severity scale
  severityHealthy: '#245B38',
  severityHealthySoft: '#E7F2EB',
  severityMild: '#D97706',
  severityMildSoft: '#FEF3C7',
  severityModerate: '#E65100',
  severityModerateSoft: '#FFEDD5',
  severitySevere: '#DC2626',
  severitySevereSoft: '#FEE2E2',

  // Functional colors
  success: '#245B38',
  successSoft: '#E7F2EB',
  warning: '#D97706',
  warningSoft: '#FEF3C7',
  danger: '#DC2626',
  dangerSoft: '#FEE2E2',
  info: '#2563EB',
  infoSoft: '#EFF6FF',

  notificationRed: '#E53935',
  pillActive: '#245B38',
  pillInactive: '#EEF2EE',

  white: '#FFFFFF',
  black: '#000000',
  overlay: 'rgba(0, 0, 0, 0.55)',
  darkOverlay: 'rgba(20, 32, 23, 0.65)',
  glassPill: 'rgba(255, 255, 255, 0.22)',
  glassBorder: 'rgba(255, 255, 255, 0.3)',
  photoPlaceholder: '#E8EFE9',
  cameraChrome: '#101A13',
} as const;

export type ColorToken = keyof typeof colors;
