import { StyleSheet, Text, View } from "react-native";
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
                Plantly
            </Text>
            <Text style={styles.text}>
                Your personal plant care assistant.
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
        fontSize: 18,
        justifyContent: "center",
        alignItems: "center",
        marginTop: 10,
        textAlign: "center",
        maxWidth: 300,
        color: theme.colorAppleGreen,
        paddingHorizontal: 20,

    },
    headerText: {
        fontSize: 40,
        fontWeight: "bold",
        top: 20,
        marginBottom: 20,
        textAlign: "center",
        color: theme.colorLeafyGreen,
    },
}); 