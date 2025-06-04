import { Redirect, Tabs } from "expo-router";
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { theme } from "@/theme";
import Entypo from '@expo/vector-icons/Entypo';
import { useUserStore } from "@/store/userStore";

const hasFinishedOnboarding = useUserStore((state) => state.hasFinishedOnboarding);

export default function Layout() {
    // Check if the user has completed the onboarding process
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
            }}>
            <Tabs.Screen
                name="index"
                options={{
                    title: "Home",
                    tabBarIcon: ({ size, color }) => (
                        <Entypo name="leaf" size={size} color={color} />
                    )
                }}>
            </Tabs.Screen>
            <Tabs.Screen
                name="profile"
                options={{
                    title: "Profile",
                    tabBarIcon: ({ size, color }) => (
                        <MaterialIcons name="account-circle" size={size} color={color} />
                    )
                }}>
            </Tabs.Screen>
        </Tabs>
    );
}