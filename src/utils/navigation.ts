import { useRouter } from 'expo-router';

export type AppRouter = ReturnType<typeof useRouter>;

/**
 * Safely navigates back if there is a screen in the navigation stack.
 * If the stack is empty (e.g. direct page refresh in web, deeplink, or initial route),
 * falls back to the specified route (defaults to '/(tabs)') instead of throwing
 * React Navigation warning "The action 'GO_BACK' was not handled by any navigator".
 */
export function safeBack(
  router: { canGoBack?: () => boolean; back: () => void; replace: (href: any) => void },
  fallbackRoute: string = '/(tabs)'
): void {
  try {
    if (typeof router.canGoBack === 'function' && router.canGoBack()) {
      router.back();
    } else {
      router.replace(fallbackRoute);
    }
  } catch {
    router.replace(fallbackRoute);
  }
}
