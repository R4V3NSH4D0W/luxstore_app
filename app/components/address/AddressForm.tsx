import { Address, CreateAddressData } from "@/types/api-types";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useTheme } from "../../context/theme-context";

interface AddressFormProps {
  initialValues?: Address;
  onSubmit: (data: CreateAddressData) => Promise<void>;
  onCancel: () => void;
  isLoading?: boolean;
}

export const AddressForm = ({
  initialValues,
  onSubmit,
  onCancel,
  isLoading = false,
}: AddressFormProps) => {
  const { colors } = useTheme();

  const [formData, setFormData] = useState<CreateAddressData>({
    name: "",
    street: "",
    city: "",
    zip: "",
    phone: "",
    type: "HOME",
    isDefault: false,
  });

  useEffect(() => {
    if (initialValues) {
      setFormData({
        name: initialValues.name,
        street: initialValues.street,
        city: initialValues.city,
        zip: initialValues.zip,
        phone: initialValues.phone || "",
        type: initialValues.type || "HOME",
        isDefault: initialValues.isDefault,
      });
    }
  }, [initialValues]);

  const handleChange = (
    field: keyof CreateAddressData,
    value: string | boolean,
  ) => {
    setFormData((prev: CreateAddressData) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async () => {
    if (!formData.name || !formData.street || !formData.city || !formData.zip) {
      // Simple validation alert
      Alert.alert("Error", "Please fill in all required fields");
      return;
    }
    await onSubmit(formData);
  };

  const types = ["HOME", "WORK", "OTHER"];

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Text style={[styles.label, { color: colors.text }]}>Label</Text>
      <View style={styles.typeContainer}>
        {types.map((type) => (
          <TouchableOpacity
            key={type}
            style={[
              styles.typeChip,
              formData.type === type
                ? { backgroundColor: colors.tint, borderColor: colors.tint }
                : { backgroundColor: colors.card, borderColor: colors.border },
            ]}
            onPress={() => handleChange("type", type as any)}
          >
            <Text
              style={[
                styles.typeText,
                formData.type === type
                  ? { color: "#fff" }
                  : { color: colors.text },
              ]}
            >
              {type}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <Text style={[styles.label, { color: colors.text }]}>Full Name</Text>
      <TextInput
        style={[
          styles.input,
          {
            backgroundColor: colors.card,
            color: colors.text,
            borderColor: colors.border,
          },
        ]}
        value={formData.name}
        onChangeText={(text) => handleChange("name", text)}
        placeholder="e.g. John Doe"
        placeholderTextColor={colors.muted}
      />

      <Text style={[styles.label, { color: colors.text }]}>Street Address</Text>
      <TextInput
        style={[
          styles.input,
          {
            backgroundColor: colors.card,
            color: colors.text,
            borderColor: colors.border,
          },
        ]}
        value={formData.street}
        onChangeText={(text) => handleChange("street", text)}
        placeholder="e.g. 123 Main St"
        placeholderTextColor={colors.muted}
      />

      <View style={styles.row}>
        <View style={styles.half}>
          <Text style={[styles.label, { color: colors.text }]}>City</Text>
          <TextInput
            style={[
              styles.input,
              {
                backgroundColor: colors.card,
                color: colors.text,
                borderColor: colors.border,
              },
            ]}
            value={formData.city}
            onChangeText={(text) => handleChange("city", text)}
            placeholder="New York"
            placeholderTextColor={colors.muted}
          />
        </View>
        <View style={styles.half}>
          <Text style={[styles.label, { color: colors.text }]}>Zip Code</Text>
          <TextInput
            style={[
              styles.input,
              {
                backgroundColor: colors.card,
                color: colors.text,
                borderColor: colors.border,
              },
            ]}
            value={formData.zip}
            onChangeText={(text) => handleChange("zip", text)}
            placeholder="10001"
            placeholderTextColor={colors.muted}
            keyboardType="numeric"
          />
        </View>
      </View>

      <Text style={[styles.label, { color: colors.text }]}>Phone Number</Text>
      <TextInput
        style={[
          styles.input,
          {
            backgroundColor: colors.card,
            color: colors.text,
            borderColor: colors.border,
          },
        ]}
        value={formData.phone}
        onChangeText={(text) => handleChange("phone", text)}
        placeholder="+1 234 567 8900"
        placeholderTextColor={colors.muted}
        keyboardType="phone-pad"
      />

      <View style={styles.switchContainer}>
        <Text style={[styles.label, { color: colors.text, marginBottom: 0 }]}>
          Set as Default Address
        </Text>
        <Switch
          value={formData.isDefault}
          onValueChange={(val) => handleChange("isDefault", val)}
          trackColor={{ false: colors.border, true: colors.tint }}
        />
      </View>

      <View style={styles.actions}>
        <TouchableOpacity
          style={[
            styles.button,
            styles.cancelButton,
            { borderColor: colors.border, backgroundColor: "transparent" },
          ]}
          onPress={onCancel}
          disabled={isLoading}
        >
          <Text style={[styles.buttonText, { color: colors.text }]}>
            Cancel
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.button, { backgroundColor: colors.tint }]}
          onPress={handleSubmit}
          disabled={isLoading}
        >
          {isLoading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={[styles.buttonText, { color: "#fff" }]}>
              Save Address
            </Text>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: "500",
    marginBottom: 8,
  },
  input: {
    height: 48,
    borderRadius: 8,
    borderWidth: 1,
    paddingHorizontal: 12,
    marginBottom: 16,
    fontSize: 16,
  },
  typeContainer: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 16,
  },
  typeChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
  },
  typeText: {
    fontSize: 14,
    fontWeight: "500",
  },
  row: {
    flexDirection: "row",
    gap: 12,
  },
  half: {
    flex: 1,
  },
  switchContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 24,
    marginTop: 8,
  },
  actions: {
    flexDirection: "row",
    gap: 12,
  },
  button: {
    flex: 1,
    height: 48,
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
  },
  cancelButton: {
    borderWidth: 1,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: "600",
  },
});
