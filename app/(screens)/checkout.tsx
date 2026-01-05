import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useApplyDiscount } from "../api/cart";
import { useAvailableDiscounts } from "../api/discounts";
import { useCreateOrder } from "../api/orders";
import { useSettings } from "../api/shop";
import { useAddresses, useProfile } from "../api/users";
import { useCart } from "../context/cart-context";
import { useCurrency } from "../context/currency-context";
import { useTheme } from "../context/theme-context";
import { useToast } from "../context/toast-context";

export default function CheckoutScreen() {
  const router = useRouter();
  const { colors, isDark } = useTheme();
  const { formatPrice, currency, rates } = useCurrency();
  const insets = useSafeAreaInsets();
  const { cart, refreshCart } = useCart();
  const { showToast } = useToast();

  const { data: addressesResponse, isLoading: loadingAddress } = useAddresses();
  const createOrderMutation = useCreateOrder();

  const [selectedAddressId, setSelectedAddressId] = useState<string | null>(
    null
  );
  // const [paymentMethod, setPaymentMethod] = useState<"cod">("cod"); // No longer needed here
  const [promoCode, setPromoCode] = useState("");

  const { data: profileResponse } = useProfile();
  const { data: settingsResponse } = useSettings();
  const applyDiscountMutation = useApplyDiscount();
  const { data: discountsResponse } = useAvailableDiscounts();
  const availableDiscounts = discountsResponse?.data || [];
  const settings = settingsResponse?.data;
  const user = profileResponse?.data;
  const userPoints = user?.loyaltyPoints || 0;

  const pointsMultipliers = {
    BRONZE: 1,
    SILVER: 1.2,
    GOLD: 1.5,
    PLATINUM: 2,
  };

  const currentTier = user?.membershipTier || "BRONZE";
  const multiplier =
    pointsMultipliers[currentTier as keyof typeof pointsMultipliers] || 1;
  const potentialPoints = Math.floor(
    (cart?.totalWithTax || 0) * (settings?.pointsPerCurrency || 1) * multiplier
  );

  const [usePoints, setUsePoints] = useState(false);

  const isNewUser = React.useMemo(() => {
    if (!profileResponse?.data) return false;
    const { totalOrders, createdAt } = profileResponse.data;
    if (totalOrders !== 0) return false;
    if (!createdAt) return false;

    const accountAgeInDays =
      (new Date().getTime() - new Date(createdAt).getTime()) /
      (1000 * 60 * 60 * 24);
    return accountAgeInDays <= 7;
  }, [profileResponse]);

  const newUserDiscount = availableDiscounts.find(
    (d) => d.isNewUserOnly && d.active
  );
  const newUserCode = newUserDiscount?.code;

  const appliedDiscount = availableDiscounts.find(
    (d: any) => d.code === cart?.discountCode
  );

  // Auto-select default address
  React.useEffect(() => {
    if (addressesResponse?.data && !selectedAddressId) {
      const defaultAddr = addressesResponse.data.find((a) => a.isDefault);
      if (defaultAddr) setSelectedAddressId(defaultAddr.id);
      else if (addressesResponse.data.length > 0)
        setSelectedAddressId(addressesResponse.data[0].id);
    }
  }, [addressesResponse, selectedAddressId]);

  const handleApplyDiscount = () => {
    if (!promoCode || !cart?.id) return;
    applyDiscountMutation.mutate(
      { code: promoCode, cartId: cart.id, currency },
      {
        onSuccess: () => {
          showToast("Discount applied successfully!", "success");
          setPromoCode("");
        },
        onError: (err: any) => {
          showToast(
            err.response?.data?.error || "Invalid discount code",
            "error"
          );
        },
      }
    );
  };

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
        address: selectedAddressId,
        // paymentMethod: "cod", // Defer payment selection
        orderId: cart.id,
        currency: currency,
        usePoints: usePoints ? userPoints : 0,
      },
      {
        onSuccess: (response: any) => {
          refreshCart();
          const orderId = response?.data?.id || response?.data?.order?.id;
          if (orderId) {
            // Navigate to Payment Method Selection Screen
            router.replace({
              pathname: "/(screens)/checkout/payment",
              params: { orderId },
            });
          } else {
            router.replace("/(tabs)");
          }
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
        {/* Shipping Address */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            SHIPPING ADDRESS
          </Text>
          {loadingAddress ? (
            <ActivityIndicator color={colors.primary} />
          ) : (
            <>
              {addresses.map((addr) => (
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
                      <Text
                        style={[styles.addressName, { color: colors.text }]}
                      >
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
                          <Text
                            style={[styles.typeText, { color: colors.text }]}
                          >
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
              ))}
              <TouchableOpacity
                style={[
                  styles.addAddressButton,
                  { borderColor: colors.border, marginTop: 8 },
                ]}
                onPress={() => router.push("/(screens)/address/new")}
              >
                <Text style={{ color: colors.text }}>+ Add New Address</Text>
              </TouchableOpacity>
            </>
          )}
        </View>

        {/* Payment Method - Removed (Handled in next screen) */}

        {isNewUser && !cart.discountCode && newUserCode && (
          <View style={styles.section}>
            <TouchableOpacity
              onPress={() => {
                setPromoCode(newUserCode);
                showToast(
                  `Code ${newUserCode} copied! Tap Apply to use.`,
                  "success"
                );
              }}
              activeOpacity={0.8}
            >
              <LinearGradient
                colors={["#FFD700", "#FFA500"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.newUserBanner}
              >
                <View style={styles.bannerIcon}>
                  <Ionicons name="gift" size={24} color="#000" />
                </View>
                <View style={styles.bannerTextContainer}>
                  <Text style={styles.bannerTitle}>NEW USER EXCLUSIVE</Text>
                  <Text style={styles.bannerSubtitle}>
                    Get 25% OFF your first order!
                  </Text>
                  <View style={styles.bannerBadge}>
                    <Text style={styles.bannerBadgeText}>
                      USE: {newUserCode}
                    </Text>
                    <Ionicons
                      name="copy-outline"
                      size={14}
                      color="#000"
                      style={{ marginLeft: 4 }}
                    />
                  </View>
                </View>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        )}

        {/* Promo Code Section */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            DISCOUNT CODE
          </Text>
          <View style={styles.promoContainer}>
            <TextInput
              style={[
                styles.promoInput,
                {
                  color: colors.text,
                  borderColor: colors.border,
                  backgroundColor: colors.surface,
                },
              ]}
              placeholder="Enter code"
              placeholderTextColor={colors.muted}
              value={promoCode}
              onChangeText={setPromoCode}
              autoCapitalize="characters"
            />
            <TouchableOpacity
              style={[
                styles.applyButton,
                { backgroundColor: colors.primary },
                (!promoCode || applyDiscountMutation.isPending) && {
                  opacity: 0.5,
                },
              ]}
              onPress={handleApplyDiscount}
              disabled={!promoCode || applyDiscountMutation.isPending}
            >
              {applyDiscountMutation.isPending ? (
                <ActivityIndicator
                  size="small"
                  color={isDark ? "#000" : "#FFF"}
                />
              ) : (
                <Text
                  style={[
                    styles.applyButtonText,
                    { color: isDark ? "#000" : "#FFF" },
                  ]}
                >
                  APPLY
                </Text>
              )}
            </TouchableOpacity>
          </View>
          {cart.discountCode &&
            (() => {
              let appliedColor =
                appliedDiscount?.themeColor || (isDark ? "#BB86FC" : "#A855F7");
              if (
                isDark &&
                (appliedColor === "#000000" ||
                  appliedColor.toLowerCase() === "#000")
              ) {
                appliedColor = "#BB86FC";
              }
              return (
                <View style={styles.appliedPromo}>
                  <Ionicons
                    name={(appliedDiscount?.iconName as any) || "diamond"}
                    size={16}
                    color={appliedColor}
                  />
                  <Text style={[styles.appliedText, { color: appliedColor }]}>
                    Code {cart.discountCode} applied
                  </Text>
                </View>
              );
            })()}

          {availableDiscounts.length > 0 && (
            <View style={styles.availableList}>
              <Text style={[styles.availableTitle, { color: colors.muted }]}>
                MY COUPONS
              </Text>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                style={styles.availableScroll}
              >
                {availableDiscounts
                  .filter(
                    (d: any) =>
                      d.isPromotional || d.isNewUserOnly || d.isClaimed
                  )
                  .map((d: any) => {
                    const subtotal = cart.subtotal ?? 0;
                    const isDisabled =
                      d.minPurchase && subtotal < d.minPurchase;

                    let themeColor =
                      d.themeColor || (isDark ? "#BB86FC" : "#A855F7");
                    if (
                      isDark &&
                      (themeColor === "#000000" ||
                        themeColor.toLowerCase() === "#000")
                    ) {
                      themeColor = "#BB86FC";
                    }

                    return (
                      <TouchableOpacity
                        key={d.id}
                        style={[
                          styles.miniCoupon,
                          {
                            borderColor: themeColor,
                          },
                          isDisabled && { opacity: 0.4 },
                        ]}
                        onPress={() => setPromoCode(d.code)}
                        activeOpacity={0.7}
                      >
                        <View
                          style={{
                            flexDirection: "row",
                            justifyContent: "space-between",
                            alignItems: "center",
                            width: "100%",
                          }}
                        >
                          <View
                            style={{
                              flexDirection: "row",
                              alignItems: "center",
                            }}
                          >
                            <Text
                              style={[
                                styles.miniCouponCode,
                                {
                                  color: themeColor,
                                },
                              ]}
                            >
                              {d.code}
                            </Text>
                            <Ionicons
                              name={(d.iconName as any) || "diamond"}
                              size={14}
                              color={themeColor}
                              style={{ marginLeft: 4 }}
                            />
                          </View>
                        </View>

                        <Text
                          style={[
                            styles.miniCouponVal,
                            {
                              color:
                                themeColor || (isDark ? "#FFF" : colors.muted),
                            },
                          ]}
                        >
                          {d.type === "percentage"
                            ? `${d.value}%`
                            : `$${d.value}`}{" "}
                          OFF
                        </Text>

                        {d.minPurchase && (
                          <Text
                            style={[
                              styles.miniCouponInfo,
                              {
                                color: isDisabled ? "#FF3B30" : colors.muted,
                              },
                            ]}
                          >
                            Min: {formatPrice(d.minPurchase)}
                          </Text>
                        )}
                      </TouchableOpacity>
                    );
                  })}
              </ScrollView>
            </View>
          )}
        </View>

        {/* Loyalty Points Section */}
        {settings?.loyaltyEnabled && userPoints > 0 && (
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>
              LOYALTY POINTS
            </Text>
            <TouchableOpacity
              style={[
                styles.loyaltyCard,
                {
                  backgroundColor: colors.surface,
                  borderColor: usePoints ? colors.primary : colors.border,
                },
              ]}
              onPress={() => setUsePoints(!usePoints)}
            >
              <View style={styles.loyaltyInfo}>
                <Ionicons
                  name="star"
                  size={20}
                  color={usePoints ? colors.primary : colors.muted}
                />
                <View style={{ marginLeft: 12 }}>
                  <Text style={[styles.loyaltyTitle, { color: colors.text }]}>
                    Use {userPoints} points
                  </Text>
                  <Text
                    style={[styles.loyaltySubtitle, { color: colors.muted }]}
                  >
                    Save{" "}
                    {formatPrice(
                      Math.min(
                        userPoints * (settings?.redemptionRate || 0.01),
                        (cart.subtotal ?? 0) - (cart.discountAmount ?? 0)
                      )
                    )}{" "}
                    on this order
                  </Text>
                </View>
              </View>
              <Switch
                value={usePoints}
                onValueChange={setUsePoints}
                trackColor={{ true: colors.primary }}
              />
            </TouchableOpacity>
          </View>
        )}

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
                source={{
                  uri:
                    item.displayImage ||
                    item.variant?.images?.[0] ||
                    item.product?.coverImage ||
                    item.product?.images?.[0] ||
                    "",
                }}
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
          <Text style={{ color: colors.muted, fontSize: 12, marginBottom: 8 }}>
            (Items will be reserved for 10 minutes upon proceeding)
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

            {cart.tierDiscount && cart.tierDiscount > 0 ? (
              <View style={styles.summaryRow}>
                <Text style={{ color: "#4CAF50" }}>
                  Loyalty Discount (
                  {((cart.tierDiscountRate || 0) * 100).toFixed(0)}%)
                </Text>
                <Text style={{ color: "#4CAF50" }}>
                  -{formatPrice(cart.tierDiscount)}
                </Text>
              </View>
            ) : null}

            {cart.discountAmount && cart.discountAmount > 0 ? (
              <View style={styles.summaryRow}>
                <Text style={{ color: colors.primary }}>
                  Coupon Discount{" "}
                  {cart.discountCode ? `(${cart.discountCode})` : ""}
                </Text>
                <Text style={{ color: colors.primary }}>
                  -{formatPrice(cart.discountAmount)}
                </Text>
              </View>
            ) : null}
            {usePoints && settings?.loyaltyEnabled && (
              <View style={styles.summaryRow}>
                <Text style={{ color: colors.primary }}>Points Discount</Text>
                <Text style={{ color: colors.primary }}>
                  -
                  {formatPrice(
                    Math.min(
                      userPoints * (settings?.redemptionRate || 0.01),
                      (cart.subtotal ?? 0) -
                        (cart.discountAmount ?? 0) -
                        (cart.tierDiscount ?? 0)
                    )
                  )}
                </Text>
              </View>
            )}
            {settings?.loyaltyEnabled && potentialPoints > 0 && (
              <View style={styles.summaryRow}>
                <Text style={{ color: "#4CAF50" }}>Points to be earned</Text>
                <View style={{ alignItems: "flex-end" }}>
                  <Text style={{ color: "#4CAF50", fontWeight: "700" }}>
                    +{potentialPoints.toLocaleString()} pts
                  </Text>
                  {multiplier > 1 && (
                    <Text style={{ color: colors.muted, fontSize: 10 }}>
                      ({currentTier} Tier {multiplier}x multiplier)
                    </Text>
                  )}
                </View>
              </View>
            )}
            <View
              style={[styles.divider, { backgroundColor: colors.border }]}
            />
            <View style={styles.summaryRow}>
              <Text style={[styles.totalLabel, { color: colors.text }]}>
                Total
              </Text>
              <Text style={[styles.totalValue, { color: colors.text }]}>
                {formatPrice(
                  Math.max(
                    (cart.totalWithTax ?? 0) -
                      (usePoints
                        ? Math.min(
                            userPoints * (settings?.redemptionRate || 0.01),
                            (cart.subtotal ?? 0) -
                              (cart.discountAmount ?? 0) -
                              (cart.tierDiscount ?? 0)
                          )
                        : 0),
                    0
                  )
                )}
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
              CONTINUE TO PAYMENT
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
  promoContainer: {
    flexDirection: "row",
    gap: 12,
  },
  promoInput: {
    flex: 1,
    height: 48,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 16,
    fontSize: 14,
    fontWeight: "600",
  },
  applyButton: {
    width: 100,
    height: 48,
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
  },
  applyButtonText: {
    fontSize: 12,
    fontWeight: "700",
    letterSpacing: 1,
  },
  appliedPromo: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginTop: 8,
  },
  appliedText: {
    fontSize: 13,
    fontWeight: "600",
  },
  newUserBanner: {
    padding: 16,
    borderRadius: 12,
    flexDirection: "row",
    alignItems: "center",
    shadowColor: "#FFA500",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  bannerIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "rgba(255, 255, 255, 0.3)",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
  },
  bannerTextContainer: {
    flex: 1,
  },
  bannerTitle: {
    fontSize: 12,
    fontWeight: "800",
    color: "#000",
    letterSpacing: 1,
    marginBottom: 2,
  },
  bannerSubtitle: {
    fontSize: 14,
    color: "#000",
    opacity: 0.9,
    marginBottom: 8,
  },
  availableList: {
    marginTop: 16,
  },
  availableTitle: {
    fontSize: 10,
    fontWeight: "700",
    letterSpacing: 1,
    marginBottom: 8,
  },
  availableScroll: {
    marginLeft: -4,
  },
  miniCoupon: {
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderWidth: 1,
    borderRadius: 8,
    marginHorizontal: 4,
    alignItems: "flex-start",
    height: 70,
    justifyContent: "space-between",
  },
  miniCouponCode: {
    fontSize: 13,
    fontWeight: "800",
  },
  miniCouponVal: {
    fontSize: 11,
    fontWeight: "700",
  },
  miniCouponInfo: {
    fontSize: 9,
    fontWeight: "600",
  },
  bannerBadge: {
    alignSelf: "flex-start",
    backgroundColor: "rgba(0, 0, 0, 0.1)",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    flexDirection: "row",
    alignItems: "center",
  },
  bannerBadgeText: {
    fontSize: 11,
    fontWeight: "700",
    color: "#000",
  },
  loyaltyCard: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
  },
  loyaltyInfo: {
    flexDirection: "row",
    alignItems: "center",
  },
  loyaltyTitle: {
    fontSize: 14,
    fontWeight: "700",
  },
  loyaltySubtitle: {
    fontSize: 12,
    marginTop: 2,
  },
});
