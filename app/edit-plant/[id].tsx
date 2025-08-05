import React, { useState, useEffect } from "react";
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  StatusBar,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import FontAwesome6 from "@expo/vector-icons/FontAwesome6";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useTheme } from "../../contexts/ThemeContext";
import { usePlantIdentificationStore } from "@/store/plantIdentification";
import type { PlantProfile } from "@/store/plantIdentification";

interface EditableFieldProps {
  label: string;
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  multiline?: boolean;
  icon?: string;
  currentTheme: any;
}

const EditableField: React.FC<EditableFieldProps> = ({
  label,
  value,
  onChangeText,
  placeholder,
  multiline = false,
  icon,
  currentTheme,
}) => (
  <View
    style={[
      styles.fieldContainer,
      { backgroundColor: currentTheme.colorSurface },
    ]}
  >
    <View style={styles.fieldHeader}>
      {icon && (
        <FontAwesome6
          name={icon as any}
          size={16}
          color={currentTheme.colorLeafyGreen}
        />
      )}
      <Text style={[styles.fieldLabel, { color: currentTheme.colorText }]}>
        {label}
      </Text>
    </View>
    <TextInput
      style={[
        styles.textInput,
        multiline && styles.multilineInput,
        {
          color: currentTheme.colorText,
          backgroundColor: currentTheme.colorBackground,
          borderColor: currentTheme.colorBorder || "#e0e0e0",
        },
      ]}
      placeholderTextColor={currentTheme.colorTextSecondary}
      value={value}
      onChangeText={onChangeText}
      placeholder={placeholder}
      multiline={multiline}
      numberOfLines={multiline ? 4 : 1}
    />
  </View>
);

interface DropdownFieldProps {
  label: string;
  value: string;
  options: string[];
  onSelect: (value: string) => void;
  icon?: string;
  currentTheme: any;
}

