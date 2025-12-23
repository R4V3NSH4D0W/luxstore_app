import { useTheme } from "@/app/context/theme-context";
import { Ionicons } from "@expo/vector-icons";
import { BlurView } from "expo-blur";
import * as Haptics from "expo-haptics";
import { useRouter } from "expo-router";
import React from "react";
import { StyleSheet, TouchableOpacity, View } from "react-native";
import Animated from "react-native-reanimated";

interface CategoryHeaderProps {
  name: string;
  headerStyle: any;
}

export const CategoryHeader = ({ name, headerStyle }: CategoryHeaderProps) => {
  const router = useRouter();
  const { colors, isDark } = useTheme();

  const handleBack = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    router.back();
  };

  return (
    <>
      <Animated.View style={[styles.header, headerStyle]}>
        <BlurView
          intensity={80}
          tint={isDark ? "dark" : "light"}
          style={StyleSheet.absoluteFill}
        />
        <View style={styles.headerContent}>
          <Animated.Text
            style={[styles.headerTitle, { color: colors.text }]}
            numberOfLines={1}
          >
            {name}
          </Animated.Text>
        </View>
      </Animated.View>

      <View style={styles.floatingHeader}>
        <TouchableOpacity onPress={handleBack} style={styles.iconButton}>
          <BlurView
            intensity={60}
            tint={isDark ? "dark" : "light"}
            style={styles.blurIconBg}
          >
            <Ionicons name="chevron-back" size={24} color={colors.text} />
          </BlurView>
        </TouchableOpacity>
      </View>
    </>
  );
};

const styles = StyleSheet.create({
  header: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    paddingTop: 44,
    height: 100,
    zIndex: 10,
    justifyContent: "center",
  },
  headerContent: {
    alignItems: "center",
    paddingHorizontal: 60,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: "700",
    letterSpacing: 0.5,
  },
  floatingHeader: {
    position: "absolute",
    top: 50,
    left: 20,
    right: 20,
    flexDirection: "row",
    justifyContent: "space-between",
    zIndex: 20,
  },
  iconButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    overflow: "hidden",
  },
  blurIconBg: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});
