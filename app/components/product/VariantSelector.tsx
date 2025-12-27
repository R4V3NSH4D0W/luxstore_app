import { useTheme } from "@/app/context/theme-context";
import { Variant } from "@/app/types/api-types";
import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import Animated, { FadeInDown } from "react-native-reanimated";

interface VariantSelectorProps {
  variants: Variant[];
  selectedVariantId?: string;
  onSelect: (variant: Variant) => void;
}

export const VariantSelector = ({
  variants,
  selectedVariantId,
  onSelect,
}: VariantSelectorProps) => {
  const { colors } = useTheme();

  if (!variants || variants.length === 0) return null;

  return (
    <Animated.View
      entering={FadeInDown.delay(300).duration(500)}
      style={styles.container}
    >
      <Text style={[styles.title, { color: colors.text }]}>
        Select Varients
      </Text>
      <View style={styles.grid}>
        {variants.map((variant) => {
          const isSelected = selectedVariantId === variant.id;
          const isOutOfStock = variant.stock <= 0;

          return (
            <TouchableOpacity
              key={variant.id}
              style={[
                styles.option,
                isSelected && {
                  backgroundColor: colors.text,
                  borderColor: colors.text,
                },
                !isSelected && {
                  borderColor: colors.border,
                  backgroundColor: "transparent",
                },
                isOutOfStock && styles.disabledOption,
              ]}
              onPress={() => !isOutOfStock && onSelect(variant)}
              disabled={isOutOfStock}
              activeOpacity={0.7}
            >
              <Text
                style={[
                  styles.optionText,
                  { color: isSelected ? colors.background : colors.text },
                  isOutOfStock && { color: colors.muted },
                ]}
              >
                {variant.name}
              </Text>
              {!isOutOfStock && (
                <View style={{ alignItems: "center" }}>
                  {variant.salePrice && variant.salePrice < variant.price ? (
                    <>
                      <Text
                        style={[
                          styles.priceText,
                          {
                            color: isSelected
                              ? colors.background
                              : colors.muted,
                            textDecorationLine: "line-through",
                            opacity: 0.7,
                            fontSize: 10,
                          },
                        ]}
                      >
                        ${variant.price}
                      </Text>
                      <Text
                        style={[
                          styles.priceText,
                          {
                            color: isSelected ? colors.background : "#EF4444",
                            fontWeight: "700",
                          },
                        ]}
                      >
                        ${variant.salePrice}
                      </Text>
                    </>
                  ) : (
                    <Text
                      style={[
                        styles.priceText,
                        {
                          color: isSelected ? colors.background : colors.muted,
                        },
                      ]}
                    >
                      ${variant.price}
                    </Text>
                  )}
                </View>
              )}
            </TouchableOpacity>
          );
        })}
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 0,
    marginBottom: 16,
    paddingHorizontal: 0,
  },
  title: {
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 12,
    letterSpacing: 0.5,
    textTransform: "uppercase",
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  option: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    borderWidth: 1,
    minWidth: 80,
    alignItems: "center",
    justifyContent: "center",
  },
  optionText: {
    fontSize: 14,
    fontWeight: "600",
  },
  priceText: {
    fontSize: 11,
    marginTop: 2,
    fontWeight: "500",
  },
  disabledOption: {
    opacity: 0.5,
    borderStyle: "dashed",
  },
});
