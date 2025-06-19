import { CameraView, CameraType, useCameraPermissions } from "expo-camera";
import { useState } from "react";
import { Button, Text, StyleSheet, TouchableOpacity, View } from "react-native";

export default function OpenCamera() {
  const [facing, setFacing] = useState<CameraType>("back");
  const [cameraPermission, requestCameraPermission] = useCameraPermissions();

  if (cameraPermission === null) {
    // Camera permission is still loading
    return <View style={{ flex: 1 }} />;
  }

  if (!cameraPermission.granted) {
    return (
      <View style={styles.container}>
        <Text style={styles.message}>
          We need your permission to show the camera
        </Text>
        <Button onPress={requestCameraPermission} title="grant permission" />
      </View>
    );
  }

  const toggleCameraFacing = () => {
    setFacing((current) => (current === "back" ? "front" : "back"));
  };

  return (
    <View style={styles.container}>
      <CameraView style={styles.camera} facing={facing}>
        <View style={styles.buttonContainer}>
          <TouchableOpacity style={styles.button} onPress={toggleCameraFacing}>
            <Text style={styles.text}>Flip Camera</Text>
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
    fontSize: 18,
    marginBottom: 16,
  },
  camera: {
    width: "100%",
    height: "100%",
  },
  buttonContainer: {
    position: "absolute",
    bottom: 20,
    left: 20,
  },
  button: {
    backgroundColor: "#fff",
    padding: 10,
    borderRadius: 5,
  },
  text: {
    fontSize: 16,
    color: "#000",
  },
});
