import { useTheme } from "@/app/context/theme-context";
import { Ionicons } from "@expo/vector-icons";
import React, { useEffect, useState } from "react";
import {
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

export interface FilterState {
  minPrice?: string;
  maxPrice?: string;
  sortBy?: "price_asc" | "price_desc" | "newest" | "relevance";
}

interface FilterModalProps {
  visible: boolean;
  onClose: () => void;
  onApply: (filters: FilterState) => void;
  initialFilters: FilterState;
  priceStats?: { min: number; max: number };
}

export const FilterModal = ({
  visible,
  onClose,
  onApply,
  initialFilters,
  priceStats,
}: FilterModalProps) => {
  const { colors, isDark } = useTheme();
  const [filters, setFilters] = useState<FilterState>(initialFilters);

  useEffect(() => {
    setFilters(initialFilters);
  }, [initialFilters, visible]);

  const handleApply = () => {
    onApply(filters);
    onClose();
  };

  const handleReset = () => {
    setFilters({});
  };

  const sortOptions: { label: string; value: FilterState["sortBy"] }[] = [
    { label: "Newest Arrivals", value: "newest" },
    { label: "Price: Low to High", value: "price_asc" },
    { label: "Price: High to Low", value: "price_desc" },
    { label: "Relevance", value: "relevance" },
  ];

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View
          style={[styles.modalContent, { backgroundColor: colors.background }]}
        >
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity onPress={onClose} hitSlop={10}>
              <Ionicons name="close" size={24} color={colors.text} />
            </TouchableOpacity>
            <Text style={[styles.title, { color: colors.text }]}>
              Filters & Sort
            </Text>
            <TouchableOpacity onPress={handleReset}>
              <Text style={[styles.resetText, { color: colors.primary }]}>
                Reset
              </Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.scrollContent}>
            {/* Sort Section */}
            <View style={styles.section}>
              <Text style={[styles.sectionTitle, { color: colors.text }]}>
                SORT BY
              </Text>
              <View style={styles.optionsContainer}>
                {sortOptions.map((option) => (
                  <TouchableOpacity
                    key={option.value}
                    style={[
                      styles.optionChip,
                      {
                        backgroundColor:
                          filters.sortBy === option.value
                            ? colors.primary
                            : isDark
                            ? "#1C1C1E"
                            : "#F2F2F7",
                      },
                    ]}
                    onPress={() =>
                      setFilters((prev) => ({ ...prev, sortBy: option.value }))
                    }
                  >
                    <Text
                      style={[
                        styles.optionText,
                        {
                          color:
                            filters.sortBy === option.value
                              ? isDark
                                ? colors.background
                                : "#FFF"
                              : colors.text,
                        },
                      ]}
                    >
                      {option.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Price section */}
            <View style={styles.section}>
              <Text style={[styles.sectionTitle, { color: colors.text }]}>
                PRICE RANGE
              </Text>
              {priceStats && (
                <Text
                  style={{
                    color: colors.muted,
                    fontSize: 12,
                    marginBottom: 10,
                  }}
                >
                  Highest price: ${priceStats.max}
                </Text>
              )}
              <View style={styles.priceInputs}>
                <View
                  style={[
                    styles.priceInputContainer,
                    { backgroundColor: isDark ? "#1C1C1E" : "#F2F2F7" },
                  ]}
                >
                  <Text
                    style={[styles.currencyPrefix, { color: colors.muted }]}
                  >
                    $
                  </Text>
                  <TextInput
                    style={[styles.priceInput, { color: colors.text }]}
                    placeholder="Min"
                    placeholderTextColor={colors.muted}
                    keyboardType="numeric"
                    value={filters.minPrice}
                    onChangeText={(text) =>
                      setFilters((prev) => ({ ...prev, minPrice: text }))
                    }
                  />
                </View>
                <Text style={{ color: colors.muted }}>-</Text>
                <View
                  style={[
                    styles.priceInputContainer,
                    { backgroundColor: isDark ? "#1C1C1E" : "#F2F2F7" },
                  ]}
                >
                  <Text
                    style={[styles.currencyPrefix, { color: colors.muted }]}
                  >
                    $
                  </Text>
                  <TextInput
                    style={[styles.priceInput, { color: colors.text }]}
                    placeholder="Max"
                    placeholderTextColor={colors.muted}
                    keyboardType="numeric"
                    value={filters.maxPrice}
                    onChangeText={(text) =>
                      setFilters((prev) => ({ ...prev, maxPrice: text }))
                    }
                  />
                </View>
              </View>
            </View>
          </ScrollView>

          {/* Footer */}
          <View
            style={[
              styles.footer,
              { borderTopColor: isDark ? "#333" : "#EEE" },
            ]}
          >
            <TouchableOpacity
              style={[styles.applyButton, { backgroundColor: colors.primary }]}
              onPress={handleApply}
            >
              <Text
                style={[
                  styles.applyButtonText,
                  { color: isDark ? colors.background : "#FFF" },
                ]}
              >
                Show Results
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "flex-end",
  },
  modalContent: {
    height: "80%",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingBottom: 40,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 20,
  },
  title: {
    fontSize: 18,
    fontWeight: "600",
  },
  resetText: {
    fontSize: 14,
    fontWeight: "500",
  },
  scrollContent: {
    paddingHorizontal: 20,
  },
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: "800",
    letterSpacing: 1,
    marginBottom: 16,
    opacity: 0.6,
  },
  optionsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  optionChip: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
  },
  optionText: {
    fontSize: 14,
    fontWeight: "500",
  },
  priceInputs: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  priceInputContainer: {
    flex: 1,
    height: 48,
    borderRadius: 8,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
  },
  currencyPrefix: {
    marginRight: 4,
    fontWeight: "500",
  },
  priceInput: {
    flex: 1,
    fontSize: 16,
    height: "100%",
  },
  footer: {
    padding: 20,
    borderTopWidth: 1,
  },
  applyButton: {
    height: 56,
    borderRadius: 28,
    justifyContent: "center",
    alignItems: "center",
  },
  applyButtonText: {
    fontSize: 16,
    fontWeight: "700",
  },
});
