import { useTheme } from "@/app/context/theme-context";
import React from "react";
import { Dimensions, ScrollView, StyleSheet, View } from "react-native";
import { Skeleton } from "../common/Skeleton";

const { width } = Dimensions.get("window");
const COLUMN_WIDTH = (width - 48 - 12) / 2;

export const HomeSkeleton = () => {
  const { colors } = useTheme();

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Hero Skeleton */}
        <Skeleton height={550} borderRadius={0} />

        <View
          style={[
            styles.contentContainer,
            { backgroundColor: colors.background },
          ]}
        >
          {/* Categories Skeleton */}
          <View style={styles.section}>
            <View style={styles.header}>
              <Skeleton width={120} height={20} />
              <Skeleton width={60} height={14} />
            </View>
            <View style={styles.categoriesRow}>
              {[1, 2, 3, 4].map((i) => (
                <View key={i} style={styles.categoryItem}>
                  <Skeleton width={70} height={70} borderRadius={35} />
                  <Skeleton width={50} height={10} style={{ marginTop: 8 }} />
                </View>
              ))}
            </View>
          </View>

          {/* Products Skeleton */}
          <View style={styles.section}>
            <View style={styles.header}>
              <Skeleton width={150} height={22} />
              <Skeleton width={60} height={14} />
            </View>
            <View style={styles.grid}>
              {[1, 2, 3, 4].map((i) => (
                <View key={i} style={{ width: COLUMN_WIDTH, marginBottom: 24 }}>
                  <Skeleton height={200} borderRadius={8} />
                  <Skeleton width="80%" height={16} style={{ marginTop: 12 }} />
                  <Skeleton width="40%" height={14} style={{ marginTop: 8 }} />
                </View>
              ))}
            </View>
          </View>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  contentContainer: {
    flex: 1,
    marginTop: -20,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingTop: 24,
  },
  section: {
    marginTop: 20,
    paddingHorizontal: 24,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  categoriesRow: {
    flexDirection: "row",
    gap: 20,
  },
  categoryItem: {
    alignItems: "center",
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
});
