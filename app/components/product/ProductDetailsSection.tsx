import { useTheme } from "@/app/context/theme-context";
import { Product, Variant } from "@/types/api-types";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React from "react";
import { StyleSheet, Text, View } from "react-native";
import Animated, { FadeInDown } from "react-native-reanimated";
import { VariantSelector } from "./VariantSelector";

interface ProductDetailsSectionProps {
  data: Product;
  selectedVariantId?: string;
  onSelectVariant?: (variant: Variant) => void;
}

export const ProductDetailsSection = ({
  data,
  selectedVariantId,
  onSelectVariant,
}: ProductDetailsSectionProps) => {
  const router = useRouter();
  const { colors } = useTheme();

  return (
    <>
      <Animated.View
        entering={FadeInDown.delay(400).duration(600)}
        style={styles.section}
      >
        {/* Variant Selector */}
        {data.variants && data.variants.length > 0 && onSelectVariant && (
          <VariantSelector
            variants={[
              // Only add Standard option if not hasMultipleVariants
              ...(!data.hasMultipleVariants
                ? [
                    {
                      id: "base",
                      name: "Standard",
                      price: data.price,
                      salePrice: data.salePrice,
                      stock: data.stock,
                      sku: data.sku,
                      productId: data.id,
                      image: data.images?.[0] || null,
                      images: data.images || [],
                      hasSale: data.hasSale,
                    },
                  ]
                : []),
              ...data.variants,
            ]}
            selectedVariantId={
              selectedVariantId ||
              (data.hasMultipleVariants ? undefined : "base")
            }
            onSelect={onSelectVariant}
          />
        )}

        {/* About Section */}
        <View style={styles.aboutContainer}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            About
          </Text>
          <Text style={[styles.description, { color: colors.text }]}>
            {data.description ||
              "Indulge in the finest craftsmanship. This piece is meticulously designed for those who appreciate the subtle elegance of luxury. Experience comfort and style in its most elevated form."}
          </Text>
        </View>

        {/* Specifications List (Premium Style) */}
        {data.specifications && data.specifications.length > 0 && (
          <View style={styles.subsectionContainer}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>
              Specifications
            </Text>
            <View style={styles.specList}>
              {data.specifications.map((spec: any, index: number) => (
                <View
                  key={index}
                  style={[styles.specRow, { borderBottomColor: colors.border }]}
                >
                  <Text style={[styles.specKey, { color: colors.text }]}>
                    {spec.key}
                  </Text>
                  <Text style={[styles.specValue, { color: colors.text }]}>
                    {spec.value}
                  </Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Care Instructions List */}
        {data.careInstructions && data.careInstructions.length > 0 && (
          <View style={styles.subsectionContainer}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>
              Care Instructions
            </Text>
            <View style={styles.careContainer}>
              {data.careInstructions.map(
                (instruction: string, index: number) => (
                  <View key={index} style={styles.careItem}>
                    <Ionicons
                      name="water-outline"
                      size={16}
                      color={colors.text}
                      style={{ opacity: 0.6 }}
                    />
                    <Text style={[styles.careText, { color: colors.text }]}>
                      {instruction}
                    </Text>
                  </View>
                )
              )}
            </View>
          </View>
        )}
      </Animated.View>

      {/* Tags Section */}
      {data.tags?.length > 0 && (
        <Animated.View
          entering={FadeInDown.delay(600).duration(600)}
          style={styles.section}
        >
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            Tags
          </Text>
          <View style={styles.tagContainer}>
            {data.tags.map((tag, index) => (
              <View
                key={index}
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
    </>
  );
};

const styles = StyleSheet.create({
  section: {
    marginBottom: 24, // Increased spacing between major sections
  },
  aboutContainer: {
    marginBottom: 32,
  },
  subsectionContainer: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 16,
    letterSpacing: -0.5,
  },
  description: {
    fontSize: 15,
    lineHeight: 24,
    opacity: 0.8,
  },
  // Premium List Styles (Specs)
  specList: {
    gap: 0,
  },
  specRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "rgba(0,0,0,0.1)",
  },
  specKey: {
    fontSize: 11,
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: 1,
    opacity: 0.7,
  },
  specValue: {
    fontSize: 14,
    fontWeight: "500",
    textAlign: "right",
    flex: 1,
    paddingLeft: 16,
  },
  // Care Instructions Styles
  careContainer: {
    gap: 16,
    marginTop: 8,
  },
  careItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
  },
  careText: {
    fontSize: 14,
    lineHeight: 20,
    flex: 1,
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
});
