import { useRouter } from "expo-router";
import { StyleSheet, Text, View } from "react-native";
import Animated, { FadeInDown } from "react-native-reanimated";
import { useTheme } from "../../context/theme-context";
import MenuRow from "./MenuRow";

interface User {
  name?: string;
  email: string;
  username?: string;
}

interface LoggedInProfileProps {
  user: User;
  onSignOut: () => void;
}

export default function LoggedInProfile({
  user,
  onSignOut,
}: LoggedInProfileProps) {
  const router = useRouter();
  const { colors } = useTheme();

  return (
    <>
      {/* Header */}
      <Animated.View
        entering={FadeInDown.duration(600).springify()}
        style={styles.header}
      >
        <Text style={[styles.pageTitle, { color: colors.text }]}>
          My Profile
        </Text>
      </Animated.View>

      {/* User Info */}
      <Animated.View
        entering={FadeInDown.delay(100).duration(600).springify()}
        style={styles.userInfo}
      >
        <View style={[styles.avatar, { backgroundColor: colors.tint }]}>
          <Text style={[styles.avatarText, { color: colors.text }]}>
            {user.username ? user.username.charAt(0).toUpperCase() : "U"}
          </Text>
        </View>
        <View style={styles.userDetails}>
          <Text style={[styles.userName, { color: colors.text }]}>
            {user.username || "User"}
          </Text>
          <Text style={[styles.userEmail, { color: colors.muted }]}>
            {user.email}
          </Text>
          {user.username && (
            <Text style={[styles.userHandle, { color: colors.muted }]}>
              @{user.username}
            </Text>
          )}
        </View>
      </Animated.View>

      {/* Account Section */}
      <Animated.View
        entering={FadeInDown.delay(200).duration(600)}
        style={styles.section}
      >
        <Text style={[styles.sectionTitle, { color: colors.muted }]}>
          Account
        </Text>
        <View style={[styles.sectionBody, { backgroundColor: colors.card }]}>
          <MenuRow
            icon="bag-handle-outline"
            label="My Orders"
            onPress={() => router.push("/(screens)/orders")}
          />
          <View style={[styles.divider, { backgroundColor: colors.border }]} />
          <MenuRow
            icon="heart-outline"
            label="Wishlist"
            onPress={() => router.push("/(screens)/wishlist")}
          />
          <View style={[styles.divider, { backgroundColor: colors.border }]} />
          <MenuRow
            icon="location-outline"
            label="Addresses"
            onPress={() => router.push("/(screens)/address")}
          />
        </View>
      </Animated.View>

      {/* Settings Section */}
      <Animated.View
        entering={FadeInDown.delay(300).duration(600)}
        style={styles.section}
      >
        <Text style={[styles.sectionTitle, { color: colors.muted }]}>
          Settings
        </Text>
        <View style={[styles.sectionBody, { backgroundColor: colors.card }]}>
          <MenuRow
            icon="settings-outline"
            label="Preferences"
            onPress={() => router.push("/(screens)/preferences")}
          />
          <View style={[styles.divider, { backgroundColor: colors.border }]} />
          <MenuRow icon="notifications-outline" label="Notifications" />
        </View>
      </Animated.View>

      {/* Sign Out Section */}
      <Animated.View
        entering={FadeInDown.delay(400).duration(600)}
        style={styles.section}
      >
        <View style={[styles.sectionBody, { backgroundColor: colors.card }]}>
          <MenuRow
            icon="log-out-outline"
            label="Sign Out"
            isDestructive
            onPress={onSignOut}
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
  userInfo: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 40,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "#E1E4E8",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 20,
  },
  avatarText: {
    fontSize: 32,
    fontWeight: "700",
    color: "#1A1A1A",
  },
  userDetails: {
    flex: 1,
  },
  userName: {
    fontSize: 22,
    fontWeight: "700",
    color: "#1A1A1A",
    marginBottom: 2,
  },
  userEmail: {
    fontSize: 15,
    color: "#666",
    marginBottom: 2,
  },
  userHandle: {
    fontSize: 14,
    color: "#999",
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
