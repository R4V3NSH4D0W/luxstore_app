import {
    useCategoryShowcase,
    useCollection,
    useCollections,
} from "@/app/api/shop";
import { CollectionHero } from "@/app/components/collection/CollectionHero";
import { CollectionSkeleton } from "@/app/components/collection/CollectionSkeleton";
import { EmptyCollectionState } from "@/app/components/collection/EmptyCollectionState";
import { ProductCard } from "@/app/components/home/ProductCard";
import { useTheme } from "@/app/context/theme-context";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import React from "react";
import {
    Image,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from "react-native";
import Animated, {
    interpolate,
    useAnimatedScrollHandler,
    useAnimatedStyle,
    useSharedValue,
} from "react-native-reanimated";
import {
    SafeAreaView,
    useSafeAreaInsets,
} from "react-native-safe-area-context";

const HERO_HEIGHT = 450;

const CollectionPage = () => {
  const { collection_id } = useLocalSearchParams();
  const router = useRouter();
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const scrollY = useSharedValue(0);

  const { data, isLoading } = useCollection(collection_id as string);
  const { data: otherCollectionsResponse } = useCollections(1, 10);
  const { data: categories } = useCategoryShowcase();

  const otherCollections = (otherCollectionsResponse?.collections || []).filter(
    (c) => c.id !== collection_id
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
      backgroundColor: colors.background,
    };
  });

  const backButtonAnimatedStyle = useAnimatedStyle(() => {
    const opacity = interpolate(
      scrollY.value,
      [HERO_HEIGHT - 120, HERO_HEIGHT - 60],
      [1, 0],
      "clamp"
    );
    return { opacity };
  });

  const imageAnimatedStyle = useAnimatedStyle(() => {
    const translateY = interpolate(
      scrollY.value,
      [0, HERO_HEIGHT],
      [0, -50],
      "clamp"
    );
    const scale = interpolate(scrollY.value, [-100, 0], [1.2, 1], "clamp");
    return { transform: [{ translateY }, { scale }] };
  });

  const renderEmpty = () => (
    <EmptyCollectionState onBack={() => router.back()} />
  );

  const renderFooter = () => (
    <View style={styles.footer}>
      {otherCollections.length > 0 && (
        <View style={styles.footerSection}>
          <Text style={[styles.footerTitle, { color: colors.text }]}>
            EXPLORE OTHER COLLECTIONS
          </Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.miniList}
          >
            {otherCollections.map((col) => (
              <TouchableOpacity
                key={col.id}
                style={styles.collectionCard}
                onPress={() => router.push(`/collection/${col.id}`)}
              >
                <Image
                  source={{ uri: col.image }}
                  style={styles.collectionImage}
                />
                <View style={styles.collectionOverlaySmall}>
                  <Text style={styles.collectionTitleSmall}>
                    {col.name.toUpperCase()}
                  </Text>
                </View>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      )}

      {categories && categories.length > 0 && (
        <View style={styles.footerSection}>
          <Text style={[styles.footerTitle, { color: colors.text }]}>
            BROWSE BY CATEGORY
          </Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.miniList}
          >
            {categories.map((cat) => (
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
                    <Text style={[styles.miniInitial, { color: colors.text }]}>
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
    </View>
  );

  if (isLoading) {
    return <CollectionSkeleton />;
  }

  if (!data) {
    return (
      <View
        style={[styles.centerContainer, { backgroundColor: colors.background }]}
      >
        <Text style={{ color: colors.text }}>Collection not found</Text>
        <TouchableOpacity
          style={[styles.backButton, { top: 60, left: 24 }]}
          onPress={() => router.back()}
        >
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Floating Header */}
      <Animated.View style={[styles.header, headerStyle]}>
        <SafeAreaView edges={["top"]}>
          <View style={styles.headerContent}>
            <TouchableOpacity onPress={() => router.back()}>
              <Ionicons name="arrow-back" size={24} color={colors.text} />
            </TouchableOpacity>
            <Text
              style={[styles.headerTitle, { color: colors.text }]}
              numberOfLines={1}
            >
              {data.name}
            </Text>
            <View style={{ width: 24 }} />
          </View>
        </SafeAreaView>
      </Animated.View>

      {/* Back Button (Always visible on top of hero until header fades in) */}
      <Animated.View
        style={[
          styles.backButton,
          {
            top: insets.top + (60 - 40) / 2, // Center vertically within the 60px header height
            left: 20 - (40 - 24) / 2, // Align icon (24px) with header padding (20px)
          },
          backButtonAnimatedStyle,
        ]}
      >
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#FFF" />
        </TouchableOpacity>
      </Animated.View>

      <Animated.FlatList
        data={data.products}
        onScroll={scrollHandler}
        scrollEventThrottle={16}
        numColumns={2}
        contentContainerStyle={styles.listContent}
        columnWrapperStyle={styles.columnWrapper}
        ListHeaderComponent={
          <>
            <CollectionHero
              name={data.name}
              image={data.image || undefined}
              description={data.description}
              imageStyle={imageAnimatedStyle}
            />
            <View style={styles.gridHeader}>
              <Text style={[styles.productCount, { color: colors.muted }]}>
                {data.products?.length || 0} PRODUCTS FOUND
              </Text>
              <View
                style={[
                  styles.headerDivider,
                  { backgroundColor: colors.border },
                ]}
              />
            </View>
          </>
        }
        renderItem={({ item, index }) => (
          <View style={styles.cardContainer}>
            <ProductCard item={item} index={index} />
          </View>
        )}
        ListEmptyComponent={renderEmpty}
        ListFooterComponent={renderFooter}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
};

export default CollectionPage;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    zIndex: 10,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "rgba(0,0,0,0.05)",
  },
  headerContent: {
    height: 60,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: "800",
    letterSpacing: 2,
    textTransform: "uppercase",
  },
  backButton: {
    position: "absolute",
    zIndex: 20,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(0,0,0,0.3)",
    justifyContent: "center",
    alignItems: "center",
  },
  gridHeader: {
    paddingHorizontal: 24,
    paddingTop: 32,
    paddingBottom: 8,
    alignItems: "center",
  },
  productCount: {
    fontSize: 10,
    fontWeight: "700",
    letterSpacing: 2,
    marginBottom: 12,
  },
  headerDivider: {
    height: 1,
    width: 40,
    opacity: 0.2,
  },
  listContent: {
    paddingBottom: 20,
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
    paddingTop: 60,
    paddingBottom: 20,
  },
  footerSection: {
    marginBottom: 48,
  },
  footerTitle: {
    fontSize: 12,
    fontWeight: "800",
    letterSpacing: 2,
    marginBottom: 24,
    paddingHorizontal: 24,
    textAlign: "center",
  },
  miniList: {
    paddingHorizontal: 24,
    gap: 16,
  },
  miniItem: {
    alignItems: "center",
    width: 75,
  },
  miniCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    borderWidth: 1,
    overflow: "hidden",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.02)",
    marginBottom: 10,
  },
  miniImage: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
  },
  miniInitial: {
    fontSize: 20,
    fontWeight: "300",
  },
  miniText: {
    fontSize: 10,
    fontWeight: "700",
    textAlign: "center",
    letterSpacing: 0.5,
  },
  collectionCard: {
    width: 240,
    height: 180,
    borderRadius: 8,
    overflow: "hidden",
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  collectionImage: {
    ...StyleSheet.absoluteFillObject,
    resizeMode: "cover",
  },
  collectionOverlaySmall: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.25)",
    justifyContent: "center",
    alignItems: "center",
    padding: 16,
  },
  collectionTitleSmall: {
    color: "#FFF",
    fontSize: 12,
    fontWeight: "900",
    letterSpacing: 2,
    textAlign: "center",
  },
  centerContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});
