import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import React from "react";
import { StyleSheet, Text, View } from "react-native";

type MembershipTier = "BRONZE" | "SILVER" | "GOLD" | "PLATINUM";

interface LoyaltyBadgeProps {
  tier: MembershipTier;
  points: number;
  size?: "small" | "medium" | "large";
}

const TIER_CONFIG = {
  BRONZE: {
    colors: ["#CD7F32", "#8B5A2B"],
    icon: "medal-outline" as const,
    label: "Bronze",
    nextTier: "SILVER",
    nextThreshold: 1000,
  },
  SILVER: {
    colors: ["#C0C0C0", "#808080"],
    icon: "medal-outline" as const,
    label: "Silver",
    nextTier: "GOLD",
    nextThreshold: 5000,
  },
  GOLD: {
    colors: ["#FFD700", "#FFA500"],
    icon: "medal" as const,
    label: "Gold",
    nextTier: "PLATINUM",
    nextThreshold: 10000,
  },
  PLATINUM: {
    colors: ["#E5E4E2", "#B8B8B8"],
    icon: "trophy" as const,
    label: "Platinum",
    nextTier: null,
    nextThreshold: null,
  },
};

export function LoyaltyBadge({
  tier,
  points,
  size = "medium",
}: LoyaltyBadgeProps) {
  const config = TIER_CONFIG[tier];
  const iconSize = size === "small" ? 16 : size === "medium" ? 24 : 32;
  const fontSize = size === "small" ? 10 : size === "medium" ? 12 : 14;

  return (
    <LinearGradient
      colors={config.colors as [string, string]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={[
        styles.badge,
        size === "small" && styles.badgeSmall,
        size === "large" && styles.badgeLarge,
      ]}
    >
      <Ionicons name={config.icon} size={iconSize} color="#FFF" />
      <Text style={[styles.tierText, { fontSize }]}>{config.label}</Text>
    </LinearGradient>
  );
}

interface LoyaltyCardProps {
  tier: MembershipTier;
  points: number;
  isDark?: boolean;
}

export function LoyaltyCard({
  tier,
  points,
  isDark = false,
}: LoyaltyCardProps) {
  const config = TIER_CONFIG[tier];
  const progress = config.nextThreshold
    ? (points / config.nextThreshold) * 100
    : 100;

  return (
    <View style={[styles.card, isDark && styles.cardDark]}>
      <View style={styles.cardHeader}>
        <View>
          <Text style={[styles.cardTitle, isDark && styles.textLight]}>
            Loyalty Rewards
          </Text>
          <Text style={[styles.pointsText, isDark && styles.textLight]}>
            {points.toLocaleString()} points
          </Text>
        </View>
        <LoyaltyBadge tier={tier} points={points} size="large" />
      </View>

      {config.nextThreshold && (
        <View style={styles.progressSection}>
          <View style={styles.progressBar}>
            <View
              style={[
                styles.progressFill,
                { width: `${Math.min(progress, 100)}%` },
                { backgroundColor: config.colors[0] },
              ]}
            />
          </View>
          <Text style={[styles.progressText, isDark && styles.textMuted]}>
            {config.nextThreshold - points} points to {config.nextTier}
          </Text>
        </View>
      )}

      {tier === "PLATINUM" && (
        <Text style={[styles.maxTierText, isDark && styles.textMuted]}>
          🎉 You've reached the highest tier!
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  badgeSmall: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    gap: 4,
  },
  badgeLarge: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    gap: 8,
  },
  tierText: {
    color: "#FFF",
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  card: {
    backgroundColor: "#FFF",
    borderRadius: 16,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  cardDark: {
    backgroundColor: "#1A1A1A",
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  cardTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#666",
    marginBottom: 4,
  },
  pointsText: {
    fontSize: 28,
    fontWeight: "800",
    color: "#1A1A1A",
  },
  textLight: {
    color: "#FFF",
  },
  textMuted: {
    color: "#999",
  },
  progressSection: {
    marginTop: 8,
  },
  progressBar: {
    height: 8,
    backgroundColor: "#F0F0F0",
    borderRadius: 4,
    overflow: "hidden",
    marginBottom: 8,
  },
  progressFill: {
    height: "100%",
    borderRadius: 4,
  },
  progressText: {
    fontSize: 12,
    color: "#666",
    fontWeight: "500",
  },
  maxTierText: {
    fontSize: 14,
    color: "#666",
    fontWeight: "600",
    textAlign: "center",
    marginTop: 8,
  },
});
