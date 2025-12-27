import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useTheme } from "../context/theme-context";

export default function OrderSuccessScreen() {
  const router = useRouter();
  const { orderId } = useLocalSearchParams();
  const { colors, isDark } = useTheme();

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: colors.background }]}
    >
      <View style={styles.content}>
        <View
          style={[styles.iconContainer, { backgroundColor: colors.surface }]}
        >
          <Ionicons name="checkmark" size={64} color={colors.primary} />
        </View>

        <Text style={[styles.title, { color: colors.text }]}>
          Order Placed!
        </Text>
        <Text style={[styles.subtitle, { color: colors.muted }]}>
          Your order has been successfully placed and is being processed.
        </Text>

        {orderId && (
          <View style={[styles.orderInfo, { backgroundColor: colors.surface }]}>
            <Text style={{ color: colors.muted, fontSize: 13 }}>Order ID</Text>
            <Text
              style={{
                color: colors.text,
                fontSize: 16,
                fontWeight: "600",
                marginTop: 4,
              }}
            >
              #{orderId}
            </Text>
          </View>
        )}

        <View style={styles.actions}>
          <TouchableOpacity
            style={[styles.primaryButton, { backgroundColor: colors.primary }]}
            onPress={() => router.replace("/(tabs)")}
          >
            <Text
              style={{
                color: isDark ? "#000" : "#FFF",
                fontWeight: "700",
                letterSpacing: 1,
              }}
            >
              CONTINUE SHOPPING
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.secondaryButton, { borderColor: colors.border }]}
            onPress={() => {
              // Stack handling: replace to home, then push orders
              // Or just navigate to orders if stack allows.
              // Safest to go home then orders or replace with order details.
              if (orderId) {
                router.replace(`/(screens)/orders/${orderId}`);
              } else {
                router.replace("/(screens)/orders");
              }
            }}
          >
            <Text style={{ color: colors.text, fontWeight: "600" }}>
              View Order Details
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    padding: 32,
    alignItems: "center",
    justifyContent: "center",
  },
  iconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 32,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5,
  },
  title: {
    fontSize: 28,
    fontWeight: "800",
    marginBottom: 16,
    letterSpacing: 1,
    textAlign: "center",
  },
  subtitle: {
    fontSize: 16,
    textAlign: "center",
    marginBottom: 40,
    lineHeight: 24,
  },
  orderInfo: {
    padding: 16,
    borderRadius: 12,
    alignItems: "center",
    minWidth: 200,
    marginBottom: 40,
  },
  actions: {
    width: "100%",
    gap: 16,
  },
  primaryButton: {
    height: 56,
    borderRadius: 28,
    justifyContent: "center",
    alignItems: "center",
    width: "100%",
  },
  secondaryButton: {
    height: 56,
    borderRadius: 28,
    justifyContent: "center",
    alignItems: "center",
    width: "100%",
    borderWidth: 1,
  },
});
