import { useBrands } from "@/app/api/shop";
import { useTheme } from "@/app/context/theme-context";
import { useRouter } from "expo-router";
import React from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

export const BrandShowcase = () => {
  const router = useRouter();
  const { colors, isDark } = useTheme();
  const { data: brandsData, isLoading } = useBrands();

  const brands = brandsData?.brands || [];

  if (isLoading || brands.length === 0) return null;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: colors.text }]}>THE PRESTIGE</Text>
        <Text style={[styles.subtitle, { color: colors.muted }]}>
          AUTHENTIC LUXURY BRANDS
        </Text>
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.brandList}
      >
        {brands.map((brand, index) => (
          <TouchableOpacity
            key={index}
            style={[
              styles.brandCard,
              {
                borderColor: colors.border,
                backgroundColor: isDark
                  ? "rgba(255,255,255,0.03)"
                  : "rgba(0,0,0,0.02)",
              },
            ]}
            onPress={() =>
              router.push({
                pathname: "/(tabs)/products",
                params: { brand },
              })
            }
          >
            <Text style={[styles.brandName, { color: colors.text }]}>
              {brand.toUpperCase()}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginTop: 40,
  },
  header: {
    paddingHorizontal: 24,
    marginBottom: 20,
    alignItems: "center",
  },
  title: {
    fontSize: 20,
    fontWeight: "800",
    letterSpacing: 3,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 10,
    fontWeight: "600",
    letterSpacing: 1.5,
  },
  brandList: {
    paddingHorizontal: 16,
    gap: 12,
  },
  brandCard: {
    paddingHorizontal: 30,
    paddingVertical: 18,
    borderRadius: 2,
    borderWidth: 1,
    minWidth: 160,
    alignItems: "center",
    justifyContent: "center",
  },
  brandName: {
    fontSize: 15,
    fontWeight: "700",
    letterSpacing: 1,
  },
});
