import { useTheme } from "@/app/context/theme-context";
import { getImageUrl } from "@/app/lib/api-client";
import { Product } from "@/app/types/api-types";
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import Animated, { FadeInDown } from "react-native-reanimated";

interface ProductCardProps {
  item: Product;
  index: number;
}

export const ProductCard = ({ item, index }: ProductCardProps) => {
  const { colors } = useTheme();
  return (
    <Animated.View entering={FadeInDown.delay(index * 100 + 400).duration(600)}>
      <TouchableOpacity style={styles.productCard}>
        <View style={styles.productImageContainer}>
          <Image
            source={{ uri: getImageUrl(item.images[0]) }}
            style={styles.productImage}
          />
          <TouchableOpacity style={styles.heartButton}>
            <Ionicons name="heart-outline" size={20} color="#1A1A1A" />
          </TouchableOpacity>
        </View>
        <View style={styles.productInfo}>
          <Text style={styles.productBrand} numberOfLines={1}>
            {item.brand || "LuxStore"}
          </Text>
          <Text
            style={[styles.productName, { color: colors.text }]}
            numberOfLines={1}
          >
            {item.name}
          </Text>
          <Text style={[styles.productPrice, { color: colors.text }]}>
            ${item.price.toFixed(2)}
          </Text>
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
});
