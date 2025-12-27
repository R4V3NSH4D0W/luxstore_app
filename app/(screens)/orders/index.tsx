import { useMyOrders } from "@/app/api/orders";
import { useTheme } from "@/app/context/theme-context";
import { getStatusColor } from "@/app/lib/order-utils";
import { Order } from "@/types/api-types";
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

import { OrderListSkeleton } from "@/app/components/orders/OrderListSkeleton";
import { useCurrency } from "@/app/context/currency-context";

export default function OrdersScreen() {
  const { colors, isDark } = useTheme();
  const router = useRouter();
  const { data: response, isLoading, refetch } = useMyOrders();
  const allOrders = (response?.data || []).filter(
    (order) => order.status !== "refunded"
  );
  const [activeFilter, setActiveFilter] = React.useState("All");

  const FILTER_OPTIONS = [
    "All",
    "Pending",
    "Processing",
    "Completed",
    "Cancelled",
  ];

  const filteredOrders = React.useMemo(() => {
    if (activeFilter === "All") return allOrders;
    return allOrders.filter(
      (order) => order.status.toLowerCase() === activeFilter.toLowerCase()
    );
  }, [allOrders, activeFilter]);

  if (isLoading) {
    return <OrderListSkeleton />;
  }

  if (allOrders.length === 0 && !isLoading) {
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
            MY ORDERS
          </Text>
          <View style={{ width: 24 }} />
        </View>
        <View style={styles.emptyContainer}>
          <Ionicons
            name="receipt-outline"
            size={64}
            color={colors.muted}
            style={{ marginBottom: 16 }}
          />
          <Text style={[styles.emptyText, { color: colors.text }]}>
            No orders yet
          </Text>
          <Text style={[styles.emptySubtext, { color: colors.muted }]}>
            Looks like you haven't placed an order yet.
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
          MY ORDERS ({filteredOrders.length})
        </Text>
        <View style={{ width: 24 }} />
      </View>

      <View style={{ height: 50, marginBottom: 8 }}>
        <FlatList
          data={FILTER_OPTIONS}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{
            paddingHorizontal: 24,
            paddingVertical: 8,
            gap: 8,
          }}
          keyExtractor={(item) => item}
          renderItem={({ item }) => (
            <TouchableOpacity
              onPress={() => setActiveFilter(item)}
              style={[
                styles.filterChip,
                {
                  backgroundColor:
                    activeFilter === item ? colors.primary : colors.surface,
                  borderWidth: 1,
                  borderColor:
                    activeFilter === item ? colors.primary : colors.border,
                },
              ]}
            >
              <Text
                style={[
                  styles.filterText,
                  {
                    color:
                      activeFilter === item
                        ? isDark
                          ? "#000"
                          : "#FFF"
                        : colors.text,
                  },
                ]}
              >
                {item}
              </Text>
            </TouchableOpacity>
          )}
        />
      </View>

      <FlatList
        data={filteredOrders}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        renderItem={({ item }) => (
          <OrderCard
            item={item}
            isDark={isDark}
            colors={colors}
            router={router}
          />
        )}
        showsVerticalScrollIndicator={false}
        refreshing={isLoading}
        onRefresh={refetch}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
      />
    </SafeAreaView>
  );
}

function OrderCard({
  item,
  isDark,
  colors,
  router,
}: {
  item: Order;
  isDark: boolean;
  colors: any;
  router: any;
}) {
  const { formatPrice } = useCurrency();
  const statusColor = getStatusColor(item.status, colors);

  return (
    <TouchableOpacity
      style={[styles.card, { backgroundColor: colors.surface }]}
      onPress={() => router.push(`/(screens)/orders/${item.id}`)}
      activeOpacity={0.7}
    >
      <View style={styles.cardHeader}>
        <Text style={[styles.orderId, { color: colors.text }]}>
          Order #{item.id.slice(-6).toUpperCase()}
        </Text>
        <View
          style={[styles.statusBadge, { backgroundColor: statusColor + "20" }]}
        >
          <Text style={[styles.statusText, { color: statusColor }]}>
            {item.status.toUpperCase()}
          </Text>
        </View>
      </View>

      <View style={styles.cardBody}>
        <Text style={[styles.dateText, { color: colors.muted }]}>
          {new Date(item.createdAt).toLocaleDateString(undefined, {
            year: "numeric",
            month: "short",
            day: "numeric",
          })}
        </Text>
        <Text style={[styles.itemsText, { color: colors.text }]}>
          {item.items.length} {item.items.length === 1 ? "Item" : "Items"}
        </Text>
      </View>

      <View style={[styles.divider, { backgroundColor: colors.border }]} />

      <View style={styles.cardFooter}>
        <Text style={[styles.totalLabel, { color: colors.muted }]}>
          Total Amount
        </Text>
        <Text style={[styles.totalAmount, { color: colors.text }]}>
          {formatPrice(item.total)}
        </Text>
      </View>
    </TouchableOpacity>
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
    padding: 24,
  },
  separator: {
    height: 16,
  },
  card: {
    borderRadius: 16,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  orderId: {
    fontSize: 16,
    fontWeight: "700",
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 10,
    fontWeight: "700",
  },
  cardBody: {
    marginBottom: 12,
  },
  dateText: {
    fontSize: 14,
    marginBottom: 4,
  },
  itemsText: {
    fontSize: 14,
    fontWeight: "500",
  },
  divider: {
    height: 1,
    marginVertical: 12,
  },
  cardFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  totalLabel: {
    fontSize: 14,
  },
  totalAmount: {
    fontSize: 16,
    fontWeight: "700",
  },
  filterChip: {
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 20,
    marginRight: 0,
  },
  filterText: {
    fontSize: 13,
    fontWeight: "600",
  },
});
