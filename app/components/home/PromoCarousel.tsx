import { useAvailableDiscounts, useClaimDiscount } from "@/app/api/discounts";
import { useProfile } from "@/app/api/users";
import { useAuth } from "@/app/context/auth-context";
import { useCurrency } from "@/app/context/currency-context";
import { useTheme } from "@/app/context/theme-context";
import { useToast } from "@/app/context/toast-context";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import React, { useMemo } from "react";
import {
  ActivityIndicator,
  Clipboard,
  Dimensions,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

const { width } = Dimensions.get("window");

export const PromoCarousel = () => {
  const { colors, isDark } = useTheme();
  const { showToast } = useToast();
  const { formatPrice } = useCurrency();
  const { data: discountsResponse, isLoading: loadingDiscounts } =
    useAvailableDiscounts();
  const { userToken } = useAuth();
  const { data: profileResponse, isLoading: loadingProfile } = useProfile({
    enabled: !!userToken,
  });
  const claimMutation = useClaimDiscount();

  const isNewUser = useMemo(() => {
    if (!profileResponse?.data) return false;
    const { totalOrders, createdAt } = profileResponse.data;
    if (totalOrders !== 0) return false;
    if (!createdAt) return false;

    const accountAgeInDays =
      (new Date().getTime() - new Date(createdAt).getTime()) /
      (1000 * 60 * 60 * 24);
    return accountAgeInDays <= 7;
  }, [profileResponse]);

  const filteredDiscounts = useMemo(() => {
    const discounts = discountsResponse?.data || [];
    return discounts.filter((d) => {
      // Don't show new user coupons in carousel if not a new user
      if (d.isNewUserOnly) return isNewUser;
      return true;
    });
  }, [discountsResponse, isNewUser]);

  const isLoading = loadingDiscounts || (userToken && loadingProfile);

  if (isLoading || filteredDiscounts.length === 0) return null;

  const handleClaimCode = (
    discountId: string,
    code: string,
    isClaimed?: boolean
  ) => {
    if (isClaimed) {
      Clipboard.setString(code);
      showToast("Coupon code copied to clipboard", "success");
      return;
    }

    if (!userToken) {
      showToast("Please login to claim this discount", "error");
      return;
    }

    claimMutation.mutate(discountId, {
      onSuccess: () => {
        showToast(`Coupon "${code}" added to your wallet!`, "success");
      },
      onError: (err: any) => {
        showToast(
          err.response?.data?.error || "Failed to claim coupon",
          "error"
        );
      },
    });
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: colors.text }]}>
          AVAILABLE OFFERS
        </Text>
      </View>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        snapToInterval={width * 0.7 + 16}
        decelerationRate="fast"
      >
        {filteredDiscounts.map((discount) => {
          let themeColor =
            discount.themeColor || (isDark ? "#BB86FC" : "#A855F7");

          // Safety check for black colors in Dark Mode
          if (
            isDark &&
            (themeColor === "#000000" || themeColor.toLowerCase() === "#000")
          ) {
            themeColor = "#BB86FC"; // Fallback to vibrant purple
          }

          const iconName = (discount.iconName as any) || "diamond";

          return (
            <TouchableOpacity
              key={discount.id}
              activeOpacity={discount.isClaimed ? 0.7 : 0.9}
              onPress={() =>
                handleClaimCode(discount.id, discount.code, discount.isClaimed)
              }
              disabled={claimMutation.isPending}
            >
              <View
                style={[
                  styles.card,
                  {
                    backgroundColor: colors.card,
                    borderColor: "transparent",
                    borderWidth: 0,
                    elevation: 10,
                    shadowColor: themeColor,
                    shadowOffset: { width: 0, height: 4 },
                    shadowOpacity: 0.3,
                    shadowRadius: 8,
                  },
                ]}
              >
                <LinearGradient
                  colors={
                    isDark
                      ? [`${themeColor}33`, `${themeColor}11`, colors.card]
                      : [`${themeColor}15`, `${themeColor}05`, colors.card]
                  }
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={[StyleSheet.absoluteFill, { borderRadius: 12 }]}
                />

                {/* Background Large Icon Decorator */}
                <View style={styles.backgroundDecorator}>
                  <Ionicons
                    name={iconName}
                    size={120}
                    color={isDark ? `${themeColor}15` : `${themeColor}08`}
                  />
                </View>

                <View style={styles.cardContent}>
                  <View style={styles.cardHeader}>
                    <View
                      style={[
                        styles.codeBadge,
                        {
                          backgroundColor: discount.isClaimed
                            ? colors.muted
                            : themeColor,
                        },
                      ]}
                    >
                      <Text
                        style={[
                          styles.codeText,
                          {
                            color: "#FFF",
                          },
                        ]}
                      >
                        {discount.code}
                      </Text>
                      {!discount.isClaimed && (
                        <Ionicons
                          name={iconName}
                          size={16}
                          color="#FFF"
                          style={{ marginLeft: 6 }}
                        />
                      )}
                    </View>
                    {discount.isClaimed ? (
                      <Ionicons
                        name="checkmark-circle"
                        size={22}
                        color="#4CAF50"
                      />
                    ) : (
                      <View
                        style={[styles.claimBadge, { borderColor: themeColor }]}
                      >
                        <Text
                          style={[styles.claimBadgeText, { color: themeColor }]}
                        >
                          CLAIM
                        </Text>
                      </View>
                    )}
                  </View>

                  <Text
                    style={[styles.description, { color: colors.text }]}
                    numberOfLines={2}
                  >
                    {discount.description ||
                      (() => {
                        if (discount.type === "percentage") {
                          return `Get ${discount.value}% OFF on all items`;
                        }
                        const amount = formatPrice(
                          discount.value,
                          discount.currency
                        );
                        return `Save ${amount} on your order`;
                      })()}
                  </Text>

                  <View>
                    {discount.minPurchase ? (
                      <Text
                        style={[styles.minPurchase, { color: colors.muted }]}
                      >
                        Min. Order:{" "}
                        {formatPrice(discount.minPurchase, discount.currency)}
                      </Text>
                    ) : null}

                    <View style={styles.cardFooter}>
                      <Text
                        style={[
                          styles.tapText,
                          {
                            color: discount.isClaimed
                              ? "#4CAF50"
                              : colors.muted,
                          },
                        ]}
                      >
                        {discount.isClaimed
                          ? "ALREADY CLAIMED"
                          : "TAP TO CLAIM"}
                      </Text>
                      {claimMutation.isPending && (
                        <ActivityIndicator
                          size="small"
                          color={colors.primary}
                        />
                      )}
                    </View>
                  </View>
                </View>
              </View>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 24,
  },
  header: {
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  title: {
    fontSize: 14,
    fontWeight: "700",
    letterSpacing: 2,
  },
  scrollContent: {
    paddingHorizontal: 12,
    paddingBottom: 24,
    paddingTop: 4,
  },
  card: {
    width: width * 0.7,
    marginHorizontal: 8,
    borderRadius: 12,
    borderWidth: 1,
    height: 160,
    overflow: "hidden",
    position: "relative",
  },
  backgroundDecorator: {
    position: "absolute",
    right: -20,
    bottom: -20,
    opacity: 0.5,
  },
  cardContent: {
    flex: 1,
    padding: 16,
    justifyContent: "space-between",
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  codeBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
    flexDirection: "row",
    alignItems: "center",
    elevation: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  codeText: {
    fontSize: 13,
    fontWeight: "900",
    letterSpacing: 1,
  },
  claimBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
    borderWidth: 1.5,
    backgroundColor: "transparent",
  },
  claimBadgeText: {
    fontSize: 11,
    fontWeight: "900",
  },
  description: {
    fontSize: 16,
    fontWeight: "700",
    lineHeight: 22,
    marginTop: 8,
  },
  minPurchase: {
    fontSize: 12,
    marginTop: 4,
    fontWeight: "600",
  },
  cardFooter: {
    marginTop: 10,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderColor: "rgba(0,0,0,0.1)",
    paddingTop: 8,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  tapText: {
    fontSize: 10,
    fontWeight: "900",
    letterSpacing: 1,
  },
});
