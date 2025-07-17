import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";

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

// ===== PLANTNET API CONFIGURATION =====
const PLANTNET_API_KEY = "2b10AiFkzcaToQc4itaO6wd4O"; // Get from https://my.plantnet.org/
const PLANTNET_PROJECT = "weurope"; // Options: 'weurope', 'the-flora-of-china', 'k-world-flora'
const PLANTNET_BASE_URL = "https://my-api.plantnet.org/v2/identify";

// ===== API FUNCTIONS =====
async function identifyPlantWithPlantNet(
  imageUri: string
): Promise<PlantIdentificationResult[]> {
  if (!PLANTNET_API_KEY) {
    throw new Error("PlantNet API key not configured");
  }

  try {
    const formData = new FormData();

    formData.append("images", {
      uri: imageUri,
      type: "image/jpeg",
      name: "plant_image.jpg",
    } as any);

    formData.append("organs", "leaf");
    formData.append("organs", "flower");
    formData.append("organs", "fruit");

    formData.append(
      "modifiers",
      JSON.stringify(["crops_fast", "similar_images"])
    );
    formData.append("plant-details", JSON.stringify(["common_names"]));

    const url = `${PLANTNET_BASE_URL}/${PLANTNET_PROJECT}?api-key=${PLANTNET_API_KEY}`;

    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "multipart/form-data",
      },
      body: formData,
    });

    if (!response.ok) {
      const errorData: PlantNetError = await response.json();
      throw new Error(
        `PlantNet API error: ${errorData.message || response.statusText}`
      );
    }

    const data: PlantNetApiResponse = await response.json();
    const filteredResults = data.results.filter(
      (result: PlantIdentificationResult) => result.score > 0.1
    );

    return filteredResults;
  } catch (error) {
    console.error("PlantNet identification error:", error);

    if (
      error instanceof TypeError &&
      error.message.includes("Network request failed")
    ) {
      throw new Error("Network error. Please check your internet connection.");
    }

    throw error;
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

// ===== ZUSTAND STORE - SIMPLIFIED TYPING =====
export const usePlantIdentificationStore = create(
  persist(
    (set, get) => ({
      // State
      currentImageUri: null as string | null,
      identificationResults: [] as PlantIdentificationResult[],
      selectedPlant: null as PlantIdentificationResult | null,
      careDetails: null as PlantCareDetails | null,
      isLoading: false,
      error: null as string | null,
      myPlants: [] as PlantProfile[],

      // Actions
      setCurrentImage: (uri: string): void => {
        set({ currentImageUri: uri });
      },

      identifyPlant: async (imageUri: string): Promise<void> => {
        set({ isLoading: true, error: null });

        try {
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
          const errorMessage =
            error instanceof Error ? error.message : "Failed to identify plant";
          set({
            error: errorMessage,
            isLoading: false,
            identificationResults: [],
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
      partialize: (state: PlantIdentificationStore) => ({ myPlants: state.myPlants }),
    }
  )
);
