import React from "react";
import { Text, TextProps, TextStyle } from "react-native";
import { useTheme } from "@/contexts/ThemeContext";

interface ThemedTextProps extends TextProps {
  variant?: "primary" | "secondary" | "inverse";
  children: React.ReactNode;
}

export const ThemedText: React.FC<ThemedTextProps> = ({
  variant = "primary",
  style,
  children,
  ...props
}) => {
  const { theme } = useTheme();

  const getTextColor = () => {
    switch (variant) {
      case "primary":
        return theme.colorText;
      case "secondary":
        return theme.colorTextSecondary;
      case "inverse":
        return theme.colorTextInverse;
      default:
        return theme.colorText;
    }
  };

  const textStyle: TextStyle = {
    color: getTextColor(),
  };

  return (
    <Text style={[textStyle, style]} {...props}>
      {children}
    </Text>
  );
};
