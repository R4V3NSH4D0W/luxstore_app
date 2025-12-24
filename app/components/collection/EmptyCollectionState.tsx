import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useTheme } from "../../context/theme-context";

interface EmptyCollectionStateProps {
  onBack: () => void;
}

export const EmptyCollectionState = ({ onBack }: EmptyCollectionStateProps) => {
  const { colors } = useTheme();

  return (
    <View style={styles.emptyContainer}>
      <Ionicons name="search-outline" size={48} color={colors.border} />
      <Text style={[styles.emptyTitle, { color: colors.text }]}>
        OUR APOLOGIES
      </Text>
      <Text style={[styles.emptyText, { color: colors.muted }]}>
        No products found in this collection yet.
      </Text>
      <TouchableOpacity
        style={[styles.emptyButton, { borderColor: colors.text }]}
        onPress={onBack}
      >
        <Text style={[styles.emptyButtonText, { color: colors.text }]}>
          GO BACK
        </Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  emptyContainer: {
    paddingVertical: 20,
    alignItems: "center",
    paddingHorizontal: 40,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: "900",
    letterSpacing: 4,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 14,
    textAlign: "center",
    marginBottom: 32,
    lineHeight: 20,
    fontWeight: "300",
  },
  emptyButton: {
    paddingVertical: 12,
    paddingHorizontal: 32,
    borderWidth: 1,
    borderRadius: 4,
  },
  emptyButtonText: {
    fontSize: 12,
    fontWeight: "800",
    letterSpacing: 2,
  },
});
