import { useTheme } from "@/app/context/theme-context";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

import { useCart } from "@/app/context/cart-context";
import { ActivityIndicator } from "react-native";

interface ProductBottomBarProps {
  productId?: string;
  variantId?: string;
  stock?: number;
  onSuccess?: () => void;
}

export const ProductBottomBar = ({
  productId,
  variantId,
  stock = 0,
  onSuccess,
}: ProductBottomBarProps) => {
  const { colors, isDark } = useTheme();
  const { addToCart, isAddingToCart } = useCart();

  const isOutOfStock = stock <= 0;

  const handleAddToCart = () => {
    if (!productId || isOutOfStock) return;

    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(
      () => {}
    );
    addToCart(
      { productId, variantId, quantity: 1 },
      {
        onSuccess: () => {
          if (onSuccess) onSuccess();
        },
      }
    );
  };

  return (
    <View style={styles.bottomBar}>
      <TouchableOpacity
        style={[
          styles.primaryButton,
          {
            backgroundColor: isOutOfStock ? colors.muted : colors.primary,
            opacity: isOutOfStock ? 0.7 : 1,
          },
        ]}
        onPress={handleAddToCart}
        activeOpacity={0.8}
        disabled={isAddingToCart || isOutOfStock}
      >
        {isAddingToCart ? (
          <ActivityIndicator color={isDark ? colors.background : "#FFF"} />
        ) : (
          <>
            <Ionicons
              name={isOutOfStock ? "ban-outline" : "cart-outline"}
              size={20}
              color={isDark ? colors.background : "#FFF"}
              style={{ marginRight: 8 }}
            />
            <Text
              style={[
                styles.buttonText,
                { color: isDark ? colors.background : "#FFF" },
              ]}
            >
              {isOutOfStock ? "Out of Stock" : "Add to Bag"}
            </Text>
          </>
        )}
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  bottomBar: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: 100,
    paddingHorizontal: 24,
    paddingTop: 16,
    flexDirection: "row",
    justifyContent: "center",
  },
  primaryButton: {
    width: "100%",
    height: 56,
    borderRadius: 28,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 8,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: "800",
    letterSpacing: 1,
  },
});
