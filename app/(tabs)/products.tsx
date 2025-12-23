import { useInfiniteProducts } from "@/app/api/shop";
import { EmptyState } from "@/app/components/common/EmptyState";
import { ProductCard } from "@/app/components/home/ProductCard";
import { FilterSheet } from "@/app/components/product/FilterSheet";
import { useTheme } from "@/app/context/theme-context";
import { useDebounce } from "@/app/hooks/useDebounce";
import { Ionicons } from "@expo/vector-icons";
import { BlurView } from "expo-blur";
import React, { useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

const ProductsTab = () => {
  const { colors, isDark } = useTheme();
  const [searchQuery, setSearchQuery] = useState("");
  const debouncedSearch = useDebounce(searchQuery, 500);
  const [isSearchActive, setIsSearchActive] = useState(false);

  const [isFilterVisible, setIsFilterVisible] = useState(false);
  const [activeFilters, setActiveFilters] = useState({
    brand: undefined as string | undefined,
    featured: false,
    tags: [] as string[],
  });

  const { data, isLoading, fetchNextPage, hasNextPage, isFetchingNextPage } =
    useInfiniteProducts({
      limit: 20,
      q: debouncedSearch || undefined,
      brand: activeFilters.brand,
      featured: activeFilters.featured || undefined,
      tags:
        activeFilters.tags.length > 0
          ? activeFilters.tags.join(",")
          : undefined,
    });

  const products = data?.pages.flatMap((page) => page.products) || [];

  const handleApplyFilters = (filters: any) => {
    setActiveFilters(filters);
    setIsFilterVisible(false);
  };

  const renderFooter = () => {
    if (!isFetchingNextPage) return <View style={{ height: 120 }} />;
    return (
      <View style={styles.footerLoader}>
        <ActivityIndicator size="small" color={colors.primary} />
      </View>
    );
  };

  const renderEmpty = () => {
    if (isLoading) return null;
    return (
      <EmptyState
        icon="cube-outline"
        title={searchQuery ? "No results matched" : "No products found"}
        description={
          searchQuery
            ? `We couldn't find any products matching "${searchQuery}". Try a different search term or clear your filters.`
            : "Our premium collection is currently being updated. Please check back later."
        }
        actionLabel={hasActiveFilters || searchQuery ? "Clear all" : undefined}
        onAction={() => {
          setSearchQuery("");
          setActiveFilters({ tags: [], featured: false, brand: undefined });
        }}
      />
    );
  };

  if (isLoading && !isSearchActive && !products.length) {
    return (
      <View
        style={[styles.centerContainer, { backgroundColor: colors.background }]}
      >
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  const hasActiveFilters =
    activeFilters.brand ||
    activeFilters.featured ||
    activeFilters.tags.length > 0;

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Premium Header */}
      <View style={styles.header}>
        <BlurView
          intensity={80}
          tint={isDark ? "dark" : "light"}
          style={StyleSheet.absoluteFill}
        />
        <View style={styles.headerContent}>
          {!isSearchActive ? (
            <>
              <Text style={[styles.headerTitle, { color: colors.text }]}>
                Products
              </Text>
              <View style={styles.headerActions}>
                <TouchableOpacity
                  style={[styles.actionButton, { borderColor: colors.border }]}
                  onPress={() => setIsSearchActive(true)}
                >
                  <Ionicons
                    name="search-outline"
                    size={20}
                    color={colors.text}
                  />
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.actionButton,
                    { borderColor: colors.border },
                    hasActiveFilters && {
                      backgroundColor: colors.primary,
                      borderColor: colors.primary,
                    },
                  ]}
                  onPress={() => setIsFilterVisible(true)}
                >
                  <Ionicons
                    name="options-outline"
                    size={20}
                    color={hasActiveFilters ? colors.secondary : colors.text}
                  />
                </TouchableOpacity>
              </View>
            </>
          ) : (
            <View style={styles.searchContainer}>
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
                    <Ionicons
                      name="close-circle"
                      size={18}
                      color={colors.muted}
                    />
                  </TouchableOpacity>
                )}
              </View>
              <TouchableOpacity
                onPress={() => {
                  setIsSearchActive(false);
                  setSearchQuery("");
                }}
              >
                <Text style={[styles.cancelText, { color: colors.primary }]}>
                  Cancel
                </Text>
              </TouchableOpacity>
            </View>
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
        ListFooterComponent={renderFooter}
        ListEmptyComponent={renderEmpty}
        showsVerticalScrollIndicator={false}
      />

      <FilterSheet
        isVisible={isFilterVisible}
        onClose={() => setIsFilterVisible(false)}
        activeFilters={activeFilters}
        onApply={handleApplyFilters}
      />
    </View>
  );
};

export default ProductsTab;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  centerContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingBottom: 100,
  },
  header: {
    paddingTop: 60,
    height: 110,
    zIndex: 10,
  },
  headerContent: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    height: 50,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "800",
    letterSpacing: -0.5,
  },
  headerActions: {
    flexDirection: "row",
    gap: 12,
  },
  actionButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  searchContainer: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  searchBar: {
    flex: 1,
    height: 40,
    borderRadius: 20,
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
  cancelText: {
    fontSize: 16,
    fontWeight: "600",
  },
  listContent: {
    paddingTop: 10,
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
    paddingVertical: 20,
    alignItems: "center",
    height: 100,
  },
  emptyText: {
    marginTop: 12,
    fontSize: 16,
    fontWeight: "500",
  },
});
