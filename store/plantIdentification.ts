import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as FileSystem from "expo-file-system";
import notificationService from "../services/notificationService";

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

export interface UserNotificationPreferences {
  reminderTime: { hour: number; minute: number }; // When to send day-of reminders
  dayBeforeTime: { hour: number; minute: number }; // When to send day-before reminders
  overdueTime: { hour: number; minute: number }; // When to send overdue reminders
  enableNotifications: boolean;
  enableDayBeforeReminders: boolean;
  enableOverdueReminders: boolean;
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
  isFetchingCareDetails: boolean;
  notificationPreferences: UserNotificationPreferences;
  deletePlantFromCollection: (plantId: string) => void;
  waterPlant: (plantId: string) => void;
  updatePlant: (plantId: string, updates: Partial<PlantProfile>) => void;
  updatePlantWateringSchedule: (
    plantId: string,
    lastWatered: string,
    nextWateringDate: string
  ) => void;
  updateNotificationPreferences: (
    preferences: Partial<UserNotificationPreferences>
  ) => void;
  careDataSource: "default" | null;
  setCurrentImage: (uri: string) => void;
  identifyPlant: (imageUri: string) => Promise<void>;
  selectPlant: (plant: PlantIdentificationResult) => void;
  setCareDetails: (details: PlantCareDetails) => void;
  generateCareDetails: (plant: PlantIdentificationResult) => Promise<void>;
  addPlantToCollection: (
    plantData: Omit<PlantProfile, "id" | "dateAdded">
  ) => void;
  clearCurrentIdentification: () => void;
  setError: (error: string | null) => void;
  setLoading: (loading: boolean) => void;
  clearAllData: () => void;
};

const PLANTNET_API_KEY = "2b10AiFkzcaToQc4itaO6wd4O";
const PLANTNET_BASE_URL = "https://my-api.plantnet.org/v2/identify";

async function identifyPlantWithPlantNet(
  imageUri: string
): Promise<PlantIdentificationResult[]> {
  if (!PLANTNET_API_KEY) {
    throw new Error("PlantNet API key not configured");
  }

  const organStrategies = ["leaf", "flower", "fruit", "bark"];
  let lastError: Error | null = null;

  for (const organ of organStrategies) {
    try {
      const url = `${PLANTNET_BASE_URL}/all?api-key=${PLANTNET_API_KEY}`;

      const fileInfo = await FileSystem.getInfoAsync(imageUri);
      if (!fileInfo.exists) {
        throw new Error("Image file not found before API call");
      }

      const response = await FileSystem.uploadAsync(url, imageUri, {
        fieldName: "images",
        httpMethod: "POST",
        uploadType: FileSystem.FileSystemUploadType.MULTIPART,
        parameters: {
          organs: organ,
        },
        headers: {
          Accept: "application/json",
        },
      });

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

        if (
          data.results &&
          Array.isArray(data.results) &&
          data.results.length > 0
        ) {
          const filteredResults = data.results.filter(
            (result: PlantIdentificationResult) => result.score > 0.01
          );

          if (filteredResults.length > 0) {
            return filteredResults;
          }
        }
      } else if (response.status === 404) {
        lastError = new Error(`No plant species found with ${organ} analysis`);
        continue;
      } else {
        console.error(
          `❌ API Error for ${organ}:`,
          response.status,
          response.body
        );
        lastError = new Error(`API error ${response.status}: ${response.body}`);
        continue;
      }
    } catch (error) {
      console.error(`🚨 Error trying ${organ}:`, error);
      lastError =
        error instanceof Error
          ? error
          : new Error(`Unknown error with ${organ}`);
      continue;
    }
  }

  if (lastError?.message.includes("No plant species found")) {
    throw new Error(
      "No plants could be identified in this image. Try taking a clearer photo focusing on leaves, flowers, or other plant parts."
    );
  }

  throw new Error(
    lastError?.message || "Failed to identify plant with any detection method"
  );
}

