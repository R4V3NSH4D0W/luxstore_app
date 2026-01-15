import { useSettings } from "@/app/api/shop";
import { useCurrency } from "@/app/context/currency-context";
import { useRouter } from "expo-router";
import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useCart } from "../../context/cart-context";
import { useTheme } from "../../context/theme-context";

export const OrderSummary = () => {
  const { colors, isDark } = useTheme();
  const { cart } = useCart();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { formatPrice } = useCurrency();
  const { data: settingsResponse } = useSettings();
  const settings = settingsResponse?.data;

  if (!cart) return null;

  const potentialPoints = cart.potentialPoints ?? 0;

  return (
    <View
      style={[
        styles.container,
        { backgroundColor: colors.surface, paddingBottom: insets.bottom + 90 },
      ]}
    >
      <View style={styles.row}>
        <Text style={[styles.label, { color: colors.muted }]}>Subtotal</Text>
        <Text style={[styles.value, { color: colors.text }]}>
          {cart.formattedSubtotal}
        </Text>
      </View>

      {cart.tierDiscount ? (
        <View style={styles.row}>
          <Text style={[styles.label, { color: "#4CAF50" }]}>
            Loyalty Discount ({((cart.tierDiscountRate || 0) * 100).toFixed(0)}
            %)
          </Text>
          <Text style={[styles.value, { color: "#4CAF50" }]}>
            -{cart.formattedTierDiscount || formatPrice(cart.tierDiscount)}
          </Text>
        </View>
      ) : null}

      {cart.discountAmount ? (
        <View style={styles.row}>
          <Text style={[styles.label, { color: colors.primary }]}>
            Coupon Discount {cart.discountCode ? `(${cart.discountCode})` : ""}
          </Text>
          <Text style={[styles.value, { color: colors.primary }]}>
            -{cart.formattedDiscountAmount || formatPrice(cart.discountAmount)}
          </Text>
        </View>
      ) : null}

      <View style={styles.row}>
        <Text style={[styles.label, { color: colors.muted }]}>
          Tax Estimate
        </Text>
        <Text style={[styles.value, { color: colors.text }]}>
          {cart.formattedTaxAmount}
        </Text>
      </View>
      <View style={[styles.divider, { backgroundColor: colors.border }]} />
      {settings?.loyaltyEnabled && potentialPoints > 0 && (
        <View style={styles.pointsRow}>
          <Text style={[styles.pointsLabel, { color: "#4CAF50" }]}>
            Points to be earned
          </Text>
          <Text style={[styles.pointsValue, { color: "#4CAF50" }]}>
            +{potentialPoints} pts
          </Text>
        </View>
      )}
      <View style={styles.row}>
        <Text style={[styles.totalLabel, { color: colors.text }]}>Total</Text>
        <Text style={[styles.totalValue, { color: colors.text }]}>
          {cart.formattedTotal}
        </Text>
      </View>

      <TouchableOpacity
        style={[styles.checkoutButton, { backgroundColor: colors.primary }]}
        activeOpacity={0.8}
        onPress={() => router.push("/(screens)/checkout")}
      >
        <Text
          style={[
            styles.checkoutText,
            { color: isDark ? colors.background : "#FFF" },
          ]}
        >
          PROCEED TO CHECKOUT
        </Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 24,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 8,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  label: {
    fontSize: 14,
  },
  value: {
    fontSize: 14,
    fontWeight: "600",
  },
  divider: {
    height: 1,
    marginVertical: 12,
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: "800",
  },
  totalValue: {
    fontSize: 18,
    fontWeight: "800",
  },
  checkoutButton: {
    height: 56,
    borderRadius: 28,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 24,
  },
  checkoutText: {
    fontSize: 14,
    fontWeight: "800",
    letterSpacing: 2,
  },
  pointsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 16,
    paddingHorizontal: 4,
  },
  pointsLabel: {
    fontSize: 13,
    fontWeight: "600",
  },
  pointsValue: {
    fontSize: 14,
    fontWeight: "800",
  },
});
