import React from "react";
import { StyleSheet, View } from "react-native";
import { Skeleton } from "./Skeleton";

export const ProductGridSkeleton = () => {
  return (
    <View style={styles.container}>
      {Array.from({ length: 6 }).map((_, i) => (
        <View key={i} style={styles.item}>
          <Skeleton
            height={200}
            borderRadius={12}
            style={{ marginBottom: 12 }}
          />
          <Skeleton height={14} width="80%" style={{ marginBottom: 6 }} />
          <Skeleton height={14} width="40%" />
        </View>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  item: {
    width: "48%",
    marginBottom: 24,
  },
});
