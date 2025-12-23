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
import { useTheme } from "../context/theme-context";

const SkeletonItem = ({
  width,
  height,
  borderRadius = 4,
  style,
  skeletonColor = "#E1E4E8",
}: {
  width: number | string;
  height: number;
  borderRadius?: number;
  style?: any;
  skeletonColor?: string;
}) => {
  const opacity = useSharedValue(0.3);

  useEffect(() => {
    opacity.value = withRepeat(
      withSequence(
        withTiming(0.7, { duration: 800 }),
        withTiming(0.3, { duration: 800 })
      ),
      -1,
      true
    );
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));

  return (
    <Animated.View
      style={[
        {
          width,
          height,
          borderRadius,
          backgroundColor: skeletonColor,
        },
        animatedStyle,
        style,
      ]}
    />
  );
};

export default function ProfileSkeleton() {
  const { colors, isDark } = useTheme();
  const skeletonColor = isDark ? "#2C2C2E" : "#E1E4E8";
  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.content}>
          {/* Header */}
          <View style={styles.header}>
            <SkeletonItem
              width={150}
              height={34}
              borderRadius={8}
              skeletonColor={skeletonColor}
            />
          </View>

          {/* User Info */}
          <View style={styles.userInfo}>
            <SkeletonItem
              width={80}
              height={80}
              borderRadius={40}
              skeletonColor={skeletonColor}
            />
            <View style={styles.userDetails}>
              <SkeletonItem
                width={120}
                height={24}
                style={{ marginBottom: 8 }}
                skeletonColor={skeletonColor}
              />
              <SkeletonItem
                width={180}
                height={16}
                skeletonColor={skeletonColor}
              />
            </View>
          </View>

          {/* Menu Sections - Mimicking the layout */}
          {[1, 2, 3].map((section, index) => (
            <View key={index} style={styles.section}>
              <SkeletonItem
                width={80}
                height={16}
                style={{ marginBottom: 12, marginLeft: 4 }}
                skeletonColor={skeletonColor}
              />
              <View
                style={[styles.sectionBody, { backgroundColor: colors.card }]}
              >
                {[1, 2, 3].map((row, rowIndex) => (
                  <View key={rowIndex}>
                    <View style={styles.menuRow}>
                      <SkeletonItem
                        width={32}
                        height={32}
                        borderRadius={8}
                        style={{ marginRight: 16 }}
                        skeletonColor={skeletonColor}
                      />
                      <View style={{ flex: 1 }}>
                        <SkeletonItem
                          width={100}
                          height={16}
                          skeletonColor={skeletonColor}
                        />
                      </View>
                      <SkeletonItem
                        width={16}
                        height={16}
                        borderRadius={8}
                        skeletonColor={skeletonColor}
                      />
                    </View>
                    {rowIndex < 2 && (
                      <View
                        style={[
                          styles.divider,
                          { backgroundColor: colors.border },
                        ]}
                      />
                    )}
                  </View>
                ))}
              </View>
            </View>
          ))}
        </View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F4F6F8",
  },
  safeArea: {
    flex: 1,
  },
  content: {
    paddingHorizontal: 24,
    paddingTop: 20,
  },
  header: {
    marginBottom: 30,
  },
  userInfo: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 40,
  },
  userDetails: {
    flex: 1,
    marginLeft: 20,
  },
  section: {
    marginBottom: 30,
  },
  sectionBody: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    overflow: "hidden",
    padding: 16,
  },
  menuRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12, // Adjusted to match perceived padding less actual height
  },
  divider: {
    height: 1,
    backgroundColor: "#F4F6F8",
    marginVertical: 4,
  },
});
