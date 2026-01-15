import { useTheme } from "@/app/context/theme-context";
import { Ionicons } from "@expo/vector-icons";
import React, { useState } from "react";
import {
    Dimensions,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";
import Animated, { FadeInDown } from "react-native-reanimated";

const { width } = Dimensions.get("window");

export const NewsletterSection = () => {
  const { isDark } = useTheme();
  const [email, setEmail] = useState("");

  return (
    <View style={styles.fullBleedContainer}>
      <Animated.View
        entering={FadeInDown.delay(200).duration(1000)}
        style={[
          styles.content,
          {
            backgroundColor: isDark ? "#0A0A0A" : "#1A1A1A", // Always dark for premium feel
          },
        ]}
      >
        <Ionicons
          name="mail-unread-outline"
          size={32}
          color="#FFF"
          style={styles.icon}
        />

        <Text style={styles.title}>THE ELITE CIRCLE</Text>

        <Text style={styles.subtitle}>
          BE THE FIRST TO DISCOVER EXCLUSIVE DROPS, PRIVATE EVENTS, AND BESPOKE
          COLLECTIONS.
        </Text>

        <View style={styles.inputWrapper}>
          <TextInput
            style={styles.input}
            placeholder="ENTER YOUR EMAIL ADDRESS"
            placeholderTextColor="rgba(255,255,255,0.4)"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
          />
          <TouchableOpacity style={styles.joinButton} activeOpacity={0.7}>
            <Text style={styles.joinButtonText}>JOIN</Text>
            <Ionicons name="arrow-forward" size={16} color="#FFF" />
          </TouchableOpacity>
        </View>

        <View style={styles.footerRow}>
          <View style={styles.divider} />
          <Text style={styles.footerText}>MEMBERS ONLY ACCESS</Text>
          <View style={styles.divider} />
        </View>
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  fullBleedContainer: {
    width: width,
    marginTop: 40,
  },
  content: {
    paddingVertical: 80,
    paddingHorizontal: 40,
    alignItems: "center",
  },
  icon: {
    marginBottom: 24,
    opacity: 0.8,
  },
  title: {
    fontSize: 24,
    fontWeight: "900",
    letterSpacing: 8,
    color: "#FFF",
    textAlign: "center",
    marginBottom: 16,
  },
  subtitle: {
    fontSize: 10,
    fontWeight: "600",
    letterSpacing: 2,
    color: "rgba(255,255,255,0.6)",
    textAlign: "center",
    lineHeight: 20,
    marginBottom: 48,
    maxWidth: 280,
  },
  inputWrapper: {
    width: "100%",
    maxWidth: 400,
    flexDirection: "row",
    alignItems: "center",
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255,255,255,0.2)",
    paddingBottom: 8,
  },
  input: {
    flex: 1,
    height: 40,
    fontSize: 12,
    letterSpacing: 2,
    color: "#FFF",
    fontWeight: "500",
  },
  joinButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingLeft: 16,
  },
  joinButtonText: {
    color: "#FFF",
    fontSize: 12,
    fontWeight: "800",
    letterSpacing: 2,
  },
  footerRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 60,
    gap: 15,
    opacity: 0.4,
  },
  footerText: {
    color: "#FFF",
    fontSize: 8,
    fontWeight: "800",
    letterSpacing: 3,
  },
  divider: {
    height: 1,
    width: 30,
    backgroundColor: "#FFF",
  },
});
