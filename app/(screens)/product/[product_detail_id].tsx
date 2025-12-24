import { useProduct, useProducts } from "@/app/api/shop";
import { HorizontalProductSlider } from "@/app/components/product/HorizontalProductSlider";
import { LuxuryServiceBar } from "@/app/components/product/LuxuryServiceBar";
import { ProductBottomBar } from "@/app/components/product/ProductBottomBar";
import { ProductDetailSkeleton } from "@/app/components/product/ProductDetailSkeleton";
import { ProductDetailsSection } from "@/app/components/product/ProductDetailsSection";
import { ProductHeader } from "@/app/components/product/ProductHeader";
import { ProductHero } from "@/app/components/product/ProductHero";
import { ProductInfo } from "@/app/components/product/ProductInfo";
import { useTheme } from "@/app/context/theme-context";
import { useLocalSearchParams } from "expo-router";
import React, { useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import Animated, {
  interpolate,
  useAnimatedScrollHandler,
  useAnimatedStyle,
  useSharedValue,
} from "react-native-reanimated";

const IMAGE_HEIGHT = 480;

const ProductDetailPage = () => {
  const { product_detail_id } = useLocalSearchParams();
  const { colors } = useTheme();
  const scrollY = useSharedValue(0);
  const [activeImageIndex, setActiveImageIndex] = useState(0);

  const { data, isLoading } = useProduct(product_detail_id as string);
  const { data: featuredResponse } = useProducts({ featured: true, limit: 10 });

  const { data: brandResponse } = useProducts({
    brand: data?.brand || undefined,
    limit: 6,
  });
  const { data: styleResponse } = useProducts({
    tags: data?.tags?.[0],
    limit: 6,
  });

  const featuredProducts = (featuredResponse?.products || []).filter(
    (p) => p.id !== product_detail_id
  );

  const moreFromBrand = (brandResponse?.products || []).filter(
    (p) => p.id !== product_detail_id
  );

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
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ProductHeader name={data.name} headerStyle={headerStyle} />

      <Animated.ScrollView
        onScroll={scrollHandler}
        scrollEventThrottle={16}
        showsVerticalScrollIndicator={false}
      >
        <ProductHero
          images={data.images}
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
            <ProductDetailsSection data={data} />
            <LuxuryServiceBar />
          </View>

          <HorizontalProductSlider
            title="You May Also Like"
            products={featuredProducts}
          />

          {moreFromBrand.length > 0 && (
            <HorizontalProductSlider
              title={`More from ${data.brand || "LuxStore"}`}
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

      <ProductBottomBar />
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
