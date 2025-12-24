import * as SecureStore from "expo-secure-store";
import React, { createContext, useContext, useEffect, useState } from "react";
import { useColorScheme } from "react-native";

type Theme = "light" | "dark" | "system";

interface ThemeColors {
  background: string;
  text: string;
  card: string;
  border: string;
  primary: string;
  secondary: string;
  muted: string;
  tint: string;
  surface: string;
}

const LightColors: ThemeColors = {
  background: "#F4F6F8",
  text: "#1A1A1A",
  card: "#FFFFFF",
  border: "#E5E5EA",
  primary: "#1A1A1A",
  secondary: "#FFFFFF",
  muted: "#8E8E93",
  tint: "#F4F6F8",
  surface: "#FFFFFF",
};

const DarkColors: ThemeColors = {
  background: "#000000",
  text: "#FFFFFF",
  card: "#1C1C1E",
  border: "#38383A",
  primary: "#FFFFFF",
  secondary: "#1C1C1E",
  muted: "#8E8E93",
  tint: "#2C2C2E",
  surface: "#1C1C1E",
};

interface ThemeContextType {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  colors: ThemeColors;
  isDark: boolean;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

const THEME_STORAGE_KEY = "user_theme_preference";

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const systemColorScheme = useColorScheme();
  const [theme, setThemeState] = useState<Theme>("system");

  useEffect(() => {
    // Load saved theme
    SecureStore.getItemAsync(THEME_STORAGE_KEY).then((savedTheme) => {
      if (
        savedTheme &&
        (savedTheme === "light" ||
          savedTheme === "dark" ||
          savedTheme === "system")
      ) {
        setThemeState(savedTheme as Theme);
      }
    });
  }, []);

  const setTheme = async (newTheme: Theme) => {
    setThemeState(newTheme);
    await SecureStore.setItemAsync(THEME_STORAGE_KEY, newTheme);
  };

  const isDark =
    theme === "dark" || (theme === "system" && systemColorScheme === "dark");

  const colors = isDark ? DarkColors : LightColors;

  return (
    <ThemeContext.Provider value={{ theme, setTheme, colors, isDark }}>
      {children}
    </ThemeContext.Provider>
  );
}

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
};
