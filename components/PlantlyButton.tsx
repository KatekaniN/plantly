import { theme } from "@/theme";
import { StyleSheet, Text, Pressable } from "react-native";
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';

type Props = {
    title: string;
    onPress: () => void;
};

export function PlantlyButton({ title, onPress }: Props) {
    return (
        <Pressable onPress={onPress} style={styles.button}>
            <Text style={styles.text}>{title}
                <Text style={styles.iconSpacing}>
                    <MaterialCommunityIcons name="leaf" size={24} color="white" />
                </Text>
            </Text>
        </Pressable>
    );
}

const styles = StyleSheet.create({
    text: {
        color: "white",
        fontSize: 18,
        fontWeight: "bold",
    },
    button: {
        paddingHorizontal: 18,
        paddingVertical: 12,
        borderRadius: 6,
        backgroundColor: theme.colorGreen,
    },
    iconSpacing: {
        marginLeft: 8, // Adjust this value for more or less spacing
    }
});
