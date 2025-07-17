import {
  View,
  Text,
  StyleSheet,
  Image,
  useWindowDimensions,
  TouchableOpacity,
  Alert,
} from "react-native";
import FontAwesome6 from "@expo/vector-icons/FontAwesome6";
import { theme } from "@/theme";
import { OnboardingButton } from "@/components/OnboardingButton";
import { useRouter } from "expo-router";
import * as ImagePicker from "expo-image-picker";

export default function NewScreen() {
  const { width } = useWindowDimensions();
  const imageSize = Math.min(width / 1.1, 400);
  const router = useRouter();

  // Function to pick image from gallery
  const pickImageFromGallery = async () => {
    try {
      // Request permission
      const permissionResult =
        await ImagePicker.requestMediaLibraryPermissionsAsync();

      if (permissionResult.granted === false) {
        Alert.alert(
          "Permission required",
          "Permission to access camera roll is required!"
        );
        return;
      }

      // Launch image picker
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        const imageUri = result.assets[0].uri;
        console.log("Selected image URI:", imageUri);

        // Navigate to plant identification with the image URI
        router.push({
          pathname: "/plantIdentification",
          params: { imageUri },
        });
      }
    } catch (error) {
      console.error("Error picking image:", error);
      Alert.alert("Error", "Failed to pick image from gallery");
    }
  };

  // Function to take photo with camera
  const takePhotoWithCamera = async () => {
    try {
      // Request permission
      const permissionResult =
        await ImagePicker.requestCameraPermissionsAsync();

      if (permissionResult.granted === false) {
        Alert.alert(
          "Permission required",
          "Permission to access camera is required!"
        );
        return;
      }

      // Launch camera
      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        const imageUri = result.assets[0].uri;
        console.log("Captured image URI:", imageUri);

        router.push({
          pathname: "/plantIdentification",
          params: { imageUri },
        });
      }
    } catch (error) {
      console.error("Error taking photo:", error);
      Alert.alert("Error", "Failed to take photo");
    }
  };

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
        onPress={pickImageFromGallery} // Updated this line
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
          onPress={takePhotoWithCamera} // Updated this line
          variant="camera"
        />
      </View>
    </View>
  );
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    backgroundColor: theme.colorWhite || "#fff",
    paddingHorizontal: 20,
    paddingTop: 60,
    justifyContent: "space-between",
  },
  message: {
    fontSize: 20,
    fontWeight: "600",
    marginBottom: 16,
    textAlign: "center",
    paddingHorizontal: 30,
  },
  submessage: {
    fontSize: 16,
    color: "#666",
    marginBottom: 30,
    textAlign: "center",
    paddingHorizontal: 40,
  },
  permissionButton: {
    backgroundColor: theme.colorGreen,
    paddingVertical: 14,
    paddingHorizontal: 30,
    borderRadius: 25,
    marginBottom: 16,
    minWidth: 200,
    alignItems: "center",
  },
  permissionButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  secondaryButton: {
    backgroundColor: "transparent",
    borderWidth: 1,
    borderColor: theme.colorGreen,
  },
  secondaryButtonText: {
    color: theme.colorGreen,
    fontSize: 16,
    fontWeight: "600",
  },
  camera: {
    width: "100%",
    height: "100%",
    position: "absolute",
    top: 0,
    left: 0,
    zIndex: -1,
  },
  topButtonContainer: {
    position: "absolute",
    top: 50,
    left: 20,
    zIndex: 10,
  },
  bottomButtonsContainer: {
    position: "absolute",
    bottom: "18%",
    width: "100%",
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    zIndex: 100,
    elevation: 100,
  },
  button: {
    backgroundColor: "rgba(255,255,255,0.7)",
    padding: 12,
    borderRadius: 5,
  },
  captureButton: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: "rgba(255,255,255,0.3)",
    justifyContent: "center",
    alignItems: "center",
  },
  disabledButton: {
    opacity: 0.5,
  },
  captureButtonInner: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: theme.colorWhite,
    borderWidth: 2,
    borderColor: theme.colorGrey,
  },
  text: {
    fontSize: 16,
    color: "#000",
  },
  headerContainer: {
    alignItems: "center",
    marginBottom: 40,
  },
  title: {
    fontSize: 28,
    fontWeight: "700",
    color: theme.colorDarkGreen || "#2E7D32",
    textAlign: "center",
    marginBottom: 12,
    lineHeight: 34,
  },
  subtitle: {
    fontSize: 16,
    color: theme.colorGrey || "#666",
    textAlign: "center",
    fontWeight: "400",
  },
  uploadContainer: {
    alignSelf: "center",
    borderRadius: 20,
    borderWidth: 2,
    borderColor: theme.colorBeige,
    borderStyle: "dashed",
    backgroundColor: theme.colorBeige,
    padding: 5,
    alignItems: "center",
    justifyContent: "center",
    marginVertical: 20,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  uploadImage: {
    borderRadius: 20,
  },
  bottomContainer: {
    alignItems: "center",
    paddingBottom: 40,
  },
  orText: {
    fontSize: 16,
    color: theme.colorGrey || "#666",
    fontWeight: "500",
    marginBottom: 16,
  },
  cameraText: {
    fontSize: 16,
    color: theme.colorDarkGreen || "#2E7D32",
    textAlign: "center",
    marginBottom: 24,
    fontWeight: "500",
  },
});
