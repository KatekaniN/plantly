import { Platform, StyleSheet, Text, TouchableOpacity } from "react-native";
import { theme } from "@/theme";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from "react-native-reanimated";
import * as Haptics from "expo-haptics";

type OnboardingButtonProps = {
  title?: string;
  onPress: () => void;
  variant?: "primary" | "done" | "skip" | "camera";
};

export const OnboardingButton: React.FC<OnboardingButtonProps> = ({
  title = "Next",
  onPress,
  variant = "primary",
}) => {
  // Move hooks inside the component
  const scale = useSharedValue(1);
  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = () => {
    scale.value = withSpring(0.9, {
      damping: 15,
      stiffness: 120,
      mass: 0.6,
    });
  };

  const handlePressOut = () => {
    scale.value = withSpring(1, {
      damping: 15,
      stiffness: 120,
      mass: 0.6,
    });
  };

  const hapticPress = () => {
    if (Platform.OS !== "web") {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
  };

  const handlePress = () => {
    hapticPress();
    onPress();
  };

  return (
    <Animated.View style={animatedStyle}>
      <TouchableOpacity
        style={[
          styles.button,
          variant === "done" && styles.doneButton,
          variant === "skip" && styles.skipButton,
          variant === "camera" && styles.cameraUploadButton,
        ]}
        onPress={handlePress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        activeOpacity={0.8}
      >
        <Text
          numberOfLines={1}
          style={[
            styles.buttonText,
            variant === "done" && styles.doneButtonText,
            variant === "skip" && styles.skipButtonText,
            variant === "camera" && styles.cameraUploadButtonText,
          ]}
        >
          {title}
        </Text>
      </TouchableOpacity>
    </Animated.View>
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
    backgroundColor: theme.colorLeafyGreen,
    minWidth: 200,
  },
  doneButtonText: {
    color: theme.colorWhite,
    flexShrink: 1,
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
  cameraUploadButton: {
    backgroundColor: theme.colorGreen,
    minWidth: 200,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 25,
  },
  cameraUploadButtonText: {
    color: theme.colorWhite,
    fontSize: 16,
    fontWeight: "600",
    textAlign: "center",
  },
});
