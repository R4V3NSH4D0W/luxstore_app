import { useMoveToCart } from "@/app/api/cart";
import { useToggleWishlist, useWishlist } from "@/app/api/wishlist";
import { useAuth } from "@/app/context/auth-context";
import { useTheme } from "@/app/context/theme-context";
import { useToast } from "@/app/context/toast-context";
import { Product } from "@/types/api-types";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React from "react";
import { Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import Animated, { FadeInDown } from "react-native-reanimated";

// ... imports

interface ProductCardProps {
  item: Product;
  index: number;
  showMoveToCart?: boolean;
}

export const ProductCard = ({
  item,
  index,
  showMoveToCart = false,
}: ProductCardProps) => {
  const router = useRouter();
  const { colors } = useTheme();
  const { userToken } = useAuth();
  const { showToast } = useToast();

  const { data: wishlist } = useWishlist();
  const { mutate: toggleWishlist } = useToggleWishlist();
  const { mutate: moveToCart, isPending: isMoving } = useMoveToCart();

  const isWishlisted = wishlist?.some((w) => w.productId === item.id);

  const isOutOfStock = !item.isAvailable;

  const handleHeartPress = (e: any) => {
    e.stopPropagation(); // Prevent navigating to product detail

    if (!userToken) {
      showToast("Please sign in to modify wishlist", "info");
      return;
    }

    // TODO: Add haptic feedback here if desired
    toggleWishlist(item.id);
  };

  const handleMoveToCart = (e: any) => {
    e.stopPropagation();

    // If product has variants, redirect to detail page to choose one
    if (item.variants && item.variants.length > 0) {
      showToast("Please select options", "info");
      router.push({
        pathname: `/product/${item.id}`,
        params: { action: "move_from_wishlist" },
      } as any);
      return;
    }

    moveToCart(
      { productId: item.id, quantity: 1 },
      {
        onSuccess: () => {
          showToast("Moved to bag", "success");
        },
        onError: (error: any) => {
          const message = error.message || "Failed to move to bag";
          showToast(message, "error");
        },
      }
    );
  };

  return (
    <Animated.View entering={FadeInDown.delay(index * 100 + 400).duration(600)}>
      <TouchableOpacity
        style={styles.productCard}
        onPress={() => router.push(`/product/${item.id}`)}
      >
        <View style={styles.productImageContainer}>
          <Image
            source={{
              uri:
                item.coverImage ||
                item.images?.[0] ||
                "https://via.placeholder.com/400",
            }}
            style={styles.productImage}
          />
          <TouchableOpacity
            style={styles.heartButton}
            onPress={handleHeartPress}
          >
            <Ionicons
              name={isWishlisted ? "heart" : "heart-outline"}
              size={20}
              color={isWishlisted ? "#FF6B6B" : "#1A1A1A"}
            />
          </TouchableOpacity>
        </View>
        <View style={styles.productInfo}>
          <Text style={styles.productBrand} numberOfLines={1}>
            {item.brand?.name || "LuxStore"}
          </Text>
          <Text
            style={[styles.productName, { color: colors.text }]}
            numberOfLines={1}
          >
            {item.name}
          </Text>
          {item.hasSale && item.formattedSalePrice ? (
            <View
              style={{ flexDirection: "row", alignItems: "center", gap: 6 }}
            >
              <Text style={[styles.productPrice, { color: "#FF6B6B" }]}>
                {item.formattedSalePrice}
              </Text>
              <Text
                style={[
                  styles.productPrice,
                  {
                    color: colors.muted,
                    textDecorationLine: "line-through",
                    fontSize: 12,
                    fontWeight: "400",
                  },
                ]}
              >
                {item.formattedPrice}
              </Text>
            </View>
          ) : (
            <Text style={[styles.productPrice, { color: colors.text }]}>
              {item.formattedPrice}
            </Text>
          )}

          {showMoveToCart && (
            <TouchableOpacity
              style={[
                styles.moveToCartButton,
                {
                  backgroundColor: isOutOfStock
                    ? colors.border
                    : colors.primary,
                },
              ]}
              onPress={handleMoveToCart}
              disabled={isOutOfStock || isMoving}
            >
              <Text
                style={[
                  styles.moveToCartText,
                  {
                    color: isOutOfStock
                      ? colors.muted
                      : colors.background === "#000000"
                      ? "#000000"
                      : "#FFFFFF",
                  },
                ]}
              >
                {isMoving
                  ? "MOVING..."
                  : isOutOfStock
                  ? "OUT OF STOCK"
                  : "MOVE TO BAG"}
              </Text>
            </TouchableOpacity>
          )}
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  productCard: {
    marginBottom: 4,
    width: "100%",
  },
  productImageContainer: {
    aspectRatio: 0.75, // 3:4 aspect ratio
    width: "100%",
    borderRadius: 8,
    backgroundColor: "#F0F0F0",
    marginBottom: 12,
    overflow: "hidden",
    position: "relative",
  },
  productImage: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
  },
  heartButton: {
    position: "absolute",
    top: 10,
    right: 10,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "rgba(255,255,255,0.9)",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  productInfo: {
    paddingHorizontal: 4,
  },
  productBrand: {
    fontSize: 11,
    color: "#888",
    fontWeight: "600",
    marginBottom: 4,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  productName: {
    fontSize: 14,
    fontWeight: "500",
    color: "#1A1A1A",
    marginBottom: 4,
  },
  productPrice: {
    fontSize: 14,
    fontWeight: "700",
    color: "#1A1A1A",
  },
  moveToCartButton: {
    marginTop: 8,
    paddingVertical: 8,
    borderRadius: 4,
    alignItems: "center",
    justifyContent: "center",
  },
  moveToCartText: {
    fontSize: 10,
    fontWeight: "700",
    letterSpacing: 0.5,
  },
});
