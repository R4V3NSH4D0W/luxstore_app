import {
  searchApi,
  useAutocomplete,
  useSearchSuggestions,
} from "@/app/api/search";
import { useInfiniteProducts, usePriceStats } from "@/app/api/shop";
import { EmptyState } from "@/app/components/common/EmptyState";
import { ProductGridSkeleton } from "@/app/components/common/ProductGridSkeleton";
import { ProductCard } from "@/app/components/home/ProductCard";
import { FilterSheet } from "@/app/components/product/FilterSheet";
import { useTheme } from "@/app/context/theme-context";
import { useDebounce } from "@/app/hooks/useDebounce";
import { useRecentSearches } from "@/app/hooks/useRecentSearches";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
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
  const router = useRouter();
  const { colors, isDark } = useTheme();
  const [searchQuery, setSearchQuery] = useState("");
  const debouncedSearch = useDebounce(searchQuery, 500);
  const [showAutocomplete, setShowAutocomplete] = useState(false);
  const { history, addSearch, clearHistory, removeSearch } =
    useRecentSearches();

  const [showFilters, setShowFilters] = useState(false);
  const [activeFilters, setActiveFilters] = useState<{
    brand?: string;
    featured?: boolean;
    tags?: string[];
    sortBy?: "price_asc" | "price_desc" | "newest" | "relevance";
  }>({});

  const { data: priceStats } = usePriceStats();
  const globalMaxPrice = priceStats?.max || 1000;

  const { data, isLoading, fetchNextPage, hasNextPage, isFetchingNextPage } =
    useInfiniteProducts(
      {
        limit: 20,
        q: debouncedSearch || undefined,
        brand: activeFilters.brand,
        featured: activeFilters.featured,
        tags: activeFilters.tags?.join(","),
        sortBy: activeFilters.sortBy,
      },
      {
        enabled: !!debouncedSearch,
      }
    );

  const { data: suggestions, isLoading: suggestionsLoading } =
    useSearchSuggestions();

  const products = data?.pages.flatMap((page) => page.products) || [];

  const lastTrackedQuery = React.useRef("");

  // Track search when debounced value changes and results are loaded
  React.useEffect(() => {
    if (
      debouncedSearch &&
      debouncedSearch.trim().length > 2 &&
      !isLoading &&
      lastTrackedQuery.current !== debouncedSearch
    ) {
      console.log(
        "[Search] Tracking:",
        debouncedSearch,
        "Results:",
        products.length
      );
      searchApi
        .trackSearch(debouncedSearch, products.length)
        .then(() => {
          lastTrackedQuery.current = debouncedSearch;
        })
        .catch((err) => {
          console.error("[Search] Track failed:", err);
        });
    }
  }, [debouncedSearch, isLoading, products.length]);

  const { data: autocompleteResults } = useAutocomplete(debouncedSearch);

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

  const renderSuggestions = () => {
    if (!autocompleteResults?.data || autocompleteResults.data.length === 0)
      return null;

    return (
      <View style={styles.horizontalSuggestionsWrapper}>
        <View style={styles.suggestionHeader}>
          <Text
            style={[
              styles.sectionTitle,
              { color: colors.text, marginBottom: 0 },
            ]}
          >
            RECOMMENDED FOR YOU
          </Text>
          <View style={styles.aiBadge}>
            <Ionicons name="sparkles" size={10} color={colors.primary} />
            <Text style={[styles.aiBadgeText, { color: colors.primary }]}>
              AI POWERED
            </Text>
          </View>
        </View>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.horizontalScrollContent}
        >
          {autocompleteResults.data.map((item, i) => (
            <View key={i} style={styles.suggestionBigCard}>
              <ProductCard item={item} index={i} />
            </View>
          ))}
        </ScrollView>
      </View>
    );
  };

  const renderHeader = () => {
    const hasSuggestions =
      autocompleteResults?.data && autocompleteResults.data.length > 0;
    const hasProducts = products.length > 0;

    if (!hasSuggestions && !hasProducts) return null;

    return (
      <View>
        {hasSuggestions && renderSuggestions()}
        {hasProducts && (
          <View
            style={{ paddingHorizontal: 20, marginTop: 20, marginBottom: 4 }}
          >
            <Text style={[styles.sectionTitle, { color: colors.text }]}>
              SEARCH RESULTS
            </Text>
          </View>
        )}
      </View>
    );
  };

  const renderInitial = () => {
    return (
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.suggestionsContainer}
      >
        {/* RECENT SEARCHES */}
        {history.length > 0 && (
          <View style={styles.suggestionSection}>
            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: 16,
              }}
            >
              <Text
                style={[
                  styles.sectionTitle,
                  { color: colors.text, marginBottom: 0 },
                ]}
              >
                RECENT SEARCHES
              </Text>
              <TouchableOpacity onPress={() => clearHistory()}>
                <Text
                  style={{
                    fontSize: 12,
                    color: colors.primary,
                    fontWeight: "600",
                  }}
                >
                  Clear
                </Text>
              </TouchableOpacity>
            </View>
            <View style={styles.trendingContainer}>
              {history.map((term: string, i: number) => (
                <TouchableOpacity
                  key={i}
                  style={[
                    styles.trendingTag,
                    {
                      backgroundColor: isDark ? "#1C1C1E" : "#F2F2F7",
                      flexDirection: "row",
                      alignItems: "center",
                      gap: 6,
                      marginBottom: 8,
                    },
                  ]}
                  onPress={() => setSearchQuery(term)}
                >
                  <Ionicons
                    name="time-outline"
                    size={14}
                    color={colors.muted}
                  />
                  <Text style={[styles.trendingText, { color: colors.text }]}>
                    {term}
                  </Text>
                  <TouchableOpacity onPress={() => removeSearch(term)}>
                    <Ionicons name="close" size={14} color={colors.muted} />
                  </TouchableOpacity>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}

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
                    cat.id && router.push(`/(screens)/category/${cat.id}`)
                  }
                >
                  <Image
                    source={{ uri: cat.image }}
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
            onChangeText={(text) => {
              setSearchQuery(text);
              setShowAutocomplete(true);
            }}
            placeholder="Search products..."
            placeholderTextColor={colors.muted}
            returnKeyType="search"
            onSubmitEditing={() => {
              addSearch(searchQuery);
              setShowAutocomplete(false);
            }}
            style={[styles.searchInput, { color: colors.text }]}
          />
          {searchQuery !== "" && (
            <TouchableOpacity onPress={() => setSearchQuery("")}>
              <Ionicons name="close-circle" size={18} color={colors.muted} />
            </TouchableOpacity>
          )}
        </View>

        <TouchableOpacity
          style={[
            styles.filterButton,
            {
              backgroundColor: isDark
                ? "rgba(255,255,255,0.05)"
                : "rgba(0,0,0,0.05)",
            },
          ]}
          onPress={() => setShowFilters(true)}
        >
          <Ionicons name="options-outline" size={20} color={colors.text} />
          {activeFilters.brand ||
          activeFilters.featured ||
          activeFilters.tags?.length ? (
            <View
              style={{
                position: "absolute",
                top: 10,
                right: 10,
                width: 8,
                height: 8,
                borderRadius: 4,
                backgroundColor: colors.primary,
              }}
            />
          ) : null}
        </TouchableOpacity>
      </View>

      <FilterSheet
        isVisible={showFilters}
        onClose={() => setShowFilters(false)}
        activeFilters={{
          brand: activeFilters.brand,
          featured: activeFilters.featured,
          tags: activeFilters.tags,
          sortBy: activeFilters.sortBy,
        }}
        onApply={(filters: any) => {
          setActiveFilters(filters);
          setShowFilters(false);
        }}
      />

      {/* Removed inline renderSuggestions - now in ListHeaderComponent */}

      {!searchQuery ? (
        renderInitial()
      ) : isLoading ? (
        <View style={{ flex: 1 }}>
          <ProductGridSkeleton />
        </View>
      ) : (
        <>
          <FlatList
            data={products}
            keyExtractor={(item) => item.id}
            numColumns={2}
            contentContainerStyle={styles.listContent}
            columnWrapperStyle={styles.columnWrapper}
            ListHeaderComponent={renderHeader}
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
            ListEmptyComponent={renderEmpty}
            showsVerticalScrollIndicator={false}
            keyboardDismissMode="on-drag"
          />

          {isFetchingNextPage && (
            <View style={styles.footerLoader}>
              <ActivityIndicator size="small" color={colors.primary} />
            </View>
          )}
        </>
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
    flexDirection: "row",
    alignItems: "center",
  },
  searchBar: {
    flex: 1,
    height: 44,
    borderRadius: 12,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
  },
  filterButton: {
    width: 44,
    height: 44,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    marginLeft: 10,
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
  horizontalSuggestionsWrapper: {
    paddingVertical: 20,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(0,0,0,0.05)",
  },
  suggestionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  aiBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "rgba(0,0,0,0.05)",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  aiBadgeText: {
    fontSize: 9,
    fontWeight: "800",
    letterSpacing: 0.5,
  },
  horizontalScrollContent: {
    paddingHorizontal: 20,
    gap: 12,
  },
  suggestionBigCard: {
    width: 180,
  },
});
