import { StyleSheet, Text, TouchableOpacity } from "react-native";
import { theme } from "@/theme";

type OnboardingButtonProps = {
    title?: string;
    onPress: () => void;
    variant?: "primary" | "done" | "skip";
};

export const OnboardingButton: React.FC<OnboardingButtonProps> = ({ title = "Next", onPress, variant = "primary" }) => {
    return (
        <TouchableOpacity
            style={[
                styles.button,
                variant === "done" && styles.doneButton,
                variant === "skip" && styles.skipButton
            ]}
            onPress={onPress}
            activeOpacity={0.8}
        >
            <Text style={[
                styles.buttonText,
                variant === "done" && styles.doneButtonText,
                variant === "skip" && styles.skipButtonText
            ]}>
                {title}
            </Text>
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    button: {
        backgroundColor: theme.colorWhite,
        paddingHorizontal: 24,
        paddingVertical: 12,
        borderRadius: 25,
        marginHorizontal: 20,
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    buttonText: {
        color: theme.colorLeafyGreen,
        fontSize: 16,
        fontWeight: "600",
        textAlign: "center",
    },
    doneButton: {
        backgroundColor: theme.colorWhite,
        paddingHorizontal: 32,
    },
    doneButtonText: {
        color: theme.colorAppleGreen,
        fontWeight: "700",
    },
    skipButton: {
        backgroundColor: "transparent",
        shadowOpacity: 0,
        elevation: 0,
        paddingVertical: 10,
    },
    skipButtonText: {
        color: theme.colorWhite,
        opacity: 0.8,
        fontWeight: "500",
    },
});