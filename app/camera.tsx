import { CameraView, CameraType, useCameraPermissions } from "expo-camera";
import { useState, useEffect } from "react";
import {
  Button,
  Text,
  StyleSheet,
  TouchableOpacity,
  View,
  Alert,
} from "react-native";
import { useRouter } from "expo-router";
import { theme } from "@/theme";

export default function CameraScreen() {
  const [facing, setFacing] = useState<CameraType>("back");
  const [cameraPermission, requestCameraPermission] = useCameraPermissions();
  const [permissionStatus, setPermissionStatus] = useState("loading");
  const router = useRouter();

  // Handle permission status changes
  useEffect(() => {
    if (cameraPermission === null) {
      setPermissionStatus("loading");
    } else if (cameraPermission.granted) {
      setPermissionStatus("granted");
    } else if (cameraPermission.canAskAgain) {
      setPermissionStatus("denied");
    } else {
      setPermissionStatus("blocked");
    }
  }, [cameraPermission]);

  // Function to handle permission request
  const handleRequestPermission = async () => {
    console.log("Requesting camera permission...");
    const permissionResult = await requestCameraPermission();

    if (permissionResult.granted) {
      console.log("Camera permission granted!");
      setPermissionStatus("granted");
    } else {
      console.log("Camera permission denied:", permissionResult);
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

  const toggleCameraFacing = () => {
    setFacing((current) => (current === "back" ? "front" : "back"));
  };

  // Show loading state
  if (permissionStatus === "loading") {
    return (
      <View style={[styles.container, { backgroundColor: "#fff" }]}>
        <Text style={styles.message}>Loading camera...</Text>
      </View>
    );
  }

  // Show permission request UI
  if (permissionStatus === "denied" || permissionStatus === "blocked") {
    return (
      <View style={[styles.container, { backgroundColor: "#fff" }]}>
        <Text style={styles.message}>
          We need your permission to use the camera
        </Text>
        <Text style={styles.submessage}>
          This allows you to take photos of your plants for identification
        </Text>
        <TouchableOpacity
          style={styles.permissionButton}
          onPress={handleRequestPermission}
        >
          <Text style={styles.permissionButtonText}>Grant Camera Access</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.permissionButton, styles.secondaryButton]}
          onPress={() => router.back()}
        >
          <Text style={styles.secondaryButtonText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // Show camera UI when permission is granted
  return (
    <View style={styles.container}>
      <CameraView style={styles.camera} facing={facing}>
        <View style={styles.topButtonContainer}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <Text style={styles.backButtonText}>← Back</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.bottomButtonsContainer}>
          <TouchableOpacity style={styles.button} onPress={toggleCameraFacing}>
            <Text style={styles.text}>Flip Camera</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.captureButton}
            onPress={() => {
              console.log("Capture photo");
              // Add photo capture logic here
            }}
          >
            <View style={styles.captureButtonInner} />
          </TouchableOpacity>
        </View>
      </CameraView>
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
  },
  topButtonContainer: {
    position: "absolute",
    top: 50,
    left: 20,
  },
  backButton: {
    backgroundColor: "rgba(0,0,0,0.5)",
    padding: 10,
    borderRadius: 5,
  },
  backButtonText: {
    color: "#fff",
    fontSize: 16,
  },
  bottomButtonsContainer: {
    position: "absolute",
    bottom: 40,
    width: "100%",
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
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
  captureButtonInner: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: theme.colorWhite,
    borderWidth: 2,
    borderColor: theme.colorGreen,
  },
  text: {
    fontSize: 16,
    color: "#000",
  },
});
