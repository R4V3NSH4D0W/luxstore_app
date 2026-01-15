import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React from "react";
import {
    ActivityIndicator,
    FlatList,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useAddresses, useDeleteAddress } from "../../api/users";
import { AddressCard } from "../../components/address/AddressCard";
import { useTheme } from "../../context/theme-context";
import { useToast } from "../../context/toast-context";

export default function AddressListScreen() {
  const router = useRouter();
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const { showToast } = useToast();

  const { data: addressesResponse, isLoading } = useAddresses();
  const deleteAddressMutation = useDeleteAddress();

  const addresses = addressesResponse?.data || [];

  const handleDelete = (id: string) => {
    deleteAddressMutation.mutate(id, {
      onSuccess: () => {
        showToast("Address deleted", "info");
      },
      onError: () => {
        showToast("Failed to delete address", "error");
      },
    });
  };

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
          MY ADDRESSES
        </Text>
        <View style={styles.headerButton} />
      </View>

      {isLoading ? (
        <View style={styles.center}>
          <ActivityIndicator color={colors.primary} />
        </View>
      ) : (
        <>
          <FlatList
            data={addresses}
            renderItem={({ item }) => (
              <AddressCard
                address={item}
                onEdit={() => router.push(`/(screens)/address/${item.id}`)}
                onDelete={handleDelete}
              />
            )}
            keyExtractor={(item) => item.id}
            contentContainerStyle={[styles.list, { paddingBottom: 100 }]}
            ListEmptyComponent={
              <View style={styles.center}>
                <Ionicons
                  name="location-outline"
                  size={48}
                  color={colors.muted}
                />
                <Text style={{ color: colors.muted, marginTop: 16 }}>
                  No addresses found.
                </Text>
              </View>
            }
          />
          <TouchableOpacity
            style={[
              styles.fab,
              {
                backgroundColor: colors.primary,
                shadowColor: colors.primary,
                bottom: insets.bottom + 24,
              },
            ]}
            onPress={() => router.push("/(screens)/address/new")}
          >
            <Ionicons name="add" size={32} color={colors.background} />
          </TouchableOpacity>
        </>
      )}
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
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  list: {
    padding: 16,
  },
  fab: {
    position: "absolute",
    right: 24,
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: "center",
    alignItems: "center",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
});
