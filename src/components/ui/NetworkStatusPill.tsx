import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View, Pressable } from 'react-native';
import * as Network from 'expo-network';
import { Wifi, WifiOff } from 'lucide-react-native';
import { useTheme, useStyles } from '../../theme';
import { useSettings } from '../../features/settings/SettingsContext';

interface NetworkStatusPillProps {
  compact?: boolean;
}

export function NetworkStatusPill({ compact = false }: NetworkStatusPillProps) {
  const { colors } = useTheme();
  const styles = useStyles(createStyles);
  const { mode, activeProvider } = useSettings();
  const [isOnline, setIsOnline] = useState<boolean>(true);

  useEffect(() => {
    let mounted = true;
    async function checkNetwork() {
      try {
        const state = await Network.getNetworkStateAsync();
        if (mounted) {
          setIsOnline(Boolean(state.isConnected && state.isInternetReachable !== false));
        }
      } catch {
        if (mounted) setIsOnline(false);
      }
    }

    checkNetwork();
    const interval = setInterval(checkNetwork, 3000);
    return () => {
      mounted = false;
      clearInterval(interval);
    };
  }, []);

  const isAiActive = isOnline && mode === 'ai' && activeProvider !== 'offline';

  const getStatusLabel = () => {
    if (!isAiActive) {
      return compact ? 'Offline' : 'Офлайн';
    }
    if (compact) return 'Online';
    switch (activeProvider) {
      case 'gemini':
        return 'Gemini AI';
      case 'openrouter':
        return 'OpenRouter';
      case 'openai':
        return 'OpenAI';
      case 'auto':
      default:
        return 'AI Онлайн';
    }
  };

  return (
    <View style={[styles.container, isAiActive ? styles.onlineContainer : styles.offlineContainer]}>
      {isAiActive ? (
        <Wifi size={12} color={colors.primaryDark} strokeWidth={2.5} />
      ) : (
        <WifiOff size={12} color="#B45309" strokeWidth={2.5} />
      )}
      <Text style={[styles.text, isAiActive ? styles.onlineText : styles.offlineText]}>
        {getStatusLabel()}
      </Text>
    </View>
  );
}

const createStyles = ({ colors, radii, spacing, typography }: any) =>
  StyleSheet.create({
    container: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
      paddingHorizontal: spacing.sm,
      paddingVertical: 4,
      borderRadius: radii.pill ?? 16,
    },
    onlineContainer: {
      backgroundColor: '#E8F5E9',
      borderColor: '#A5D6A7',
      borderWidth: 1,
    },
    offlineContainer: {
      backgroundColor: '#FEF3C7',
      borderColor: '#FDE68A',
      borderWidth: 1,
    },
    text: {
      fontSize: 11,
      fontWeight: '600',
    },
    onlineText: {
      color: '#1B5E20',
    },
    offlineText: {
      color: '#92400E',
    },
  });
