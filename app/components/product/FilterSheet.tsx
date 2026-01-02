import { useBrands, useTags } from "@/app/api/shop";
import { useTheme } from "@/app/context/theme-context";
import { Ionicons } from "@expo/vector-icons";
import { BlurView } from "expo-blur";
import React from "react";
import {
  ActivityIndicator,
  Dimensions,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const { height } = Dimensions.get("window");

interface FilterSheetProps {
  isVisible: boolean;
  onClose: () => void;
  activeFilters: {
    brand?: string;
    featured?: boolean;
    tags?: string[];
    sortBy?: string;
  };
  onApply: (filters: any) => void;
}

// Removed hardcoded BRANDS and TAGS

export const FilterSheet = ({
  isVisible,
  onClose,
  activeFilters,
  onApply,
}: FilterSheetProps) => {
  const { colors, isDark } = useTheme();
  const [localFilters, setLocalFilters] = React.useState(activeFilters);

  const { data: tagsData, isLoading: isLoadingTags } = useTags();
  const { data: brandsData, isLoading: isLoadingBrands } = useBrands();

  const brands = brandsData?.brands || [];
  const tags = tagsData?.tags || [];

  React.useEffect(() => {
    if (isVisible) {
      setLocalFilters(activeFilters);
    }
  }, [isVisible, activeFilters]);

  const toggleTag = (tag: string) => {
    const currentTags = localFilters.tags || [];
    if (currentTags.includes(tag)) {
      setLocalFilters({
        ...localFilters,
        tags: currentTags.filter((t) => t !== tag),
      });
    } else {
      setLocalFilters({ ...localFilters, tags: [...currentTags, tag] });
    }
  };

  return (
    <Modal
      visible={isVisible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <TouchableOpacity
          style={styles.flex}
          activeOpacity={1}
          onPress={onClose}
        />
        <View style={[styles.sheet, { backgroundColor: colors.background }]}>
          <BlurView
            intensity={80}
            tint={isDark ? "dark" : "light"}
            style={StyleSheet.absoluteFill}
          />

          <View style={styles.header}>
            <Text style={[styles.headerTitle, { color: colors.text }]}>
              Filters
            </Text>
            <TouchableOpacity onPress={onClose}>
              <Ionicons name="close" size={24} color={colors.text} />
            </TouchableOpacity>
          </View>

          <ScrollView
            style={styles.content}
            showsVerticalScrollIndicator={false}
          >
            {/* Sort By Section */}
            <View style={styles.section}>
              <Text style={[styles.sectionTitle, { color: colors.muted }]}>
                Sort By
              </Text>
              <View style={styles.chipGrid}>
                {[
                  { label: "Recommended", value: "relevance" },
                  { label: "Newest Arrivals", value: "newest" },
                  { label: "Price: Low to High", value: "price_asc" },
                  { label: "Price: High to Low", value: "price_desc" },
                ].map((option) => {
                  const isActive =
                    localFilters.sortBy === option.value ||
                    (!localFilters.sortBy && option.value === "relevance");
                  return (
                    <TouchableOpacity
                      key={option.value}
                      style={[
                        styles.chip,
                        isActive && {
                          backgroundColor: colors.primary,
                          borderColor: colors.primary,
                        },
                        { borderColor: colors.border },
                      ]}
                      onPress={() =>
                        setLocalFilters({
                          ...localFilters,
                          sortBy: option.value,
                        })
                      }
                    >
                      <Text
                        style={[
                          styles.chipText,
                          {
                            color: isActive ? colors.secondary : colors.text,
                          },
                        ]}
                      >
                        {option.label}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>

            {/* Featured Section */}
            <View style={styles.section}>
              <Text style={[styles.sectionTitle, { color: colors.muted }]}>
                Show Only
              </Text>
              <TouchableOpacity
                style={[
                  styles.filterItem,
                  localFilters.featured && { backgroundColor: colors.primary },
                  { borderColor: colors.border },
                ]}
                onPress={() =>
                  setLocalFilters({
                    ...localFilters,
                    featured: !localFilters.featured,
                  })
                }
              >
                <Text
                  style={[
                    styles.filterLabel,
                    {
                      color: localFilters.featured
                        ? colors.secondary
                        : colors.text,
                    },
                  ]}
                >
                  Featured Products
                </Text>
                {localFilters.featured && (
                  <Ionicons
                    name="checkmark"
                    size={18}
                    color={colors.secondary}
                  />
                )}
              </TouchableOpacity>
            </View>

            {/* Brands Section */}
            <View style={styles.section}>
              <Text style={[styles.sectionTitle, { color: colors.muted }]}>
                Brands
              </Text>
              <View style={styles.chipGrid}>
                {isLoadingBrands ? (
                  <ActivityIndicator size="small" color={colors.primary} />
                ) : (
                  brands.map((brand) => {
                    const isActive = localFilters.brand === brand;
                    return (
                      <TouchableOpacity
                        key={brand}
                        style={[
                          styles.chip,
                          isActive && {
                            backgroundColor: colors.primary,
                            borderColor: colors.primary,
                          },
                          { borderColor: colors.border },
                        ]}
                        onPress={() =>
                          setLocalFilters({
                            ...localFilters,
                            brand: isActive ? undefined : brand,
                          })
                        }
                      >
                        <Text
                          style={[
                            styles.chipText,
                            {
                              color: isActive ? colors.secondary : colors.text,
                            },
                          ]}
                        >
                          {brand}
                        </Text>
                      </TouchableOpacity>
                    );
                  })
                )}
              </View>
            </View>

            {/* Tags Section */}
            <View style={styles.section}>
              <Text style={[styles.sectionTitle, { color: colors.muted }]}>
                Tags
              </Text>
              <View style={styles.chipGrid}>
                {isLoadingTags ? (
                  <ActivityIndicator size="small" color={colors.primary} />
                ) : (
                  tags.map((tag) => {
                    const isActive = localFilters.tags?.includes(tag);
                    return (
                      <TouchableOpacity
                        key={tag}
                        style={[
                          styles.chip,
                          isActive && {
                            backgroundColor: colors.primary,
                            borderColor: colors.primary,
                          },
                          { borderColor: colors.border },
                        ]}
                        onPress={() => toggleTag(tag)}
                      >
                        <Text
                          style={[
                            styles.chipText,
                            {
                              color: isActive ? colors.secondary : colors.text,
                            },
                          ]}
                        >
                          {tag.charAt(0).toUpperCase() + tag.slice(1)}
                        </Text>
                      </TouchableOpacity>
                    );
                  })
                )}
              </View>
            </View>

            <View style={{ height: 40 }} />
          </ScrollView>

          <SafeAreaView edges={["bottom"]} style={styles.footer}>
            <TouchableOpacity
              style={[styles.resetButton, { borderColor: colors.border }]}
              onPress={() =>
                setLocalFilters({
                  tags: [],
                  featured: false,
                  brand: undefined,
                  sortBy: undefined,
                })
              }
            >
              <Text style={[styles.resetText, { color: colors.text }]}>
                Reset
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.applyButton, { backgroundColor: colors.primary }]}
              onPress={() => onApply(localFilters)}
            >
              <Text style={[styles.applyText, { color: colors.secondary }]}>
                Apply Filters
              </Text>
            </TouchableOpacity>
          </SafeAreaView>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "flex-end",
  },
  sheet: {
    height: height * 0.7,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    overflow: "hidden",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 20,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "rgba(0,0,0,0.1)",
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "700",
  },
  content: {
    flex: 1,
    padding: 20,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 1,
    marginBottom: 12,
  },
  filterItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
  },
  filterLabel: {
    fontSize: 16,
    fontWeight: "500",
  },
  chipGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  chip: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 1,
  },
  chipText: {
    fontSize: 14,
    fontWeight: "600",
  },
  footer: {
    flexDirection: "row",
    padding: 20,
    gap: 12,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: "rgba(0,0,0,0.1)",
  },
  resetButton: {
    flex: 1,
    height: 54,
    borderRadius: 16,
    borderWidth: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  resetText: {
    fontSize: 16,
    fontWeight: "600",
  },
  applyButton: {
    flex: 2,
    height: 54,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
  },
  applyText: {
    fontSize: 16,
    fontWeight: "700",
  },
});
