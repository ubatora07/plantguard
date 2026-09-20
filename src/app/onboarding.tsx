import { useRouter } from 'expo-router';
import { Leaf, CheckCircle2, ShieldCheck } from 'lucide-react-native';
import React from 'react';
import { Image, StyleSheet, Text, View } from 'react-native';
import { ASSETS } from '../constants/assets';
import { AppButton } from '../components/ui/AppButton';
import { colors, radii, spacing } from '../theme';

export default function OnboardingScreen() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        {/* Logo Badge */}
        <Image
          source={ASSETS.logo}
          style={{ width: 84, height: 84, borderRadius: 22, marginBottom: 16 }}
          resizeMode="contain"
        />

        <Text style={styles.appName}>PlantGuard AI</Text>
        <Text style={styles.tagline}>Забота о растениях{"\n"}в твоих руках</Text>

        {/* Feature Cards */}
        <View style={styles.featuresList}>
          <View style={styles.featureItem}>
            <View style={styles.featureIconBox}>
              <Leaf size={20} color={colors.primary} strokeWidth={2.2} />
            </View>
            <Text style={styles.featureText}>Распознаём болезни растений</Text>
          </View>

          <View style={styles.featureItem}>
            <View style={styles.featureIconBox}>
              <CheckCircle2 size={20} color={colors.primary} strokeWidth={2.2} />
            </View>
            <Text style={styles.featureText}>Даём понятные рекомендации</Text>
          </View>

          <View style={styles.featureItem}>
            <View style={styles.featureIconBox}>
              <ShieldCheck size={20} color={colors.primary} strokeWidth={2.2} />
            </View>
            <Text style={styles.featureText}>Помогаем сохранить урожай</Text>
          </View>
        </View>

        {/* Carousel indicator dots */}
        <View style={styles.dotsRow}>
          <View style={[styles.dot, styles.activeDot]} />
          <View style={styles.dot} />
          <View style={styles.dot} />
        </View>

        {/* Start CTA Button */}
        <AppButton
          label="Начать"
          onPress={() => router.replace('/(tabs)')}
          style={styles.startButton}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.primarySoft,
    justifyContent: 'flex-end',
  },
  content: {
    paddingHorizontal: spacing.xl,
    paddingBottom: 48,
    alignItems: 'center',
  },
  logoBadge: {
    width: 76,
    height: 76,
    borderRadius: 24,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.md,
    shadowColor: colors.primaryDark,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 6,
  },
  appName: {
    fontSize: 32,
    fontWeight: '700',
    lineHeight: 40,
    color: colors.text,
    letterSpacing: -0.4,
    marginBottom: 4,
  },
  tagline: {
    fontSize: 16,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 32,
  },
  featuresList: {
    width: '100%',
    gap: 12,
    marginBottom: 32,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.85)',
    borderRadius: radii.card,
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: 'rgba(226, 234, 227, 0.8)',
  },
  featureIconBox: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: colors.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  featureText: {
    fontSize: 15,
    fontWeight: '500',
    color: colors.text,
  },
  dotsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 24,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#BFD4C3',
  },
  activeDot: {
    width: 24,
    backgroundColor: colors.primary,
  },
  startButton: {
    width: '100%',
  },
});
