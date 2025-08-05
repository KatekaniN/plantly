import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";
import { Appearance, ColorSchemeName } from "react-native";
import { useUserStore } from "@/store/userStore";
import { ThemeColors, ThemeType, lightTheme, darkTheme } from "@/theme";

interface ThemeContextType {
  theme: ThemeColors;
  themeType: ThemeType;
  setTheme: (themeType: ThemeType) => void;
  isDark: boolean;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

interface ThemeProviderProps {
  children: ReactNode;
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  const { themePreference, setThemePreference } = useUserStore();
  const [currentTheme, setCurrentTheme] = useState<ThemeColors>(lightTheme);
  const [isDark, setIsDark] = useState(false);

  const getSystemTheme = (): "light" | "dark" => {
    const colorScheme = Appearance.getColorScheme();
    return colorScheme === "dark" ? "dark" : "light";
  };

  const determineTheme = (themeType: ThemeType): ThemeColors => {
    switch (themeType) {
      case "light":
        setIsDark(false);
        return lightTheme;
      case "dark":
        setIsDark(true);
        return darkTheme;
      case "auto":
        const systemTheme = getSystemTheme();
        setIsDark(systemTheme === "dark");
        return systemTheme === "dark" ? darkTheme : lightTheme;
      default:
        setIsDark(false);
        return lightTheme;
    }
  };

  useEffect(() => {
    const newTheme = determineTheme(themePreference);
    console.log("ThemeContext: Theme preference changed to", themePreference);
    console.log("ThemeContext: Applying theme", newTheme);
    setCurrentTheme(newTheme);
  }, [themePreference]);

  useEffect(() => {
    if (themePreference === "auto") {
      const subscription = Appearance.addChangeListener(() => {
        const newTheme = determineTheme("auto");
        setCurrentTheme(newTheme);
      });

      return () => subscription?.remove();
    }
  }, [themePreference]);

  const setTheme = (themeType: ThemeType) => {
    console.log("ThemeContext: Setting theme to", themeType);
    setThemePreference(themeType);
  };

  const value: ThemeContextType = {
    theme: currentTheme,
    themeType: themePreference,
    setTheme,
    isDark,
  };

  return (
    <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
  );
};

export const useTheme = (): ThemeContextType => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
};