const DropdownField: React.FC<DropdownFieldProps> = ({
  label,
  value,
  options,
  onSelect,
  icon,
  currentTheme,
}) => {
  const [showOptions, setShowOptions] = useState(false);

  return (
    <View
      style={[
        styles.fieldContainer,
        { backgroundColor: currentTheme.colorSurface },
      ]}
    >
      <View style={styles.fieldHeader}>
        {icon && (
          <FontAwesome6
            name={icon as any}
            size={16}
            color={currentTheme.colorLeafyGreen}
          />
        )}
        <Text style={[styles.fieldLabel, { color: currentTheme.colorText }]}>
          {label}
        </Text>
      </View>
      <TouchableOpacity
        style={[
          styles.dropdownButton,
          {
            backgroundColor: currentTheme.colorBackground,
            borderColor: currentTheme.colorBorder || "#e0e0e0",
          },
        ]}
        onPress={() => setShowOptions(!showOptions)}
      >
        <Text style={[styles.dropdownText, { color: currentTheme.colorText }]}>
          {value}
        </Text>
        <FontAwesome6
          name={showOptions ? "chevron-up" : "chevron-down"}
          size={14}
          color={currentTheme.colorTextSecondary}
        />
      </TouchableOpacity>
      {showOptions && (
        <View
          style={[
            styles.optionsContainer,
            {
              backgroundColor: currentTheme.colorBackground,
              borderColor: currentTheme.colorBorder || "#e0e0e0",
            },
          ]}
        >
          {options.map((option, index) => (
            <TouchableOpacity
              key={index}
              style={[
                styles.optionItem,
                option === value && [
                  styles.selectedOption,
                  { backgroundColor: currentTheme.colorLeafyGreen },
                ],
              ]}
              onPress={() => {
                onSelect(option);
                setShowOptions(false);
              }}
            >
              <Text
                style={[
                  styles.optionText,
                  { color: currentTheme.colorText },
                  option === value && [
                    styles.selectedOptionText,
                    { color: currentTheme.colorTextInverse },
                  ],
                ]}
              >
                {option}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      )}
    </View>
  );
};

export default function EditPlantScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const { myPlants, updatePlant } = usePlantIdentificationStore();
  const { theme: currentTheme, isDark } = useTheme();
  const insets = useSafeAreaInsets();

  const [plant, setPlant] = useState<PlantProfile | null>(null);
  const [editedPlant, setEditedPlant] = useState<PlantProfile | null>(null);
  const [hasChanges, setHasChanges] = useState(false);

  // Dropdown options
  const wateringFrequencyOptions = [
    "Daily",
    "Every 2 days",
    "Every 3 days",
    "Weekly",
    "Bi-weekly",
    "Monthly",
  ];

  const wateringAmountOptions = [
    "Light watering",
    "Moderate watering",
    "Deep watering",
    "Thorough soaking",
  ];

  const sunlightOptions = [
    "Direct sunlight",
    "Bright indirect light",
    "Partial shade",
    "Low light",
    "Artificial light",
  ];

  const soilTypeOptions = [
    "Well-draining potting mix",
    "Cactus/succulent mix",
    "Rich organic soil",
    "Sandy soil",
    "Clay soil",
    "Hydroponic",
  ];

  useEffect(() => {
    const foundPlant = myPlants.find((p) => p.id === id);
    if (foundPlant) {
      setPlant(foundPlant);
      setEditedPlant({ ...foundPlant });
    } else {
      Alert.alert(
        "Plant Not Found",
        "This plant could not be found in your collection.",
        [{ text: "OK", onPress: () => router.back() }]
      );
    }
  }, [id, myPlants]);

  useEffect(() => {
    if (plant && editedPlant) {
      const hasChanges = JSON.stringify(plant) !== JSON.stringify(editedPlant);
      setHasChanges(hasChanges);
    }
  }, [plant, editedPlant]);

  if (!plant || !editedPlant) {
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

  const handleSave = () => {
    if (!hasChanges) {
      router.back();
      return;
    }

    // Check if watering frequency was changed for better user feedback
    const wateringFrequencyChanged =
      editedPlant.careDetails.wateringFrequency !==
      plant.careDetails.wateringFrequency;

    const saveMessage = wateringFrequencyChanged
      ? "Save changes to this plant? The watering schedule and notifications will be updated automatically."
      : "Are you sure you want to save the changes to this plant?";

    Alert.alert("Save Changes", saveMessage, [
      { text: "Cancel", style: "cancel" },
      {
        text: "Save",
        onPress: () => {
          updatePlant(plant.id, editedPlant);
          router.back();
          setTimeout(() => {
            const successMessage = wateringFrequencyChanged
              ? "Plant information updated! Watering schedule and notifications have been automatically adjusted."
              : "Plant information has been updated!";
            Alert.alert("Success", successMessage);
          }, 500);
        },
      },
    ]);
  };

  const handleCancel = () => {
    if (hasChanges) {
      Alert.alert(
        "Discard Changes",
        "You have unsaved changes. Are you sure you want to go back?",
        [
          { text: "Keep Editing", style: "cancel" },
          {
            text: "Discard",
            style: "destructive",
            onPress: () => router.back(),
          },
        ]
      );
    } else {
      router.back();
    }
  };

  const updateField = (field: string, value: any) => {
    if (field.includes(".")) {
      const [parent, child] = field.split(".");
      setEditedPlant((prev) => {
        if (!prev) return prev;
        const parentObj = prev[parent as keyof PlantProfile] as any;
        return {
          ...prev,
          [parent]: {
            ...parentObj,
            [child]: value,
          },
        };
      });
    } else {
      setEditedPlant((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          [field]: value,
        };
      });
    }
  };

  return (
    <KeyboardAvoidingView
      style={[
        styles.container,
        {
          paddingTop: insets.top,
          backgroundColor: currentTheme.colorBackground,
        },
      ]}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <StatusBar
        barStyle={isDark ? "light-content" : "dark-content"}
        backgroundColor={currentTheme.colorBackground}
      />

      {/* Header */}
      <View
        style={[
          styles.header,
          {
            backgroundColor: currentTheme.colorBackground,
            borderBottomColor: currentTheme.colorBorder || "#f0f0f0",
          },
        ]}
      >
        <TouchableOpacity style={styles.backButton} onPress={handleCancel}>
          <FontAwesome6
            name="arrow-left"
            size={22}
            color={currentTheme.colorLeafyGreen}
          />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: currentTheme.colorText }]}>
          Edit Plant
        </Text>
        <TouchableOpacity
          style={[
            styles.saveButton,
            !hasChanges && styles.saveButtonDisabled,
            {
              backgroundColor: hasChanges
                ? currentTheme.colorLeafyGreen
                : currentTheme.colorSurface,
            },
          ]}
          onPress={handleSave}
        >
          <FontAwesome
            name="save"
            size={24}
            color={
              hasChanges
                ? currentTheme.colorTextInverse
                : currentTheme.colorTextSecondary
            }
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
        {/* Basic Information */}
        <View
          style={[
            styles.section,
            { backgroundColor: currentTheme.colorBackground },
          ]}
        >
          <Text
            style={[styles.sectionTitle, { color: currentTheme.colorText }]}
          >
            Basic Information
          </Text>

          <EditableField
            label="Plant Name"
            value={editedPlant.name}
            onChangeText={(text) => updateField("name", text)}
            placeholder="Enter plant name"
            icon="seedling"
            currentTheme={currentTheme}
          />

          <EditableField
            label="Location"
            value={editedPlant.location || ""}
            onChangeText={(text) => updateField("location", text)}
            placeholder="e.g., Living room, Kitchen window"
            icon="location-dot"
            currentTheme={currentTheme}
          />

          <EditableField
            label="Notes"
            value={editedPlant.notes || ""}
            onChangeText={(text) => updateField("notes", text)}
            placeholder="Add any personal notes about this plant"
            icon="note-sticky"
            multiline
            currentTheme={currentTheme}
          />
        </View>

        {/* Care Instructions */}
        <View
          style={[
            styles.section,
            { backgroundColor: currentTheme.colorBackground },
          ]}
        >
          <Text
            style={[styles.sectionTitle, { color: currentTheme.colorText }]}
          >
            Care Instructions
          </Text>

          <DropdownField
            label="Watering Frequency"
            value={editedPlant.careDetails.wateringFrequency}
            options={wateringFrequencyOptions}
            onSelect={(value) =>
              updateField("careDetails.wateringFrequency", value)
            }
            icon="droplet"
            currentTheme={currentTheme}
          />

          <DropdownField
            label="Watering Amount"
            value={editedPlant.careDetails.wateringAmount}
            options={wateringAmountOptions}
            onSelect={(value) =>
              updateField("careDetails.wateringAmount", value)
            }
            icon="glass-water"
            currentTheme={currentTheme}
          />

          <DropdownField
            label="Sunlight Requirement"
            value={editedPlant.careDetails.sunlightRequirement}
            options={sunlightOptions}
            onSelect={(value) =>
              updateField("careDetails.sunlightRequirement", value)
            }
            icon="sun"
            currentTheme={currentTheme}
          />

          <EditableField
            label="Temperature"
            value={editedPlant.careDetails.temperature}
            onChangeText={(text) =>
              updateField("careDetails.temperature", text)
            }
            placeholder="e.g., 65-75°F (18-24°C)"
            icon="thermometer"
            currentTheme={currentTheme}
          />

          <EditableField
            label="Humidity"
            value={editedPlant.careDetails.humidity}
            onChangeText={(text) => updateField("careDetails.humidity", text)}
            placeholder="e.g., 40-60% humidity"
            icon="wind"
            currentTheme={currentTheme}
          />

          <DropdownField
            label="Soil Type"
            value={editedPlant.careDetails.soilType}
            options={soilTypeOptions}
            onSelect={(value) => updateField("careDetails.soilType", value)}
            icon="seedling"
            currentTheme={currentTheme}
          />

          <EditableField
            label="Fertilizing"
            value={editedPlant.careDetails.fertilizing}
            onChangeText={(text) =>
              updateField("careDetails.fertilizing", text)
            }
            placeholder="e.g., Monthly during growing season"
            icon="leaf"
            currentTheme={currentTheme}
          />

          <EditableField
            label="Pruning"
            value={editedPlant.careDetails.pruning}
            onChangeText={(text) => updateField("careDetails.pruning", text)}
            placeholder="e.g., Prune dead leaves as needed"
            icon="scissors"
            currentTheme={currentTheme}
          />

          <EditableField
            label="Growth Characteristics"
            value={editedPlant.careDetails.growthCharacteristics}
            onChangeText={(text) =>
              updateField("careDetails.growthCharacteristics", text)
            }
            placeholder="e.g., Fast growing, reaches 2-3 feet"
            icon="chart-line"
            multiline
            currentTheme={currentTheme}
          />
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
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
    paddingVertical: 26,
    borderBottomWidth: 1,
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
  saveButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 4,
  },
  saveButtonDisabled: {
    opacity: 0.6,
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: "600",
  },
  saveButtonTextDisabled: {
    opacity: 0.6,
  },
  scrollView: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    fontSize: 16,
    marginTop: 16,
    // Dynamic color will be applied inline
  },
  section: {
    paddingHorizontal: 20,
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 20,
    paddingTop: 15,
    fontWeight: "700",
    marginBottom: 20,
  },
  fieldContainer: {
    marginBottom: 20,
    padding: 16,
    borderRadius: 8,
  },
  fieldHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  fieldLabel: {
    fontSize: 16,
    fontWeight: "600",
    marginLeft: 8,
  },
  textInput: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
  },
  multilineInput: {
    height: 100,
    textAlignVertical: "top",
  },
  dropdownButton: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  dropdownText: {
    fontSize: 16,
    flex: 1,
  },
  optionsContainer: {
    borderWidth: 1,
    borderRadius: 8,
    marginTop: 4,
    maxHeight: 200,
  },
  optionItem: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(0,0,0,0.1)",
  },
  optionText: {
    fontSize: 16,
  },
  selectedOption: {
    // Dynamic background will be applied
  },
  selectedOptionText: {
    fontWeight: "600",
    // Dynamic color will be applied
  },
});
