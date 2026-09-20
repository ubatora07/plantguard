import { Alert, Platform } from 'react-native';

/**
 * Polyfill React Native's Alert.alert for Web.
 * React Native Web leaves Alert.alert as a no-op, which prevents confirmation
 * dialogs (like delete confirmation) from executing their onPress callbacks.
 */
export function polyfillAlert() {
  if (Platform.OS === 'web' && typeof window !== 'undefined') {
    Alert.alert = (
      title: string,
      message?: string,
      buttons?: Array<{ text?: string; onPress?: () => void; style?: string }>
    ) => {
      const fullMessage = message ? `${title}\n\n${message}` : title;

      if (!buttons || buttons.length === 0) {
        window.alert(fullMessage);
        return;
      }

      if (buttons.length === 1) {
        window.alert(fullMessage);
        buttons[0]?.onPress?.();
        return;
      }

      // Two or more buttons (e.g. Cancel vs Delete)
      const cancelBtn = buttons.find((b) => b.style === 'cancel');
      const actionBtn = buttons.find((b) => b.style !== 'cancel') || buttons[buttons.length - 1];

      // Use native browser confirm dialog
      const confirmed = window.confirm(fullMessage);
      if (confirmed) {
        actionBtn?.onPress?.();
      } else {
        cancelBtn?.onPress?.();
      }
    };
  }
}
