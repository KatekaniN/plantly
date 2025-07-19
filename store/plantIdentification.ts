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

  try {
    const url = `${PLANTNET_BASE_URL}/all?api-key=${PLANTNET_API_KEY}`;

    console.log("🔍 Starting plant identification...");
    console.log("📷 Image URI:", imageUri);
    console.log("🌐 API URL:", url);

    const response = await FileSystem.uploadAsync(url, imageUri, {
      fieldName: "images",
      httpMethod: "POST",
      uploadType: FileSystem.FileSystemUploadType.MULTIPART,
      parameters: {
        organs: "flower", 
      },
    });

    console.log("📡 API Response Status:", response.status);
    console.log("📄 API Response Body:", response.body);

    if (response.status !== 200) {
      console.error("❌ API Error Response:", response.body);
      throw new Error(`PlantNet API error: ${response.status}`);
    }

    // Add safety check for response body
    if (!response.body) {
      throw new Error("Empty response from PlantNet API");
    }

    let data: PlantNetApiResponse;
    try {
      data = JSON.parse(response.body);
    } catch (parseError) {
      console.error("❌ JSON Parse Error:", parseError);
      console.error("Raw response:", response.body);
      throw new Error("Invalid response format from PlantNet API");
    }

    console.log("✅ PlantNet API success:", data);
    console.log("🔢 Number of results:", data.results?.length || 0);

    // Add safety check for results
    if (!data.results || !Array.isArray(data.results)) {
      console.log("⚠️ No results array in response");
      return [];
    }

    const filteredResults = data.results.filter(
      (result: PlantIdentificationResult) => result.score > 0.1
    );

    console.log("✨ Filtered results count:", filteredResults.length);

    return filteredResults;
  } catch (error) {
    console.error("🚨 PlantNet identification error:", error);

    if (error instanceof Error) {
      if (error.message.includes("API key")) {
        throw new Error("API configuration error. Please contact support.");
      } else if (error.message.includes("401")) {
        throw new Error("Invalid API key. Please check configuration.");
      } else if (error.message.includes("429")) {
        throw new Error("Too many requests. Please try again later.");
      } else if (error.message.includes("Network")) {
        throw new Error(
          "Network error. Please check your internet connection."
        );
      }
    }

    throw new Error(
      `Failed to identify plant: ${error instanceof Error ? error.message : "Unknown error"}`
    );
  }
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
        console.log("🚀 Starting plant identification process...");
        set({ isLoading: true, error: null });

        try {
          // Validate image URI
          if (!imageUri) {
            throw new Error("No image provided for identification");
          }

          // Check if file exists (for local files)
          if (imageUri.startsWith("file://")) {
            const fileInfo = await FileSystem.getInfoAsync(imageUri);
            if (!fileInfo.exists) {
              throw new Error("Image file not found");
            }
            console.log("📁 Image file exists, size:", fileInfo.size);
          }

          const identificationResults =
            await identifyPlantWithPlantNet(imageUri);

          console.log("🎉 Identification completed successfully");

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
