import { Address } from "@/types/api-types";
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useTheme } from "../../context/theme-context";

interface AddressCardProps {
  address: Address;
  onEdit: (address: Address) => void;
  onDelete: (id: string) => void;
}

export const AddressCard = ({
  address,
  onEdit,
  onDelete,
}: AddressCardProps) => {
  const { colors } = useTheme();

  const getIconName = () => {
    switch (address.type) {
      case "Work":
        return "briefcase-outline";
      case "Home":
        return "home-outline";
      default:
        return "location-outline";
    }
  };

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: colors.surface,
          shadowColor: "#000",
        },
      ]}
    >
      <View style={styles.content}>
        <View style={styles.topRow}>
          <View style={styles.iconBox}>
            <Ionicons name={getIconName()} size={24} color={colors.primary} />
          </View>
          <View style={styles.infoColumn}>
            <View style={styles.headerRow}>
              <Text style={[styles.typeText, { color: colors.muted }]}>
                {address.type || "HOME"}
              </Text>
              {address.isDefault && (
                <View
                  style={[
                    styles.defaultBadge,
                    { backgroundColor: colors.primary },
                  ]}
                >
                  <Text
                    style={[styles.defaultText, { color: colors.background }]}
                  >
                    DEFAULT
                  </Text>
                </View>
              )}
            </View>
            <Text style={[styles.name, { color: colors.text }]}>
              {address.name}
            </Text>
            <Text style={[styles.addressText, { color: colors.muted }]}>
              {address.street}, {address.city} {address.zip}
            </Text>
            {address.phone && (
              <Text
                style={[
                  styles.addressText,
                  { color: colors.muted, marginTop: 4 },
                ]}
              >
                {address.phone}
              </Text>
            )}
          </View>
        </View>

        <View style={[styles.actions, { borderTopColor: colors.border }]}>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => onEdit(address)}
            activeOpacity={0.7}
          >
            <Text style={[styles.actionText, { color: colors.text }]}>
              EDIT
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => onDelete(address.id)}
            activeOpacity={0.7}
          >
            <Text style={[styles.actionText, { color: "#FF3B30" }]}>
              DELETE
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: 16,
    marginBottom: 16,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
    marginHorizontal: 2,
  },
  content: {
    borderRadius: 16,
    overflow: "hidden",
  },
  topRow: {
    flexDirection: "row",
    padding: 20,
    paddingBottom: 16,
  },
  iconBox: {
    marginRight: 16,
    justifyContent: "flex-start",
    paddingTop: 2,
  },
  infoColumn: {
    flex: 1,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 6,
    gap: 8,
  },
  typeText: {
    fontSize: 10,
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 1.5,
  },
  defaultBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  defaultText: {
    fontSize: 8,
    fontWeight: "800",
    letterSpacing: 0.5,
  },
  name: {
    fontSize: 16,
    fontWeight: "700",
    marginBottom: 6,
    letterSpacing: 0.5,
  },
  addressText: {
    fontSize: 14,
    lineHeight: 20,
  },
  actions: {
    flexDirection: "row",
    borderTopWidth: 1,
    paddingVertical: 12,
  },
  actionButton: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  actionText: {
    fontSize: 12,
    fontWeight: "700",
    letterSpacing: 1,
  },
});
