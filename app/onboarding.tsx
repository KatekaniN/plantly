import { StyleSheet, Text, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { OnboardingButton } from "@/components/OnboardingButton"; // Import the new component
import Onboarding from 'react-native-onboarding-swiper';
import { theme } from "@/theme";
import { useRouter } from "expo-router";
import { useUserStore } from "@/store/userStore";
import OnboardingImage from "@/components/OnboardingImage";
import { StatusBar } from "expo-status-bar";

export default function OnboardingScreen() {
    const router = useRouter();
    const toggleHasOnboarded = useUserStore(state => state.toggleHasOnboarded);

    const handleDone = () => {
        toggleHasOnboarded();
        router.replace("/");
    };

    const CustomButton = ({ ...props }) => (
        <OnboardingButton
            title={props.title || "Next"}
            onPress={props.onPress}
            variant="primary"
        />
    );

    const DoneButton = ({ ...props }) => (
        <OnboardingButton
            title="Get Started"
            onPress={props.onPress}
            variant="done"
        />
    );

    const SkipButton = ({ ...props }) => (
        <OnboardingButton
            title="Skip"
            onPress={props.onPress}
            variant="skip"
        />
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
});