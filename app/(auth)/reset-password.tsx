import { Logo } from "@/app/components/ui/Logo";
import { useToast } from "@/app/context/toast-context";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useLocalSearchParams, useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Dimensions,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import Animated, {
  Easing,
  FadeInDown,
  ZoomIn,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withRepeat,
  withTiming,
} from "react-native-reanimated";
import { SafeAreaView } from "react-native-safe-area-context";
import { authApi, useResetPassword } from "../api/auth";
import { useTheme } from "../context/theme-context";

const { width, height } = Dimensions.get("window");

export default function ResetPasswordScreen() {
  const { token } = useLocalSearchParams<{ token: string }>();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isValidating, setIsValidating] = useState(true);
  const [isTokenValid, setIsTokenValid] = useState(false);

  const router = useRouter();
  const { colors, isDark } = useTheme();
  const { showToast } = useToast();

  const resetPasswordMutation = useResetPassword();

  // Pulse animations for visual flair
  const pulseOuter = useSharedValue(1);
  const pulseInner = useSharedValue(1);

  useEffect(() => {
    pulseOuter.value = withRepeat(
      withTiming(1.25, {
        duration: 2500,
        easing: Easing.bezier(0.4, 0, 0.2, 1),
      }),
      -1,
      true,
    );
    pulseInner.value = withDelay(
      800,
      withRepeat(
        withTiming(1.2, {
          duration: 2500,
          easing: Easing.bezier(0.4, 0, 0.2, 1),
        }),
        -1,
        true,
      ),
    );

    if (!token) {
      showToast("Invalid reset link", "error");
      setIsValidating(false);
      return;
    }

    const validateToken = async () => {
      try {
        const response = await authApi.validateResetToken(token);
        if (response.success && response.data.valid) {
          setIsTokenValid(true);
        } else {
          showToast(response.error || "Reset link expired or invalid", "error");
        }
      } catch (error) {
        showToast("Error validating reset link", "error");
      } finally {
        setIsValidating(false);
      }
    };

    validateToken();
  }, [token]);

  const outerAnimationStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pulseOuter.value }],
    opacity: (isDark ? 0.4 : 0.6) / pulseOuter.value,
  }));

  const innerAnimationStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pulseInner.value }],
    opacity: (isDark ? 0.3 : 0.5) / pulseInner.value,
  }));

  const handleReset = () => {
    if (!password) {
      showToast("Please enter a new password", "error");
      return;
    }

    if (password.length < 6) {
      showToast("Password must be at least 6 characters", "error");
      return;
    }

    if (password !== confirmPassword) {
      showToast("Passwords do not match", "error");
      return;
    }

    resetPasswordMutation.mutate(
      { token: token as string, newPassword: password },
      {
        onSuccess: (response) => {
          if (response.success) {
            showToast("Password reset successfully", "success");
            router.replace("/(auth)/login");
          } else {
            showToast(response.message || "Failed to reset password", "error");
          }
        },
        onError: (error) => {
          showToast(error.message || "An error occurred", "error");
        },
      },
    );
  };

  if (isValidating) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color={colors.text} />
          <Text style={[styles.loadingText, { color: colors.muted }]}>
            Authenticating Link...
          </Text>
        </View>
      </View>
    );
  }

  if (!isTokenValid) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <LinearGradient
          colors={[
            isDark ? "#000000" : "#F8F8F8",
            isDark ? "#121212" : "#FFFFFF",
            colors.background,
          ]}
          style={StyleSheet.absoluteFill}
        />
        <SafeAreaView style={styles.safeArea}>
          <View style={styles.content}>
            <View style={styles.centerContainer}>
              <Animated.View
                entering={ZoomIn.duration(800)}
                style={styles.errorIconContainer}
              >
                <Ionicons
                  name="alert-circle-outline"
                  size={80}
                  color={colors.error}
                />
              </Animated.View>
              <Text style={[styles.title, { color: colors.text }]}>
                Expired Link
              </Text>
              <Text style={[styles.subtitle, { color: colors.muted }]}>
                This password reset link is invalid or has expired. Please
                request a new one to continue.
              </Text>
              <TouchableOpacity
                style={[styles.primaryButton, { backgroundColor: colors.text }]}
                onPress={() => router.replace("/(auth)/forgot-password")}
              >
                <Text
                  style={[
                    styles.primaryButtonText,
                    { color: isDark ? "black" : "white" },
                  ]}
                >
                  NEW REQUEST
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </SafeAreaView>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar style={isDark ? "light" : "dark"} />

      <LinearGradient
        colors={[
          isDark ? "#000000" : "#F8F8F8",
          isDark ? "#121212" : "#FFFFFF",
          colors.background,
        ]}
        style={StyleSheet.absoluteFill}
      />

      <SafeAreaView style={styles.safeArea}>
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={{ flex: 1 }}
        >
          <View style={styles.content}>
            {/* Header / Logo */}
            <Animated.View
              entering={FadeInDown.delay(200)}
              style={styles.header}
            >
              <Logo color={colors.text} width={40} height={40} />
              <View
                style={[
                  styles.logoDivider,
                  { backgroundColor: isDark ? "#333" : "#DDD" },
                ]}
              />
              <Text style={[styles.screenLabel, { color: colors.muted }]}>
                SECURE RESET
              </Text>
            </Animated.View>

            {/* Visual Centerpiece */}
            <View style={styles.heroSection}>
              <Animated.View
                entering={ZoomIn.delay(400).duration(1000)}
                style={styles.visualContainer}
              >
                <Animated.View
                  style={[
                    styles.abstractCircle,
                    { borderColor: isDark ? "#333" : "#CCC" },
                    outerAnimationStyle,
                  ]}
                />
                <Animated.View
                  style={[
                    styles.abstractCircleInner,
                    { borderColor: isDark ? "#444" : "#BBB" },
                    innerAnimationStyle,
                  ]}
                />
                <Ionicons
                  name="lock-closed-outline"
                  size={50}
                  color={colors.text}
                />
              </Animated.View>
            </View>

            {/* Input Section */}
            <Animated.View
              entering={FadeInDown.delay(600)}
              style={styles.formContainer}
            >
              <Text style={[styles.formTitle, { color: colors.text }]}>
                Set New Password
              </Text>
              <Text style={[styles.formSubtitle, { color: colors.muted }]}>
                Your new password should be at least 6 characters long.
              </Text>

              <View style={styles.inputGroup}>
                <View
                  style={[
                    styles.inputWrapper,
                    {
                      backgroundColor: colors.card,
                      borderColor: colors.border,
                    },
                  ]}
                >
                  <TextInput
                    style={[styles.input, { color: colors.text }]}
                    placeholder="New Password"
                    placeholderTextColor={colors.muted}
                    secureTextEntry={!showPassword}
                    value={password}
                    onChangeText={setPassword}
                    autoCapitalize="none"
                  />
                  <TouchableOpacity
                    onPress={() => setShowPassword(!showPassword)}
                    style={styles.eyeBtn}
                  >
                    <Ionicons
                      name={showPassword ? "eye-off" : "eye"}
                      size={20}
                      color={colors.muted}
                    />
                  </TouchableOpacity>
                </View>

                <View
                  style={[
                    styles.inputWrapper,
                    {
                      backgroundColor: colors.card,
                      borderColor: colors.border,
                    },
                  ]}
                >
                  <TextInput
                    style={[styles.input, { color: colors.text }]}
                    placeholder="Confirm Password"
                    placeholderTextColor={colors.muted}
                    secureTextEntry={!showPassword}
                    value={confirmPassword}
                    onChangeText={setConfirmPassword}
                    autoCapitalize="none"
                  />
                </View>
              </View>

              <TouchableOpacity
                style={[
                  styles.primaryButton,
                  {
                    backgroundColor: colors.text,
                    opacity: resetPasswordMutation.isPending ? 0.7 : 1,
                  },
                ]}
                onPress={handleReset}
                disabled={resetPasswordMutation.isPending}
              >
                {resetPasswordMutation.isPending ? (
                  <ActivityIndicator color={isDark ? "black" : "white"} />
                ) : (
                  <Text
                    style={[
                      styles.primaryButtonText,
                      { color: isDark ? "black" : "white" },
                    ]}
                  >
                    UPDATE PASSWORD
                  </Text>
                )}
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => router.back()}
                style={styles.backLink}
              >
                <Text style={[styles.backLinkText, { color: colors.muted }]}>
                  CANCEL
                </Text>
              </TouchableOpacity>
            </Animated.View>
          </View>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: 30,
    paddingVertical: 50,
  },
  centerContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: 20,
    fontSize: 14,
    letterSpacing: 2,
    fontWeight: "500",
    textTransform: "uppercase",
  },
  header: {
    alignItems: "center",
    marginBottom: 20,
  },
  logoDivider: {
    width: 30,
    height: 1,
    marginVertical: 12,
  },
  screenLabel: {
    fontSize: 10,
    letterSpacing: 4,
    fontWeight: "700",
    textTransform: "uppercase",
  },
  heroSection: {
    height: height * 0.25,
    justifyContent: "center",
    alignItems: "center",
  },
  visualContainer: {
    width: 150,
    height: 150,
    justifyContent: "center",
    alignItems: "center",
  },
  abstractCircle: {
    position: "absolute",
    width: 150,
    height: 150,
    borderRadius: 75,
    borderWidth: 1,
  },
  abstractCircleInner: {
    position: "absolute",
    width: 110,
    height: 110,
    borderRadius: 55,
    borderWidth: 1,
  },
  formContainer: {
    gap: 24,
  },
  formTitle: {
    fontSize: 28,
    fontWeight: "800",
    textAlign: "center",
    letterSpacing: -0.5,
  },
  formSubtitle: {
    fontSize: 15,
    textAlign: "center",
    lineHeight: 22,
    paddingHorizontal: 20,
    marginBottom: 10,
  },
  inputGroup: {
    gap: 12,
  },
  inputWrapper: {
    height: 60,
    borderRadius: 8,
    borderWidth: 1,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
  },
  input: {
    flex: 1,
    height: "100%",
    fontSize: 16,
    fontWeight: "500",
  },
  eyeBtn: {
    padding: 8,
  },
  primaryButton: {
    height: 60,
    borderRadius: 4,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.1,
    shadowRadius: 15,
    elevation: 5,
  },
  primaryButtonText: {
    fontSize: 14,
    fontWeight: "800",
    letterSpacing: 2,
  },
  backLink: {
    alignItems: "center",
    padding: 10,
  },
  backLinkText: {
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 2,
  },
  errorIconContainer: {
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: "800",
    marginBottom: 10,
    letterSpacing: 1,
    textTransform: "uppercase",
  },
  subtitle: {
    fontSize: 14,
    textAlign: "center",
    marginBottom: 30,
    lineHeight: 22,
    paddingHorizontal: 30,
  },
});
