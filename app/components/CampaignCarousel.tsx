import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React from "react";
import {
    Dimensions,
    Image,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import Animated, { FadeInRight } from "react-native-reanimated";
import { useCampaigns } from "../api/campaigns";
import { useTheme } from "../context/theme-context";

const { width } = Dimensions.get("window");
const CARD_WIDTH = width * 0.7;
const CARD_ASPECT_RATIO = 0.75;

export function CampaignCarousel() {
  const { data, isLoading } = useCampaigns();
  const { colors, isDark } = useTheme();
  const router = useRouter();

  if (isLoading || !data?.campaigns || data.campaigns.length === 0) {
    return null;
  }

  // Render each active campaign as a section
  return (
    <View style={styles.container}>
      {data.campaigns.map((campaign, campaignIndex) => {
        // Skip campaigns with no products
        if (!campaign.products || campaign.products.length === 0) return null;

        return (
          <View key={campaign.id} style={styles.campaignSection}>
            {/* Section Header */}
            <View style={styles.sectionHeader}>
              <View>
                <Text style={[styles.sectionTitle, { color: colors.text }]}>
                  {campaign.name.toUpperCase()}
                </Text>
                <Text style={[styles.sectionSubtitle, { color: colors.muted }]}>
                  {campaign.description || "Limited time offers"}
                </Text>
              </View>
              <TouchableOpacity
                onPress={() => {
                  // TODO: Navigate to full campaign page
                  // router.push(`/campaign/${campaign.id}`);
                  // For now, maybe navigate to products with filter?
                  router.push(
                    `/campaign/${campaign.id}?name=${encodeURIComponent(
                      campaign.name
                    )}`
                  );
                }}
                style={[styles.discoverButton, { borderColor: colors.border }]}
              >
                <Text style={[styles.viewAll, { color: colors.text }]}>
                  VIEW ALL
                </Text>
                <Ionicons name="arrow-forward" size={12} color={colors.text} />
              </TouchableOpacity>
            </View>

            {/* Campaign Products Horizontal Scroll */}
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.scrollContent}
              snapToInterval={CARD_WIDTH + 20}
              decelerationRate="fast"
            >
              {campaign.products.map((item: any, index: number) => {
                return (
                  <Animated.View
                    key={item.id}
                    entering={FadeInRight.delay(index * 100).duration(600)}
                  >
                    <TouchableOpacity
                      activeOpacity={0.9}
                      style={styles.productCard}
                      onPress={() => router.push(`/product/${item.id}`)}
                    >
                      <View
                        style={[
                          styles.imageContainer,
                          { backgroundColor: isDark ? "#111" : "#F9F9F9" },
                        ]}
                      >
                        <Image
                          source={{ uri: item.images?.[0] }}
                          style={styles.cardImage}
                        />
                        <View style={styles.badge}>
                          <Text style={styles.badgeText}>
                            {campaign.discountType === "PERCENTAGE"
                              ? `-${campaign.value}%`
                              : `-$${campaign.value}`}
                          </Text>
                        </View>
                      </View>

                      <View style={styles.infoContainer}>
                        <Text
                          style={[styles.brandText, { color: colors.muted }]}
                        >
                          {item.brand?.name || "LUXSTORE"}
                        </Text>
                        <Text
                          style={[styles.nameText, { color: colors.text }]}
                          numberOfLines={1}
                        >
                          {item.name}
                        </Text>
                        <View
                          style={{
                            flexDirection: "row",
                            alignItems: "center",
                            gap: 6,
                          }}
                        >
                          <Text
                            style={[styles.priceText, { color: "#FF6B6B" }]}
                          >
                            {item.formattedSalePrice || item.formattedPrice}
                          </Text>
                          {item.formattedSalePrice && (
                            <Text
                              style={[
                                styles.priceText,
                                {
                                  color: colors.muted,
                                  textDecorationLine: "line-through",
                                  fontSize: 12,
                                  fontWeight: "400",
                                },
                              ]}
                            >
                              {item.formattedPrice}
                            </Text>
                          )}
                        </View>
                      </View>
                    </TouchableOpacity>
                  </Animated.View>
                );
              })}
            </ScrollView>
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    // marginTop: 34,
  },
  campaignSection: {
    marginTop: 34,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
    paddingHorizontal: 24,
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "900",
    letterSpacing: 2,
    lineHeight: 24,
  },
  sectionSubtitle: {
    fontSize: 12,
    fontWeight: "400",
    marginTop: 4,
    letterSpacing: 0.5,
  },
  discoverButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    borderBottomWidth: 1,
    paddingBottom: 2,
  },
  viewAll: {
    fontSize: 10,
    fontWeight: "700",
    letterSpacing: 1,
  },
  scrollContent: {
    paddingHorizontal: 24,
    gap: 20,
  },
  productCard: {
    width: CARD_WIDTH,
  },
  imageContainer: {
    width: "100%",
    aspectRatio: CARD_ASPECT_RATIO,
    borderRadius: 4,
    overflow: "hidden",
    marginBottom: 12,
    position: "relative",
  },
  cardImage: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
  },
  badge: {
    position: "absolute",
    top: 12,
    left: 12,
    backgroundColor: "#FF6B6B",
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 2,
  },
  badgeText: {
    color: "#FFF",
    fontSize: 10,
    fontWeight: "800",
    letterSpacing: 1,
  },
  infoContainer: {
    paddingHorizontal: 2,
  },
  brandText: {
    fontSize: 10,
    fontWeight: "700",
    letterSpacing: 1,
    textTransform: "uppercase",
    marginBottom: 4,
  },
  nameText: {
    fontSize: 14,
    fontWeight: "500",
    marginBottom: 6,
    letterSpacing: 0.3,
  },
  priceText: {
    fontSize: 14,
    fontWeight: "700",
    letterSpacing: 0.5,
  },
});
