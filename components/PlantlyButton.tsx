import { theme } from "@/theme";
import { StyleSheet, Text, Pressable, View } from "react-native";
import Entypo from '@expo/vector-icons/Entypo';
import { Entypo as EntypoType } from '@expo/vector-icons';

type Props = {
    title: string;
    icon?: React.ComponentProps<typeof EntypoType>['name'];
    onPress: () => void;
};

export function PlantlyButton({ title, onPress, icon = "leaf" }: Props) {
    return (
        <Pressable onPress={onPress} style={styles.button}>
            <View style={styles.contentContainer}>
                <Text style={styles.text}>{title}</Text>
                <Entypo
                    name={icon}
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