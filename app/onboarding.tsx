import { StyleSheet, Text, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { PlantlyButton } from "@/components/PlantlyButton";
import Onboarding from 'react-native-onboarding-swiper';
import { theme } from "@/theme";
import { useRouter } from "expo-router";
import { useUserStore } from "@/store/userStore";
import { OnboardingImage } from "@/components/OnboardingImage";
import { StatusBar } from "expo-status-bar";
import { PlantlyImage } from "@/components/PlantlyImage";

export default function OnboardingScreen() {
    const router = useRouter();
    const toggleHasOnboarded = useUserStore(state => state.toggleHasOnboarded);

    const handleDone = () => {
        toggleHasOnboarded();
        router.replace("/");
    };

    const CustomButton = ({ ...props }) => (
        <PlantlyButton
            title={props.title || "Next"}
            onPress={props.onPress}
        />
    );

    const DoneButton = ({ ...props }) => (
        <PlantlyButton
            title="Start Caring for Plants"
            onPress={props.onPress}
        />
    );

    const SkipButton = ({ ...props }) => (
        <Text style={styles.skipButton} onPress={props.onPress}>
            Skip
        </Text>
    );

    return (
        <LinearGradient
            colors={[theme.colorAppleGreen, theme.colorLimeGreen, theme.colorGreen]}
            style={styles.container}
        >
            <StatusBar style="light" />
            <Onboarding
                onSkip={handleDone}
                onDone={handleDone}
                NextButtonComponent={CustomButton}
                DoneButtonComponent={DoneButton}
                SkipButtonComponent={SkipButton}
                containerStyles={styles.onboardingContainer}
                imageContainerStyles={styles.imageContainer}
                bottomBarHighlight={false}
                showPagination={true}
                pages={[
                    {
                        backgroundColor: 'transparent',
                        image: (
                            <View style={styles.pageImageContainer}>
                                {/* AI Prompt: "A cheerful cartoon illustration of a smiling person holding a small potted plant, surrounded by various colorful houseplants like monstera, snake plant, and pothos in a bright, modern living room setting" */}
                                <OnboardingImage source={require('../assets/images/plantly-1.png')} />

                            </View>
                        ),
                        title: (
                            <Text style={styles.title}>
                                Welcome to Plantly
                            </Text>
                        ),
                        subtitle: (
                            <Text style={styles.subtitle}>
                                Your personal plant care assistant that helps you keep your green friends happy and healthy
                            </Text>
                        ),
                    },
                    {

                        backgroundColor: 'transparent',
                        image: (
                            <View style={styles.pageImageContainer}>
                                {/* AI Prompt: "A cute cartoon illustration of a smartphone with notification bubbles showing water drop icons and plant emojis, with a calendar in the background showing scheduled watering days, in a clean minimalist style" */}
                                <OnboardingImage source={require('../assets/images/plantly-2.png')} />

                            </View>
                        ),
                        title: (
                            <Text style={styles.title}>
                                Smart Reminders
                            </Text>
                        ),
                        subtitle: (
                            <Text style={styles.subtitle}>
                                Never forget to water your plants again! Get personalized reminders based on each plant's needs
                            </Text>
                        ),
                    },
                    {
                        backgroundColor: 'transparent',
                        image: (
                            <View style={styles.pageImageContainer}>
                                {/* AI Prompt: "A vibrant cartoon illustration showing different types of plants (succulent, fern, flowering plant, herb garden) each with unique care icons (water drops, sun rays, temperature gauge), arranged in a beautiful garden setting" */}
                                <OnboardingImage source={require('../assets/images/plantly-3.png')} />

                            </View>
                        ),
                        title: (
                            <Text style={styles.title}>
                                Personalized Care
                            </Text>
                        ),
                        subtitle: (
                            <Text style={styles.subtitle}>
                                Every plant is unique! Track individual watering schedules, light requirements, and growth progress
                            </Text>
                        ),
                    },
                    {
                        backgroundColor: 'transparent',
                        image: (
                            <View style={styles.pageImageContainer}>
                                {/* AI Prompt: "A heartwarming cartoon illustration of thriving, lush green plants in various pots with sparkles and growth indicators around them, showing a transformation from small seedlings to full grown plants, conveying success and growth" */}
                                <OnboardingImage source={require('../assets/images/plantly-4.png')} />

                            </View>
                        ),
                        title: (
                            <Text style={styles.title}>
                                Watch Them Thrive
                            </Text>
                        ),
                        subtitle: (
                            <Text style={styles.subtitle}>
                                Track your plant's growth journey and become the plant parent you've always wanted to be!
                            </Text>
                        ),
                    },
                ]}
            />
        </LinearGradient>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    onboardingContainer: {
        backgroundColor: 'transparent',
    },
    imageContainer: {
        paddingBottom: 0,
    },
    pageImageContainer: {
        width: 250,
        height: 250,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 20,
    },
    title: {
        fontSize: 28,
        fontWeight: 'bold',
        color: theme.colorWhite,
        textAlign: 'center',
        marginBottom: 10,
        paddingHorizontal: 20,
    },
    subtitle: {
        fontSize: 16,
        color: theme.colorWhite,
        textAlign: 'center',
        paddingHorizontal: 30,
        lineHeight: 24,
        opacity: 0.9,
    },
    skipButton: {
        fontSize: 16,
        color: theme.colorWhite,
        paddingHorizontal: 20,
        paddingVertical: 10,
        opacity: 0.8,
    },
});