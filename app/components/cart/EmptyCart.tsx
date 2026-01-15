import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useTheme } from "../../context/theme-context";

export const EmptyCart = () => {
  const { colors, isDark } = useTheme();
  const router = useRouter();

  return (
    <View style={styles.container}>
      <Ionicons name="cart-outline" size={64} color={colors.border} />
      <Text style={[styles.title, { color: colors.text }]}>
        YOUR BAG IS EMPTY
      </Text>
      <Text style={[styles.subtitle, { color: colors.muted }]}>
        {"Looks like you haven't added any luxury items yet."}
      </Text>

      <TouchableOpacity
        style={[styles.button, { backgroundColor: colors.primary }]}
        onPress={() => router.push("/(tabs)")}
      >
        <Text
          style={[
            styles.buttonText,
            { color: isDark ? colors.background : "#FFF" },
          ]}
        >
          START SHOPPING
        </Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 40,
  },
  title: {
    fontSize: 18,
    fontWeight: "900",
    letterSpacing: 2,
    marginTop: 24,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    textAlign: "center",
    lineHeight: 20,
    marginBottom: 32,
  },
  button: {
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 30,
  },
  buttonText: {
    fontSize: 12,
    fontWeight: "800",
    letterSpacing: 2,
  },
});
