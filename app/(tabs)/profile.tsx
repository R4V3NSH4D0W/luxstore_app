import { Ionicons } from "@expo/vector-icons";
import React from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useSettings } from "../api/shop";
import { useProfile } from "../api/users";
import ProfileSkeleton from "../components/ProfileSkeleton";
import GuestProfile from "../components/profile/GuestProfile";
import LoggedInProfile from "../components/profile/LoggedInProfile";
import { useAuth } from "../context/auth-context";
import { useTheme } from "../context/theme-context";

export default function ProfileScreen() {
  const { signOut, userToken } = useAuth();
  const { colors } = useTheme();
  const { data: settingsResponse } = useSettings();

  // Only fetch profile if user is logged in
  const {
    data: userResponse,
    isLoading,
    error,
    refetch,
  } = useProfile({ enabled: !!userToken });

  // --- GUEST VIEW ---
  if (!userToken) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <SafeAreaView style={styles.safeArea}>
          <ScrollView contentContainerStyle={styles.scrollContent}>
            <GuestProfile />
          </ScrollView>
        </SafeAreaView>
      </View>
    );
  }

  // --- LOADING STATE ---
  if (isLoading) {
    return <ProfileSkeleton />;
  }

  // --- ERROR STATE ---
  if (error || !userResponse?.success) {
    return (
      <SafeAreaView
        style={[styles.container, { backgroundColor: colors.background }]}
      >
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle-outline" size={48} color="#FF6B6B" />
          <Text style={[styles.errorText, { color: colors.muted }]}>
            Failed to load profile
          </Text>
          <TouchableOpacity
            onPress={() => refetch()}
            style={[styles.retryButton, { backgroundColor: colors.primary }]}
          >
            <Text style={[styles.retryText, { color: colors.secondary }]}>
              Retry
            </Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={signOut} style={styles.logoutLink}>
            <Text style={[styles.logoutLinkText, { color: "#FF6B6B" }]}>
              Sign Out
            </Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const user = userResponse.data;

  // --- LOGGED IN VIEW ---
  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <SafeAreaView style={styles.safeArea}>
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <LoggedInProfile
            user={user}
            onSignOut={signOut}
            loyaltyEnabled={settingsResponse?.data?.loyaltyEnabled ?? true}
          />
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F4F6F8",
    paddingBottom: 24,
  },
  safeArea: {
    flex: 1,
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  errorText: {
    marginTop: 10,
    fontSize: 16,
    color: "#666",
  },
  retryButton: {
    marginTop: 20,
    backgroundColor: "#1A1A1A",
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 20,
  },
  retryText: {
    color: "#FFF",
    fontWeight: "600",
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingBottom: 40,
  },
  logoutLink: {
    marginTop: 20,
  },
  logoutLinkText: {
    color: "#FF6B6B",
    fontSize: 16,
    fontWeight: "600",
  },
});
