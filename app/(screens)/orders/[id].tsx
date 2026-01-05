import { orderApi, useOrder } from "@/app/api/orders";
import { OrderDetailSkeleton } from "@/app/components/orders/OrderDetailSkeleton";
import { OrderTimeline } from "@/app/components/orders/OrderTimeline";
import { useCurrency } from "@/app/context/currency-context";
import { useTheme } from "@/app/context/theme-context";
import { useToast } from "@/app/context/toast-context";
import { getStatusColor } from "@/app/lib/order-utils";
import { Ionicons } from "@expo/vector-icons";
import { useQueryClient } from "@tanstack/react-query";
import { useLocalSearchParams, useRouter } from "expo-router";
import React from "react";
import {
  Image,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const CANCEL_REASONS = [
  "Changed my mind",
  "Ordered by mistake",
  "Found a better price",
  "Shipping time is too long",
  "Other",
];

export default function OrderDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { colors, isDark } = useTheme();
  const { formatPrice } = useCurrency();
  const router = useRouter();
  const queryClient = useQueryClient();
  const { showToast } = useToast();

  const { data: response, isLoading } = useOrder(id);
  const order = response?.data;

  const [cancelModalVisible, setCancelModalVisible] = React.useState(false);
  const [cancelReason, setCancelReason] = React.useState("");
  const [cancelDescription, setCancelDescription] = React.useState("");
  const [cancelling, setCancelling] = React.useState(false);

  const [cancellationPreview, setCancellationPreview] = React.useState<{
    fee: number;
    currency: string;
    deductsFee: boolean;
    refundAmount: number;
  } | null>(null);
  const [checkingFee, setCheckingFee] = React.useState(false);

  const handleCancelPress = async () => {
    setCancelModalVisible(true);
    setCancelReason("");
    setCancelDescription("");
    setCancellationPreview(null);
    setCheckingFee(true);

    try {
      const res = await orderApi.getCancellationFee(order!.id);
      if (res.success) {
        setCancellationPreview(res.data);
      }
    } catch (e) {
      console.error("Failed to check cancellation fee", e);
    } finally {
      setCheckingFee(false);
    }
  };

  const submitCancelOrder = async () => {
    if (!cancelReason) {
      showToast("Please select a reason for cancellation", "error");
      return;
    }

    setCancelling(true);
    try {
      const finalReason = cancelDescription
        ? `${cancelReason}: ${cancelDescription}`
        : cancelReason;

      await orderApi.cancelOrder(order!.id, finalReason);
      await queryClient.invalidateQueries({ queryKey: ["order", id] });
      await queryClient.invalidateQueries({ queryKey: ["orders"] }); // Refresh list too

      setCancelModalVisible(false);
      showToast("Order has been cancelled successfully", "success");
    } catch (error: any) {
      showToast(error.message || "Failed to cancel order", "error");
    } finally {
      setCancelling(false);
    }
  };

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

  const statusColor = getStatusColor(order.status, colors);
  const canReview =
    order.status === "completed" || order.status === "delivered";

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: colors.background }]}
      edges={["top"]}
    >
      {/* Header */}
      <View style={[styles.header, { borderBottomColor: colors.border }]}>
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
              Order #{order.id.slice(-8).toUpperCase()}
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

          {(order.status === "delivered" || order.status === "completed") && (
            <TouchableOpacity
              style={[styles.returnButton, { borderColor: colors.border }]}
              onPress={() =>
                router.push(`/(screens)/return-request?orderId=${order.id}`)
              }
            >
              <Ionicons
                name="return-down-back-outline"
                size={16}
                color={colors.text}
              />
              <Text style={[styles.returnButtonText, { color: colors.text }]}>
                Return Items
              </Text>
            </TouchableOpacity>
          )}

          {(order.status === "pending" || order.status === "processing") && (
            <TouchableOpacity
              style={[styles.cancelButton, { borderColor: "#ef4444" }]}
              onPress={handleCancelPress}
            >
              <Ionicons name="close-circle-outline" size={16} color="#ef4444" />
              <Text style={[styles.cancelButtonText, { color: "#ef4444" }]}>
                Cancel Order
              </Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Order Status Timeline */}
        <OrderTimeline order={order} />

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
              <TouchableOpacity
                style={styles.itemContent}
                onPress={() =>
                  router.push(`/(screens)/product/${item.product.id}`)
                }
                activeOpacity={0.7}
              >
                <Image
                  source={{
                    uri: item.displayImage || "",
                  }}
                  style={[
                    styles.itemImage,
                    { backgroundColor: colors.background },
                  ]}
                />
                <View style={styles.itemDetails}>
                  <Text style={[styles.itemBrand, { color: colors.muted }]}>
                    {item.product.brand?.name}
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
                      {formatPrice(item.price, order.currency)}
                    </Text>
                  </View>
                </View>
              </TouchableOpacity>

              {canReview && (
                <TouchableOpacity
                  style={[
                    styles.reviewButton,
                    { backgroundColor: colors.primary },
                  ]}
                  onPress={() =>
                    router.push(
                      `/(screens)/product/${item.product.id}?openReview=true`
                    )
                  }
                  activeOpacity={0.8}
                >
                  <Ionicons
                    name="star-outline"
                    size={16}
                    color={colors.secondary}
                  />
                  <Text
                    style={[
                      styles.reviewButtonText,
                      { color: colors.secondary },
                    ]}
                  >
                    Write Review
                  </Text>
                </TouchableOpacity>
              )}
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
              Original Subtotal
            </Text>
            <Text style={[styles.summaryValue, { color: colors.text }]}>
              {formatPrice(
                order.items.reduce(
                  (acc: number, item: any) => acc + item.price * item.quantity,
                  0
                ),
                order.currency
              )}
            </Text>
          </View>

          {order.tierDiscount ? (
            <View style={styles.summaryRow}>
              <Text style={[styles.summaryLabel, { color: "#4CAF50" }]}>
                Loyalty Discount
              </Text>
              <Text style={[styles.summaryValue, { color: "#4CAF50" }]}>
                -{formatPrice(order.tierDiscount, order.currency)}
              </Text>
            </View>
          ) : null}

          {order.discountAmount ? (
            <View style={styles.summaryRow}>
              <Text style={[styles.summaryLabel, { color: colors.primary }]}>
                Coupon Discount{" "}
                {order.discountCode ? `(${order.discountCode})` : ""}
              </Text>
              <Text style={[styles.summaryValue, { color: colors.primary }]}>
                -{formatPrice(order.discountAmount, order.currency)}
              </Text>
            </View>
          ) : null}

          {order.pointsUsed > 0 && (
            <View style={styles.summaryRow}>
              <Text style={[styles.summaryLabel, { color: colors.primary }]}>
                Points Redemption
              </Text>
              <Text style={[styles.summaryValue, { color: colors.primary }]}>
                -{formatPrice(order.pointsUsed * 0.01, order.currency)}
              </Text>
            </View>
          )}

          {order.pointsEarned > 0 && (
            <View style={styles.summaryRow}>
              <Text style={[styles.summaryLabel, { color: "#4CAF50" }]}>
                Points Earned
              </Text>
              <Text style={[styles.summaryValue, { color: "#4CAF50" }]}>
                +{order.pointsEarned} pts
              </Text>
            </View>
          )}

          <View style={[styles.divider, { backgroundColor: colors.border }]} />

          <View style={styles.summaryRow}>
            <Text style={[styles.totalLabel, { color: colors.text }]}>
              Total
            </Text>
            <Text style={[styles.totalAmount, { color: colors.text }]}>
              {formatPrice(order.total, order.currency)}
            </Text>
          </View>

          {order.paymentMethod && (
            <View
              style={[
                styles.paymentMethodContainer,
                { borderTopColor: colors.border },
              ]}
            >
              <Ionicons
                name={
                  order.paymentMethod === "card"
                    ? "card-outline"
                    : "cash-outline"
                }
                size={20}
                color={colors.muted}
              />
              <Text style={[styles.paymentMethodText, { color: colors.muted }]}>
                {order.paymentMethod === "card"
                  ? "Credit/Debit Card"
                  : "Cash on Delivery"}
              </Text>
            </View>
          )}
        </View>
      </ScrollView>

      {/* Cancel Order Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={cancelModalVisible}
        onRequestClose={() => setCancelModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View
            style={[styles.modalContent, { backgroundColor: colors.surface }]}
          >
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: colors.text }]}>
                Cancel Order
              </Text>
              <TouchableOpacity onPress={() => setCancelModalVisible(false)}>
                <Ionicons name="close" size={24} color={colors.text} />
              </TouchableOpacity>
            </View>

            <ScrollView contentContainerStyle={{ paddingBottom: 10 }}>
              <Text style={[styles.modalSubtitle, { color: colors.muted }]}>
                Please select a reason for cancellation:
              </Text>

              <View style={styles.reasonsList}>
                {CANCEL_REASONS.map((reason) => (
                  <TouchableOpacity
                    key={reason}
                    style={[
                      styles.reasonOption,
                      {
                        backgroundColor:
                          cancelReason === reason
                            ? colors.primary
                            : "transparent",
                        borderColor: colors.border,
                        borderWidth: cancelReason === reason ? 0 : 1,
                      },
                    ]}
                    onPress={() => setCancelReason(reason)}
                  >
                    <Text
                      style={{
                        color:
                          cancelReason === reason
                            ? isDark
                              ? "#000000"
                              : "#FFFFFF"
                            : colors.text,
                        fontWeight: "500",
                      }}
                    >
                      {reason}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              <Text style={[styles.modalLabel, { color: colors.text }]}>
                Additional Comments (Optional)
              </Text>
              <TextInput
                style={[
                  styles.modalInput,
                  {
                    backgroundColor: colors.secondary,
                    color: colors.text,
                    borderColor: colors.border,
                  },
                ]}
                placeholder="Any additional details..."
                placeholderTextColor={colors.muted}
                multiline
                numberOfLines={3}
                value={cancelDescription}
                onChangeText={setCancelDescription}
              />

              {/* Fee Information / Warning */}
              {checkingFee ? (
                <View style={{ padding: 20, alignItems: "center" }}>
                  <Text style={{ color: colors.muted }}>
                    Calculating refund amount...
                  </Text>
                </View>
              ) : cancellationPreview ? (
                cancellationPreview.deductsFee &&
                cancellationPreview.fee > 0 ? (
                  <View
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      backgroundColor: isDark ? "#422006" : "#FEF3C7",
                      padding: 12,
                      borderRadius: 12,
                      marginVertical: 16,
                      gap: 12,
                    }}
                  >
                    <Ionicons
                      name="warning-outline"
                      size={24}
                      color={isDark ? "#FCD34D" : "#D97706"}
                    />
                    <Text
                      style={{
                        flex: 1,
                        fontSize: 12,
                        color: isDark ? "#FCD34D" : "#B45309",
                      }}
                    >
                      <Text style={{ fontWeight: "700" }}>Note:</Text> A
                      transaction processing fee of{" "}
                      <Text style={{ fontWeight: "700" }}>
                        {(cancellationPreview.fee / 100).toFixed(2)}{" "}
                        {cancellationPreview.currency.toUpperCase()}
                      </Text>{" "}
                      will be deducted from your refund.
                    </Text>
                  </View>
                ) : (
                  <View
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      backgroundColor: isDark ? "#064e3b" : "#d1fae5",
                      padding: 12,
                      borderRadius: 12,
                      marginVertical: 16,
                      gap: 12,
                    }}
                  >
                    <Ionicons
                      name="checkmark-circle-outline"
                      size={24}
                      color={isDark ? "#34d399" : "#059669"}
                    />
                    <Text
                      style={{
                        flex: 1,
                        fontSize: 12,
                        color: isDark ? "#34d399" : "#059669",
                      }}
                    >
                      You will receive a{" "}
                      <Text style={{ fontWeight: "700" }}>FULL REFUND</Text> to
                      your original payment method.
                    </Text>
                  </View>
                )
              ) : null}

              <TouchableOpacity
                style={[
                  styles.confirmCancelBtn,
                  {
                    backgroundColor: "#ef4444",
                    opacity: !cancelReason || checkingFee ? 0.5 : 1,
                  },
                ]}
                onPress={submitCancelOrder}
                disabled={!cancelReason || cancelling || checkingFee}
              >
                <Text style={styles.confirmCancelText}>
                  {cancelling ? "Cancelling..." : "Confirm Cancellation"}
                </Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>
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
  content: {
    padding: 20,
  },
  section: {
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
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
    marginBottom: 12,
  },
  orderId: {
    fontSize: 18,
    fontWeight: "800",
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  statusText: {
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 0.5,
  },
  orderDate: {
    fontSize: 13,
  },
  returnButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    marginTop: 16,
    paddingVertical: 10,
    borderWidth: 1,
    borderRadius: 8,
  },
  returnButtonText: {
    fontSize: 13,
    fontWeight: "600",
  },
  cancelButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    marginTop: 16,
    paddingVertical: 10,
    borderWidth: 1,
    borderRadius: 8,
  },
  cancelButtonText: {
    fontSize: 13,
    fontWeight: "600",
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "700",
    marginBottom: 16,
  },
  addressContainer: {
    flexDirection: "row",
    gap: 12,
  },
  iconBox: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  addressTextContainer: {
    flex: 1,
  },
  addressName: {
    fontSize: 15,
    fontWeight: "700",
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
    flexDirection: "column",
    paddingVertical: 12,
  },
  itemContent: {
    flexDirection: "row",
  },
  itemImage: {
    width: 60,
    height: 80,
    borderRadius: 8,
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
  reviewButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginTop: 12,
  },
  reviewButtonText: {
    fontSize: 13,
    fontWeight: "600",
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
  paymentMethodContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
  },
  paymentMethodText: {
    fontSize: 13,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "flex-end",
  },
  modalContent: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    minHeight: 400,
    paddingBottom: 40,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "700",
  },
  modalSubtitle: {
    fontSize: 14,
    marginBottom: 16,
  },
  reasonsList: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    marginBottom: 24,
  },
  reasonOption: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
  },
  modalLabel: {
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 8,
  },
  modalInput: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 12,
    height: 80,
    textAlignVertical: "top",
    marginBottom: 24,
  },
  confirmCancelBtn: {
    height: 50,
    borderRadius: 25,
    alignItems: "center",
    justifyContent: "center",
  },
  confirmCancelText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "700",
  },
});
