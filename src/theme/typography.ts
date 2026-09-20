/**
 * Typography scale — AGRO-SCAN spec (system grotesques, open apertures):
 * display 32/40 bold, title-lg 22/28, title-md 17/24, body 15/22,
 * caption 13/18, metric 12/16 bold (percentages, dosages).
 */
import { Platform } from 'react-native';

export const fontFamily = Platform.select({
  ios: 'System',
  default: undefined,
});

export const typography = {
  display: { fontSize: 32, fontWeight: '700' as const, lineHeight: 40 },
  screenTitle: { fontSize: 22, fontWeight: '600' as const, lineHeight: 28 },
  sectionTitle: { fontSize: 17, fontWeight: '600' as const, lineHeight: 24 },
  cardTitle: { fontSize: 15, fontWeight: '600' as const, lineHeight: 22 },
  body: { fontSize: 15, fontWeight: '400' as const, lineHeight: 22 },
  bodySmall: { fontSize: 13, fontWeight: '400' as const, lineHeight: 18 },
  caption: { fontSize: 12, fontWeight: '400' as const, lineHeight: 16 },
  metric: { fontSize: 12, fontWeight: '700' as const, lineHeight: 16 },
  button: { fontSize: 16, fontWeight: '600' as const, lineHeight: 21 },
  badge: { fontSize: 11, fontWeight: '600' as const, lineHeight: 16 },
} as const;
