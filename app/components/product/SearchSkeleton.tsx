import { useTheme } from "@/app/context/theme-context";
import React from "react";
import { Dimensions, ScrollView, StyleSheet, View } from "react-native";
import { Skeleton } from "../common/Skeleton";

const { width } = Dimensions.get("window");
const COLUMN_WIDTH = (width - 48) / 2;

export const SearchSkeleton = () => {
  const { colors } = useTheme();

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
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
