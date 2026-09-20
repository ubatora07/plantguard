import { SafeAreaView } from 'react-native-safe-area-context';
import React from 'react';
import { ScrollView, StyleSheet, View, ViewStyle } from 'react-native';
import { colors, screenPadding } from '../../theme';
import { useTheme, useStyles } from '../../theme';

interface AppScreenProps {
  children: React.ReactNode;
  /** Render children inside a ScrollView (default true). */
  scroll?: boolean;
  /** Disable default horizontal padding (for edge-to-edge layouts like camera). */
  padded?: boolean;
  style?: ViewStyle;
}

/** Base screen: safe area, background color and common paddings. */
export function AppScreen({ children, scroll = true, padded = true, style }: AppScreenProps) {
  const { colors } = useTheme();
  const styles = useStyles(createStyles);
  return (
    <SafeAreaView style={[styles.safe, style]} edges={['top', 'left', 'right']}>
      {scroll ? (
        <ScrollView
          style={styles.flex}
          contentContainerStyle={[
            padded && styles.padded,
            scroll && { paddingBottom: 32 },
          ]}
          showsVerticalScrollIndicator={false}
          alwaysBounceVertical={false}>
          {children}
        </ScrollView>
      ) : (
        <View style={[styles.flex, padded && styles.padded]}>{children}</View>
      )}
    </SafeAreaView>
  );
}

const createStyles = ({ colors, radii, spacing, typography, softShadow }: any) => StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.background,
  },
  flex: {
    flex: 1,
  },
  padded: {
    paddingHorizontal: screenPadding,
  },
});
