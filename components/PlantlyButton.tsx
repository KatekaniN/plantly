import { theme } from "@/theme";
import { StyleSheet, Text, View, Platform } from "react-native";
import FontAwesome6 from '@expo/vector-icons/FontAwesome5';
import Animated, {
    useSharedValue,
    useAnimatedStyle,
    withTiming,
    Easing
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

    const scale = useSharedValue(1);

    const animatedStyle = useAnimatedStyle(() => {
        return {
            transform: [{ scale: scale.value }]
        };
    });

    const hapticOnPress = () => {
        if (Platform.OS === 'ios' || Platform.OS === 'android') {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        }
        onPress();
    }

    return (
        <Pressable
            onPressIn={() => {
                scale.value = withTiming(0.9, {
                    duration: 100,
                    easing: Easing.bezier(0.25, 0.1, 0.25, 1),
                });
            }}
            onPressOut={() => {
                scale.value = withTiming(1, {
                    duration: 150,
                    easing: Easing.bezier(0.25, 0.1, 0.25, 1),
                });
            }}
            onPress={hapticOnPress}
            style={({ pressed }) => pressed ? [styles.button, styles.buttonPressed] : styles.button}
        >
            <Animated.View style={[styles.contentContainer, animatedStyle]}>
                <Text style={styles.text}>{title}</Text>
                <FontAwesome6
                    name={icon}
                    size={20}
                    color="white"
                    style={styles.icon}
                />
            </Animated.View>
        </Pressable>
    );
}

const styles = StyleSheet.create({
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
    },
    contentContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        width: '100%',
    },
    icon: {
        marginLeft: 6,
    },
    buttonPressed: {
        backgroundColor: theme.colorLeafyGreen
    }
});