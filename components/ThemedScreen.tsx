import React from "react";
import { View, StatusBar, StyleSheet, ViewStyle } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useTheme } from "@/contexts/ThemeContext";

interface ThemedScreenProps {
  children: React.ReactNode;
  style?: ViewStyle;
  edges?: ("top" | "bottom" | "left" | "right")[];
  statusBarStyle?: "light-content" | "dark-content" | "auto";
}

export const ThemedScreen: React.FC<ThemedScreenProps> = ({
  children,
  style,
  edges = ["top", "bottom"],
  statusBarStyle = "auto",
}) => {
  const { theme, isDark } = useTheme();

  const getStatusBarStyle = () => {
    if (statusBarStyle === "auto") {
      return isDark ? "light-content" : "dark-content";
    }
    return statusBarStyle;
  };

  return (
    <SafeAreaView
      style={[
        styles.container,
        { backgroundColor: theme.colorBackground },
        style,
      ]}
      edges={edges}
    >
      <StatusBar
        barStyle={getStatusBarStyle()}
        backgroundColor={theme.colorBackground}
        translucent={false}
      />
      {children}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
