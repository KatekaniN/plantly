import React, { useState, useEffect } from "react";
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  Image,
  Dimensions,
  Alert,
  Share,
  StatusBar,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { FontAwesome } from "@expo/vector-icons";
import FontAwesome6 from "@expo/vector-icons/FontAwesome6";
import Entypo from "@expo/vector-icons/Entypo";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { theme } from "../../theme";
import { usePlantIdentificationStore } from "@/store/plantIdentification";
import type { PlantProfile } from "@/store/plantIdentification";
import notificationService from "@/services/notificationService";

const { width: screenWidth } = Dimensions.get("window");

interface CareDetailItemProps {
  icon: string;
  label: string;
  value: string;
  onEdit?: () => void;
}

const CareDetailItem: React.FC<CareDetailItemProps> = ({
  icon,
  label,
  value,
  onEdit,
}) => (
  <View style={styles.careDetailItem}>
    <View style={styles.careDetailHeader}>
      <FontAwesome6
        name={icon as any}
        size={16}
        color={theme.colorLeafyGreen}
      />
      <Text style={styles.careDetailLabel}>{label}</Text>
      {onEdit && (
        <TouchableOpacity onPress={onEdit} style={styles.editButton}>
          <FontAwesome6 name="edit" size={14} color={theme.colorGrey} />
        </TouchableOpacity>
      )}
    </View>
    <Text style={styles.careDetailValue}>{value}</Text>
  </View>
);

interface ActionButtonProps {
  icon: string;
  label: string;
  onPress: () => void;
  color?: string;
  backgroundColor?: string;
}

const ActionButton: React.FC<ActionButtonProps> = ({
  icon,
  label,
  onPress,
  color = theme.colorLeafyGreen,
  backgroundColor = theme.colorLeafyGreen + "20",
}) => (
  <TouchableOpacity
    style={[styles.actionButton, { backgroundColor }]}
    onPress={onPress}
    activeOpacity={0.7}
  >
    <FontAwesome6 name={icon as any} size={20} color={color} />
    <Text style={[styles.actionButtonText, { color }]}>{label}</Text>
  </TouchableOpacity>
);

