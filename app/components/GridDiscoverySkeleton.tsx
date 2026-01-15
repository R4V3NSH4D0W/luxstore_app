import React, { useEffect } from "react";
import { Dimensions, StyleSheet, View } from "react-native";
import Animated, {
    useAnimatedStyle,
    useSharedValue,
    withRepeat,
    withSequence,
    withTiming,
} from "react-native-reanimated";
import { SafeAreaView } from "react-native-safe-area-context";
import { useTheme } from "../context/theme-context";

const { width } = Dimensions.get("window");
const COLUMN_WIDTH = (width - 48 - 12) / 2;
const CARD_ASPECT_RATIO = 3 / 4;

export const GridDiscoverySkeleton = () => {
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

  const renderCard = (index: number) => (
    <View key={index} style={styles.cardContainer}>
      <Animated.View
        style={[
          styles.card,
          animatedStyle,
          { backgroundColor: isDark ? "#222" : "#F5F5F5" },
        ]}
      />
    </View>
  );

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <SafeAreaView edges={["top"]}>
        <View style={styles.header}>
          <Animated.View
            style={[
              styles.backButtonSkeleton,
              animatedStyle,
              { backgroundColor: isDark ? "#222" : "#F5F5F5" },
            ]}
          />
          <Animated.View
            style={[
              styles.titleSkeleton,
              animatedStyle,
              { backgroundColor: isDark ? "#222" : "#F5F5F5" },
            ]}
          />
          <View style={{ width: 40 }} />
        </View>

        <View style={styles.searchContainer}>
          <Animated.View
            style={[
              styles.searchBarSkeleton,
              animatedStyle,
              { backgroundColor: isDark ? "#222" : "#F5F5F5" },
            ]}
          />
        </View>
      </SafeAreaView>

      <View style={styles.listContent}>
        <View style={styles.columnWrapper}>
          {[1, 2, 3, 4, 5, 6].map((_, i) => renderCard(i))}
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    height: 60,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    marginBottom: 8,
  },
  backButtonSkeleton: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  titleSkeleton: {
    width: 100,
    height: 16,
    borderRadius: 4,
  },
  searchContainer: {
    paddingHorizontal: 24,
    marginBottom: 16,
  },
  searchBarSkeleton: {
    height: 48,
    borderRadius: 12,
  },
  listContent: {
    paddingHorizontal: 20,
    paddingTop: 8,
  },
  columnWrapper: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  cardContainer: {
    width: COLUMN_WIDTH,
    aspectRatio: CARD_ASPECT_RATIO,
    borderRadius: 16,
    overflow: "hidden",
    marginBottom: 12,
  },
  card: {
    flex: 1,
  },
});
