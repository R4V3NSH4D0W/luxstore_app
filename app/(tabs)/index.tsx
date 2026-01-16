import { useRouter } from "expo-router";
import React, { useMemo } from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  useCollections,
  useFeaturedCategories,
  useFeaturedCollections,
  useProducts,
} from "../api/shop";
import { CampaignCarousel } from "../components/CampaignCarousel";
import { BenefitsSection } from "../components/home/BenefitsSection";
import { BrandShowcase } from "../components/home/BrandShowcase";
import { CategoryItem } from "../components/home/CategoryItem";
import { CollectionShowcase } from "../components/home/CollectionShowcase";
import { EditorialSection } from "../components/home/EditorialSection";
import { FeaturedProducts } from "../components/home/FeaturedProducts";
import { HomeHeroCarousel } from "../components/home/HomeHeroCarousel";
import { HomeSkeleton } from "../components/home/HomeSkeleton";
import { NewsletterSection } from "../components/home/NewsletterSection";
import { PromoCarousel } from "../components/home/PromoCarousel";
import { RecentlyViewedSection } from "../components/home/RecentlyViewedSection";
import { RecommendedSection } from "../components/home/RecommendedSection";
import { Logo } from "../components/ui/Logo";
import { useTheme } from "../context/theme-context";


export default function HomeScreen() {
  const router = useRouter();
  const { colors } = useTheme();

  // Fetch Data
  const { data: featuredResponse, isLoading: loadingCollections } =
    useFeaturedCollections();
  const { data: categoriesResponse } = useFeaturedCategories();
  const { data: newArrivalsResponse, isLoading: loadingProducts } = useProducts(
    { limit: 4, featured: true }
  );

  // Custom "Luxury Choice" section
  const { data: luxuryChoiceResponse } = useProducts({
    tags: "silk",
    limit: 4,
  });

  const { data: allCollectionsResponse } = useCollections(1, 100);

  const collections = useMemo(() => featuredResponse || [], [featuredResponse]);
  const categories = categoriesResponse || [];
  const products = newArrivalsResponse?.products || [];
  const luxuryProducts = luxuryChoiceResponse?.products || [];

  // Filter out featured collections from the main list
  const otherCollections = useMemo(() => {
    if (!allCollectionsResponse?.collections) return [];
    const featuredIds = new Set(collections.map((c: any) => c.id));
    return allCollectionsResponse.collections.filter(
      (c: any) => !featuredIds.has(c.id)
    );
  }, [allCollectionsResponse, collections]);

  const isLoading = loadingCollections || loadingProducts;

  if (isLoading) {
    return <HomeSkeleton />;
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Absolute Header (Overlaying Carousel) */}
      <View style={styles.absoluteHeader}>
        <SafeAreaView edges={["top"]}>
          <View style={styles.headerRow}>
            <Logo />
          </View>
        </SafeAreaView>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* HERO CAROUSEL */}
        <HomeHeroCarousel collections={collections} />

        {/* PROMO CAROUSEL */}
        <PromoCarousel />

        {/* CATEGORIES SECTION */}
        <View>
          <View
            style={[
              styles.sectionHeader,
              { paddingHorizontal: 24, paddingTop: 24 },
            ]}
          >
            <Text style={[styles.sectionTitle, { color: colors.text }]}>
              CATEGORIES
            </Text>
            <TouchableOpacity
              onPress={() => router.push("/(screens)/category/all")}
            >
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

        {/* COLLECTIONS SECTION */}
        <CollectionShowcase
          collections={otherCollections}
          onPressCollection={(id) => router.push(`/collection/${id}`)}
          onViewAll={() => router.push("/(screens)/collection/all")}
        />

        {/* BRANDS SHOWCASE */}
        <BrandShowcase />

        {/* ACTIVE CAMPAIGNS */}
        <CampaignCarousel />

        {/* FEATURED PRODUCTS */}
        <FeaturedProducts
          products={products}
          onPressProduct={(id) => router.push(`/product/${id}`)}
          onDiscover={() =>
            router.push({
              pathname: "/(tabs)/products",
              params: { featured: "true" },
            })
          }
        />

        {/* RECOMMENDED FOR YOU */}
        <RecommendedSection />

        {/* RECENTLY VIEWED */}
        <RecentlyViewedSection />

        {/* EDITORIAL SECTION */}
        <EditorialSection
          title="The Silk Edit"
          description="Experience the unmatched luxury of pure silk, curated for the modern connoisseur."
          products={luxuryProducts}
          onPressProduct={(id) => router.push(`/product/${id}`)}
        />

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
    marginTop: 10,
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
  editorialDesc: {
    fontSize: 13,
    lineHeight: 18,
    maxWidth: "80%",
    marginTop: 8,
  },
});
