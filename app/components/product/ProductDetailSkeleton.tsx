import { useTheme } from "@/app/context/theme-context";
import React from "react";
import { Dimensions, ScrollView, StyleSheet, View } from "react-native";
import { Skeleton } from "../common/Skeleton";

const { width } = Dimensions.get("window");

export const ProductDetailSkeleton = () => {
  const { colors } = useTheme();

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Hero Image */}
        <Skeleton height={480} borderRadius={0} />

        <View style={styles.content}>
          <View style={styles.textSection}>
            {/* Title Section */}
            <View style={styles.titleSection}>
              <View style={{ flex: 1 }}>
                <Skeleton width={100} height={12} style={{ marginBottom: 8 }} />
                <Skeleton width="80%" height={32} style={{ marginBottom: 8 }} />
              </View>
              <Skeleton width={80} height={32} />
            </View>

            {/* Badges */}
            <Skeleton
              width={120}
              height={30}
              borderRadius={15}
              style={{ marginBottom: 32 }}
            />

            {/* About Section */}
            <Skeleton width={80} height={20} style={{ marginBottom: 12 }} />
            <Skeleton width="100%" height={14} style={{ marginBottom: 8 }} />
            <Skeleton width="100%" height={14} style={{ marginBottom: 8 }} />
            <Skeleton width="60%" height={14} style={{ marginBottom: 32 }} />

            {/* Service Bar */}
            <Skeleton
              width="100%"
              height={80}
              borderRadius={12}
              style={{ marginBottom: 40 }}
            />
          </View>

          {/* Recommended Slider (Outside textSection for Full Bleed) */}
          <View style={styles.sliderHeader}>
            <Skeleton width={180} height={20} />
          </View>
          <View style={styles.sliderContent}>
            {[1, 2, 3].map((i) => (
              <View key={i} style={{ width: width * 0.45 }}>
                <Skeleton height={200} borderRadius={8} />
                <Skeleton width="80%" height={14} style={{ marginTop: 12 }} />
              </View>
            ))}
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
  content: {
    paddingTop: 24,
    marginTop: -20,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
  },
  textSection: {
    paddingHorizontal: 24,
  },
  titleSection: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 24,
  },
  sliderHeader: {
    paddingHorizontal: 24,
    marginBottom: 16,
  },
  sliderContent: {
    paddingHorizontal: 24,
    flexDirection: "row",
    gap: 16,
  },
});
