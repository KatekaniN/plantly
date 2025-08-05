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
import { useTheme } from "@/contexts/ThemeContext";
import { usePlantIdentificationStore } from "@/store/plantIdentification";
import type { PlantProfile } from "@/store/plantIdentification";
import notificationService from "@/services/notificationService";

const { width: screenWidth } = Dimensions.get("window");

interface CareDetailItemProps {
  icon: string;
  label: string;
  value: string;
  onEdit?: () => void;
  currentTheme: any;
}

const CareDetailItem: React.FC<CareDetailItemProps> = ({
  icon,
  label,
  value,
  onEdit,
  currentTheme,
}) => (
  <View
    style={[
      styles.careDetailItem,
      { backgroundColor: currentTheme.colorSurface },
    ]}
  >
    <View style={styles.careDetailHeader}>
      <FontAwesome6
        name={icon as any}
        size={16}
        color={currentTheme.colorLeafyGreen}
      />
      <Text style={[styles.careDetailLabel, { color: currentTheme.colorText }]}>
        {label}
      </Text>
      {onEdit && (
        <TouchableOpacity onPress={onEdit} style={styles.editButton}>
          <FontAwesome6
            name="edit"
            size={14}
            color={currentTheme.colorTextSecondary}
          />
        </TouchableOpacity>
      )}
    </View>
    <Text
      style={[
        styles.careDetailValue,
        { color: currentTheme.colorTextSecondary },
      ]}
    >
      {value}
    </Text>
  </View>
);

interface ActionButtonProps {
  icon: string;
  label: string;
  onPress: () => void;
  color?: string;
  paddingHorizontal?: number;
  backgroundColor?: string;
  borderColor?: string;
  borderWidth?: number;
  currentTheme: any;
}

const ActionButton: React.FC<ActionButtonProps> = ({
  icon,
  label,
  onPress,
  color,
  backgroundColor,
  borderColor,
  paddingHorizontal,
  borderWidth = 1,
  currentTheme,
}) => (
  <TouchableOpacity
    style={[
      styles.actionButton,
      {
        backgroundColor: backgroundColor || currentTheme.colorLeafyGreen + "20",
        paddingHorizontal,
        ...(borderColor && { borderColor, borderWidth }),
      },
    ]}
    onPress={onPress}
    activeOpacity={0.7}
  >
    <FontAwesome6
      name={icon as any}
      size={20}
      color={color || currentTheme.colorLeafyGreen}
    />
    <Text
      style={[
        styles.actionButtonText,
        { color: color || currentTheme.colorLeafyGreen },
      ]}
    >
      {label}
    </Text>
  </TouchableOpacity>
);

