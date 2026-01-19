import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import React, { useEffect } from "react";
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import Animated, {
  Easing,
  FadeIn,
  FadeInDown,
  ZoomIn,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withRepeat,
  withTiming,
} from "react-native-reanimated";
import { SafeAreaView } from "react-native-safe-area-context";
import { Logo } from "./components/ui/Logo";
import { useTheme } from "./context/theme-context";

export function HealthCheckLoader({ colors }: { colors: any }) {
  return (
    <View
      style={{
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: colors.background,
        padding: 40,
      }}
    >
      <Animated.View entering={ZoomIn.duration(800)}>
        <ActivityIndicator size="large" color={colors.primary} />
      </Animated.View>
      <View style={{ marginTop: 24, alignItems: "center" }}>
        <Animated.Text
          entering={FadeInDown.delay(200).duration(600)}
          style={{
            color: colors.text,
            fontSize: 16,
            fontWeight: "700",
            textAlign: "center",
            marginBottom: 8,
            letterSpacing: 2,
            textTransform: "uppercase",
          }}
        >
          Initializing LuxStore
        </Animated.Text>
        <Animated.View
          entering={FadeIn.delay(400).duration(800)}
          style={{
            width: 30,
            height: 1,
            backgroundColor: colors.primary,
            marginBottom: 16,
            opacity: 0.3,
          }}
        />
        <Animated.Text
          entering={FadeInDown.delay(600).duration(600)}
          style={{
            color: colors.muted,
            fontSize: 13,
            textAlign: "center",
            lineHeight: 20,
            fontWeight: "500",
          }}
        >
          Establishing secure connection to server...
        </Animated.Text>
      </View>
    </View>
  );
}

export default function ServerErrorScreen({
  onRetry,
}: {
  onRetry?: () => void;
}) {
  const router = useRouter();
  const { colors, isDark } = useTheme();

  const handleRetry = () => {
    if (onRetry) {
      onRetry();
    } else {
      router.replace("/(tabs)");
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <LinearGradient
        colors={[
          isDark ? "#000000" : "#F8F8F8",
          isDark ? "#1A1A1A" : "#FFFFFF",
          colors.background,
        ]}
        style={StyleSheet.absoluteFill}
      />

      <SafeAreaView style={styles.content}>
        <Animated.View
          entering={FadeInDown.duration(1000).springify()}
          style={styles.header}
        >
          <Logo color={colors.text} width={40} height={40} />
          <View
            style={[
              styles.divider,
              { backgroundColor: isDark ? "#333" : "#DDD" },
            ]}
          />
        </Animated.View>

        <View style={styles.visualSection}>
          <View style={styles.iconWrapper}>
            {/* Sonar Ripple Effect */}
            <RippleCircle delay={0} colors={colors} />
            <RippleCircle delay={1000} colors={colors} />
            <RippleCircle delay={2000} colors={colors} />

            <Animated.View
              entering={ZoomIn.delay(300).duration(1000)}
              style={styles.iconContainer}
            >
              <View
                style={[
                  styles.iconCircle,
                  {
                    borderColor: isDark
                      ? "rgba(255,255,255,0.15)"
                      : "rgba(0,0,0,0.08)",
                  },
                ]}
              >
                <Ionicons
                  name="cloud-offline-outline"
                  size={48}
                  color={colors.text}
                  style={{ opacity: 0.8 }}
                />
              </View>
            </Animated.View>
          </View>

          <Animated.Text
            entering={FadeInDown.delay(500).duration(800)}
            style={[styles.title, { color: colors.text }]}
          >
            CONNECTION LOST
          </Animated.Text>

          <Animated.Text
            entering={FadeInDown.delay(700).duration(800)}
            style={[styles.message, { color: colors.muted }]}
          >
            Our server is currently unreachable. It might be under maintenance
            or your network connection is unstable.
          </Animated.Text>
        </View>

        <Animated.View
          entering={FadeInDown.delay(900).duration(800)}
          style={styles.actionSection}
        >
          <TouchableOpacity
            style={[
              styles.primaryButton,
              { backgroundColor: isDark ? "#FFFFFF" : "#000000" },
            ]}
            onPress={handleRetry}
          >
            <Text
              style={[
                styles.primaryButtonText,
                { color: isDark ? "#000000" : "#FFFFFF" },
              ]}
            >
              RETRY CONNECTION
            </Text>
          </TouchableOpacity>
        </Animated.View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: 40,
    justifyContent: "space-between",
    paddingVertical: 60,
  },
  header: {
    alignItems: "center",
  },
  divider: {
    width: 40,
    height: 1,
    marginTop: 16,
  },
  visualSection: {
    alignItems: "center",
    gap: 24,
  },
  iconContainer: {
    zIndex: 2,
  },
  iconCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 1.5,
    justifyContent: "center",
    alignItems: "center",
  },
  title: {
    fontSize: 20,
    fontWeight: "800",
    letterSpacing: 4,
    textAlign: "center",
  },
  message: {
    fontSize: 14,
    textAlign: "center",
    lineHeight: 22,
    fontWeight: "500",
  },
  actionSection: {
    width: "100%",
    gap: 16,
  },
  primaryButton: {
    height: 56,
    borderRadius: 2,
    justifyContent: "center",
    alignItems: "center",
  },
  primaryButtonText: {
    fontSize: 14,
    fontWeight: "800",
    letterSpacing: 2,
  },
  iconWrapper: {
    width: 240,
    height: 240,
    justifyContent: "center",
    alignItems: "center",
  },
});

const RippleCircle = ({ delay, colors }: { delay: number; colors: any }) => {
  const scale = useSharedValue(1);
  const opacity = useSharedValue(0.3);

  useEffect(() => {
    scale.value = withDelay(
      delay,
      withRepeat(
        withTiming(2.2, {
          duration: 3500,
          easing: Easing.bezier(0.4, 0, 0.2, 1),
        }),
        -1,
        false,
      ),
    );
    opacity.value = withDelay(
      delay,
      withRepeat(
        withTiming(0, {
          duration: 3500,
          easing: Easing.bezier(0.4, 0, 0.2, 1),
        }),
        -1,
        false,
      ),
    );
  }, [delay, scale, opacity]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: opacity.value,
  }));

  return (
    <Animated.View
      style={[
        {
          position: "absolute",
          width: 120,
          height: 120,
          borderRadius: 60,
          borderWidth: 1,
          borderColor: colors.text,
        },
        animatedStyle,
      ]}
    />
  );
};