// Enhanced default care details with comprehensive plant family recognition
function generateEnhancedDefaultCareDetails(
  plant: PlantIdentificationResult
): PlantCareDetails {
  const familyName =
    plant.species.family.scientificNameWithoutAuthor.toLowerCase();
  const scientificName =
    plant.species.scientificNameWithoutAuthor.toLowerCase();
  const commonNames =
    plant.species.commonNames?.map((name) => name.toLowerCase()) || [];

  console.log("🌿 Generating enhanced defaults for:", {
    scientific: scientificName,
    family: familyName,
    common: commonNames,
  });

  const PLANT_FAMILY_CARE: { [key: string]: Partial<PlantCareDetails> } = {
    // Succulents and Cacti
    cactaceae: {
      wateringFrequency: "Every 2-3 weeks",
      sunlightRequirement: "Direct sunlight (6+ hours)",
      humidity: "Low humidity, 30-40%",
      placement: ["South-facing window", "Sunny outdoor location"],
      commonIssues: ["Overwatering", "Root rot", "Insufficient light"],
      soilType: "Cactus/succulent potting mix",
      fertilizing: "Every 2-3 months during growing season",
      temperature: "18-26°C (65-79°F)",
      pruning: "Remove dead parts with sterilized tools",
    },
    crassulaceae: {
      wateringFrequency: "Every 1-2 weeks",
      sunlightRequirement: "Bright, direct light",
      humidity: "Low to moderate, 30-50%",
      soilType: "Succulent potting mix with extra perlite",
      commonIssues: ["Overwatering", "Soft rot", "Etiolation"],
      temperature: "16-24°C (60-75°F)",
    },

    // Aroids (Popular houseplants)
    araceae: {
      wateringFrequency: "Every 7-10 days",
      sunlightRequirement: "Bright, indirect light",
      humidity: "High humidity, 60-70%",
      placement: ["East or west-facing window", "Bright bathroom"],
      commonIssues: [
        "Low humidity",
        "Overwatering",
        "Spider mites",
        "Root rot",
      ],
      soilType: "Well-draining aroid mix with orchid bark",
      fertilizing: "Every 2-3 weeks during growing season",
      temperature: "18-26°C (65-79°F)",
      pruning: "Trim aerial roots and dead leaves",
    },

    // Ferns
    polypodiaceae: {
      wateringFrequency: "Every 3-5 days",
      sunlightRequirement: "Low to medium, indirect light",
      humidity: "High humidity, 70-80%",
      placement: ["North-facing window", "Humid bathroom", "Kitchen"],
      commonIssues: [
        "Dry air",
        "Direct sunlight",
        "Underwatering",
        "Brown tips",
      ],
      soilType: "Peat-based, moisture-retaining mix",
      pruning: "Remove brown fronds, don't cut green ones",
      temperature: "16-22°C (60-72°F)",
      fertilizing: "Monthly with diluted liquid fertilizer",
    },
    pteridaceae: {
      wateringFrequency: "Every 2-4 days",
      sunlightRequirement: "Filtered, indirect light",
      humidity: "Very high humidity, 80-90%",
      placement: ["Terrarium", "Humid greenhouse", "Near humidifier"],
      commonIssues: ["Low humidity", "Dry soil", "Temperature fluctuations"],
      soilType: "Sphagnum moss and peat mix",
    },

    // Palms
    arecaceae: {
      wateringFrequency: "Every 5-7 days",
      sunlightRequirement: "Bright, indirect light",
      humidity: "Moderate to high, 50-70%",
      placement: ["Near bright window", "Can tolerate some morning sun"],
      commonIssues: [
        "Brown leaf tips",
        "Overwatering",
        "Low humidity",
        "Scale insects",
      ],
      soilType: "Well-draining palm potting mix",
      pruning: "Only remove completely brown fronds",
      temperature: "18-24°C",
      fertilizing: "Monthly with palm-specific fertilizer",
    },

    // Orchids
    orchidaceae: {
      wateringFrequency: "Weekly, less in winter",
      wateringAmount: "Water thoroughly, allow to drain completely",
      sunlightRequirement: "Bright, indirect light",
      humidity: "High humidity, 60-80%",
      placement: ["East-facing window", "Orchid greenhouse"],
      commonIssues: ["Overwatering", "Root rot", "Low humidity", "Bud blast"],
      soilType: "Orchid bark mix with sphagnum moss",
      fertilizing: "Weekly, weakly during growing season",
      temperature: "16-26°C (60-79°F)",
      pruning: "Cut spent flower spikes above node",
    },

    // Ficus family
    moraceae: {
      wateringFrequency: "Every 7-10 days",
      sunlightRequirement: "Bright, indirect to direct light",
      placement: ["Near bright window", "Can adapt to various conditions"],
      commonIssues: [
        "Leaf drop from stress",
        "Overwatering",
        "Scale insects",
        "Sudden changes",
      ],
      pruning: "Prune to maintain shape, remove dead leaves",
      growthCharacteristics: "Fast growth rate, can become large",
      temperature: "18-26°C (65-79°F)",
      humidity: "Moderate, 40-60%",
    },

    // Bromeliads
    bromeliaceae: {
      wateringFrequency: "Every 5-7 days",
      wateringAmount: "Water into central cup and soil",
      sunlightRequirement: "Bright, indirect light",
      humidity: "High humidity, 60-70%",
      commonIssues: [
        "Low humidity",
        "Hard water damage",
        "Crown rot",
        "Scale insects",
      ],
      soilType: "Bromeliad or orchid mix",
      temperature: "18-24°C",
      fertilizing: "Monthly with diluted fertilizer",
    },

    // Prayer plants
    marantaceae: {
      wateringFrequency: "Every 5-7 days",
      sunlightRequirement: "Medium, indirect light",
      humidity: "High humidity, 60-80%",
      placement: ["East-facing window", "Away from direct sun"],
      commonIssues: [
        "Low humidity",
        "Direct sunlight",
        "Fluoride sensitivity",
        "Curling leaves",
      ],
      soilType: "Peat-based, well-draining mix",
      temperature: "18-24°C",
      pruning: "Remove dead leaves and flowers",
    },

    // Begonias
    begoniaceae: {
      wateringFrequency: "Every 5-7 days",
      sunlightRequirement: "Bright, indirect light",
      humidity: "Moderate to high, 50-70%",
      placement: ["East or north-facing window"],
      commonIssues: ["Overwatering", "Powdery mildew", "Leaf spot"],
      soilType: "Well-draining potting mix with perlite",
      temperature: "16-22°C (60-72°F)",
    },

    // Gesneriaceae (African violets, etc.)
    gesneriaceae: {
      wateringFrequency: "Every 5-7 days",
      wateringAmount: "Bottom watering preferred",
      sunlightRequirement: "Bright, indirect light",
      humidity: "Moderate, 50-60%",
      placement: ["East-facing window", "Under grow lights"],
      commonIssues: ["Crown rot", "Leaf spot from water", "Low humidity"],
      soilType: "African violet potting mix",
      temperature: "18-24°C",
    },

    // Rubber tree family additions
    euphorbiaceae: {
      wateringFrequency: "Every 7-14 days",
      sunlightRequirement: "Bright, indirect light",
      humidity: "Low to moderate, 40-50%",
      placement: ["South or west-facing window"],
      commonIssues: ["Overwatering", "Leaf drop", "Milky sap irritation"],
      soilType: "Well-draining cactus mix",
      temperature: "18-26°C (65-79°F)",
      pruning: "Wear gloves when pruning (toxic sap)",
    },

    // Dracaena family
    asparagaceae: {
      wateringFrequency: "Every 7-10 days",
      sunlightRequirement: "Medium to bright, indirect light",
      humidity: "Moderate, 40-60%",
      placement: ["Any bright location", "Tolerates lower light"],
      commonIssues: ["Brown leaf tips", "Overwatering", "Fluoride sensitivity"],
      soilType: "Well-draining potting mix",
      temperature: "18-24°C",
      fertilizing: "Monthly during growing season",
    },

    // Mint family
    lamiaceae: {
      wateringFrequency: "Every 3-5 days",
      sunlightRequirement: "Bright light, some direct sun",
      humidity: "Moderate, 50-60%",
      placement: ["South-facing window", "Kitchen windowsill"],
      commonIssues: ["Underwatering", "Aphids", "Powdery mildew"],
      soilType: "Well-draining herb potting mix",
      temperature: "16-24°C (60-75°F)",
      pruning: "Regular pinching encourages bushy growth",
    },
  };

  // Check for specific plant characteristics
  const isSucculent =
    familyName.includes("cactaceae") ||
    familyName.includes("crassulaceae") ||
    scientificName.includes("echeveria") ||
    scientificName.includes("sedum") ||
    scientificName.includes("aloe") ||
    scientificName.includes("haworthia") ||
    commonNames.some((name) => name.includes("succulent"));

  const isFern =
    familyName.includes("polypodiaceae") ||
    familyName.includes("pteridaceae") ||
    familyName.includes("dryopteridaceae") ||
    familyName.includes("aspleniaceae") ||
    commonNames.some((name) => name.includes("fern"));

  const isOrchid =
    familyName.includes("orchidaceae") ||
    commonNames.some((name) => name.includes("orchid"));

  const isPalm =
    familyName.includes("arecaceae") ||
    commonNames.some((name) => name.includes("palm"));

  const isAroid =
    familyName.includes("araceae") ||
    scientificName.includes("monstera") ||
    scientificName.includes("philodendron") ||
    scientificName.includes("pothos") ||
    scientificName.includes("epipremnum");

  // Base care details
  let careDetails: PlantCareDetails = {
    wateringFrequency: "Every 7-10 days",
    wateringAmount: "Water thoroughly until drainage",
    sunlightRequirement: "Bright, indirect light",
    temperature: "18-24°C",
    humidity: "40-60%",
    placement: ["Near a window", "Avoid direct sunlight"],
    growthCharacteristics: "Moderate growth rate",
    commonIssues: ["Overwatering", "Insufficient light"],
    soilType: "Well-draining potting mix",
    fertilizing: "Monthly during growing season",
    pruning: "Remove dead or yellowing leaves",
  };

  // Apply family-specific care if available
  const familyCare = PLANT_FAMILY_CARE[familyName];
  if (familyCare) {
    careDetails = { ...careDetails, ...familyCare };
    console.log("✅ Applied family-specific care for:", familyName);
  }

  // Apply specific plant type overrides
  if (isSucculent && !familyCare) {
    careDetails = {
      ...careDetails,
      wateringFrequency: "Every 2-3 weeks",
      sunlightRequirement: "Bright, direct light",
      humidity: "Low humidity, 30-40%",
      placement: ["South-facing window", "Sunny location"],
      commonIssues: ["Overwatering", "Root rot"],
      soilType: "Cactus/succulent potting mix",
    };
    console.log("✅ Applied succulent overrides");
  }

  if (isAroid && !familyCare) {
    careDetails = {
      ...careDetails,
      humidity: "High humidity, 60-70%",
      placement: ["Bright, indirect light location"],
      commonIssues: ["Low humidity", "Overwatering", "Spider mites"],
      soilType: "Well-draining aroid mix",
    };
    console.log("✅ Applied aroid overrides");
  }

  console.log("✅ Generated enhanced care details:", careDetails);
  return careDetails;
}

