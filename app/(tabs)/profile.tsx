import {
  Text,
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Share,
  Linking,
  Platform,
  TextInput,
  Image,
  Modal,
} from "react-native";
import { PlantlyButton } from "@/components/PlantlyButton";
import { useUserStore } from "@/store/userStore";
import { usePlantIdentificationStore } from "@/store/plantIdentification";
import { useUserProfileStore } from "@/store/userProfileStore";
import { useRouter } from "expo-router";
import { FontAwesome, FontAwesome6, Octicons } from "@expo/vector-icons";
import { theme } from "@/theme";
import { useTheme } from "@/contexts/ThemeContext";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import * as FileSystem from "expo-file-system";
import * as ImagePicker from "expo-image-picker";
import * as Location from "expo-location";
import { useState } from "react";
import { PrivacyPolicyModal } from "@/components/PrivacyPolicyModal";
import { TermsOfServiceModal } from "@/components/TermsOfServiceModal";
import { RatingModal } from "@/components/RatingModal";

export default function ProfileScreen() {
  const toggleHasOnboarded = useUserStore((state) => state.toggleHasOnboarded);
  const { myPlants, clearAllData } = usePlantIdentificationStore();
  const { theme: currentTheme, themeType, setTheme, isDark } = useTheme();
  const router = useRouter();
  const insets = useSafeAreaInsets();

  // User profile from store
  const {
    userProfile,
    setName,
    setEmail,
    setLocation,
    setProfileImage,
    setExperienceLevel,
    toggleNewsletterSubscription,
  } = useUserProfileStore();

  const [isEditingProfile, setIsEditingProfile] = useState(false);

  // Modal states
  const [emailModalVisible, setEmailModalVisible] = useState(false);
  const [locationModalVisible, setLocationModalVisible] = useState(false);
  const [nameModalVisible, setNameModalVisible] = useState(false);
  const [privacyPolicyModalVisible, setPrivacyPolicyModalVisible] =
    useState(false);
  const [termsOfServiceModalVisible, setTermsOfServiceModalVisible] =
    useState(false);
  const [ratingModalVisible, setRatingModalVisible] = useState(false);
  const [tempEmail, setTempEmail] = useState("");
  const [tempLocation, setTempLocation] = useState("");
  const [tempName, setTempName] = useState("");

  // Calculate user stats
  const totalPlants = myPlants.length;
  const wateredToday = myPlants.filter((plant) => {
    if (!plant.lastWatered) return false;
    const today = new Date().toDateString();
    const lastWateredDate = new Date(plant.lastWatered).toDateString();
    return today === lastWateredDate;
  }).length;

  const plantsNeedingWater = myPlants.filter((plant) => {
    if (!plant.nextWateringDate) return false;
    const today = new Date();
    const nextWateringDate = new Date(plant.nextWateringDate);
    return nextWateringDate <= today;
  }).length;

  const handleProfileImagePicker = async () => {
    Alert.alert("Profile Picture", "Choose how to set your profile picture:", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Camera",
        onPress: async () => {
          const permission = await ImagePicker.requestCameraPermissionsAsync();
          if (permission.granted) {
            const result = await ImagePicker.launchCameraAsync({
              mediaTypes: ImagePicker.MediaTypeOptions.Images,
              allowsEditing: true,
              aspect: [1, 1],
              quality: 0.8,
            });

            if (!result.canceled && result.assets[0]) {
              setProfileImage(result.assets[0].uri);
            }
          }
        },
      },
      {
        text: "Gallery",
        onPress: async () => {
          const permission =
            await ImagePicker.requestMediaLibraryPermissionsAsync();
          if (permission.granted) {
            const result = await ImagePicker.launchImageLibraryAsync({
              mediaTypes: ImagePicker.MediaTypeOptions.Images,
              allowsEditing: true,
              aspect: [1, 1],
              quality: 0.8,
            });

            if (!result.canceled && result.assets[0]) {
              setProfileImage(result.assets[0].uri);
            }
          }
        },
      },
      {
        text: "Remove Photo",
        style: "destructive",
        onPress: () => {
          setProfileImage(null);
        },
      },
    ]);
  };

  const handleEmailInput = () => {
    setTempEmail(userProfile.email);
    setEmailModalVisible(true);
  };

  const handleLocationInput = async () => {
    Alert.alert(
      "Set Location",
      "How would you like to set your location?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Auto-Detect GPS",
          onPress: async () => {
            await detectGPSLocation();
          }
        },
        {
          text: "Manual Input",
          onPress: () => {
            setTempLocation(userProfile.location);
            setLocationModalVisible(true);
          }
        }
      ]
    );
  };

  const detectGPSLocation = async () => {
    try {
      // Request location permissions
      const { status } = await Location.requestForegroundPermissionsAsync();
      
      if (status !== 'granted') {
        Alert.alert(
          "Permission Required",
          "Location permission is needed to auto-detect your location.",
          [
            { text: "Cancel", style: "cancel" },
            { 
              text: "Manual Input", 
              onPress: () => {
                setTempLocation(userProfile.location);
                setLocationModalVisible(true);
              }
            }
          ]
        );
        return;
      }

      // Show loading state
      Alert.alert("Detecting Location", "Getting your precise location...\n\nThis may take a few seconds for accuracy.");

      // Get current position with high accuracy
      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
        timeInterval: 10000,
        distanceInterval: 10,
      });

      // Reverse geocode to get address
      const reverseGeocode = await Location.reverseGeocodeAsync({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      });

      if (reverseGeocode.length > 0) {
        const address = reverseGeocode[0];
        const parts = [];
        
        // Build location string with available components
        if (address.city) parts.push(address.city);
        else if (address.district) parts.push(address.district);
        else if (address.subregion) parts.push(address.subregion);
        
        if (address.region) parts.push(address.region);
        else if (address.country) parts.push(address.country);
        
        const formattedLocation = parts.join(', ');
        const coordinates = `${location.coords.latitude.toFixed(4)}, ${location.coords.longitude.toFixed(4)}`;
        
        if (formattedLocation && formattedLocation !== ', ') {
          // Show detected location with option to confirm or edit
          Alert.alert(
            "Location Detected",
            `We detected your location as:\n\n${formattedLocation}\n\nCoordinates: ${coordinates}\n\nIs this correct?`,
            [
              { text: "Cancel", style: "cancel" },
              {
                text: "Edit Location",
                onPress: () => {
                  setTempLocation(formattedLocation);
                  setLocationModalVisible(true);
                }
              },
              {
                text: "Confirm",
                onPress: () => {
                  setLocation(formattedLocation);
                  Alert.alert("Location Saved", `Your location has been set to: ${formattedLocation}`);
                }
              }
            ]
          );
        } else {
          // No readable address, offer coordinates or manual input
          Alert.alert(
            "Location Found",
            `We found your GPS coordinates but couldn't determine a readable address.\n\nCoordinates: ${coordinates}\n\nWould you like to use coordinates or enter manually?`,
            [
              { text: "Cancel", style: "cancel" },
              {
                text: "Manual Input",
                onPress: () => {
                  setTempLocation(userProfile.location);
                  setLocationModalVisible(true);
                }
              },
              {
                text: "Use Coordinates",
                onPress: () => {
                  setLocation(coordinates);
                  Alert.alert("Location Saved", `Your location has been set to coordinates: ${coordinates}`);
                }
              }
            ]
          );
        }
      } else {
        // No geocoding results
        const coordinates = `${location.coords.latitude.toFixed(4)}, ${location.coords.longitude.toFixed(4)}`;
        Alert.alert(
          "GPS Found",
          `We detected your GPS coordinates:\n\n${coordinates}\n\nBut couldn't convert to an address. Would you like to use coordinates or enter manually?`,
          [
            { text: "Cancel", style: "cancel" },
            {
              text: "Manual Input",
              onPress: () => {
                setTempLocation(userProfile.location);
                setLocationModalVisible(true);
              }
            },
            {
              text: "Use Coordinates",
              onPress: () => {
                setLocation(coordinates);
                Alert.alert("Location Saved", `Your location has been set to coordinates: ${coordinates}`);
              }
            }
          ]
        );
      }
    } catch (error) {
      console.log("Location error:", error);
      Alert.alert(
        "Location Detection Failed",
        "Unable to detect your location. This could be due to:\n\n• Poor GPS signal\n• Indoor location\n• Location services disabled\n• Network issues\n\nTry going outside for better GPS signal or enter your location manually.",
        [
          { text: "Cancel", style: "cancel" },
          { text: "Retry GPS", onPress: detectGPSLocation },
          { 
            text: "Manual Input", 
            onPress: () => {
              setTempLocation(userProfile.location);
              setLocationModalVisible(true);
            }
          }
        ]
      );
    }
  };

  const handleNewsletterToggle = () => {
    if (!userProfile.email || !userProfile.email.trim()) {
      Alert.alert(
        "Email Required",
        "Please add your email address first to subscribe to our newsletter.",
        [
          { text: "Cancel", style: "cancel" },
          {
            text: "Add Email",
            onPress: handleEmailInput,
          },
        ]
      );
      return;
    }

    toggleNewsletterSubscription();

    Alert.alert(
      userProfile.newsletterSubscribed ? "Unsubscribed" : "Subscribed!",
      userProfile.newsletterSubscribed
        ? "You've been unsubscribed from our newsletter."
        : `You'll receive plant care tips at ${userProfile.email}`
    );
  };

  const handleExperienceLevelChange = () => {
    const levels = ["beginner", "intermediate", "advanced", "expert"];
    const options = levels.map((level) => ({
      text: level.charAt(0).toUpperCase() + level.slice(1),
      onPress: () => {
        setExperienceLevel(level as any);
        Alert.alert(
          "Updated",
          `Experience level set to: ${level.charAt(0).toUpperCase() + level.slice(1)}`
        );
      },
    }));

    Alert.alert("Experience Level", "Select your plant care experience:", [
      ...options,
      { text: "Cancel", style: "cancel" },
    ]);
  };

  const handleExportData = async () => {
    try {
      const exportData = {
        plants: myPlants,
        exportDate: new Date().toISOString(),
        version: "1.0.0",
      };

      const jsonString = JSON.stringify(exportData, null, 2);

      Alert.alert(
        "Export Plant Data",
        `Your plant collection (${myPlants.length} plants) is ready to export. This feature will allow you to save and share your plant data.`,
        [
          { text: "Cancel", style: "cancel" },
          {
            text: "Share Data",
            onPress: async () => {
              try {
                await Share.share({
                  message: `My Plantly Collection:\n\n${jsonString}`,
                  title: "Plantly Plant Collection",
                });
              } catch (error) {
                Alert.alert(
                  "Export Complete",
                  "Your plant data is ready for export!"
                );
              }
            },
          },
        ]
      );
    } catch (error) {
      Alert.alert(
        "Export Failed",
        "Could not export your plant data. Please try again.",
        [{ text: "OK" }]
      );
    }
  };

  const handleImportData = async () => {
    Alert.alert(
      "Import Plant Data",
      "This feature will allow you to restore your plant collection from a backup file. Coming soon!",
      [
        { text: "OK" },
        {
          text: "Manual Entry",
          onPress: () => {
            Alert.alert(
              "Manual Import",
              "For now, you can manually add plants using the camera feature to identify and add them to your collection.",
              [{ text: "Got it!" }]
            );
          },
        },
      ]
    );
  };

  const handleClearAllData = () => {
    Alert.alert(
      "Clear All Data",
      `This will permanently delete all your plants (${myPlants.length}), settings, and data. This action cannot be undone.`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete All",
          style: "destructive",
          onPress: () => {
            Alert.alert(
              "Final Warning",
              "Are you absolutely sure? This will delete everything!",
              [
                { text: "Cancel", style: "cancel" },
                {
                  text: "Yes, Delete All",
                  style: "destructive",
                  onPress: () => {
                    clearAllData();
                    Alert.alert(
                      "Data Cleared",
                      "All your plant data has been permanently deleted.",
                      [{ text: "OK" }]
                    );
                  },
                },
              ]
            );
          },
        },
      ]
    );
  };

  const handlePlantCareGuide = () => {
    Alert.alert(
      "Plant Care Guide",
      "This feature will provide comprehensive plant care information and tips.",
      [{ text: "Coming Soon" }]
    );
  };

  const handleReportBug = () => {
    const subject = encodeURIComponent("Plantly App - Bug Report");
    const body = encodeURIComponent(`
Dear Plantly Team,

I found a bug in the app:

Device: ${Platform.OS}
App Version: 1.0.0
Description: [Please describe the bug]

Steps to reproduce:
1. 
2. 
3. 

Expected behavior:

Actual behavior:

Additional notes:

Best regards,
`);

    Linking.openURL(
      `mailto:support@plantly.app?subject=${subject}&body=${body}`
    );
  };

  const handleRateApp = async () => {
    setRatingModalVisible(true);
  };

  const handleTermsOfService = () => {
    setTermsOfServiceModalVisible(true);
  };

  const handlePrivacyPolicy = () => {
    setPrivacyPolicyModalVisible(true);
  };

  const handleThemeChange = () => {
    const themeNames = {
      light: "Light",
      dark: "Dark",
      auto: "Auto (System)",
    };

    const currentThemeName = themeNames[themeType];
    console.log("Current theme type:", themeType);
    console.log("Current theme colors:", currentTheme);

    Alert.alert(
      "App Theme",
      `Current theme: ${currentThemeName}\n\nChoose your preferred theme:`,
      [
        {
          text: "Light",
          style: themeType === "light" ? "default" : "default",
          onPress: () => {
            console.log("Setting theme to light");
            setTheme("light");
            Alert.alert("Theme Changed", "Light theme has been applied!");
          },
        },
        {
          text: "Dark",
          style: themeType === "dark" ? "default" : "default",
          onPress: () => {
            console.log("Setting theme to dark");
            setTheme("dark");
            Alert.alert("Theme Changed", "Dark theme has been applied!");
          },
        },
        {
          text: "Auto",
          style: themeType === "auto" ? "default" : "default",
          onPress: () => {
            console.log("Setting theme to auto");
            setTheme("auto");
            Alert.alert(
              "Theme Changed",
              "Auto theme will follow your system settings!"
            );
          },
        },
        { text: "Cancel", style: "cancel" },
      ]
    );
  };

  const handleLanguageChange = () => {
    Alert.alert("Language", "Choose your preferred language", [
      {
        text: "English",
        onPress: () => Alert.alert("Language", "English selected"),
      },
      {
        text: "Spanish",
        onPress: () =>
          Alert.alert("Language", "Spanish selected (Coming Soon)"),
      },
      {
        text: "French",
        onPress: () => Alert.alert("Language", "French selected (Coming Soon)"),
      },
      { text: "Cancel", style: "cancel" },
    ]);
  };

  return (
    <ScrollView
      style={[
        styles.container,
        {
          paddingTop: insets.top,
          backgroundColor: currentTheme.colorBackground,
        },
      ]}
      contentContainerStyle={styles.scrollContent}
    >
      {/* Header */}
      <View
        style={[
          styles.header,
          { backgroundColor: currentTheme.colorBackground },
        ]}
      >
        <TouchableOpacity
          style={[
            styles.profileIcon,
            { backgroundColor: currentTheme.colorSurface },
          ]}
          onPress={handleProfileImagePicker}
        >
          {userProfile.profileImage ? (
            <Image
              source={{ uri: userProfile.profileImage }}
              style={styles.profileImage}
            />
          ) : (
            <FontAwesome6
              name="user"
              size={32}
              color={currentTheme.colorLeafyGreen}
            />
          )}
          <View
            style={[
              styles.editProfileBadge,
              { backgroundColor: currentTheme.colorLeafyGreen },
            ]}
          >
            <FontAwesome6 name="camera" size={12} color="white" />
          </View>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => setNameModalVisible(true)}>
          <Text style={[styles.headerTitle, { color: currentTheme.colorText }]}>
            {userProfile.name || "Tap to add name"}
          </Text>
        </TouchableOpacity>
        <Text
          style={[
            styles.headerSubtitle,
            { color: currentTheme.colorTextSecondary },
          ]}
        >
          {userProfile.experienceLevel.charAt(0).toUpperCase() +
            userProfile.experienceLevel.slice(1)}{" "}
          Plant Parent
          {userProfile.location && ` • ${userProfile.location}`}
        </Text>
        {userProfile.email && (
          <Text
            style={[
              styles.headerSubtitle,
              {
                color: currentTheme.colorLeafyGreen,
                fontSize: 14,
                marginTop: 4,
              },
            ]}
          >
            📧 {userProfile.email}
          </Text>
        )}
      </View>

      {/* Stats Section */}
      <View style={styles.statsContainer}>
        <Text style={[styles.sectionTitle, { color: currentTheme.colorText }]}>
          My Garden Stats
        </Text>
        <View style={styles.statsGrid}>
          <View
            style={[
              styles.statCard,
              {
                backgroundColor: currentTheme.colorSurface,
                borderColor: currentTheme.colorBorder,
              },
            ]}
          >
            <FontAwesome6
              name="seedling"
              size={24}
              color={currentTheme.colorLeafyGreen}
            />
            <Text
              style={[styles.statNumber, { color: currentTheme.colorText }]}
            >
              {totalPlants}
            </Text>
            <Text
              style={[
                styles.statLabel,
                { color: currentTheme.colorTextSecondary },
              ]}
            >
              Total Plants
            </Text>
          </View>
          <View
            style={[
              styles.statCard,
              {
                backgroundColor: currentTheme.colorSurface,
                borderColor: currentTheme.colorBorder,
              },
            ]}
          >
            <FontAwesome6
              name="droplet"
              size={24}
              color={currentTheme.colorBlue}
            />
            <Text
              style={[styles.statNumber, { color: currentTheme.colorText }]}
            >
              {wateredToday}
            </Text>
            <Text
              style={[
                styles.statLabel,
                { color: currentTheme.colorTextSecondary },
              ]}
            >
              Watered Today
            </Text>
          </View>
          <View
            style={[
              styles.statCard,
              {
                backgroundColor: currentTheme.colorSurface,
                borderColor: currentTheme.colorBorder,
              },
            ]}
          >
            <FontAwesome6
              name="clock"
              size={24}
              color={
                plantsNeedingWater > 0
                  ? currentTheme.colorError
                  : currentTheme.colorSuccess
              }
            />
            <Text
              style={[styles.statNumber, { color: currentTheme.colorText }]}
            >
              {plantsNeedingWater}
            </Text>
            <Text
              style={[
                styles.statLabel,
                { color: currentTheme.colorTextSecondary },
              ]}
            >
              Need Water
            </Text>
          </View>
        </View>
      </View>

      {/* Personal Information Section */}
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: currentTheme.colorText }]}>
          Personal Information
        </Text>

        <TouchableOpacity
          style={[
            styles.menuItem,
            {
              backgroundColor: currentTheme.colorSurface,
              borderColor: currentTheme.colorBorder,
            },
          ]}
          onPress={() => setNameModalVisible(true)}
        >
          <View style={styles.menuItemLeft}>
            <FontAwesome6
              name="user"
              size={20}
              color={currentTheme.colorLeafyGreen}
            />
            <View style={styles.menuItemText}>
              <Text
                style={[
                  styles.menuItemTitle,
                  { color: currentTheme.colorText },
                ]}
              >
                Full Name
              </Text>
              <Text
                style={[
                  styles.menuItemSubtitle,
                  { color: currentTheme.colorTextSecondary },
                ]}
              >
                {userProfile.name || "Tap to add your name"}
              </Text>
            </View>
          </View>
          <FontAwesome6
            name="chevron-right"
            size={16}
            color={currentTheme.colorTextSecondary}
          />
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.menuItem,
            {
              backgroundColor: currentTheme.colorSurface,
              borderColor: currentTheme.colorBorder,
            },
          ]}
          onPress={handleEmailInput}
        >
          <View style={styles.menuItemLeft}>
            <FontAwesome6
              name="envelope"
              size={20}
              color={currentTheme.colorLeafyGreen}
            />
            <View style={styles.menuItemText}>
              <Text
                style={[
                  styles.menuItemTitle,
                  { color: currentTheme.colorText },
                ]}
              >
                Email Address
              </Text>
              <Text
                style={[
                  styles.menuItemSubtitle,
                  { color: currentTheme.colorTextSecondary },
                ]}
              >
                {userProfile.email || "Add email for newsletters"}
              </Text>
            </View>
          </View>
          <FontAwesome6
            name="chevron-right"
            size={16}
            color={currentTheme.colorTextSecondary}
          />
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.menuItem,
            {
              backgroundColor: currentTheme.colorSurface,
              borderColor: currentTheme.colorBorder,
            },
          ]}
          onPress={handleLocationInput}
        >
          <View style={styles.menuItemLeft}>
            <FontAwesome6
              name="location-dot"
              size={20}
              color={currentTheme.colorLeafyGreen}
            />
            <View style={styles.menuItemText}>
              <Text
                style={[
                  styles.menuItemTitle,
                  { color: currentTheme.colorText },
                ]}
              >
                Location
              </Text>
              <Text
                style={[
                  styles.menuItemSubtitle,
                  { color: currentTheme.colorTextSecondary },
                ]}
              >
                {userProfile.location || "Set your location"}
              </Text>
            </View>
          </View>
          <FontAwesome6
            name="chevron-right"
            size={16}
            color={currentTheme.colorTextSecondary}
          />
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.menuItem,
            {
              backgroundColor: currentTheme.colorSurface,
              borderColor: currentTheme.colorBorder,
            },
          ]}
          onPress={handleExperienceLevelChange}
        >
          <View style={styles.menuItemLeft}>
            <FontAwesome6
              name="star"
              size={20}
              color={currentTheme.colorLeafyGreen}
            />
            <View style={styles.menuItemText}>
              <Text
                style={[
                  styles.menuItemTitle,
                  { color: currentTheme.colorText },
                ]}
              >
                Experience Level
              </Text>
              <Text
                style={[
                  styles.menuItemSubtitle,
                  { color: currentTheme.colorTextSecondary },
                ]}
              >
                {userProfile.experienceLevel.charAt(0).toUpperCase() +
                  userProfile.experienceLevel.slice(1)}
              </Text>
            </View>
          </View>
          <FontAwesome6
            name="chevron-right"
            size={16}
            color={currentTheme.colorTextSecondary}
          />
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.menuItem,
            {
              backgroundColor: currentTheme.colorSurface,
              borderColor: currentTheme.colorBorder,
            },
          ]}
          onPress={handleNewsletterToggle}
        >
          <View style={styles.menuItemLeft}>
            <FontAwesome6
              name="bell"
              size={20}
              color={currentTheme.colorLeafyGreen}
            />
            <View style={styles.menuItemText}>
              <Text
                style={[
                  styles.menuItemTitle,
                  { color: currentTheme.colorText },
                ]}
              >
                Newsletter Subscription
              </Text>
              <Text
                style={[
                  styles.menuItemSubtitle,
                  { color: currentTheme.colorTextSecondary },
                ]}
              >
                {userProfile.email
                  ? userProfile.newsletterSubscribed
                    ? `Subscribed • ${userProfile.email}`
                    : "Subscribe to get plant care tips"
                  : "Add email to subscribe to newsletter"}
              </Text>
            </View>
          </View>
          <View
            style={[
              styles.toggleIndicator,
              {
                backgroundColor:
                  userProfile.email && userProfile.newsletterSubscribed
                    ? currentTheme.colorLeafyGreen
                    : !userProfile.email
                      ? currentTheme.colorTextSecondary
                      : currentTheme.colorBorder,
              },
            ]}
          >
            <FontAwesome
              name={
                !userProfile.email
                  ? "envelope-o"
                  : userProfile.newsletterSubscribed
                    ? "check"
                    : "times"
              }
              size={12}
              color="white"
            />
          </View>
        </TouchableOpacity>
      </View>

      {/* Settings Section */}
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: currentTheme.colorText }]}>
          Settings
        </Text>

        <TouchableOpacity
          style={[
            styles.menuItem,
            {
              backgroundColor: currentTheme.colorSurface,
              borderColor: currentTheme.colorBorder,
            },
          ]}
          onPress={() => router.push("/notification-settings")}
        >
          <View style={styles.menuItemLeft}>
            <FontAwesome6
              name="bell"
              size={20}
              color={currentTheme.colorLeafyGreen}
            />
            <View style={styles.menuItemText}>
              <Text
                style={[
                  styles.menuItemTitle,
                  { color: currentTheme.colorText },
                ]}
              >
                Notification Settings
              </Text>
              <Text
                style={[
                  styles.menuItemSubtitle,
                  { color: currentTheme.colorTextSecondary },
                ]}
              >
                Customize your plant care reminders
              </Text>
            </View>
          </View>
          <FontAwesome6
            name="chevron-right"
            size={16}
            color={currentTheme.colorTextSecondary}
          />
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.menuItem,
            {
              backgroundColor: currentTheme.colorSurface,
              borderColor: currentTheme.colorBorder,
            },
          ]}
          onPress={handleThemeChange}
        >
          <View style={styles.menuItemLeft}>
            <FontAwesome6
              name="palette"
              size={20}
              color={currentTheme.colorLeafyGreen}
            />
            <View style={styles.menuItemText}>
              <Text
                style={[
                  styles.menuItemTitle,
                  { color: currentTheme.colorText },
                ]}
              >
                App Theme
              </Text>
              <Text
                style={[
                  styles.menuItemSubtitle,
                  { color: currentTheme.colorTextSecondary },
                ]}
              >
                Currently:{" "}
                {themeType === "light"
                  ? "Light"
                  : themeType === "dark"
                    ? "Dark"
                    : "Auto"}
              </Text>
            </View>
          </View>
          <FontAwesome6
            name="chevron-right"
            size={16}
            color={currentTheme.colorTextSecondary}
          />
        </TouchableOpacity>

        {/*<TouchableOpacity
          style={[
            styles.menuItem,
            {
              backgroundColor: currentTheme.colorSurface,
              borderColor: currentTheme.colorBorder,
            },
          ]}
          onPress={handleLanguageChange}
        >
          <View style={styles.menuItemLeft}>
            <FontAwesome6
              name="language"
              size={20}
              color={currentTheme.colorLeafyGreen}
            />
            <View style={styles.menuItemText}>
              <Text
                style={[
                  styles.menuItemTitle,
                  { color: currentTheme.colorText },
                ]}
              >
                Language
              </Text>
              <Text
                style={[
                  styles.menuItemSubtitle,
                  { color: currentTheme.colorTextSecondary },
                ]}
              >
                Change app language
              </Text>
            </View>
          </View>
          <FontAwesome6
            name="chevron-right"
            size={16}
            color={currentTheme.colorTextSecondary}
          />
        </TouchableOpacity>*/}
      </View>

      {/* Data & Privacy Section */}
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: currentTheme.colorText }]}>
          Data & Privacy
        </Text>

        <TouchableOpacity
          style={[
            styles.menuItem,
            {
              backgroundColor: currentTheme.colorSurface,
              borderColor: currentTheme.colorBorder,
            },
          ]}
          onPress={handleExportData}
        >
          <View style={styles.menuItemLeft}>
            <FontAwesome6
              name="download"
              size={20}
              color={currentTheme.colorLeafyGreen}
            />
            <View style={styles.menuItemText}>
              <Text
                style={[
                  styles.menuItemTitle,
                  { color: currentTheme.colorText },
                ]}
              >
                Export Plant Data
              </Text>
              <Text
                style={[
                  styles.menuItemSubtitle,
                  { color: currentTheme.colorTextSecondary },
                ]}
              >
                Download your plant collection
              </Text>
            </View>
          </View>
          <FontAwesome6
            name="chevron-right"
            size={16}
            color={currentTheme.colorTextSecondary}
          />
        </TouchableOpacity>

        {/*<TouchableOpacity
          style={[
            styles.menuItem,
            {
              backgroundColor: currentTheme.colorSurface,
              borderColor: currentTheme.colorBorder,
            },
          ]}
          onPress={handleImportData}
        >
          <View style={styles.menuItemLeft}>
            <FontAwesome6
              name="upload"
              size={20}
              color={currentTheme.colorLeafyGreen}
            />
            <View style={styles.menuItemText}>
              <Text
                style={[
                  styles.menuItemTitle,
                  { color: currentTheme.colorText },
                ]}
              >
                Import Plant Data
              </Text>
              <Text
                style={[
                  styles.menuItemSubtitle,
                  { color: currentTheme.colorTextSecondary },
                ]}
              >
                Restore from backup
              </Text>
            </View>
          </View>
          <FontAwesome6
            name="chevron-right"
            size={16}
            color={currentTheme.colorTextSecondary}
          />
        </TouchableOpacity>*/}

        <TouchableOpacity
          style={[
            styles.menuItem,
            {
              backgroundColor: currentTheme.colorSurface,
              borderColor: currentTheme.colorBorder,
            },
          ]}
          onPress={handleClearAllData}
        >
          <View style={styles.menuItemLeft}>
            <FontAwesome6
              name="trash"
              size={20}
              color={currentTheme.colorError}
            />
            <View style={styles.menuItemText}>
              <Text
                style={[
                  styles.menuItemTitle,
                  { color: currentTheme.colorError },
                ]}
              >
                Clear All Data
              </Text>
              <Text
                style={[
                  styles.menuItemSubtitle,
                  { color: currentTheme.colorTextSecondary },
                ]}
              >
                Remove all plants and settings
              </Text>
            </View>
          </View>
          <FontAwesome6
            name="chevron-right"
            size={16}
            color={currentTheme.colorTextSecondary}
          />
        </TouchableOpacity>
      </View>

      {/* Help & Support Section */}
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: currentTheme.colorText }]}>
          Help & Support
        </Text>

        {/*<TouchableOpacity
          style={[
            styles.menuItem,
            {
              backgroundColor: currentTheme.colorSurface,
              borderColor: currentTheme.colorBorder,
            },
          ]}
          onPress={handlePlantCareGuide}
        >
          <View style={styles.menuItemLeft}>
            <FontAwesome6
              name="circle-question"
              size={20}
              color={currentTheme.colorLeafyGreen}
            />
            <View style={styles.menuItemText}>
              <Text
                style={[
                  styles.menuItemTitle,
                  { color: currentTheme.colorText },
                ]}
              >
                Plant Care Guide
              </Text>
              <Text
                style={[
                  styles.menuItemSubtitle,
                  { color: currentTheme.colorTextSecondary },
                ]}
              >
                Learn how to care for your plants
              </Text>
            </View>
          </View>
          <FontAwesome6
            name="chevron-right"
            size={16}
            color={currentTheme.colorTextSecondary}
          />
        </TouchableOpacity>*/}

        <TouchableOpacity
          style={[
            styles.menuItem,
            {
              backgroundColor: currentTheme.colorSurface,
              borderColor: currentTheme.colorBorder,
            },
          ]}
          onPress={handleReportBug}
        >
          <View style={styles.menuItemLeft}>
            <FontAwesome6
              name="bug"
              size={20}
              color={currentTheme.colorLeafyGreen}
            />
            <View style={styles.menuItemText}>
              <Text
                style={[
                  styles.menuItemTitle,
                  { color: currentTheme.colorText },
                ]}
              >
                Report Bug
              </Text>
              <Text
                style={[
                  styles.menuItemSubtitle,
                  { color: currentTheme.colorTextSecondary },
                ]}
              >
                Help us improve the app
              </Text>
            </View>
          </View>
          <FontAwesome6
            name="chevron-right"
            size={16}
            color={currentTheme.colorTextSecondary}
          />
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.menuItem,
            {
              backgroundColor: currentTheme.colorSurface,
              borderColor: currentTheme.colorBorder,
            },
          ]}
          onPress={handleRateApp}
        >
          <View style={styles.menuItemLeft}>
            <FontAwesome6
              name="star"
              size={20}
              color={currentTheme.colorLeafyGreen}
            />
            <View style={styles.menuItemText}>
              <Text
                style={[
                  styles.menuItemTitle,
                  { color: currentTheme.colorText },
                ]}
              >
                Rate Plantly
              </Text>
              <Text
                style={[
                  styles.menuItemSubtitle,
                  { color: currentTheme.colorTextSecondary },
                ]}
              >
                Share your experience
              </Text>
            </View>
          </View>
          <FontAwesome6
            name="chevron-right"
            size={16}
            color={currentTheme.colorTextSecondary}
          />
        </TouchableOpacity>
      </View>

      {/* About Section */}
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: currentTheme.colorText }]}>
          About
        </Text>

        <TouchableOpacity
          style={[
            styles.menuItem,
            {
              backgroundColor: currentTheme.colorSurface,
              borderColor: currentTheme.colorBorder,
            },
          ]}
        >
          <View style={styles.menuItemLeft}>
            <Octicons
              name="versions"
              size={20}
              color={currentTheme.colorLeafyGreen}
            />
            <View style={styles.menuItemText}>
              <Text
                style={[
                  styles.menuItemTitle,
                  { color: currentTheme.colorText },
                ]}
              >
                App Version
              </Text>
              <Text
                style={[
                  styles.menuItemSubtitle,
                  { color: currentTheme.colorTextSecondary },
                ]}
              >
                1.0.0
              </Text>
            </View>
          </View>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.menuItem,
            {
              backgroundColor: currentTheme.colorSurface,
              borderColor: currentTheme.colorBorder,
            },
          ]}
          onPress={handleTermsOfService}
        >
          <View style={styles.menuItemLeft}>
            <FontAwesome6
              name="file-contract"
              size={20}
              color={currentTheme.colorLeafyGreen}
            />
            <View style={styles.menuItemText}>
              <Text
                style={[
                  styles.menuItemTitle,
                  { color: currentTheme.colorText },
                ]}
              >
                Terms of Service
              </Text>
              <Text
                style={[
                  styles.menuItemSubtitle,
                  { color: currentTheme.colorTextSecondary },
                ]}
              >
                Read our terms and conditions
              </Text>
            </View>
          </View>
          <FontAwesome6
            name="chevron-right"
            size={16}
            color={currentTheme.colorTextSecondary}
          />
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.menuItem,
            {
              backgroundColor: currentTheme.colorSurface,
              borderColor: currentTheme.colorBorder,
            },
          ]}
          onPress={handlePrivacyPolicy}
        >
          <View style={styles.menuItemLeft}>
            <FontAwesome6
              name="shield-halved"
              size={20}
              color={currentTheme.colorLeafyGreen}
            />
            <View style={styles.menuItemText}>
              <Text
                style={[
                  styles.menuItemTitle,
                  { color: currentTheme.colorText },
                ]}
              >
                Privacy Policy
              </Text>
              <Text
                style={[
                  styles.menuItemSubtitle,
                  { color: currentTheme.colorTextSecondary },
                ]}
              >
                How we protect your data
              </Text>
            </View>
          </View>
          <FontAwesome6
            name="chevron-right"
            size={16}
            color={currentTheme.colorTextSecondary}
          />
        </TouchableOpacity>
      </View>

      {/* Developer Options */}
      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: currentTheme.colorText }]}>
          Developer
        </Text>
        <TouchableOpacity
          style={[
            styles.menuItem,
            {
              backgroundColor: currentTheme.colorSurface,
              borderColor: currentTheme.colorBorder,
            },
          ]}
          onPress={toggleHasOnboarded}
        >
          <View style={styles.menuItemLeft}>
            <FontAwesome6
              name="backward"
              size={20}
              color={currentTheme.colorLeafyGreen}
            />
            <View style={styles.menuItemText}>
              <Text
                style={[
                  styles.menuItemTitle,
                  { color: currentTheme.colorText },
                ]}
              >
                Reset Onboarding
              </Text>
              <Text
                style={[
                  styles.menuItemSubtitle,
                  { color: currentTheme.colorTextSecondary },
                ]}
              >
                Go back to onboarding screen
              </Text>
            </View>
          </View>
          <FontAwesome6
            name="chevron-right"
            size={16}
            color={currentTheme.colorTextSecondary}
          />
        </TouchableOpacity>
      </View>

      <View style={styles.bottomSpacing} />

      {/* Name Modal */}
      <Modal
        visible={nameModalVisible}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <View
          style={[
            styles.modalContainer,
            { backgroundColor: currentTheme.colorBackground },
          ]}
        >
          <View
            style={[
              styles.modalHeader,
              { borderBottomColor: currentTheme.colorBorder },
            ]}
          >
            <TouchableOpacity
              onPress={() => {
                setNameModalVisible(false);
                setTempName("");
              }}
            >
              <Text
                style={[
                  styles.modalButton,
                  { color: currentTheme.colorTextSecondary },
                ]}
              >
                Cancel
              </Text>
            </TouchableOpacity>
            <Text
              style={[styles.modalTitle, { color: currentTheme.colorText }]}
            >
              Edit Name
            </Text>
            <TouchableOpacity
              onPress={() => {
                setName(tempName);
                setNameModalVisible(false);
                setTempName("");
              }}
            >
              <Text
                style={[
                  styles.modalButton,
                  { color: currentTheme.colorLeafyGreen },
                ]}
              >
                Save
              </Text>
            </TouchableOpacity>
          </View>
          <View style={styles.modalContent}>
            <TextInput
              style={[
                styles.modalInput,
                {
                  backgroundColor: currentTheme.colorSurface,
                  borderColor: currentTheme.colorBorder,
                  color: currentTheme.colorText,
                },
              ]}
              value={tempName}
              onChangeText={setTempName}
              placeholder="Enter your full name"
              placeholderTextColor={currentTheme.colorTextSecondary}
              autoFocus
            />
          </View>
        </View>
      </Modal>

      {/* Email Modal */}
      <Modal
        visible={emailModalVisible}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <View
          style={[
            styles.modalContainer,
            { backgroundColor: currentTheme.colorBackground },
          ]}
        >
          <View
            style={[
              styles.modalHeader,
              { borderBottomColor: currentTheme.colorBorder },
            ]}
          >
            <TouchableOpacity
              onPress={() => {
                setEmailModalVisible(false);
                setTempEmail("");
              }}
            >
              <Text
                style={[
                  styles.modalButton,
                  { color: currentTheme.colorTextSecondary },
                ]}
              >
                Cancel
              </Text>
            </TouchableOpacity>
            <Text
              style={[styles.modalTitle, { color: currentTheme.colorText }]}
            >
              Edit Email
            </Text>
            <TouchableOpacity
              onPress={() => {
                setEmail(tempEmail);
                setEmailModalVisible(false);
                setTempEmail("");
              }}
            >
              <Text
                style={[
                  styles.modalButton,
                  { color: currentTheme.colorLeafyGreen },
                ]}
              >
                Save
              </Text>
            </TouchableOpacity>
          </View>
          <View style={styles.modalContent}>
            <TextInput
              style={[
                styles.modalInput,
                {
                  backgroundColor: currentTheme.colorSurface,
                  borderColor: currentTheme.colorBorder,
                  color: currentTheme.colorText,
                },
              ]}
              value={tempEmail}
              onChangeText={setTempEmail}
              placeholder="Enter your email address"
              placeholderTextColor={currentTheme.colorTextSecondary}
              keyboardType="email-address"
              autoCapitalize="none"
              autoFocus
            />
          </View>
        </View>
      </Modal>

      {/* Location Modal */}
      <Modal
        visible={locationModalVisible}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <View
          style={[
            styles.modalContainer,
            { backgroundColor: currentTheme.colorBackground },
          ]}
        >
          <View
            style={[
              styles.modalHeader,
              { borderBottomColor: currentTheme.colorBorder },
            ]}
          >
            <TouchableOpacity
              onPress={() => {
                setLocationModalVisible(false);
                setTempLocation("");
              }}
            >
              <Text
                style={[
                  styles.modalButton,
                  { color: currentTheme.colorTextSecondary },
                ]}
              >
                Cancel
              </Text>
            </TouchableOpacity>
            <Text
              style={[styles.modalTitle, { color: currentTheme.colorText }]}
            >
              Edit Location
            </Text>
            <TouchableOpacity
              onPress={() => {
                setLocation(tempLocation);
                setLocationModalVisible(false);
                setTempLocation("");
              }}
            >
              <Text
                style={[
                  styles.modalButton,
                  { color: currentTheme.colorLeafyGreen },
                ]}
              >
                Save
              </Text>
            </TouchableOpacity>
          </View>
          <View style={styles.modalContent}>
            <TextInput
              style={[
                styles.modalInput,
                {
                  backgroundColor: currentTheme.colorSurface,
                  borderColor: currentTheme.colorBorder,
                  color: currentTheme.colorText,
                },
              ]}
              value={tempLocation}
              onChangeText={setTempLocation}
              placeholder="Enter your location"
              placeholderTextColor={currentTheme.colorTextSecondary}
              autoFocus
            />
          </View>
        </View>
      </Modal>

      {/* Privacy Policy Modal */}
      <PrivacyPolicyModal
        visible={privacyPolicyModalVisible}
        onClose={() => setPrivacyPolicyModalVisible(false)}
      />

      {/* Terms of Service Modal */}
      <TermsOfServiceModal
        visible={termsOfServiceModalVisible}
        onClose={() => setTermsOfServiceModalVisible(false)}
      />

      {/* Rating Modal */}
      <RatingModal
        visible={ratingModalVisible}
        onClose={() => setRatingModalVisible(false)}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 20,
  },
  header: {
    alignItems: "center",
    paddingVertical: 32,
    paddingHorizontal: 20,
  },
  profileIcon: {
    width: 120,
    height: 120,
    borderRadius: 60,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
    position: "relative",
  },
  profileImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
  },
  editProfileBadge: {
    position: "absolute",
    bottom: 7,
    right: 44,
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: "bold",
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 16,
  },
  statsContainer: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  statsGrid: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 12,
  },
  statCard: {
    flex: 1,
    borderRadius: 12,
    padding: 16,
    alignItems: "center",
    borderWidth: 1,
  },
  statNumber: {
    fontSize: 24,
    fontWeight: "bold",
    marginTop: 8,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    textAlign: "center",
  },
  section: {
    marginBottom: 24,
    paddingHorizontal: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "600",
    marginBottom: 16,
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderRadius: 12,
    marginBottom: 8,
    borderWidth: 1,
  },
  menuItemLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  menuItemText: {
    marginLeft: 16,
    flex: 1,
  },
  menuItemTitle: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 2,
  },
  menuItemSubtitle: {
    fontSize: 14,
  },
  bottomSpacing: {
    height: 40,
  },
  text: {
    fontSize: 24,
  },
  buttonSpacing: {
    height: 16,
  },
  toggleIndicator: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  modalContainer: {
    flex: 1,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    borderBottomWidth: 1,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "600",
  },
  modalButton: {
    fontSize: 16,
    fontWeight: "600",
  },
  modalContent: {
    padding: 20,
  },
  modalInput: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
  },
});
