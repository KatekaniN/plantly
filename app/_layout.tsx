import { Tabs } from "expo-router";
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import FontAwesome from '@expo/vector-icons/FontAwesome';

export default function Layout() {
    return (
        <Tabs
            screenOptions={{
                sceneStyle: { paddingTop: 8, paddingBottom: 8 },
                tabBarActiveTintColor: "#fa7acb",
                tabBarInactiveTintColor: "#eee",
                tabBarShowLabel: false,
            }}>
            <Tabs.Screen
                name="index"
                options={{
                    title: "Home",
                    tabBarIcon: ({ size, color }) => (
                        <FontAwesome name="home" size={size} color={color} />
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