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
  ActivityIndicator,
  Platform,
  StatusBar,
} from "react-native";
import { theme } from "@/theme";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Slider from "@react-native-community/slider"; // You'll need to install this
import FontAwesome6 from "@expo/vector-icons/FontAwesome6";
import { LinearGradient } from "expo-linear-gradient";
import { usePlantIdentificationStore } from "../store/plantIdentification";
import { useRouter } from "expo-router";

const { width: screenWidth } = Dimensions.get("window");

// Watering frequency options
const WATERING_OPTIONS = [
  { value: 1, label: "Daily", days: 1 },
  { value: 2, label: "Every 2 days", days: 2 },
  { value: 3, label: "Every 3 days", days: 3 },
  { value: 5, label: "Every 5 days", days: 5 },
  { value: 7, label: "Weekly", days: 7 },
  { value: 10, label: "Every 10 days", days: 10 },
  { value: 14, label: "Every 2 weeks", days: 14 },
  { value: 21, label: "Every 3 weeks", days: 21 },
  { value: 30, label: "Monthly", days: 30 },
];

interface EditableCareDetailProps {
  careDetails: any;
  onUpdate: (field: string, value: string | string[]) => void;
}

const EditableCareDetails: React.FC<EditableCareDetailProps> = ({
  careDetails,
  onUpdate,
}) => {
  const getCurrentWateringValue = () => {
    if (!careDetails.wateringFrequency) return 7; // default to weekly

    const current = careDetails.wateringFrequency.toLowerCase();
    console.log("Parsing watering frequency:", current);

    if (
      current.includes("daily") ||
      current.includes("every day") ||
      current.includes("1 day")
    )
      return 1;

    // Check for specific day patterns
    if (current.includes("every 2 days") || current.includes("2 days"))
      return 2;
    if (current.includes("every 3 days") || current.includes("3 days"))
      return 3;
    if (current.includes("every 5 days") || current.includes("5 days"))
      return 5;
    if (current.includes("every 10 days") || current.includes("10 days"))
      return 10;

    // Check for weekly patterns
    if (
      current.includes("weekly") ||
      current.includes("every week") ||
      current.includes("7 days") ||
      current.includes("once a week")
    )
      return 7;
    if (
      current.includes("every 2 weeks") ||
      current.includes("biweekly") ||
      current.includes("14 days")
    )
      return 14;
    if (current.includes("every 3 weeks") || current.includes("21 days"))
      return 21;

    // Check for monthly
    if (
      current.includes("monthly") ||
      current.includes("every month") ||
      current.includes("30 days") ||
      current.includes("once a month")
    )
      return 30;

    // Try to extract numbers from text like "water every X days"
    const numberMatch = current.match(/(\d+)\s*days?/);
    if (numberMatch) {
      const days = parseInt(numberMatch[1]);
      // Find the closest option in our WATERING_OPTIONS
      const validValues = WATERING_OPTIONS.map((opt) => opt.value);
      const closest = validValues.reduce((prev, curr) =>
        Math.abs(curr - days) < Math.abs(prev - days) ? curr : prev
      );
      return closest;
    }

    // Check for frequency words
    if (current.includes("frequent") || current.includes("often")) return 3;
    if (current.includes("moderate") || current.includes("regular")) return 7;
    if (current.includes("infrequent") || current.includes("rarely")) return 14;
    if (current.includes("drought") || current.includes("low water")) return 21;

    return 7;
  };

  const [wateringValue, setWateringValue] = useState(getCurrentWateringValue());

  // Update slider when care details change
  React.useEffect(() => {
    const newValue = getCurrentWateringValue();
    console.log("Care details changed, updating slider to:", newValue);
    setWateringValue(newValue);
  }, [careDetails.wateringFrequency]);

  const handleWateringChange = (value: number) => {
    setWateringValue(value);
    const option =
      WATERING_OPTIONS.find((opt) => opt.value === value) ||
      WATERING_OPTIONS[4];
    onUpdate("wateringFrequency", option.label);
  };

  return (
    <View style={styles.careDetailsContainer}>
      {/* Watering Section */}
      <View style={styles.careSection}>
        <View style={styles.careSectionTitleContainer}>
          <FontAwesome6
            name="droplet"
            size={18}
            color={theme.colorLeafyGreen}
          />
          <Text style={styles.careSectionTitle}>Watering</Text>
        </View>

        <View style={styles.careItem}>
          <Text style={styles.careLabel}>Frequency</Text>
          <View style={styles.sliderContainer}>
            <Text style={styles.sliderLabel}>Less Often</Text>
            <Slider
              style={styles.slider}
              minimumValue={1}
              maximumValue={30}
              value={wateringValue}
              onValueChange={handleWateringChange}
              step={1}
              minimumTrackTintColor={theme.colorLeafyGreen}
              maximumTrackTintColor="#E0E0E0"
            />
            <Text style={styles.sliderLabel}>More Often</Text>
          </View>
          <Text style={styles.sliderValue}>
            {WATERING_OPTIONS.find((opt) => opt.value === wateringValue)
              ?.label || `Every ${wateringValue} days`}
          </Text>
        </View>

        <View style={styles.careItem}>
          <Text style={styles.careLabel}>Amount</Text>
          <TextInput
            style={styles.careInput}
            value={careDetails.wateringAmount}
            onChangeText={(text) => onUpdate("wateringAmount", text)}
            placeholder="e.g., Water thoroughly until drainage"
          />
        </View>
      </View>

      {/* Light & Environment Section */}
      <View style={styles.careSection}>
        <View style={styles.careSectionTitleContainer}>
          <FontAwesome6 name="sun" size={18} color={theme.colorLeafyGreen} />
          <Text style={styles.careSectionTitle}>Light & Environment</Text>
        </View>

        <View style={styles.careItem}>
          <Text style={styles.careLabel}>Sunlight Requirement</Text>
          <TextInput
            style={styles.careInput}
            value={careDetails.sunlightRequirement}
            onChangeText={(text) => onUpdate("sunlightRequirement", text)}
            placeholder="e.g., Bright, indirect light"
          />
        </View>

        <View style={styles.careItem}>
          <Text style={styles.careLabel}>Temperature Range</Text>
          <TextInput
            style={styles.careInput}
            value={careDetails.temperature}
            onChangeText={(text) => onUpdate("temperature", text)}
            placeholder="e.g., 18-24°C"
          />
        </View>

        <View style={styles.careItem}>
          <Text style={styles.careLabel}>Humidity</Text>
          <TextInput
            style={styles.careInput}
            value={careDetails.humidity}
            onChangeText={(text) => onUpdate("humidity", text)}
            placeholder="e.g., 40-60%"
          />
        </View>
      </View>

      {/* Soil & Fertilizing Section */}
      <View style={styles.careSection}>
        <View style={styles.careSectionTitleContainer}>
          <FontAwesome6
            name="seedling"
            size={18}
            color={theme.colorLeafyGreen}
          />
          <Text style={styles.careSectionTitle}>Soil & Fertilizing</Text>
        </View>

        <View style={styles.careItem}>
          <Text style={styles.careLabel}>Soil Type</Text>
          <TextInput
            style={styles.careInput}
            value={careDetails.soilType}
            onChangeText={(text) => onUpdate("soilType", text)}
            placeholder="e.g., Well-draining potting mix"
          />
        </View>

        <View style={styles.careItem}>
          <Text style={styles.careLabel}>Fertilizing</Text>
          <TextInput
            style={styles.careInput}
            value={careDetails.fertilizing}
            onChangeText={(text) => onUpdate("fertilizing", text)}
            placeholder="e.g., Monthly during growing season"
          />
        </View>
      </View>

      {/* Growth & Maintenance Section */}
      <View style={styles.careSection}>
        <View style={styles.careSectionTitleContainer}>
          <FontAwesome6
            name="chart-line"
            size={18}
            color={theme.colorLeafyGreen}
          />
          <Text style={styles.careSectionTitle}>Growth & Maintenance</Text>
        </View>

        <View style={styles.careItem}>
          <Text style={styles.careLabel}>Growth Characteristics</Text>
          <TextInput
            style={[styles.careInput, styles.multilineInput]}
            value={careDetails.growthCharacteristics}
            onChangeText={(text) => onUpdate("growthCharacteristics", text)}
            placeholder="e.g., Moderate growth rate"
            multiline
          />
        </View>

        <View style={styles.careItem}>
          <Text style={styles.careLabel}>Pruning</Text>
          <TextInput
            style={[styles.careInput, styles.multilineInput]}
            value={careDetails.pruning}
            onChangeText={(text) => onUpdate("pruning", text)}
            placeholder="e.g., Remove dead or yellowing leaves"
            multiline
          />
        </View>
      </View>

      {/* Placement & Issues Section */}
      <View style={styles.careSection}>
        <View style={styles.careSectionTitleContainer}>
          <FontAwesome6
            name="house-chimney"
            size={18}
            color={theme.colorLeafyGreen}
          />
          <Text style={styles.careSectionTitle}>Placement & Common Issues</Text>
        </View>

        <View style={styles.careItem}>
          <Text style={styles.careLabel}>Placement Tips</Text>
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
          <Text style={styles.careLabel}>Common Issues</Text>
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
    </View>
  );
};

