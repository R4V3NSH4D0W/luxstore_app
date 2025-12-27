import { Stack } from "expo-router";
import { ActivityIndicator, StyleSheet, Text, View } from "react-native";
import { useProfile } from "../api/users";
import LoyaltyBenefits from "../components/LoyaltyBenefits";
import { useTheme } from "../context/theme-context";

export default function LoyaltyBenefitsScreen() {
  const { colors } = useTheme();
  const { data: userResponse, isLoading } = useProfile();

  if (isLoading) {
    return (
      <View style={[styles.loading, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.primary} />
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
