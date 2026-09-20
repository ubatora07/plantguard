import { useMemo } from 'react';
import { StyleSheet } from 'react-native';
import { useTheme, ThemeColors } from './ThemeContext';
import { spacing } from './spacing';
import { radii } from './radii';
import { typography } from './typography';

type Theme = {
  colors: ThemeColors;
  spacing: typeof spacing;
  radii: typeof radii;
  typography: typeof typography;
};

export function useStyles<T extends StyleSheet.NamedStyles<T> | StyleSheet.NamedStyles<any>>(
  createStyles: (theme: Theme) => T
): T {
  const { colors } = useTheme();
  
  return useMemo(() => {
    return createStyles({ colors, spacing, radii, typography });
  }, [colors, createStyles]);
}
