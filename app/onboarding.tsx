import { StyleSheet, Text } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { PlantlyButton } from "@/components/PlantlyButton";
import { theme } from "@/theme";
import { useRouter } from "expo-router";
import { useUserStore } from "@/store/userStore";
import { StatusBar } from "expo-status-bar";
import { PlantlyImage } from "@/components/PlantlyImage";

export default function OnboardingScreen() {

    const router = useRouter()
    const toggleHasOnboarded = useUserStore(state => state.toggleHasOnboarded);

    const handlePress = () => {
        toggleHasOnboarded();
        router.replace("/");
    }

    return (
        <LinearGradient
            colors={[theme.colorAppleGreen, theme.colorLimeGreen, theme.colorGreen]}
            style={styles.container}>
            <StatusBar style="light" />
            <Text style={styles.headerText}>
                Plantly!
            </Text>
            <Text style={styles.text}>
                Welcome to Plantly, your personal plant care assistant.
                Let's get started by watering your plants!
            </Text>
            <PlantlyImage />
            <PlantlyButton
                title="Go Water My Plants"
                onPress={handlePress} />

        </LinearGradient>
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
        textAlign: "center",
        maxWidth: 300,
        marginBottom: 20,
        paddingHorizontal: 20,
        marginTop: 20,
        color: theme.colorWhite,
    },
    headerText: {
        fontSize: 32,
        fontWeight: "bold",
        top: 20,
        marginBottom: 20,
        textAlign: "center",
        color: theme.colorLeafyGreen,
    },
}); 