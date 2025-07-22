import React, { useEffect } from "react";
import {
View,
Text,
Image,
TouchableOpacity,
ScrollView,
ActivityIndicator,
StyleSheet,
SafeAreaView,
Dimensions,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import {
usePlantIdentificationStore,
PlantIdentificationResult,
generateDefaultCareDetails,
} from "../store/plantIdentification";
import { theme } from "@/theme";

const { width: screenWidth, height: screenHeight } = Dimensions.get("window");

const PlantIdentificationScreen: React.FC = () => {
const params = useLocalSearchParams();
const router = useRouter();

const imageUri = Array.isArray(params.imageUri)
  ? params.imageUri[0]
  : params.imageUri;

console.log("Received params:", params);
console.log("Extracted imageUri:", imageUri);

const finalImageUri = imageUri;

const {
  identificationResults,
  selectedPlant,
  isLoading,
  error,
  identifyPlant,
  selectPlant,
  setCurrentImage,
  clearCurrentIdentification,
  setCareDetails,
} = usePlantIdentificationStore();

useEffect(() => {
  if (!imageUri) {
    router.back();
    console.warn("No image URI provided, redirecting back.");
    return;
  }

  const initializeIdentification = async (): Promise<void> => {
    try {
      setCurrentImage(finalImageUri);
      await identifyPlant(finalImageUri);
    } catch (error) {
      console.error("Failed to identify plant:", error);
    }
  };

  initializeIdentification();
}, [finalImageUri, setCurrentImage, identifyPlant, router]);

const handleRetakePhoto = (): void => {
  clearCurrentIdentification();
  router.back();
};

const handleContinue = (): void => {
  if (selectedPlant) {
    console.log("🚀 Navigating to plant details review...");
    console.log("Selected plant:", selectedPlant.species.scientificNameWithoutAuthor);
    
    const defaultCareDetails = generateDefaultCareDetails(selectedPlant);
    setCareDetails(defaultCareDetails);
    
    // Navigate to the plant details review screen
    router.push("/plantdetailsreview");
  } else {
    console.warn("⚠️ No plant selected for continuation");
  }
};

const handleSelectPlant = (plant: PlantIdentificationResult): void => {
  console.log("🌱 Plant selected:", plant.species.scientificNameWithoutAuthor);
  selectPlant(plant);
};

const formatConfidenceScore = (score: number): string => {
  return `${Math.round(score * 100)}%`;
};

const truncateText = (text: string, maxLength: number): string => {
  return text.length > maxLength
    ? `${text.substring(0, maxLength)}...`
    : text;
};

// Error State
if (error) {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.imageContainer}>
        <Image source={{ uri: finalImageUri }} style={styles.capturedImage} />
      </View>

      <View style={styles.contentContainer}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorTitle}>Identification Failed</Text>
          <Text style={styles.errorText}>{error}</Text>
        </View>

        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={styles.retryButton}
            onPress={handleRetakePhoto}
          >
            <Text style={styles.buttonText}>Take Another Photo</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}

