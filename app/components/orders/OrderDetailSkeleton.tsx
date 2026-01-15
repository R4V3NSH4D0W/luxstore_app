import { useTheme } from "@/app/context/theme-context";
import React, { useEffect } from "react";
import { StyleSheet, View } from "react-native";
import Animated, {
    useAnimatedStyle,
    useSharedValue,
    withRepeat,
    withSequence,
    withTiming,
} from "react-native-reanimated";
import { SafeAreaView } from "react-native-safe-area-context";

export const OrderDetailSkeleton = () => {
  const { colors, isDark } = useTheme();
  const opacity = useSharedValue(0.3);

  useEffect(() => {
    opacity.value = withRepeat(
      withSequence(
        withTiming(0.7, { duration: 1000 }),
        withTiming(0.3, { duration: 1000 })
      ),
      -1,
      true
    );
  }, [opacity]);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));

  const SkeletonBox = ({
    width,
    height,
    borderRadius = 4,
    style,
  }: {
    width?: number | string;
    height: number;
    borderRadius?: number;
    style?: any;
  }) => (
    <Animated.View
      style={[
        {
          width,
          height,
          backgroundColor: isDark ? "#333" : "#E1E9EE",
          borderRadius,
        },
        animatedStyle,
        style,
      ]}
    />
  );

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: colors.background }]}
      edges={["top"]}
    >
      {/* Header Skeleton */}
      <View style={styles.header}>
        <SkeletonBox width={40} height={40} borderRadius={20} />
        <SkeletonBox width={150} height={24} />
        <View style={{ width: 40 }} />
      </View>

      <View style={styles.content}>
        {/* Order Info Card Skeleton */}
        <View style={[styles.section, { backgroundColor: colors.surface }]}>
          <View style={styles.sectionHeader}>
            <SkeletonBox width={120} height={24} />
            <SkeletonBox width={80} height={24} borderRadius={12} />
          </View>
          <SkeletonBox width={200} height={16} />
        </View>

        {/* Address Skeleton */}
        <View style={[styles.section, { backgroundColor: colors.surface }]}>
          <SkeletonBox width={140} height={20} style={{ marginBottom: 16 }} />
          <View style={styles.addressContainer}>
            <SkeletonBox
              width={40}
              height={40}
              borderRadius={20}
              style={{ marginRight: 12 }}
            />
            <View style={{ flex: 1 }}>
              <SkeletonBox
                width={100}
                height={20}
                style={{ marginBottom: 8 }}
              />
              <SkeletonBox
                width="80%"
                height={16}
                style={{ marginBottom: 4 }}
              />
              <SkeletonBox width="60%" height={16} />
            </View>
          </View>
        </View>

        {/* Items Skeleton */}
        <View style={[styles.section, { backgroundColor: colors.surface }]}>
          <SkeletonBox width={80} height={20} style={{ marginBottom: 16 }} />
          {[1, 2].map((i) => (
            <View
              key={i}
              style={[styles.itemRow, { borderBottomColor: colors.border }]}
            >
              <SkeletonBox width={60} height={80} borderRadius={8} />
              <View style={{ flex: 1, marginLeft: 12 }}>
                <SkeletonBox
                  width={80}
                  height={12}
                  style={{ marginBottom: 8 }}
                />
                <SkeletonBox
                  width="90%"
                  height={16}
                  style={{ marginBottom: 8 }}
                />
                <View
                  style={{
                    flexDirection: "row",
                    justifyContent: "space-between",
                  }}
                >
                  <SkeletonBox width={40} height={14} />
                  <SkeletonBox width={60} height={16} />
                </View>
              </View>
            </View>
          ))}
        </View>

        {/* Summary Skeleton */}
        <View style={[styles.section, { backgroundColor: colors.surface }]}>
          <SkeletonBox width={140} height={20} style={{ marginBottom: 16 }} />
          <View style={styles.summaryRow}>
            <SkeletonBox width={100} height={16} />
            <SkeletonBox width={120} height={16} />
          </View>
          <View
            style={{
              height: 1,
              backgroundColor: colors.border,
              marginVertical: 12,
            }}
          />
          <View style={styles.summaryRow}>
            <SkeletonBox width={80} height={16} />
            <SkeletonBox width={60} height={16} />
          </View>
          <View
            style={{
              height: 1,
              backgroundColor: colors.border,
              marginVertical: 12,
            }}
          />
          <View style={styles.summaryRow}>
            <SkeletonBox width={100} height={20} />
            <SkeletonBox width={80} height={24} />
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 24,
    paddingVertical: 16,
    marginBottom: 8,
  },
  content: {
    paddingHorizontal: 24,
  },
  section: {
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  addressContainer: {
    flexDirection: "row",
    alignItems: "flex-start",
  },
  itemRow: {
    flexDirection: "row",
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },
});
