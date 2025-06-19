import { View, Text } from "react-native";
import FontAwesome6 from "@expo/vector-icons/FontAwesome6";
import React from "react";
import { Stack } from "expo-router";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import { theme } from "@/theme";

export default function Layout() {
  return (
    <View style={{ flex: 1, backgroundColor: "#fff" }}>
      <Stack>
        <Stack.Screen
          name="(tabs)"
          options={{
            headerShown: false,
            animation: "fade",
          }}
        />
        <Stack.Screen
          name="new"
          options={{
            headerShown: true,
            presentation: "modal",
            headerTitleAlign: "center",
            headerTitle: () => (
              <View style={{ flexDirection: "row", alignItems: "center" }}>
                <Text
                  style={{
                    color: theme.colorLeafyGreen,
                    fontSize: 20,
                    fontWeight: "600",
                  }}
                >
                 
                </Text>
                
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
      </Stack>
    </View>
  );
}
