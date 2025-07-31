import React, { useState } from "react";
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  Image,
  SafeAreaView,
  Dimensions,
  RefreshControl,
  Alert,
} from "react-native";
import { useRouter } from "expo-router";
import FontAwesome6 from "@expo/vector-icons/FontAwesome6";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import { LinearGradient } from "expo-linear-gradient";
import { theme } from "../../theme";
import { usePlantIdentificationStore } from "@/store/plantIdentification";
import type { PlantProfile } from "@/store/plantIdentification";

const { width: screenWidth } = Dimensions.get("window");

interface PlantCardProps {
  plant: PlantProfile;
  onPress: () => void;
  onDelete: () => void;
}

const PlantCard: React.FC<PlantCardProps> = ({ plant, onPress, onDelete }) => {
  const [imageError, setImageError] = useState(false);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const getNextWateringStatus = () => {
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
      };
    } else if (diffDays === 0) {
      return { text: "Water today", color: "#ff9800", urgent: true };
    } else if (diffDays === 1) {
      return { text: "Water tomorrow", color: "#ff9800", urgent: false };
    } else {
      return {
        text: `Water in ${diffDays} days`,
        color: theme.colorLeafyGreen,
        urgent: false,
      };
    }
  };

  const wateringStatus = getNextWateringStatus();

  return (
    <TouchableOpacity
      style={styles.plantCard}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={styles.cardImageContainer}>
        {!imageError ? (
          <Image
            source={{ uri: plant.imageUri }}
            style={styles.cardImage}
            onError={() => setImageError(true)}
          />
        ) : (
          <View style={styles.placeholderImage}>
            <FontAwesome6 name="seedling" size={40} color={theme.colorGrey} />
          </View>
        )}

        {/* Delete button */}
        <TouchableOpacity
          style={styles.deleteButton}
          onPress={(e) => {
            e.stopPropagation();
            onDelete();
          }}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <FontAwesome6 name="trash" size={14} color="#fff" />
        </TouchableOpacity>
      </View>

      <View style={styles.cardContent}>
        <Text style={styles.plantName} numberOfLines={1}>
          {plant.name}
        </Text>

        <Text style={styles.scientificName} numberOfLines={1}>
          {plant.identification.species.scientificNameWithoutAuthor}
        </Text>

        {plant.location && (
          <View style={styles.locationContainer}>
            <FontAwesome6
              name="location-dot"
              size={12}
              color={theme.colorGrey}
            />
            <Text style={styles.locationText} numberOfLines={1}>
              {plant.location}
            </Text>
          </View>
        )}

        {wateringStatus && (
          <View
            style={[
              styles.wateringStatus,
              { backgroundColor: wateringStatus.color + "20" },
            ]}
          >
            <FontAwesome6
              name="droplet"
              size={12}
              color={wateringStatus.color}
            />
            <Text
              style={[styles.wateringText, { color: wateringStatus.color }]}
            >
              {wateringStatus.text}
            </Text>
          </View>
        )}

        <Text style={styles.lastWateredDate}>
          {plant.lastWatered
            ? `Last watered ${formatDate(plant.lastWatered)}`
            : "Never watered"}
        </Text>
      </View>
    </TouchableOpacity>
  );
};

