import React from "react";
import { FlatList, StyleSheet, Text, View } from "react-native";
import Animated, { FadeInRight } from "react-native-reanimated";
import { useRecommendedForYou } from "../../api/recommendations";
import { useTheme } from "../../context/theme-context";
import { ProductCard } from "./ProductCard";

export const RecommendedSection = () => {
  const { colors } = useTheme();
  const { data: response, isLoading } = useRecommendedForYou(6);
  const products = response?.data || [];

  if (isLoading || products.length === 0) return null;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: colors.text }]}>
          RECOMMENDED FOR YOU
        </Text>
      </View>

      <FlatList
        data={products}
        keyExtractor={(item) => item.id}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.listContent}
        snapToInterval={220 + 16} // card width + gap
        decelerationRate="fast"
        renderItem={({ item, index }) => (
          <Animated.View
            entering={FadeInRight.delay(index * 100).duration(500)}
            style={styles.productCard}
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
    paddingVertical: 32,
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
  productCard: {
    width: 220,
  },
});
