import { StripeProvider } from "@stripe/stripe-react-native";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Stack, useRouter, useSegments } from "expo-router";
import { useEffect, useState } from "react";
import { ActivityIndicator, View } from "react-native";
import { AuthProvider, useAuth } from "./context/auth-context";
import { CartProvider } from "./context/cart-context";
import { CurrencyProvider } from "./context/currency-context";
import { ThemeProvider, useTheme } from "./context/theme-context";
import { ToastProvider } from "./context/toast-context";
import usePushNotifications from "./hooks/usePushNotifications";
import { useRealtimeUpdates } from "./hooks/useRealtimeUpdates";

import { api } from "./lib/api-client";

import ServerErrorScreen, { HealthCheckLoader } from "./server-error";

const queryClient = new QueryClient();

function RootLayoutNav() {
  const { userToken, isLoading: isAuthLoading } = useAuth();
  const segments = useSegments();
  const router = useRouter();
  const { colors } = useTheme();

  const [healthStatus, setHealthStatus] = useState<
    "checking" | "healthy" | "unhealthy"
  >("checking");

  const performHealthCheck = async () => {
    if (process.env.EXPO_PUBLIC_ENABLE_HEALTH_CHECK !== "true") {
      setHealthStatus("healthy");
      return;
    }

    setHealthStatus("checking");
    console.log("[Health Check] Verifying server status...");
    const isHealthy = await api.checkHealth();

    if (!isHealthy) {
      console.error("[Health Check] Server is unhealthy.");
      setHealthStatus("unhealthy");
    } else {
      console.log("[Health Check] Server is healthy.");
      setHealthStatus("healthy");
    }
  };

  useEffect(() => {
    performHealthCheck();
  }, []);

  useEffect(() => {
    if (isAuthLoading || healthStatus !== "healthy") return;

    const inTabsGroup = segments[0] === "(tabs)";
    const inScreensGroup = segments[0] === "(screens)";
    const inCampaignGroup = segments[0] === "campaign";

    if (userToken && !inTabsGroup && !inScreensGroup && !inCampaignGroup) {
      // User is signed in, redirect to tabs
      router.replace("/(tabs)");
    }
  }, [userToken, isAuthLoading, healthStatus, segments, router]);

  useRealtimeUpdates(
    process.env.EXPO_PUBLIC_WS_URL,
    healthStatus === "healthy" ? userToken : null,
  );
  usePushNotifications();

  // 1. Show health check loader
  if (healthStatus === "checking") {
    return <HealthCheckLoader colors={colors} />;
  }

  // 2. Show error screen as a component (avoids flickering redirects)
  if (healthStatus === "unhealthy") {
    return <ServerErrorScreen onRetry={performHealthCheck} />;
  }

  // 3. Show auth loading spinner
  if (isAuthLoading) {
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

  // 4. Healthy and ready: Mount API-dependent providers and the App Stack
  return (
    <CurrencyProvider>
      <CartProvider>
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
            <Stack.Screen name="server-error" options={{ animation: "none" }} />
          </Stack>
        </View>
      </CartProvider>
    </CurrencyProvider>
  );
}

export default function RootLayout() {
  return (
    <QueryClientProvider client={queryClient}>
      <StripeProvider
        publishableKey={process.env.EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY || ""}
        merchantIdentifier="merchant.com.luxstore"
      >
        <ThemeProvider>
          <AuthProvider>
            <ToastProvider>
              <RootLayoutNav />
            </ToastProvider>
          </AuthProvider>
        </ThemeProvider>
      </StripeProvider>
    </QueryClientProvider>
  );
}
