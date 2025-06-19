import { Link, Redirect, Tabs } from "expo-router";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { theme } from "@/theme";
import Entypo from "@expo/vector-icons/Entypo";
import { useUserStore } from "@/store/userStore";
import { TouchableOpacity } from "react-native";
import AntDesign from "@expo/vector-icons/AntDesign";

export default function Layout() {
  const hasFinishedOnboarding = useUserStore(
    (state) => state.hasFinishedOnboarding
  );

  if (!hasFinishedOnboarding) {
    return <Redirect href="/onboarding" />;
  }

  return (
    <Tabs
      screenOptions={{
        sceneStyle: { paddingTop: 8, paddingBottom: 8 },
        tabBarActiveTintColor: theme.colorGreen,
        tabBarInactiveTintColor: theme.colorGrey,

        tabBarShowLabel: false,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          headerShown: true,
          title: "Home",
          tabBarIcon: ({ size, color }) => (
            <Entypo name="leaf" size={size} color={color} />
          ),
          headerRight: () => (
            <Link href="/new" asChild>
              <TouchableOpacity style={{ marginRight: 10 }} hitSlop={20}>
                <AntDesign
                  name="pluscircle"
                  size={24}
                  color={theme.colorGreen}
                />
              </TouchableOpacity>
            </Link>
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
