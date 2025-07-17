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
import {
  usePlantIdentificationStore,
  PlantIdentificationResult,
  generateDefaultCareDetails,
} from "../store/plantIdentification";

// Navigation types
interface RouteParams {
  imageUri: string;
}

interface NavigationProp {
  navigate: (screen: string, params?: any) => void;
  goBack: () => void;
}

interface PlantIdentificationScreenProps {
  route: {
    params: RouteParams;
  };
  navigation: NavigationProp;
}

const { width: screenWidth } = Dimensions.get("window");

const PlantIdentificationScreen: React.FC<PlantIdentificationScreenProps> = ({
  route,
  navigation,
}) => {
  const { imageUri } = route.params;

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
    const initializeIdentification = async (): Promise<void> => {
      setCurrentImage(imageUri);
      await identifyPlant(imageUri);
    };

    initializeIdentification();
  }, [imageUri, setCurrentImage, identifyPlant]);

  const handleRetakePhoto = (): void => {
    clearCurrentIdentification();
    navigation.goBack();
  };

  const handleContinue = (): void => {
    if (selectedPlant) {
      // Generate default care details for the selected plant
      const defaultCareDetails = generateDefaultCareDetails(selectedPlant);
      setCareDetails(defaultCareDetails);
      navigation.navigate("PlantDetailsReview");
    }
  };

  const handleSelectPlant = (plant: PlantIdentificationResult): void => {
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
          <Image source={{ uri: imageUri }} style={styles.capturedImage} />
        </View>

        <View style={styles.errorContainer}>
          <Text style={styles.errorTitle}>Identification Failed</Text>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity
            style={styles.retryButton}
            onPress={handleRetakePhoto}
          >
            <Text style={styles.buttonText}>Take Another Photo</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header with captured image */}
      <View style={styles.imageContainer}>
        <Image source={{ uri: imageUri }} style={styles.capturedImage} />
      </View>

      {/* Loading State */}
      {isLoading && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#4CAF50" />
          <Text style={styles.loadingText}>Identifying your plant...</Text>
          <Text style={styles.loadingSubtext}>This may take a few seconds</Text>
        </View>
      )}

      {/* Results */}
      {!isLoading && identificationResults.length > 0 && (
        <ScrollView
          style={styles.resultsContainer}
          showsVerticalScrollIndicator={false}
        >
          <Text style={styles.resultsTitle}>Plant Identification Results</Text>

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
                      30
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
                      {truncateText(result.species.commonNames[0], 40)}
                    </Text>
                  )}

                <Text style={styles.familyName}>
                  Family: {result.species.family.scientificNameWithoutAuthor}
                </Text>

                {result.species.genus && (
                  <Text style={styles.genusName}>
                    Genus: {result.species.genus.scientificNameWithoutAuthor}
                  </Text>
                )}
              </TouchableOpacity>
            ))}

          {/* Action Buttons */}
          <View style={styles.actionButtons}>
            <TouchableOpacity
              style={styles.secondaryButton}
              onPress={handleRetakePhoto}
              activeOpacity={0.7}
            >
              <Text style={styles.secondaryButtonText}>Take Another Photo</Text>
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
        </ScrollView>
      )}

      {/* No Results */}
      {!isLoading && identificationResults.length === 0 && !error && (
        <View style={styles.noResultsContainer}>
          <Text style={styles.noResultsTitle}>No matches found</Text>
          <Text style={styles.noResultsText}>
            Try taking a clearer photo with better lighting, or focus on the
            leaves and flowers.
          </Text>
          <TouchableOpacity
            style={styles.retryButton}
            onPress={handleRetakePhoto}
          >
            <Text style={styles.buttonText}>Take Another Photo</Text>
          </TouchableOpacity>
        </View>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#ffffff",
  },
  imageContainer: {
    height: 220,
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
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
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
  resultsContainer: {
    flex: 1,
    padding: 16,
  },
  resultsTitle: {
    fontSize: 22,
    fontWeight: "700",
    color: "#333333",
    marginBottom: 16,
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
  actionButtons: {
    flexDirection: "row",
    gap: 12,
    marginTop: 24,
    marginBottom: 20,
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
    padding: 20,
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
    padding: 20,
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
