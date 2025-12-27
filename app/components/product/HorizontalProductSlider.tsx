import { useTheme } from "@/app/context/theme-context";
import { Product } from "@/types/api-types";
import React from "react";
import { Dimensions, ScrollView, StyleSheet, Text, View } from "react-native";
import { ProductCard } from "../home/ProductCard";

interface HorizontalProductSliderProps {
  title: string;
  products: Product[];
}

const { width } = Dimensions.get("window");
const CARD_WIDTH = width * 0.45; // Slightly less than half width for peeking

export const HorizontalProductSlider = ({
  title,
  products,
}: HorizontalProductSliderProps) => {
  const { colors } = useTheme();

  if (!products || products.length === 0) return null;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: colors.text }]}>{title}</Text>
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        snapToInterval={CARD_WIDTH + 16} // Width + gap
        decelerationRate="fast"
      >
        {products.map((item, index) => (
          <View key={item.id} style={{ width: CARD_WIDTH }}>
            <ProductCard item={item} index={index % 6} />
          </View>
        ))}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 32,
  },
  header: {
    paddingHorizontal: 24,
    marginBottom: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: "800",
    letterSpacing: 1.5,
    textTransform: "uppercase",
  },
  scrollContent: {
    paddingHorizontal: 24,
    gap: 16,
  },
});