const PlantDetailsReview: React.FC = () => {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const {
    selectedPlant,
    careDetails,
    currentImageUri,
    isFetchingCareDetails,
    careDataSource,
    setCareDetails,
    generateCareDetails,
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

  // Fetch care details when component mounts
  React.useEffect(() => {
    if (selectedPlant && !careDetails && !isFetchingCareDetails) {
      console.log(
        "🌱 Fetching care details for:",
        selectedPlant.species.scientificNameWithoutAuthor
      );
      generateCareDetails(selectedPlant);
    }
  }, [selectedPlant, careDetails, isFetchingCareDetails, generateCareDetails]);

  // Update editable details when care details change
  React.useEffect(() => {
    if (careDetails) {
      setEditableCareDetails(careDetails);
    }
  }, [careDetails]);

  React.useEffect(() => {
    if (!selectedPlant || !currentImageUri) {
      router.push("/(tabs)/");
    }
  }, [selectedPlant, currentImageUri, router]);

  // Show loading or error state
  if (!selectedPlant || !currentImageUri) {
    router.push("/(tabs)/");
    return null;
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
              router.push("/camera");
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
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />

      <ScrollView
        style={styles.scrollContainer}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: insets.bottom + 100 },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {/* Plant Image */}
        <View style={styles.imageContainer}>
          <Image source={{ uri: currentImageUri }} style={styles.plantImage} />
        </View>

        {/* Care Data Source Indicator */}
        {careDataSource && (
          <View style={styles.careSourceIndicator}>
            <Text style={styles.careSourceText}>
              {careDataSource === "default" && (
                <>
                  <FontAwesome6
                    name="seedling"
                    size={14}
                    color={theme.colorLeafyGreen}
                  />{" "}
                  Plant family-based care recommendations
                </>
              )}
            </Text>
          </View>
        )}

        {/* Loading State for Care Details */}
        {isFetchingCareDetails && (
          <View style={styles.loadingCareContainer}>
            <ActivityIndicator size="small" color={theme.colorLeafyGreen} />
            <Text style={styles.loadingCareText}>
              Generating personalized care recommendations...
            </Text>
          </View>
        )}

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

        {/* Care Instructions Section */}
        {editableCareDetails && !isFetchingCareDetails && (
          <View style={styles.careDetailsSection}>
            <View style={styles.careDetailsHeader}>
              <Text style={styles.sectionTitle}>Care Instructions</Text>
              <Text style={styles.careDetailsSubtitle}>
                Customize these recommendations for your environment
              </Text>
            </View>

            <EditableCareDetails
              careDetails={editableCareDetails}
              onUpdate={handleCareDetailUpdate}
            />

            {/* Plant Care Tips */}
            <View style={styles.tipsContainer}>
              <View style={styles.tipsHeader}>
                <FontAwesome6
                  name="lightbulb"
                  size={18}
                  color={theme.colorLeafyGreen}
                />
                <Text style={styles.tipsTitle}>Pro Tips</Text>
              </View>

              <View style={styles.tipItem}>
                <FontAwesome6 name="droplet" size={14} color="#3498db" />
                <Text style={styles.tipText}>
                  Check soil moisture by inserting your finger 1-2 inches deep
                  before watering
                </Text>
              </View>

              <View style={styles.tipItem}>
                <FontAwesome6 name="sun" size={14} color="#f39c12" />
                <Text style={styles.tipText}>
                  Rotate your plant weekly to ensure even growth toward the
                  light
                </Text>
              </View>

              <View style={styles.tipItem}>
                <FontAwesome6 name="eye" size={14} color="#e74c3c" />
                <Text style={styles.tipText}>
                  Watch for yellowing leaves (overwatering) or brown crispy tips
                  (underwatering)
                </Text>
              </View>
            </View>

            {/* Plant Family Information */}
            <View style={styles.familyInfoContainer}>
              <View style={styles.familyInfoHeader}>
                <FontAwesome6
                  name="dna"
                  size={18}
                  color={theme.colorLeafyGreen}
                />
                <Text style={styles.familyInfoTitle}>
                  Plant Family Insights
                </Text>
              </View>

              <Text style={styles.familyName}>
                {selectedPlant.species.family.scientificNameWithoutAuthor}
              </Text>

              <Text style={styles.familyDescription}>
                Plants in this family typically share similar care requirements
                and growth patterns. The care recommendations above are tailored
                based on this plant family's characteristics.
              </Text>
            </View>
          </View>
        )}

        {/* Quick Reference Card */}
        {editableCareDetails && !isFetchingCareDetails && (
          <View style={styles.quickReferenceContainer}>
            <Text style={styles.quickReferenceTitle}>Quick Reference</Text>
            <View style={styles.quickReferenceGrid}>
              <View style={styles.quickReferenceItem}>
                <FontAwesome6 name="droplet" size={16} color="#3498db" />
                <Text style={styles.quickReferenceLabel}>Water</Text>
                <Text style={styles.quickReferenceValue}>
                  {editableCareDetails.wateringFrequency
                    ?.split(" ")
                    .slice(0, 2)
                    .join(" ") || "Weekly"}
                </Text>
              </View>

              <View style={styles.quickReferenceItem}>
                <FontAwesome6 name="sun" size={16} color="#f39c12" />
                <Text style={styles.quickReferenceLabel}>Light</Text>
                <Text style={styles.quickReferenceValue}>
                  {editableCareDetails.sunlightRequirement?.split(",")[0] ||
                    "Bright indirect"}
                </Text>
              </View>

              <View style={styles.quickReferenceItem}>
                <FontAwesome6
                  name="temperature-three-quarters"
                  size={16}
                  color="#e74c3c"
                />
                <Text style={styles.quickReferenceLabel}>Temp</Text>
                <Text style={styles.quickReferenceValue}>
                  {editableCareDetails.temperature?.split(" ")[0] || "18-24°C"}
                </Text>
              </View>

              <View style={styles.quickReferenceItem}>
                <FontAwesome6 name="cloud-rain" size={16} color="#9b59b6" />
                <Text style={styles.quickReferenceLabel}>Humidity</Text>
                <Text style={styles.quickReferenceValue}>
                  {editableCareDetails.humidity?.split(" ")[0] || "40-60%"}
                </Text>
              </View>
            </View>
          </View>
        )}
      </ScrollView>

      {/* Fixed Bottom Button with Safe Area */}
      <View
        style={[
          styles.bottomButtonContainer,
          { paddingBottom: insets.bottom + 16 },
        ]}
      >
        <LinearGradient
          colors={[theme.colorLeafyGreen, theme.colorLeafyGreen]}
          style={styles.saveButton}
        >
          <TouchableOpacity
            style={styles.saveButtonInner}
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
        </LinearGradient>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colorWhite,
  },
  headerGradient: {
    paddingBottom: 4,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
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
  },
  headerBackButton: {
    padding: 12,
    borderRadius: 12,
    backgroundColor: "#f8f9fa",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  backButton: {
    backgroundColor: theme.colorLeafyGreen,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
  },
  backButtonText: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "600",
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "800",
    color: theme.colorLeafyGreen,
    letterSpacing: 0.5,
  },
  imageContainer: {
    alignItems: "center",
    paddingVertical: 24,
    backgroundColor: "#f8fffe",
    marginHorizontal: 16,
    marginTop: 10,
    marginBottom: 10,
    borderRadius: 20,
    shadowColor: theme.colorLeafyGreen,
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  plantImage: {
    width: screenWidth * 0.75,
    height: screenWidth * 0.55,
    borderRadius: 16,
    resizeMode: "cover",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
  },
  careSourceIndicator: {
    backgroundColor: "#f0f8f0",
    padding: 16,
    marginHorizontal: 16,
    marginBottom: 16,
    borderRadius: 12,
    borderLeftWidth: 4,
    borderLeftColor: theme.colorLeafyGreen,
    shadowColor: theme.colorLeafyGreen,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  careSourceText: {
    fontSize: 14,
    color: theme.colorLeafyGreen,
    fontWeight: "500",
  },
  loadingCareContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
    backgroundColor: "#f8fffe",
    marginHorizontal: 16,
    borderRadius: 16,
    marginBottom: 16,
    shadowColor: theme.colorLeafyGreen,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  loadingCareText: {
    marginLeft: 10,
    fontSize: 14,
    color: "#666",
  },
  identificationContainer: {
    padding: 20,
    backgroundColor: "#ffffff",
    marginHorizontal: 16,
    marginVertical: 8,
    borderRadius: 16,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
    borderWidth: 1,
    borderColor: "#f0f8f0",
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
    color: theme.colorLeafyGreen,
    fontWeight: "600",
  },
  commonName: {
    fontSize: 16,
    color: theme.colorLeafyGreen,
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
    padding: 20,
    backgroundColor: "#ffffff",
    marginHorizontal: 16,
    marginVertical: 8,
    borderRadius: 16,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
    borderWidth: 1,
    borderColor: "#f0f8f0",
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "800",
    color: theme.colorLeafyGreen,
    marginBottom: 16,
    letterSpacing: 0.3,
  },
  inputContainer: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 15,
    fontWeight: "700",
    color: theme.colorLeafyGreen,
    marginBottom: 8,
    letterSpacing: 0.2,
  },
  textInput: {
    borderWidth: 1,
    borderColor: "#e8f5e8",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    backgroundColor: "#ffffff",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  notesInput: {
    height: 80,
    textAlignVertical: "top",
  },
  careDetailsSection: {
    marginTop: 16,
  },
  careDetailsHeader: {
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  careDetailsSubtitle: {
    fontSize: 14,
    color: "#666",
    marginTop: 4,
  },
  careDetailsContainer: {
    paddingHorizontal: 16,
  },
  careSection: {
    marginBottom: 24,
    backgroundColor: "#ffffff",
    padding: 20,
    borderRadius: 16,
    marginHorizontal: 16,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
    borderWidth: 1,
    borderColor: "#f0f8f0",
  },
  careSectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: theme.colorLeafyGreen,
    marginLeft: 8,
    letterSpacing: 0.3,
  },
  careSectionTitleContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
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
    borderColor: "#e8f5e8",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 15,
    backgroundColor: "#ffffff",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  multilineInput: {
    height: 60,
    textAlignVertical: "top",
  },
  // Slider styles
  sliderContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 8,
  },
  slider: {
    flex: 1,
    height: 40,
    marginHorizontal: 10,
  },
  sliderLabel: {
    fontSize: 12,
    color: "#666",
    width: 60,
    textAlign: "center",
  },
  sliderValue: {
    fontSize: 15,
    color: theme.colorLeafyGreen,
    fontWeight: "700",
    textAlign: "center",
    marginTop: 8,
    padding: 12,
    backgroundColor: "#e8f5e8",
    borderRadius: 12,
    shadowColor: theme.colorLeafyGreen,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  sliderThumb: {
    backgroundColor: theme.colorLeafyGreen,
    width: 20,
    height: 20,
  },
  bottomButtonContainer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "rgba(255, 255, 255, 0.95)",
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: "#f0f8f0",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: -2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 8,
  },
  saveButton: {
    borderRadius: 16,
    shadowColor: theme.colorLeafyGreen,
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  saveButtonInner: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 18,
    borderRadius: 16,
  },
  saveButtonText: {
    color: "#ffffff",
    fontSize: 18,
    fontWeight: "800",
    letterSpacing: 0.5,
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
  // New enhanced styles
  tipsContainer: {
    backgroundColor: "#f8f9fa",
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: "#e8f5e8",
  },
  tipsHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  tipsTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: theme.colorLeafyGreen,
    marginLeft: 8,
  },
  tipItem: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 12,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  tipText: {
    flex: 1,
    fontSize: 14,
    color: "#666",
    lineHeight: 20,
    marginLeft: 12,
  },
  familyInfoContainer: {
    backgroundColor: "#ffffff",
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 16,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
    borderWidth: 1,
    borderColor: "#f0f8f0",
  },
  familyInfoHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  familyInfoTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: theme.colorLeafyGreen,
    marginLeft: 8,
  },
  familyName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    marginBottom: 8,
    fontStyle: "italic",
  },
  familyDescription: {
    fontSize: 14,
    color: "#666",
    lineHeight: 20,
  },
  quickReferenceContainer: {
    backgroundColor: "#ffffff",
    marginHorizontal: 16,
    marginTop: 16,
    marginBottom: 20,
    borderRadius: 16,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
    borderWidth: 1,
    borderColor: "#f0f8f0",
  },
  quickReferenceTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: theme.colorLeafyGreen,
    marginBottom: 16,
  },
  quickReferenceGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  quickReferenceItem: {
    width: "48%",
    alignItems: "center",
    backgroundColor: "#f8f9fa",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  quickReferenceLabel: {
    fontSize: 12,
    fontWeight: "600",
    color: "#666",
    marginTop: 8,
    marginBottom: 4,
  },
  quickReferenceValue: {
    fontSize: 14,
    fontWeight: "600",
    color: theme.colorDarkGreen,
    textAlign: "center",
  },
});

export default PlantDetailsReview;
