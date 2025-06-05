import { StyleSheet, Text } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { PlantlyButton } from "@/components/PlantlyButton";
import { theme } from "@/theme";
import { useRouter } from "expo-router";
import { useUserStore } from "@/store/userStore";
import { View } from "react-native-reanimated/lib/typescript/Animated";
import { StatusBar } from "expo-status-bar";

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
                Welcome to Plantly!
            </Text>
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
    },
    headerText: {
        fontSize: 32,
        fontWeight: "bold",
        marginBottom: 20,
        textAlign: "center",
        color: theme.colorAppleGreen,
    }
});