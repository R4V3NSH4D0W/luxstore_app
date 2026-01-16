import { Logo } from "@/app/components/ui/Logo";
import { useAuth } from "@/app/context/auth-context";
import { useTheme } from "@/app/context/theme-context";
import { LinearGradient } from "expo-linear-gradient";
import { Link, useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React from "react";
import {
    Dimensions,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import Animated, { FadeIn, FadeInDown, ZoomIn } from "react-native-reanimated";
import { SafeAreaView } from "react-native-safe-area-context";

const { width, height } = Dimensions.get("window");

export default function WelcomeScreen() {
  const router = useRouter();
  const { colors, isDark } = useTheme();
  const { userToken, isLoading } = useAuth();

  // If loading or already authenticated, don't render the welcome UI.
  if (isLoading || userToken) {
    return null;
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar style={isDark ? "light" : "dark"} />

      {/* Cinematic Background */}
      <LinearGradient
        colors={[
          isDark ? "#000000" : "#F8F8F8",
          isDark ? "#1A1A1A" : "#FFFFFF",
          colors.background,
        ]}
        style={StyleSheet.absoluteFill}
      />

      {/* Decorative Accent */}
      <Animated.View
        entering={FadeIn.duration(1500)}
        style={[
          styles.ambientLight,
          {
            backgroundColor: isDark
              ? "rgba(255, 255, 255, 0.03)"
              : "rgba(0, 0, 0, 0.02)",
          },
        ]}
      />

      <SafeAreaView style={styles.safeArea}>
        <View style={styles.content}>
          {/* Logo Section */}
          <Animated.View
            entering={FadeInDown.delay(300).duration(1000).springify()}
            style={styles.header}
          >
            <Logo color={colors.text} width={40} height={40} />
            <View
              style={[
                styles.logoDivider,
                { backgroundColor: isDark ? "#444" : "#DDD" },
              ]}
            />
            <Text style={[styles.tagline, { color: colors.muted }]}>
              ESTABLISHED IN EXCELLENCE
            </Text>
          </Animated.View>

          {/* Hero Visual Section */}
          <View style={styles.heroSection}>
            <Animated.View
              entering={ZoomIn.delay(600).duration(1200)}
              style={styles.visualContainer}
            >
              <View
                style={[
                  styles.abstractCircle,
                  { borderColor: isDark ? "#333" : "#EEE" },
                ]}
              />
              <View
                style={[
                  styles.abstractCircleInner,
                  { borderColor: isDark ? "#444" : "#DDD" },
                ]}
              />
              <Logo color={colors.text} width={100} height={100} showText={false} />
            </Animated.View>
          </View>

          {/* Action Section */}
          <View style={styles.actionSection}>
            <Animated.View
              entering={FadeInDown.delay(900).duration(800)}
              style={styles.buttonGroup}
            >
              <Link href="/(auth)/login" asChild>
                <TouchableOpacity
                  style={[
                    styles.primaryButton,
                    {
                      backgroundColor: isDark ? "#FFFFFF" : "#000000",
                      shadowColor: isDark ? "#FFFFFF" : "#000000",
                    },
                  ]}
                >
                  <Text
                    style={[
                      styles.primaryButtonText,
                      {
                        color: isDark ? "#FFFFFF" : "#000000",
                        fontSize: 14,
                        fontWeight: "800",
                      },
                    ]}
                  >
                    SIGN IN
                  </Text>
                </TouchableOpacity>
              </Link>

              <Link href="/(auth)/register" asChild>
                <TouchableOpacity
                  style={[
                    styles.secondaryButton,
                    { borderColor: isDark ? "#444" : colors.text },
                  ]}
                >
                  <Text
                    style={[styles.secondaryButtonText, { color: colors.text }]}
                  >
                    CREATE ACCOUNT
                  </Text>
                </TouchableOpacity>
              </Link>
            </Animated.View>

            <Animated.View entering={FadeIn.delay(1200).duration(1000)}>
              <TouchableOpacity
                style={styles.skipButton}
                onPress={() => router.replace("/(tabs)")}
              >
                <Text style={[styles.skipText, { color: colors.muted }]}>
                  Explore as Guest
                </Text>
              </TouchableOpacity>
            </Animated.View>
          </View>
        </View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  ambientLight: {
    position: "absolute",
    top: -height * 0.2,
    right: -width * 0.3,
    width: width * 1.5,
    height: width * 1.5,
    borderRadius: (width * 1.5) / 2,
  },
  safeArea: {
    flex: 1,
  },
  content: {
    flex: 1,
    justifyContent: "space-between",
    paddingHorizontal: 40,
    paddingVertical: 60,
  },
  header: {
    alignItems: "center",
  },
  logoText: {
    fontSize: 32,
    fontWeight: "300",
    letterSpacing: 12,
    marginBottom: 16,
    textAlign: "center",
  },
  logoDivider: {
    width: 40,
    height: 1,
    marginBottom: 16,
  },
  tagline: {
    fontSize: 10,
    fontWeight: "600",
    letterSpacing: 3,
    textTransform: "uppercase",
    textAlign: "center",
  },
  heroSection: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  visualContainer: {
    width: 200,
    height: 200,
    justifyContent: "center",
    alignItems: "center",
  },
  abstractCircle: {
    position: "absolute",
    width: 200,
    height: 200,
    borderRadius: 100,
    borderWidth: 1,
    opacity: 0.5,
  },
  abstractCircleInner: {
    position: "absolute",
    width: 160,
    height: 160,
    borderRadius: 80,
    borderWidth: 1,
    opacity: 0.3,
  },
  heroText: {
    fontSize: 48,
    fontWeight: "200",
    letterSpacing: 8,
  },
  actionSection: {
    width: "100%",
    gap: 24,
  },
  buttonGroup: {
    gap: 12,
  },
  primaryButton: {
    height: 56,
    width: "100%",
    borderRadius: 2,
    justifyContent: "center",
    alignItems: "center",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 4,
  },
  primaryButtonText: {
    fontSize: 12,
    fontWeight: "700",
    letterSpacing: 2,
  },
  secondaryButton: {
    height: 56,
    width: "100%",
    borderRadius: 2,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
  },
  secondaryButtonText: {
    fontSize: 12,
    fontWeight: "700",
    letterSpacing: 2,
  },
  skipButton: {
    alignItems: "center",
    paddingTop: 8,
  },
  skipText: {
    fontSize: 11,
    fontWeight: "600",
    letterSpacing: 1,
    textTransform: "uppercase",
  },
});
