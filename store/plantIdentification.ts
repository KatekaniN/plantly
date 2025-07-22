import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as FileSystem from "expo-file-system";

export interface PlantNetSpecies {
  scientificNameWithoutAuthor: string;
  scientificNameAuthorship: string;
  genus: {
    scientificNameWithoutAuthor: string;
  };
  family: {
    scientificNameWithoutAuthor: string;
  };
  commonNames: string[];
}

export interface PlantIdentificationResult {
  species: PlantNetSpecies;
  score: number;
  gbif?: {
    id: string;
  };
  images?: Array<{
    organ: string;
    author: string;
    license: string;
    date: {
      timestamp: number;
      string: string;
    };
    citation: string;
    url: {
      o: string;
      m: string;
      s: string;
    };
  }>;
}

export interface PlantCareDetails {
  wateringFrequency: string;
  wateringAmount: string;
  sunlightRequirement: string;
  temperature: string;
  humidity: string;
  placement: string[];
  growthCharacteristics: string;
  commonIssues: string[];
  soilType: string;
  fertilizing: string;
  pruning: string;
}

export interface PlantProfile {
  id: string;
  name: string;
  imageUri: string;
  identification: PlantIdentificationResult;
  careDetails: PlantCareDetails;
  dateAdded: string;
  lastWatered?: string;
  nextWateringDate?: string;
  notes?: string;
  location?: string;
}

export interface PlantNetApiResponse {
  query: {
    project: string;
    images: Array<{ organ: string }>;
    modifiers: string[];
    includeRelatedImages: boolean;
  };
  results: PlantIdentificationResult[];
  version: string;
  remainingIdentificationRequests: number;
}

export interface PlantNetError {
  statusCode: number;
  error: string;
  message: string;
}

type PlantIdentificationStore = {
  currentImageUri: string | null;
  identificationResults: PlantIdentificationResult[];
  selectedPlant: PlantIdentificationResult | null;
  careDetails: PlantCareDetails | null;
  isLoading: boolean;
  error: string | null;
  myPlants: PlantProfile[];

  setCurrentImage: (uri: string) => void;
  identifyPlant: (imageUri: string) => Promise<void>;
  selectPlant: (plant: PlantIdentificationResult) => void;
  setCareDetails: (details: PlantCareDetails) => void;
  addPlantToCollection: (
    plantData: Omit<PlantProfile, "id" | "dateAdded">
  ) => void;
  clearCurrentIdentification: () => void;
  setError: (error: string | null) => void;
  setLoading: (loading: boolean) => void;
};

const PLANTNET_API_KEY = "2b10AiFkzcaToQc4itaO6wd4O";
const PLANTNET_PROJECT = "weurope";
const PLANTNET_BASE_URL = "https://my-api.plantnet.org/v2/identify";

async function identifyPlantWithPlantNet(
imageUri: string
): Promise<PlantIdentificationResult[]> {
if (!PLANTNET_API_KEY) {
  throw new Error("PlantNet API key not configured");
}

// Try different organ types in order of success probability
const organStrategies = [
  "leaf",
  "flower", 
  "fruit",
  "bark"
];

let lastError: Error | null = null;

// Try each organ strategy
for (const organ of organStrategies) {
  try {
    console.log(`🌿 Trying identification with organ: ${organ}`);
    
    const url = `${PLANTNET_BASE_URL}/all?api-key=${PLANTNET_API_KEY}`;
    console.log("🌐 API URL:", url);
    console.log("📷 Image URI:", imageUri);

    // Validate image exists before API call
    const fileInfo = await FileSystem.getInfoAsync(imageUri);
    if (!fileInfo.exists) {
      throw new Error("Image file not found before API call");
    }
    
    console.log("📁 Image file validated - Size:", fileInfo.size, "bytes");

    const response = await FileSystem.uploadAsync(url, imageUri, {
      fieldName: "images",
      httpMethod: "POST",
      uploadType: FileSystem.FileSystemUploadType.MULTIPART,
      parameters: {
        organs: organ, // Try one organ at a time
      },
      headers: {
        'Accept': 'application/json',
      },
    });

    console.log(`📡 API Response Status for ${organ}:`, response.status);

    if (response.status === 200) {
      if (!response.body) {
        console.log(`⚠️ Empty response for ${organ}`);
        continue;
      }

      let data: PlantNetApiResponse;
      try {
        data = JSON.parse(response.body);
      } catch (parseError) {
        console.error(`❌ JSON Parse Error for ${organ}:`, parseError);
        continue;
      }

      console.log(`✅ PlantNet API success for ${organ}:`, data);
      console.log("🔢 Number of results:", data.results?.length || 0);

      if (data.results && Array.isArray(data.results) && data.results.length > 0) {
        const filteredResults = data.results.filter(
          (result: PlantIdentificationResult) => result.score > 0.01 // Very low threshold
        );

        if (filteredResults.length > 0) {
          console.log(`🎉 Found ${filteredResults.length} results with ${organ}`);
          return filteredResults;
        }
      }
      
      console.log(`⚠️ No results found for ${organ}, trying next...`);
    } else if (response.status === 404) {
      console.log(`🔍 No species found for ${organ}, trying next organ...`);
      lastError = new Error(`No plant species found with ${organ} analysis`);
      continue;
    } else {
      // Handle other errors
      console.error(`❌ API Error for ${organ}:`, response.status, response.body);
      lastError = new Error(`API error ${response.status}: ${response.body}`);
      continue;
    }

  } catch (error) {
    console.error(`🚨 Error trying ${organ}:`, error);
    lastError = error instanceof Error ? error : new Error(`Unknown error with ${organ}`);
    continue;
  }
}

// If we get here, all organ strategies failed
if (lastError?.message.includes("No plant species found")) {
  throw new Error("No plants could be identified in this image. Try taking a clearer photo focusing on leaves, flowers, or other plant parts.");
}

throw new Error(
  lastError?.message || "Failed to identify plant with any detection method"
);
}


