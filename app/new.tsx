import {
  View,
  Text,
  StyleSheet,
  Image,
  useWindowDimensions,
  TouchableOpacity,
} from "react-native";
import FontAwesome6 from "@expo/vector-icons/FontAwesome6";
import { theme } from "@/theme";
import { OnboardingButton } from "@/components/OnboardingButton";
import { useRouter } from "expo-router";

export default function NewScreen() {
  const { width } = useWindowDimensions();
  const imageSize = Math.min(width / 1.1, 400);
  const router = useRouter();

  return (
    <View style={styles.container}>
      {/* Header section */}
      <View style={styles.headerContainer}>
        <Text style={styles.title}>
          Add your new green friend
          <FontAwesome6
            name="seedling"
            size={24}
            color={theme.colorLeafyGreen}
            style={{ marginLeft: 8 }}
          />
        </Text>
        <Text style={styles.subtitle}>Upload a picture from your gallery</Text>
      </View>

      {/* Upload section */}
      <TouchableOpacity
        style={[styles.uploadContainer, { width: imageSize }]}
        onPress={() => console.log("Upload Pressed")}
      >
        <Image
          source={require("@/assets/images/upload-image.png")}
          style={[styles.uploadImage, { width: imageSize, height: imageSize }]}
          resizeMode="contain"
        />
      </TouchableOpacity>

      {/* Bottom section */}
      <View style={styles.bottomContainer}>
        <Text style={styles.orText}>Or</Text>
        <Text style={styles.cameraText}>Take a picture with your camera</Text>
        <OnboardingButton
          title="Open Camera"
          onPress={() => router.push("/camera")} // Navigate to camera screen
          variant="camera"
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colorWhite,
    alignItems: "center",
    paddingHorizontal: 20,
  },
  headerContainer: {
    width: "100%",
    alignItems: "center",
    marginTop: 40,
    marginBottom: 40,
  },
  title: {
    fontSize: 32,
    fontWeight: "bold",
    color: theme.colorGreen,
    textAlign: "center",
    marginBottom: 16,
  },
  subtitle: {
    fontSize: 18,
    color: theme.colorGrey,
    textAlign: "center",
  },
  uploadContainer: {
    aspectRatio: 1.6,

    borderRadius: 20,
    borderStyle: "solid",
    justifyContent: "center",
    alignItems: "center",
    marginVertical: 20,
  },
  uploadContent: {
    alignItems: "center",
    justifyContent: "center",
  },
  uploadImage: {
    marginBottom: 10,
  },
  uploadText: {
    fontSize: 24,
    color: "#AAAAAA",
  },
  bottomContainer: {
    width: "100%",
    alignItems: "center",
    marginTop: 40,
  },
  orText: {
    fontSize: 18,
    color: theme.colorGrey,
    marginBottom: 16,
  },
  cameraText: {
    fontSize: 18,
    color: theme.colorGrey,
    marginBottom: 24,
  },
});
