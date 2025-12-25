import { useCurrency } from "@/app/context/currency-context";
import { getImageUrl } from "@/app/lib/api-client";
import { LinearGradient } from "expo-linear-gradient";
import React from "react";
import {
  Dimensions,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useTheme } from "../../context/theme-context";
import { Product } from "../../types/api-types";

const { width } = Dimensions.get("window");
const PADDING = 24;
const CARD_WIDTH = width * 0.85; // Massive, immersive scale
const CARD_ASPECT_RATIO = 1.1; // Slightly taller for more impactful presence

interface EditorialSectionProps {
  title: string;
  description: string;
  products: Product[];
  onPressProduct: (id: string) => void;
}

export const EditorialSection = ({
  title,
  description,
  products,
  onPressProduct,
}: EditorialSectionProps) => {
  const { colors, isDark } = useTheme();
  const { formatPrice } = useCurrency();

  if (!products || products.length === 0) return null;

  return (
    <View
      style={[
        styles.editorialContainer,
        { backgroundColor: isDark ? "#080808" : "#F8F9FB" },
      ]}
    >
      <View style={styles.editorialHeader}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>
          {title.toUpperCase()}
        </Text>
        <Text style={[styles.editorialDesc, { color: colors.muted }]}>
          {description}
        </Text>
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        snapToInterval={CARD_WIDTH + 20}
        decelerationRate="fast"
      >
        {products.map((item) => (
          <TouchableOpacity
            key={item.id}
            activeOpacity={0.95}
            onPress={() => onPressProduct(item.id)}
            style={styles.cinematicCard}
          >
            <Image
              source={{ uri: getImageUrl(item.images[0]) }}
              style={styles.cardImage}
            />

            <LinearGradient
              colors={["transparent", "rgba(0,0,0,0.8)"]}
              style={styles.overlay}
            >
              <View style={styles.infoContainer}>
                <View>
                  <Text style={styles.brandTag}>
                    {item.brand || "LUXSTORE"}
                  </Text>
                  <Text style={styles.productName} numberOfLines={1}>
                    {item.name}
                  </Text>
                </View>
                <Text style={styles.priceTag}>
                  {formatPrice(item.price, item.currency)}
                </Text>
              </View>
            </LinearGradient>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  editorialContainer: {
    paddingVertical: 100,
    marginTop: 20,
  },
  editorialHeader: {
    paddingHorizontal: PADDING,
    marginBottom: 60,
    alignItems: "center",
  },
  sectionTitle: {
    fontSize: 32,
    fontWeight: "800",
    letterSpacing: 4,
    textAlign: "center",
    marginBottom: 16,
  },
  editorialDesc: {
    fontSize: 14,
    lineHeight: 22,
    color: "#666666",
    letterSpacing: 1.5,
    textTransform: "uppercase",
    textAlign: "center",
    maxWidth: "85%",
  },
  scrollContent: {
    paddingHorizontal: PADDING,
    gap: 20,
  },
  cinematicCard: {
    width: CARD_WIDTH,
    aspectRatio: CARD_ASPECT_RATIO,
    borderRadius: 4,
    overflow: "hidden",
    backgroundColor: "#111",
  },
  cardImage: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: "flex-end",
    padding: 24,
  },
  infoContainer: {
    flexDirection: "column",
    justifyContent: "space-between",
    // alignItems: "flex-end",
  },
  brandTag: {
    color: "rgba(255,255,255,0.7)",
    fontSize: 10,
    fontWeight: "700",
    letterSpacing: 2,
    textTransform: "uppercase",
    marginBottom: 4,
  },
  productName: {
    color: "#FFF",
    fontSize: 20,
    fontWeight: "900",
    letterSpacing: 0.5,
  },
  priceTag: {
    color: "#FFF",
    fontSize: 18,
    fontWeight: "400",
    letterSpacing: 1,
  },
});
