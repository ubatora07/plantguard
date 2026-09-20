import { useRouter } from 'expo-router';
import {
  Globe,
  Trash2,
  HelpCircle,
  BookOpen,
  Info,
  ChevronRight,
  CheckCircle2,
  Leaf,
  X,
  Cpu,
  Eye,
  EyeOff,
  Check,
  RotateCcw,
  Zap,
  Sparkles,
  Bot,
  ShieldCheck,
} from 'lucide-react-native';
import React, { useState } from 'react';
import {
  Alert,
  Image,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ASSETS } from '../../constants/assets';
import { CountryFlag } from '../../components/ui/CountryFlag';
import { ConfirmDeleteModal } from '../../components/ui/ConfirmDeleteModal';
import { useHistory } from '../../features/history/HistoryContext';
import { useSettings, type ActiveAiProvider } from '../../features/settings/SettingsContext';
import { AVAILABLE_LANGUAGES, i18n } from '../../i18n';
import { useTheme, useStyles } from '../../theme';

export default function ProfileScreen() {
  const router = useRouter();
  const {
    language,
    setLanguage,
    activeProvider,
    setActiveProvider,
    customKeys,
    setCustomKeys,
  } = useSettings();
  const { clearAll } = useHistory();

  const [aboutVisible, setAboutVisible] = useState(false);
  const [languageModalVisible, setLanguageModalVisible] = useState(false);
  const [aiModalVisible, setAiModalVisible] = useState(false);

  // Local draft state for editing in modal
  const [selectedProvider, setSelectedProvider] = useState<ActiveAiProvider>(activeProvider);
  const [geminiKeyInput, setGeminiKeyInput] = useState(customKeys.gemini);
  const [openRouterKeyInput, setOpenRouterKeyInput] = useState(customKeys.openRouter);
  const [openAiKeyInput, setOpenAiKeyInput] = useState(customKeys.openAi);

  const [showGeminiKey, setShowGeminiKey] = useState(false);
  const [showOpenRouterKey, setShowOpenRouterKey] = useState(false);
  const [showOpenAiKey, setShowOpenAiKey] = useState(false);

  const { colors } = useTheme();
  const styles = useStyles(createStyles);

  const [isClearHistoryVisible, setIsClearHistoryVisible] = useState(false);
  const [isResetKeysVisible, setIsResetKeysVisible] = useState(false);

  const openAiModal = () => {
    setSelectedProvider(activeProvider);
    setGeminiKeyInput(customKeys.gemini);
    setOpenRouterKeyInput(customKeys.openRouter);
    setOpenAiKeyInput(customKeys.openAi);
    setAiModalVisible(true);
  };

  const handleClearHistory = () => {
    setIsClearHistoryVisible(true);
  };

  const confirmClearHistory = async () => {
    setIsClearHistoryVisible(false);
    await clearAll();
  };

  const handleSaveAiSettings = async () => {
    // Entering a provider key must prioritize that provider, not silently retain
    // the previous automatic chain and try unrelated providers after an error.
    const providerToSave: ActiveAiProvider =
      selectedProvider === 'auto'
        ? geminiKeyInput.trim()
          ? 'gemini'
          : openRouterKeyInput.trim()
          ? 'openrouter'
          : openAiKeyInput.trim()
          ? 'openai'
          : 'auto'
        : selectedProvider;
    setSelectedProvider(providerToSave);
    await setActiveProvider(providerToSave);
    await setCustomKeys({
      gemini: geminiKeyInput.trim(),
      openRouter: openRouterKeyInput.trim(),
      openAi: openAiKeyInput.trim(),
    });
    setAiModalVisible(false);
  };

  const handleResetAiKeys = () => {
    setIsResetKeysVisible(true);
  };

  const confirmResetAiKeys = async () => {
    setIsResetKeysVisible(false);
    setGeminiKeyInput('');
    setOpenRouterKeyInput('');
    setOpenAiKeyInput('');
    setSelectedProvider('auto');
    await setActiveProvider('auto');
    await setCustomKeys({ gemini: '', openRouter: '', openAi: '' });
  };

  const currentLangObj =
    AVAILABLE_LANGUAGES.find((l) => l.code === language) || AVAILABLE_LANGUAGES[0];

  const getProviderInfo = (provider: ActiveAiProvider) => {
    switch (provider) {
      case 'gemini':
        return {
          title: 'Google Gemini 3.5 Flash-Lite',
          subtitle: customKeys.gemini ? 'Используется ваш личный ключ Gemini' : 'Используется системный ключ Gemini 3.5 Flash-Lite',
          badgeText: 'Gemini 3.5 Flash-Lite',
          badgeIcon: Sparkles,
          badgeBg: '#E8F0FE',
          badgeColor: '#1A73E8',
        };
      case 'openrouter':
        return {
          title: 'OpenRouter Vision',
          subtitle: customKeys.openRouter ? 'Используется ваш ключ OpenRouter' : 'Мультимодельный роутер openrouter/free',
          badgeText: 'OpenRouter',
          badgeIcon: Globe,
          badgeBg: '#EDE7F6',
          badgeColor: '#673AB7',
        };
      case 'openai':
        return {
          title: 'OpenAI GPT-4o-mini',
          subtitle: customKeys.openAi ? 'Используется ваш ключ OpenAI' : 'Быстрая модель GPT-4o-mini',
          badgeText: 'GPT-4o-mini',
          badgeIcon: Bot,
          badgeBg: '#E8F5E9',
          badgeColor: '#2E7D32',
        };
      case 'offline':
        return {
          title: 'Автономный режим',
          subtitle: 'Локальная база PlantVillage (без интернета)',
          badgeText: 'Офлайн',
          badgeIcon: ShieldCheck,
          badgeBg: '#FEF3C7',
          badgeColor: '#B45309',
        };
      case 'auto':
      default: {
        const hasCustom = customKeys.gemini || customKeys.openRouter || customKeys.openAi;
        return {
          title: 'AI Провайдер & API Ключи',
          subtitle: hasCustom
            ? 'Приоритет личных ключей (Gemini / OpenRouter / OpenAI)'
            : 'Автоматический выбор (Gemini / OpenRouter / OpenAI)',
          badgeText: 'Авто',
          badgeIcon: Zap,
          badgeBg: '#E8F5E9',
          badgeColor: '#245B38',
        };
      }
    }
  };

  const providerInfo = getProviderInfo(activeProvider);
  const BadgeIcon = providerInfo.badgeIcon;

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}>
        {/* Top Header */}
        <Text style={styles.screenTitle}>{i18n.t('profile.settings')}</Text>

        {/* Section: AI Provider & API Keys */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>AI МОДЕЛЬ & API КЛЮЧИ</Text>
          <Pressable
            onPress={openAiModal}
            style={({ pressed }) => [
              styles.cardItem,
              pressed && styles.cardPressed,
            ]}
            accessibilityRole="button">
            <View style={styles.cardLeft}>
              <View style={[styles.iconCircle, { backgroundColor: providerInfo.badgeBg }]}>
                <Cpu size={20} color={providerInfo.badgeColor} strokeWidth={2.2} />
              </View>
              <View style={styles.cardTextCol}>
                <Text style={styles.cardTitle}>{providerInfo.title}</Text>
                <Text style={styles.cardSubtitle} numberOfLines={1}>
                  {providerInfo.subtitle}
                </Text>
              </View>
            </View>
            <View style={[styles.providerBadge, { backgroundColor: providerInfo.badgeBg }]}>
              <BadgeIcon size={12} color={providerInfo.badgeColor} strokeWidth={2.4} />
              <Text style={[styles.providerBadgeText, { color: providerInfo.badgeColor }]}>
                {providerInfo.badgeText}
              </Text>
            </View>
            <ChevronRight size={18} color="#A6B5A9" strokeWidth={2.2} style={{ marginLeft: 6 }} />
          </Pressable>
        </View>

        {/* Section: Language */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>{i18n.t('profile.language')}</Text>
          <Pressable
            onPress={() => setLanguageModalVisible(true)}
            style={({ pressed }) => [
              styles.cardItem,
              pressed && styles.cardPressed,
            ]}
            accessibilityRole="button">
            <View style={styles.cardLeft}>
              <CountryFlag code={currentLangObj.code} size={28} />
              <View style={styles.cardTextCol}>
                <Text style={styles.cardTitle}>{i18n.t('profile.language')}</Text>
                <Text style={styles.cardSubtitle}>
                  {currentLangObj.nativeName}
                </Text>
              </View>
            </View>
            <ChevronRight size={18} color="#A6B5A9" strokeWidth={2.2} />
          </Pressable>
        </View>

        {/* Section: Actions & Info */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>ДЕЙСТВИЯ И СПРАВОЧНИКИ</Text>
          {/* Clear History */}
          <Pressable
            onPress={handleClearHistory}
            style={({ pressed }) => [
              styles.cardItem,
              pressed && styles.cardPressed,
            ]}>
            <View style={styles.cardLeft}>
              <View style={[styles.iconCircle, styles.iconCircleRed]}>
                <Trash2 size={20} color="#D9383A" strokeWidth={2.2} />
              </View>
              <Text style={[styles.cardTitle, { color: '#D9383A' }]}>
                {i18n.t('profile.clear_history')}
              </Text>
            </View>
            <ChevronRight size={18} color="#A6B5A9" strokeWidth={2.2} />
          </Pressable>

          {/* How to photograph */}
          <Pressable
            onPress={() => router.push('/guide')}
            style={({ pressed }) => [
              styles.cardItem,
              pressed && styles.cardPressed,
            ]}>
            <View style={styles.cardLeft}>
              <View style={styles.iconCircle}>
                <HelpCircle size={20} color={colors.text} strokeWidth={2.2} />
              </View>
              <Text style={styles.cardTitle}>
                {language === 'kk' ? 'Қалай суретке түсіру керек' : language === 'en' ? 'Photography Guide' : 'Как фотографировать'}
              </Text>
            </View>
            <ChevronRight size={18} color="#A6B5A9" strokeWidth={2.2} />
          </Pressable>

          {/* Crop Directory */}
          <Pressable
            onPress={() => router.push('/crops')}
            style={({ pressed }) => [
              styles.cardItem,
              pressed && styles.cardPressed,
            ]}>
            <View style={styles.cardLeft}>
              <View style={styles.iconCircle}>
                <BookOpen size={20} color={colors.text} strokeWidth={2.2} />
              </View>
              <Text style={styles.cardTitle}>{i18n.t('crops.title')}</Text>
            </View>
            <ChevronRight size={18} color="#A6B5A9" strokeWidth={2.2} />
          </Pressable>


          {/* About App */}
          <Pressable
            onPress={() => setAboutVisible(true)}
            style={({ pressed }) => [
              styles.cardItem,
              pressed && styles.cardPressed,
            ]}>
            <View style={styles.cardLeft}>
              <View style={styles.iconCircle}>
                <Info size={20} color={colors.text} strokeWidth={2.2} />
              </View>
              <Text style={styles.cardTitle}>{i18n.t('profile.about')}</Text>
            </View>
            <ChevronRight size={18} color="#A6B5A9" strokeWidth={2.2} />
          </Pressable>
        </View>

        {/* Footer Brand Info */}
        <View style={styles.footerContainer}>
          <Image
            source={ASSETS.logo}
            style={{ width: 48, height: 48, borderRadius: 14, marginBottom: 8 }}
            resizeMode="contain"
          />
          <Text style={styles.footerAppName}>PlantGuard AI</Text>
          <Text style={styles.footerTagline}>Забота о каждом листе</Text>
          <Text style={styles.footerVersion}>Версия 1.0</Text>
        </View>
      </ScrollView>

      {/* Language Selection Modal */}
      <Modal
        visible={languageModalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setLanguageModalVisible(false)}>
        <Pressable
          style={styles.modalOverlay}
          onPress={() => setLanguageModalVisible(false)}>
          <Pressable style={styles.modalCard} onPress={(e) => e.stopPropagation()}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>{i18n.t('profile.language_select')}</Text>
              <Pressable
                onPress={() => setLanguageModalVisible(false)}
                hitSlop={8}
                style={styles.modalCloseBtn}>
                <X size={18} color={colors.text} strokeWidth={2.4} />
              </Pressable>
            </View>

            <View style={{ gap: 10, marginVertical: 14 }}>
              {AVAILABLE_LANGUAGES.map((item) => {
                const isSelected = language === item.code;
                return (
                  <Pressable
                    key={item.code}
                    onPress={async () => {
                      await setLanguage(item.code);
                      setLanguageModalVisible(false);
                    }}
                    style={({ pressed }) => [
                      styles.langOption,
                      isSelected && styles.langOptionActive,
                      pressed && { opacity: 0.8 },
                    ]}>
                    <View style={styles.langOptionLeft}>
                      <CountryFlag code={item.code} size={30} />
                      <View style={{ marginLeft: 12 }}>
                        <Text
                          style={[
                            styles.langOptionName,
                            isSelected && styles.langOptionNameActive,
                          ]}>
                          {item.nativeName}
                        </Text>
                        <Text style={styles.langOptionLabel}>{item.label}</Text>
                      </View>
                    </View>
                    {isSelected ? (
                      <CheckCircle2 size={22} color={colors.primary} strokeWidth={2.4} />
                    ) : (
                      <View style={styles.radioEmpty} />
                    )}
                  </Pressable>
                );
              })}
            </View>

            <Pressable
              onPress={() => setLanguageModalVisible(false)}
              style={styles.modalSecondaryBtn}>
              <Text style={styles.modalSecondaryBtnText}>{i18n.t('common.cancel')}</Text>
            </Pressable>
          </Pressable>
        </Pressable>
      </Modal>

      {/* AI Provider & Custom API Keys Modal */}
      <Modal
        visible={aiModalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setAiModalVisible(false)}>
        <Pressable
          style={styles.modalOverlay}
          onPress={() => setAiModalVisible(false)}>
          <Pressable
            style={[styles.modalCard, styles.aiModalCard]}
            onPress={(e) => e.stopPropagation()}>
            <View style={styles.modalHeader}>
              <View style={{ flex: 1 }}>
                <Text style={styles.modalTitle}>AI Провайдер & API Ключи</Text>
                <Text style={styles.modalSubHeader}>
                  Подключите свои ключи или выберите режим работы
                </Text>
              </View>
              <Pressable
                onPress={() => setAiModalVisible(false)}
                hitSlop={8}
                style={styles.modalCloseBtn}>
                <X size={18} color={colors.text} strokeWidth={2.4} />
              </Pressable>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} style={{ marginVertical: 10 }}>
              {/* Provider Selection */}
              <Text style={styles.inputGroupLabel}>РЕЖИМ РАБОТЫ</Text>
              <View style={{ gap: 8, marginBottom: 16 }}>
                {[
                  {
                    id: 'auto',
                    title: 'Умный автовыбор',
                    desc: 'Личные ключи → Gemini Flash-Lite → OpenRouter',
                    icon: Zap,
                    iconColor: '#245B38',
                    iconBg: '#E8F5E9',
                  },
                  {
                    id: 'gemini',
                    title: 'Google Gemini 3.5 Flash-Lite',
                    desc: 'Сверхбыстрый мультимодальный анализ (Google AI)',
                    icon: Sparkles,
                    iconColor: '#1A73E8',
                    iconBg: '#E8F0FE',
                  },
                  {
                    id: 'openrouter',
                    title: 'OpenRouter Vision',
                    desc: 'Мультимодельный роутер (openrouter/free)',
                    icon: Globe,
                    iconColor: '#673AB7',
                    iconBg: '#EDE7F6',
                  },
                  {
                    id: 'openai',
                    title: 'OpenAI GPT-4o-mini',
                    desc: 'Быстрый анализ листьев и вредителей (OpenAI)',
                    icon: Bot,
                    iconColor: '#2E7D32',
                    iconBg: '#E8F5E9',
                  },
                  {
                    id: 'offline',
                    title: 'Офлайн справочник',
                    desc: 'PlantVillage Core (без интернета)',
                    icon: ShieldCheck,
                    iconColor: '#B45309',
                    iconBg: '#FEF3C7',
                  },
                ].map((item) => {
                  const isSelected = selectedProvider === item.id;
                  const OptionIcon = item.icon;
                  return (
                    <Pressable
                      key={item.id}
                      onPress={() => setSelectedProvider(item.id as ActiveAiProvider)}
                      style={[
                        styles.providerOption,
                        isSelected && styles.providerOptionActive,
                      ]}>
                      <View style={[styles.providerOptionIconBadge, { backgroundColor: item.iconBg }]}>
                        <OptionIcon size={18} color={item.iconColor} strokeWidth={2.2} />
                      </View>
                      <View style={{ flex: 1, marginLeft: 10 }}>
                        <Text
                          style={[
                            styles.providerOptionTitle,
                            isSelected && styles.providerOptionTitleActive,
                          ]}>
                          {item.title}
                        </Text>
                        <Text style={styles.providerOptionDesc}>{item.desc}</Text>
                      </View>
                      {isSelected ? (
                        <CheckCircle2 size={20} color={colors.primary} strokeWidth={2.4} />
                      ) : (
                        <View style={styles.radioEmpty} />
                      )}
                    </Pressable>
                  );
                })}
              </View>

              {/* API Keys Inputs */}
              <Text style={styles.inputGroupLabel}>ВАШИ API КЛЮЧИ (СВОЙ КЛЮЧ)</Text>
              <Text style={styles.inputGroupHint}>
                Ключи сохраняются локально в зашифрованном хранилище вашего устройства.
              </Text>

              {/* Gemini Key */}
              <View style={styles.inputWrapper}>
                <View style={styles.inputHeaderRow}>
                  <Text style={styles.inputLabel}>Google Gemini API Key</Text>
                  {Boolean(geminiKeyInput.trim()) && (
                    <View style={styles.keySavedBadgeContainer}>
                      <Check size={12} color={colors.primary} strokeWidth={2.8} />
                      <Text style={styles.keySavedBadge}>Сохранён</Text>
                    </View>
                  )}
                </View>
                <View style={styles.inputRow}>
                  <TextInput
                    style={styles.keyInput}
                    value={geminiKeyInput}
                    onChangeText={setGeminiKeyInput}
                    placeholder="AIzaSy..."
                    placeholderTextColor="#9EAFA1"
                    secureTextEntry={!showGeminiKey}
                    autoCapitalize="none"
                    autoCorrect={false}
                  />
                  <Pressable
                    style={styles.eyeBtn}
                    onPress={() => setShowGeminiKey(!showGeminiKey)}>
                    {showGeminiKey ? (
                      <EyeOff size={18} color="#667768" />
                    ) : (
                      <Eye size={18} color="#667768" />
                    )}
                  </Pressable>
                </View>
              </View>

              {/* OpenRouter Key */}
              <View style={styles.inputWrapper}>
                <View style={styles.inputHeaderRow}>
                  <Text style={styles.inputLabel}>OpenRouter API Key</Text>
                  {Boolean(openRouterKeyInput.trim()) && (
                    <View style={styles.keySavedBadgeContainer}>
                      <Check size={12} color={colors.primary} strokeWidth={2.8} />
                      <Text style={styles.keySavedBadge}>Сохранён</Text>
                    </View>
                  )}
                </View>
                <View style={styles.inputRow}>
                  <TextInput
                    style={styles.keyInput}
                    value={openRouterKeyInput}
                    onChangeText={setOpenRouterKeyInput}
                    placeholder="sk-or-v1-..."
                    placeholderTextColor="#9EAFA1"
                    secureTextEntry={!showOpenRouterKey}
                    autoCapitalize="none"
                    autoCorrect={false}
                  />
                  <Pressable
                    style={styles.eyeBtn}
                    onPress={() => setShowOpenRouterKey(!showOpenRouterKey)}>
                    {showOpenRouterKey ? (
                      <EyeOff size={18} color="#667768" />
                    ) : (
                      <Eye size={18} color="#667768" />
                    )}
                  </Pressable>
                </View>
              </View>

              {/* OpenAI Key */}
              <View style={styles.inputWrapper}>
                <View style={styles.inputHeaderRow}>
                  <Text style={styles.inputLabel}>OpenAI API Key</Text>
                  {Boolean(openAiKeyInput.trim()) && (
                    <View style={styles.keySavedBadgeContainer}>
                      <Check size={12} color={colors.primary} strokeWidth={2.8} />
                      <Text style={styles.keySavedBadge}>Сохранён</Text>
                    </View>
                  )}
                </View>
                <View style={styles.inputRow}>
                  <TextInput
                    style={styles.keyInput}
                    value={openAiKeyInput}
                    onChangeText={setOpenAiKeyInput}
                    placeholder="sk-proj-..."
                    placeholderTextColor="#9EAFA1"
                    secureTextEntry={!showOpenAiKey}
                    autoCapitalize="none"
                    autoCorrect={false}
                  />
                  <Pressable
                    style={styles.eyeBtn}
                    onPress={() => setShowOpenAiKey(!showOpenAiKey)}>
                    {showOpenAiKey ? (
                      <EyeOff size={18} color="#667768" />
                    ) : (
                      <Eye size={18} color="#667768" />
                    )}
                  </Pressable>
                </View>
              </View>
            </ScrollView>

            {/* Modal Bottom Buttons */}
            <View style={styles.modalBtnRow}>
              <Pressable onPress={handleResetAiKeys} style={styles.resetKeysBtn}>
                <RotateCcw size={16} color="#D9383A" strokeWidth={2.2} />
                <Text style={styles.resetKeysBtnText}>Сбросить</Text>
              </Pressable>
              <Pressable onPress={handleSaveAiSettings} style={styles.saveKeysBtn}>
                <Check size={18} color="#FFFFFF" strokeWidth={2.4} />
                <Text style={styles.saveKeysBtnText}>Сохранить</Text>
              </Pressable>
            </View>
          </Pressable>
        </Pressable>
      </Modal>

      {/* About Modal */}
      <Modal
        visible={aboutVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setAboutVisible(false)}>
        <Pressable
          style={styles.modalOverlay}
          onPress={() => setAboutVisible(false)}>
          <Pressable style={styles.modalCard} onPress={(e) => e.stopPropagation()}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>{i18n.t('profile.about')}</Text>
              <Pressable
                onPress={() => setAboutVisible(false)}
                hitSlop={8}
                style={styles.modalCloseBtn}>
                <X size={18} color={colors.text} strokeWidth={2.4} />
              </Pressable>
            </View>

            <Text style={styles.modalBody}>
              PlantGuard AI — интеллектуальный мобильный помощник для агрономов и садоводов. 
              Система проводит экспресс-диагностику здоровья растений по фотографиям листьев 
              с использованием моделей компьютерного зрения, многоязычной базы знаний и эталонного датасета PlantVillage 
              (14 культур, 38 классов заболеваний).
            </Text>

            <Pressable
              onPress={() => setAboutVisible(false)}
              style={styles.modalSecondaryBtn}>
              <Text style={styles.modalSecondaryBtnText}>{i18n.t('common.ok')}</Text>
            </Pressable>
          </Pressable>
        </Pressable>
      </Modal>

      {/* Confirmation Modal for Clearing History */}
      <ConfirmDeleteModal
        visible={isClearHistoryVisible}
        title={i18n.t('profile.clear_history')}
        message={i18n.t('profile.clear_history_confirm')}
        confirmText={i18n.t('profile.clear_history')}
        cancelText={i18n.t('common.cancel')}
        isDestructive={true}
        onConfirm={confirmClearHistory}
        onCancel={() => setIsClearHistoryVisible(false)}
      />

      {/* Confirmation Modal for Resetting API Keys */}
      <ConfirmDeleteModal
        visible={isResetKeysVisible}
        title="Сброс ключей API"
        message="Очистить все введенные персональные API-ключи и вернуть автоматический выбор провайдера?"
        confirmText="Сбросить"
        cancelText={i18n.t('common.cancel')}
        isDestructive={false}
        onConfirm={confirmResetAiKeys}
        onCancel={() => setIsResetKeysVisible(false)}
      />
    </SafeAreaView>
  );
}

