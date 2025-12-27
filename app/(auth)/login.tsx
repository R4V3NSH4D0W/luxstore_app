import { useToast } from "@/app/context/toast-context";
import { Ionicons } from "@expo/vector-icons";
import { Link, useRouter } from "expo-router";
import React, { useState } from "react";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLogin } from "../api/auth";
import { useAuth } from "../context/auth-context";
import { useTheme } from "../context/theme-context";

export default function LoginScreen() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();
  const { signIn } = useAuth();
  const { colors, isDark } = useTheme();
  const { showToast } = useToast();

  const { mutate: login, isPending } = useLogin();

  const handleLogin = () => {
    if (!email || !password) {
      showToast("Please fill in all fields", "error");
      return;
    }

    login(
      { email, password },
      {
        onSuccess: async (response) => {
          if (response.success) {
            console.log("Login successful:", response);
            showToast("Welcome back!", "success");
            const token = response.data.accessToken;
            await signIn(token);
          } else {
            showToast(response.message || "Login failed", "error");
          }
        },
        onError: (error) => {
          showToast(error.message || "An error occurred during login", "error");
        },
      }
    );
  };

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: colors.background }]}
      edges={["top", "left", "right"]}
    >
      <StatusBar
        barStyle={isDark ? "light-content" : "dark-content"}
        backgroundColor={colors.background}
      />

      <View style={styles.headerNav}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={[styles.backButton, { backgroundColor: colors.card }]}
        >
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.keyboardView}
      >
        <View style={styles.contentContainer}>
          <View style={styles.header}>
            <Text style={[styles.title, { color: colors.text }]}>
              Welcome{"\n"}Back
            </Text>
            <Text style={[styles.subtitle, { color: colors.muted }]}>
              Sign in to continue
            </Text>
          </View>

          <View style={styles.formArea}>
            <View style={styles.inputContainer}>
              <Text style={[styles.label, { color: colors.text }]}>
                Email Address
              </Text>
              <TextInput
                style={[
                  styles.input,
                  { backgroundColor: colors.card, color: colors.text },
                ]}
                placeholder="john@example.com"
                placeholderTextColor="#A0A0A0"
                value={email}
                onChangeText={setEmail}
                autoCapitalize="none"
                keyboardType="email-address"
              />
            </View>

            <View style={styles.inputContainer}>
              <Text style={[styles.label, { color: colors.text }]}>
                Password
              </Text>
              <View
                style={[
                  styles.passwordContainer,
                  { backgroundColor: colors.card },
                ]}
              >
                <TextInput
                  style={[styles.passwordInput, { color: colors.text }]}
                  placeholder="••••••••"
                  placeholderTextColor="#A0A0A0"
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry={!showPassword}
                />
                <TouchableOpacity
                  onPress={() => setShowPassword(!showPassword)}
                  style={styles.eyeIcon}
                >
                  <Ionicons
                    name={showPassword ? "eye-off" : "eye"}
                    size={20}
                    color={colors.muted}
                  />
                </TouchableOpacity>
              </View>
            </View>

            <TouchableOpacity
              style={[styles.button, { backgroundColor: colors.primary }]}
              onPress={handleLogin}
              disabled={isPending}
            >
              {isPending ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={[styles.buttonText, { color: colors.secondary }]}>
                  Sign In
                </Text>
              )}
            </TouchableOpacity>

            <View style={styles.footer}>
              <Text style={[styles.footerText, { color: colors.muted }]}>
                Don't have an account?{" "}
              </Text>
              <Link href="/(auth)/register" asChild>
                <TouchableOpacity>
                  <Text style={[styles.link, { color: colors.text }]}>
                    Sign Up
                  </Text>
                </TouchableOpacity>
              </Link>
            </View>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F4F6F8", // Soft Cool Gray
  },
  keyboardView: {
    flex: 1,
  },
  headerNav: {
    paddingHorizontal: 24,
    paddingVertical: 10,
    zIndex: 10,
  },
  backButton: {
    width: 45,
    height: 45,
    backgroundColor: "#FFFFFF",
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 2,
  },
  contentContainer: {
    flex: 1,
    paddingHorizontal: 30, // Native generous horizontal padding
  },
  header: {
    marginTop: 20,
    marginBottom: 40,
  },
  title: {
    fontSize: 40, // Large Native Title
    fontWeight: "800",
    color: "#1A1A1A",
    marginBottom: 10,
    lineHeight: 48,
  },
  subtitle: {
    fontSize: 16,
    color: "#666666",
    fontWeight: "500",
  },
  formArea: {
    flex: 1,
  },
  inputContainer: {
    marginBottom: 24,
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    color: "#1A1A1A",
    marginBottom: 8,
    marginLeft: 4,
  },
  input: {
    backgroundColor: "#FFFFFF", // White input on Gray background
    borderRadius: 16,
    paddingVertical: 18,
    paddingHorizontal: 20,
    fontSize: 16,
    color: "#1A1A1A",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 5,
    elevation: 1,
  },
  passwordContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 5,
    elevation: 1,
  },
  passwordInput: {
    flex: 1,
    paddingVertical: 18,
    paddingHorizontal: 20,
    fontSize: 16,
    color: "#1A1A1A",
  },
  eyeIcon: {
    padding: 16,
  },
  button: {
    backgroundColor: "#1A1A1A",
    paddingVertical: 20,
    alignItems: "center",
    marginTop: 20,
    borderRadius: 20, // Rounded pill style
    shadowColor: "#1A1A1A",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 8,
  },
  buttonText: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "600",
  },
  footer: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 40,
    marginBottom: 20,
  },
  footerText: {
    color: "#666666",
    fontSize: 15,
  },
  link: {
    color: "#1A1A1A",
    fontSize: 15,
    fontWeight: "700",
  },
});
