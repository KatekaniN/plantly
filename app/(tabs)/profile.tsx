import { Text, View, StyleSheet, Button } from "react-native";
import { PlantlyButton } from "@/components/PlantlyButton";
import { useUserStore } from "@/store/userStore";

export default function ProfileScreen() {
    const toggleHasOnboarded = useUserStore((state) => state.toggleHasOnboarded);
    return (
        <View style={styles.container}>
            <PlantlyButton title="Go to Onboarding" onPress={toggleHasOnboarded} icon={"backward"} />
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
