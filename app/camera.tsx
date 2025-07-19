import {
  View,
  Text,
  StyleSheet,
  Image,
  useWindowDimensions,
  TouchableOpacity,
  Alert,
} from "react-native";
import * as MediaLibrary from "expo-media-library";
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

  const validateAndProcessImage = async (imageUri: string): Promise<string> => {
    try {
      console.log("🔍 Validating image URI:", imageUri);

      // Check if file exists
      const fileInfo = await FileSystem.getInfoAsync(imageUri);
      console.log("📁 File info:", fileInfo);

      if (!fileInfo.exists) {
        throw new Error("Image file does not exist");
      }

      // Check file size (PlantNet has size limits)
      if (fileInfo.size && fileInfo.size > 10 * 1024 * 1024) {
        // 10MB limit
        throw new Error("Image file too large. Please select a smaller image.");
      }

      return imageUri;
    } catch (error) {
      console.error("❌ Image validation failed:", error);
      throw error;
    }
  };

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
        allowsMultipleSelection: false,
      });

      if (!result.canceled && result.assets[0]) {
        const originalUri = result.assets[0].uri;
        console.log("📷 Selected image URI:", originalUri);
        console.log(
          "📊 Image dimensions:",
          result.assets[0].width,
          "x",
          result.assets[0].height
        );

        await validateAndProcessImage(originalUri);

        const persistentUri = await saveImageToPersistentLocation(originalUri);

        await validateAndProcessImage(persistentUri);

        console.log("✅ Final image URI for identification:", persistentUri);

        router.push({
          pathname: "/plantIdentification",
          params: { imageUri: persistentUri },
        });
      }
    } catch (error) {
      console.error("❌ Error picking image:", error);
      Alert.alert(
        "Error",
        `Failed to pick image: ${error instanceof Error ? error.message : "Unknown error"}`
      );
    }
  };
  const saveImageToPersistentLocation = async (
    imageUri: string
  ): Promise<string> => {
    try {
      console.log("💾 Saving image from URI:", imageUri);

      const timestamp = Date.now();
      const fileExtension = imageUri.split(".").pop() || "jpg";
      const fileName = `plant_image_${timestamp}.${fileExtension}`;
      const newPath = `${FileSystem.documentDirectory}${fileName}`;

      console.log("📂 Target path:", newPath);

      await FileSystem.copyAsync({
        from: imageUri,
        to: newPath,
      });

      const copiedFileInfo = await FileSystem.getInfoAsync(newPath);
      console.log("✅ Copied file info:", copiedFileInfo);

      if (!copiedFileInfo.exists) {
        throw new Error("Failed to copy image to persistent location");
      }

      return newPath;
    } catch (error) {
      console.error("❌ Failed to save image to persistent location:", error);
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
        quality: 0.8, // Match gallery quality
      });

      if (!result.canceled && result.assets[0]) {
        const originalUri = result.assets[0].uri;
        console.log("📸 Captured image URI:", originalUri);

        // Validate the captured image
        await validateAndProcessImage(originalUri);

        // Save to persistent location
        const persistentUri = await saveImageToPersistentLocation(originalUri);

        // Double-check the persistent file
        await validateAndProcessImage(persistentUri);

        console.log("✅ Final camera image URI:", persistentUri);

        router.push({
          pathname: "/plantIdentification",
          params: { imageUri: persistentUri },
        });
      }
    } catch (error) {
      console.error("❌ Error taking photo:", error);
      Alert.alert(
        "Error",
        `Failed to take photo: ${error instanceof Error ? error.message : "Unknown error"}`
      );
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
