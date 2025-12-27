import { ReturnRequest, returns } from "@/app/api/returns";
import { useTheme } from "@/app/context/theme-context";
import { getImageUrl } from "@/app/lib/api-client";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Image,
  RefreshControl,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function MyReturnsScreen() {
  const { colors, isDark } = useTheme();
  const router = useRouter();
  const [data, setData] = useState<ReturnRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadReturns = async () => {
    try {
      const response: any = await returns.listMyReturns();
      // Ensure we access the data correctly if it's wrapped in { data: ... }
      // api-client usually returns data directly typed as T upon success,
      // but if ApiResponse is { success: true, data: T }, check structure.
      // Based on api-client implementation: it returns data as T.
      // Assuming listMyReturns returns ReturnRequest[] directly or inside data key.
      // Let's assume it returns { data: ReturnRequest[] } or ReturnRequest[]
      // depending on backend. Usually standard is { data: ... }

      const result = response.data || response; // Fallback
      if (Array.isArray(result)) {
        setData(result);
      } else {
        setData([]);
      }
    } catch (error) {
      console.error("Failed to load returns", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadReturns();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    loadReturns();
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "approved":
        return "#4CAF50";
      case "refunded":
        return "#2196F3";
      case "rejected":
        return "#F44336";
      default:
        return "#FF9800"; // pending
    }
  };

  const renderItem = ({ item }: { item: ReturnRequest }) => {
    const statusColor = getStatusColor(item.status);
    const mainItem = item.items[0]; // Show first item image

    return (
      <View style={[styles.card, { backgroundColor: colors.surface }]}>
        <View style={styles.cardHeader}>
          <Text style={[styles.date, { color: colors.muted }]}>
            Placed on {new Date(item.createdAt).toLocaleDateString()}
          </Text>
          <View style={[styles.badge, { backgroundColor: statusColor + "20" }]}>
            <Text style={[styles.badgeText, { color: statusColor }]}>
              {item.status.toUpperCase()}
            </Text>
          </View>
        </View>

        <View style={styles.cardContent}>
          {mainItem && (
            <Image
              source={{
                uri: getImageUrl(mainItem.orderItem.product.images[0]),
              }}
              style={[styles.itemImage, { backgroundColor: colors.background }]}
            />
          )}
          <View style={styles.details}>
            <Text style={[styles.orderRef, { color: colors.text }]}>
              Order #{item.orderId.slice(-6).toUpperCase()}
            </Text>
            <Text style={[styles.reason, { color: colors.muted }]}>
              {item.items.length} item(s) • {item.reason}
            </Text>
            {item.refundAmount > 0 && (
              <Text style={[styles.refund, { color: colors.primary }]}>
                Refund: ${item.refundAmount}
              </Text>
            )}
          </View>
        </View>
      </View>
    );
  };

  if (loading && !refreshing) {
    return (
      <View
        style={[
          styles.container,
          { backgroundColor: colors.background, justifyContent: "center" },
        ]}
      >
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: colors.background }]}
      edges={["top"]}
    >
      <View style={[styles.header, { borderBottomColor: colors.border }]}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backButton}
        >
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>
          MY RETURNS
        </Text>
        <View style={{ width: 24 }} />
      </View>

      <FlatList
        data={data}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={colors.primary}
          />
        }
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Ionicons name="bag-check-outline" size={48} color={colors.muted} />
            <Text style={[styles.emptyText, { color: colors.muted }]}>
              No returns found
            </Text>
          </View>
        }
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
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
  },
  backButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: "700",
    letterSpacing: 1,
  },
  list: {
    padding: 20,
  },
  card: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  date: {
    fontSize: 12,
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  badgeText: {
    fontSize: 10,
    fontWeight: "700",
  },
  cardContent: {
    flexDirection: "row",
    alignItems: "center",
  },
  itemImage: {
    width: 48,
    height: 48,
    borderRadius: 8,
    marginRight: 12,
  },
  details: {
    flex: 1,
  },
  orderRef: {
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 2,
  },
  reason: {
    fontSize: 13,
    marginBottom: 4,
  },
  refund: {
    fontSize: 13,
    fontWeight: "700",
  },
  emptyState: {
    alignItems: "center",
    justifyContent: "center",
    paddingTop: 100,
    gap: 12,
  },
  emptyText: {
    fontSize: 16,
  },
});
