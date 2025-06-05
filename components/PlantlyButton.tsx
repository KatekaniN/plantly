import { theme } from "@/theme";
import { StyleSheet, Text, Pressable, View } from "react-native";
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';

type Props = {
    title: string;
    onPress: () => void;
};

export function PlantlyButton({ title, onPress }: Props) {
    return (
        <Pressable onPress={onPress} style={styles.button}>
            <View style={styles.contentContainer}>
                <Text style={styles.text}>{title}</Text>
                <MaterialCommunityIcons
                    name="watering-can"
                    size={28}
                    color="white"
                    style={styles.icon}
                />
            </View>
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
    contentContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
    },
    icon: {
        marginLeft: 6,
    }
});