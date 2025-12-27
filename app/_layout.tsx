import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Stack, useRouter, useSegments } from "expo-router";
import { useEffect } from "react";
import { ActivityIndicator, View } from "react-native";
import { AuthProvider, useAuth } from "./context/auth-context";
import { CartProvider } from "./context/cart-context";
import { CurrencyProvider } from "./context/currency-context";
import { ThemeProvider, useTheme } from "./context/theme-context";
import { ToastProvider } from "./context/toast-context";
import usePushNotifications from "./hooks/usePushNotifications";
import { useRealtimeUpdates } from "./hooks/useRealtimeUpdates";

const queryClient = new QueryClient();

function RootLayoutNav() {
  const { userToken, isLoading } = useAuth();
  const segments = useSegments();
  const router = useRouter();
  const { colors } = useTheme();

  const WS_URL =
    process.env.EXPO_PUBLIC_WS_URL || "wss://ng4mq8bt-3000.inc1.devtunnels.ms";
  useRealtimeUpdates(WS_URL);
  usePushNotifications();

  useEffect(() => {
    if (isLoading) return;

    const inTabsGroup = segments[0] === "(tabs)";
    const inScreensGroup = segments[0] === "(screens)";
    const inCampaignGroup = segments[0] === "campaign";

    if (userToken && !inTabsGroup && !inScreensGroup && !inCampaignGroup) {
      // User is signed in, redirect to tabs
      router.replace("/(tabs)");
    }
    // REMOVED: Unauthenticated strict redirect logic.
    // Guests can now stay in their current screen or navigate to tabs if they hit "Skip".
  }, [userToken, isLoading, segments]);

  if (isLoading) {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: colors.background,
        }}
      >
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <Stack
        screenOptions={{
          headerShown: false,
          animation: "fade",
          contentStyle: { backgroundColor: colors.background },
        }}
      >
        <Stack.Screen name="index" />
        <Stack.Screen name="(auth)" />
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="(screens)" />
        <Stack.Screen name="(auth-screens)" />
        <Stack.Screen name="campaign" options={{ headerShown: false }} />
      </Stack>
    </View>
  );
}

export default function RootLayout() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <AuthProvider>
          <ToastProvider>
            <CurrencyProvider>
              <CartProvider>
                <RootLayoutNav />
              </CartProvider>
            </CurrencyProvider>
          </ToastProvider>
        </AuthProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}
