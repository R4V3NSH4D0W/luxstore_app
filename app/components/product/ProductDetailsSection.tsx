import { useTheme } from "@/app/context/theme-context";
import { Product } from "@/app/types/api-types";
import React from "react";
import { StyleSheet, Text, View } from "react-native";
import Animated, { FadeInDown } from "react-native-reanimated";

interface ProductDetailsSectionProps {
  data: Product;
}

export const ProductDetailsSection = ({ data }: ProductDetailsSectionProps) => {
  const { colors } = useTheme();

  return (
    <>
      <Animated.View
        entering={FadeInDown.delay(400).duration(600)}
        style={styles.section}
      >
        <Text style={[styles.sectionTitle, { color: colors.text }]}>About</Text>
        <Text style={[styles.description, { color: colors.text }]}>
          {data.description ||
            "Indulge in the finest craftsmanship. This piece is meticulously designed for those who appreciate the subtle elegance of luxury. Experience comfort and style in its most elevated form."}
        </Text>
      </Animated.View>

      {data.tags?.length > 0 && (
        <Animated.View
          entering={FadeInDown.delay(500).duration(600)}
          style={styles.section}
        >
          <View style={styles.tagContainer}>
            {data.tags.map((tag, idx) => (
              <View
                key={idx}
                style={[styles.tag, { borderColor: colors.border }]}
              >
                <Text style={[styles.tagText, { color: colors.text }]}>
                  {tag}
                </Text>
              </View>
            ))}
          </View>
        </Animated.View>
      )}

      <Animated.View
        entering={FadeInDown.delay(600).duration(600)}
        style={styles.section}
      >
        {/* <Text style={[styles.sectionTitle, { color: colors.text }]}>
          Details
        </Text>
        <View style={styles.detailsGrid}>
          <View style={styles.detailItem}>
            <Text style={[styles.detailLabel, { color: colors.muted }]}>
              SKU
            </Text>
            <Text style={[styles.detailValue, { color: colors.text }]}>
              {data.sku}
            </Text>
          </View>
          {data.weight && (
            <View style={styles.detailItem}>
              <Text style={[styles.detailLabel, { color: colors.muted }]}>
                Weight
              </Text>
              <Text style={[styles.detailValue, { color: colors.text }]}>
                {data.weight} kg
              </Text>
            </View>
          )}
          {data.dimensions && (
            <View style={styles.detailItem}>
              <Text style={[styles.detailLabel, { color: colors.muted }]}>
                Size
              </Text>
              <Text style={[styles.detailValue, { color: colors.text }]}>
                {data.dimensions}
              </Text>
            </View>
          )}
        </View> */}
      </Animated.View>
    </>
  );
};

const styles = StyleSheet.create({
  section: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 12,
  },
  description: {
    fontSize: 15,
    lineHeight: 24,
    opacity: 0.8,
  },
  tagContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  tag: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 30,
    borderWidth: 1,
  },
  tagText: {
    fontSize: 13,
    fontWeight: "600",
  },
  detailsGrid: {
    gap: 16,
  },
  detailItem: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  detailLabel: {
    fontSize: 14,
    fontWeight: "500",
  },
  detailValue: {
    fontSize: 14,
    fontWeight: "700",
  },
});
