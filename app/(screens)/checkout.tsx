import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useCreateOrder } from "../api/orders";
import { useAddresses } from "../api/users";
import { useCart } from "../context/cart-context";
import { useCurrency } from "../context/currency-context";
import { useTheme } from "../context/theme-context";
import { useToast } from "../context/toast-context";
import { getImageUrl } from "../lib/api-client";

export default function CheckoutScreen() {
  const router = useRouter();
  const { colors, isDark } = useTheme();
  const { formatPrice } = useCurrency();
  const insets = useSafeAreaInsets();
  const { cart, refreshCart } = useCart();
  const { showToast } = useToast();

  const { data: addressesResponse, isLoading: loadingAddress } = useAddresses();
  const createOrderMutation = useCreateOrder();

  const [selectedAddressId, setSelectedAddressId] = useState<string | null>(
    null
  );
  const [paymentMethod, setPaymentMethod] = useState<"cod">("cod");

  // Auto-select default address
  React.useEffect(() => {
    if (addressesResponse?.data && !selectedAddressId) {
      const defaultAddr = addressesResponse.data.find((a) => a.isDefault);
      if (defaultAddr) setSelectedAddressId(defaultAddr.id);
      else if (addressesResponse.data.length > 0)
        setSelectedAddressId(addressesResponse.data[0].id);
    }
  }, [addressesResponse, selectedAddressId]);

  const handlePlaceOrder = () => {
    if (!selectedAddressId) {
      showToast("Please select a delivery address", "error");
      return;
    }
    if (!cart?.id) {
      showToast("Cart is empty or not found", "error");
      return;
    }

    createOrderMutation.mutate(
      {
        addressId: selectedAddressId,
        paymentMethod: "cod",
        cartId: cart.id,
      },
      {
        onSuccess: () => {
          showToast("Order placed successfully!", "success");
          refreshCart(); // Refresh cart to reflect empty state
          router.replace("/(tabs)"); // Or to an Order Success screen
        },
        onError: (error: any) => {
          console.error("Order creation failed", error);
          showToast(error.message || "Failed to place order", "error");
        },
      }
    );
  };

  if (!cart || cart.items.length === 0) {
    return (
      <View
        style={[
          styles.container,
          {
            backgroundColor: colors.background,
            justifyContent: "center",
            alignItems: "center",
          },
        ]}
      >
        <Text style={[styles.emptyText, { color: colors.text }]}>
          Your bag is empty
        </Text>
        <TouchableOpacity
          onPress={() => router.back()}
          style={[styles.backButton, { borderColor: colors.border }]}
        >
          <Text style={{ color: colors.text }}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const addresses = addressesResponse?.data || [];

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View
        style={[
          styles.header,
          { paddingTop: insets.top, borderBottomColor: colors.border },
        ]}
      >
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.headerButton}
        >
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>
          CHECKOUT
        </Text>
        <View style={styles.headerButton} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {/* Contact Info (Read-only for now) */}
        {/* <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Contact</Text>
           <Text style={{color: colors.muted}}>{user?.email}</Text>
        </View> */}

        {/* Shipping Address */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            SHIPPING ADDRESS
          </Text>
          {loadingAddress ? (
            <ActivityIndicator color={colors.primary} />
          ) : addresses.length === 0 ? (
            <TouchableOpacity
              style={[styles.addAddressButton, { borderColor: colors.border }]}
              onPress={() => router.push("/(screens)/address/new")}
            >
              <Text style={{ color: colors.text }}>+ Add New Address</Text>
            </TouchableOpacity>
          ) : (
            addresses.map((addr) => (
              <TouchableOpacity
                key={addr.id}
                style={[
                  styles.addressCard,
                  {
                    borderColor:
                      selectedAddressId === addr.id
                        ? colors.primary
                        : colors.border,
                    backgroundColor: colors.surface,
                  },
                ]}
                onPress={() => setSelectedAddressId(addr.id)}
              >
                <View
                  style={[
                    styles.radioCircle,
                    {
                      borderColor:
                        selectedAddressId === addr.id
                          ? colors.primary
                          : colors.muted,
                    },
                  ]}
                >
                  {selectedAddressId === addr.id && (
                    <View
                      style={[
                        styles.selectedDot,
                        { backgroundColor: colors.primary },
                      ]}
                    />
                  )}
                </View>
                <View style={styles.addressInfo}>
                  <View style={styles.addressHeader}>
                    <Text style={[styles.addressName, { color: colors.text }]}>
                      {addr.name}
                    </Text>
                    {addr.type && (
                      <View
                        style={[
                          styles.typeBadge,
                          {
                            backgroundColor: colors.card,
                            borderColor: colors.border,
                          },
                        ]}
                      >
                        <Text style={[styles.typeText, { color: colors.text }]}>
                          {addr.type}
                        </Text>
                      </View>
                    )}
                  </View>
                  <Text style={[styles.addressText, { color: colors.muted }]}>
                    {addr.street}, {addr.city} {addr.zip}
                  </Text>
                  <Text style={[styles.addressText, { color: colors.muted }]}>
                    {addr.phone}
                  </Text>
                </View>
              </TouchableOpacity>
            ))
          )}
        </View>

        {/* Payment Method */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            PAYMENT METHOD
          </Text>
          <TouchableOpacity
            style={[
              styles.paymentOption,
              {
                borderColor: colors.primary,
                backgroundColor: colors.surface,
              },
            ]}
            disabled={true} // Only one option
          >
            <Ionicons name="cash-outline" size={24} color={colors.text} />
            <Text style={[styles.paymentText, { color: colors.text }]}>
              Cash on Delivery (COD)
            </Text>
            <Ionicons
              name="checkmark-circle"
              size={24}
              color={colors.primary}
            />
          </TouchableOpacity>
        </View>

        {/* Items Review */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            ITEMS
          </Text>
          {cart.items.map((item) => (
            <View
              key={item.id}
              style={[styles.itemRow, { borderBottomColor: colors.border }]}
            >
              <Image
                source={{ uri: getImageUrl(item.product?.images?.[0]) }}
                style={[styles.itemImage, { backgroundColor: colors.surface }]}
                contentFit="cover"
              />
              <View style={styles.itemDetails}>
                <Text
                  style={[styles.itemName, { color: colors.text }]}
                  numberOfLines={1}
                >
                  {item.product?.name}
                </Text>
                <Text style={[styles.itemVariant, { color: colors.muted }]}>
                  {item.variant?.name ? `Size: ${item.variant.name}  |  ` : ""}
                  Qty: {item.quantity}
                </Text>
              </View>
              <Text style={[styles.itemPrice, { color: colors.text }]}>
                {formatPrice(item.price * item.quantity)}
              </Text>
            </View>
          ))}
        </View>

        {/* Order Summary Brief */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            ORDER SUMMARY
          </Text>
          <View
            style={[styles.summaryCard, { backgroundColor: colors.surface }]}
          >
            <View style={styles.summaryRow}>
              <Text style={{ color: colors.muted }}>Subtotal</Text>
              <Text style={{ color: colors.text }}>
                {formatPrice(cart.subtotal ?? 0)}
              </Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={{ color: colors.muted }}>Shipping</Text>
              <Text style={{ color: colors.text }}>Free</Text>
            </View>
            <View
              style={[styles.divider, { backgroundColor: colors.border }]}
            />
            <View style={styles.summaryRow}>
              <Text style={[styles.totalLabel, { color: colors.text }]}>
                Total
              </Text>
              <Text style={[styles.totalValue, { color: colors.text }]}>
                {formatPrice(cart.totalWithTax ?? 0)}
              </Text>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Footer Action */}
      <LinearGradient
        colors={[
          isDark ? "rgba(0,0,0,0)" : "rgba(255,255,255,0)",
          isDark ? "rgba(0,0,0,0.8)" : "rgba(255,255,255,0.8)",
          colors.background,
        ]}
        locations={[0, 0.4, 1]}
        style={[
          styles.footer,
          {
            paddingBottom: insets.bottom + 16,
          },
        ]}
        pointerEvents="box-none"
      >
        <TouchableOpacity
          style={[
            styles.placeOrderButton,
            {
              backgroundColor: colors.primary,
              shadowColor: colors.primary,
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.3,
              shadowRadius: 8,
              elevation: 8,
            },
            createOrderMutation.isPending && { opacity: 0.7 },
          ]}
          onPress={handlePlaceOrder}
          disabled={createOrderMutation.isPending}
        >
          {createOrderMutation.isPending ? (
            <ActivityIndicator color={isDark ? "#000" : "#FFF"} />
          ) : (
            <Text
              style={[
                styles.placeOrderText,
                { color: isDark ? "#000" : "#FFF" },
              ]}
            >
              PLACE ORDER
            </Text>
          )}
        </TouchableOpacity>
      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
  },
  headerButton: {
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: "700",
    letterSpacing: 2,
  },
  content: {
    padding: 24,
    paddingBottom: 120,
  },
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: "700",
    letterSpacing: 1,
    marginBottom: 16,
    opacity: 0.8,
  },
  addressCard: {
    flexDirection: "row",
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 12,
    alignItems: "flex-start",
  },
  radioCircle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    marginRight: 12,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 2,
  },
  selectedDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  addressInfo: {
    flex: 1,
  },
  addressName: {
    fontWeight: "600",
    marginRight: 8,
  },
  addressHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 4,
  },
  typeBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    borderWidth: 1,
  },
  typeText: {
    fontSize: 10,
    fontWeight: "600",
    textTransform: "uppercase",
  },
  addressText: {
    fontSize: 13,
    lineHeight: 18,
  },
  addAddressButton: {
    padding: 16,
    borderWidth: 1,
    borderStyle: "dashed",
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  paymentOption: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
  },
  paymentText: {
    flex: 1,
    marginLeft: 12,
    fontWeight: "600",
  },
  summaryCard: {
    padding: 16,
    borderRadius: 12,
  },
  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  divider: {
    height: 1,
    marginVertical: 12,
  },
  totalLabel: {
    fontWeight: "700",
    fontSize: 16,
  },
  totalValue: {
    fontWeight: "700",
    fontSize: 18,
  },
  footer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 24,
    paddingTop: 32,
  },
  placeOrderButton: {
    height: 56,
    borderRadius: 28,
    justifyContent: "center",
    alignItems: "center",
  },
  placeOrderText: {
    color: "#FFF",
    fontWeight: "700",
    fontSize: 16,
    letterSpacing: 1,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 20,
  },
  backButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderWidth: 1,
    borderRadius: 24,
  },
  itemRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  itemImage: {
    width: 60,
    height: 60,
    borderRadius: 8,
    marginRight: 12,
  },
  itemDetails: {
    flex: 1,
  },
  itemName: {
    fontWeight: "600",
    fontSize: 14,
    marginBottom: 4,
  },
  itemVariant: {
    fontSize: 12,
  },
  itemPrice: {
    fontSize: 14,
    fontWeight: "600",
    marginLeft: 8,
  },
});