const createStyles = ({ colors, spacing }: any) =>
  StyleSheet.create({
    safeArea: {
      flex: 1,
      backgroundColor: colors.background,
    },
    scrollContent: {
      paddingHorizontal: spacing.lg,
      paddingTop: spacing.md,
      paddingBottom: spacing.xxl,
    },
    screenTitle: {
      fontSize: 26,
      fontWeight: '800',
      color: colors.text,
      letterSpacing: -0.5,
      marginBottom: spacing.lg,
    },
    section: {
      marginBottom: spacing.lg,
    },
    sectionLabel: {
      fontSize: 12,
      fontWeight: '700',
      color: colors.textSecondary,
      textTransform: 'uppercase',
      letterSpacing: 0.8,
      marginBottom: spacing.xs,
      marginLeft: spacing.xs,
    },
    cardItem: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      backgroundColor: '#FFFFFF',
      paddingVertical: 14,
      paddingHorizontal: 16,
      borderRadius: 20,
      marginBottom: 10,
      borderWidth: 1,
      borderColor: '#E3EAE4',
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.05,
      shadowRadius: 8,
      elevation: 2,
    },
    cardPressed: {
      backgroundColor: '#F0F5F1',
      transform: [{ scale: 0.99 }],
    },
    cardLeft: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.sm,
      flex: 1,
    },
    iconCircle: {
      width: 40,
      height: 40,
      borderRadius: 14,
      backgroundColor: '#EBF1EB',
      alignItems: 'center',
      justifyContent: 'center',
    },
    iconCircleRed: {
      backgroundColor: '#FDE8E8',
    },
    cardTextCol: {
      flex: 1,
      marginLeft: 6,
    },
    cardTitle: {
      fontSize: 15,
      fontWeight: '600',
      color: colors.text,
    },
    cardSubtitle: {
      fontSize: 12,
      color: colors.textSecondary,
      marginTop: 2,
    },
    radioEmpty: {
      width: 22,
      height: 22,
      borderRadius: 11,
      borderWidth: 2,
      borderColor: '#D0DDD2',
    },
    providerBadge: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 5,
      paddingHorizontal: 10,
      paddingVertical: 5,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: 'rgba(0, 0, 0, 0.06)',
    },
    providerBadgeText: {
      fontSize: 12,
      fontWeight: '700',
    },
    modalOverlay: {
      flex: 1,
      backgroundColor: 'rgba(15, 25, 18, 0.65)',
      alignItems: 'center',
      justifyContent: 'center',
      padding: spacing.md,
    },
    modalCard: {
      width: '100%',
      maxWidth: 360,
      backgroundColor: '#FFFFFF',
      borderRadius: 24,
      padding: 22,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 10 },
      shadowOpacity: 0.18,
      shadowRadius: 24,
      elevation: 10,
    },
    aiModalCard: {
      maxWidth: 420,
      maxHeight: '88%',
    },
    modalHeader: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      justifyContent: 'space-between',
      marginBottom: spacing.xs,
    },
    modalTitle: {
      fontSize: 18,
      fontWeight: '700',
      color: colors.text,
    },
    modalSubHeader: {
      fontSize: 12,
      color: colors.textSecondary,
      marginTop: 2,
    },
    modalCloseBtn: {
      width: 32,
      height: 32,
      borderRadius: 16,
      backgroundColor: '#EAEFEA',
      alignItems: 'center',
      justifyContent: 'center',
      marginLeft: 8,
    },
    modalBody: {
      fontSize: 14,
      lineHeight: 21,
      color: colors.textSecondary,
      marginVertical: spacing.md,
    },
    modalSecondaryBtn: {
      backgroundColor: '#EBF1EB',
      borderRadius: 14,
      paddingVertical: 12,
      alignItems: 'center',
      marginTop: spacing.xs,
    },
    modalSecondaryBtnText: {
      color: colors.primary,
      fontSize: 14,
      fontWeight: '700',
    },
    langOption: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: 14,
      borderRadius: 16,
      backgroundColor: '#F5F8F5',
      borderWidth: 1.5,
      borderColor: '#E2EBE2',
    },
    langOptionActive: {
      borderColor: colors.primary,
      backgroundColor: '#EBF5ED',
    },
    langOptionLeft: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    langOptionName: {
      fontSize: 16,
      fontWeight: '700',
      color: colors.text,
    },
    langOptionNameActive: {
      color: colors.primary,
    },
    langOptionLabel: {
      fontSize: 12,
      color: colors.textSecondary,
    },
    inputGroupLabel: {
      fontSize: 11,
      fontWeight: '800',
      color: colors.textSecondary,
      letterSpacing: 0.8,
      marginBottom: 6,
    },
    inputGroupHint: {
      fontSize: 11,
      color: '#829384',
      marginBottom: 10,
    },
    providerOption: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: 12,
      borderRadius: 14,
      backgroundColor: '#F7FAF7',
      borderWidth: 1.5,
      borderColor: '#E2EBE2',
    },
    providerOptionActive: {
      borderColor: colors.primary,
      backgroundColor: '#EDF5EE',
    },
    providerOptionIconBadge: {
      width: 36,
      height: 36,
      borderRadius: 10,
      alignItems: 'center',
      justifyContent: 'center',
    },
    providerOptionTitle: {
      fontSize: 14,
      fontWeight: '700',
      color: colors.text,
    },
    providerOptionTitleActive: {
      color: colors.primary,
    },
    providerOptionDesc: {
      fontSize: 11,
      color: colors.textSecondary,
      marginTop: 2,
    },
    inputWrapper: {
      marginBottom: 12,
    },
    inputHeaderRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: 4,
    },
    inputLabel: {
      fontSize: 12,
      fontWeight: '600',
      color: colors.text,
    },
    keySavedBadgeContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
    },
    keySavedBadge: {
      fontSize: 11,
      fontWeight: '700',
      color: colors.primary,
    },
    inputRow: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: '#F5F8F5',
      borderRadius: 12,
      borderWidth: 1,
      borderColor: '#DFE8DF',
      paddingHorizontal: 12,
    },
    keyInput: {
      flex: 1,
      height: 42,
      fontSize: 13,
      color: colors.text,
    },
    eyeBtn: {
      padding: 6,
    },
    modalBtnRow: {
      flexDirection: 'row',
      gap: 10,
      marginTop: 12,
    },
    resetKeysBtn: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 6,
      paddingVertical: 12,
      paddingHorizontal: 14,
      borderRadius: 14,
      backgroundColor: '#FDE8E8',
    },
    resetKeysBtnText: {
      fontSize: 13,
      fontWeight: '700',
      color: '#D9383A',
    },
    saveKeysBtn: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 6,
      paddingVertical: 12,
      borderRadius: 14,
      backgroundColor: colors.primary,
    },
    saveKeysBtnText: {
      fontSize: 14,
      fontWeight: '700',
      color: colors.white,
    },
    footerContainer: {
      alignItems: 'center',
      paddingVertical: spacing.xl,
    },
    footerLogoBadge: {
      width: 48,
      height: 48,
      borderRadius: 16,
      backgroundColor: '#EBF1EB',
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: spacing.xs,
    },
    footerAppName: {
      fontSize: 17,
      fontWeight: '800',
      color: colors.text,
      letterSpacing: -0.3,
    },
    footerTagline: {
      fontSize: 13,
      color: colors.textSecondary,
      marginTop: 2,
    },
    footerVersion: {
      fontSize: 12,
      color: '#95A698',
      marginTop: 6,
    },
  });
