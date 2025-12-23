import { useTheme } from "@/app/context/theme-context";
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { StyleSheet, Text, View } from "react-native";

const BENEFITS = [
  {
    icon: "shield-checkmark-outline",
    title: "SECURE VAULT",
    description: "Multi-layered encryption for all transactions.",
  },
  {
    icon: "airplane-outline",
    title: "GLOBAL CONCIERGE",
    description: "Insured express delivery to 150+ countries.",
  },
  {
    icon: "diamond-outline",
    title: "ESTATE CARE",
    description: "Professional cleaning & maintenance guides.",
  },
];

export const BenefitsSection = () => {
  const { colors, isDark } = useTheme();

  return (
    <View
      style={[
        styles.container,
        { backgroundColor: isDark ? "#111" : "#F9F9F9" },
      ]}
    >
      {BENEFITS.map((item, index) => (
        <View
          key={index}
          style={[
            styles.benefitItem,
            index !== BENEFITS.length - 1 && {
              borderBottomWidth: StyleSheet.hairlineWidth,
              borderBottomColor: colors.border,
            },
          ]}
        >
          <View style={[styles.iconContainer, { borderColor: colors.primary }]}>
            <Ionicons name={item.icon as any} size={22} color={colors.text} />
          </View>
          <View style={styles.textContainer}>
            <Text style={[styles.title, { color: colors.text }]}>
              {item.title}
            </Text>
            <Text style={[styles.description, { color: colors.muted }]}>
              {item.description}
            </Text>
          </View>
        </View>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginTop: 40,
    paddingVertical: 40,
    paddingHorizontal: 24,
  },
  benefitItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 24,
    gap: 20,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    borderWidth: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  textContainer: {
    flex: 1,
  },
  title: {
    fontSize: 14,
    fontWeight: "800",
    letterSpacing: 1.5,
    marginBottom: 4,
  },
  description: {
    fontSize: 13,
    lineHeight: 18,
  },
});
