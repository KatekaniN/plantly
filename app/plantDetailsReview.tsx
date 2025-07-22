import React, { useState } from "react";
import {
  View,
  ScrollView,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  Dimensions,
  TextInput,
  Alert,
  Image,
} from "react-native";
import FontAwesome6 from "@expo/vector-icons/FontAwesome6";
import { usePlantIdentificationStore } from "../store/plantIdentification";
import { useRouter } from "expo-router";

const { width: screenWidth } = Dimensions.get("window");

interface EditableCareDetailProps {
  careDetails: any;
  onUpdate: (field: string, value: string | string[]) => void;
}
const EditableCareDetails: React.FC<EditableCareDetailProps> = ({
  careDetails,
  onUpdate,
}) => {
  return (
    <View style={styles.careDetailsContainer}>
      <Text style={styles.sectionTitle}>Plant Care Details</Text>
      <View style={styles.careItem} />
      <Text style={styles.careLabel}>💧 Watering Frequency</Text>
      <TextInput
        style={styles.careInput}
        value={careDetails.wateringFrequency}
        onChangeText={(text) => onUpdate("wateringFrequency", text)}
        placeholder="e.g., Every 7 - 10 days"
      />
      <View />

      <View style={styles.careItem}>
        <Text style={styles.careLabel}>🚿 Watering Amount</Text>
        <TextInput
          style={styles.careInput}
          value={careDetails.wateringAmount}
          onChangeText={(text) => onUpdate("wateringAmount", text)}
          placeholder="e.g., Water thoroughly until drainage"
        />
      </View>

      <View style={styles.careItem}>
        <Text style={styles.careLabel}>☀️ Sunlight Requirement</Text>
        <TextInput
          style={styles.careInput}
          value={careDetails.sunlightRequirement}
          onChangeText={(text) => onUpdate("sunlightRequirement", text)}
          placeholder="e.g., Bright, indirect light"
        />
      </View>

      <View style={styles.careItem}>
        <Text style={styles.careLabel}>🌡️ Temperature</Text>
        <TextInput
          style={styles.careInput}
          value={careDetails.temperature}
          onChangeText={(text) => onUpdate("temperature", text)}
          placeholder="e.g., 18-24°C"
        />
      </View>

      <View style={styles.careItem}>
        <Text style={styles.careLabel}>💨 Humidity</Text>
        <TextInput
          style={styles.careInput}
          value={careDetails.humidity}
          onChangeText={(text) => onUpdate("humidity", text)}
          placeholder="e.g., 40-60%"
        />
      </View>

      <View style={styles.careItem}>
        <Text style={styles.careLabel}>🌱 Soil Type</Text>
        <TextInput
          style={styles.careInput}
          value={careDetails.soilType}
          onChangeText={(text) => onUpdate("soilType", text)}
          placeholder="e.g., Well-draining potting mix"
        />
      </View>

      <View style={styles.careItem}>
        <Text style={styles.careLabel}>🌿 Fertilizing</Text>
        <TextInput
          style={styles.careInput}
          value={careDetails.fertilizing}
          onChangeText={(text) => onUpdate("fertilizing", text)}
          placeholder="e.g., Monthly during growing season"
        />
      </View>

      <View style={styles.careItem}>
        <Text style={styles.careLabel}>📈 Growth Characteristics</Text>
        <TextInput
          style={[styles.careInput, styles.multilineInput]}
          value={careDetails.growthCharacteristics}
          onChangeText={(text) => onUpdate("growthCharacteristics", text)}
          placeholder="e.g., Moderate growth rate"
          multiline
        />
      </View>

      <View style={styles.careItem}>
        <Text style={styles.careLabel}>✂️ Pruning</Text>
        <TextInput
          style={[styles.careInput, styles.multilineInput]}
          value={careDetails.pruning}
          onChangeText={(text) => onUpdate("pruning", text)}
          placeholder="e.g., Remove dead or yellowing leaves"
          multiline
        />
      </View>

      <View style={styles.careItem}>
        <Text style={styles.careLabel}>🏠 Placement Tips</Text>
        <TextInput
          style={[styles.careInput, styles.multilineInput]}
          value={careDetails.placement?.join(", ") || ""}
          onChangeText={(text) =>
            onUpdate(
              "placement",
              text.split(", ").filter((item) => item.trim())
            )
          }
          placeholder="e.g., Near a window, Avoid direct sunlight"
          multiline
        />
      </View>

      <View style={styles.careItem}>
        <Text style={styles.careLabel}>⚠️ Common Issues</Text>
        <TextInput
          style={[styles.careInput, styles.multilineInput]}
          value={careDetails.commonIssues?.join(", ") || ""}
          onChangeText={(text) =>
            onUpdate(
              "commonIssues",
              text.split(", ").filter((item) => item.trim())
            )
          }
          placeholder="e.g., Overwatering, Insufficient light"
          multiline
        />
      </View>
    </View>
  );
};

