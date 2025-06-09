import { useWindowDimensions } from "react-native";
import { Image } from "expo-image";
import { ImageSourcePropType } from "react-native";

export function PlantlyImage({ source }: { source: ImageSourcePropType }) {
    const { width } = useWindowDimensions();
    const imageSize = Math.min(width / 1.2, 400);

    return (
        <Image
            source={source}
            style={{
                width: imageSize,
                height: imageSize,
                marginBottom: 40,
                marginTop: 20,
                alignSelf: "center",
                borderRadius: 50,
            }}
        />
    );
}
