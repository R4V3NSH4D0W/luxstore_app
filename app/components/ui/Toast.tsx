import { Ionicons } from "@expo/vector-icons";
import { BlurView } from "expo-blur";
import React from "react";
import { StyleSheet, Text, View } from "react-native";
import Animated, { FadeInUp, FadeOutUp } from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useTheme } from "../../context/theme-context";

export type ToastType = "success" | "error" | "info";

interface ToastProps {
  message: string;
  type: ToastType;
  visible: boolean;
  onHide: () => void;
}

export const Toast = ({ message, type, visible, onHide }: ToastProps) => {
  const insets = useSafeAreaInsets();
  const { colors, isDark } = useTheme();

  return (
    <>
      {visible && (
        <Animated.View
          entering={FadeInUp.springify().damping(15)}
          exiting={FadeOutUp.duration(200)}
          style={[styles.container, { top: insets.top + 10 }]}
        >
          <BlurView
            intensity={90}
            tint={isDark ? "dark" : "light"}
            style={[
              styles.blurContainer,
              // Fallback border for Android/old iOS
              { borderColor: colors.border, borderWidth: 1 },
            ]}
          >
            <View style={styles.content}>
              <View
                style={[
                  styles.iconContainer,
                  {
                    backgroundColor:
                      type === "success"
                        ? "#4CAF50"
                        : type === "error"
                        ? "#F44336"
                        : "#2196F3",
                  },
                ]}
              >
                <Ionicons
                  name={
                    type === "success"
                      ? "checkmark"
                      : type === "error"
                      ? "alert-outline"
                      : "information"
                  }
                  size={16}
                  color="#FFF"
                />
              </View>
              <Text style={[styles.message, { color: colors.text }]}>
                {message}
              </Text>
            </View>
          </BlurView>
        </Animated.View>
      )}
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    left: 20,
    right: 20,
    alignItems: "center",
    zIndex: 9999,
  },
  blurContainer: {
    width: "100%",
    borderRadius: 16,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },
  content: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
  },
  iconContainer: {
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  message: {
    fontSize: 14,
    fontWeight: "600",
    flex: 1,
  },
});
