import { ApiResponse, PaymentMethod } from "@/types/api-types";
import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect } from "@react-navigation/native";
import { useStripe } from "@stripe/stripe-react-native";
import { useQuery } from "@tanstack/react-query";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  BackHandler,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { CustomAlert } from "../../components/common/CustomAlert";
import { useCart } from "../../context/cart-context";
import { useCurrency } from "../../context/currency-context";
import { useTheme } from "../../context/theme-context";
import { useToast } from "../../context/toast-context";
import { usePayment } from "../../hooks/usePayment";
import { api } from "../../lib/api-client";

export default function PaymentScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const orderId = params.orderId as string;
  const { colors, isDark } = useTheme();
  const { showToast } = useToast();
  const { clearCart } = useCart();
  const [isProcessing, setIsProcessing] = useState(false);
  const { initiateEsewa, initiateKhalti } = usePayment();

  const [alertConfig, setAlertConfig] = useState<{
    visible: boolean;
    title: string;
    message?: string;
    buttons?: any[];
  }>({ visible: false, title: "" });

  const hideAlert = () =>
    setAlertConfig((prev) => ({ ...prev, visible: false }));

  useFocusEffect(
    React.useCallback(() => {
      const onBackPress = () => {
        showAlert(
          "Incomplete Payment",
          "Your order has been saved as 'Awaiting Payment'. You can complete it later from My Orders.",
          [
            { text: "Stay", style: "cancel", onPress: () => {} },
            {
              text: "Leave",
              style: "destructive",
              onPress: () =>
                router.replace({
                  pathname: "/(screens)/orders",
                  params: { fromCheckout: "true" },
                }),
            },
          ]
        );
        return true;
      };

      const subscription = BackHandler.addEventListener(
        "hardwareBackPress",
        onBackPress
      );

      return () => subscription.remove();
    }, [])
  );

  const showAlert = (title: string, message?: string, buttons?: any[]) => {
    const wrappedButtons = buttons
      ? buttons.map((btn) => ({
          ...btn,
          onPress: () => {
            hideAlert();
            btn.onPress?.();
          },
        }))
      : [{ text: "OK", onPress: hideAlert }];

    setAlertConfig({ visible: true, title, message, buttons: wrappedButtons });
  };

  const { initPaymentSheet, presentPaymentSheet } = useStripe();
  const [isStripeReady, setIsStripeReady] = useState(false);
  const [selectedMethodId, setSelectedMethodId] = useState<string | null>(null);

  const { currency } = useCurrency();

  // Fetch Payment Methods
  const {
    data: methodsData,
    isLoading: isLoadingMethods,
    refetch: refetchMethods,
    isRefetching,
  } = useQuery({
    queryKey: ["payment-methods", currency],
    queryFn: () =>
      api.get<ApiResponse<PaymentMethod[]>>(
        `/api/v1/payment-methods?currency=${currency}`
      ),
  });

  const paymentMethods = methodsData?.data || [];
  const selectedMethod = paymentMethods.find((m) => m.id === selectedMethodId);

  // Payment method selection is now manual

  // Stripe Logic (Only init if 'card' is selected)
  useEffect(() => {
    if (selectedMethod?.code === "card") {
      initializePaymentSheet();
    }
  }, [selectedMethod]);

  const initializePaymentSheet = async () => {
    if (!orderId) return;

    try {
      const response = await api.post<{
        clientSecret: string;
      }>("/api/v1/checkout/payment-intent", { orderId });

      const { clientSecret } = response;

      const { error } = await initPaymentSheet({
        merchantDisplayName: "LuxStore",
        paymentIntentClientSecret: clientSecret,
        defaultBillingDetails: { name: "Jane Doe" },
        returnURL: "luxstore://checkout/result",
        allowsDelayedPaymentMethods: true,
      });

      if (error) {
        console.error("Stripe Init Error:", error);
        showAlert("Error", "Could not initialize payment");
      } else {
        setIsStripeReady(true);
      }
    } catch (error: any) {
      console.error("Backend Error:", error);
      showAlert("Error", error.message || "Failed to setup payment");
    }
  };

  const handleCheckout = async () => {
    if (!selectedMethod) return;

    // eSewa Logic
    if (selectedMethod.code === "esewa") {
      initiateEsewa(orderId);
      return;
    }

    // Khalti Logic
    if (selectedMethod.code === "khalti") {
      initiateKhalti(orderId);
      return;
    }

    if (selectedMethod.code === "card") {
      const { error } = await presentPaymentSheet();
      if (error) {
        if (error.code !== "Canceled") {
          showAlert(`Payment Failed`, error.message);
        } else {
          showAlert(
            "Payment Cancelled",
            "Your order has been saved. You can retry payment anytime from 'My Orders'.",
            [
              { text: "Stay Here", style: "cancel" },
              {
                text: "Go to My Orders",
                onPress: () => router.replace("/(screens)/orders"),
              },
            ]
          );
        }
      } else {
        // Stripe Payment Success
        await finalizeOrder("card");
      }
    } else if (selectedMethod.code === "cod") {
      showAlert("Confirm Order", "Place order with Cash on Delivery?", [
        { text: "Cancel", style: "cancel" },
        { text: "Place Order", onPress: () => finalizeOrder("cod") },
      ]);
    }
  };

  const finalizeOrder = async (methodCode: string) => {
    setIsProcessing(true);
    try {
      const response = await api.post<{ success: boolean; orderId: string }>(
        "/api/v1/checkout/confirm",
        {
          orderId,
          paymentMethod: methodCode,
        }
      );

      if (response && (response.success || response.orderId)) {
        showToast("Order Placed Successfully!", "success");
        clearCart();
        router.replace({
          pathname: "/(screens)/checkout/success",
          params: { orderId },
        });
      } else {
        throw new Error("Invalid response from server");
      }
    } catch (error: any) {
      setIsProcessing(false);
      console.error("Order Confirmation Error:", error);
      showAlert(
        "Order Confirmation Failed",
        "Payment was successful (if card), but we couldn't confirm the order. Please contact support or try again.",
        [{ text: "OK" }]
      );
    }
  };

  if (isLoadingMethods) {
    return (
      <View
        style={[styles.center, { flex: 1, backgroundColor: colors.background }]}
      >
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <SafeAreaView style={styles.safeArea}>
        <ScrollView
          contentContainerStyle={styles.content}
          refreshControl={
            <RefreshControl
              refreshing={isRefetching}
              onRefresh={refetchMethods}
              tintColor={colors.primary}
            />
          }
        >
          <Text style={[styles.title, { color: colors.text }]}>
            Payment Method
          </Text>
          <Text style={[styles.subtitle, { color: colors.muted }]}>
            Choose how you'd like to pay
          </Text>

          <View style={styles.methodsContainer}>
            {paymentMethods.map((method) => {
              const isSelected = selectedMethodId === method.id;
              const iconName =
                method.config?.icon ||
                (method.code === "card" ? "card-outline" : "cash-outline");

              return (
                <TouchableOpacity
                  key={method.id}
                  style={[
                    styles.methodCard,
                    {
                      backgroundColor: colors.card,
                      borderColor: isSelected ? colors.primary : colors.border,
                      borderWidth: isSelected ? 2 : 1,
                    },
                  ]}
                  onPress={() => setSelectedMethodId(method.id)}
                  activeOpacity={0.7}
                >
                  <View style={styles.methodHeader}>
                    <View
                      style={[
                        styles.iconBox,
                        { backgroundColor: isDark ? "#333" : "#F5F5F5" },
                      ]}
                    >
                      <Ionicons name={iconName} size={24} color={colors.text} />
                    </View>
                    <View style={styles.methodInfo}>
                      <Text style={[styles.methodName, { color: colors.text }]}>
                        {method.name}
                      </Text>
                      <Text
                        style={[styles.methodDesc, { color: colors.muted }]}
                      >
                        {method.description}
                      </Text>
                    </View>
                    <View
                      style={[
                        styles.radio,
                        {
                          borderColor: isSelected
                            ? colors.primary
                            : colors.border,
                        },
                      ]}
                    >
                      {isSelected && (
                        <View
                          style={[
                            styles.radioInner,
                            { backgroundColor: colors.primary },
                          ]}
                        />
                      )}
                    </View>
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>
        </ScrollView>

        <View
          style={[
            styles.footer,
            {
              backgroundColor: colors.background,
            },
          ]}
        >
          <TouchableOpacity
            style={[
              styles.payButton,
              {
                backgroundColor:
                  !selectedMethod ||
                  (selectedMethod.code === "card" && !isStripeReady) ||
                  isProcessing
                    ? colors.border
                    : colors.primary,
              },
            ]}
            disabled={
              !selectedMethod ||
              (selectedMethod.code === "card" && !isStripeReady) ||
              isProcessing
            }
            onPress={handleCheckout}
          >
            {isProcessing ? (
              <ActivityIndicator color={isDark ? "black" : "white"} />
            ) : (
              <Text
                style={[
                  styles.payButtonText,
                  { color: isDark ? "black" : "white" },
                ]}
              >
                {selectedMethod?.code === "cod" ? "Confirm Order" : "Pay Now"}
              </Text>
            )}
          </TouchableOpacity>
        </View>
      </SafeAreaView>
      <CustomAlert
        visible={alertConfig.visible}
        title={alertConfig.title}
        message={alertConfig.message}
        buttons={alertConfig.buttons}
        onClose={hideAlert}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  safeArea: { flex: 1 },
  center: { justifyContent: "center", alignItems: "center" },
  content: { padding: 24, paddingBottom: 100 },
  title: { fontSize: 28, fontWeight: "700", marginBottom: 8 },
  subtitle: { fontSize: 16, marginBottom: 32 },
  methodsContainer: { gap: 16 },
  methodCard: {
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
  },
  methodHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
  },
  iconBox: {
    width: 48,
    height: 48,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  methodInfo: {
    flex: 1,
  },
  methodName: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 4,
  },
  methodDesc: {
    fontSize: 13,
  },
  radio: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    justifyContent: "center",
    alignItems: "center",
  },
  radioInner: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  footer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    padding: 24,
    borderTopWidth: 1,
  },
  payButton: {
    width: "100%",
    height: 56,
    borderRadius: 28,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  payButtonText: {
    fontSize: 18,
    fontWeight: "600",
    color: "#FFFFFF",
  },
});
