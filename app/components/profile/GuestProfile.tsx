import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import Animated, { FadeInDown, ZoomIn } from "react-native-reanimated";
import { useTheme } from "../../context/theme-context";
import MenuRow from "./MenuRow";

export default function GuestProfile() {
  const router = useRouter();
  const { colors } = useTheme();

  return (
    <>
      <Animated.View
        entering={FadeInDown.duration(600).springify()}
        style={styles.header}
      >
        <Text style={[styles.pageTitle, { color: colors.text }]}>Profile</Text>
      </Animated.View>

      <View style={styles.guestContainer}>
        <Animated.View
          entering={ZoomIn.delay(200).duration(500).springify()}
          style={styles.guestIconCircle}
        >
          <Ionicons name="person-outline" size={48} color={colors.muted} />
        </Animated.View>
        <Animated.Text
          entering={FadeInDown.delay(300).duration(600)}
          style={[styles.guestTitle, { color: colors.text }]}
        >
          Welcome, Guest
        </Animated.Text>
        <Animated.Text
          entering={FadeInDown.delay(400).duration(600)}
          style={[styles.guestSubtitle, { color: colors.muted }]}
        >
          Sign in to view your profile, track orders, and manage your wishlist.
        </Animated.Text>

        <View style={styles.guestButtons}>
          <Animated.View entering={FadeInDown.delay(500).duration(600)}>
            <TouchableOpacity
              style={[
                styles.primaryButton,
                { backgroundColor: colors.primary },
              ]}
              onPress={() => router.push("/(auth)/login")}
            >
              <Text
                style={[styles.primaryButtonText, { color: colors.secondary }]}
              >
                Sign In
              </Text>
            </TouchableOpacity>
          </Animated.View>
          <Animated.View entering={FadeInDown.delay(600).duration(600)}>
            <TouchableOpacity
              style={[
                styles.secondaryButton,
                { backgroundColor: colors.card, borderColor: colors.border },
              ]}
              onPress={() => router.push("/(auth)/register")}
            >
              <Text
                style={[styles.secondaryButtonText, { color: colors.text }]}
              >
                Create Account
              </Text>
            </TouchableOpacity>
          </Animated.View>
        </View>
      </View>

      {/* Guest Menu Items */}
      <Animated.View
        entering={FadeInDown.delay(700).duration(600)}
        style={styles.section}
      >
        <Text style={[styles.sectionTitle, { color: colors.muted }]}>
          Support
        </Text>
        <View style={[styles.sectionBody, { backgroundColor: colors.card }]}>
          <MenuRow
            icon="settings-outline"
            label="Preferences"
            onPress={() => router.push("/(screens)/preferences")}
          />
          <View style={[styles.divider, { backgroundColor: colors.border }]} />
          <MenuRow
            icon="information-circle-outline"
            label="Store Info"
            onPress={() => router.push("/(screens)/store-info")}
          />
        </View>
      </Animated.View>
    </>
  );
}

const styles = StyleSheet.create({
  header: {
    marginTop: 20,
    marginBottom: 30,
  },
  pageTitle: {
    fontSize: 34,
    fontWeight: "800",
    color: "#1A1A1A",
    letterSpacing: -0.5,
  },
  guestContainer: {
    paddingVertical: 40,
    alignItems: "center",
    marginBottom: 20,
  },
  guestIconCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: "#FFFFFF",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
    borderWidth: 2,
    borderColor: "#E5E5EA",
    borderStyle: "dashed",
  },
  guestTitle: {
    fontSize: 24,
    fontWeight: "700",
    color: "#1A1A1A",
    marginBottom: 8,
  },
  guestSubtitle: {
    fontSize: 16,
    color: "#666",
    textAlign: "center",
    maxWidth: "80%",
    marginBottom: 32,
    lineHeight: 22,
  },
  guestButtons: {
    width: "100%",
    gap: 16,
  },
  primaryButton: {
    width: "100%",
    backgroundColor: "#1A1A1A",
    paddingVertical: 18,
    borderRadius: 16,
    alignItems: "center",
  },
  primaryButtonText: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "600",
  },
  secondaryButton: {
    width: "100%",
    backgroundColor: "#FFFFFF",
    paddingVertical: 18,
    borderRadius: 16,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#E5E5EA",
  },
  secondaryButtonText: {
    color: "#1A1A1A",
    fontSize: 18,
    fontWeight: "600",
  },
  section: {
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: "600",
    color: "#8E8E93",
    textTransform: "uppercase",
    marginBottom: 10,
    paddingLeft: 4,
  },
  sectionBody: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    overflow: "hidden",
  },
  divider: {
    height: 1,
    backgroundColor: "#F4F6F8",
    marginLeft: 64,
  },
});