return (
  <SafeAreaView style={styles.container}>
    {/* Header with captured image */}
    <View style={styles.imageContainer}>
      <Image source={{ uri: finalImageUri }} style={styles.capturedImage} />
    </View>

    {/* Content Container with proper spacing */}
    <View style={styles.contentContainer}>
      {/* Loading State */}
      {isLoading && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#4CAF50" />
          <Text style={styles.loadingText}>Identifying your plant...</Text>
          <Text style={styles.loadingSubtext}>
            This may take a few seconds
          </Text>
        </View>
      )}

      {/* Results */}
      {!isLoading && identificationResults.length > 0 && (
        <>
          {/* Scrollable Results */}
          <View style={styles.resultsScrollContainer}>
            <Text style={styles.resultsTitle}>
              Plant Identification Results
            </Text>

            <ScrollView
              style={styles.resultsScroll}
              contentContainerStyle={styles.resultsContent}
              showsVerticalScrollIndicator={false}
            >
              {identificationResults
                .slice(0, 3)
                .map((result: PlantIdentificationResult, index: number) => (
                  <TouchableOpacity
                    key={`${result.species.scientificNameWithoutAuthor}_${index}`}
                    style={[
                      styles.resultCard,
                      selectedPlant?.species.scientificNameWithoutAuthor ===
                        result.species.scientificNameWithoutAuthor &&
                        styles.selectedResultCard,
                    ]}
                    onPress={() => handleSelectPlant(result)}
                    activeOpacity={0.7}
                  >
                    <View style={styles.resultHeader}>
                      <Text style={styles.plantName}>
                        {truncateText(
                          result.species.scientificNameWithoutAuthor,
                          25
                        )}
                      </Text>
                      <View style={styles.confidenceContainer}>
                        <Text style={styles.confidenceScore}>
                          {formatConfidenceScore(result.score)} match
                        </Text>
                      </View>
                    </View>

                    {result.species.commonNames &&
                      result.species.commonNames.length > 0 && (
                        <Text style={styles.commonName}>
                          Common name:{" "}
                          {truncateText(result.species.commonNames[0], 30)}
                        </Text>
                      )}

                    <Text style={styles.familyName}>
                      Family:{" "}
                      {result.species.family.scientificNameWithoutAuthor}
                    </Text>

                    {result.species.genus && (
                      <Text style={styles.genusName}>
                        Genus:{" "}
                        {result.species.genus.scientificNameWithoutAuthor}
                      </Text>
                    )}
                  </TouchableOpacity>
                ))}
            </ScrollView>
          </View>

          {/* Fixed Action Buttons */}
          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={styles.secondaryButton}
              onPress={handleRetakePhoto}
              activeOpacity={0.7}
            >
              <Text style={styles.secondaryButtonText}>
                Take Another Photo
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.primaryButton,
                !selectedPlant && styles.disabledButton,
              ]}
              onPress={handleContinue}
              disabled={!selectedPlant}
              activeOpacity={selectedPlant ? 0.7 : 1}
            >
              <Text
                style={[
                  styles.primaryButtonText,
                  !selectedPlant && styles.disabledButtonText,
                ]}
              >
                This looks correct
              </Text>
            </TouchableOpacity>
          </View>
        </>
      )}

      {/* No Results */}
      {!isLoading && identificationResults.length === 0 && !error && (
        <>
          <View style={styles.noResultsContainer}>
            <Text style={styles.noResultsTitle}>No matches found</Text>
            <Text style={styles.noResultsText}>
              Try taking a clearer photo with better lighting, or focus on the
              leaves and flowers.
            </Text>
          </View>

          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={styles.retryButton}
              onPress={handleRetakePhoto}
            >
              <Text style={styles.buttonText}>Take Another Photo</Text>
            </TouchableOpacity>
          </View>
        </>
      )}
    </View>
  </SafeAreaView>
);
};

