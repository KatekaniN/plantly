import { CameraView, CameraType, useCameraPermissions } from "expo-camera";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { useState, useEffect, useRef } from "react";
import {
  Button,
  Text,
  StyleSheet,
  TouchableOpacity,
  View,
  Alert,
  Image,
  Pressable,
  Platform,
} from "react-native";
import { useRouter } from "expo-router";
import { theme } from "@/theme";

export default function CameraScreen() {
  // State to manage which camera to use: front or back
  const [facing, setFacing] = useState<CameraType>("back");

  // Reference to the camera component with typing
  const cameraRef = useRef<any>(null);

  // State to store the captured photo
  const [photo, setPhoto] = useState<any>(null);

  // State to track if camera is ready
  const [isCameraReady, setCameraReady] = useState(false);

  // Hook to request and track camera permissions
  const [cameraPermission, requestCameraPermission] = useCameraPermissions();

  // State to track the current permission status ("loading", "granted", "denied", "blocked")
  const [permissionStatus, setPermissionStatus] = useState("loading");

  const router = useRouter(); // Router hook for navigation

  // Check and update permission status whenever `cameraPermission` changes
  useEffect(() => {
    if (cameraPermission === null) {
      setPermissionStatus("loading");
    } else if (cameraPermission.granted) {
      setPermissionStatus("granted");
    } else if (cameraPermission.canAskAgain) {
      setPermissionStatus("denied");
    } else {
      setPermissionStatus("blocked"); // User selected "Don't ask again"
    }
  }, [cameraPermission]);

  // Function to handle requesting camera permission from user
  const handleRequestPermission = async () => {
    const permissionResult = await requestCameraPermission();

    if (permissionResult.granted) {
      setPermissionStatus("granted");
    } else {
      // If permission is denied, inform the user and offer option to open settings
      Alert.alert(
        "Camera Permission Required",
        "This app needs camera access to take plant photos. Please enable camera permissions in your device settings.",
        [
          { text: "Cancel", style: "cancel" },
          {
            text: "Open Settings",
            onPress: () => console.log("Open settings"),
          },
        ]
      );
    }
  };

  const onCameraReady = () => {
    console.log("Camera is ready");
    setCameraReady(true);
  };

  const takePicture = async () => {
   
    if (!cameraRef.current) {
      Alert.alert("Error", "Camera not available");
      return;
    }

    if (!isCameraReady) {
      Alert.alert("Please wait", "Camera is initializing...");
      return;
    }

    try {
      const photo = await cameraRef.current.takePictureAsync({
        quality: 0.7, 
        base64: false,
        exif: false,
      });

      if (photo && photo.uri) {
        setPhoto(photo);
        Alert.alert("Success", "Photo captured successfully!");

        router.push({
          pathname: "/plantIdentification",
          params: { photoUri: photo.uri },
        });
      } else {
        throw new Error("No photo URI received");
      }
    } catch (error) {
      console.error("Error taking picture:", error);
      const errorMessage =
        error && typeof error === "object" && "message" in error
          ? (error as { message: string }).message
          : String(error);
      Alert.alert("Error", `Failed to take picture: ${errorMessage}`);
    }
  };

  // If permission status is loading, show loading screen
  if (permissionStatus === "loading") {
    return (
      <View style={[styles.container, { backgroundColor: theme.colorGreen }]}>
        <Text style={styles.message}>Loading camera...</Text>
      </View>
    );
  }

  // If permission is denied or blocked, show permission request screen
  if (permissionStatus === "denied" || permissionStatus === "blocked") {
    return (
      <View style={[styles.container, { backgroundColor: "#fff" }]}>
        <Text style={styles.message}>
          We need your permission to use the camera
        </Text>
        <Text style={styles.submessage}>
          This allows you to take photos of your plants for identification
        </Text>

        {/* Button to request camera permission */}
        <TouchableOpacity
          style={styles.permissionButton}
          onPress={handleRequestPermission}
        >
          <Text style={styles.permissionButtonText}>Grant Camera Access</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // If permission is granted, show the camera interface
  return (
    <View style={styles.container} pointerEvents="auto">
      {/* Camera view using the selected facing direction */}
      <CameraView
        style={styles.camera}
        facing={facing}
        ref={cameraRef}
        onCameraReady={onCameraReady}
      />


      {/* Bottom container with flip and capture buttons */}
      <View style={styles.bottomButtonsContainer}>
        {/* Capture photo */}
        <Pressable
          onPress={() => {
            takePicture(); 
          }}
          android_disableSound={true} 
          style={({ pressed }) => [
            styles.captureButton,
            pressed && { opacity: 0.5 },
            !isCameraReady && styles.disabledButton,
          ]}
          disabled={!isCameraReady}
        >
          <View style={styles.captureButtonInner} />
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
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
});
