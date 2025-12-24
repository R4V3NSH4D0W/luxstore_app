import { useCurrency } from "@/app/context/currency-context";
import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { CartItem as CartItemType } from "../../api/cart";
import { useCart } from "../../context/cart-context";
import { useTheme } from "../../context/theme-context";
import { getImageUrl } from "../../lib/api-client";

interface CartItemProps {
  item: CartItemType;
}

export const CartItem = ({ item }: CartItemProps) => {
  const { colors } = useTheme();
  const { updateQuantity, removeFromCart } = useCart();
  const { formatPrice } = useCurrency();

  const product = item.product;
  const variant = item.variant;

  // Parse images which might be JSON strings
  let imageUrl = null;
  if (product?.images) {
    imageUrl =
      typeof product.images === "string"
        ? JSON.parse(product.images)[0]
        : product.images[0];
  }

  return (
    <View style={[styles.container, { borderBottomColor: colors.border }]}>
      <View
        style={[styles.imageContainer, { backgroundColor: colors.surface }]}
      >
        {imageUrl && (
          <Image
            source={{ uri: getImageUrl(imageUrl) }}
            style={styles.image}
            contentFit="cover"
            transition={200}
          />
        )}
      </View>

      <View style={styles.detailsContainer}>
        <View style={styles.topRow}>
          <View style={{ flex: 1 }}>
            <Text
              style={[styles.brandText, { color: colors.muted }]}
              numberOfLines={1}
            >
              {product?.brand || "LuxStore"}
            </Text>
            <Text
              style={[styles.productName, { color: colors.text }]}
              numberOfLines={1}
            >
              {product?.name}
            </Text>
            {variant && (
              <Text style={[styles.variantText, { color: colors.muted }]}>
                {variant.name}
              </Text>
            )}
          </View>
          <TouchableOpacity
            onPress={() => removeFromCart(item.id)}
            style={styles.removeButton}
          >
            <Ionicons name="close-outline" size={20} color={colors.muted} />
          </TouchableOpacity>
        </View>

        <View style={styles.bottomRow}>
          <Text style={[styles.priceText, { color: colors.text }]}>
            {formatPrice(item.price)}
          </Text>

          <View
            style={[styles.quantityControl, { borderColor: colors.border }]}
          >
            <TouchableOpacity
              onPress={() => updateQuantity(item.id, item.quantity - 1)}
              style={styles.qtyButton}
            >
              <Ionicons name="remove" size={16} color={colors.text} />
            </TouchableOpacity>
            <Text style={[styles.qtyText, { color: colors.text }]}>
              {item.quantity}
            </Text>
            <TouchableOpacity
              onPress={() => updateQuantity(item.id, item.quantity + 1)}
              style={styles.qtyButton}
            >
              <Ionicons name="add" size={16} color={colors.text} />
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    paddingVertical: 16,
    borderBottomWidth: 1,
  },
  imageContainer: {
    width: 100,
    height: 120,
    borderRadius: 8,
    overflow: "hidden",
    marginRight: 16,
  },
  image: {
    width: "100%",
    height: "100%",
  },
  detailsContainer: {
    flex: 1,
    justifyContent: "space-between",
  },
  topRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  brandText: {
    fontSize: 10,
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: 1,
    marginBottom: 4,
  },
  productName: {
    fontSize: 16,
    fontWeight: "700",
    marginBottom: 4,
    marginRight: 8,
  },
  variantText: {
    fontSize: 12,
  },
  removeButton: {
    padding: 4,
  },
  bottomRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  priceText: {
    fontSize: 16,
    fontWeight: "600",
  },
  quantityControl: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderRadius: 20,
    height: 32,
  },
  qtyButton: {
    width: 32,
    height: 32,
    justifyContent: "center",
    alignItems: "center",
  },
  qtyText: {
    fontSize: 14,
    fontWeight: "600",
    marginHorizontal: 4,
  },
});