const PlantDetailsReview: React.FC = () => {
  const router = useRouter();
  const {
    selectedPlant,
    careDetails,
    currentImageUri,
    setCareDetails,
    addPlantToCollection,
    clearCurrentIdentification,
  } = usePlantIdentificationStore();

  const [customName, setCustomName] = useState(
    selectedPlant?.species?.commonNames?.[0] ||
      selectedPlant?.species?.scientificNameWithoutAuthor ||
      ""
  );

  const [notes, setNotes] = useState("");
  const [location, setLocation] = useState("");
  const [editableCareDetails, setEditableCareDetails] = useState(careDetails);

  React.useEffect(() => {
    if (!selectedPlant || !careDetails || !currentImageUri) {
      console.warn("Missing required data for plant details review");
      router.push("new");
    }
  }, [selectedPlant, careDetails, currentImageUri, router]);

  if (!selectedPlant || !careDetails || !currentImageUri) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Missing plant data</Text>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.push("/new")}
          >
            <Text style={styles.backButtonText}>Go Back</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const handleCareDetailUpdate = (field: string, value: string | string[]) => {
    if (!editableCareDetails) return;

    const updatedDetails = {
      ...editableCareDetails,
      [field]: value,
    };
    setEditableCareDetails(updatedDetails);
    setCareDetails(updatedDetails);
  };

  const handleSavePlant = async () => {
    try {
      if (!editableCareDetails) {
        Alert.alert("Error", "Care details are missing. Please try again.");
        return;
      }

      const plantProfile = {
        name:
          customName.trim() ||
          selectedPlant.species.scientificNameWithoutAuthor,
        imageUri: currentImageUri,
        identification: selectedPlant,
        careDetails: editableCareDetails,
        location: location.trim(),
        notes: notes.trim(),
      };

      addPlantToCollection(plantProfile);

      Alert.alert(
        "Success! 🌱",
        "Your plant has been added to your collection!",
        [
          {
            text: "View My Plants",
            onPress: () => {
              clearCurrentIdentification();
              router.push("/(tabs)");
            },
          },
          {
            text: "Add Another",
            onPress: () => {
              clearCurrentIdentification();
              router.push("/new");
            },
          },
        ]
      );
    } catch (error) {
      console.error("Error saving plant:", error);
      Alert.alert("Error", "Failed to save plant. Please try again.");
    }
  };

  const formatConfidenceScore = (score: number): string => {
    return `${Math.round(score * 100)}%`;
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        style={styles.scrollContainer}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <FontAwesome6 name="arrow-left" size={20} color="#4CAF50" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Review Plant Details</Text>
          <View style={{ width: 40 }} />
        </View>

        {/* Plant Image */}
        <View style={styles.imageContainer}>
          <Image source={{ uri: currentImageUri }} style={styles.plantImage} />
        </View>

        {/* Plant Identification Info */}
        <View style={styles.identificationContainer}>
          <View style={styles.identificationHeader}>
            <Text style={styles.scientificName}>
              {selectedPlant.species.scientificNameWithoutAuthor}
            </Text>
            <View style={styles.confidenceBadge}>
              <Text style={styles.confidenceText}>
                {formatConfidenceScore(selectedPlant.score)} match
              </Text>
            </View>
          </View>

          {selectedPlant.species.commonNames &&
            selectedPlant.species.commonNames.length > 0 && (
              <Text style={styles.commonName}>
                {selectedPlant.species.commonNames[0]}
              </Text>
            )}

          <View style={styles.taxonomyContainer}>
            <Text style={styles.taxonomyText}>
              Family: {selectedPlant.species.family.scientificNameWithoutAuthor}
            </Text>
            <Text style={styles.taxonomyText}>
              Genus: {selectedPlant.species.genus.scientificNameWithoutAuthor}
            </Text>
          </View>
        </View>

        {/* Custom Plant Details */}
        <View style={styles.customDetailsContainer}>
          <Text style={styles.sectionTitle}>Your Plant Details</Text>

          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Plant Name</Text>
            <TextInput
              style={styles.textInput}
              value={customName}
              onChangeText={setCustomName}
              placeholder="Give your plant a name"
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Location (Optional)</Text>
            <TextInput
              style={styles.textInput}
              value={location}
              onChangeText={setLocation}
              placeholder="e.g., Living room, Bedroom window"
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Notes (Optional)</Text>
            <TextInput
              style={[styles.textInput, styles.notesInput]}
              value={notes}
              onChangeText={setNotes}
              placeholder="Any special notes about your plant..."
              multiline
              numberOfLines={3}
            />
          </View>
        </View>

        {/* Editable Care Details */}
        {editableCareDetails && (
          <EditableCareDetails
            careDetails={editableCareDetails}
            onUpdate={handleCareDetailUpdate}
          />
        )}
      </ScrollView>

      {/* Fixed Bottom Button */}
      <View style={styles.bottomButtonContainer}>
        <TouchableOpacity
          style={styles.saveButton}
          onPress={handleSavePlant}
          activeOpacity={0.8}
        >
          <FontAwesome6
            name="plus"
            size={20}
            color="white"
            style={{ marginRight: 8 }}
          />
          <Text style={styles.saveButtonText}>Add to My Plants</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#ffffff",
  },
  scrollContainer: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 100,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  backButton: {
    padding: 8,
    borderRadius: 8,
    backgroundColor: "#f8f9fa",
  },
  backButtonText: {
    color: "#4CAF50",
    fontSize: 16,
    fontWeight: "600",
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#333333",
  },
  imageContainer: {
    alignItems: "center",
    paddingVertical: 20,
    backgroundColor: "#f8f9fa",
  },
  plantImage: {
    width: screenWidth * 0.8,
    height: screenWidth * 0.6,
    borderRadius: 12,
    resizeMode: "cover",
  },
  identificationContainer: {
    padding: 16,
    backgroundColor: "#ffffff",
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  identificationHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 8,
  },
  scientificName: {
    fontSize: 20,
    fontWeight: "700",
    color: "#333333",
    fontStyle: "italic",
    flex: 1,
    marginRight: 12,
  },
  confidenceBadge: {
    backgroundColor: "#e8f5e8",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  confidenceText: {
    fontSize: 12,
    color: "#4CAF50",
    fontWeight: "600",
  },
  commonName: {
    fontSize: 16,
    color: "#4CAF50",
    fontWeight: "600",
    marginBottom: 12,
  },
  taxonomyContainer: {
    backgroundColor: "#f8f9fa",
    padding: 12,
    borderRadius: 8,
  },
  taxonomyText: {
    fontSize: 14,
    color: "#666666",
    marginBottom: 4,
  },
  customDetailsContainer: {
    padding: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#333333",
    marginBottom: 16,
  },
  inputContainer: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: "#333333",
    marginBottom: 8,
  },
  textInput: {
    borderWidth: 1,
    borderColor: "#e0e0e0",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 16,
    backgroundColor: "#ffffff",
  },
  notesInput: {
    height: 80,
    textAlignVertical: "top",
  },
  careDetailsContainer: {
    padding: 16,
    backgroundColor: "#f8f9fa",
  },
  careItem: {
    marginBottom: 16,
  },
  careLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: "#333333",
    marginBottom: 8,
  },
  careInput: {
    borderWidth: 1,
    borderColor: "#e0e0e0",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    backgroundColor: "#ffffff",
  },
  multilineInput: {
    height: 60,
    textAlignVertical: "top",
  },
  bottomButtonContainer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "#ffffff",
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: "#f0f0f0",
  },
  saveButton: {
    backgroundColor: "#4CAF50",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 16,
    borderRadius: 12,
    shadowColor: "#4CAF50",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 4.65,
    elevation: 8,
  },
  saveButtonText: {
    color: "#ffffff",
    fontSize: 18,
    fontWeight: "700",
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  errorText: {
    fontSize: 18,
    color: "#d32f2f",
    marginBottom: 20,
    textAlign: "center",
  },
});

export default PlantDetailsReview;
