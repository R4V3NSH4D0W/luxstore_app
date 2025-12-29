import { BlurView } from "expo-blur";
import React from "react";
import {
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from "react-native";
import { useTheme } from "../../context/theme-context";

type AlertButton = {
  text: string;
  style?: "default" | "cancel" | "destructive";
  onPress?: () => void;
};

interface CustomAlertProps {
  visible: boolean;
  title: string;
  message?: string;
  buttons?: AlertButton[];
  onClose?: () => void; // Called when background is tapped or implicit cancel
}

export const CustomAlert = ({
  visible,
  title,
  message,
  buttons = [{ text: "OK", style: "default" }],
  onClose,
}: CustomAlertProps) => {
  const { colors, isDark } = useTheme();

  return (
    <Modal
      transparent
      visible={visible}
      animationType="fade"
      onRequestClose={onClose}
    >
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.overlay}>
          {/* Blur background for premium feel */}
          <BlurView
            intensity={20}
            tint={isDark ? "dark" : "light"}
            style={StyleSheet.absoluteFill}
          />

          <TouchableWithoutFeedback>
            <View
              style={[
                styles.alertContainer,
                { backgroundColor: colors.surface, borderColor: colors.border },
              ]}
            >
              <View style={styles.content}>
                {/* Optional Icon based on context? Stick to simple for now or dynamic props. */}
                <Text style={[styles.title, { color: colors.text }]}>
                  {title}
                </Text>
                {message && (
                  <Text style={[styles.message, { color: colors.muted }]}>
                    {message}
                  </Text>
                )}
              </View>

              <View style={[styles.actions, { borderTopColor: colors.border }]}>
                {buttons.map((btn, index) => {
                  const isLast = index === buttons.length - 1;
                  const isCancel = btn.style === "cancel";
                  const isDestructive = btn.style === "destructive";

                  return (
                    <TouchableOpacity
                      key={index}
                      style={[
                        styles.button,
                        !isLast && {
                          borderRightWidth: 1,
                          borderRightColor: colors.border,
                        },
                      ]}
                      onPress={() => {
                        btn.onPress?.();
                        if (!btn.onPress && onClose) onClose(); // Default close behavior
                      }}
                    >
                      <Text
                        style={[
                          styles.buttonText,
                          {
                            color: isDestructive
                              ? "#FF3B30"
                              : isCancel
                              ? colors.muted
                              : colors.primary,
                            fontWeight: isCancel ? "400" : "600",
                          },
                        ]}
                      >
                        {btn.text}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
    padding: 40,
  },
  alertContainer: {
    width: "100%",
    maxWidth: 320,
    borderRadius: 0, // Sharp edges as requested
    borderWidth: 1,
    overflow: "hidden",
    elevation: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
  },
  content: {
    padding: 32, // More breathable padding
    alignItems: "center",
  },
  title: {
    fontSize: 16,
    fontWeight: "700",
    marginBottom: 12,
    textAlign: "center",
    textTransform: "uppercase", // Premium styling
    letterSpacing: 1,
  },
  message: {
    fontSize: 14,
    textAlign: "center",
    lineHeight: 22,
    opacity: 0.8,
  },
  actions: {
    flexDirection: "row",
    borderTopWidth: 1,
    height: 56, // Taller buttons
  },
  button: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  buttonText: {
    fontSize: 13, // Slightly smaller for uppercase
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: 1.5,
  },
});
