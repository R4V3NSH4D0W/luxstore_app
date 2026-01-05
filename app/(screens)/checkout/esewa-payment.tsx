import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useState } from "react";
import { ActivityIndicator, StatusBar, StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { WebView } from "react-native-webview";
import { useTheme } from "../../context/theme-context";

export default function EsewaPaymentScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const { colors } = useTheme();

  // Parse params
  // Navigation passes params as strings, so we might need to parse JSON if we passed an object,
  // but simpler to pass individual fields or a stringified payload.
  // We'll assume 'payload' is passed as a JSON string, and 'url' is the form action.

  const url = params.url as string;
  const payloadStr = params.payload as string;

  const payload = payloadStr ? JSON.parse(payloadStr) : null;

  const [loading, setLoading] = useState(true);

  if (!url || !payload) {
    return (
      <SafeAreaView
        style={[
          styles.container,
          {
            backgroundColor: colors.background,
            justifyContent: "center",
            alignItems: "center",
          },
        ]}
      >
        <ActivityIndicator size="large" color={colors.primary} />
      </SafeAreaView>
    );
  }

  // Construct HTML form to auto-submit
  const formHtml = `
    <html>
      <head>
        <style>
          body { display: flex; justify-content: center; align-items: center; height: 100vh; background-color: #f5f5f5; font-family: sans-serif; }
          .loader { border: 4px solid #f3f3f3; border-top: 4px solid #60A5FA; border-radius: 50%; width: 40px; height: 40px; animation: spin 1s linear infinite; }
          @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
        </style>
      </head>
      <body>
        <div class="loader"></div>
        <form id="esewaForm" method="POST" action="${url}">
          ${Object.keys(payload)
            .map(
              (key) => `
            <input type="hidden" name="${key}" value="${payload[key]}" />
          `
            )
            .join("")}
        </form>
        <script>
          // Auto-submit the form
          setTimeout(function() {
             document.getElementById('esewaForm').submit();
          }, 500);
        </script>
      </body>
    </html>
  `;

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: colors.background }]}
    >
      <StatusBar barStyle="dark-content" />
      <WebView
        originWhitelist={["*"]}
        source={{ html: formHtml }}
        onLoadStart={() => setLoading(true)}
        onLoadEnd={() => setLoading(false)}
        style={{ flex: 1 }}
        onNavigationStateChange={(navState) => {
          // Check for success or failure URL matching our backend redirect
          // The backend redirects to luxstore://... which might be intercepted here or treated as a load failure depending on WebView behavior
          const url = navState.url;

          if (url.includes("checkout/success")) {
            // Extract orderId from URL if needed
            // URL might be luxstore://checkout/success?orderId=...
            // OR backend http success url

            // If we catch the deep link or the backend success page:
            const match = url.match(/orderId=([^&]*)/);
            const orderId = match ? match[1] : null;

            if (orderId) {
              router.replace({
                pathname: "/(screens)/checkout/success",
                params: { orderId },
              });
            }
          } else if (url.includes("checkout/failure")) {
            router.back();
            // Ideally show an alert too, but back is safe fallback
          }
        }}
        // Handle Deep Links explicitly (iOS often needs this)
        onShouldStartLoadWithRequest={(request) => {
          if (request.url.startsWith("luxstore://")) {
            // It's a deep link, handle it
            if (request.url.includes("checkout/success")) {
              const match = request.url.match(/orderId=([^&]*)/);
              const orderId = match ? match[1] : null;
              if (orderId) {
                router.replace({
                  pathname: "/(screens)/checkout/success",
                  params: { orderId },
                });
              }
              return false; // Stop loading in WebView
            } else if (request.url.includes("checkout/failure")) {
              router.back();
              // Could trigger alert here via context if we made this more robust
              return false;
            }
          }
          return true;
        }}
      />
      {loading && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(255,255,255,0.8)",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 10,
  },
});