// Helper function to calculate next watering date based on frequency
function calculateNextWateringDate(
  wateringFrequency: string,
  lastWateredDate: string
): string {
  const lastWatered = new Date(lastWateredDate);
  const frequency = wateringFrequency.toLowerCase();

  let daysToAdd = 7; // default to weekly

  // Parse common watering frequency patterns
  if (frequency.includes("daily") || frequency.includes("every day")) {
    daysToAdd = 1;
  } else if (frequency.includes("every 2 days")) {
    daysToAdd = 2;
  } else if (frequency.includes("every 3 days")) {
    daysToAdd = 3;
  } else if (frequency.includes("every 5 days")) {
    daysToAdd = 5;
  } else if (
    frequency.includes("every 7 days") ||
    frequency.includes("weekly")
  ) {
    daysToAdd = 7;
  } else if (frequency.includes("every 10 days")) {
    daysToAdd = 10;
  } else if (
    frequency.includes("every 2 weeks") ||
    frequency.includes("biweekly")
  ) {
    daysToAdd = 14;
  } else if (frequency.includes("every 3 weeks")) {
    daysToAdd = 21;
  } else if (
    frequency.includes("monthly") ||
    frequency.includes("every month")
  ) {
    daysToAdd = 30;
  } else {
    // Try to extract number from patterns like "every X days"
    const match = frequency.match(/(\d+).*day/);
    if (match) {
      daysToAdd = parseInt(match[1]);
    }
  }

  const nextWatering = new Date(lastWatered);
  nextWatering.setDate(nextWatering.getDate() + daysToAdd);

  return nextWatering.toISOString();
}