export function generateDefaultCareDetails(
  plant: PlantIdentificationResult
): PlantCareDetails {
  const familyName =
    plant.species.family.scientificNameWithoutAuthor.toLowerCase();

  const defaultCare: PlantCareDetails = {
    wateringFrequency: "Every 7-10 days",
    wateringAmount: "Water thoroughly until drainage",
    sunlightRequirement: "Bright, indirect light",
    temperature: "18-24°C (65-75°F)",
    humidity: "40-60%",
    placement: ["Near a window", "Avoid direct sunlight"],
    growthCharacteristics: "Moderate growth rate",
    commonIssues: ["Overwatering", "Insufficient light"],
    soilType: "Well-draining potting mix",
    fertilizing: "Monthly during growing season",
    pruning: "Remove dead or yellowing leaves",
  };

  if (familyName.includes("cactaceae") || familyName.includes("succulent")) {
    defaultCare.wateringFrequency = "Every 2-3 weeks";
    defaultCare.sunlightRequirement = "Bright, direct light";
    defaultCare.placement = ["South-facing window", "Sunny location"];
    defaultCare.commonIssues = ["Overwatering", "Root rot"];
  }

  return defaultCare;
}

export const usePlantIdentificationStore = create(
  persist(
    (set, get) => ({
      currentImageUri: null as string | null,
      identificationResults: [] as PlantIdentificationResult[],
      selectedPlant: null as PlantIdentificationResult | null,
      careDetails: null as PlantCareDetails | null,
      isLoading: false,
      error: null as string | null,
      myPlants: [] as PlantProfile[],

      setCurrentImage: (uri: string): void => {
        set({ currentImageUri: uri });
      },

      identifyPlant: async (imageUri: string): Promise<void> => {
        set({ isLoading: true, error: null });

        try {
          if (!imageUri) {
            throw new Error("No image provided for identification");
          }

          // Check if file exists (for local files)
          if (imageUri.startsWith("file://")) {
            const fileInfo = await FileSystem.getInfoAsync(imageUri);
            if (!fileInfo.exists) {
              throw new Error("Image file not found");
            }
          }

          const identificationResults =
            await identifyPlantWithPlantNet(imageUri);

          set({
            identificationResults,
            isLoading: false,
            selectedPlant:
              identificationResults.length > 0
                ? identificationResults[0]
                : null,
          });
        } catch (error) {
          console.error("💥 Identification failed:", error);
          const errorMessage =
            error instanceof Error ? error.message : "Failed to identify plant";

          set({
            error: errorMessage,
            isLoading: false,
            identificationResults: [],
            selectedPlant: null,
          });
        }
      },

      selectPlant: (plant: PlantIdentificationResult): void => {
        set({ selectedPlant: plant });
      },

      setCareDetails: (details: PlantCareDetails): void => {
        set({ careDetails: details });
      },

      addPlantToCollection: (
        plantData: Omit<PlantProfile, "id" | "dateAdded">
      ): void => {
        const newPlant: PlantProfile = {
          ...plantData,
          id: `plant_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          dateAdded: new Date().toISOString(),
        };

        set((state: any) => ({
          myPlants: [...state.myPlants, newPlant],
        }));
      },

      clearCurrentIdentification: (): void => {
        set({
          currentImageUri: null,
          identificationResults: [],
          selectedPlant: null,
          careDetails: null,
          error: null,
          isLoading: false,
        });
      },

      setError: (error: string | null): void => {
        set({ error });
      },

      setLoading: (loading: boolean): void => {
        set({ isLoading: loading });
      },
    }),
    {
      name: "plantly-identification-store",
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state: PlantIdentificationStore) => ({
        myPlants: state.myPlants,
      }),
    }
  )
);
