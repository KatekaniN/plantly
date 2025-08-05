import { Link, Redirect, Tabs } from "expo-router";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { theme } from "@/theme";
import { useTheme } from "@/contexts/ThemeContext";
import Entypo from "@expo/vector-icons/Entypo";
import { useUserStore } from "@/store/userStore";
import { TouchableOpacity } from "react-native";
import AntDesign from "@expo/vector-icons/AntDesign";

export default function Layout() {
  const hasFinishedOnboarding = useUserStore(
    (state) => state.hasFinishedOnboarding
  );
  const { theme: currentTheme } = useTheme();

  if (!hasFinishedOnboarding) {
    return <Redirect href="/onboarding" />;
  }

  return (
    <Tabs
      screenOptions={{
        sceneStyle: {
          paddingTop: 8,
          paddingBottom: 8,
          backgroundColor: currentTheme.colorBackground,
        },
        tabBarActiveTintColor: currentTheme.colorLeafyGreen,
        tabBarInactiveTintColor: currentTheme.colorTextSecondary,
        tabBarStyle: {
          backgroundColor: currentTheme.colorSurface,
          borderTopColor: currentTheme.colorBorder,
        },
        headerStyle: {
          backgroundColor: currentTheme.colorBackground,
        },
        headerTintColor: currentTheme.colorText,
        tabBarShowLabel: false,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          headerShown: true,
          title: "Home",
          headerTitle: "",
          headerShadowVisible: false,

          tabBarIcon: ({ size, color }) => (
            <Entypo name="leaf" size={size} color={color} />
          ),
        }}
      ></Tabs.Screen>
      <Tabs.Screen
        name="profile"
        options={{
          title: "Profile",
          tabBarIcon: ({ size, color }) => (
            <MaterialIcons name="account-circle" size={size} color={color} />
          ),
        }}
      ></Tabs.Screen>
    </Tabs>
  );
}