// ... rest of your styles remain the same
const styles = StyleSheet.create({
container: {
  flex: 1,
  backgroundColor: "#ffffff",
},
imageContainer: {
  height: 200,
  backgroundColor: "#f5f5f5",
  justifyContent: "center",
  alignItems: "center",
  borderBottomWidth: 1,
  borderBottomColor: "#e0e0e0",
},
capturedImage: {
  width: "100%",
  height: "100%",
  resizeMode: "cover",
},
contentContainer: {
  flex: 1,
  paddingHorizontal: 16,
  paddingTop: 16,
  paddingBottom: 16,
},
loadingContainer: {
  flex: 1,
  justifyContent: "center",
  alignItems: "center",
},
loadingText: {
  fontSize: 18,
  fontWeight: "600",
  color: "#333333",
  marginTop: 16,
  textAlign: "center",
},
loadingSubtext: {
  fontSize: 14,
  color: "#666666",
  marginTop: 8,
  textAlign: "center",
},
resultsScrollContainer: {
  flex: 1,
  marginBottom: 16,
},
resultsTitle: {
  fontSize: 22,
  fontWeight: "700",
  color: "#333333",
  marginBottom: 16,
},
resultsScroll: {
  flex: 1,
},
resultsContent: {
  paddingBottom: 20,
},
resultCard: {
  backgroundColor: "#f8f9fa",
  borderRadius: 12,
  padding: 16,
  marginBottom: 12,
  borderWidth: 2,
  borderColor: "transparent",
  shadowColor: "#000",
  shadowOffset: {
    width: 0,
    height: 2,
  },
  shadowOpacity: 0.1,
  shadowRadius: 3.84,
  elevation: 5,
},
selectedResultCard: {
  borderColor: "#4CAF50",
  backgroundColor: "#f1f8e9",
},
resultHeader: {
  flexDirection: "row",
  justifyContent: "space-between",
  alignItems: "flex-start",
  marginBottom: 8,
},
plantName: {
  fontSize: 16,
  fontWeight: "600",
  color: "#333333",
  flex: 1,
  fontStyle: "italic",
  marginRight: 8,
},
confidenceContainer: {
  backgroundColor: "#e8f5e8",
  paddingHorizontal: 8,
  paddingVertical: 4,
  borderRadius: 6,
},
confidenceScore: {
  fontSize: 12,
  color: "#4CAF50",
  fontWeight: "600",
},
commonName: {
  fontSize: 14,
  color: "#666666",
  marginBottom: 4,
  fontWeight: "500",
},
familyName: {
  fontSize: 12,
  color: "#888888",
  marginBottom: 2,
},
genusName: {
  fontSize: 12,
  color: "#888888",
},
buttonContainer: {
  bottom: "2%",
  flexDirection: "row",
  gap: 12,
  paddingTop: 8,
  paddingBottom: 8,
  backgroundColor: "#ffffff",
  borderTopWidth: 1,
  borderTopColor: "#f0f0f0",
},
primaryButton: {
  flex: 1,
  backgroundColor: "#4CAF50",
  paddingVertical: 16,
  borderRadius: 12,
  alignItems: "center",
  shadowColor: "#4CAF50",
  shadowOffset: {
    width: 0,
    height: 4,
  },
  shadowOpacity: 0.3,
  shadowRadius: 4.65,
  elevation: 8,
},
secondaryButton: {
  flex: 1,
  backgroundColor: "transparent",
  paddingVertical: 16,
  borderRadius: 12,
  alignItems: "center",
  borderWidth: 2,
  borderColor: "#4CAF50",
},
disabledButton: {
  backgroundColor: "#cccccc",
  shadowOpacity: 0,
  elevation: 0,
},
primaryButtonText: {
  color: "#ffffff",
  fontSize: 16,
  fontWeight: "600",
},
secondaryButtonText: {
  color: "#4CAF50",
  fontSize: 16,
  fontWeight: "600",
},
disabledButtonText: {
  color: "#888888",
},
errorContainer: {
  flex: 1,
  justifyContent: "center",
  alignItems: "center",
},
errorTitle: {
  fontSize: 20,
  fontWeight: "700",
  color: "#d32f2f",
  marginBottom: 12,
  textAlign: "center",
},
errorText: {
  fontSize: 16,
  color: "#666666",
  textAlign: "center",
  marginBottom: 20,
  lineHeight: 24,
},
noResultsContainer: {
  flex: 1,
  justifyContent: "center",
  alignItems: "center",
},
noResultsTitle: {
  fontSize: 20,
  fontWeight: "700",
  color: "#333333",
  marginBottom: 12,
  textAlign: "center",
},
noResultsText: {
  fontSize: 16,
  color: "#666666",
  textAlign: "center",
  marginBottom: 20,
  lineHeight: 24,
},
retryButton: {
  backgroundColor: "#4CAF50",
  paddingVertical: 16,
  paddingHorizontal: 32,
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
buttonText: {
  color: "#ffffff",
  fontSize: 16,
  fontWeight: "600",
},
});

export default PlantIdentificationScreen;