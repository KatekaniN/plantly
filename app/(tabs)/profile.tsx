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
} from "react-native";
import { PlantlyButton } from "@/components/PlantlyButton";
import { useUserStore } from "@/store/userStore";
import { usePlantIdentificationStore } from "@/store/plantIdentification";
import { useRouter } from "expo-router";
import { FontAwesome6, Octicons } from "@expo/vector-icons";
import { theme } from "@/theme";
import { useTheme } from "@/contexts/ThemeContext";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import * as FileSystem from "expo-file-system";

export default function ProfileScreen() {
  const toggleHasOnboarded = useUserStore((state) => state.toggleHasOnboarded);
  const { myPlants, clearAllData } = usePlantIdentificationStore();
  const { theme: currentTheme, themeType, setTheme, isDark } = useTheme();
  const router = useRouter();
  const insets = useSafeAreaInsets();

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

  // Handler functions for menu items
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
    try {
      await Share.share({
        message: "Check out Plantly - the best plant care app! 🌱",
        title: "Plantly App",
      });
    } catch (error) {
      Alert.alert(
        "Rate Plantly",
        "Thank you for wanting to rate our app! This feature will direct you to the app store.",
        [{ text: "OK" }]
      );
    }
  };

  const handleTermsOfService = () => {
    Alert.alert(
      "Terms of Service",
      "This will open the Terms of Service in your browser.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Open",
          onPress: () => Linking.openURL("https://plantly.app/terms"),
        },
      ]
    );
  };

  const handlePrivacyPolicy = () => {
    Alert.alert(
      "Privacy Policy",
      "This will open the Privacy Policy in your browser.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Open",
          onPress: () => Linking.openURL("https://plantly.app/privacy"),
        },
      ]
    );
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
        <View
          style={[
            styles.profileIcon,
            { backgroundColor: currentTheme.colorSurface },
          ]}
        >
          <FontAwesome6
            name="user"
            size={32}
            color={currentTheme.colorLeafyGreen}
          />
        </View>
        <Text style={[styles.headerTitle, { color: currentTheme.colorText }]}>
          My Profile
        </Text>
        <Text
          style={[
            styles.headerSubtitle,
            { color: currentTheme.colorTextSecondary },
          ]}
        >
          Plant Care Dashboard
        </Text>
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

        <TouchableOpacity
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
        </TouchableOpacity>
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

        <TouchableOpacity
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
        </TouchableOpacity>

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

        <TouchableOpacity
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
        </TouchableOpacity>

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
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
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
});
