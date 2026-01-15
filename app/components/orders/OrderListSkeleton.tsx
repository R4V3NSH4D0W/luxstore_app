import { useTheme } from "@/app/context/theme-context";
import React from "react";
import { StyleSheet, View } from "react-native";
import Animated, {
    useAnimatedStyle,
    useSharedValue,
    withRepeat,
    withSequence,
    withTiming,
} from "react-native-reanimated";
import { SafeAreaView } from "react-native-safe-area-context";

const SkeletonItem = ({ isDark }: { isDark: boolean }) => {
  const { colors } = useTheme();
  const opacity = useSharedValue(0.5);

  React.useEffect(() => {
    opacity.value = withRepeat(
      withSequence(
        withTiming(0.8, { duration: 1000 }),
        withTiming(0.5, { duration: 1000 })
      ),
      -1,
      true
    );
  }, [opacity]);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));

  const bgStyle = { backgroundColor: isDark ? "#2C2C2C" : "#E1E4E8" };

  return (
    <View style={[styles.card, { backgroundColor: colors.surface }]}>
      <View style={styles.cardHeader}>
        <Animated.View style={[styles.skeletonId, bgStyle, animatedStyle]} />
        <Animated.View style={[styles.skeletonBadge, bgStyle, animatedStyle]} />
      </View>

      <View style={styles.cardBody}>
        <Animated.View style={[styles.skeletonDate, bgStyle, animatedStyle]} />
        <Animated.View style={[styles.skeletonItems, bgStyle, animatedStyle]} />
      </View>

      <View style={[styles.divider, { backgroundColor: colors.border }]} />

      <View style={styles.cardFooter}>
        <Animated.View style={[styles.skeletonLabel, bgStyle, animatedStyle]} />
        <Animated.View
          style={[styles.skeletonAmount, bgStyle, animatedStyle]}
        />
      </View>
    </View>
  );
};

export const OrderListSkeleton = () => {
  const { colors, isDark } = useTheme();
  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: colors.background }]}
      edges={["top"]}
    >
      <View style={styles.header}>
        <View style={styles.backButton} />
        <View
          style={[
            styles.headerTitle,
            { backgroundColor: isDark ? "#2C2C2C" : "#E1E4E8", width: 120 },
          ]}
        />
        <View style={{ width: 24 }} />
      </View>
      <View style={styles.content}>
        {[1, 2, 3, 4].map((i) => (
          <SkeletonItem key={i} isDark={isDark} />
        ))}
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
    borderBottomWidth: 1,
    borderBottomColor: "rgba(0,0,0,0.05)",
  },
  backButton: {
    width: 24,
    height: 24,
  },
  headerTitle: {
    height: 20,
    borderRadius: 4,
  },
  content: {
    padding: 24,
  },
  card: {
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  skeletonId: {
    width: 100,
    height: 20,
    borderRadius: 4,
  },
  skeletonBadge: {
    width: 80,
    height: 24,
    borderRadius: 12,
  },
  cardBody: {
    marginBottom: 12,
  },
  skeletonDate: {
    width: 120,
    height: 16,
    borderRadius: 4,
    marginBottom: 8,
  },
  skeletonItems: {
    width: 60,
    height: 16,
    borderRadius: 4,
  },
  divider: {
    height: 1,
    marginVertical: 12,
  },
  cardFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  skeletonLabel: {
    width: 80,
    height: 16,
    borderRadius: 4,
  },
  skeletonAmount: {
    width: 70,
    height: 20,
    borderRadius: 4,
  },
});