const EmptyState: React.FC<{ onAddPlant: () => void }> = ({ onAddPlant }) => (
  <ScrollView
    contentContainerStyle={styles.emptyState}
    showsVerticalScrollIndicator={false}
  >
    {/* Hero Section */}
    <View style={styles.emptyHeroSection}>
      <View style={styles.emptyIconContainer}>
        <FontAwesome6 name="seedling" size={60} color={theme.colorLeafyGreen} />
        <View style={styles.decorativeCircle1} />
        <View style={styles.decorativeCircle2} />
      </View>
      <Text style={styles.emptyTitle}>Welcome to Plantly</Text>
      <Text style={styles.emptySubtitle}>
        Your personal plant care companion awaits! Start your green journey by
        identifying your first plant.
      </Text>
    </View>

    {/* Features Preview */}
    <View style={styles.featuresContainer}>
      <Text style={styles.featuresTitle}>What you can do:</Text>

      <View style={styles.featureItem}>
        <View style={styles.featureIcon}>
          <FontAwesome6 name="camera" size={20} color={theme.colorLeafyGreen} />
        </View>
        <View style={styles.featureContent}>
          <Text style={styles.featureItemTitle}>Identify Plants</Text>
          <Text style={styles.featureItemText}>
            Take a photo and discover what plant you have
          </Text>
        </View>
      </View>

      <View style={styles.featureItem}>
        <View style={styles.featureIcon}>
          <FontAwesome6 name="droplet" size={20} color="#3498db" />
        </View>
        <View style={styles.featureContent}>
          <Text style={styles.featureItemTitle}>Care Reminders</Text>
          <Text style={styles.featureItemText}>
            Get personalized watering and care schedules
          </Text>
        </View>
      </View>

      <View style={styles.featureItem}>
        <View style={styles.featureIcon}>
          <FontAwesome6 name="chart-line" size={20} color="#e74c3c" />
        </View>
        <View style={styles.featureContent}>
          <Text style={styles.featureItemTitle}>Track Growth</Text>
          <Text style={styles.featureItemText}>
            Monitor your plants' health and progress
          </Text>
        </View>
      </View>
    </View>

    {/* Call to Action */}
    <View style={styles.ctaContainer}>
      <TouchableOpacity style={styles.addFirstPlantButton} onPress={onAddPlant}>
        <FontAwesome6
          name="camera"
          size={20}
          color="#fff"
          style={{ marginRight: 8 }}
        />
        <Text style={styles.addFirstPlantText}>Identify Your First Plant</Text>
      </TouchableOpacity>

      <View style={styles.tipContainer}>
        <FontAwesome6 name="lightbulb" size={16} color={theme.colorGrey} />
        <Text style={styles.tipText}>
          Tip: Take clear photos of leaves, flowers, or the whole plant for
          better identification
        </Text>
      </View>
    </View>
  </ScrollView>
);

const StatsCard: React.FC<{ plants: PlantProfile[] }> = ({ plants }) => {
  const totalPlants = plants.length;
  const plantsNeedingWater = plants.filter((plant) => {
    if (!plant.nextWateringDate) return false;
    const today = new Date();
    const nextWatering = new Date(plant.nextWateringDate);
    return nextWatering <= today;
  }).length;

  const recentlyAdded = plants.filter((plant) => {
    const addedDate = new Date(plant.dateAdded);
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    return addedDate >= weekAgo;
  }).length;

  return (
    <View style={styles.statsContainer}>
      <View style={styles.statItem}>
        <Text style={styles.statNumber}>{totalPlants}</Text>
        <Text style={styles.statLabel}>Total Plants</Text>
      </View>
      <View style={styles.statDivider} />
      <View style={styles.statItem}>
        <Text
          style={[
            styles.statNumber,
            plantsNeedingWater > 0 && { color: "#ff9800" },
          ]}
        >
          {plantsNeedingWater}
        </Text>
        <Text style={styles.statLabel}>Need Water</Text>
      </View>
      <View style={styles.statDivider} />
      <View style={styles.statItem}>
        <Text style={styles.statNumber}>{recentlyAdded}</Text>
        <Text style={styles.statLabel}>This Week</Text>
      </View>
    </View>
  );
};

