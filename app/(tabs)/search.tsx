import { useSearchSuggestions } from "@/app/api/search";
import { useInfiniteProducts } from "@/app/api/shop";
import { EmptyState } from "@/app/components/common/EmptyState";
import { ProductCard } from "@/app/components/home/ProductCard";
import { useTheme } from "@/app/context/theme-context";
import { useDebounce } from "@/app/hooks/useDebounce";
import { getImageUrl } from "@/app/lib/api-client";
import { Ionicons } from "@expo/vector-icons";
import React, { useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function SearchScreen() {
  const { colors, isDark } = useTheme();
  const [searchQuery, setSearchQuery] = useState("");
  const debouncedSearch = useDebounce(searchQuery, 500);

  const { data, isLoading, fetchNextPage, hasNextPage, isFetchingNextPage } =
    useInfiniteProducts({
      limit: 20,
      q: debouncedSearch || undefined,
    });

  const { data: suggestions, isLoading: suggestionsLoading } =
    useSearchSuggestions();

  const products = data?.pages.flatMap((page) => page.products) || [];

  const renderEmpty = () => {
    if (isLoading || !debouncedSearch) return null;
    return (
      <EmptyState
        icon="search-outline"
        title="No results found"
        description={`We couldn't find anything matching "${searchQuery}". Try searching for something else.`}
        actionLabel="Clear search"
        onAction={() => setSearchQuery("")}
      />
    );
  };

  const renderInitial = () => {
    if (searchQuery) return null;

    return (
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.suggestionsContainer}
      >
        {/* TRENDING SEARCHES */}
        {suggestions?.data?.trending && (
          <View style={styles.suggestionSection}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>
              TRENDING SEARCHES
            </Text>
            <View style={styles.trendingContainer}>
              {suggestions.data.trending.map((term, i) => (
                <TouchableOpacity
                  key={i}
                  style={[
                    styles.trendingTag,
                    { backgroundColor: isDark ? "#1C1C1E" : "#F2F2F7" },
                  ]}
                  onPress={() => setSearchQuery(term)}
                >
                  <Text style={[styles.trendingText, { color: colors.text }]}>
                    {term}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}

        {/* SUGGESTED CATEGORIES */}
        {suggestions?.data?.categories && (
          <View style={styles.suggestionSection}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>
              SUGGESTED CATEGORIES
            </Text>
            <View style={styles.categoriesGrid}>
              {suggestions.data.categories.map((cat, i) => (
                <TouchableOpacity
                  key={cat.id || i}
                  style={styles.categoryItem}
                  onPress={() =>
                    cat.slug && console.log("Navigate to category:", cat.slug)
                  }
                >
                  <Image
                    source={{ uri: getImageUrl(cat.image) }}
                    style={styles.categoryImage}
                  />
                  <View style={styles.categoryOverlay}>
                    <Text style={styles.categoryName}>{cat.name}</Text>
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}
      </ScrollView>
    );
  };

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: colors.background }]}
    >
      <View style={styles.header}>
        <View
          style={[
            styles.searchBar,
            {
              backgroundColor: isDark
                ? "rgba(255,255,255,0.05)"
                : "rgba(0,0,0,0.05)",
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
            autoFocus
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholder="Search products..."
            placeholderTextColor={colors.muted}
            style={[styles.searchInput, { color: colors.text }]}
          />
          {searchQuery !== "" && (
            <TouchableOpacity onPress={() => setSearchQuery("")}>
              <Ionicons name="close-circle" size={18} color={colors.muted} />
            </TouchableOpacity>
          )}
        </View>
      </View>

      <FlatList
        data={products}
        keyExtractor={(item) => item.id}
        numColumns={2}
        contentContainerStyle={styles.listContent}
        columnWrapperStyle={styles.columnWrapper}
        renderItem={({ item, index }) => (
          <View style={styles.cardContainer}>
            <ProductCard item={item} index={index % 20} />
          </View>
        )}
        onEndReached={() => {
          if (hasNextPage && !isFetchingNextPage) {
            fetchNextPage();
          }
        }}
        onEndReachedThreshold={0.5}
        ListEmptyComponent={searchQuery ? renderEmpty : renderInitial}
        showsVerticalScrollIndicator={false}
      />

      {isFetchingNextPage && (
        <View style={styles.footerLoader}>
          <ActivityIndicator size="small" color={colors.primary} />
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  searchBar: {
    height: 44,
    borderRadius: 12,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    height: "100%",
  },
  centerContainer: {
    paddingTop: 100,
    justifyContent: "center",
    alignItems: "center",
  },
  emptyText: {
    marginTop: 12,
    fontSize: 16,
    fontWeight: "500",
  },
  listContent: {
    paddingBottom: 100,
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
  footerLoader: {
    position: "absolute",
    bottom: 110,
    left: 0,
    right: 0,
    alignItems: "center",
  },
  suggestionsContainer: {
    padding: 20,
    paddingBottom: 100,
  },
  suggestionSection: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: "800",
    letterSpacing: 2,
    marginBottom: 16,
    opacity: 0.6,
  },
  trendingContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  trendingTag: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
  },
  trendingText: {
    fontSize: 14,
    fontWeight: "500",
  },
  categoriesGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  categoryItem: {
    width: "48%",
    aspectRatio: 1,
    borderRadius: 12,
    overflow: "hidden",
    marginBottom: 16,
  },
  categoryImage: {
    width: "100%",
    height: "100%",
  },
  categoryOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.3)",
    justifyContent: "center",
    alignItems: "center",
    padding: 10,
  },
  categoryName: {
    color: "#FFF",
    fontSize: 16,
    fontWeight: "700",
    textAlign: "center",
    textTransform: "uppercase",
    letterSpacing: 1,
  },
});
