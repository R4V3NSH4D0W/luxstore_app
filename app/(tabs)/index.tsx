import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React from "react";
import {
  ActivityIndicator,
  Dimensions,
  FlatList,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import Animated, { FadeInDown } from "react-native-reanimated";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  useCategoryShowcase,
  useFeaturedCollections,
  useProducts,
} from "../api/shop";
import { CategoryItem } from "../components/home/CategoryItem";
import { ProductCard } from "../components/home/ProductCard";
import { useTheme } from "../context/theme-context";
import { getImageUrl } from "../lib/api-client";

const { width } = Dimensions.get("window");
const COLUMN_WIDTH = (width - 48 - 12) / 2;

export default function HomeScreen() {
  const router = useRouter();
  const { colors } = useTheme();

  // Fetch Data
  const { data: featuredResponse, isLoading: loadingCollections } =
    useFeaturedCollections();
  const { data: categoriesResponse } = useCategoryShowcase();
  const { data: newArrivalsResponse, isLoading: loadingProducts } = useProducts(
    { limit: 6, featured: true }
  );

  const collections = featuredResponse || [];
  const categories = categoriesResponse || [];
  const products = newArrivalsResponse?.products || [];

  const heroCollection = collections.length > 0 ? collections[0] : null;

  const isLoading = loadingCollections || loadingProducts;

  if (isLoading) {
    return (
      <View
        style={[
          styles.loadingContainer,
          { backgroundColor: colors.background },
        ]}
      >
        <ActivityIndicator size="large" color={colors.text} />
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* HERO SECTION */}
        {heroCollection ? (
          <View style={styles.heroContainer}>
            <Image
              source={{ uri: getImageUrl(heroCollection.image) }}
              style={styles.heroImage}
            />
            <View style={styles.heroOverlay} />
            <SafeAreaView style={styles.heroContent}>
              <View style={styles.headerRow}>
                <Text style={styles.logoText}>LUXSTORE</Text>
                <TouchableOpacity style={styles.iconButtonBlur}>
                  <Ionicons name="search-outline" size={20} color="#FFF" />
                </TouchableOpacity>
              </View>

              <View style={styles.heroTextContainer}>
                <Animated.Text
                  entering={FadeInDown.delay(200).duration(800)}
                  style={styles.heroSubtitle}
                >
                  NEW COLLECTION
                </Animated.Text>
                <Animated.Text
                  entering={FadeInDown.delay(400).duration(800)}
                  style={styles.heroTitle}
                >
                  {heroCollection.name}
                </Animated.Text>
                <Animated.View entering={FadeInDown.delay(600).duration(800)}>
                  <TouchableOpacity style={styles.heroButton}>
                    <Text style={styles.heroButtonText}>Shop Now</Text>
                  </TouchableOpacity>
                </Animated.View>
              </View>
            </SafeAreaView>
          </View>
        ) : (
          // Fallback header if no hero
          <SafeAreaView style={styles.safeHeader}>
            <View style={styles.headerRow}>
              <Text style={[styles.logoText, { color: "#000" }]}>LUXSTORE</Text>
              <TouchableOpacity
                style={[styles.iconButtonBlur, { backgroundColor: "#F0F0F0" }]}
              >
                <Ionicons name="search-outline" size={20} color="#000" />
              </TouchableOpacity>
            </View>
          </SafeAreaView>
        )}

        {/* CATEGORIES */}
        <View style={styles.section}>
          <FlatList
            data={categories}
            horizontal
            showsHorizontalScrollIndicator={false}
            renderItem={({ item, index }) => (
              <CategoryItem item={item} index={index} />
            )}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.categoriesList}
          />
        </View>

        {/* NEW ARRIVALS */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>
              New Arrivals
            </Text>
            <TouchableOpacity>
              <Text style={[styles.seeAll, { color: colors.muted }]}>
                See All
              </Text>
            </TouchableOpacity>
          </View>

          <View style={styles.grid}>
            {products.map((item, index) => (
              <View
                key={item.id}
                style={{ width: COLUMN_WIDTH, marginBottom: 30 }}
              >
                <ProductCard item={item} index={index} />
              </View>
            ))}
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
  },
  scrollContent: {
    paddingBottom: 40,
  },

  // Hero
  heroContainer: {
    width: width,
    height: 500,
    backgroundColor: "#000",
    marginBottom: 40,
  },
  heroImage: {
    ...StyleSheet.absoluteFillObject,
    width: undefined,
    height: undefined,
    resizeMode: "cover",
  },
  heroOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.3)",
  },
  heroContent: {
    flex: 1,
    justifyContent: "space-between",
    paddingHorizontal: 24,
    paddingBottom: 40,
  },
  safeHeader: {
    paddingHorizontal: 24,
    marginBottom: 20,
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 10,
  },
  logoText: {
    fontSize: 20,
    fontWeight: "800",
    color: "#FFF",
    letterSpacing: 2,
  },
  iconButtonBlur: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255,255,255,0.2)",
    justifyContent: "center",
    alignItems: "center",
  },
  heroTextContainer: {
    width: "100%",
  },
  heroSubtitle: {
    color: "#FFF",
    fontSize: 14,
    fontWeight: "600",
    letterSpacing: 1,
    marginBottom: 12,
    opacity: 0.9,
  },
  heroTitle: {
    color: "#FFF",
    fontSize: 42,
    fontWeight: "800",
    lineHeight: 48,
    marginBottom: 24,
  },
  heroButton: {
    backgroundColor: "#FFF",
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 30,
    alignSelf: "flex-start",
  },
  heroButtonText: {
    color: "#000",
    fontSize: 16,
    fontWeight: "700",
  },

  // Categories
  section: {
    marginBottom: 40,
  },
  categoriesList: {
    paddingHorizontal: 24,
    gap: 20,
  },

  // New Arrivals
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 24,
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: "700",
    color: "#1A1A1A",
  },
  seeAll: {
    fontSize: 14,
    fontWeight: "600",
    color: "#666",
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    paddingHorizontal: 24,
    justifyContent: "space-between",
  },
});
