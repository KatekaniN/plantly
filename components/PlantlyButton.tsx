import { theme } from "@/theme";
import { StyleSheet, Text, Pressable, View } from "react-native";
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { LinearGradient } from 'expo-linear-gradient';

type Props = {
    title: string;
    onPress: () => void;
};

export function PlantlyButton({ title, onPress }: Props) {
    return (
        <Pressable
            onPress={onPress}
            style={({ pressed }) => [
                styles.buttonContainer,
                pressed && styles.buttonPressed
            ]}
        >
            <LinearGradient
                colors={[theme.colorGreen, '#0a8a3c']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.gradient}
            >
                <View style={styles.contentContainer}>
                    <Text style={styles.text}>{title}</Text>
                    <MaterialCommunityIcons
                        name="leaf"
                        size={28}
                        color="white"
                        style={styles.icon}
                    />
                </View>
            </LinearGradient>
        </Pressable>
    );
}

const styles = StyleSheet.create({
    buttonContainer: {
        borderRadius: 12,
        elevation: 5,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.27,
        shadowRadius: 4.65,
        overflow: 'hidden',
        transform: [{ scale: 1 }],
    },
    buttonPressed: {
        transform: [{ scale: 0.98 }],
        opacity: 0.9,
    },
    gradient: {
        paddingHorizontal: 20,
        paddingVertical: 14,
        borderRadius: 12,
    },
    contentContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
    },
    text: {
        color: "white",
        fontSize: 18,
        fontWeight: "bold",
        textShadowColor: 'rgba(0, 0, 0, 0.2)',
        textShadowOffset: { width: 1, height: 1 },
        textShadowRadius: 2,
        letterSpacing: 0.5,
    },
    icon: {
        marginLeft: 10,
        textShadowColor: 'rgba(0, 0, 0, 0.2)',
        textShadowOffset: { width: 1, height: 1 },
        textShadowRadius: 2,
    }
});