export default function PlantCollectionScreen() {
  const router = useRouter();
  const {
    myPlants,
    clearCurrentIdentification,
    deletePlantFromCollection,
    waterPlant,
  } = usePlantIdentificationStore();
  const [refreshing, setRefreshing] = useState(false);

  const handleAddPlant = () => {
    clearCurrentIdentification();
    router.push("/camera");
  };

  const handlePlantPress = (plant: PlantProfile) => {
    console.log("Plant pressed:", plant.name);
    router.push(`/plant-detail/${plant.id}`);
  };

  const handleDeletePlant = (plantId: string, plantName: string) => {
    Alert.alert(
      "Delete Plant",
      `Are you sure you want to remove "${plantName}" from your collection?`,
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => {
            console.log("Delete plant:", plantName);
            deletePlantFromCollection(plantId);
            Alert.alert(
              "Plant Deleted",
              `"${plantName}" has been removed from your collection.`,
              [{ text: "OK" }]
            );
          },
        },
      ]
    );
  };

  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    // Simulate refresh - in real app you might sync with cloud storage
    setTimeout(() => {
      setRefreshing(false);
    }, 1000);
  }, []);

  const sortedPlants = [...myPlants].sort(
    (a, b) => new Date(b.dateAdded).getTime() - new Date(a.dateAdded).getTime()
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>
            {" "}
            {myPlants.length === 0 ? "" : "Your Plantly Collection"}
          </Text>
          <Text style={styles.headerSubtitle}>
            {myPlants.length === 0
              ? ""
              : `${myPlants.length} plant${myPlants.length !== 1 ? "s" : ""} in your collection`}
          </Text>
        </View>
        {/*<TouchableOpacity style={styles.addButton} onPress={handleAddPlant}>
          <FontAwesome6 name="plus" size={18} color="#fff" />
        </TouchableOpacity>*/}
      </View>

      {myPlants.length === 0 ? (
        <EmptyState onAddPlant={handleAddPlant} />
      ) : (
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
          showsVerticalScrollIndicator={false}
        >
          {/* Stats Card */}
          <StatsCard plants={myPlants} />

          {/* Plants Grid */}
          <View style={styles.plantsGrid}>
            {sortedPlants.map((plant) => (
              <PlantCard
                key={plant.id}
                plant={plant}
                onPress={() => handlePlantPress(plant)}
                onDelete={() => handleDeletePlant(plant.id, plant.name)}
              />
            ))}
          </View>

          {/* Add more plants prompt */}
          <TouchableOpacity
            style={styles.addMoreButton}
            onPress={handleAddPlant}
          >
            <FontAwesome
              name="plus-circle"
              size={24}
              color={theme.colorLeafyGreen}
            />
            <Text style={styles.addMoreText}>Add Another Plant</Text>
          </TouchableOpacity>
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colorWhite,
  },
  header: {
    flexDirection: "row",
    marginLeft: 10,
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 0,
  },
  headerTitle: {
    fontSize: 28,
    marginBottom: 8,
    fontWeight: "700",
    color: theme.colorDarkGreen,
  },
  headerSubtitle: {
    fontSize: 14,
    color: theme.colorGrey,
    marginTop: 2,
  },
  addButton: {
    backgroundColor: theme.colorLeafyGreen,
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: theme.colorLeafyGreen,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.3,
    shadowRadius: 3.84,
    elevation: 5,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 20,
  },
  statsContainer: {
    flexDirection: "row",
    backgroundColor: theme.colorLeafyGreen,
    marginHorizontal: 20,
    marginVertical: 10,
    marginTop: 16,
    borderRadius: 20,
    padding: 16,
  },
  statItem: {
    flex: 1,
    alignItems: "center",
  },
  statNumber: {
    fontSize: 24,
    fontWeight: "700",
    color: theme.colorWhite,
  },
  statLabel: {
    fontSize: 12,
    color: theme.colorWhite,
    marginTop: 4,
  },
  statDivider: {
    width: 1,
    backgroundColor: "#e0e0e0",
    marginHorizontal: 16,
  },
  plantsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    paddingHorizontal: 20,
    paddingTop: 20,
    justifyContent: "space-between",
  },
  plantCard: {
    width: (screenWidth - 60) / 2,
    backgroundColor: "#fff",
    borderRadius: 12,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  cardImageContainer: {
    position: "relative",
  },
  cardImage: {
    width: "100%",
    height: 120,
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
    resizeMode: "cover",
  },
  placeholderImage: {
    width: "100%",
    height: 120,
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
    backgroundColor: "#f0f0f0",
    justifyContent: "center",
    alignItems: "center",
  },
  deleteButton: {
    position: "absolute",
    top: 8,
    right: 8,
    backgroundColor: "rgba(122, 118, 118, 0.8)",
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: "center",
    alignItems: "center",
  },
  cardContent: {
    padding: 12,
  },
  plantName: {
    fontSize: 16,
    fontWeight: "600",
    color: theme.colorDarkGreen,
    marginBottom: 4,
  },
  scientificName: {
    fontSize: 12,
    fontStyle: "italic",
    color: theme.colorGrey,
    marginBottom: 8,
  },
  locationContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  locationText: {
    fontSize: 12,
    color: theme.colorGrey,
    marginLeft: 4,
    flex: 1,
  },
  wateringStatus: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    marginBottom: 8,
  },
  wateringText: {
    fontSize: 11,
    fontWeight: "600",
    marginLeft: 4,
  },
  lastWateredDate: {
    fontSize: 10,
    color: theme.colorGrey,
  },
  emptyState: {
    flexGrow: 1,
    paddingHorizontal: 20,
    paddingTop: 40,
  },
  emptyHeroSection: {
    alignItems: "center",
    marginBottom: 40,
  },
  emptyIconContainer: {
    position: "relative",
    marginBottom: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  decorativeCircle1: {
    position: "absolute",
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: theme.colorLeafyGreen + "10",
    top: -20,
    left: -20,
    zIndex: -1,
  },
  decorativeCircle2: {
    position: "absolute",
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: theme.colorLeafyGreen + "20",
    bottom: -10,
    right: -30,
    zIndex: -1,
  },
  emptyTitle: {
    fontSize: 28,
    fontWeight: "700",
    color: theme.colorDarkGreen,
    marginBottom: 8,
    textAlign: "center",
  },
  emptySubtitle: {
    fontSize: 16,
    color: theme.colorGrey,
    textAlign: "center",
    lineHeight: 24,
    maxWidth: 280,
  },
  featuresContainer: {
    marginBottom: 40,
  },
  featuresTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: theme.colorDarkGreen,
    marginBottom: 20,
    textAlign: "center",
  },
  featureItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
    backgroundColor: "#fff",
    padding: 16,
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  featureIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: theme.colorLeafyGreen + "20",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 16,
  },
  featureContent: {
    flex: 1,
  },
  featureItemTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: theme.colorDarkGreen,
    marginBottom: 4,
  },
  featureItemText: {
    fontSize: 14,
    color: theme.colorGrey,
    lineHeight: 18,
  },
  ctaContainer: {
    alignItems: "center",
  },
  tipContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 20,
    paddingHorizontal: 20,
    paddingVertical: 12,
    backgroundColor: "#f8f9fa",
    borderRadius: 8,
    maxWidth: 300,
  },
  tipText: {
    fontSize: 12,
    color: theme.colorGrey,
    marginLeft: 8,
    flex: 1,
    textAlign: "center",
  },
  addFirstPlantButton: {
    backgroundColor: theme.colorLeafyGreen,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderRadius: 12,
    shadowColor: theme.colorLeafyGreen,
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 4.65,
    elevation: 8,
  },
  addFirstPlantText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  addMoreButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginHorizontal: 20,
    marginTop: 20,
    paddingVertical: 16,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: theme.colorLeafyGreen,
    borderStyle: "dashed",
  },
  addMoreText: {
    color: theme.colorLeafyGreen,
    fontSize: 16,
    fontWeight: "600",
    marginLeft: 8,
  },
});