export function generateDefaultCareDetails(
  plant: PlantIdentificationResult
): PlantCareDetails {
  return generateEnhancedDefaultCareDetails(plant);
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
      isFetchingCareDetails: false,
      careDataSource: null as "default" | null,
      notificationPreferences: {
        reminderTime: { hour: 9, minute: 0 }, // Default: 9:00 AM for day-of reminders
        dayBeforeTime: { hour: 20, minute: 0 }, // Default: 8:00 PM for day-before reminders
        overdueTime: { hour: 18, minute: 0 }, // Default: 6:00 PM for overdue reminders
        enableNotifications: true,
        enableDayBeforeReminders: true,
        enableOverdueReminders: true,
      } as UserNotificationPreferences,

      setCurrentImage: (uri: string): void => {
        set({ currentImageUri: uri });
      },

      generateCareDetails: async (
        plant: PlantIdentificationResult
      ): Promise<void> => {
        set({ isFetchingCareDetails: true });

        try {
          const defaultCareDetails = generateEnhancedDefaultCareDetails(plant);

          set({
            careDetails: defaultCareDetails,
            careDataSource: "default",
            isFetchingCareDetails: false,
          });
        } catch (error) {
          console.warn("Error generating care details:", error);
          const defaultCareDetails = generateEnhancedDefaultCareDetails(plant);
          set({
            careDetails: defaultCareDetails,
            careDataSource: "default",
            isFetchingCareDetails: false,
          });
        }
      },

      identifyPlant: async (imageUri: string): Promise<void> => {
        set({ isLoading: true, error: null });

        try {
          if (!imageUri) {
            throw new Error("No image provided for identification");
          }

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
        const today = new Date().toISOString();
        const nextWateringDate = calculateNextWateringDate(
          plantData.careDetails.wateringFrequency,
          today
        );

        const newPlant: PlantProfile = {
          ...plantData,
          id: `plant_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          dateAdded: today,
          nextWateringDate: nextWateringDate,
          // Don't set lastWatered initially - let it be undefined until first watering
        };

        // Schedule initial watering notifications
        if (nextWateringDate) {
          const { notificationPreferences } = get();
          notificationService
            .scheduleComprehensiveWateringReminders(
              newPlant.id,
              newPlant.name,
              new Date(nextWateringDate),
              notificationPreferences
            )
            .then((scheduledIds) => {
              console.log(
                `📱 Scheduled ${scheduledIds.length} initial reminders for new plant: ${newPlant.name}`
              );
            })
            .catch((error) => {
              console.error("Error scheduling initial reminders:", error);
            });
        }

        set((state: any) => ({
          myPlants: [...state.myPlants, newPlant],
        }));
      },

      deletePlantFromCollection: (plantId: string): void => {
        set((state: any) => {
          const plantToDelete = state.myPlants.find(
            (plant: PlantProfile) => plant.id === plantId
          );
          const updatedPlants = state.myPlants.filter(
            (plant: PlantProfile) => plant.id !== plantId
          );

          // Cancel all notifications for the deleted plant
          if (plantToDelete) {
            notificationService
              .cancelPlantNotifications(plantId)
              .then(() => {
                console.log(
                  `🗑️ Cancelled all notifications for deleted plant: ${plantToDelete.name}`
                );
              })
              .catch((error) => {
                console.error(
                  "Error cancelling notifications for deleted plant:",
                  error
                );
              });
          }

          console.log(
            "🗑️ Plant deleted from collection:",
            plantToDelete?.name || plantId
          );
          console.log("📊 Remaining plants:", updatedPlants.length);

          return {
            myPlants: updatedPlants,
          };
        });
      },

      waterPlant: (plantId: string): void => {
        set((state: any) => {
          const updatedPlants = state.myPlants.map((plant: PlantProfile) => {
            if (plant.id === plantId) {
              const today = new Date().toISOString();
              const nextWateringDate = calculateNextWateringDate(
                plant.careDetails.wateringFrequency,
                today
              );

              console.log(
                "💧 Plant watered:",
                plant.name,
                "Next watering:",
                nextWateringDate
              );

              // Schedule new watering notifications
              if (nextWateringDate) {
                const { notificationPreferences } = get();
                notificationService
                  .cancelPlantNotifications(plantId)
                  .then(() => {
                    notificationService
                      .scheduleComprehensiveWateringReminders(
                        plantId,
                        plant.name,
                        new Date(nextWateringDate),
                        notificationPreferences
                      )
                      .then((scheduledIds) => {
                        console.log(
                          `📱 Scheduled ${scheduledIds.length} reminders for ${plant.name}`
                        );
                      })
                      .catch((error) => {
                        console.error("Error scheduling reminders:", error);
                      });
                  })
                  .catch((error) => {
                    console.error("Error cancelling old notifications:", error);
                  });
              }

              return {
                ...plant,
                lastWatered: today,
                nextWateringDate: nextWateringDate,
              };
            }
            return plant;
          });

          return {
            myPlants: updatedPlants,
          };
        });
      },

      updatePlant: (plantId: string, updates: Partial<PlantProfile>): void => {
        set((state: any) => {
          const updatedPlants = state.myPlants.map((plant: PlantProfile) => {
            if (plant.id === plantId) {
              const updatedPlant = {
                ...plant,
                ...updates,
              };

              // Check if watering frequency was changed
              const wateringFrequencyChanged =
                updates.careDetails?.wateringFrequency &&
                updates.careDetails.wateringFrequency !==
                  plant.careDetails.wateringFrequency;

              // If watering frequency changed, recalculate next watering date and update notifications
              if (wateringFrequencyChanged) {
                const lastWateredDate =
                  plant.lastWatered || new Date().toISOString();
                const newNextWateringDate = calculateNextWateringDate(
                  updatedPlant.careDetails.wateringFrequency,
                  lastWateredDate
                );

                updatedPlant.nextWateringDate = newNextWateringDate;

                console.log(
                  `📅 Watering frequency changed for ${plant.name}: ${plant.careDetails.wateringFrequency} → ${updatedPlant.careDetails.wateringFrequency}`
                );
                console.log(
                  `🗓️ New next watering date: ${newNextWateringDate}`
                );

                // Cancel old notifications and schedule new ones
                if (newNextWateringDate) {
                  const { notificationPreferences } = get();
                  notificationService
                    .cancelPlantNotifications(plantId)
                    .then(() => {
                      notificationService
                        .scheduleComprehensiveWateringReminders(
                          plantId,
                          updatedPlant.name,
                          new Date(newNextWateringDate),
                          notificationPreferences
                        )
                        .then((scheduledIds) => {
                          console.log(
                            `📱 Rescheduled ${scheduledIds.length} reminders for ${updatedPlant.name} with new frequency`
                          );
                        })
                        .catch((error) => {
                          console.error(
                            "Error rescheduling reminders after frequency change:",
                            error
                          );
                        });
                    })
                    .catch((error) => {
                      console.error(
                        "Error cancelling old notifications during frequency change:",
                        error
                      );
                    });
                }
              }

              return updatedPlant;
            }
            return plant;
          });

          return {
            myPlants: updatedPlants,
          };
        });
      },

      updatePlantWateringSchedule: (
        plantId: string,
        lastWatered: string,
        nextWateringDate: string
      ): void => {
        set((state: any) => {
          const updatedPlants = state.myPlants.map((plant: PlantProfile) => {
            if (plant.id === plantId) {
              return {
                ...plant,
                lastWatered,
                nextWateringDate,
              };
            }
            return plant;
          });

          return {
            myPlants: updatedPlants,
          };
        });
      },

      updateNotificationPreferences: (
        preferences: Partial<UserNotificationPreferences>
      ): void => {
        set((state: any) => ({
          notificationPreferences: {
            ...state.notificationPreferences,
            ...preferences,
          },
        }));

        console.log("🔔 Notification preferences updated:", preferences);

        // Reschedule all plant notifications with new times
        const { myPlants } = get();
        myPlants.forEach((plant) => {
          if (plant.nextWateringDate) {
            notificationService
              .cancelPlantNotifications(plant.id)
              .then(() => {
                const updatedPrefs = {
                  ...get().notificationPreferences,
                  ...preferences,
                };
                notificationService
                  .scheduleComprehensiveWateringReminders(
                    plant.id,
                    plant.name,
                    new Date(plant.nextWateringDate!),
                    updatedPrefs
                  )
                  .then((scheduledIds) => {
                    console.log(
                      `📱 Rescheduled ${scheduledIds.length} reminders for ${plant.name} with new times`
                    );
                  })
                  .catch((error) => {
                    console.error("Error rescheduling with new times:", error);
                  });
              })
              .catch((error) => {
                console.error(
                  "Error cancelling notifications for time update:",
                  error
                );
              });
          }
        });
      },

      clearCurrentIdentification: (): void => {
        set({
          currentImageUri: null,
          identificationResults: [],
          selectedPlant: null,
          careDetails: null,
          error: null,
          isLoading: false,
          isFetchingCareDetails: false,
          careDataSource: null,
        });
      },

      setError: (error: string | null): void => {
        set({ error });
      },

      setLoading: (loading: boolean): void => {
        set({ isLoading: loading });
      },

      clearAllData: (): void => {
        set((state: any) => {
          // Cancel all notifications for all plants
          state.myPlants.forEach((plant: PlantProfile) => {
            notificationService
              .cancelPlantNotifications(plant.id)
              .then(() => {
                console.log(
                  `🗑️ Cancelled all notifications for plant: ${plant.name}`
                );
              })
              .catch((error) => {
                console.error(
                  "Error cancelling notifications for plant:",
                  error
                );
              });
          });

          console.log("🗑️ Clearing all plant data and resetting store");

          return {
            currentImageUri: null,
            identificationResults: [],
            selectedPlant: null,
            careDetails: null,
            error: null,
            isLoading: false,
            isFetchingCareDetails: false,
            careDataSource: null,
            myPlants: [],
            notificationPreferences: {
              reminderTime: { hour: 9, minute: 0 },
              dayBeforeTime: { hour: 18, minute: 0 },
              overdueTime: { hour: 10, minute: 0 },
              enableNotifications: true,
              enableDayBeforeReminders: true,
              enableOverdueReminders: true,
            },
          };
        });
      },
    }),
    {
      name: "plantly-identification-store",
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state: PlantIdentificationStore) => ({
        myPlants: state.myPlants,
        notificationPreferences: state.notificationPreferences,
      }),
    }
  )
);
