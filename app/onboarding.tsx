import { StyleSheet, Text } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useWindowDimensions } from "react-native";
import { PlantlyButton } from "@/components/PlantlyButton";
import { theme } from "@/theme";
import { useRouter } from "expo-router";
import { Image } from "expo-image";
import { useUserStore } from "@/store/userStore";
import { View } from "react-native-reanimated/lib/typescript/Animated";
import { StatusBar } from "expo-status-bar";

export default function OnboardingScreen() {
    const { width } = useWindowDimensions();

    const imageSize = Math.min(width / 1.5, 400);

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
            <Image
                style={[styles.image, { width: imageSize, height: imageSize }]}
                source={require('@/assets/images/logo1.png')}
            />
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
        top: 20,
        marginBottom: 20,
        textAlign: "center",
        color: theme.colorWhite,
    },
    image: {
        marginBottom: 40,
        marginTop: 20,
        alignSelf: "center",
    }
});