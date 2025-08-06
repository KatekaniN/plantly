import {
  View,
  Text,
  StyleSheet,
  Image,
  useWindowDimensions,
  TouchableOpacity,
  Alert,
  StatusBar,
} from "react-native";
import * as MediaLibrary from "expo-media-library";
import FontAwesome6 from "@expo/vector-icons/FontAwesome6";
import { theme } from "@/theme";
import { useTheme } from "@/contexts/ThemeContext";
import { OnboardingButton } from "@/components/OnboardingButton";
import { useRouter } from "expo-router";
import * as ImagePicker from "expo-image-picker";
import * as FileSystem from "expo-file-system";
import { MediaType } from "expo-media-library";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function NewScreen() {
  const { width } = useWindowDimensions();
  const imageSize = Math.min(width / 3, 300); // 1.1, 400
  const router = useRouter();
  const { theme: currentTheme, isDark } = useTheme();
  const insets = useSafeAreaInsets();

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
        aspect: [1, 1],
        quality: 0.9,
        allowsMultipleSelection: false,
      });

      if (!result.canceled && result.assets[0]) {
        const originalUri = result.assets[0].uri;

        const processedUri = await processImageForIdentification(originalUri);
        const persistentUri = await saveImageToPersistentLocation(processedUri);

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
        aspect: [1, 1], // Square aspect ratio
        quality: 0.9, // Higher quality
      });

      if (!result.canceled && result.assets[0]) {
        const originalUri = result.assets[0].uri;
        console.log("📸 Captured image URI:", originalUri);

        // Process and validate image
        const processedUri = await processImageForIdentification(originalUri);
        const persistentUri = await saveImageToPersistentLocation(processedUri);

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

  const processImageForIdentification = async (
    imageUri: string
  ): Promise<string> => {
    try {
      console.log("🔄 Processing image for identification...");

      // For now, just validate the image
      // You could add image compression/resizing here if needed
      const fileInfo = await FileSystem.getInfoAsync(imageUri);

      if (!fileInfo.exists) {
        throw new Error("Image file does not exist");
      }

      if (fileInfo.size && fileInfo.size > 5 * 1024 * 1024) {
        // 5MB
        console.log("⚠️ Large image detected, may need compression");
      }

      console.log("✅ Image processed successfully");
      return imageUri;
    } catch (error) {
      console.error("❌ Image processing failed:", error);
      throw error;
    }
  };

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: currentTheme.colorBackground,
          paddingTop: insets.top,
        },
      ]}
    >
      <StatusBar
        barStyle={isDark ? "light-content" : "dark-content"}
        backgroundColor={currentTheme.colorBackground}
      />

      {/* Header section */}
      <View
        style={[
          styles.headerContainer,
          { backgroundColor: currentTheme.colorBackground },
        ]}
      >
        <Text style={[styles.title, { color: currentTheme.colorText }]}>
          Add your new green friend
          <FontAwesome6
            name="seedling"
            size={24}
            color={currentTheme.colorLeafyGreen}
            style={{ marginLeft: 8 }}
          />
        </Text>
        <Text
          style={[styles.subtitle, { color: currentTheme.colorTextSecondary }]}
        >
          Upload a picture from your gallery
        </Text>
      </View>

      <View
        style={[
          styles.uploadSection,
          { backgroundColor: currentTheme.colorBackground },
        ]}
      >
        <TouchableOpacity
          style={[
            styles.uploadContainer,
            {
              backgroundColor: isDark ? "#2a2a2a" : "#f8f9fa",
              borderColor: isDark ? "#404040" : "#e0e0e0",
              borderWidth: 2,
              borderStyle: "dashed",
            },
          ]}
          onPress={pickImageFromGallery}
        >
          <View style={styles.uploadContent}>
            <View style={styles.uploadIcons}>
              <Image 
                source={require("@/assets/images/upload-image.png")}
                style={{ width: imageSize * 3.1, height: imageSize * 1.65, marginLeft:"22.5%" }}
              />
             
            </View>
            
          </View>
        </TouchableOpacity>
      </View>

      {/* Bottom section */}
      <View
        style={[
          styles.bottomContainer,
          { backgroundColor: currentTheme.colorBackground },
        ]}
      >
        <Text
          style={[styles.orText, { color: currentTheme.colorTextSecondary }]}
        >
          Or
        </Text>
        <Text style={[styles.cameraText, { color: currentTheme.colorText }]}>
          Take a picture with your camera
        </Text>
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
    textAlign: "center",
    marginBottom: 12,
    lineHeight: 34,
  },
  subtitle: {
    fontSize: 16,
    textAlign: "center",
    fontWeight: "400",
  },
  uploadSection: {
    alignItems: "center",
    marginTop: 40,
    marginBottom: 40,
    flex: 1,
    justifyContent: "center",
  },
  uploadContainer: {
    borderRadius: 20,
    paddingVertical: 0,
    paddingHorizontal: 0,
    alignItems: "center",
    justifyContent: "center",
    maxWidth: "95%",
  },
  uploadContent: {
    alignItems: "center",
    justifyContent: "center",
  },
  uploadIcons: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 0,
    gap: 24,
  },
  uploadText: {
    fontSize: 20,
    fontWeight: "600",
    textAlign: "center",
  },
  bottomContainer: {
    alignItems: "center",
    paddingBottom: 40,
    paddingTop: 20,
  },
  orText: {
    fontSize: 16,
    fontWeight: "500",
    marginBottom: 16,
  },
  cameraText: {
    fontSize: 16,
    textAlign: "center",
    marginBottom: 24,
    fontWeight: "500",
  },
});
