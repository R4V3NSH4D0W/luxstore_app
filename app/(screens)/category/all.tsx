import { useCategoryShowcase } from "@/app/api/shop";
import { GridDiscoverySkeleton } from "@/app/components/GridDiscoverySkeleton";
import { useTheme } from "@/app/context/theme-context";
import { getImageUrl } from "@/app/lib/api-client";
import { Category } from "@/app/types/api-types";
import { Ionicons } from "@expo/vector-icons";
import { BlurView } from "expo-blur";
import { useRouter } from "expo-router";
import React, { useMemo, useState } from "react";
import {
  Dimensions,
  FlatList,
  Image,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import Animated, { FadeInDown, FadeInRight } from "react-native-reanimated";
import { SafeAreaView } from "react-native-safe-area-context";

const { width } = Dimensions.get("window");
const COLUMN_WIDTH = (width - 48 - 12) / 2;
const CARD_ASPECT_RATIO = 3 / 4;

const CategoryCard = ({ item, index }: { item: Category; index: number }) => {
  const router = useRouter();
  const { colors, isDark } = useTheme();

  return (
    <Animated.View
      entering={FadeInDown.delay(index * 100)
        .duration(600)
        .springify()}
      style={styles.cardContainer}
    >
      <TouchableOpacity
        activeOpacity={0.9}
        onPress={() => router.push(`/category/${item.id}`)}
        style={styles.card}
      >
        {item.image ? (
          <Image
            source={{ uri: getImageUrl(item.image) }}
            style={styles.cardImage}
          />
        ) : (
          <View
            style={[
              styles.placeholderContainer,
              { backgroundColor: isDark ? "#222" : "#F5F5F5" },
            ]}
          >
            <Text style={[styles.placeholderText, { color: colors.muted }]}>
              {item.name.charAt(0)}
            </Text>
          </View>
        )}
        {item.catalogue?.name && (
          <View style={styles.tagWrapper}>
            <BlurView intensity={20} tint="dark" style={styles.catalogueTag}>
              <Text style={styles.catalogueTagText}>
                {item.catalogue.name.toUpperCase()}
              </Text>
            </BlurView>
          </View>
        )}
        <View style={styles.cardOverlay}>
          <View style={styles.cardTextContainer}>
            <Text style={styles.cardTitle}>{item.name.toUpperCase()}</Text>
          </View>
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
};

export default function AllCategoriesScreen() {
  const router = useRouter();
  const { colors, isDark } = useTheme();
  const { data: categories, isLoading } = useCategoryShowcase();
  const [searchQuery, setSearchQuery] = useState("");

  const filteredCategories = useMemo(() => {
    if (!categories) return [];
    if (!searchQuery.trim()) return categories;
    return categories.filter((cat) =>
      cat.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [categories, searchQuery]);

  if (isLoading) {
    return <GridDiscoverySkeleton />;
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <SafeAreaView
        edges={["top"]}
        style={{ backgroundColor: colors.background }}
      >
        <View style={styles.header}>
          <TouchableOpacity
            style={[
              styles.backButton,
              {
                backgroundColor: isDark
                  ? "rgba(255,255,255,0.05)"
                  : "rgba(0,0,0,0.03)",
              },
            ]}
            onPress={() => router.back()}
          >
            <Ionicons name="arrow-back" size={24} color={colors.text} />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: colors.text }]}>
            DISCOVER
          </Text>
          <View style={{ width: 40 }} />
        </View>

        <Animated.View
          entering={FadeInRight.delay(200).duration(800)}
          style={styles.searchContainer}
        >
          <View
            style={[
              styles.searchInputWrapper,
              {
                backgroundColor: isDark
                  ? "rgba(255,255,255,0.05)"
                  : "rgba(0,0,0,0.02)",
                borderColor: colors.border,
              },
            ]}
          >
            <Ionicons
              name="search-outline"
              size={18}
              color={colors.muted}
              style={styles.searchIcon}
            />
            <TextInput
              placeholder="Search categories..."
              placeholderTextColor={colors.muted}
              style={[styles.searchInput, { color: colors.text }]}
              value={searchQuery}
              onChangeText={setSearchQuery}
              autoCapitalize="none"
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity onPress={() => setSearchQuery("")}>
                <Ionicons name="close-circle" size={18} color={colors.muted} />
              </TouchableOpacity>
            )}
          </View>
        </Animated.View>
      </SafeAreaView>

      <FlatList
        data={filteredCategories}
        keyExtractor={(item) => item.id}
        numColumns={2}
        contentContainerStyle={styles.listContent}
        columnWrapperStyle={styles.columnWrapper}
        renderItem={({ item, index }) => (
          <CategoryCard item={item} index={index} />
        )}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons
              name="search-outline"
              size={48}
              color={colors.border}
              style={{ marginBottom: 16 }}
            />
            <Text style={[styles.emptyText, { color: colors.muted }]}>
              No categories found for "{searchQuery}"
            </Text>
          </View>
        }
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    height: 60,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    marginBottom: 8,
  },
  headerTitle: {
    fontSize: 14,
    fontWeight: "900",
    letterSpacing: 4,
    textTransform: "uppercase",
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  searchContainer: {
    paddingHorizontal: 24,
    marginBottom: 16,
  },
  searchInputWrapper: {
    height: 48,
    borderRadius: 12,
    borderWidth: 1,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
  },
  searchIcon: {
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    fontWeight: "500",
  },
  listContent: {
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 40,
  },
  columnWrapper: {
    justifyContent: "space-between",
    marginBottom: 12,
  },
  cardContainer: {
    width: COLUMN_WIDTH,
    aspectRatio: CARD_ASPECT_RATIO,
    borderRadius: 16,
    overflow: "hidden",
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
  },
  card: {
    flex: 1,
  },
  cardImage: {
    ...StyleSheet.absoluteFillObject,
    width: "100%",
    height: "100%",
  },
  placeholderContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  placeholderText: {
    fontSize: 24,
    fontWeight: "200",
  },
  cardOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.15)",
    justifyContent: "flex-end",
    padding: 12,
  },
  tagWrapper: {
    position: "absolute",
    top: 12,
    left: 12,
    zIndex: 2,
    borderRadius: 6,
    overflow: "hidden",
  },
  catalogueTag: {
    paddingVertical: 4,
    paddingHorizontal: 8,
    backgroundColor: "rgba(0,0,0,0.3)",
  },
  catalogueTagText: {
    color: "#FFF",
    fontSize: 8,
    fontWeight: "700",
    letterSpacing: 1,
  },
  cardTextContainer: {
    backgroundColor: "rgba(0,0,0,0.5)",
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 6,
    alignSelf: "flex-start",
  },
  cardTitle: {
    color: "#FFF",
    fontSize: 10,
    fontWeight: "800",
    letterSpacing: 2,
  },
  emptyContainer: {
    flex: 1,
    paddingTop: 100,
    alignItems: "center",
  },
  emptyText: {
    fontSize: 14,
    fontWeight: "500",
    textAlign: "center",
    paddingHorizontal: 40,
  },
});
