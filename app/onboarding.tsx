import { Text, View, StyleSheet, Button } from "react-native";
import { PlantlyButton } from "@/components/PlantlyButton";
import { theme } from "@/theme";
import { useRouter } from "expo-router";
import { useUserStore } from "@/store/userStore";

export default function OnboardingScreen() {

    const router = useRouter()
    const toggleHasOnboarded = useUserStore(state => state.toggleHasOnboarded);

    const handlePress = () => {
        toggleHasOnboarded();
        router.replace("/");
    }

    return (
        <View style={styles.container}>
            <PlantlyButton
                title="I want to water my plants!"
                onPress={handlePress} >
            </PlantlyButton>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: theme.colorWhite,
    },
    text: {
        fontSize: 24,
    },
});