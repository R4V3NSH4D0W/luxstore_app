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
import { SafeAreaView } from "react-native-safe-area-context";

const { width } = Dimensions.get("window");

export default function WelcomeScreen() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <StatusBar style="dark" />

      {/* Abstract Gradient Background or Image Placeholder */}
      <View style={styles.backgroundAccent} />

      <SafeAreaView style={styles.safeArea}>
        <View style={styles.content}>
          <View style={styles.header}>
            <Text style={styles.logoText}>LUXSTORE</Text>
            <Text style={styles.tagline}>Premium Redefined</Text>
          </View>

          <View style={styles.placeholderImageContainer}>
            {/* Placeholder for a hero illustration */}
            <View style={styles.circleGraphic} />
          </View>

          <View style={styles.footer}>
            <Link href="/(auth)/login" asChild>
              <TouchableOpacity style={styles.primaryButton}>
                <Text style={styles.primaryButtonText}>Sign In</Text>
              </TouchableOpacity>
            </Link>

            <Link href="/(auth)/register" asChild>
              <TouchableOpacity style={styles.secondaryButton}>
                <Text style={styles.secondaryButtonText}>Create Account</Text>
              </TouchableOpacity>
            </Link>

            {/* Guest Skip */}
            <TouchableOpacity
              style={styles.skipButton}
              onPress={() => router.replace("/(tabs)")}
            >
              <Text style={styles.skipText}>Skip for now</Text>
            </TouchableOpacity>
          </View>
        </View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F4F6F8",
  },
  backgroundAccent: {
    position: "absolute",
    top: -100,
    right: -100,
    width: 300,
    height: 300,
    borderRadius: 150,
    backgroundColor: "rgba(212, 175, 55, 0.1)", // Very subtle Gold
  },
  safeArea: {
    flex: 1,
  },
  content: {
    flex: 1,
    justifyContent: "space-between",
    padding: 32,
  },
  header: {
    marginTop: 40,
    alignItems: "center",
  },
  logoText: {
    fontSize: 42,
    fontWeight: "800",
    color: "#1A1A1A",
    letterSpacing: 4,
    marginBottom: 8,
  },
  tagline: {
    fontSize: 14,
    color: "#666666",
    letterSpacing: 2,
    textTransform: "uppercase",
  },
  placeholderImageContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  circleGraphic: {
    width: width * 0.7,
    height: width * 0.7,
    borderRadius: (width * 0.7) / 2,
    backgroundColor: "#FFFFFF",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 20 },
    shadowOpacity: 0.1,
    shadowRadius: 30,
    elevation: 5,
  },
  footer: {
    gap: 16,
    marginBottom: 20,
    alignItems: "center", // Center the skip button
  },
  primaryButton: {
    width: "100%",
    backgroundColor: "#1A1A1A",
    paddingVertical: 20,
    borderRadius: 20,
    alignItems: "center",
    shadowColor: "#1A1A1A",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.25,
    shadowRadius: 20,
    elevation: 8,
  },
  primaryButtonText: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "600",
    letterSpacing: 0.5,
  },
  secondaryButton: {
    width: "100%",
    backgroundColor: "#FFFFFF",
    paddingVertical: 20,
    borderRadius: 20,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
  },
  secondaryButtonText: {
    color: "#1A1A1A",
    fontSize: 18,
    fontWeight: "600",
    letterSpacing: 0.5,
  },
  skipButton: {
    marginTop: 4,
    padding: 10,
  },
  skipText: {
    color: "#888",
    fontSize: 14,
    fontWeight: "500",
    textDecorationLine: "underline",
  },
});
