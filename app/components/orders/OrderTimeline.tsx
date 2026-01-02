import { useTheme } from "@/app/context/theme-context";
import { Order } from "@/types/api-types";
import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { StyleSheet, Text, View } from "react-native";

interface OrderTimelineProps {
  order: Order;
}

const STEPS = [
  { key: "pending", label: "Order Placed", icon: "cart-outline" },
  { key: "processing", label: "Processing", icon: "cube-outline" },
  { key: "shipped", label: "Shipping", icon: "bus-outline" },
  { key: "delivered", label: "Delivered", icon: "home-outline" },
];

export const OrderTimeline: React.FC<OrderTimelineProps> = ({ order }) => {
  const { colors, isDark } = useTheme();

  // Determine current step index
  let currentStepIndex = 0;
  const status = order.status.toLowerCase();

  if (status === "cancelled" || status === "refunded") {
    return (
      <View style={[styles.container, { backgroundColor: colors.surface }]}>
        <View style={styles.cancelledContainer}>
          <Ionicons name="close-circle" size={32} color="#ef4444" />
          <Text style={[styles.cancelledText, { color: "#ef4444" }]}>
            Order Cancelled
          </Text>
        </View>
      </View>
    );
  }

  if (status === "delivered" || status === "completed") {
    currentStepIndex = 3;
  } else if (status === "shipped") {
    currentStepIndex = 2;
  } else if (status === "processing" || status === "confirmed") {
    currentStepIndex = 1;
  } else {
    currentStepIndex = 0; // pending or awaiting_payment
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.surface }]}>
      <Text style={[styles.title, { color: colors.text }]}>Order Status</Text>
      <View style={styles.timeline}>
        {STEPS.map((step, index) => {
          const isActive = index <= currentStepIndex;
          const isLast = index === STEPS.length - 1;

          return (
            <View key={step.key} style={styles.stepRow}>
              {/* Left Side: Line & Dot */}
              <View style={styles.indicatorContainer}>
                <View
                  style={[
                    styles.dot,
                    {
                      backgroundColor: isActive
                        ? colors.primary
                        : colors.border,
                      borderColor: isActive ? colors.primary : colors.border,
                    },
                  ]}
                >
                  {isActive && (
                    <Ionicons name="checkmark" size={10} color="#FFF" />
                  )}
                </View>
                {!isLast && (
                  <View
                    style={[
                      styles.line,
                      {
                        backgroundColor:
                          index < currentStepIndex
                            ? colors.primary
                            : colors.border,
                      },
                    ]}
                  />
                )}
              </View>

              {/* Right Side: Content */}
              <View style={styles.contentContainer}>
                <Text
                  style={[
                    styles.stepLabel,
                    {
                      color: isActive ? colors.text : colors.muted,
                      fontWeight: isActive ? "700" : "400",
                    },
                  ]}
                >
                  {step.label}
                </Text>
                {/* Dates */}
                {isActive && (
                  <Text style={[styles.dateText, { color: colors.muted }]}>
                    {step.key === "pending" &&
                      new Date(order.createdAt).toLocaleDateString()}
                    {step.key === "processing" &&
                      order.processingAt &&
                      new Date(order.processingAt).toLocaleDateString()}
                    {step.key === "shipped" &&
                      order.shippedAt &&
                      new Date(order.shippedAt).toLocaleDateString()}
                    {step.key === "delivered" &&
                      order.deliveredAt &&
                      new Date(order.deliveredAt).toLocaleDateString()}
                  </Text>
                )}
              </View>
            </View>
          );
        })}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
    borderRadius: 16,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  title: {
    fontSize: 16,
    fontWeight: "700",
    marginBottom: 20,
  },
  timeline: {
    marginLeft: 4,
  },
  stepRow: {
    flexDirection: "row",
    minHeight: 50,
  },
  indicatorContainer: {
    alignItems: "center",
    marginRight: 16,
    width: 24,
  },
  dot: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    alignItems: "center",
    justifyContent: "center",
    zIndex: 2,
  },
  line: {
    width: 2,
    flex: 1,
    marginVertical: 4,
  },
  contentContainer: {
    flex: 1,
    paddingBottom: 4, // Offset for line height
  },
  stepLabel: {
    fontSize: 14,
    marginBottom: 4,
  },
  dateText: {
    fontSize: 11,
  },
  cancelledContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  cancelledText: {
    fontSize: 16,
    fontWeight: "700",
  },
});
