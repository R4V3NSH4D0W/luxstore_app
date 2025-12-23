import { useTheme } from "@/app/context/theme-context";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

export const ProductBottomBar = () => {
  const { colors, isDark } = useTheme();

  const handleAddToCart = () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(
      () => {}
    );
    // Add to cart logic will be integrated by user or in next steps if needed
  };

  return (
    <View style={styles.bottomBar}>
      <TouchableOpacity
        style={[styles.primaryButton, { backgroundColor: colors.primary }]}
        onPress={handleAddToCart}
        activeOpacity={0.8}
      >
        <Ionicons
          name="cart-outline"
          size={20}
          color={isDark ? colors.background : "#FFF"}
          style={{ marginRight: 8 }}
        />
        <Text
          style={[
            styles.buttonText,
            { color: isDark ? colors.background : "#FFF" },
          ]}
        >
          Add to Bag
        </Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  bottomBar: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: 100,
    paddingHorizontal: 24,
    paddingTop: 16,
    flexDirection: "row",
    justifyContent: "center",
  },
  primaryButton: {
    width: "100%",
    height: 56,
    borderRadius: 28,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 8,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: "800",
    letterSpacing: 1,
  },
});
