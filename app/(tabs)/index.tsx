import { useRouter } from "expo-router";
import React from "react";
import {
  ActivityIndicator,
  Dimensions,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  useCategoryShowcase,
  useFeaturedCollections,
  useProducts,
} from "../api/shop";
import { BenefitsSection } from "../components/home/BenefitsSection";
import { BrandShowcase } from "../components/home/BrandShowcase";
import { CategoryItem } from "../components/home/CategoryItem";
import { HomeHeroCarousel } from "../components/home/HomeHeroCarousel";
import { NewsletterSection } from "../components/home/NewsletterSection";
import { ProductCard } from "../components/home/ProductCard";
import { useTheme } from "../context/theme-context";

const { width } = Dimensions.get("window");
const COLUMN_WIDTH = (width - 48 - 12) / 2;

export default function HomeScreen() {
  const router = useRouter();
  const { colors, isDark } = useTheme();

  // Fetch Data
  const { data: featuredResponse, isLoading: loadingCollections } =
    useFeaturedCollections();
  const { data: categoriesResponse } = useCategoryShowcase();
  const { data: newArrivalsResponse, isLoading: loadingProducts } = useProducts(
    { limit: 4, featured: true }
  );

  // Custom "Luxury Choice" section
  const { data: luxuryChoiceResponse } = useProducts({
    tags: "silk",
    limit: 4,
  });

  const collections = featuredResponse || [];
  const categories = categoriesResponse || [];
  const products = newArrivalsResponse?.products || [];
  const luxuryProducts = luxuryChoiceResponse?.products || [];

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
      {/* Absolute Header (Overlaying Carousel) */}
      <View style={styles.absoluteHeader}>
        <SafeAreaView edges={["top"]}>
          <View style={styles.headerRow}>
            <Text style={styles.logoText}>LUXSTORE</Text>
          </View>
        </SafeAreaView>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* HERO CAROUSEL */}
        <HomeHeroCarousel collections={collections} />

        {/* CATEGORIES SECTION */}
        <View>
          <View
            style={[
              styles.sectionHeader,
              { paddingHorizontal: 24, paddingTop: 24 },
            ]}
          >
            <Text style={[styles.sectionTitle, { color: colors.text }]}>
              COLLECTIONS
            </Text>
            <TouchableOpacity onPress={() => router.push("/(tabs)/products")}>
              <Text style={[styles.viewAll, { color: colors.muted }]}>
                VIEW ALL
              </Text>
            </TouchableOpacity>
          </View>
          <View style={styles.categoriesGrid}>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.categoriesScrollContent}
            >
              {categories.map((item, index) => (
                <CategoryItem key={item.id} item={item} index={index} />
              ))}
            </ScrollView>
          </View>
        </View>

        {/* BRANDS SHOWCASE */}
        <BrandShowcase />

        {/* NEW ARRIVALS */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>
              NEW ARRIVALS
            </Text>
            <TouchableOpacity onPress={() => router.push("/(tabs)/products")}>
              <Text style={[styles.viewAll, { color: colors.muted }]}>
                DISCOVER
              </Text>
            </TouchableOpacity>
          </View>
          <View style={styles.productsGrid}>
            {products.map((item, index) => (
              <View key={item.id} style={{ width: COLUMN_WIDTH }}>
                <ProductCard item={item} index={index % 6} />
              </View>
            ))}
          </View>
        </View>

        {/* EDITORIAL SECTION */}
        <View
          style={[
            styles.editorialContainer,
            { backgroundColor: isDark ? "#0A0A0A" : "#F4F4F4" },
          ]}
        >
          <View style={styles.editorialHeader}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>
              THE SILK EDIT
            </Text>
            <Text style={[styles.editorialDesc, { color: colors.muted }]}>
              Experience the unmatched luxury of pure silk, curated for the
              modern connoisseur.
            </Text>
          </View>
          <View style={styles.productsGrid}>
            {luxuryProducts.map((item, index) => (
              <View key={item.id} style={{ width: COLUMN_WIDTH }}>
                <ProductCard item={item} index={index % 6} />
              </View>
            ))}
          </View>
        </View>

        {/* NEWSLETTER */}
        <NewsletterSection />

        {/* BENEFITS */}
        <BenefitsSection />

        <View style={{ height: 100 }} />
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
  },
  absoluteHeader: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    zIndex: 100,
    paddingHorizontal: 24,
  },
  scrollContent: {
    paddingBottom: 20,
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    height: 60,
  },
  logoText: {
    fontSize: 20,
    fontWeight: "900",
    letterSpacing: 4,
    color: "#FFF",
    textShadowColor: "rgba(0, 0, 0, 0.4)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 4,
  },
  section: {
    marginTop: 40,
    paddingHorizontal: 24,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "800",
    letterSpacing: 2,
  },
  viewAll: {
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 1,
  },
  categoriesGrid: {
    marginTop: 10,
  },
  categoriesScrollContent: {
    paddingHorizontal: 24,
    gap: 20,
  },
  productsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    gap: 12,
  },
  editorialContainer: {
    marginTop: 60,
    paddingVertical: 60,
    paddingHorizontal: 24,
  },
  editorialHeader: {
    marginBottom: 30,
  },
  editorialDesc: {
    fontSize: 13,
    lineHeight: 18,
    maxWidth: "80%",
    marginTop: 8,
  },
});
