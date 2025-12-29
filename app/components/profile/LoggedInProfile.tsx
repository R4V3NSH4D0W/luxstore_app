import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import Animated, { FadeInDown } from "react-native-reanimated";
import { useTheme } from "../../context/theme-context";
import { getImageUrl } from "../../lib/api-client";
import { RecentlyViewedSection } from "../home/RecentlyViewedSection";
import MenuRow from "./MenuRow";

import { User } from "@/types/api-types";

interface LoggedInProfileProps {
  user: User;
  onSignOut: () => void;
  loyaltyEnabled?: boolean;
}

export default function LoggedInProfile({
  user,
  onSignOut,
  loyaltyEnabled = true,
}: LoggedInProfileProps) {
  const router = useRouter();
  const { colors, isDark } = useTheme();

  const getTierColor = (tier: string) => {
    switch (tier) {
      case "PLATINUM":
        return ["#E5E4E2", "#71706E"];
      case "GOLD":
        return ["#FFD700", "#DAA520"];
      case "SILVER":
        return ["#C0C0C0", "#808080"];
      case "BRONZE":
        return ["#CD7F32", "#8B4513"];
      default:
        return [colors.primary, colors.muted];
    }
  };

  const tierColors = getTierColor(user.membershipTier);

  return (
    <>
      {/* Header */}
      <Animated.View
        entering={FadeInDown.duration(600).springify()}
        style={styles.header}
      >
        <Text style={[styles.pageTitle, { color: colors.text }]}>
          My Profile
        </Text>
      </Animated.View>

      {/* User Info */}
      <Animated.View
        entering={FadeInDown.delay(100).duration(600).springify()}
        style={styles.userInfo}
      >
        <View style={[styles.avatar, { backgroundColor: colors.tint }]}>
          {user.avatar ? (
            <Image
              source={{ uri: getImageUrl(user.avatar) }}
              style={styles.avatarImage}
            />
          ) : (
            <Text style={[styles.avatarText, { color: colors.text }]}>
              {user.username ? user.username.charAt(0).toUpperCase() : "U"}
            </Text>
          )}
        </View>
        <View style={styles.userDetails}>
          <View style={styles.userNameRow}>
            <Text style={[styles.userName, { color: colors.text }]}>
              {user.username || "User"}
            </Text>
            <TouchableOpacity
              onPress={() => router.push("/(screens)/edit-profile")}
              style={[styles.editCircle, { backgroundColor: colors.border }]}
            >
              <Ionicons name="pencil" size={12} color={colors.text} />
            </TouchableOpacity>
          </View>
          <Text style={[styles.userEmail, { color: colors.muted }]}>
            {user.email}
          </Text>
          {loyaltyEnabled && (
            <View
              style={[
                styles.tierBadge,
                { backgroundColor: tierColors[0] + "20" },
              ]}
            >
              <Text style={[styles.tierText, { color: tierColors[0] }]}>
                {user.membershipTier}
              </Text>
            </View>
          )}
        </View>
      </Animated.View>

      {/* Loyalty Card */}
      {loyaltyEnabled && (
        <Animated.View
          entering={FadeInDown.delay(150).duration(600).springify()}
        >
          <TouchableOpacity
            style={[
              styles.loyaltyCard,
              { backgroundColor: isDark ? "#1C1C1E" : "#FFF" },
            ]}
            onPress={() => router.push("/(screens)/loyalty-benefits")}
            activeOpacity={0.7}
          >
            <View style={styles.loyaltyHeader}>
              <View>
                <Text style={[styles.loyaltyLabel, { color: colors.muted }]}>
                  Available Points
                </Text>
                <Text style={[styles.loyaltyValue, { color: colors.text }]}>
                  {(user.loyaltyPoints || 0).toLocaleString()}
                </Text>
                {(user.heldPoints || 0) > 0 && (
                  <Text
                    style={[styles.heldPointsText, { color: colors.muted }]}
                  >
                    ({(user.heldPoints || 0).toLocaleString()} pending)
                  </Text>
                )}
                <Text
                  style={[styles.lifetimePointsText, { color: colors.muted }]}
                >
                  {(user.lifetimePointsEarned || 0).toLocaleString()} lifetime
                  earned
                </Text>
              </View>
              <Ionicons
                name="diamond-outline"
                size={24}
                color={tierColors[0]}
              />
            </View>
            <View style={styles.progressContainer}>
              <View
                style={[styles.progressBar, { backgroundColor: colors.border }]}
              >
                <View
                  style={[
                    styles.progressFill,
                    {
                      backgroundColor: tierColors[0],
                      width: `${Math.min(
                        ((user.lifetimePointsEarned || 0) % 1000) / 10,
                        100
                      )}%`,
                    },
                  ]}
                />
              </View>
              <View style={styles.nextTierRow}>
                <Text style={[styles.nextTierText, { color: colors.muted }]}>
                  {user.membershipTier === "PLATINUM"
                    ? "Max Tier Reached"
                    : `${
                        1000 - ((user.lifetimePointsEarned || 0) % 1000)
                      } pts to next tier`}
                </Text>
                <Ionicons
                  name="chevron-forward"
                  size={16}
                  color={colors.muted}
                />
              </View>
            </View>
          </TouchableOpacity>
        </Animated.View>
      )}

      {/* Recently Viewed */}
      <Animated.View entering={FadeInDown.delay(180).duration(600)}>
        <RecentlyViewedSection />
      </Animated.View>

      {/* Account Section */}
      <Animated.View
        entering={FadeInDown.delay(200).duration(600)}
        style={styles.section}
      >
        <Text style={[styles.sectionTitle, { color: colors.muted }]}>
          Account
        </Text>
        <View style={[styles.sectionBody, { backgroundColor: colors.card }]}>
          <MenuRow
            icon="bag-handle-outline"
            label="My Orders"
            onPress={() => router.push("/(screens)/orders")}
          />
          <View style={[styles.divider, { backgroundColor: colors.border }]} />
          <MenuRow
            icon="return-down-back-outline"
            label="My Returns"
            onPress={() => router.push("/(screens)/my-returns")}
          />
          <View style={[styles.divider, { backgroundColor: colors.border }]} />
          <MenuRow
            icon="heart-outline"
            label="Wishlist"
            onPress={() => router.push("/(screens)/wishlist")}
          />
          <View style={[styles.divider, { backgroundColor: colors.border }]} />
          <MenuRow
            icon="location-outline"
            label="Addresses"
            onPress={() => router.push("/(screens)/address")}
          />
        </View>
      </Animated.View>

      {/* Preferences & Security Section */}
      <Animated.View
        entering={FadeInDown.delay(300).duration(600)}
        style={styles.section}
      >
        <Text style={[styles.sectionTitle, { color: colors.muted }]}>
          Preferences & Security
        </Text>
        <View style={[styles.sectionBody, { backgroundColor: colors.card }]}>
          <MenuRow
            icon="settings-outline"
            label="Preferences"
            onPress={() => router.push("/(screens)/preferences")}
          />
          <View style={[styles.divider, { backgroundColor: colors.border }]} />
          <MenuRow
            icon="notifications-outline"
            label="Notifications"
            onPress={() => router.push("/(screens)/notifications")}
          />
          <View style={[styles.divider, { backgroundColor: colors.border }]} />
          <MenuRow
            icon="lock-closed-outline"
            label="Change Password"
            onPress={() => router.push("/(screens)/profile/change-password")}
          />
        </View>
      </Animated.View>

      {/* Legal & Support Section */}
      <Animated.View
        entering={FadeInDown.delay(350).duration(600)}
        style={styles.section}
      >
        <Text style={[styles.sectionTitle, { color: colors.muted }]}>
          Legal & Support
        </Text>
        <View style={[styles.sectionBody, { backgroundColor: colors.card }]}>
          <MenuRow
            icon="information-circle-outline"
            label="Store Info"
            onPress={() => router.push("/(screens)/store-info")}
          />
          <View style={[styles.divider, { backgroundColor: colors.border }]} />
          <MenuRow
            icon="document-text-outline"
            label="Refund Policy"
            onPress={() => router.push("/(screens)/legal/refund-policy")}
          />
          <View style={[styles.divider, { backgroundColor: colors.border }]} />
          <MenuRow
            icon="shield-checkmark-outline"
            label="Privacy Policy"
            onPress={() => router.push("/(screens)/legal/privacy")}
          />
          <View style={[styles.divider, { backgroundColor: colors.border }]} />
          <MenuRow
            icon="book-outline"
            label="Terms of Service"
            onPress={() => router.push("/(screens)/legal/terms")}
          />
        </View>
      </Animated.View>

      {/* Sign Out Section */}
      <Animated.View
        entering={FadeInDown.delay(400).duration(600)}
        style={styles.section}
      >
        <View style={[styles.sectionBody, { backgroundColor: colors.card }]}>
          <MenuRow
            icon="log-out-outline"
            label="Sign Out"
            isDestructive
            onPress={onSignOut}
          />
        </View>
      </Animated.View>
    </>
  );
}

