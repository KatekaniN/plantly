import { Stack } from "expo-router";

export default function Layout() {
    return (
        <Stack
            screenOptions={{
                headerShown: false,
                contentStyle: { backgroundColor: "#fff" },
            }}>
            <Stack.Screen
                name="index"
                options={{ title: "Home" }}>
            </Stack.Screen>
        </Stack>
    );
}