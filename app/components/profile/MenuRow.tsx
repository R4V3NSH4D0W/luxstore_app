import { Ionicons } from "@expo/vector-icons";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useTheme } from "../../context/theme-context";

interface MenuRowProps {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  onPress?: () => void;
  isDestructive?: boolean;
}

export default function MenuRow({
  icon,
  label,
  onPress,
  isDestructive = false,
}: MenuRowProps) {
  const { colors } = useTheme();

  return (
    <TouchableOpacity
      style={[styles.menuRow, { backgroundColor: colors.card }]}
      onPress={onPress}
    >
      <View
        style={[
          styles.iconBox,
          { backgroundColor: colors.tint },
          isDestructive && styles.destructiveIconBox,
        ]}
      >
        <Ionicons
          name={icon}
          size={22}
          color={isDestructive ? "#FF3B30" : colors.text}
        />
      </View>
      <Text
        style={[
          styles.menuLabel,
          { color: colors.text },
          isDestructive && styles.destructiveLabel,
        ]}
      >
        {label}
      </Text>
      <Ionicons name="chevron-forward" size={20} color={colors.muted} />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  menuRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 16,
    paddingHorizontal: 16,
  },
  iconBox: {
    width: 32,
    height: 32,
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
  },
  destructiveIconBox: {
    backgroundColor: "rgba(255, 59, 48, 0.1)",
  },
  menuLabel: {
    flex: 1,
    fontSize: 16,
    fontWeight: "500",
  },
  destructiveLabel: {
    color: "#FF3B30",
  },
});