export default function PlantDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const { myPlants, deletePlantFromCollection, waterPlant } =
    usePlantIdentificationStore();
  const insets = useSafeAreaInsets();

  const [plant, setPlant] = useState<PlantProfile | null>(null);
  const [imageError, setImageError] = useState(false);

  useEffect(() => {
    const foundPlant = myPlants.find((p) => p.id === id);
    if (foundPlant) {
      setPlant(foundPlant);
    } else {
      // Plant not found, go back
      Alert.alert(
        "Plant Not Found",
        "This plant could not be found in your collection.",
        [
          {
            text: "OK",
            onPress: () => router.back(),
          },
        ]
      );
    }
  }, [id, myPlants]);

  // Update plant state when myPlants changes (e.g., after watering)
  useEffect(() => {
    if (plant) {
      const updatedPlant = myPlants.find((p) => p.id === plant.id);
      if (updatedPlant) {
        setPlant(updatedPlant);
      }
    }
  }, [myPlants, plant?.id]);

  if (!plant) {
    return (
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />
        <View style={styles.loadingContainer}>
          <FontAwesome6 name="seedling" size={50} color={theme.colorGrey} />
          <Text style={styles.loadingText}>Loading plant details...</Text>
        </View>
      </View>
    );
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const formatConfidenceScore = (score: number): string => {
    return `${Math.round(score * 100)}%`;
  };

  const handleWaterPlant = () => {
    Alert.alert("Water Plant", `Mark "${plant.name}" as watered today?`, [
      {
        text: "Cancel",
        style: "cancel",
      },
      {
        text: "Water",
        onPress: () => {
          waterPlant(plant.id);
          console.log("🚿 Plant watered:", plant.name);
          Alert.alert("Success", `${plant.name} has been watered! 💧`);

          // Update local plant state to reflect changes immediately
          const updatedPlant = myPlants.find((p) => p.id === plant.id);
          if (updatedPlant) {
            setPlant(updatedPlant);
          }
        },
      },
    ]);
  };

  const handleEditPlant = () => {
    // TODO: Navigate to edit screen
    console.log("✏️ Edit plant:", plant.name);
    Alert.alert("Coming Soon", "Plant editing feature will be available soon!");
  };

  const handleSharePlant = async () => {
    try {
      const result = await Share.share({
        message: `Check out my ${plant.name} (${plant.identification.species.scientificNameWithoutAuthor})! 🌱`,
        title: `My ${plant.name}`,
      });
    } catch (error) {
      console.error("Error sharing:", error);
    }
  };

  const handleTestNotification = () => {
    Alert.alert(
      "Test Notifications",
      "Choose notification test type:",
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Immediate",
          onPress: () => {
            notificationService.sendTestNotification(plant.name);
            Alert.alert("Success", "Immediate test notification sent! 📱");
          },
        },
        {
          text: "Quick Schedule (1-3 mins)",
          onPress: () => {
            // Schedule notifications for 1, 2, and 3 minutes from now
            const now = new Date();
            
            // 1 minute from now
            const oneMinute = new Date(now.getTime() + 1 * 60 * 1000);
            // 2 minutes from now  
            const twoMinutes = new Date(now.getTime() + 2 * 60 * 1000);
            // 3 minutes from now
            const threeMinutes = new Date(now.getTime() + 3 * 60 * 1000);
            
            notificationService.scheduleWateringReminder(
              plant.id + '_test1',
              plant.name,
              oneMinute,
              `test-1min-${Date.now()}`
            );
            
            notificationService.scheduleWateringReminder(
              plant.id + '_test2', 
              plant.name,
              twoMinutes,
              `test-2min-${Date.now()}`
            );
            
            notificationService.scheduleWateringReminder(
              plant.id + '_test3',
              plant.name, 
              threeMinutes,
              `test-3min-${Date.now()}`
            );
            
            Alert.alert(
              "Success", 
              "Test notifications scheduled for 1, 2, and 3 minutes from now! 📱⏰"
            );
          },
        },
      ]
    );
  };

  const handleDeletePlant = () => {
    Alert.alert(
      "Delete Plant",
      `Are you sure you want to remove "${plant.name}" from your collection? This action cannot be undone.`,
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => {
            deletePlantFromCollection(plant.id);
            router.back();
            setTimeout(() => {
              Alert.alert(
                "Plant Deleted",
                `"${plant.name}" has been removed from your collection.`
              );
            }, 500);
          },
        },
      ]
    );
  };

  const getNextWateringInfo = () => {
    if (!plant.nextWateringDate) return null;

    const today = new Date();
    const nextWatering = new Date(plant.nextWateringDate);
    const diffTime = nextWatering.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 0) {
      return {
        text: `${Math.abs(diffDays)} days overdue`,
        color: "#f44336",
        urgent: true,
        icon: "exclamation-triangle",
      };
    } else if (diffDays === 0) {
      return {
        text: "Water today",
        color: "#ff9800",
        urgent: true,
        icon: "droplet",
      };
    } else if (diffDays === 1) {
      return {
        text: "Water tomorrow",
        color: "#ff9800",
        urgent: false,
        icon: "clock",
      };
    } else {
      return {
        text: `Water in ${diffDays} days`,
        color: theme.colorLeafyGreen,
        urgent: false,
        icon: "calendar",
      };
    }
  };

  const wateringInfo = getNextWateringInfo();

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <FontAwesome6
            name="arrow-left"
            size={22}
            color={theme.colorLeafyGreen}
          />
        </TouchableOpacity>
        {/*<Text style={styles.headerTitle} numberOfLines={1}>
          {plant.name}
        </Text>*/}
        <TouchableOpacity style={styles.shareButton} onPress={handleSharePlant}>
          <Entypo
            name="share-alternative"
            size={22}
            color={theme.colorLeafyGreen}
          />
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={{ paddingBottom: insets.bottom + 20 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Plant Image */}
        <View style={styles.imageContainer}>
          {!imageError ? (
            <Image
              source={{ uri: plant.imageUri }}
              style={styles.plantImage}
              onError={() => setImageError(true)}
            />
          ) : (
            <View style={styles.placeholderImage}>
              <FontAwesome6 name="seedling" size={80} color={theme.colorGrey} />
              <Text style={styles.placeholderText}>Image not available</Text>
            </View>
          )}
        </View>

        {/* Plant Info */}
        <View style={styles.plantInfoContainer}>
          <Text style={styles.plantName}>{plant.name}</Text>
          <Text style={styles.scientificName}>
            {plant.identification.species.scientificNameWithoutAuthor}
          </Text>

          <View style={styles.metaInfo}>
            <View style={styles.metaItem}>
              <FontAwesome6
                name="microscope"
                size={14}
                color={theme.colorGrey}
              />
              <Text style={styles.metaText}>
                {formatConfidenceScore(plant.identification.score)} match
              </Text>
            </View>

            {plant.location && (
              <View style={styles.metaItem}>
                <FontAwesome6
                  name="location-dot"
                  size={16}
                  color={theme.colorGrey}
                />
                <Text style={styles.metaText}>{plant.location}</Text>
              </View>
            )}

            <View style={styles.metaItem}>
              <FontAwesome6
                name="calendar-plus"
                size={16}
                color={theme.colorGrey}
              />
              <Text style={styles.metaText}>
                Added {formatDate(plant.dateAdded)}
              </Text>
            </View>

            <View style={styles.metaItem}>
              <FontAwesome6
                name="droplet"
                size={16}
                color={
                  plant.lastWatered ? theme.colorLeafyGreen : theme.colorGrey
                }
              />
              <Text style={styles.metaText}>
                {plant.lastWatered
                  ? `Last watered ${formatDate(plant.lastWatered)}`
                  : "Never watered"}
              </Text>
            </View>
          </View>

          {/* Taxonomy */}
          <View style={styles.taxonomyContainer}>
            <Text style={styles.taxonomyTitle}>Plant Classification</Text>
            <View style={styles.taxonomyGrid}>
              <View style={styles.taxonomyItem}>
                <Text style={styles.taxonomyLabel}>Family</Text>
                <Text style={styles.taxonomyValue}>
                  {
                    plant.identification.species.family
                      .scientificNameWithoutAuthor
                  }
                </Text>
              </View>
              <View style={styles.taxonomyItem}>
                <Text style={styles.taxonomyLabel}>Genus</Text>
                <Text style={styles.taxonomyValue}>
                  {
                    plant.identification.species.genus
                      .scientificNameWithoutAuthor
                  }
                </Text>
              </View>
            </View>

            {plant.identification.species.commonNames.length > 0 && (
              <View style={styles.commonNamesContainer}>
                <Text style={styles.taxonomyLabel}>Common Names</Text>
                <Text style={styles.commonNamesText}>
                  {plant.identification.species.commonNames.join(", ")}
                </Text>
              </View>
            )}
          </View>
        </View>

        {/* Watering Status */}
        {wateringInfo && (
          <View
            style={[
              styles.wateringStatusContainer,
              { backgroundColor: wateringInfo.color + "15" },
            ]}
          >
            <FontAwesome6
              name={wateringInfo.icon as any}
              size={24}
              color={wateringInfo.color}
            />
            <View style={styles.wateringStatusText}>
              <Text
                style={[
                  styles.wateringStatusTitle,
                  { color: wateringInfo.color },
                ]}
              >
                {wateringInfo.text}
              </Text>
              <Text style={styles.wateringStatusSubtitle}>
                Based on {plant.careDetails.wateringFrequency.toLowerCase()}{" "}
                schedule
              </Text>
            </View>
          </View>
        )}

        {/* Action Buttons */}
        <View style={styles.actionButtonsContainer}>
          <ActionButton
            icon="droplet"
            label="Water Plant"
            onPress={handleWaterPlant}
            color={theme.colorWhite}
            backgroundColor="#2196F3"
          />
          <ActionButton
            icon="edit"
            label="Edit Details"
            onPress={handleEditPlant}
          />
          <ActionButton
            icon="calendar"
            label="View Scheduled"
            onPress={async () => {
              const scheduled = await notificationService.getScheduledNotifications();
              const plantNotifications = scheduled.filter(n => {
                const data = n.content.data as any;
                return data?.plantId === plant.id;
              });
              
              Alert.alert(
                "Scheduled Notifications",
                plantNotifications.length > 0 
                  ? `${plantNotifications.length} notifications scheduled for ${plant.name}`
                  : `No notifications scheduled for ${plant.name}`,
                [{ text: "OK" }]
              );
            }}
          />
        </View>

        {/* Care Details */}
        <View style={styles.careDetailsContainer}>
          <Text style={styles.sectionTitle}>Care Instructions</Text>

          <CareDetailItem
            icon="droplet"
            label="Watering"
            value={`${plant.careDetails.wateringFrequency} - ${plant.careDetails.wateringAmount}`}
          />

          <CareDetailItem
            icon="sun"
            label="Sunlight"
            value={plant.careDetails.sunlightRequirement}
          />

          <CareDetailItem
            icon="thermometer-half"
            label="Temperature"
            value={plant.careDetails.temperature}
          />

          <CareDetailItem
            icon="wind"
            label="Humidity"
            value={plant.careDetails.humidity}
          />

          <CareDetailItem
            icon="seedling"
            label="Soil Type"
            value={plant.careDetails.soilType}
          />

          <CareDetailItem
            icon="leaf"
            label="Fertilizing"
            value={plant.careDetails.fertilizing}
          />

          <CareDetailItem
            icon="scissors"
            label="Pruning"
            value={plant.careDetails.pruning}
          />

          <CareDetailItem
            icon="chart-line"
            label="Growth"
            value={plant.careDetails.growthCharacteristics}
          />
        </View>

        {/* Placement Tips */}
        {plant.careDetails.placement.length > 0 && (
          <View style={styles.placementContainer}>
            <Text style={styles.sectionTitle}>Placement Tips</Text>
            {plant.careDetails.placement.map((tip, index) => (
              <View key={index} style={styles.tipItem}>
                <FontAwesome6
                  name="lightbulb"
                  size={14}
                  color={theme.colorLeafyGreen}
                />
                <Text style={styles.tipText}>{tip}</Text>
              </View>
            ))}
          </View>
        )}

        {/* Common Issues */}
        {plant.careDetails.commonIssues.length > 0 && (
          <View style={styles.issuesContainer}>
            <Text style={styles.sectionTitle}>Common Issues</Text>
            {plant.careDetails.commonIssues.map((issue, index) => (
              <View key={index} style={styles.issueItem}>
                <FontAwesome
                  name="exclamation-triangle"
                  size={14}
                  color="#ff9800"
                />
                <Text style={styles.issueText}>{issue}</Text>
              </View>
            ))}
          </View>
        )}

        {/* Notes */}
        {plant.notes && (
          <View style={styles.notesContainer}>
            <Text style={styles.sectionTitle}>Notes</Text>
            <Text style={styles.notesText}>{plant.notes}</Text>
          </View>
        )}

        {/* Action Buttons */}
        <View style={styles.actionButtonsContainer}>
          <TouchableOpacity
            style={styles.waterButton}
            onPress={handleWaterPlant}
          >
            <FontAwesome6 name="droplet" size={16} color={theme.colorWhite} />
            <Text style={styles.waterButtonText}>Water Plant</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.testButton}
            onPress={handleTestNotification}
          >
            <FontAwesome6 name="bell" size={16} color={theme.colorLeafyGreen} />
            <Text style={styles.testButtonText}>Test Notification</Text>
          </TouchableOpacity>
        </View>

        {/* Delete Button */}
        <TouchableOpacity
          style={styles.deleteButton}
          onPress={handleDeletePlant}
        >
          <FontAwesome6 name="trash" size={16} color={theme.colorWhite} />
          <Text style={styles.deleteButtonText}>Remove from Collection</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colorWhite,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  backButton: {
    padding: 8,
    borderRadius: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: theme.colorLeafyGreen,
    flex: 1,
    textAlign: "center",
    marginHorizontal: 16,
  },
  shareButton: {
    padding: 8,
    borderRadius: 8,
  },
  scrollView: {
    flex: 1,
  },
  imageContainer: {
    height: 300,
    backgroundColor: "#f8f9fa",
  },
  plantImage: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
  },
  placeholderImage: {
    width: "100%",
    height: "100%",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f0f0f0",
  },
  placeholderText: {
    fontSize: 16,
    color: theme.colorGrey,
    marginTop: 12,
  },
  plantInfoContainer: {
    padding: 20,
    backgroundColor: theme.colorWhite,
  },
  plantName: {
    fontSize: 28,
    fontWeight: "700",
    color: theme.colorLeafyGreen,
    marginBottom: 8,
  },
  scientificName: {
    fontSize: 18,
    fontStyle: "italic",
    color: theme.colorGrey,
    marginBottom: 16,
  },
  metaInfo: {
    marginBottom: 20,
  },
  metaItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  metaText: {
    fontSize: 14,
    color: theme.colorGrey,
    marginLeft: 8,
  },
  taxonomyContainer: {
    backgroundColor: "#f8f9fa",
    padding: 16,
    borderRadius: 12,
  },
  taxonomyTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: theme.colorLeafyGreen,
    marginBottom: 12,
  },
  taxonomyGrid: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  taxonomyItem: {
    flex: 1,
  },
  taxonomyLabel: {
    fontSize: 12,
    color: theme.colorGrey,
    marginBottom: 4,
  },
  taxonomyValue: {
    fontSize: 14,
    fontWeight: "500",
    color: theme.colorLeafyGreen,
  },
  commonNamesContainer: {
    marginTop: 8,
  },
  commonNamesText: {
    fontSize: 14,
    color: theme.colorLeafyGreen,
    fontWeight: "500",
  },
  wateringStatusContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginHorizontal: 20,
    marginBottom: 20,
    padding: 16,
    borderRadius: 12,
  },
  wateringStatusText: {
    marginLeft: 16,
    flex: 1,
  },
  wateringStatusTitle: {
    fontSize: 16,
    fontWeight: "600",
  },
  wateringStatusSubtitle: {
    fontSize: 14,
    color: theme.colorGrey,
    marginTop: 2,
  },
  actionButtonsContainer: {
    flexDirection: "row",
    paddingHorizontal: 20,
    marginBottom: 20,
    gap: 12,
  },
  actionButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    borderRadius: 8,
  },
  actionButtonText: {
    fontSize: 14,
    fontWeight: "600",
    marginLeft: 8,
  },
  careDetailsContainer: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: theme.colorLeafyGreen,
    marginBottom: 16,
  },
  careDetailItem: {
    backgroundColor: "#f8f9fa",
    padding: 16,
    borderRadius: 8,
    marginBottom: 12,
  },
  careDetailHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  careDetailLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: theme.colorLeafyGreen,
    marginLeft: 8,
    flex: 1,
  },
  editButton: {
    padding: 4,
  },
  careDetailValue: {
    fontSize: 14,
    color: theme.colorGrey,
    lineHeight: 20,
  },
  placementContainer: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  tipItem: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 8,
  },
  tipText: {
    fontSize: 14,
    color: theme.colorGrey,
    marginLeft: 12,
    flex: 1,
    lineHeight: 20,
  },
  issuesContainer: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  issueItem: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 8,
  },
  issueText: {
    fontSize: 14,
    color: theme.colorGrey,
    marginLeft: 12,
    flex: 1,
    lineHeight: 20,
  },
  notesContainer: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  notesText: {
    fontSize: 14,
    color: theme.colorGrey,
    lineHeight: 22,
    backgroundColor: "#f8f9fa",
    padding: 16,
    borderRadius: 8,
  },
  deleteButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginHorizontal: 20,
    paddingVertical: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "rgba(176, 174, 174, 0.8)",
    backgroundColor: "rgba(122, 118, 118, 0.8)",
  },
  deleteButtonText: {
    fontSize: 16,
    color: theme.colorWhite,
    fontWeight: "600",
    marginLeft: 8,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    fontSize: 16,
    color: theme.colorGrey,
    marginTop: 16,
  },
  waterButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 16,
    borderRadius: 8,
    backgroundColor: theme.colorLeafyGreen,
  },
  waterButtonText: {
    fontSize: 16,
    color: theme.colorWhite,
    fontWeight: "600",
    marginLeft: 8,
  },
  testButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: theme.colorLeafyGreen,
    backgroundColor: theme.colorWhite,
  },
  testButtonText: {
    fontSize: 16,
    color: theme.colorLeafyGreen,
    fontWeight: "600",
    marginLeft: 8,
  },
  bottomSpacing: {
    height: 40,
  },
});
