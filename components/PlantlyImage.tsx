import { useWindowDimensions } from "react-native";
import { Image } from "expo-image";

export function PlantlyImage({ source }: { source?: string }) {
    const { width } = useWindowDimensions();

    const imageSize = Math.min(width / 1.2, 400);

    return (
        <Image
            source={require("@/assets/images/plantly-1.png")}
            style={{ width: imageSize, height: imageSize, marginBottom: 40, marginTop: 20, alignSelf: "center", borderRadius: 50 }}
        />
    );
}