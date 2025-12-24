import { useTheme } from "@/app/context/theme-context";
import React from "react";
import { Dimensions, ScrollView, StyleSheet, View } from "react-native";
import { Skeleton } from "../common/Skeleton";

const { width } = Dimensions.get("window");
const COLUMN_WIDTH = (width - 48) / 2;

export const ProductsSkeleton = () => {
  const { colors } = useTheme();

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header Skeleton */}
      <View style={styles.header}>
        <Skeleton width={120} height={24} />
        <View style={styles.headerActions}>
          <Skeleton width={40} height={40} borderRadius={20} />
          <Skeleton width={40} height={40} borderRadius={20} />
        </View>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContent}
      >
        <View style={styles.grid}>
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <View key={i} style={{ width: COLUMN_WIDTH, marginBottom: 24 }}>
              <Skeleton height={200} borderRadius={8} />
              <Skeleton width="80%" height={16} style={{ marginTop: 12 }} />
              <Skeleton width="40%" height={14} style={{ marginTop: 8 }} />
            </View>
          ))}
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingTop: 60,
    paddingHorizontal: 20,
    height: 110,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  headerActions: {
    flexDirection: "row",
    gap: 12,
  },
  listContent: {
    paddingBottom: 40,
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingTop: 10,
  },
});
