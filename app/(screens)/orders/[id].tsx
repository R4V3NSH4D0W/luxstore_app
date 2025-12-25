import { useOrder } from "@/app/api/orders";
import { OrderDetailSkeleton } from "@/app/components/orders/OrderDetailSkeleton";
import { useCurrency } from "@/app/context/currency-context";
import { useTheme } from "@/app/context/theme-context";
import { getImageUrl } from "@/app/lib/api-client";
import { Ionicons } from "@expo/vector-icons";
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
import { SafeAreaView } from "react-native-safe-area-context";

export default function OrderDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { colors, isDark } = useTheme();
  const { formatPrice } = useCurrency();
  const router = useRouter();

  const { data: response, isLoading } = useOrder(id);
  const order = response?.data;

  if (isLoading) {
    return <OrderDetailSkeleton />;
  }

  if (!order) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <Text style={{ color: colors.text }}>Order not found</Text>
      </View>
    );
  }

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "delivered":
        return "#4CAF50";
      case "shipped":
        return "#2196F3";
      case "processing":
        return "#FF9800";
      case "cancelled":
        return "#F44336";
      default:
        return colors.muted;
    }
  };

  const statusColor = getStatusColor(order.status);

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: colors.background }]}
      edges={["top"]}
    >
      {/* Header */}
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
          ORDER DETAILS
        </Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {/* Order Info Card */}
        <View style={[styles.section, { backgroundColor: colors.surface }]}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.orderId, { color: colors.text }]}>
              Order #{order.id.slice(-6).toUpperCase()}
            </Text>
            <View
              style={[
                styles.statusBadge,
                { backgroundColor: statusColor + "20" },
              ]}
            >
              <Text style={[styles.statusText, { color: statusColor }]}>
                {order.status.toUpperCase()}
              </Text>
            </View>
          </View>
          <Text style={[styles.orderDate, { color: colors.muted }]}>
            Placed on{" "}
            {new Date(order.createdAt).toLocaleDateString(undefined, {
              year: "numeric",
              month: "long",
              day: "numeric",
              hour: "2-digit",
              minute: "2-digit",
            })}
          </Text>
        </View>

        {/* Shipping Address */}
        {order.address && (
          <View style={[styles.section, { backgroundColor: colors.surface }]}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>
              Shipping Address
            </Text>
            <View style={styles.addressContainer}>
              <View
                style={[styles.iconBox, { backgroundColor: colors.background }]}
              >
                <Ionicons
                  name="location-outline"
                  size={20}
                  color={colors.primary}
                />
              </View>
              <View style={styles.addressTextContainer}>
                <Text style={[styles.addressName, { color: colors.text }]}>
                  {order.address.name}
                </Text>
                <Text style={[styles.addressText, { color: colors.muted }]}>
                  {order.address.street}
                </Text>
                <Text style={[styles.addressText, { color: colors.muted }]}>
                  {order.address.city}, {order.address.zip}
                </Text>
                {order.address.phone && (
                  <Text
                    style={[
                      styles.addressText,
                      { color: colors.muted, marginTop: 4 },
                    ]}
                  >
                    {order.address.phone}
                  </Text>
                )}
              </View>
            </View>
          </View>
        )}

        {/* Shipment & Tracking */}
        {order.shipments && order.shipments.length > 0 && (
          <View style={[styles.section, { backgroundColor: colors.surface }]}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>
              Track Shipment
            </Text>
            {order.shipments.map((shipment) => (
              <View key={shipment.id} style={styles.shipmentBox}>
                <View style={styles.shipmentHeader}>
                  <View
                    style={[
                      styles.iconBox,
                      {
                        backgroundColor: colors.background,
                        width: 32,
                        height: 32,
                      },
                    ]}
                  >
                    <Ionicons
                      name="bus-outline"
                      size={16}
                      color={colors.primary}
                    />
                  </View>
                  <View>
                    <Text style={[styles.carrierName, { color: colors.text }]}>
                      {shipment.carrier || "Standard Shipping"}
                    </Text>
                    {shipment.tracking && (
                      <Text
                        style={[styles.trackingNumber, { color: colors.muted }]}
                      >
                        {shipment.tracking}
                      </Text>
                    )}
                  </View>
                </View>
                {shipment.shippedAt && (
                  <Text style={[styles.shipmentInfo, { color: colors.muted }]}>
                    Shipped on{" "}
                    {new Date(shipment.shippedAt).toLocaleDateString()}
                  </Text>
                )}
              </View>
            ))}
          </View>
        )}

        {/* Items */}
        <View style={[styles.section, { backgroundColor: colors.surface }]}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            Items ({order.items.length})
          </Text>
          {order.items.map((item, index) => (
            <View
              key={item.id}
              style={[
                styles.itemRow,
                index !== order.items.length - 1 && {
                  borderBottomWidth: 1,
                  borderBottomColor: colors.border,
                },
              ]}
            >
              <Image
                source={{ uri: getImageUrl(item.product.images[0]) }}
                style={styles.itemImage}
              />
              <View style={styles.itemDetails}>
                <Text style={[styles.itemBrand, { color: colors.muted }]}>
                  {item.product.brand || "LuxStore"}
                </Text>
                <Text
                  style={[styles.itemName, { color: colors.text }]}
                  numberOfLines={2}
                >
                  {item.product.name}
                </Text>
                <View style={styles.itemMeta}>
                  <Text style={[styles.itemQty, { color: colors.muted }]}>
                    Qty: {item.quantity}
                  </Text>
                  <Text style={[styles.itemPrice, { color: colors.text }]}>
                    {formatPrice(item.price)}
                  </Text>
                </View>
              </View>
            </View>
          ))}
        </View>

        {/* Payment & Summary */}
        <View style={[styles.section, { backgroundColor: colors.surface }]}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            Payment Summary
          </Text>

          <View style={styles.summaryRow}>
            <Text style={[styles.summaryLabel, { color: colors.muted }]}>
              Payment Method
            </Text>
            <Text style={[styles.summaryValue, { color: colors.text }]}>
              {order.paymentMethod === "cod"
                ? "Cash on Delivery"
                : "Card Payment"}
            </Text>
          </View>

          <View style={[styles.divider, { backgroundColor: colors.border }]} />

          <View style={styles.summaryRow}>
            <Text style={[styles.summaryLabel, { color: colors.muted }]}>
              Subtotal
            </Text>
            {/* Assuming tax is 0 for now as it's not clear in order object, using total as subtotal */}
            <Text style={[styles.summaryValue, { color: colors.text }]}>
              {formatPrice(order.total, order.currency)}
            </Text>
          </View>

          <View style={[styles.divider, { backgroundColor: colors.border }]} />

          <View style={styles.summaryRow}>
            <Text style={[styles.totalLabel, { color: colors.text }]}>
              Total Paid
            </Text>
            <Text style={[styles.totalAmount, { color: colors.text }]}>
              {formatPrice(order.total, order.currency)}
            </Text>
          </View>
        </View>
      </ScrollView>
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
  content: {
    padding: 24,
    paddingBottom: 40,
  },
  section: {
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "700",
    marginBottom: 16,
  },
  orderId: {
    fontSize: 18,
    fontWeight: "800",
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
  orderDate: {
    fontSize: 14,
  },
  addressContainer: {
    flexDirection: "row",
    alignItems: "flex-start",
  },
  iconBox: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  addressTextContainer: {
    flex: 1,
  },
  addressName: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 4,
  },
  addressText: {
    fontSize: 14,
    lineHeight: 20,
  },
  shipmentBox: {
    paddingTop: 4,
  },
  shipmentHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  carrierName: {
    fontSize: 14,
    fontWeight: "700",
  },
  trackingNumber: {
    fontSize: 12,
  },
  shipmentInfo: {
    fontSize: 12,
    marginTop: 4,
  },
  itemRow: {
    flexDirection: "row",
    paddingVertical: 12,
  },
  itemImage: {
    width: 60,
    height: 80,
    borderRadius: 8,
    backgroundColor: "#F0F0F0",
  },
  itemDetails: {
    flex: 1,
    marginLeft: 12,
    justifyContent: "center",
  },
  itemBrand: {
    fontSize: 10,
    fontWeight: "600",
    textTransform: "uppercase",
    marginBottom: 4,
  },
  itemName: {
    fontSize: 14,
    fontWeight: "500",
    marginBottom: 6,
  },
  itemMeta: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  itemQty: {
    fontSize: 12,
  },
  itemPrice: {
    fontSize: 14,
    fontWeight: "700",
  },
  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 4,
  },
  summaryLabel: {
    fontSize: 14,
  },
  summaryValue: {
    fontSize: 14,
    fontWeight: "500",
  },
  divider: {
    height: 1,
    marginVertical: 12,
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: "700",
  },
  totalAmount: {
    fontSize: 18,
    fontWeight: "800",
  },
});
