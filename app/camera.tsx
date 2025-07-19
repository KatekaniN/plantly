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
import * as FileSystem from "expo-file-system";
import { MediaType } from "expo-media-library";

export default function NewScreen() {
  const { width } = useWindowDimensions();
  const imageSize = Math.min(width / 3, 300); // 1.1, 400
  const router = useRouter();

  const pickImageFromGallery = async () => {
    try {
      const permissionResult =
        await ImagePicker.requestMediaLibraryPermissionsAsync();

      if (permissionResult.granted === false) {
        Alert.alert(
          "Permission required",
          "Permission to access camera roll is required!"
        );
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: "Images" as any,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        const imageUri = result.assets[0].uri;
        console.log("Selected image URI:", imageUri);

        const persistentUri = await saveImageToPersistentLocation(imageUri);

        router.push({
          pathname: "/plantIdentification",
          params: { imageUri: persistentUri },
        });
      }
    } catch (error) {
      console.error("Error picking image:", error);
      Alert.alert("Error", "Failed to pick image from gallery");
    }
  };

  const saveImageToPersistentLocation = async (
    imageUri: string
  ): Promise<string> => {
    try {
      const fileName = imageUri.split("/").pop(); // Extract the file name
      const newPath = `${FileSystem.documentDirectory}${fileName}`; // Save to document directory

      await FileSystem.copyAsync({
        from: imageUri,
        to: newPath,
      });

      console.log("Image saved to:", newPath);
      return newPath;
    } catch (error) {
      console.error("Failed to save image to persistent location:", error);
      throw error;
    }
  };

  const takePhotoWithCamera = async () => {
    try {
      const permissionResult =
        await ImagePicker.requestCameraPermissionsAsync();

      if (permissionResult.granted === false) {
        Alert.alert(
          "Permission required",
          "Permission to access camera is required!"
        );
        return;
      }

      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        aspect: [4, 3],
        quality: 1,
      });

      if (!result.canceled && result.assets[0]) {
        const imageUri = result.assets[0].uri;
        console.log("Captured image URI:", imageUri);

        const persistentUri = await saveImageToPersistentLocation(imageUri);

        router.push({
          pathname: "/plantIdentification",
          params: { imageUri: persistentUri },
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

      <View style={styles.uploadSection}>
        <TouchableOpacity
          style={[
            styles.uploadContainer,
            { width: imageSize * 5, height: imageSize * 5 },
          ]}
          onPress={pickImageFromGallery}
        >
          <Image
            source={require("@/assets/images/upload-image.png")}
            style={[
              styles.uploadImage,
              { width: imageSize * 3.5, height: imageSize * 3 },
            ]}
            resizeMode="contain"
          />
        </TouchableOpacity>
      </View>

      {/* Bottom section */}
      <View style={styles.bottomContainer}>
        <Text style={styles.orText}>Or</Text>
        <Text style={styles.cameraText}>Take a picture with your camera</Text>
        <OnboardingButton
          title="Open Camera"
          onPress={takePhotoWithCamera}
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
    paddingHorizontal: 20,
    paddingTop: 60,
  },
  headerContainer: {
    alignItems: "center",
    marginBottom: 30,
  },
  title: {
    fontSize: 28,
    fontWeight: "700",
    color: theme.colorDarkGreen,
    textAlign: "center",
    marginBottom: 12,
    lineHeight: 34,
  },
  subtitle: {
    fontSize: 16,
    color: theme.colorGrey,
    textAlign: "center",
    fontWeight: "400",
  },
  uploadSection: {
    alignItems: "center",
    marginTop: 20,
    flex: 0.4,
  },
  uploadContainer: {
    borderRadius: 20,
    backgroundColor: theme.colorWhite,
    padding: 15,
    alignItems: "center",
    justifyContent: "center",
  },
  uploadImage: {
    bottom: "30%",
    borderRadius: 15,
  },
  bottomContainer: {
    alignItems: "center",
    paddingBottom: 40,
    flex: 0.6,
    justifyContent: "center",
  },
  orText: {
    fontSize: 16,
    color: theme.colorGrey,
    fontWeight: "500",
    marginBottom: 16,
  },
  cameraText: {
    fontSize: 16,
    color: theme.colorDarkGreen,
    textAlign: "center",
    marginBottom: 24,
    fontWeight: "500",
  },
});
