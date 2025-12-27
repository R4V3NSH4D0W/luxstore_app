import { useCurrency } from "@/app/context/currency-context";
import { useTheme } from "@/app/context/theme-context";
import { Product } from "@/types/api-types";
import React from "react";
import { StyleSheet, Text, View } from "react-native";
import Animated, { FadeInDown } from "react-native-reanimated";

interface ProductInfoProps {
  data: Product;
}

export const ProductInfo = ({ data }: ProductInfoProps) => {
  const { colors } = useTheme();
  const { formatPrice } = useCurrency();

  return (
    <Animated.View entering={FadeInDown.delay(200).duration(600)}>
      <View style={styles.titleSection}>
        <View style={{ flex: 1 }}>
          <Text style={[styles.brandText, { color: colors.muted }]}>
            {data.brand || "LuxStore"}
          </Text>
          <Text style={[styles.productName, { color: colors.text }]}>
            {data.name}
          </Text>
        </View>
        <Text style={[styles.priceText, { color: colors.primary }]}>
          {formatPrice(
            data.salePrice && data.salePrice < data.price
              ? data.salePrice
              : data.price,
            data.currency
          )}
        </Text>
      </View>

      {data.salePrice && data.salePrice < data.price && (
        <Text style={[styles.originalPrice, { color: colors.muted }]}>
          {formatPrice(data.price, data.currency)}
        </Text>
      )}

      <View
        style={[
          styles.stockBadge,
          {
            backgroundColor:
              data.stock > 0
                ? "rgba(16, 185, 129, 0.1)"
                : "rgba(239, 68, 68, 0.1)",
          },
        ]}
      >
        <View
          style={[
            styles.stockDot,
            {
              backgroundColor: data.stock > 0 ? "#10B981" : "#EF4444",
            },
          ]}
        />
        <Text
          style={[
            styles.stockText,
            {
              color: data.stock > 0 ? "#10B981" : "#EF4444",
            },
          ]}
        >
          {data.stock > 0 ? `${data.stock} in stock` : "Out of stock"}
        </Text>
      </View>
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
});
