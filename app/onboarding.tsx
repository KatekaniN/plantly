import React, { useState, useRef } from "react";
import {
    Text,
    View,
    StyleSheet,
    Pressable,
    Dimensions,
    Image,
    ScrollView,
    Animated,
} from "react-native";
import { theme } from "@/theme";
import { useRouter } from "expo-router";
import { useUserStore } from "@/store/userStore";

const { width: screenWidth, height: screenHeight } = Dimensions.get("window");

interface OnboardingSlide {
    id: number;
    title: string;
    description: string;
    icon: string; // You can replace with actual icons/images
    backgroundColor: string;
}

const slides: OnboardingSlide[] = [
    {
        id: 1,
        title: "Welcome to Plantly",
        description: "Your personal plant care companion. Never forget to water your green friends again!",
        icon: "🌱",
        backgroundColor: theme.colorGreen || "#4CAF50",
    },
    {
        id: 2,
        title: "Smart Reminders",
        description: "Set custom watering schedules for each plant. We'll remind you exactly when it's time to water.",
        icon: "⏰",
        backgroundColor: theme.colorBlue,
    },
    {
        id: 3,
        title: "Track Your Plants",
        description: "Add photos, notes, and track the growth of all your plants in one beautiful place.",
        icon: "📸",
        backgroundColor: theme.colorPurple,
    },
    {
        id: 4,
        title: "Plant Care Tips",
        description: "Get personalized care tips and learn how to keep your plants healthy and thriving.",
        icon: "💡",
        backgroundColor: theme.colorOrange,
    },
];

export default function OnboardingScreen() {
    const router = useRouter();
    const toggleHasOnboarded = useUserStore((state) => state.toggleHasOnboarded);
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
        setCurrentSlide(slides.length - 1);
        scrollViewRef.current?.scrollTo({
            x: (slides.length - 1) * screenWidth,
            animated: true,
        });
    };

    const handleGetStarted = () => {
        AnimationUtils.fadeOut(fadeAnim, {
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
        <View key={slide.id} style={[styles.slide, { backgroundColor: slide.backgroundColor }]}>
            <View style={styles.slideContent}>
                <Text style={styles.icon}>{slide.icon}</Text>
                <Text style={styles.title}>{slide.title}</Text>
                <Text style={styles.description}>{slide.description}</Text>
            </View>
        </View>
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
                        <Pressable style={styles.navButton} onPress={handlePrevious}>
                            <Text style={styles.navButtonText}>Previous</Text>
                        </Pressable>
                    )}

                    {currentSlide < slides.length - 1 ? (
                        <Pressable style={styles.nextButton} onPress={handleNext}>
                            <Text style={styles.nextButtonText}>Next</Text>
                        </Pressable>
                    ) : (
                        <Pressable style={styles.getStartedButton} onPress={handleGetStarted}>
                            <Text style={styles.getStartedButtonText}>Get Started</Text>
                        </Pressable>
                    )}
                </View>
            </View>
        </Animated.View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: theme.colorWhite || "#FFFFFF",
    },
    scrollView: {
        flex: 1,
    },
    slide: {
        width: screenWidth,
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        paddingHorizontal: 40,
    },
    slideContent: {
        alignItems: "center",
        justifyContent: "center",
        flex: 1,
    },
    icon: {
        fontSize: 80,
        marginBottom: 40,
    },
    title: {
        fontSize: 28,
        fontWeight: "bold",
        color: "#FFFFFF",
        textAlign: "center",
        marginBottom: 20,
    },
    description: {
        fontSize: 16,
        color: "#FFFFFF",
        textAlign: "center",
        lineHeight: 24,
        opacity: 0.9,
    },
    pagination: {
        flexDirection: "row",
        justifyContent: "center",
        alignItems: "center",
        paddingVertical: 20,
    },
    paginationDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: "#E0E0E0",
        marginHorizontal: 4,
    },
    paginationDotActive: {
        backgroundColor: theme.colorGreen || "#4CAF50",
        width: 20,
    },
    buttonContainer: {
        paddingHorizontal: 40,
        paddingBottom: 40,
    },
    skipButton: {
        alignSelf: "flex-end",
        marginBottom: 20,
    },
    skipButtonText: {
        fontSize: 16,
        color: "#666666",
    },
    navigationButtons: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
    },
    navButton: {
        paddingVertical: 12,
        paddingHorizontal: 24,
        borderRadius: 25,
        borderWidth: 1,
        borderColor: "#E0E0E0",
    },
    navButtonText: {
        fontSize: 16,
        color: "#666666",
    },
    nextButton: {
        backgroundColor: theme.colorGreen || "#4CAF50",
        paddingVertical: 15,
        paddingHorizontal: 40,
        borderRadius: 25,
        elevation: 2,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
    },
    nextButtonText: {
        fontSize: 16,
        fontWeight: "600",
        color: "#FFFFFF",
    },
    getStartedButton: {
        backgroundColor: theme.colorGreen || "#4CAF50",
        paddingVertical: 15,
        paddingHorizontal: 40,
        borderRadius: 25,
        elevation: 2,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
        flex: 1,
        alignItems: "center",
    },
    getStartedButtonText: {
        fontSize: 18,
        fontWeight: "bold",
        color: "#FFFFFF",
    },
});

// Utility for animations
const AnimationUtils = {
    fadeOut: (animatedValue: Animated.Value, config: { duration: number; useNativeDriver: boolean }) => {
        return Animated.timing(animatedValue, {
            toValue: 0,
            ...config,
        });
    },
};