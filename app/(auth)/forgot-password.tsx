import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Keyboard,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useForgotPassword } from "../api/auth";
import { CustomAlert } from "../components/common/CustomAlert";
import { useTheme } from "../context/theme-context";
import { useToast } from "../context/toast-context";

export default function ForgotPasswordScreen() {
  const router = useRouter();
  const { colors, isDark } = useTheme();
  const { showToast } = useToast();
  const [email, setEmail] = useState("");

  const forgotPasswordMutation = useForgotPassword();

  const handleResetRequest = async () => {
    if (!email) {
      showToast("Please enter your email", "error");
      return;
    }

    // Simple email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      showToast("Please enter a valid email address", "error");
      return;
    }

    try {
      await forgotPasswordMutation.mutateAsync({ email, source: "app" });
      // Show success alert
      showAlert(
        "Check Your Email",
        "If an account exists with this email, you will receive a password reset link shortly.",
        [{ text: "Back to Login", onPress: () => router.back() }],
      );
    } catch (error: any) {
      // Even if error, we often don't want to reveal too much, but for now we follow backend response
      console.error(error);
      showToast(error.message || "Failed to request password reset", "error");
    }
  };

  const [alertConfig, setAlertConfig] = useState<{
    visible: boolean;
    title: string;
    message?: string;
    buttons?: any[];
  }>({ visible: false, title: "" });

  const hideAlert = () =>
    setAlertConfig((prev) => ({ ...prev, visible: false }));

  const showAlert = (title: string, message?: string, buttons?: any[]) => {
    const wrappedButtons = buttons
      ? buttons.map((btn) => ({
          ...btn,
          onPress: () => {
            hideAlert();
            btn.onPress?.();
          },
        }))
      : [{ text: "OK", onPress: hideAlert }];

    setAlertConfig({ visible: true, title, message, buttons: wrappedButtons });
  };

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <SafeAreaView
        style={[styles.container, { backgroundColor: colors.background }]}
      >
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => router.back()}
            style={styles.backButton}
          >
            <Ionicons name="arrow-back" size={24} color={colors.text} />
          </TouchableOpacity>
        </View>

        <View style={styles.content}>
          <Text style={[styles.title, { color: colors.text }]}>
            Forgot Password?
          </Text>
          <Text style={[styles.subtitle, { color: colors.muted }]}>
            Enter your email address to receive a password reset link.
          </Text>

          <View style={styles.form}>
            <View style={styles.inputContainer}>
              <Text style={[styles.label, { color: isDark ? "#EEE" : "#333" }]}>
                Email
              </Text>
              <TextInput
                style={[
                  styles.input,
                  {
                    backgroundColor: colors.card,
                    color: colors.text,
                    borderColor: colors.border,
                  },
                ]}
                placeholder="Enter your email"
                placeholderTextColor={colors.muted}
                value={email}
                onChangeText={setEmail}
                autoCapitalize="none"
                keyboardType="email-address"
              />
            </View>

            <TouchableOpacity
              style={[
                styles.button,
                {
                  backgroundColor: colors.primary,
                  opacity: forgotPasswordMutation.isPending ? 0.7 : 1,
                },
              ]}
              onPress={handleResetRequest}
              disabled={forgotPasswordMutation.isPending}
            >
              {forgotPasswordMutation.isPending ? (
                <ActivityIndicator color={isDark ? "black" : "white"} />
              ) : (
                <Text
                  style={[
                    styles.buttonText,
                    { color: isDark ? "black" : "white" },
                  ]}
                >
                  Send Reset Link
                </Text>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => router.back()}
              style={styles.cancelLink}
            >
              <Text style={[styles.cancelText, { color: colors.muted }]}>
                Cancel
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        <CustomAlert
          visible={alertConfig.visible}
          title={alertConfig.title}
          message={alertConfig.message}
          buttons={alertConfig.buttons}
          onClose={hideAlert}
        />
      </SafeAreaView>
    </TouchableWithoutFeedback>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 10,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "flex-start",
  },
  content: {
    padding: 24,
    flex: 1,
    justifyContent: "center",
    marginTop: -60, // visual balance
  },
  title: {
    fontSize: 32,
    fontWeight: "bold",
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 16,
    marginBottom: 40,
    lineHeight: 24,
  },
  form: {
    gap: 20,
  },
  inputContainer: {
    gap: 8,
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    marginLeft: 4,
  },
  input: {
    height: 56,
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 16,
    fontSize: 16,
  },
  button: {
    height: 56,
    borderRadius: 28,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: "600",
  },
  cancelLink: {
    alignItems: "center",
    padding: 10,
  },
  cancelText: {
    fontSize: 16,
  },
});