export default function PlantDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const { theme: currentTheme, isDark } = useTheme();
  const { myPlants, deletePlantFromCollection, waterPlant, updatePlant } =
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
      <View
        style={[
          styles.container,
          {
            paddingTop: insets.top,
            backgroundColor: currentTheme.colorBackground,
          },
        ]}
      >
        <StatusBar
          barStyle={isDark ? "light-content" : "dark-content"}
          backgroundColor={currentTheme.colorBackground}
        />
        <View style={styles.loadingContainer}>
          <FontAwesome6
            name="seedling"
            size={50}
            color={currentTheme.colorTextSecondary}
          />
          <Text style={[styles.loadingText, { color: currentTheme.colorText }]}>
            Loading plant details...
          </Text>
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
    router.push(`/edit-plant/${plant.id}`);
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
    } /*else if (diffDays === 0) {
      return {
        text: "Water today",
        color: "#ff9800",
        urgent: true,
        icon: "droplet",
      };*/ else if (diffDays === 1) {
      return {
        text: "Water tomorrow",
        greenColor: theme.colorLeafyGreen,
        whiteColor: theme.colorWhite,
        urgent: false,
        icon: "clock",
      };
    } else {
      return {
        text: `Water in ${diffDays} days`,
        greenColor: theme.colorLeafyGreen,
        whiteColor: theme.colorWhite,
        urgent: false,
        icon: "calendar",
      };
    }
  };

  const wateringInfo = getNextWateringInfo();

  return (
    <View
      style={[
        styles.container,
        {
          paddingTop: insets.top,
          backgroundColor: currentTheme.colorBackground,
        },
      ]}
    >
      <StatusBar
        barStyle={isDark ? "light-content" : "dark-content"}
        backgroundColor={currentTheme.colorBackground}
      />

      {/* Header */}
      <View
        style={[
          styles.header,
          { backgroundColor: currentTheme.colorBackground },
        ]}
      >
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <FontAwesome6
            name="arrow-left"
            size={22}
            color={currentTheme.colorLeafyGreen}
          />
        </TouchableOpacity>
        {/*<Text style={styles.headerTitle} numberOfLines={1}>
          {plant.name}
        </Text>*/}
        <TouchableOpacity style={styles.shareButton} onPress={handleSharePlant}>
          <Entypo
            name="share-alternative"
            size={22}
            color={currentTheme.colorLeafyGreen}
          />
        </TouchableOpacity>
      </View>

      <ScrollView
        style={[
          styles.scrollView,
          { backgroundColor: currentTheme.colorBackground },
        ]}
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
            <View
              style={[
                styles.placeholderImage,
                { backgroundColor: currentTheme.colorSurface },
              ]}
            >
              <FontAwesome6
                name="seedling"
                size={80}
                color={currentTheme.colorTextSecondary}
              />
              <Text
                style={[
                  styles.placeholderText,
                  { color: currentTheme.colorTextSecondary },
                ]}
              >
                Image not available
              </Text>
            </View>
          )}
        </View>

        {/* Plant Info */}
        <View
          style={[
            styles.plantInfoContainer,
            { backgroundColor: currentTheme.colorBackground },
          ]}
        >
          <Text style={[styles.plantName, { color: currentTheme.colorText }]}>
            {plant.name}
          </Text>
          <Text
            style={[
              styles.commonNamesText,
              { color: currentTheme.colorTextSecondary },
            ]}
          >
            {plant.identification.species.commonNames.length > 0 && (
              <Text
                style={[
                  styles.scientificName,
                  { color: currentTheme.colorTextSecondary },
                ]}
              >
                {plant.identification.species.commonNames.slice(0, 1)}
              </Text>
            )}
            {plant.identification.species.commonNames.length > 0 && "  "}(
            {plant.identification.species.scientificNameWithoutAuthor}){"\n"}
          </Text>

          <View style={styles.metaInfo}>
            {/*<View style={styles.metaItem}>
              <FontAwesome6
                name="microscope"
                size={14}
                color={theme.colorLeafyGreen}
              />
              <Text style={styles.metaText}>
                {formatConfidenceScore(plant.identification.score)} match
              </Text>
            </View>*/}

            {plant.location && (
              <View
                style={[
                  styles.metaItem,
                  { backgroundColor: currentTheme.colorSurface },
                ]}
              >
                <FontAwesome6
                  name="location-dot"
                  size={16}
                  color={currentTheme.colorLeafyGreen}
                />
                <Text
                  style={[
                    styles.metaText,
                    { color: currentTheme.colorTextSecondary },
                  ]}
                >
                  {plant.location}
                </Text>
              </View>
            )}

            <View
              style={[
                styles.metaItem,
                { backgroundColor: currentTheme.colorSurface },
              ]}
            >
              <FontAwesome6
                name="calendar-plus"
                size={16}
                color={currentTheme.colorLeafyGreen}
              />
              <Text
                style={[
                  styles.metaText,
                  { color: currentTheme.colorTextSecondary },
                ]}
              >
                Added {formatDate(plant.dateAdded)}
              </Text>
            </View>

            <View
              style={[
                styles.metaItem,
                { backgroundColor: currentTheme.colorSurface },
              ]}
            >
              <FontAwesome6
                name="droplet"
                size={16}
                color={
                  plant.lastWatered
                    ? currentTheme.colorLeafyGreen
                    : currentTheme.colorTextSecondary
                }
              />
              <Text
                style={[
                  styles.metaText,
                  { color: currentTheme.colorTextSecondary },
                ]}
              >
                {plant.lastWatered
                  ? `Last watered ${formatDate(plant.lastWatered)}`
                  : "Never watered"}
              </Text>
            </View>
          </View>

          {/* Taxonomy 
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
        </View>*/}
        </View>

        {/* Watering Status */}
        {wateringInfo && (
          <View
            style={[
              styles.wateringStatusContainer,
              { backgroundColor: wateringInfo.greenColor },
            ]}
          >
            <FontAwesome6
              name={wateringInfo.icon as any}
              size={24}
              color={wateringInfo.whiteColor}
            />
            <View style={styles.wateringStatusText}>
              <Text
                style={[
                  styles.wateringStatusTitle,
                  { color: wateringInfo.whiteColor },
                ]}
              >
                {wateringInfo.text}
              </Text>
              <Text
                style={[
                  styles.wateringStatusSubtitle,
                  { color: wateringInfo.whiteColor },
                ]}
              >
                Based on {plant.careDetails.wateringFrequency.toLowerCase()}{" "}
                schedule
              </Text>
            </View>
          </View>
        )}

        {/* Action Buttons */}
        <View style={styles.actionButtonsContainer}>
          <ActionButton
            icon="edit"
            label="Edit Details"
            color={currentTheme.colorLeafyGreen}
            borderColor={currentTheme.colorLeafyGreen}
            borderWidth={1}
            backgroundColor={currentTheme.colorBackground}
            currentTheme={currentTheme}
            onPress={handleEditPlant}
          />
          {/* Delete Button */}
          <TouchableOpacity
            style={[
              styles.deleteButton,
              { backgroundColor: currentTheme.colorError },
            ]}
            onPress={handleDeletePlant}
          >
            <FontAwesome6
              name="trash"
              size={16}
              color={currentTheme.colorTextInverse}
            />
            <Text
              style={[
                styles.deleteButtonText,
                { color: currentTheme.colorTextInverse },
              ]}
            >
              Delete Plant
            </Text>
          </TouchableOpacity>
        </View>

        {/* Care Details */}
        <View
          style={[
            styles.careDetailsContainer,
            { backgroundColor: currentTheme.colorBackground },
          ]}
        >
          <Text
            style={[styles.sectionTitle, { color: currentTheme.colorText }]}
          >
            Care Instructions
          </Text>

          <CareDetailItem
            icon="droplet"
            label="Watering"
            value={`${plant.careDetails.wateringFrequency} - ${plant.careDetails.wateringAmount}`}
            currentTheme={currentTheme}
          />

          <CareDetailItem
            icon="sun"
            label="Sunlight"
            value={plant.careDetails.sunlightRequirement}
            currentTheme={currentTheme}
          />

          <CareDetailItem
            icon="thermometer"
            label="Temperature"
            value={plant.careDetails.temperature}
            currentTheme={currentTheme}
          />

          <CareDetailItem
            icon="wind"
            label="Humidity"
            value={plant.careDetails.humidity}
            currentTheme={currentTheme}
          />

          <CareDetailItem
            icon="seedling"
            label="Soil Type"
            value={plant.careDetails.soilType}
            currentTheme={currentTheme}
          />

          <CareDetailItem
            icon="leaf"
            label="Fertilizing"
            value={plant.careDetails.fertilizing}
            currentTheme={currentTheme}
          />

          <CareDetailItem
            icon="scissors"
            label="Pruning"
            value={plant.careDetails.pruning}
            currentTheme={currentTheme}
          />

          <CareDetailItem
            icon="chart-line"
            label="Growth"
            value={plant.careDetails.growthCharacteristics}
            currentTheme={currentTheme}
          />
        </View>

        {/* Placement Tips */}
        {plant.careDetails.placement.length > 0 && (
          <View style={styles.placementContainer}>
            <Text
              style={[styles.sectionTitle, { color: currentTheme.colorText }]}
            >
              Placement Tips
            </Text>
            {plant.careDetails.placement.map((tip, index) => (
              <View
                key={index}
                style={[
                  styles.tipItem,
                  { backgroundColor: currentTheme.colorSurface },
                ]}
              >
                <FontAwesome6
                  name="lightbulb"
                  size={14}
                  color={currentTheme.colorLeafyGreen}
                />
                <Text
                  style={[
                    styles.tipText,
                    { color: currentTheme.colorTextSecondary },
                  ]}
                >
                  {tip}
                </Text>
              </View>
            ))}
          </View>
        )}

        {/* Common Issues */}
        {plant.careDetails.commonIssues.length > 0 && (
          <View
            style={[
              styles.issuesContainer,
              { backgroundColor: currentTheme.colorBackground },
            ]}
          >
            <Text
              style={[styles.sectionTitle, { color: currentTheme.colorText }]}
            >
              Common Issues
            </Text>
            {plant.careDetails.commonIssues.map((issue, index) => (
              <View
                key={index}
                style={[
                  styles.issueItem,
                  { backgroundColor: currentTheme.colorSurface },
                ]}
              >
                <FontAwesome
                  name="exclamation-triangle"
                  size={14}
                  color="#ff9800"
                />
                <Text
                  style={[
                    styles.issueText,
                    { color: currentTheme.colorTextSecondary },
                  ]}
                >
                  {issue}
                </Text>
              </View>
            ))}
          </View>
        )}

        {/* Notes */}
        {plant.notes && (
          <View
            style={[
              styles.notesContainer,
              { backgroundColor: currentTheme.colorBackground },
            ]}
          >
            <Text
              style={[styles.sectionTitle, { color: currentTheme.colorText }]}
            >
              Notes
            </Text>
            <Text
              style={[
                styles.notesText,
                {
                  color: currentTheme.colorTextSecondary,
                  backgroundColor: currentTheme.colorSurface,
                },
              ]}
            >
              {plant.notes}
            </Text>
          </View>
        )}

        {/* Action Buttons */}
        <View
          style={[
            styles.actionButtonsContainer,
            { backgroundColor: currentTheme.colorBackground },
          ]}
        >
          <TouchableOpacity
            style={[
              styles.waterButton,
              { flex: 1, backgroundColor: currentTheme.colorLeafyGreen },
            ]}
            onPress={handleWaterPlant}
          >
            <FontAwesome6
              name="droplet"
              size={16}
              color={currentTheme.colorTextInverse}
            />
            <Text
              style={[
                styles.waterButtonText,
                { color: currentTheme.colorTextInverse },
              ]}
            >
              Water Plant
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
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
  },
  placeholderText: {
    fontSize: 16,
    marginTop: 12,
  },
  plantInfoContainer: {
    padding: 20,
  },
  plantName: {
    fontSize: 28,
    fontWeight: "700",
    marginBottom: 8,
  },
  scientificName: {
    fontSize: 18,
    marginBottom: 16,
  },
  metaInfo: {
    marginBottom: 20,
  },
  metaItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
  },
  metaText: {
    fontSize: 14,
    marginLeft: 8,
  },
  taxonomyContainer: {
    padding: 16,
    borderRadius: 12,
  },
  taxonomyTitle: {
    fontSize: 16,
    fontWeight: "600",
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
    marginBottom: 4,
  },
  taxonomyValue: {
    fontSize: 14,
    fontWeight: "500",
  },
  commonNamesContainer: {
    marginTop: 8,
  },
  commonNamesText: {
    fontSize: 14,
    fontStyle: "italic",
    fontWeight: "500",
  },
  wateringStatusContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginHorizontal: 20,
    marginBottom: 20,
    padding: 16,
    borderRadius: 15,
  },
  wateringStatusText: {
    marginLeft: 16,
    flex: 1,
  },
  wateringStatusTitle: {
    fontSize: 16,
    fontWeight: "500",
  },
  wateringStatusSubtitle: {
    fontSize: 14,
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
    marginBottom: 16,
  },
  careDetailItem: {
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
    marginLeft: 8,
    flex: 1,
  },
  editButton: {
    padding: 4,
  },
  careDetailValue: {
    fontSize: 14,
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
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
  },
  tipText: {
    fontSize: 14,
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
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
  },
  issueText: {
    fontSize: 14,
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
    lineHeight: 22,
    padding: 16,
    borderRadius: 8,
  },
  deleteButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 10,
    paddingVertical: 16,
    paddingHorizontal: 40,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#b1b1b1ff",
  },
  deleteButtonText: {
    fontSize: 16,
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
    marginTop: 16,
  },
  waterButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 16,
    borderRadius: 8,
  },
  waterButtonText: {
    fontSize: 16,
    fontWeight: "600",
    marginLeft: 8,
  },
  bottomSpacing: {
    height: 40,
  },
});
