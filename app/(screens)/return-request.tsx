import { useOrder } from "@/app/api/orders";
import { returns } from "@/app/api/returns";
import { useTheme } from "@/app/context/theme-context";
import { getImageUrl } from "@/app/lib/api-client";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const RETURN_REASONS = [
  "Does not fit",
  "Changed my mind",
  "Item defective or damaged",
  "Not as described",
  "Received wrong item",
  "Other",
];

export default function ReturnRequestScreen() {
  const { orderId } = useLocalSearchParams<{ orderId: string }>();
  const { colors, isDark } = useTheme();
  const router = useRouter();

  const { data: response, isLoading: orderLoading } = useOrder(orderId);
  const order = response?.data;

  const [selectedItems, setSelectedItems] = useState<Record<string, number>>(
    {}
  );
  const [reason, setReason] = useState("");
  const [description, setDescription] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const toggleItemSelection = (itemId: string, maxQty: number) => {
    setSelectedItems((prev) => {
      const current = prev[itemId] || 0;
      const next = current > 0 ? 0 : 1; // Toggle between 0 and 1 initialQty
      const newItems = { ...prev };
      if (next === 0) {
        delete newItems[itemId];
      } else {
        newItems[itemId] = 1;
      }
      return newItems;
    });
  };

  const updateQuantity = (itemId: string, delta: number, maxQty: number) => {
    setSelectedItems((prev) => {
      const current = prev[itemId] || 0;
      const next = Math.max(0, Math.min(maxQty, current + delta));
      const newItems = { ...prev };
      if (next === 0) {
        delete newItems[itemId];
      } else {
        newItems[itemId] = next;
      }
      return newItems;
    });
  };

  const handleSubmit = async () => {
    if (Object.keys(selectedItems).length === 0) {
      Alert.alert("Error", "Please select at least one item to return");
      return;
    }
    if (!reason) {
      Alert.alert("Error", "Please select a reason for return");
      return;
    }

    setSubmitting(true);
    try {
      const items = Object.entries(selectedItems).map(([itemId, qty]) => ({
        orderItemId: itemId,
        quantity: qty,
        reason: reason, // Currently applying main reason to all items
      }));

      await returns.createReturnRequest({
        orderId: orderId!,
        items,
        reason,
        description,
      });

      Alert.alert("Success", "Return request submitted successfully", [
        {
          text: "OK",
          onPress: () => router.replace("/(screens)/my-returns"),
        },
      ]);
    } catch (error: any) {
      Alert.alert("Error", error.message || "Failed to submit return request");
    } finally {
      setSubmitting(false);
    }
  };

  if (orderLoading || !order) {
    return (
      <View
        style={[
          styles.container,
          { backgroundColor: colors.background, justifyContent: "center" },
        ]}
      >
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: colors.background }]}
      edges={["top"]}
    >
      {/* Header */}
      <View style={[styles.header, { borderBottomColor: colors.border }]}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backButton}
        >
          <Ionicons name="close" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>
          REQUEST RETURN
        </Text>
        <View style={{ width: 24 }} />
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
        keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 20}
      >
        <ScrollView
          contentContainerStyle={[styles.content, { paddingBottom: 100 }]}
        >
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            Select Items to Return
          </Text>

          {order.items.map((item) => {
            const isSelected = !!selectedItems[item.id];
            const qty = selectedItems[item.id] || 0;

            return (
              <View
                key={item.id}
                style={[
                  styles.itemCard,
                  {
                    backgroundColor: colors.surface,
                    borderColor: isSelected ? colors.primary : "transparent",
                    borderWidth: 1,
                  },
                ]}
              >
                <TouchableOpacity
                  style={styles.itemRow}
                  onPress={() => toggleItemSelection(item.id, item.quantity)}
                  activeOpacity={0.7}
                >
                  <View
                    style={[
                      styles.checkbox,
                      {
                        borderColor: isSelected ? colors.primary : colors.muted,
                      },
                    ]}
                  >
                    {isSelected && (
                      <View
                        style={[
                          styles.checkedCircle,
                          { backgroundColor: colors.primary },
                        ]}
                      />
                    )}
                  </View>

                  <Image
                    source={{
                      uri: getImageUrl(
                        item.displayImage || item.product.images[0]
                      ),
                    }}
                    style={[
                      styles.itemImage,
                      { backgroundColor: colors.background },
                    ]}
                  />

                  <View style={styles.itemInfo}>
                    <Text
                      style={[styles.itemName, { color: colors.text }]}
                      numberOfLines={1}
                    >
                      {item.product.name}
                    </Text>
                    <Text style={[styles.itemVariant, { color: colors.muted }]}>
                      Qty Purchased: {item.quantity}
                    </Text>
                  </View>
                </TouchableOpacity>

                {isSelected && (
                  <View
                    style={[
                      styles.qtyControl,
                      { borderTopColor: colors.border },
                    ]}
                  >
                    <Text style={[styles.qtyLabel, { color: colors.text }]}>
                      Return Qty:
                    </Text>
                    <View style={styles.stepper}>
                      <TouchableOpacity
                        onPress={() =>
                          updateQuantity(item.id, -1, item.quantity)
                        }
                        style={[
                          styles.stepBtn,
                          {
                            backgroundColor: colors.card,
                            borderWidth: 1,
                            borderColor: colors.border,
                          },
                        ]}
                      >
                        <Ionicons name="remove" size={16} color={colors.text} />
                      </TouchableOpacity>
                      <Text style={[styles.qtyText, { color: colors.text }]}>
                        {qty}
                      </Text>
                      <TouchableOpacity
                        onPress={() =>
                          updateQuantity(item.id, 1, item.quantity)
                        }
                        style={[
                          styles.stepBtn,
                          {
                            backgroundColor: colors.card,
                            borderWidth: 1,
                            borderColor: colors.border,
                          },
                        ]}
                      >
                        <Ionicons name="add" size={16} color={colors.text} />
                      </TouchableOpacity>
                    </View>
                  </View>
                )}
              </View>
            );
          })}

          <Text
            style={[styles.sectionTitle, { color: colors.text, marginTop: 24 }]}
          >
            Reason for Return
          </Text>
          <View style={styles.reasonsGrid}>
            {RETURN_REASONS.map((r) => (
              <TouchableOpacity
                key={r}
                style={[
                  styles.reasonChip,
                  {
                    backgroundColor:
                      reason === r ? colors.primary : colors.surface,
                    borderColor: reason === r ? colors.primary : colors.border,
                  },
                ]}
                onPress={() => setReason(r)}
              >
                <Text
                  style={[
                    styles.reasonText,
                    {
                      color:
                        reason === r
                          ? isDark
                            ? "#000000"
                            : "#FFFFFF"
                          : colors.text,
                    },
                  ]}
                >
                  {r}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <Text
            style={[styles.sectionTitle, { color: colors.text, marginTop: 24 }]}
          >
            Additional Comments (Optional)
          </Text>
          <TextInput
            style={[
              styles.input,
              {
                backgroundColor: colors.surface,
                color: colors.text,
                borderColor: colors.border,
              },
            ]}
            placeholder="Describe the issue..."
            placeholderTextColor={colors.muted}
            multiline
            numberOfLines={4}
            value={description}
            onChangeText={setDescription}
          />
        </ScrollView>

        <View
          style={[
            styles.footer,
            {
              // backgroundColor: colors.surface,
              borderTopColor: colors.border,
              paddingBottom: Platform.OS === "ios" ? 0 : 20,
            },
          ]}
        >
          <TouchableOpacity
            style={[
              styles.submitBtn,
              {
                backgroundColor:
                  Object.keys(selectedItems).length > 0 && reason
                    ? colors.primary
                    : colors.muted,
              },
            ]}
            onPress={handleSubmit}
            disabled={
              submitting || Object.keys(selectedItems).length === 0 || !reason
            }
          >
            {submitting ? (
              <ActivityIndicator color={isDark ? "#000000" : "#FFFFFF"} />
            ) : (
              <Text
                style={[
                  styles.submitBtnText,
                  { color: isDark ? "#000000" : "#FFFFFF" },
                ]}
              >
                SUBMIT REQUEST
              </Text>
            )}
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
  },
  backButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: "700",
    letterSpacing: 1,
  },
  content: {
    padding: 20,
    paddingBottom: 100,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "700",
    marginBottom: 16,
  },
  itemCard: {
    borderRadius: 12,
    marginBottom: 12,
    overflow: "hidden",
  },
  itemRow: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  checkedCircle: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  itemImage: {
    width: 50,
    height: 50,
    borderRadius: 8,
    marginRight: 12,
  },
  itemInfo: {
    flex: 1,
  },
  itemName: {
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 4,
  },
  itemVariant: {
    fontSize: 12,
  },
  qtyControl: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 12,
    borderTopWidth: 1,
  },
  qtyLabel: {
    fontSize: 14,
    fontWeight: "500",
  },
  stepper: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  stepBtn: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  qtyText: {
    fontSize: 14,
    fontWeight: "600",
    width: 20,
    textAlign: "center",
  },
  reasonsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  reasonChip: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 1,
  },
  reasonText: {
    fontSize: 13,
    fontWeight: "500",
  },
  input: {
    borderRadius: 12,
    borderWidth: 1,
    padding: 12,
    height: 100,
    textAlignVertical: "top",
    fontSize: 14,
  },
  footer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 24,
    paddingTop: 20,
    // borderTopWidth: 1,
  },
  submitBtn: {
    height: 56,
    borderRadius: 28,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 4.65,
    elevation: 8,
  },
  submitBtnText: {
    fontSize: 16,
    fontWeight: "700",
    letterSpacing: 1,
  },
});
