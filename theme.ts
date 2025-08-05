export type ThemeType = "light" | "dark" | "auto";

export interface ThemeColors {
  // Background colors
  colorBackground: string;
  colorSurface: string;
  colorCard: string;

  // Text colors
  colorText: string;
  colorTextSecondary: string;
  colorTextInverse: string;

  // Brand colors
  colorGreen: string;
  colorLeafyGreen: string;
  colorDarkGreen: string;
  colorLightGreen: string;
  colorAppleGreen: string;
  colorLimeGreen: string;

  // Accent colors
  colorBlue: string;
  colorBeige: string;
  colorGrey: string;

  // Basic colors
  colorWhite: string;
  colorBlack: string;

  // Status colors
  colorError: string;
  colorWarning: string;
  colorSuccess: string;

  // Border colors
  colorBorder: string;
  colorDivider: string;
}

export const lightTheme: ThemeColors = {
  // Background colors
  colorBackground: "#ffffff",
  colorSurface: "#f8f9fa",
  colorCard: "#ffffff",

  // Text colors
  colorText: "#0E4D04",
  colorTextSecondary: "#c1c3c5ff",
  colorTextInverse: "#ffffff",

  // Brand colors
  colorGreen: "#0E4D04",
  colorLeafyGreen: "#206a42",
  colorDarkGreen: "#145A32",
  colorLightGreen: "#37ed83",
  colorAppleGreen: "#a0d36c",
  colorLimeGreen: "#d0e57e",

  // Accent colors
  colorBlue: "#09C1BE",
  colorBeige: "#EFE0C1",
  colorGrey: "#c1c3c5ff",

  // Basic colors
  colorWhite: "#ffffff",
  colorBlack: "#000000",

  // Status colors
  colorError: "#ff6b6b",
  colorWarning: "#ffa726",
  colorSuccess: "#4caf50",

  // Border colors
  colorBorder: "#e9ecef",
  colorDivider: "#f0f0f0",
};

export const darkTheme: ThemeColors = {
  // Background colors
  colorBackground: "#121212",
  colorSurface: "#1e1e1e",
  colorCard: "#2d2d2d",

  // Text colors
  colorText: "#ffffff",
  colorTextSecondary: "#a0a0a0",
  colorTextInverse: "#000000",

  // Brand colors
  colorGreen: "#4caf50",
  colorLeafyGreen: "#66bb6a",
  colorDarkGreen: "#2e7d32",
  colorLightGreen: "#81c784",
  colorAppleGreen: "#a5d6a7",
  colorLimeGreen: "#c5e1a5",

  // Accent colors
  colorBlue: "#26c6da",
  colorBeige: "#8d6e63",
  colorGrey: "#757575",

  // Basic colors
  colorWhite: "#ffffff",
  colorBlack: "#000000",

  // Status colors
  colorError: "#f44336",
  colorWarning: "#ff9800",
  colorSuccess: "#4caf50",

  // Border colors
  colorBorder: "#404040",
  colorDivider: "#303030",
};

// Legacy theme object for backward compatibility
export const theme = lightTheme;

export const fontFamily = {
  regular: "Inter-Regular",
  medium: "Inter-Medium",
  bold: "Inter-Bold",
  semiBold: "Inter-SemiBold",
};
