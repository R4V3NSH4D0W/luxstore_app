import { useAlsoBought } from "@/app/api/recommendations";
import { useProduct, useProducts } from "@/app/api/shop";
import { useToggleWishlist, useWishlist } from "@/app/api/wishlist";
import { HorizontalProductSlider } from "@/app/components/product/HorizontalProductSlider";
import { LuxuryServiceBar } from "@/app/components/product/LuxuryServiceBar";
import { ProductBottomBar } from "@/app/components/product/ProductBottomBar";
import { ProductDetailSkeleton } from "@/app/components/product/ProductDetailSkeleton";
import { ProductDetailsSection } from "@/app/components/product/ProductDetailsSection";
import { ProductHeader } from "@/app/components/product/ProductHeader";
import { ProductHero } from "@/app/components/product/ProductHero";
import { ProductInfo } from "@/app/components/product/ProductInfo";
import { ProductReviews } from "@/app/components/product/ProductReviews";
import { useTheme } from "@/app/context/theme-context";
import { useRecentlyViewed } from "@/app/hooks/use-recently-viewed";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useState } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import Animated, {
  interpolate,
  useAnimatedScrollHandler,
  useAnimatedStyle,
  useSharedValue,
} from "react-native-reanimated";

const IMAGE_HEIGHT = 480;

import { Variant } from "@/types/api-types";
// ... imports

