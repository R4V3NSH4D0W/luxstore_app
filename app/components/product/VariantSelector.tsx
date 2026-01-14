import { useTheme } from "@/app/context/theme-context";
import { Variant } from "@/types/api-types";
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
      <Text style={[styles.title, { color: colors.text }]}>Select Variant</Text>
      <View style={styles.grid}>
        {variants.map((variant) => {
          const isSelected = selectedVariantId === variant.id;
          const isOutOfStock = variant.stock <= 0;

          return (
            <TouchableOpacity
              key={variant.id}
              style={[
                styles.option,
                isSelected
                  ? {
                      backgroundColor: colors.text,
                      borderColor: colors.text,
                    }
                  : {
                      borderColor: colors.border,
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
                  {variant.formattedSalePrice ? (
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
                        {variant.formattedPrice}
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
                        {variant.formattedSalePrice}
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
                      {variant.formattedPrice}
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
    marginVertical: 16,
    marginBottom: 24,
  },
  title: {
    fontSize: 12,
    fontWeight: "600",
    marginBottom: 12,
    letterSpacing: 1.5,
    textTransform: "uppercase",
    opacity: 0.8,
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  option: {
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 8,
    borderWidth: 1,
    minWidth: 90,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 0,
    backgroundColor: "transparent",
  },
  optionText: {
    fontSize: 13,
    fontWeight: "500",
    textAlign: "center",
    letterSpacing: 0.5,
  },
  priceText: {
    fontSize: 11,
    marginTop: 4,
    opacity: 0.7,
  },
  disabledOption: {
    opacity: 0.3,
    borderColor: "#E5E5E5",
  },
});
