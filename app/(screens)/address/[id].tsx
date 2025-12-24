import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import {
  useAddresses,
  useCreateAddress,
  useUpdateAddress,
} from "../../api/users";
import { AddressForm } from "../../components/address/AddressForm";
import { useTheme } from "../../context/theme-context";
import { useToast } from "../../context/toast-context";

export default function AddressFormScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams(); // 'new' or addressId
  const isEditing = id !== "new";
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const { showToast } = useToast();

  const { data: addressesResponse } = useAddresses();
  const createAddressMutation = useCreateAddress();
  const updateAddressMutation = useUpdateAddress();

  const [initialValues, setInitialValues] = useState<any>(undefined);

  useEffect(() => {
    if (isEditing && addressesResponse?.data) {
      const address = addressesResponse.data.find((a) => a.id === id);
      if (address) {
        setInitialValues(address);
      }
    }
  }, [id, addressesResponse]);

  const handleSubmit = async (data: any) => {
    try {
      if (isEditing) {
        await updateAddressMutation.mutateAsync({ id: id as string, data });
        showToast("Address updated", "success");
      } else {
        await createAddressMutation.mutateAsync(data);
        showToast("Address added", "success");
      }
      router.back();
    } catch (err: any) {
      showToast(err.message || "Failed to save address", "error");
    }
  };

  const isLoading =
    createAddressMutation.isPending || updateAddressMutation.isPending;

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View
        style={[
          styles.header,
          { paddingTop: insets.top, borderBottomColor: colors.border },
        ]}
      >
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.headerButton}
        >
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>
          {isEditing ? "EDIT ADDRESS" : "ADD ADDRESS"}
        </Text>
        <View style={styles.headerButton} />
      </View>

      <View style={styles.content}>
        {isEditing && !initialValues ? (
          <ActivityIndicator color={colors.primary} style={{ marginTop: 40 }} />
        ) : (
          <AddressForm
            initialValues={initialValues}
            onSubmit={handleSubmit}
            onCancel={() => router.back()}
            isLoading={isLoading}
          />
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
  },
  headerButton: {
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: "700",
    letterSpacing: 2,
  },
  content: {
    flex: 1,
  },
});
