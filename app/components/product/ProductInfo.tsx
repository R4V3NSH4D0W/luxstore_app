import { useSettings } from "@/app/api/shop";
import { useProfile } from "@/app/api/users";
import { useCurrency } from "@/app/context/currency-context";
import { useTheme } from "@/app/context/theme-context";
import { Product } from "@/types/api-types";
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { StyleSheet, Text, View } from "react-native";
import Animated, { FadeInDown } from "react-native-reanimated";

interface ProductInfoProps {
  data: Product;
}

export const ProductInfo = ({ data }: ProductInfoProps) => {
  const { colors } = useTheme();
  const { formatPrice, rates, currency } = useCurrency();
  const { data: settingsResponse } = useSettings();
  const { data: profileResponse } = useProfile();

  const settings = settingsResponse?.data;
  const user = profileResponse?.data;

  const pointsMultipliers = {
    BRONZE: 1,
    SILVER: 1.2,
    GOLD: 1.5,
    PLATINUM: 2,
  };

  const currentTier = user?.membershipTier || "BRONZE";
  const multiplier =
    pointsMultipliers[currentTier as keyof typeof pointsMultipliers] || 1;

  const currentPrice = data.displaySalePrice ?? data.displayPrice;
  const priceInBase = currentPrice / (rates[data.currency || "USD"] || 1);
  const potentialPoints = Math.floor(
    priceInBase * (settings?.pointsPerCurrency || 1) * multiplier
  );

  return (
    <Animated.View entering={FadeInDown.delay(200).duration(600)}>
      <View style={styles.titleSection}>
        <View style={{ flex: 1 }}>
          <Text style={[styles.brandText, { color: colors.muted }]}>
            {data.brand || settings?.storeName || "LuxStore"}
          </Text>
          <Text style={[styles.productName, { color: colors.text }]}>
            {data.name}
          </Text>
        </View>
        <Text style={[styles.priceText, { color: colors.primary }]}>
          {formatPrice(
            data.displaySalePrice ?? data.displayPrice,
            data.currency
          )}
        </Text>
      </View>

      {data.hasSale && data.displaySalePrice !== null && (
        <Text style={[styles.originalPrice, { color: colors.muted }]}>
          {formatPrice(data.displayPrice, data.currency)}
        </Text>
      )}

      <View
        style={[
          styles.stockBadge,
          {
            backgroundColor:
              data.stock > 0 ||
              (data.variants?.reduce((acc, v) => acc + v.stock, 0) || 0) > 0
                ? "rgba(16, 185, 129, 0.1)"
                : "rgba(239, 68, 68, 0.1)",
          },
        ]}
      >
        <View
          style={[
            styles.stockDot,
            {
              backgroundColor:
                data.stock > 0 ||
                (data.variants?.reduce((acc, v) => acc + v.stock, 0) || 0) > 0
                  ? "#10B981"
                  : "#EF4444",
            },
          ]}
        />
        <Text
          style={[
            styles.stockText,
            {
              color:
                data.stock > 0 ||
                (data.variants?.reduce((acc, v) => acc + v.stock, 0) || 0) > 0
                  ? "#10B981"
                  : "#EF4444",
            },
          ]}
        >
          {data.stock > 0 ||
          (data.variants?.reduce((acc, v) => acc + v.stock, 0) || 0) > 0
            ? data.hasMultipleVariants
              ? "Available"
              : `${data.stock} in stock`
            : "Out of stock"}
        </Text>
      </View>

      {settings?.loyaltyEnabled && user && potentialPoints > 0 && (
        <View style={styles.loyaltyBadge}>
          <Ionicons name="sparkles" size={14} color="#DAA520" />
          <Text style={[styles.loyaltyText, { color: colors.text }]}>
            Earn <Text style={{ fontWeight: "800" }}>{potentialPoints}</Text>{" "}
            points
            {multiplier > 1 && (
              <Text style={{ color: "#DAA520" }}>
                {" "}
                (+{Math.round((multiplier - 1) * 100)}% {currentTier} bonus)
              </Text>
            )}
          </Text>
        </View>
      )}
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  titleSection: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 8,
  },
  brandText: {
    fontSize: 12,
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: 2,
    marginBottom: 4,
  },
  productName: {
    fontSize: 28,
    fontWeight: "800",
    letterSpacing: -0.5,
  },
  priceText: {
    fontSize: 24,
    fontWeight: "700",
  },
  originalPrice: {
    fontSize: 16,
    textDecorationLine: "line-through",
    marginBottom: 16,
  },
  stockBadge: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    marginBottom: 32,
  },
  stockDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 8,
  },
  stockText: {
    fontSize: 12,
    fontWeight: "700",
    textTransform: "uppercase",
  },
  loyaltyBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginTop: -20,
    marginBottom: 32,
  },
  loyaltyText: {
    fontSize: 13,
    fontWeight: "600",
  },
});
