import { useTheme } from "@/app/context/theme-context";
import React, { useEffect } from "react";
import { Dimensions, StyleSheet, View } from "react-native";
import Animated, {
    useAnimatedStyle,
    useSharedValue,
    withRepeat,
    withTiming,
} from "react-native-reanimated";

const { width } = Dimensions.get("window");
const HERO_HEIGHT = 450;
const COLUMN_WIDTH = (width - 48 - 12) / 2;

export function CollectionSkeleton() {
  const { colors } = useTheme();
  const opacity = useSharedValue(0.3);

  useEffect(() => {
    opacity.value = withRepeat(withTiming(0.7, { duration: 1000 }), -1, true);
  }, [opacity]);

  const skeletonStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));

  const renderProductSkeleton = (key: number) => (
    <View key={key} style={styles.cardContainer}>
      <Animated.View
        style={[
          styles.imageSkeleton,
          skeletonStyle,
          { backgroundColor: colors.border },
        ]}
      />
      <Animated.View
        style={[
          styles.textSkeleton,
          skeletonStyle,
          { backgroundColor: colors.border, width: "80%" },
        ]}
      />
      <Animated.View
        style={[
          styles.textSkeleton,
          skeletonStyle,
          { backgroundColor: colors.border, width: "40%" },
        ]}
      />
    </View>
  );

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Hero Skeleton */}
      <View style={styles.heroContainer}>
        <Animated.View
          style={[
            styles.heroImage,
            skeletonStyle,
            { backgroundColor: colors.border },
          ]}
        />
        {/* <View style={styles.heroOverlay}>
          <Animated.View
            style={[
              styles.heroTitle,
              skeletonStyle,
              { backgroundColor: colors.card },
            ]}
          />
          <Animated.View
            style={[
              styles.heroDesc,
              skeletonStyle,
              { backgroundColor: colors.card },
            ]}
          />
        </View> */}
      </View>

      {/* Grid Skeleton */}
      <View style={styles.grid}>
        {[1, 2, 3, 4].map((i) => renderProductSkeleton(i))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  heroContainer: {
    height: HERO_HEIGHT,
    width: "100%",
  },
  heroImage: {
    ...StyleSheet.absoluteFillObject,
  },
  heroOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.1)",
    justifyContent: "center",
    alignItems: "center",
    padding: 40,
  },
  heroTitle: {
    height: 40,
    width: "60%",
    borderRadius: 4,
    marginBottom: 16,
  },
  heroDesc: {
    height: 60,
    width: "80%",
    borderRadius: 4,
  },
  grid: {
    padding: 24,
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  cardContainer: {
    width: COLUMN_WIDTH,
    marginBottom: 24,
  },
  imageSkeleton: {
    height: COLUMN_WIDTH * 1.3,
    width: "100%",
    borderRadius: 8,
    marginBottom: 12,
  },
  textSkeleton: {
    height: 12,
    borderRadius: 4,
    marginBottom: 8,
  },
});
