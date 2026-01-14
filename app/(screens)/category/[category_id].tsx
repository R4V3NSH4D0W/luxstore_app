import {
  useCategory,
  useCategoryShowcase,
  useFeaturedCollections,
} from "@/app/api/shop";
import { CategoryHeader } from "@/app/components/category/CategoryHeader";
import {
  CategoryHero,
  HERO_HEIGHT,
} from "@/app/components/category/CategoryHero";
import { CategorySkeleton } from "@/app/components/category/CategorySkeleton";
import { EmptyState } from "@/app/components/common/EmptyState";
import { ProductCard } from "@/app/components/home/ProductCard";
import { useTheme } from "@/app/context/theme-context";
import { useLocalSearchParams, useRouter } from "expo-router";
import React from "react";
import {
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import Animated, {
  interpolate,
  useAnimatedScrollHandler,
  useAnimatedStyle,
  useSharedValue,
} from "react-native-reanimated";

const CategoryPage = () => {
  const { category_id } = useLocalSearchParams();
  const router = useRouter();
  const { colors } = useTheme();
  const scrollY = useSharedValue(0);

  const { data, isLoading } = useCategory(category_id as string, 1, 20);
  const { data: otherCategories } = useCategoryShowcase();
  const { data: collections } = useFeaturedCollections();

  const renderFooter = () => (
    <View style={styles.footer}>
      {otherCategories && otherCategories.length > 0 && (
        <View style={styles.footerSection}>
          <Text style={[styles.footerTitle, { color: colors.text }]}>
            EXPLORE CATEGORIES
          </Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.miniList}
          >
            {(otherCategories || [])
              .filter((c) => c.id !== category_id)
              .map((cat) => (
                <TouchableOpacity
                  key={cat.id}
                  style={styles.miniItem}
                  onPress={() => router.push(`/category/${cat.id}`)}
                >
                  <View
                    style={[styles.miniCircle, { borderColor: colors.border }]}
                  >
                    {cat.image ? (
                      <Image
                        source={{ uri: cat.image }}
                        style={styles.miniImage}
                      />
                    ) : (
                      <Text
                        style={[styles.miniInitial, { color: colors.text }]}
                      >
                        {cat.name.charAt(0)}
                      </Text>
                    )}
                  </View>
                  <Text
                    style={[styles.miniText, { color: colors.text }]}
                    numberOfLines={1}
                  >
                    {cat.name}
                  </Text>
                </TouchableOpacity>
              ))}
          </ScrollView>
        </View>
      )}

      {collections && collections.length > 0 && (
        <View style={styles.footerSection}>
          <Text style={[styles.footerTitle, { color: colors.text }]}>
            FEATURED COLLECTIONS
          </Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.miniList}
          >
            {collections.map((col) => (
              <TouchableOpacity
                key={col.id}
                style={styles.collectionCard}
                onPress={() => router.push(`/collection/${col.id}`)}
              >
                <Image
                  source={{ uri: col.image }}
                  style={styles.collectionImage}
                />
                <View style={styles.collectionOverlay}>
                  <Text style={styles.collectionTitle}>
                    {col.name.toUpperCase()}
                  </Text>
                </View>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      )}
    </View>
  );

  const scrollHandler = useAnimatedScrollHandler({
    onScroll: (event) => {
      scrollY.value = event.contentOffset.y;
    },
  });

  const headerStyle = useAnimatedStyle(() => {
    const opacity = interpolate(
      scrollY.value,
      [HERO_HEIGHT - 120, HERO_HEIGHT - 60],
      [0, 1],
      "clamp"
    );
    return {
      opacity,
    };
  });

  const imageAnimatedStyle = useAnimatedStyle(() => {
    const translateY = interpolate(
      scrollY.value,
      [0, HERO_HEIGHT],
      [0, -50],
      "clamp"
    );
    return {
      transform: [{ translateY }],
    };
  });

  if (isLoading) {
    return <CategorySkeleton />;
  }

  if (!data) {
    return (
      <View
        style={[styles.centerContainer, { backgroundColor: colors.background }]}
      >
        <Text style={[styles.errorText, { color: colors.text }]}>
          Category not found
        </Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <CategoryHeader name={data.name} headerStyle={headerStyle} />

      <Animated.FlatList
        data={data.products}
        onScroll={scrollHandler}
        scrollEventThrottle={16}
        numColumns={2}
        contentContainerStyle={styles.listContent}
        columnWrapperStyle={styles.columnWrapper}
        ListHeaderComponent={
          <CategoryHero
            name={data.name}
            description={data.description}
            image={data.image}
            imageAnimatedStyle={imageAnimatedStyle}
          />
        }
        renderItem={({ item, index }) => (
          <View style={styles.cardContainer}>
            <ProductCard item={item} index={index} />
          </View>
        )}
        ListEmptyComponent={
          <EmptyState
            icon="archive-outline"
            title="We're Curating..."
            description={`We apologize, but our ${data.name} collection is currently being updated with new arrivals. Please check back soon for the latest in luxury.`}
            actionLabel="Explore All Products"
            onAction={() => router.push("/(tabs)/products")}
          />
        }
        ListFooterComponent={renderFooter}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
};

export default CategoryPage;

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
  listContent: {
    paddingBottom: 40,
  },
  columnWrapper: {
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  cardContainer: {
    width: "48%",
    marginBottom: 8,
  },
  footer: {
    paddingTop: 40,
  },
  footerSection: {
    marginBottom: 40,
  },
  footerTitle: {
    fontSize: 12,
    fontWeight: "800",
    letterSpacing: 2,
    marginBottom: 20,
    paddingHorizontal: 24,
  },
  miniList: {
    paddingHorizontal: 24,
    gap: 20,
  },
  miniItem: {
    alignItems: "center",
    width: 65,
  },
  miniCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    borderWidth: 1,
    overflow: "hidden",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.02)",
    marginBottom: 8,
  },
  miniImage: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
  },
  miniInitial: {
    fontSize: 18,
    fontWeight: "300",
  },
  miniText: {
    fontSize: 10,
    fontWeight: "600",
    textAlign: "center",
  },
  collectionCard: {
    width: 240,
    height: 160,
    borderRadius: 4,
    overflow: "hidden",
  },
  collectionImage: {
    ...StyleSheet.absoluteFillObject,
    resizeMode: "cover",
  },
  collectionOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.2)",
    justifyContent: "center",
    alignItems: "center",
    padding: 16,
  },
  collectionTitle: {
    color: "#FFF",
    fontSize: 12,
    fontWeight: "900",
    letterSpacing: 2,
    textAlign: "center",
  },
});
