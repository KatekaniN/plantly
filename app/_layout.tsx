import { Tabs } from "expo-router";

export default function Layout() {
    return (
        <Tabs
            screenOptions={{
                sceneStyle: { paddingTop: 8, paddingBottom: 8 },
                tabBarActiveTintColor: "#fa7acb",
            }}>
            <Tabs.Screen
                name="index"
                options={{ title: "Home" }}>
            </Tabs.Screen>
        </Tabs>
    );
}