import { Tabs } from "expo-router";

export default function Layout() {
    return (
        <Tabs
            screenOptions={{
                sceneStyle: { backgroundColor: "#f335ad" },
            }}>
            <Tabs.Screen
                name="index"
                options={{ title: "Home" }}>
            </Tabs.Screen>
        </Tabs>
    );
}