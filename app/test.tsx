import React, { useState } from "react";
import {
View,
Text,
TouchableOpacity,
StyleSheet,
SafeAreaView,
ScrollView,
Alert,
Image,
} from "react-native";
import { useRouter } from "expo-router";
import {
usePlantIdentificationStore,
PlantIdentificationResult,
generateDefaultCareDetails,
} from "../store/plantIdentification";

const TestPlantIdentificationScreen: React.FC = () => {
const router = useRouter();
const [testResults, setTestResults] = useState<string[]>([]);

const {
  currentImageUri,
  identificationResults,
  selectedPlant,
  careDetails,
  isLoading,
  error,
  myPlants,
  setCurrentImage,
  identifyPlant,
  selectPlant,
  setCareDetails,
  addPlantToCollection,
  clearCurrentIdentification,
  setError,
  setLoading,
} = usePlantIdentificationStore();

// Mock plant data for testing
const mockPlantResult: PlantIdentificationResult = {
  species: {
    scientificNameWithoutAuthor: "Monstera deliciosa",
    scientificNameAuthorship: "Liebm.",
    genus: {
      scientificNameWithoutAuthor: "Monstera",
    },
    family: {
      scientificNameWithoutAuthor: "Araceae",
    },
    commonNames: ["Swiss Cheese Plant", "Split-leaf Philodendron"],
  },
  score: 0.85,
  gbif: {
    id: "123456",
  },
};

const mockImageUri = "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=400&fit=crop";

const addTestResult = (message: string) => {
  setTestResults(prev => [...prev, `${new Date().toLocaleTimeString()}: ${message}`]);
};

const testSetCurrentImage = () => {
  setCurrentImage(mockImageUri);
  addTestResult(`✅ Set current image: ${mockImageUri.substring(0, 50)}...`);
};

const testMockIdentification = () => {
  setLoading(true);
  addTestResult("🔄 Starting mock identification...");
  
  setTimeout(() => {
    // Simulate API response
    const mockResults = [mockPlantResult];
    // Manually update the store (since we can't call the real API)
    selectPlant(mockPlantResult);
    setLoading(false);
    addTestResult(`✅ Mock identification complete: Found ${mockResults.length} results`);
    addTestResult(`🌱 Top result: ${mockPlantResult.species.scientificNameWithoutAuthor} (${Math.round(mockPlantResult.score * 100)}% confidence)`);
  }, 2000);
};

const testGenerateCareDeatils = () => {
  if (!selectedPlant) {
    addTestResult("❌ No plant selected. Run mock identification first.");
    return;
  }

  const careDetails = generateDefaultCareDetails(selectedPlant);
  setCareDetails(careDetails);
  addTestResult("✅ Generated care details:");
  addTestResult(`   💧 Watering: ${careDetails.wateringFrequency}`);
  addTestResult(`   ☀️ Sunlight: ${careDetails.sunlightRequirement}`);
  addTestResult(`   🌡️ Temperature: ${careDetails.temperature}`);
};

const testAddToCollection = () => {
  if (!selectedPlant || !careDetails) {
    addTestResult("❌ Need selected plant and care details first.");
    return;
  }

  const plantProfile = {
    name: "My Test Plant",
    imageUri: mockImageUri,
    identification: selectedPlant,
    careDetails: careDetails,
    location: "Living Room",
    notes: "Test plant added from demo",
  };

  addPlantToCollection(plantProfile);
  addTestResult(`✅ Added plant to collection: "${plantProfile.name}"`);
  addTestResult(`📊 Total plants in collection: ${myPlants.length + 1}`);
};

const testErrorHandling = () => {
  setError("This is a test error message");
  addTestResult("❌ Test error set");
  
  setTimeout(() => {
    setError(null);
    addTestResult("✅ Error cleared");
  }, 3000);
};

const testClearStore = () => {
  clearCurrentIdentification();
  addTestResult("🧹 Cleared identification data");
};

const testNavigateToIdentification = () => {
  router.push({
    pathname: '/plant-identification',
    params: { imageUri: mockImageUri }
  });
};

const clearTestResults = () => {
  setTestResults([]);
};

return (
  <SafeAreaView style={styles.container}>
    <Text style={styles.title}>🧪 Plant ID Store Test</Text>
    
    {/* Current State Display */}
    <View style={styles.stateContainer}>
      <Text style={styles.sectionTitle}>Current State:</Text>
      <Text style={styles.stateText}>Loading: {isLoading ? "Yes" : "No"}</Text>
      <Text style={styles.stateText}>Error: {error || "None"}</Text>
      <Text style={styles.stateText}>Selected Plant: {selectedPlant?.species.scientificNameWithoutAuthor || "None"}</Text>
      <Text style={styles.stateText}>Has Care Details: {careDetails ? "Yes" : "No"}</Text>
      <Text style={styles.stateText}>Plants in Collection: {myPlants.length}</Text>
      
      {currentImageUri && (
        <View style={styles.imagePreview}>
          <Text style={styles.stateText}>Current Image:</Text>
          <Image source={{ uri: currentImageUri }} style={styles.previewImage} />
        </View>
      )}
    </View>

    {/* Test Buttons */}
    <ScrollView style={styles.buttonContainer}>
      <TouchableOpacity style={styles.testButton} onPress={testSetCurrentImage}>
        <Text style={styles.buttonText}>1. Set Mock Image</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.testButton} onPress={testMockIdentification}>
        <Text style={styles.buttonText}>2. Mock Plant Identification</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.testButton} onPress={testGenerateCareDeatils}>
        <Text style={styles.buttonText}>3. Generate Care Details</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.testButton} onPress={testAddToCollection}>
        <Text style={styles.buttonText}>4. Add to Collection</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.testButton} onPress={testErrorHandling}>
        <Text style={styles.buttonText}>5. Test Error Handling</Text>
      </TouchableOpacity>

      <TouchableOpacity style={[styles.testButton, styles.navigationButton]} onPress={testNavigateToIdentification}>
        <Text style={styles.buttonText}>🚀 Navigate to Plant ID Screen</Text>
      </TouchableOpacity>

      <TouchableOpacity style={[styles.testButton, styles.clearButton]} onPress={testClearStore}>
        <Text style={styles.buttonText}>Clear Store Data</Text>
      </TouchableOpacity>
    </ScrollView>

    {/* Test Results */}
    <View style={styles.resultsContainer}>
      <View style={styles.resultsHeader}>
        <Text style={styles.sectionTitle}>Test Results:</Text>
        <TouchableOpacity onPress={clearTestResults} style={styles.clearResultsButton}>
          <Text style={styles.clearResultsText}>Clear</Text>
        </TouchableOpacity>
      </View>
      
      <ScrollView style={styles.resultsList}>
        {testResults.length === 0 ? (
          <Text style={styles.noResultsText}>No test results yet. Run some tests!</Text>
        ) : (
          testResults.map((result, index) => (
            <Text key={index} style={styles.resultText}>
              {result}
            </Text>
          ))
        )}
      </ScrollView>
    </View>
  </SafeAreaView>
);
};

