import React, { useState, useRef } from "react";
import {
    StyleSheet,
    Text,
    View,
    Dimensions,
    ScrollView,
    Animated,
    Pressable
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { PlantlyButton } from "@/components/PlantlyButton";
import { theme } from "@/theme";
import { useRouter } from "expo-router";
import { useUserStore } from "@/store/userStore";
import { StatusBar } from "expo-status-bar";
import { PlantlyImage } from "@/components/PlantlyImage";

const { width: screenWidth } = Dimensions.get("window");

interface OnboardingSlide {
    id: number;
    title: string;
    subtitle: string;
    description: string;
    colors: string[];
    icon: string;
    showImage?: boolean;
}

const slides: OnboardingSlide[] = [
    {
        id: 1,
        title: "Welcome to",
        subtitle: "Plantly! 🌱",
        description: "Your personal plant care companion that helps you keep your green friends happy and healthy",
        colors: [theme.colorAppleGreen, theme.colorLimeGreen, theme.colorGreen],
        icon: "🌿",
        showImage: true,
    },
    {
        id: 2,
        title: "Never Forget",
        subtitle: "to Water Again! 💧",
        description: "Set smart reminders for each plant and get notified exactly when it's time to water",
        colors: [theme.colorGreen, theme.colorLightGreen, theme.colorLimeGreen],
        icon: "⏰",
    },
    {
        id: 3,
        title: "Track Growth",
        subtitle: "& Progress 📈",
        description: "Take photos, add notes, and watch your plant family grow over time",
        colors: [theme.colorLeafyGreen, theme.colorGreen, theme.colorAppleGreen],
        icon: "📸",
    },
    {
        id: 4,
        title: "Expert Care",
        subtitle: "Tips & Guides 💡",
        description: "Get personalized advice and learn the best practices for plant care",
        colors: [theme.colorLimeGreen, theme.colorAppleGreen, theme.colorGreen],
        icon: "🌟",
    },
];

export default function OnboardingScreen() {
    const router = useRouter();
    const toggleHasOnboarded = useUserStore(state => state.toggleHasOnboarded);
    const [currentSlide, setCurrentSlide] = useState(0);
    const scrollViewRef = useRef<ScrollView>(null);
    const fadeAnim = useRef(new Animated.Value(1)).current;

    const handleNext = () => {
        if (currentSlide < slides.length - 1) {
            const nextSlide = currentSlide + 1;
            setCurrentSlide(nextSlide);
            scrollViewRef.current?.scrollTo({
                x: nextSlide * screenWidth,
                animated: true,
            });
        }
    };

    const handlePrevious = () => {
        if (currentSlide > 0) {
            const prevSlide = currentSlide - 1;
            setCurrentSlide(prevSlide);
            scrollViewRef.current?.scrollTo({
                x: prevSlide * screenWidth,
                animated: true,
            });
        }
    };

    const handleSkip = () => {
        Animated.timing(fadeAnim, {
            toValue: 0,
            duration: 300,
            useNativeDriver: true,
        }).start(() => {
            toggleHasOnboarded();
            router.replace("/");
        });
    };

    const handleGetStarted = () => {
        Animated.timing(fadeAnim, {
            toValue: 0,
            duration: 300,
            useNativeDriver: true,
        }).start(() => {
            toggleHasOnboarded();
            router.replace("/");
        });
    };

    const handleScroll = (event: any) => {
        const contentOffsetX = event.nativeEvent.contentOffset.x;
        const slideIndex = Math.round(contentOffsetX / screenWidth);
        setCurrentSlide(slideIndex);
    };

    const renderSlide = (slide: OnboardingSlide, index: number) => (
        <LinearGradient
            key={slide.id}
            colors={slide.colors as any}
            style={styles.slide}
        >
            <View style={styles.slideContent}>
                <Text style={styles.icon}>{slide.icon}</Text>

                <View style={styles.titleContainer}>
                    <Text style={styles.title}>{slide.title}</Text>
                    <Text style={styles.subtitle}>{slide.subtitle}</Text>
                </View>

                {slide.showImage && (
                    <View style={styles.imageContainer}>
                        <PlantlyImage />
                    </View>
                )}

                <Text style={styles.description}>{slide.description}</Text>
            </View>
        </LinearGradient>
    );

    const renderPagination = () => (
        <View style={styles.pagination}>
            {slides.map((_, index) => (
                <View
                    key={index}
                    style={[
                        styles.paginationDot,
                        index === currentSlide ? styles.paginationDotActive : null,
                    ]}
                />
            ))}
        </View>
    );

    return (
        <Animated.View style={[styles.container, { opacity: fadeAnim }]}>
            <StatusBar style="light" />

            <ScrollView
                ref={scrollViewRef}
                horizontal
                pagingEnabled
                showsHorizontalScrollIndicator={false}
                onScroll={handleScroll}
                scrollEventThrottle={16}
                style={styles.scrollView}
            >
                {slides.map((slide, index) => renderSlide(slide, index))}
            </ScrollView>

            {renderPagination()}

            <View style={styles.buttonContainer}>
                {currentSlide < slides.length - 1 && (
                    <Pressable style={styles.skipButton} onPress={handleSkip}>
                        <Text style={styles.skipButtonText}>Skip</Text>
                    </Pressable>
                )}

                <View style={styles.navigationButtons}>
                    {currentSlide > 0 && (
                        <Pressable
                            style={[styles.navButton, styles.previousButton]}
                            onPress={handlePrevious}
                        >
                            <Text style={styles.navButtonText}>← Previous</Text>
                        </Pressable>
                    )}

                    {currentSlide < slides.length - 1 ? (
                        <PlantlyButton
                            title="Next →"
                            onPress={handleNext}
                        />
                    ) : (
                        <PlantlyButton
                            title="Let's Start Growing! 🌱"
                            onPress={handleGetStarted}
                        />
                    )}
                </View>
            </View>
        </Animated.View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: theme.colorWhite,
    },
    scrollView: {
        flex: 1,
    },
    slide: {
        width: screenWidth,
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        paddingHorizontal: 30,
    },
    slideContent: {
        alignItems: "center",
        justifyContent: "center",
        flex: 1,
        paddingVertical: 60,
    },
    icon: {
        fontSize: 60,
        marginBottom: 20,
        textAlign: "center",
    },
    titleContainer: {
        alignItems: "center",
        marginBottom: 30,
    },
    title: {
        fontSize: 28,
        fontWeight: "600",
        color: theme.colorWhite,
        textAlign: "center",
        marginBottom: 8,
    },
    subtitle: {
        fontSize: 32,
        fontWeight: "bold",
        color: theme.colorWhite,
        textAlign: "center",
        textShadowColor: 'rgba(0, 0, 0, 0.3)',
        textShadowOffset: { width: 1, height: 1 },
        textShadowRadius: 3,
    },
    imageContainer: {
        marginVertical: 30,
        alignItems: "center",
    },
    description: {
        fontSize: 18,
        color: theme.colorWhite,
        textAlign: "center",
        lineHeight: 26,
        opacity: 0.95,
        marginHorizontal: 20,
        fontWeight: "500",
        textShadowColor: 'rgba(0, 0, 0, 0.2)',
        textShadowOffset: { width: 0, height: 1 },
        textShadowRadius: 2,
    },
    pagination: {
        flexDirection: "row",
        justifyContent: "center",
        alignItems: "center",
        paddingVertical: 20,
        backgroundColor: theme.colorWhite,
    },
    paginationDot: {
        width: 10,
        height: 10,
        borderRadius: 5,
        backgroundColor: theme.colorGrey,
        marginHorizontal: 6,
        opacity: 0.5,
    },
    paginationDotActive: {
        backgroundColor: theme.colorGreen,
        width: 24,
        opacity: 1,
    },
    buttonContainer: {
        paddingHorizontal: 30,
        paddingBottom: 40,
        backgroundColor: theme.colorWhite,
    },
    skipButton: {
        alignSelf: "flex-end",
        marginBottom: 20,
        paddingVertical: 8,
        paddingHorizontal: 12,
    },
    skipButtonText: {
        fontSize: 16,
        color: theme.colorGrey,
        fontWeight: "500",
    },
    navigationButtons: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        gap: 15,
    },
    navButton: {
        paddingVertical: 12,
        paddingHorizontal: 20,
        borderRadius: 25,
        borderWidth: 2,
        borderColor: theme.colorGreen,
        backgroundColor: theme.colorWhite,
    },
    previousButton: {
        borderColor: theme.colorGrey,
    },
    navButtonText: {
        fontSize: 16,
        color: theme.colorGrey,
        fontWeight: "600",
    },
});