const styles = StyleSheet.create({
  header: {
    marginTop: 20,
    marginBottom: 30,
  },
  pageTitle: {
    fontSize: 34,
    fontWeight: "800",
    color: "#1A1A1A",
    letterSpacing: -0.5,
  },
  userInfo: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 40,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "#E1E4E8",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 20,
    overflow: "hidden",
  },
  avatarImage: {
    width: "100%",
    height: "100%",
  },
  avatarText: {
    fontSize: 32,
    fontWeight: "700",
    color: "#1A1A1A",
  },
  userDetails: {
    flex: 1,
  },
  userNameRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 2,
  },
  userName: {
    fontSize: 22,
    fontWeight: "700",
    color: "#1A1A1A",
  },
  editCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  userEmail: {
    fontSize: 15,
    color: "#666",
    marginBottom: 4,
  },
  tierBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
    alignSelf: "flex-start",
  },
  tierText: {
    fontSize: 10,
    fontWeight: "800",
    textTransform: "uppercase",
  },
  loyaltyCard: {
    borderRadius: 20,
    padding: 20,
    marginBottom: 30,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 4,
  },
  loyaltyHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 20,
  },
  loyaltyLabel: {
    fontSize: 12,
    fontWeight: "600",
    textTransform: "uppercase",
    marginBottom: 4,
  },
  loyaltyValue: {
    fontSize: 24,
    fontWeight: "800",
  },
  heldPointsText: {
    fontSize: 12,
    fontWeight: "500",
    marginTop: 2,
  },
  lifetimePointsText: {
    fontSize: 10,
    marginTop: 6,
    opacity: 0.7,
  },
  progressContainer: {
    width: "100%",
  },
  progressBar: {
    height: 6,
    borderRadius: 3,
    width: "100%",
    marginBottom: 8,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    borderRadius: 3,
  },
  nextTierText: {
    fontSize: 11,
    fontWeight: "500",
  },
  nextTierRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  section: {
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: "600",
    color: "#8E8E93",
    textTransform: "uppercase",
    marginBottom: 10,
    paddingLeft: 4,
  },
  sectionBody: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    overflow: "hidden",
  },
  divider: {
    height: 1,
    backgroundColor: "#F4F6F8",
    marginLeft: 64,
  },
});
