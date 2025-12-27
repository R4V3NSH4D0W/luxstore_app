import { Ionicons } from "@expo/vector-icons";
import { Stack } from "expo-router";
import { ActivityIndicator, StyleSheet, Text, View } from "react-native";
import { useSettings } from "../api/shop";
import { useProfile } from "../api/users";
import LoyaltyBenefits from "../components/LoyaltyBenefits";
import { useTheme } from "../context/theme-context";

export default function LoyaltyBenefitsScreen() {
  const { colors } = useTheme();
  const { data: userResponse, isLoading: loadingUser } = useProfile();
  const { data: settingsResponse, isLoading: loadingSettings } = useSettings();

  const isLoading = loadingUser || loadingSettings;
  const loyaltyEnabled = settingsResponse?.data?.loyaltyEnabled ?? true;

  if (isLoading) {
    return (
      <View style={[styles.loading, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  if (!loyaltyEnabled) {
    return (
      <View style={[styles.loading, { backgroundColor: colors.background }]}>
        <Ionicons name="lock-closed-outline" size={48} color={colors.muted} />
        <Text
          style={{
            color: colors.text,
            marginTop: 16,
            fontSize: 18,
            fontWeight: "600",
          }}
        >
          Loyalty Program Disabled
        </Text>
        <Text style={{ color: colors.muted, marginTop: 8 }}>
          Please check back later!
        </Text>
      </View>
    );
  }

  if (!userResponse?.success || !userResponse.data) {
    return (
      <View style={[styles.loading, { backgroundColor: colors.background }]}>
        <Text style={{ color: colors.text }}>
          Please log in to view benefits
        </Text>
      </View>
    );
  }

  const user = userResponse.data;

  return (
    <>
      <Stack.Screen
        options={{
          title: "Loyalty Benefits",
          headerStyle: { backgroundColor: colors.card },
          headerTintColor: colors.text,
        }}
      />
      <LoyaltyBenefits
        currentTier={user.membershipTier}
        points={user.loyaltyPoints}
      />
    </>
  );
}

const styles = StyleSheet.create({
  loading: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});
