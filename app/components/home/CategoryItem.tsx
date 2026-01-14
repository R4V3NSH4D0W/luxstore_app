import { useTheme } from "@/app/context/theme-context";
import { Category } from "@/types/api-types";
import { useRouter } from "expo-router";

import React from "react";
import { Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import Animated, { FadeInDown } from "react-native-reanimated";

interface CategoryItemProps {
  item: Category;
  index: number;
}

export const CategoryItem = ({ item, index }: CategoryItemProps) => {
  const { colors } = useTheme();
  const router = useRouter();
  return (
    <Animated.View entering={FadeInDown.delay(index * 100).duration(600)}>
      <TouchableOpacity
        style={styles.categoryItem}
        onPress={() => router.push(`/category/${item.id}`)}
      >
        <View style={styles.categoryCircle}>
          {item.image ? (
            <Image source={{ uri: item.image }} style={styles.categoryImage} />
          ) : (
            <Text style={styles.categoryInitial}>{item.name.charAt(0)}</Text>
          )}
        </View>
        <Text
          style={[styles.categoryText, { color: colors.text }]}
          numberOfLines={1}
        >
          {item.name}
        </Text>
      </TouchableOpacity>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  categoryItem: {
    alignItems: "center",
    gap: 8,
    width: 80,
  },
  categoryCircle: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: "#F5F5F5",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#EFEFEF",
    overflow: "hidden", // Important for image
  },
  categoryImage: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
  },
  categoryInitial: {
    fontSize: 24,
    fontWeight: "300",
    color: "#1A1A1A",
  },
  categoryText: {
    fontSize: 12,
    fontWeight: "500",
    color: "#333",
    textAlign: "center",
  },
});