const styles = StyleSheet.create({
container: {
  flex: 1,
  backgroundColor: "#f5f5f5",
  padding: 16,
},
title: {
  fontSize: 24,
  fontWeight: "bold",
  textAlign: "center",
  marginBottom: 20,
  color: "#333",
},
stateContainer: {
  backgroundColor: "white",
  padding: 16,
  borderRadius: 12,
  marginBottom: 20,
  shadowColor: "#000",
  shadowOffset: { width: 0, height: 2 },
  shadowOpacity: 0.1,
  shadowRadius: 4,
  elevation: 3,
},
sectionTitle: {
  fontSize: 18,
  fontWeight: "600",
  color: "#333",
  marginBottom: 8,
},
stateText: {
  fontSize: 14,
  color: "#666",
  marginBottom: 4,
},
imagePreview: {
  marginTop: 8,
},
previewImage: {
  width: 100,
  height: 100,
  borderRadius: 8,
  marginTop: 4,
},
buttonContainer: {
  flex: 1,
  marginBottom: 20,
},
testButton: {
  backgroundColor: "#4CAF50",
  padding: 16,
  borderRadius: 12,
  marginBottom: 12,
  alignItems: "center",
  shadowColor: "#4CAF50",
  shadowOffset: { width: 0, height: 2 },
  shadowOpacity: 0.3,
  shadowRadius: 4,
  elevation: 4,
},
navigationButton: {
  backgroundColor: "#2196F3",
},
clearButton: {
  backgroundColor: "#FF5722",
},
buttonText: {
  color: "white",
  fontSize: 16,
  fontWeight: "600",
},
resultsContainer: {
  backgroundColor: "white",
  borderRadius: 12,
  padding: 16,
  maxHeight: 200,
  shadowColor: "#000",
  shadowOffset: { width: 0, height: 2 },
  shadowOpacity: 0.1,
  shadowRadius: 4,
  elevation: 3,
},
resultsHeader: {
  flexDirection: "row",
  justifyContent: "space-between",
  alignItems: "center",
  marginBottom: 8,
},
clearResultsButton: {
  paddingHorizontal: 12,
  paddingVertical: 6,
  backgroundColor: "#f0f0f0",
  borderRadius: 6,
},
clearResultsText: {
  fontSize: 12,
  color: "#666",
},
resultsList: {
  flex: 1,
},
resultText: {
  fontSize: 12,
  color: "#333",
  marginBottom: 4,
  fontFamily: "monospace",
},
noResultsText: {
  fontSize: 14,
  color: "#999",
  fontStyle: "italic",
  textAlign: "center",
  marginTop: 20,
},
});

export default TestPlantIdentificationScreen;

