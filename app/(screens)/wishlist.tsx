import { useWishlist } from "@/app/api/wishlist";
import { ProductCard } from "@/app/components/home/ProductCard";
import { useTheme } from "@/app/context/theme-context";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React from "react";
import {
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { ProductsSkeleton } from "@/app/components/product/ProductsSkeleton";

export default function WishlistScreen() {
  const { colors, isDark } = useTheme();
  const router = useRouter();
  const { data: wishlist, isLoading, refetch } = useWishlist();

  if (isLoading) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <ProductsSkeleton />
      </View>
    );
  }

  if (!wishlist || wishlist.length === 0) {
    return (
      <SafeAreaView
        style={[styles.container, { backgroundColor: colors.background }]}
      >
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => router.back()}
            style={styles.backButton}
          >
            <Ionicons
              name="arrow-back"
              size={24}
              color={isDark ? "#FFF" : "#000"}
            />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: colors.text }]}>
            WISHLIST
          </Text>
          <View style={{ width: 24 }} />
        </View>
        <View style={styles.emptyContainer}>
          <Ionicons
            name="heart-outline"
            size={64}
            color={colors.muted}
            style={{ marginBottom: 16 }}
          />
          <Text style={[styles.emptyText, { color: colors.text }]}>
            Your wishlist is empty
          </Text>
          <Text style={[styles.emptySubtext, { color: colors.muted }]}>
            Save items you love to view them here later.
          </Text>
          <TouchableOpacity
            style={[styles.shopButton, { backgroundColor: colors.primary }]}
            onPress={() => router.push("/(tabs)")}
          >
            <Text
              style={[
                styles.shopButtonText,
                { color: isDark ? colors.background : "#FFF" },
              ]}
            >
              START SHOPPING
            </Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: colors.background }]}
      edges={["top"]}
    >
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backButton}
        >
          <Ionicons
            name="arrow-back"
            size={24}
            color={isDark ? "#FFF" : "#000"}
          />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>
          WISHLIST ({wishlist.length})
        </Text>
        <View style={{ width: 24 }} />
      </View>

      <FlatList
        data={wishlist}
        keyExtractor={(item) => item.id}
        numColumns={2}
        columnWrapperStyle={styles.columnWrapper}
        contentContainerStyle={styles.listContent}
        renderItem={({ item, index }) => (
          <View style={styles.gridItem}>
            <ProductCard
              item={item.product}
              index={index}
              showMoveToCart={true}
            />
          </View>
        )}
        showsVerticalScrollIndicator={false}
        refreshing={isLoading}
        onRefresh={refetch}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(0,0,0,0.05)",
  },
  backButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: "700",
    letterSpacing: 1,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 32,
  },
  emptyText: {
    fontSize: 20,
    fontWeight: "700",
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    textAlign: "center",
    marginBottom: 32,
    lineHeight: 20,
  },
  shopButton: {
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 30,
  },
  shopButtonText: {
    fontSize: 14,
    fontWeight: "700",
    letterSpacing: 1,
  },
  listContent: {
    padding: 16,
  },
  columnWrapper: {
    justifyContent: "space-between",
  },
  gridItem: {
    width: "48%",
    marginBottom: 16,
  },
});
