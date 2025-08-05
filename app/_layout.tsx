import { View, Text } from "react-native";
import FontAwesome6 from "@expo/vector-icons/FontAwesome6";
import React, { useEffect } from "react";
import { Stack } from "expo-router";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import { theme } from "@/theme";
import notificationService from "@/services/notificationService";
import { ThemeProvider, useTheme } from "@/contexts/ThemeContext";

function StackNavigator() {
  const { theme: currentTheme } = useTheme();

  useEffect(() => {
    // Initialize notifications when app starts
    notificationService.initialize().then((success) => {
      if (success) {
        console.log("🔔 Notifications initialized successfully");
      } else {
        console.log("❌ Failed to initialize notifications");
      }
    });
  }, []);

  return (
    <View style={{ flex: 1, backgroundColor: currentTheme.colorBackground }}>
      <Stack>
        <Stack.Screen
          name="(tabs)"
          options={{
            headerShown: false,
            animation: "fade",
          }}
        />
        <Stack.Screen
          name="camera"
          options={{
            headerShown: true,
            presentation: "modal",
            headerTitleAlign: "center",
            headerTitle: () => (
              <View style={{ flexDirection: "row", alignItems: "center" }}>
                <Text
                  style={{
                    color: currentTheme.colorLeafyGreen,
                    fontSize: 20,
                    fontWeight: "600",
                  }}
                ></Text>
              </View>
            ),
            animation: "slide_from_right",
          }}
        />
        <Stack.Screen
          name="onboarding"
          options={{
            animation: "fade",
            headerShown: false,
            title: "Onboarding",
            presentation: "modal",
          }}
        />
        <Stack.Screen
          name="plant-detail/[id]"
          options={{
            animation: "fade",
            headerShown: false,
            title: "",
            presentation: "modal",
          }}
        />
        <Stack.Screen
          name="plantdetailsreview"
          options={{
            animation: "fade",
            headerShown: false,
            title: "Review Plant Details",
            presentation: "modal",
          }}
        />
        <Stack.Screen
          name="plantIdentification"
          options={{
            animation: "slide_from_right",
            headerShown: false,
            title: "Plant Identification",
            presentation: "modal",
          }}
        />
        <Stack.Screen
          name="notification-settings"
          options={{
            animation: "slide_from_right",
            headerShown: false,
            title: "Notification Settings",
            presentation: "modal",
          }}
        />
        <Stack.Screen
          name="edit-plant/[id]"
          options={{
            animation: "slide_from_right",
            headerShown: false,
            title: "Edit Plant",
            presentation: "modal",
          }}
        />
      </Stack>
    </View>
  );
}

export default function Layout() {
  return (
    <ThemeProvider>
      <StackNavigator />
    </ThemeProvider>
  );
}