const ProductDetailPage = () => {
  const { product_detail_id } = useLocalSearchParams();
  const router = useRouter();
  const { colors, isDark } = useTheme();
  const scrollY = useSharedValue(0);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [selectedVariant, setSelectedVariant] = useState<Variant | null>(null);

  const { data, isLoading } = useProduct(product_detail_id as string);
  const { addProductToRecent } = useRecentlyViewed();
  const { data: wishlist } = useWishlist();
  const { mutate: toggleWishlist } = useToggleWishlist();
  const { action } = useLocalSearchParams();

  React.useEffect(() => {
    if (data?.id) {
      addProductToRecent(data.id);

      // Priority 1: Multi-Variant Products - Select first available variant
      if (
        data.hasMultipleVariants &&
        data.variants &&
        data.variants.length > 0 &&
        !selectedVariant
      ) {
        const firstAvailable =
          data.variants.find((v) => v.stock > 0) || data.variants[0];
        setSelectedVariant(firstAvailable);
      }
      // Priority 2: Simple/Legacy variants fallback (if not multiple variants flag but has variants)
      else if (
        data.variants &&
        data.variants.length > 0 &&
        !selectedVariant &&
        !data.hasMultipleVariants
      ) {
        setSelectedVariant({
          id: "base",
          name: "Standard",
          price: data.price,
          salePrice: data.salePrice,
          stock: data.stock,
          hasSale: data.hasSale,

          images: data.images || [],
        });
      }
    }
  }, [data?.id, data?.variants, data?.hasMultipleVariants]);

  // Image Gallery Logic
  // Image Gallery Logic
  const galleryImages = React.useMemo(() => {
    if (!data) return [];

    let images: string[] = [];

    // 1. Always start with Standard Product Images
    if (data.images && data.images.length > 0) {
      images = [...data.images];
    }

    // 2. If a specific variant is selected (and not base), try to prioritize its images
    if (
      selectedVariant &&
      selectedVariant.id !== "base" &&
      selectedVariant.images?.length > 0
    ) {
      // If the selected variant has specific images, we might want to show them.
      // However, to mimic the backend "Cover Image" logic which shows everything distinct:
      // We will append them.
      // But usually, if a user selects a variant, they want to see THAT variant's images.
      // The user request was "get image based on order first standard then start using varient position".

      // Let's interpret "Product Page" as the initial view.
      // If we are just viewing the product, we want the "Cover" logic.
      // But if we interactively select a variant, we arguably want to filter?
      // Actually, standard e-commerce behavior:
      // - Initial Load: Show Cover (Standard[0] or Variant[0]).
      // - User Clicks "Red Variant": Carousel scrolls to Red Variant Image OR filters to only Red.

      // The current code filters strictly to variant images if selected.
      // "if (selectedVariant && ... !== 'base') return selectedVariant.images"

      // If the user wants the "Cover Picture" to be correct, that effectively means `data.images` must be present.
      // The issue is likely when `hasMultipleVariants` is true, the current code WAS SKIPPING `data.images` entirely.
      // Old code lines 91-92: `const variantImages = ...`. It ignored `data.images`.

      images = [...images, ...selectedVariant.images];
    }
    // 3. If no specific variant selected (or it's base), and we have multiple variants, append ALL variant images ordered.
    else if (data.hasMultipleVariants) {
      const variantImages =
        data.variants?.flatMap((v) => v.images || []).filter(Boolean) || [];
      images = [...images, ...variantImages];
    }

    // Deduplicate
    return [...new Set(images)];
  }, [data, selectedVariant]);

  // Handle Variant/Gallery Switching
  React.useEffect(() => {
    // When the gallery images source changes (e.g. variant selected),
    // reset to the first image.
    setActiveImageIndex(0);
  }, [galleryImages]);

  const { data: featuredResponse } = useProducts({ featured: true, limit: 10 });

  const { data: brandResponse } = useProducts({
    brand: data?.brand?.name || undefined,
    limit: 6,
  });
  const { data: styleResponse } = useProducts({
    tags: data?.tags?.[0],
    limit: 6,
  });
  const { data: alsoBoughtResponse } = useAlsoBought(
    product_detail_id as string
  );

  const featuredProducts = (featuredResponse?.products || []).filter(
    (p) => p.id !== product_detail_id
  );

  const moreFromBrand = (brandResponse?.products || []).filter(
    (p) => p.id !== product_detail_id
  );

  const scrollViewRef = React.useRef<Animated.ScrollView>(null);

  const shopTheStyle = (styleResponse?.products || []).filter(
    (p) => p.id !== product_detail_id
  );

  const scrollHandler = useAnimatedScrollHandler({
    onScroll: (event) => {
      scrollY.value = event.contentOffset.y;
    },
  });

  const headerStyle = useAnimatedStyle(() => {
    const opacity = interpolate(
      scrollY.value,
      [0, IMAGE_HEIGHT - 100],
      [0, 1],
      "clamp"
    );
    return {
      opacity,
    };
  });

  const imageAnimatedStyle = useAnimatedStyle(() => {
    const scale = interpolate(scrollY.value, [-100, 0], [1.2, 1], "clamp");
    const translateY = interpolate(
      scrollY.value,
      [0, IMAGE_HEIGHT],
      [0, -50],
      "clamp"
    );
    return {
      transform: [{ scale }, { translateY }],
    };
  });

  if (isLoading) {
    return <ProductDetailSkeleton />;
  }

  if (!data) {
    return (
      <View
        style={[styles.centerContainer, { backgroundColor: colors.background }]}
      >
        <Text style={[styles.errorText, { color: colors.text }]}>
          Product not found
        </Text>
        <TouchableOpacity
          style={{
            marginTop: 16,
            padding: 12,
            backgroundColor: colors.primary,
            borderRadius: 8,
          }}
          onPress={() => router.back()}
        >
          <Text
            style={{
              color: isDark ? colors.background : "#FFF",
              fontWeight: "600",
            }}
          >
            Go Back
          </Text>
        </TouchableOpacity>
      </View>
    );
  }

  const handleAddToCartSuccess = () => {
    // If we came here from "Move to Bag" in wishlist, remove the item from wishlist now
    if (action === "move_from_wishlist" && data?.id) {
      const isWishlisted = wishlist?.some((w) => w.productId === data.id);
      if (isWishlisted) {
        toggleWishlist(data.id);
      }
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ProductHeader
        name={data.name}
        headerStyle={headerStyle}
        productId={data.id}
      />

      <Animated.ScrollView
        ref={scrollViewRef}
        onScroll={scrollHandler}
        scrollEventThrottle={16}
        showsVerticalScrollIndicator={false}
      >
        <ProductHero
          images={galleryImages}
          activeImageIndex={activeImageIndex}
          setActiveImageIndex={setActiveImageIndex}
          imageAnimatedStyle={imageAnimatedStyle}
        />

        <View
          style={[
            styles.contentContainer,
            { backgroundColor: colors.background },
          ]}
        >
          <View style={styles.textSection}>
            <ProductInfo data={data} />
            <ProductDetailsSection
              data={data}
              selectedVariantId={selectedVariant?.id}
              onSelectVariant={setSelectedVariant}
            />
            <LuxuryServiceBar />
          </View>
          <View style={styles.textSection}>
            <ProductReviews productId={data.id} scrollViewRef={scrollViewRef} />
          </View>

          {featuredProducts.length > 0 && (
            <HorizontalProductSlider
              title="You May Also Like"
              products={featuredProducts}
            />
          )}

          {alsoBoughtResponse?.success &&
            alsoBoughtResponse.data &&
            Array.isArray(alsoBoughtResponse.data) &&
            alsoBoughtResponse.data.length > 0 && (
              <HorizontalProductSlider
                title="People Also Bought"
                products={alsoBoughtResponse.data}
              />
            )}

          {moreFromBrand.length > 0 && (
            <HorizontalProductSlider
              title={`More from ${data.brand?.name || "LuxStore"}`}
              products={moreFromBrand}
            />
          )}

          {shopTheStyle.length > 0 && (
            <HorizontalProductSlider
              title="Shop The Style"
              products={shopTheStyle}
            />
          )}

          <View style={{ height: 120 }} />
        </View>
      </Animated.ScrollView>

      <ProductBottomBar
        productId={data.id}
        variantId={
          selectedVariant?.id === "base" ? undefined : selectedVariant?.id
        }
        stock={selectedVariant ? selectedVariant.stock : data.stock}
        onSuccess={handleAddToCartSuccess}
      />
    </View>
  );
};

export default ProductDetailPage;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  centerContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  errorText: {
    fontSize: 16,
    fontWeight: "500",
  },
  contentContainer: {
    flex: 1,
    marginTop: -20,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingTop: 24,
  },
  textSection: {
    paddingHorizontal: 24,
  },
});
