import { Ionicons } from "@expo/vector-icons";
import { BlurView } from "expo-blur";
import { Tabs } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { Platform, StyleSheet, View } from "react-native";
import { useTheme } from "../context/theme-context";

export default function TabLayout() {
  const { colors, isDark } = useTheme();

  const TAB_SCREENS = [
    { name: "index", icon: "home" },
    { name: "search", icon: "search" },
    { name: "cart", icon: "cart" },
    { name: "profile", icon: "person" },
  ];

  return (
    <>
      <Tabs
        screenOptions={{
          headerShown: false,
          tabBarStyle: {
            position: "absolute",
            marginHorizontal: 10,
            bottom: 25,
            left: 20,
            right: 20,
            height: 70,
            borderTopWidth: 0,
            backgroundColor: colors.background,
            elevation: 0,
          },
          tabBarBackground: () => (
            <View style={styles.blurContainer}>
              <BlurView
                intensity={80}
                style={StyleSheet.absoluteFill}
                tint={isDark ? "dark" : "light"}
              />
            </View>
          ),
          tabBarActiveTintColor: colors.primary, // icon color when active
          tabBarInactiveTintColor: colors.muted, // icon color when inactive
          tabBarShowLabel: false,
          tabBarItemStyle: { paddingTop: 10 },
        }}
      >
        {TAB_SCREENS.map(({ name, icon }) => (
          <Tabs.Screen
            key={name}
            name={name}
            options={{
              tabBarIcon: ({ color, focused }) => (
                <View style={[styles.iconContainer]}>
                  <Ionicons
                    name={focused ? (icon as any) : (`${icon}-outline` as any)}
                    size={24}
                    color={color}
                  />
                </View>
              ),
            }}
          />
        ))}
      </Tabs>

      <StatusBar style={isDark ? "light" : "dark"} />
    </>
  );
}

const styles = StyleSheet.create({
  blurContainer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: 70,
    borderRadius: 35,
    overflow: "hidden",
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.15,
        shadowRadius: 20,
      },
      android: {
        elevation: 10,
      },
    }),
  },
  iconContainer: {
    justifyContent: "center",
    alignItems: "center",
    width: 50,
    height: 50,
    borderRadius: 25,
  },
});
