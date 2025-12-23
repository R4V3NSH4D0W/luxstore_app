import { useTheme } from "@/app/context/theme-context";
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { StyleSheet, Text, View } from "react-native";
import Animated, { FadeInUp } from "react-native-reanimated";

const SERVICES = [
  {
    icon: "shield-checkmark-outline",
    label: "Authenticity Guaranteed",
  },
  {
    icon: "airplane-outline",
    label: "Express Concierge",
  },
  {
    icon: "gift-outline",
    label: "Luxury Packaging",
  },
];

export const LuxuryServiceBar = () => {
  const { colors, isDark } = useTheme();

  return (
    <Animated.View
      entering={FadeInUp.delay(800).duration(800)}
      style={[
        styles.container,
        {
          backgroundColor: isDark
            ? "rgba(255,255,255,0.03)"
            : "rgba(0,0,0,0.02)",
        },
        { borderColor: colors.border },
      ]}
    >
      {SERVICES.map((service, index) => (
        <View key={index} style={styles.serviceItem}>
          <Ionicons name={service.icon as any} size={18} color={colors.text} />
          <Text style={[styles.label, { color: colors.text }]}>
            {service.label}
          </Text>
        </View>
      ))}
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 20,
    paddingHorizontal: 16,
    borderRadius: 12,
    borderWidth: 1,
    marginVertical: 10,
  },
  serviceItem: {
    flexDirection: "column",
    alignItems: "center",
    gap: 6,
    flex: 1,
  },
  label: {
    fontSize: 9,
    fontWeight: "800",
    letterSpacing: 0.5,
    textAlign: "center",
    textTransform: "uppercase",
    opacity: 0.8,
  },
});
