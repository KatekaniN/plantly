import { theme } from "@/theme";
import { StyleSheet, Text, View, Platform } from "react-native";
import FontAwesome6 from '@expo/vector-icons/FontAwesome5';
import Animated, {
    useSharedValue,
    useAnimatedStyle,
    withSpring
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { FontAwesome6 as FontAwesome6Type } from '@expo/vector-icons';
import { Pressable } from "react-native";

type Props = {
    title: string;
    icon?: React.ComponentProps<typeof FontAwesome6Type>['name'];
    onPress: () => void;
};

export function PlantlyButton({ title, onPress, icon = "leaf" }: Props) {
    // Create a shared value for the scale animation
    const scale = useSharedValue(1);

    // Create an animated style for the button wrapper
    const animatedStyle = useAnimatedStyle(() => ({
        transform: [{ scale: scale.value }]
    }));

    // Handler functions
    const handlePressIn = () => {
        scale.value = withSpring(0.9, {
            damping: 15,
            stiffness: 120,
            mass: 0.6
        });
    };

    const handlePressOut = () => {
        scale.value = withSpring(1, {
            damping: 15,
            stiffness: 120,
            mass: 0.6
        });
    };

    const hapticOnPress = () => {
        if (Platform.OS === 'ios' || Platform.OS === 'android') {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        }
        onPress();
    };

    return (
        <Animated.View style={[styles.buttonWrapper, animatedStyle]}>
            <Pressable
                onPressIn={handlePressIn}
                onPressOut={handlePressOut}
                onPress={hapticOnPress}
                style={({ pressed }) => [
                    styles.button,
                    pressed && styles.buttonPressed
                ]}
            >
                <View style={styles.contentContainer}>
                    <Text style={styles.text}>{title}</Text>
                    <FontAwesome6
                        name={icon}
                        size={20}
                        color="white"
                        style={styles.icon}
                    />
                </View>
            </Pressable>
        </Animated.View>
    );
}

const styles = StyleSheet.create({
    buttonWrapper: {
        // This wrapper will handle the scale animation
        alignSelf: 'center',  // This helps with proper scaling
    },
    text: {
        color: theme.colorWhite,
        fontSize: 18,
        fontWeight: "bold",
    },
    button: {
        paddingHorizontal: 18,
        paddingVertical: 12,
        borderRadius: 6,
        backgroundColor: theme.colorGreen,
        overflow: 'hidden',
    },
    contentContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
    },
    icon: {
        marginLeft: 6,
    },
    buttonPressed: {
        backgroundColor: theme.colorLeafyGreen
    }
});