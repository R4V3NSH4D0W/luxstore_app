import { useRouter } from "expo-router";
import React from "react";
import { FlatList, StyleSheet, Text, View } from "react-native";
import Animated, { FadeInRight } from "react-native-reanimated";
import { useTheme } from "../../context/theme-context";
import { useRecentlyViewed } from "../../hooks/use-recently-viewed";
import { ProductCard } from "./ProductCard";

export const RecentlyViewedSection = () => {
  const { colors } = useTheme();
  const router = useRouter();
  const { products, isLoading } = useRecentlyViewed();

  if (isLoading || products.length === 0) return null;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: colors.text }]}>
          RECENTLY VIEWED
        </Text>
      </View>

      <FlatList
        data={products}
        keyExtractor={(item) => `recent-${item.id}`}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.listContent}
        renderItem={({ item, index }) => (
          <Animated.View
            entering={FadeInRight.delay(index * 100).duration(500)}
          >
            <ProductCard item={item} index={index} />
          </Animated.View>
        )}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingVertical: 24,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 24,
    marginBottom: 20,
  },
  title: {
    fontSize: 16,
    fontWeight: "800",
    letterSpacing: 2,
  },
  listContent: {
    paddingHorizontal: 24,
    gap: 16,
  },
});
