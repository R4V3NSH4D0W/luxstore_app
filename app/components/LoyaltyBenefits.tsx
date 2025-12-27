import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { useSettings } from "../api/shop";
import { useCurrency } from "../context/currency-context";
import { useTheme } from "../context/theme-context";

type MembershipTier = "BRONZE" | "SILVER" | "GOLD" | "PLATINUM";

interface LoyaltyBenefitsProps {
  currentTier: MembershipTier;
  points: number;
}

const TIER_BENEFITS = {
  BRONZE: {
    pointsMultiplier: "1x",
    freeShipping: "No",
    discount: "0%",
    color: "#CD7F32",
    nextTier: "SILVER",
    nextThreshold: 1000,
  },
  SILVER: {
    pointsMultiplier: "1.2x",
    freeShipping: "Orders > $50",
    discount: "5%",
    color: "#C0C0C0",
    nextTier: "GOLD",
    nextThreshold: 5000,
  },
  GOLD: {
    pointsMultiplier: "1.5x",
    freeShipping: "All Orders",
    discount: "10%",
    color: "#FFD700",
    nextTier: "PLATINUM",
    nextThreshold: 10000,
  },
  PLATINUM: {
    pointsMultiplier: "2x",
    freeShipping: "All Orders",
    discount: "15%",
    color: "#E5E4E2",
    nextTier: null,
    nextThreshold: null,
  },
};

export default function LoyaltyBenefits({
  currentTier,
  points,
}: LoyaltyBenefitsProps) {
  const { colors, isDark } = useTheme();
  const { data: settingsResponse } = useSettings();
  const { formatPrice, symbol } = useCurrency();

  const settings = settingsResponse?.data;
  const benefits = TIER_BENEFITS[currentTier];

  const pointsPerCurrency = settings?.pointsPerCurrency || 1;
  const pointsToCurrency = settings?.redemptionRate || 0.01;
  const pointsPerOneUnit = Math.round(1 / pointsToCurrency);

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* How to Earn Section */}
      <View style={[styles.section, { backgroundColor: colors.card }]}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>
          💰 How to Earn Points
        </Text>
        <View style={styles.benefitItem}>
          <Ionicons name="cart-outline" size={20} color={colors.primary} />
          <Text style={[styles.benefitText, { color: colors.text }]}>
            Earn {Math.round(pointsPerCurrency)} points per {symbol}1 spent
          </Text>
        </View>
        <View style={styles.benefitItem}>
          <Ionicons name="gift-outline" size={20} color={colors.primary} />
          <Text style={[styles.benefitText, { color: colors.text }]}>
            Bonus points on special promotions
          </Text>
        </View>
        <View style={styles.benefitItem}>
          <Ionicons name="star-outline" size={20} color={colors.primary} />
          <Text style={[styles.benefitText, { color: colors.text }]}>
            Write reviews to earn extra points
          </Text>
        </View>
      </View>

      {/* How to Use Section */}
      <View style={[styles.section, { backgroundColor: colors.card }]}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>
          🎁 How to Use Points
        </Text>
        <View style={styles.benefitItem}>
          <Ionicons name="pricetag-outline" size={20} color={colors.primary} />
          <Text style={[styles.benefitText, { color: colors.text }]}>
            {pointsPerOneUnit} points = {symbol}1 discount
          </Text>
        </View>
        <View style={styles.benefitItem}>
          <Ionicons
            name="checkmark-circle-outline"
            size={20}
            color={colors.primary}
          />
          <Text style={[styles.benefitText, { color: colors.text }]}>
            Redeem at checkout
          </Text>
        </View>
        <View style={styles.benefitItem}>
          <Ionicons name="infinite-outline" size={20} color={colors.primary} />
          <Text style={[styles.benefitText, { color: colors.text }]}>
            Points never expire
          </Text>
        </View>
      </View>

      {/* Current Tier Benefits */}
      <View style={[styles.section, { backgroundColor: colors.card }]}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>
          ✨ Your {currentTier} Benefits
        </Text>
        <View style={styles.benefitItem}>
          <Ionicons name="flash-outline" size={20} color={benefits.color} />
          <Text style={[styles.benefitText, { color: colors.text }]}>
            Earn {benefits.pointsMultiplier} points on purchases
          </Text>
        </View>
        <View style={styles.benefitItem}>
          <Ionicons name="rocket-outline" size={20} color={benefits.color} />
          <Text style={[styles.benefitText, { color: colors.text }]}>
            Free shipping: {benefits.freeShipping}
          </Text>
        </View>
        <View style={styles.benefitItem}>
          <Ionicons
            name="trending-down-outline"
            size={20}
            color={benefits.color}
          />
          <Text style={[styles.benefitText, { color: colors.text }]}>
            {benefits.discount} extra discount on all items
          </Text>
        </View>
      </View>

      {/* All Tiers Comparison */}
      <View style={[styles.section, { backgroundColor: colors.card }]}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>
          🏆 Membership Tiers
        </Text>
        {Object.entries(TIER_BENEFITS).map(([tier, data]) => (
          <View
            key={tier}
            style={[
              styles.tierRow,
              currentTier === tier && {
                backgroundColor: isDark ? "#2A2A2A" : "#F5F5F5",
              },
            ]}
          >
            <View style={styles.tierInfo}>
              <Text
                style={[
                  styles.tierName,
                  { color: data.color },
                  currentTier === tier && styles.currentTierName,
                ]}
              >
                {tier}
              </Text>
              <Text style={[styles.tierPoints, { color: colors.muted }]}>
                {data.nextThreshold
                  ? `${data.nextThreshold.toLocaleString()} pts`
                  : "Max Tier"}
              </Text>
            </View>
            <View style={styles.tierBenefits}>
              <Text style={[styles.tierBenefitText, { color: colors.text }]}>
                {data.pointsMultiplier} • {data.discount}
              </Text>
            </View>
          </View>
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: 44,
    paddingHorizontal: 20,
    paddingVertical: 20,
  },
  section: {
    backgroundColor: "#FFF",
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 16,
  },
  benefitItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginBottom: 12,
  },
  benefitText: {
    fontSize: 15,
    flex: 1,
  },
  tierRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderRadius: 8,
    marginBottom: 8,
  },
  tierInfo: {
    flex: 1,
  },
  tierName: {
    fontSize: 14,
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  currentTierName: {
    fontSize: 16,
  },
  tierPoints: {
    fontSize: 12,
    marginTop: 2,
  },
  tierBenefits: {
    alignItems: "flex-end",
  },
  tierBenefitText: {
    fontSize: 13,
    fontWeight: "600",
  },
});
