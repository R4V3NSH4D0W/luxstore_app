import { useToggleWishlist, useWishlist } from "@/app/api/wishlist";
import { useAuth } from "@/app/context/auth-context";
import { useCurrency } from "@/app/context/currency-context";
import { useTheme } from "@/app/context/theme-context";
import { useToast } from "@/app/context/toast-context";
import { getImageUrl } from "@/app/lib/api-client";
import { Product } from "@/app/types/api-types";
import { Ionicons } from "@expo/vector-icons";
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
import Animated, { FadeInRight } from "react-native-reanimated";

const { width } = Dimensions.get("window");
const CARD_WIDTH = width * 0.7; // Slightly narrower for more surrounding whitespace
const CARD_ASPECT_RATIO = 0.75; // Classic 3:4 portrait ratio

interface FeaturedProductsProps {
  products: Product[];
  onPressProduct: (id: string) => void;
  onDiscover: () => void;
}

export const FeaturedProducts = ({
  products,
  onPressProduct,
  onDiscover,
}: FeaturedProductsProps) => {
  const { colors, isDark } = useTheme();
  const { data: wishlist } = useWishlist();
  const { mutate: toggleWishlist } = useToggleWishlist();
  const { userToken } = useAuth();
  const { showToast } = useToast();
  const { formatPrice } = useCurrency();

  if (!products || products.length === 0) return null;

  return (
    <View style={styles.container}>
      <View style={styles.sectionHeader}>
        <View>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            FEATURED
          </Text>
          <Text style={[styles.sectionSubtitle, { color: colors.muted }]}>
            Curated pieces for your wardrobe
          </Text>
        </View>
        <TouchableOpacity onPress={onDiscover} style={styles.discoverButton}>
          <Text style={[styles.viewAll, { color: colors.text }]}>DISCOVER</Text>
          <Ionicons name="arrow-forward" size={12} color={colors.text} />
        </TouchableOpacity>
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        snapToInterval={CARD_WIDTH + 20}
        decelerationRate="fast"
      >
        {products.map((item, index) => {
          const isWishlisted = wishlist?.some((w) => w.productId === item.id);

          return (
            <Animated.View
              key={item.id}
              entering={FadeInRight.delay(index * 100).duration(600)}
            >
              <TouchableOpacity
                activeOpacity={0.9}
                style={styles.productCard}
                onPress={() => onPressProduct(item.id)}
              >
                <View
                  style={[
                    styles.imageContainer,
                    { backgroundColor: isDark ? "#111" : "#F9F9F9" },
                  ]}
                >
                  <Image
                    source={{ uri: getImageUrl(item.images[0]) }}
                    style={styles.cardImage}
                  />
                  <View style={styles.badge}>
                    <Text style={styles.badgeText}>NEW</Text>
                  </View>
                  <TouchableOpacity
                    style={styles.heartButton}
                    onPress={(e) => {
                      e.stopPropagation();
                      if (!userToken) {
                        showToast("Please sign in to modify wishlist", "info");
                        return;
                      }
                      toggleWishlist(item.id);
                    }}
                  >
                    <Ionicons
                      name={isWishlisted ? "heart" : "heart-outline"}
                      size={16}
                      color={
                        isWishlisted ? "#FF6B6B" : isDark ? "#FFF" : "#1A1A1A"
                      }
                    />
                  </TouchableOpacity>
                </View>

                <View style={styles.infoContainer}>
                  <Text style={[styles.brandText, { color: colors.muted }]}>
                    {item.brand || "LUXSTORE"}
                  </Text>
                  <Text
                    style={[styles.nameText, { color: colors.text }]}
                    numberOfLines={1}
                  >
                    {item.name}
                  </Text>
                  <Text style={[styles.priceText, { color: colors.text }]}>
                    {formatPrice(item.price, item.currency)}
                  </Text>
                </View>
              </TouchableOpacity>
            </Animated.View>
          );
        })}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginTop: 48,
    paddingBottom: 20,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
    paddingHorizontal: 24,
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "900",
    letterSpacing: 2,
    lineHeight: 24,
  },
  sectionSubtitle: {
    fontSize: 12,
    fontWeight: "400",
    marginTop: 4,
    letterSpacing: 0.5,
  },
  discoverButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    borderBottomWidth: 1,
    paddingBottom: 2,
  },
  viewAll: {
    fontSize: 10,
    fontWeight: "700",
    letterSpacing: 1,
  },
  scrollContent: {
    paddingHorizontal: 24,
    gap: 20,
  },
  productCard: {
    width: CARD_WIDTH,
  },
  imageContainer: {
    width: "100%",
    aspectRatio: CARD_ASPECT_RATIO,
    borderRadius: 4,
    overflow: "hidden",
    marginBottom: 12,
    position: "relative",
  },
  cardImage: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
  },
  badge: {
    position: "absolute",
    top: 12,
    left: 12,
    backgroundColor: "#1A1A1A",
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 2,
  },
  badgeText: {
    color: "#FFF",
    fontSize: 8,
    fontWeight: "800",
    letterSpacing: 1,
  },
  heartButton: {
    position: "absolute",
    top: 12,
    right: 12,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "rgba(255,255,255,0.8)",
    justifyContent: "center",
    alignItems: "center",
  },
  infoContainer: {
    paddingHorizontal: 2,
  },
  brandText: {
    fontSize: 10,
    fontWeight: "700",
    letterSpacing: 1,
    textTransform: "uppercase",
    marginBottom: 4,
  },
  nameText: {
    fontSize: 14,
    fontWeight: "500",
    marginBottom: 6,
    letterSpacing: 0.3,
  },
  priceText: {
    fontSize: 14,
    fontWeight: "700",
    letterSpacing: 0.5,
  },
});
