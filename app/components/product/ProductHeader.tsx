import { useToggleWishlist, useWishlist } from "@/app/api/wishlist";
import { useAuth } from "@/app/context/auth-context";
import { useTheme } from "@/app/context/theme-context";
import { useToast } from "@/app/context/toast-context";
import { Ionicons } from "@expo/vector-icons";
import { BlurView } from "expo-blur";
import * as Haptics from "expo-haptics";
import { useRouter } from "expo-router";
import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import Animated from "react-native-reanimated";

interface ProductHeaderProps {
  name: string;
  headerStyle: any;
  productId: string;
}

export const ProductHeader = ({
  name,
  headerStyle,
  productId,
}: ProductHeaderProps) => {
  const router = useRouter();
  const { colors, isDark } = useTheme();
  const { userToken } = useAuth();
  const { showToast } = useToast();

  const { data: wishlist } = useWishlist();
  const { mutate: toggleWishlist } = useToggleWishlist();

  const isWishlisted = wishlist?.some((w) => w.productId === productId);

  const handleBack = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    router.back();
  };

  const handleHeartPress = () => {
    if (!userToken) {
      showToast("Please sign in to modify wishlist", "info");
      return;
    }

    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    toggleWishlist(productId);
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
          <Text
            style={[styles.headerTitle, { color: colors.text }]}
            numberOfLines={1}
          >
            {name}
          </Text>
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
        <TouchableOpacity style={styles.iconButton} onPress={handleHeartPress}>
          <BlurView
            intensity={60}
            tint={isDark ? "dark" : "light"}
            style={styles.blurIconBg}
          >
            <Ionicons
              name={isWishlisted ? "heart" : "heart-outline"}
              size={22}
              color={isWishlisted ? "#FF6B6B" : colors.text}
            />
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
