import { useTheme } from "@/app/context/theme-context";
import { Stack } from "expo-router";

export default function ScreensLayout() {
  const { colors } = useTheme();

  return (
    <Stack
      screenOptions={{
        headerShown: false,
        animation: "fade",
        contentStyle: { backgroundColor: colors.background },
      }}
    />
  );
}
