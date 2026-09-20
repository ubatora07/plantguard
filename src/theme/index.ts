import { Platform } from 'react-native';
import { colors } from './colors';
import { radii } from './radii';
import { spacing, screenPadding } from './spacing';
import { typography } from './typography';

export * from './colors';
export * from './radii';
export * from './spacing';
export * from './typography';
export * from './ThemeContext';
export * from './useStyles';

export const theme = {
  colors,
  radii,
  spacing,
  screenPadding,
  typography,
};

/**
 * Soft elevation tinted with deep green (no harsh black shadows —
 * they turn into visual noise under direct sunlight).
 */
const shadowTint = '#1A4D2E';

export const softShadow = Platform.select({
  ios: {
    shadowColor: shadowTint,
    shadowOpacity: 0.05,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
  },
  android: { elevation: 1.5 },
  default: {},
});

/** Deeper elevation for modal sheets and hero elements. */
export const deepShadow = Platform.select({
  ios: {
    shadowColor: shadowTint,
    shadowOpacity: 0.12,
    shadowRadius: 32,
    shadowOffset: { width: 0, height: 12 },
  },
  android: { elevation: 5 },
  default: {},
});
