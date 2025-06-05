import { Text, View, StyleSheet, Button } from "react-native";
import { useUserStore } from "@/store/userStore";

export default function ProfileScreen() {
    const toggleHasOnboarded = useUserStore((state) => state.toggleHasOnboarded);
    return (
        <View style={styles.container}>
            <Button title="Go back to Onboarding" onPress={toggleHasOnboarded} />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "#fff",
    },
    text: {
        fontSize: 24,
    },
});
