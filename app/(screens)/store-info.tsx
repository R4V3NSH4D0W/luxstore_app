import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React from "react";
import {
  ActivityIndicator,
  Linking,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useSettings } from "../api/shop";
import { useTheme } from "../context/theme-context";

export default function StoreInfoScreen() {
  const router = useRouter();
  const { colors } = useTheme();
  const { data: settingsData, isLoading } = useSettings();
  const settings = settingsData?.data;

  if (isLoading) {
    return (
      <View
        style={[
          styles.container,
          styles.center,
          { backgroundColor: colors.background },
        ]}
      >
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  const handleEmailPress = () => {
    if (settings?.supportEmail) {
      Linking.openURL(`mailto:${settings.supportEmail}`);
    }
  };

  const handlePhonePress = () => {
    if (settings?.supportPhone) {
      Linking.openURL(`tel:${settings.supportPhone}`);
    }
  };

  const fullAddress = [
    settings?.storeAddress,
    settings?.storeCity,
    settings?.storeState,
    settings?.storeZip,
    settings?.storeCountry,
  ]
    .filter(Boolean)
    .join(", ");

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: colors.background }]}
    >
      <View style={[styles.header, { borderBottomColor: colors.border }]}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.backButton}
        >
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>
          Store Info
        </Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: colors.primary }]}>
            {settings?.storeName || "Our Store"}
          </Text>
          <Text style={[styles.description, { color: colors.muted }]}>
            We are dedicated to providing the best luxury experience. Contact us
            for any inquiries or support.
          </Text>
        </View>

        {(settings?.supportEmail || settings?.supportPhone) && (
          <View style={[styles.card, { backgroundColor: colors.card }]}>
            <Text style={[styles.cardTitle, { color: colors.text }]}>
              Contact Us
            </Text>

            {settings?.supportEmail && (
              <TouchableOpacity style={styles.row} onPress={handleEmailPress}>
                <View
                  style={[styles.iconBox, { backgroundColor: colors.border }]}
                >
                  <Ionicons name="mail-outline" size={20} color={colors.text} />
                </View>
                <View>
                  <Text style={[styles.label, { color: colors.muted }]}>
                    Email
                  </Text>
                  <Text style={[styles.value, { color: colors.text }]}>
                    {settings.supportEmail}
                  </Text>
                </View>
              </TouchableOpacity>
            )}

            {settings?.supportPhone && (
              <TouchableOpacity
                style={[styles.row, { marginTop: 16 }]}
                onPress={handlePhonePress}
              >
                <View
                  style={[styles.iconBox, { backgroundColor: colors.border }]}
                >
                  <Ionicons name="call-outline" size={20} color={colors.text} />
                </View>
                <View>
                  <Text style={[styles.label, { color: colors.muted }]}>
                    Phone
                  </Text>
                  <Text style={[styles.value, { color: colors.text }]}>
                    {settings.supportPhone}
                  </Text>
                </View>
              </TouchableOpacity>
            )}
          </View>
        )}

        {fullAddress && (
          <View style={[styles.card, { backgroundColor: colors.card }]}>
            <Text style={[styles.cardTitle, { color: colors.text }]}>
              Location
            </Text>
            <View style={styles.row}>
              <View
                style={[styles.iconBox, { backgroundColor: colors.border }]}
              >
                <Ionicons
                  name="location-outline"
                  size={20}
                  color={colors.text}
                />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[styles.label, { color: colors.muted }]}>
                  Address
                </Text>
                <Text style={[styles.value, { color: colors.text }]}>
                  {fullAddress}
                </Text>
              </View>
            </View>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  center: {
    justifyContent: "center",
    alignItems: "center",
  },
  header: {
    paddingHorizontal: 16,
    height: 60,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderBottomWidth: 1,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "flex-start",
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "600",
  },
  content: {
    padding: 24,
  },
  section: {
    marginBottom: 32,
    alignItems: "center",
  },
  sectionTitle: {
    fontSize: 28,
    fontWeight: "800",
    marginBottom: 8,
    textAlign: "center",
  },
  description: {
    fontSize: 16,
    textAlign: "center",
    lineHeight: 24,
  },
  card: {
    borderRadius: 16,
    padding: 24,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: "rgba(0,0,0,0.05)",
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 20,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
  },
  iconBox: {
    width: 40,
    height: 40,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
  },
  label: {
    fontSize: 12,
    fontWeight: "500",
    marginBottom: 2,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  value: {
    fontSize: 16,
    fontWeight: "600",
  },
});
