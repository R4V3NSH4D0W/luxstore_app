import { Ionicons } from "@expo/vector-icons";
import { Stack, useRouter } from "expo-router";
import React, { useState } from "react";
import {
    Modal,
    ScrollView,
    StyleSheet,
    Switch,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import Animated, { FadeInDown } from "react-native-reanimated";
import { SafeAreaView } from "react-native-safe-area-context";
import { useCurrency } from "../context/currency-context";
import { useTheme } from "../context/theme-context";

export default function PreferencesScreen() {
  const router = useRouter();
  const { theme, setTheme, colors, isDark } = useTheme();
  const { currency, symbol, setCurrency, allSymbols, activeCodes } =
    useCurrency();
  const [currencyModalVisible, setCurrencyModalVisible] = useState(false);

  const SettingSection = ({
    title,
    children,
  }: {
    title: string;
    children: React.ReactNode;
  }) => (
    <View style={styles.section}>
      <Text style={[styles.sectionTitle, { color: colors.muted }]}>
        {title}
      </Text>
      <View style={[styles.sectionBody, { backgroundColor: colors.card }]}>
        {children}
      </View>
    </View>
  );

  const SettingRow = ({
    label,
    value,
    onPress,
    hasSwitch,
    switchValue,
    onSwitchChange,
  }: {
    label: string;
    value?: string;
    onPress?: () => void;
    hasSwitch?: boolean;
    switchValue?: boolean;
    onSwitchChange?: (val: boolean) => void;
  }) => (
    <TouchableOpacity
      style={[styles.row, { borderBottomColor: colors.border }]}
      onPress={onPress}
      disabled={!!hasSwitch}
    >
      <Text style={[styles.rowLabel, { color: colors.text }]}>{label}</Text>
      <View style={styles.rowRight}>
        {value && (
          <Text style={[styles.rowValue, { color: colors.muted }]}>
            {value}
          </Text>
        )}
        {hasSwitch && (
          <Switch
            value={switchValue}
            onValueChange={onSwitchChange}
            trackColor={{ false: "#767577", true: isDark ? "#fff" : "#1A1A1A" }}
            thumbColor={isDark ? "#121212" : "#f4f3f4"}
          />
        )}
        {!hasSwitch && (
          <Ionicons name="chevron-forward" size={20} color={colors.muted} />
        )}
      </View>
    </TouchableOpacity>
  );

  const ThemeOption = ({
    label,
    value,
    isSelected,
  }: {
    label: string;
    value: "light" | "dark" | "system";
    isSelected: boolean;
  }) => (
    <TouchableOpacity
      style={[
        styles.themeOption,
        isSelected && { backgroundColor: isDark ? "#333" : "#E5E5EA" },
      ]}
      onPress={() => setTheme(value)}
    >
      <Text
        style={[
          styles.themeOptionLabel,
          { color: colors.text, opacity: isSelected ? 1 : 0.6 },
        ]}
      >
        {label}
      </Text>
      {isSelected && (
        <Ionicons name="checkmark-circle" size={20} color={colors.text} />
      )}
    </TouchableOpacity>
  );

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Stack.Screen options={{ headerShown: false }} />
      <SafeAreaView style={styles.safeArea}>
        <View style={[styles.header, { borderBottomColor: colors.border }]}>
          <TouchableOpacity
            onPress={() => router.back()}
            style={styles.backButton}
          >
            <Ionicons name="arrow-back" size={24} color={colors.text} />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: colors.text }]}>
            Preferences
          </Text>
          <View style={{ width: 40 }} />
        </View>

        <ScrollView contentContainerStyle={styles.content}>
          <Animated.View entering={FadeInDown.duration(500)}>
            <SettingSection title="APPEARANCE">
              <View style={styles.themeSelector}>
                <ThemeOption
                  label="Light"
                  value="light"
                  isSelected={theme === "light"}
                />
                <View
                  style={[styles.divider, { backgroundColor: colors.border }]}
                />
                <ThemeOption
                  label="Dark"
                  value="dark"
                  isSelected={theme === "dark"}
                />
                <View
                  style={[styles.divider, { backgroundColor: colors.border }]}
                />
                <ThemeOption
                  label="System"
                  value="system"
                  isSelected={theme === "system"}
                />
              </View>
            </SettingSection>

            <SettingSection title="NOTIFICATIONS">
              <SettingRow
                label="Push Notifications"
                hasSwitch
                switchValue={true}
                onSwitchChange={() => {}}
              />
              <SettingRow
                label="Email Newsletter"
                hasSwitch
                switchValue={false}
                onSwitchChange={() => {}}
              />
            </SettingSection>

            <SettingSection title="REGIONAL">
              <SettingRow
                label="Currency"
                value={`${currency} (${symbol})`}
                onPress={() => setCurrencyModalVisible(true)}
              />
              <SettingRow label="Language" value="English" onPress={() => {}} />
            </SettingSection>

            <SettingSection title="ABOUT">
              <SettingRow label="Version" value="1.0.0" onPress={() => {}} />
              <SettingRow label="Terms of Service" onPress={() => {}} />
              <SettingRow label="Privacy Policy" onPress={() => {}} />
            </SettingSection>
          </Animated.View>
        </ScrollView>

        <Modal
          visible={currencyModalVisible}
          transparent
          animationType="slide"
          onRequestClose={() => setCurrencyModalVisible(false)}
        >
          <View style={styles.modalOverlay}>
            <TouchableOpacity
              style={styles.modalBackdrop}
              activeOpacity={1}
              onPress={() => setCurrencyModalVisible(false)}
            />
            <View
              style={[
                styles.modalContent,
                {
                  backgroundColor: isDark ? "#1E1E1E" : "#FFFFFF",
                  paddingBottom: 40,
                },
              ]}
            >
              <View style={styles.modalHeader}>
                <Text style={[styles.modalTitle, { color: colors.text }]}>
                  Select Currency
                </Text>
                <TouchableOpacity
                  onPress={() => setCurrencyModalVisible(false)}
                >
                  <Ionicons name="close" size={24} color={colors.muted} />
                </TouchableOpacity>
              </View>

              <View style={styles.optionsList}>
                {activeCodes.map((code) => {
                  const isActive = code === currency;
                  return (
                    <TouchableOpacity
                      key={code}
                      style={[
                        styles.modalOption,
                        isActive && {
                          backgroundColor: isDark ? "#333" : "#F5F5F5",
                        },
                      ]}
                      onPress={() => {
                        setCurrency(code);
                        setCurrencyModalVisible(false);
                      }}
                    >
                      <View style={styles.optionLeft}>
                        <View
                          style={[
                            styles.symbolBubble,
                            { backgroundColor: isDark ? "#444" : "#E0E0E0" },
                          ]}
                        >
                          <Text
                            style={[styles.symbolText, { color: colors.text }]}
                          >
                            {allSymbols[code] || code}
                          </Text>
                        </View>
                        <Text
                          style={[
                            styles.modalOptionText,
                            {
                              color: colors.text,
                              fontWeight: isActive ? "700" : "500",
                            },
                          ]}
                        >
                          {code}
                        </Text>
                      </View>

                      {isActive && (
                        <Ionicons
                          name="checkmark-circle"
                          size={24}
                          color={colors.primary}
                        />
                      )}
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>
          </View>
        </Modal>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "600",
  },
  content: {
    padding: 20,
  },
  section: {
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: "600",
    textTransform: "uppercase",
    marginBottom: 10,
    marginLeft: 4,
  },
  sectionBody: {
    borderRadius: 12,
    overflow: "hidden",
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  rowLabel: {
    fontSize: 16,
    fontWeight: "500",
  },
  rowRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  rowValue: {
    fontSize: 16,
  },
  themeSelector: {
    flexDirection: "column",
  },
  themeOption: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 16,
    paddingHorizontal: 16,
  },
  themeOptionLabel: {
    fontSize: 16,
    fontWeight: "500",
  },
  divider: {
    height: StyleSheet.hairlineWidth,
    marginLeft: 16,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: "flex-end", // Align to bottom
  },
  modalBackdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  modalContent: {
    width: "100%",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 20,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 24,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "700",
  },
  optionsList: {
    gap: 12,
  },
  modalOption: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderRadius: 16,
  },
  optionLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
  },
  symbolBubble: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  symbolText: {
    fontSize: 16,
    fontWeight: "600",
  },
  modalOptionText: {
    fontSize: 18,
  },
});
