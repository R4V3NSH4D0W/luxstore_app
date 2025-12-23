import { useTheme } from "@/app/context/theme-context";
import React, { ReactNode } from "react";
import { ScrollView, StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

type SafeAreaWrapperProps = {
  children: ReactNode;
  scrollable?: boolean; // default true
};

const SafeAreaWrapper = ({
  children,
  scrollable = true,
}: SafeAreaWrapperProps) => {
  const { colors } = useTheme();

  if (scrollable) {
    // Scrollable wrapper
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <SafeAreaView style={{ backgroundColor: colors.background }} />
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {children}
        </ScrollView>
      </View>
    );
  }

  // Non-scrollable wrapper
  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <SafeAreaView style={{ backgroundColor: colors.background, flex: 0 }} />
      {children}
    </View>
  );
};

export default SafeAreaWrapper;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 40,
  },
});
