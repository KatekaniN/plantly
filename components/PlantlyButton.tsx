import { theme } from "@/theme";
import { StyleSheet, Text, Pressable, View, Platform } from "react-native";
import FontAwesome6 from '@expo/vector-icons/FontAwesome5';
import * as Haptics from 'expo-haptics';
import { FontAwesome6 as FontAwesome6Type } from '@expo/vector-icons';

type Props = {
    title: string;
    icon?: React.ComponentProps<typeof FontAwesome6Type>['name'];
    onPress: () => void;
};

export function PlantlyButton({ title, onPress, icon = "leaf" }: Props) {

    const hapticOnPress = () => {
        if (Platform.OS === 'ios' || Platform.OS === 'android') {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        }
        onPress();
    }

    return (
        <Pressable onPress={hapticOnPress} style={({ pressed }) => {
            if (pressed) {
                return [styles.button, styles.buttonPressed];
            }
            return styles.button;
        }}>
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
    },
    icon: {
        marginLeft: 6,
    },
    buttonPressed: {
        backgroundColor: theme.colorLeafyGreen
    }
});