import React, { useState } from "react";
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  Switch,
  StatusBar,
  Alert,
  Modal,
} from "react-native";
import { useRouter } from "expo-router";
import { FontAwesome } from "@expo/vector-icons";
import FontAwesome6 from "@expo/vector-icons/FontAwesome6";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { theme } from "../theme";
import { usePlantIdentificationStore } from "@/store/plantIdentification";

interface TimePickerFieldProps {
  label: string;
  time: { hour: number; minute: number };
  onTimeChange: (time: { hour: number; minute: number }) => void;
  icon: string;
  description?: string;
  enabled?: boolean;
}

const TimePickerField: React.FC<TimePickerFieldProps> = ({
  label,
  time,
  onTimeChange,
  icon,
  description,
  enabled = true,
}) => {
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [selectedHour, setSelectedHour] = useState(time.hour);
  const [selectedMinute, setSelectedMinute] = useState(time.minute);

  const formatTime = (hour: number, minute: number) => {
    const period = hour >= 12 ? "PM" : "AM";
    const displayHour = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
    const displayMinute = minute.toString().padStart(2, "0");
    return `${displayHour}:${displayMinute} ${period}`;
  };

  const handleSaveTime = () => {
    onTimeChange({ hour: selectedHour, minute: selectedMinute });
    setShowTimePicker(false);
  };

  const hours = Array.from({ length: 24 }, (_, i) => i);
  const minutes = Array.from({ length: 12 }, (_, i) => i * 5); // 5-minute intervals

  return (
    <View
      style={[styles.timePickerContainer, !enabled && styles.disabledContainer]}
    >
      <View style={styles.timePickerHeader}>
        <FontAwesome6
          name={icon as any}
          size={16}
          color={enabled ? theme.colorLeafyGreen : theme.colorGrey}
        />
        <View style={styles.timePickerLabelContainer}>
          <Text
            style={[styles.timePickerLabel, !enabled && styles.disabledText]}
          >
            {label}
          </Text>
          {description && (
            <Text
              style={[
                styles.timePickerDescription,
                !enabled && styles.disabledText,
              ]}
            >
              {description}
            </Text>
          )}
        </View>
      </View>

      <TouchableOpacity
        style={[styles.timePickerButton, !enabled && styles.disabledButton]}
        onPress={() => setShowTimePicker(true)}
        disabled={!enabled}
      >
        <Text style={[styles.timePickerText, !enabled && styles.disabledText]}>
          {formatTime(time.hour, time.minute)}
        </Text>
        <FontAwesome6
          name="clock"
          size={14}
          color={enabled ? theme.colorLeafyGreen : theme.colorGrey}
        />
      </TouchableOpacity>

      <Modal
        visible={showTimePicker}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowTimePicker(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.timePickerModal}>
            <Text style={styles.modalTitle}>Select Time</Text>

            <View style={styles.timePickerRow}>
              <View style={styles.pickerColumn}>
                <Text style={styles.pickerLabel}>Hour</Text>
                <ScrollView
                  style={styles.picker}
                  showsVerticalScrollIndicator={false}
                >
                  {hours.map((hour) => (
                    <TouchableOpacity
                      key={hour}
                      style={[
                        styles.pickerItem,
                        selectedHour === hour && styles.selectedPickerItem,
                      ]}
                      onPress={() => setSelectedHour(hour)}
                    >
                      <Text
                        style={[
                          styles.pickerItemText,
                          selectedHour === hour &&
                            styles.selectedPickerItemText,
                        ]}
                      >
                        {hour === 0 ? 12 : hour > 12 ? hour - 12 : hour}{" "}
                        {hour >= 12 ? "PM" : "AM"}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>

              <View style={styles.pickerColumn}>
                <Text style={styles.pickerLabel}>Minute</Text>
                <ScrollView
                  style={styles.picker}
                  showsVerticalScrollIndicator={false}
                >
                  {minutes.map((minute) => (
                    <TouchableOpacity
                      key={minute}
                      style={[
                        styles.pickerItem,
                        selectedMinute === minute && styles.selectedPickerItem,
                      ]}
                      onPress={() => setSelectedMinute(minute)}
                    >
                      <Text
                        style={[
                          styles.pickerItemText,
                          selectedMinute === minute &&
                            styles.selectedPickerItemText,
                        ]}
                      >
                        {minute.toString().padStart(2, "0")}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>
            </View>

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setShowTimePicker(false)}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.modalSaveButton]}
                onPress={handleSaveTime}
              >
                <Text style={styles.modalSaveButtonText}>Save</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

interface ToggleTimePickerProps {
  label: string;
  description: string;
  time: { hour: number; minute: number };
  enabled: boolean;
  onToggle: (enabled: boolean) => void;
  onTimeChange: (time: { hour: number; minute: number }) => void;
  icon: string;
  disabled?: boolean;
  trackColor?: string;
  thumbColor?: string;
}

const ToggleTimePicker: React.FC<ToggleTimePickerProps> = ({
  label,
  description,
  time,
  enabled,
  onToggle,
  onTimeChange,
  icon,
  disabled = false,
  trackColor,
  thumbColor,
}) => {
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [selectedHour, setSelectedHour] = useState(time.hour);
  const [selectedMinute, setSelectedMinute] = useState(time.minute);

  const formatTime = (hour: number, minute: number) => {
    const period = hour >= 12 ? "PM" : "AM";
    const displayHour = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
    const displayMinute = minute.toString().padStart(2, "0");
    return `${displayHour}:${displayMinute} ${period}`;
  };

  const handleSaveTime = () => {
    onTimeChange({ hour: selectedHour, minute: selectedMinute });
    setShowTimePicker(false);
  };

  const hours = Array.from({ length: 24 }, (_, i) => i);
  const minutes = Array.from({ length: 12 }, (_, i) => i * 5); // 5-minute intervals

  return (
    <View style={styles.toggleTimePickerContainer}>
      {/* Main container with grey background */}
      <View style={styles.toggleTimePickerBackground}>
        {/* Toggle Row */}
        <View style={styles.reminderToggleRow}>
          <View style={styles.reminderToggleInfo}>
            {icon === "exclamation-triangle" ? (
              <FontAwesome
                name={icon as any}
                size={16}
                color={
                  enabled
                    ? trackColor || theme.colorLeafyGreen
                    : theme.colorGrey
                }
              />
            ) : (
              <FontAwesome6
                name={icon as any}
                size={16}
                color={
                  enabled
                    ? trackColor || theme.colorLeafyGreen
                    : theme.colorGrey
                }
              />
            )}
            <View style={styles.toggleTextContainer}>
              <Text
                style={[
                  styles.reminderToggleLabel,
                  !enabled && styles.disabledText,
                ]}
              >
                {label}
              </Text>
              <Text
                style={[
                  styles.toggleDescription,
                  !enabled && styles.disabledText,
                ]}
              >
                {description}
              </Text>
            </View>
          </View>
          <Switch
            value={enabled}
            onValueChange={onToggle}
            disabled={disabled}
            trackColor={{
              false: "#e0e0e0",
              true: (trackColor || theme.colorLeafyGreen) + "40",
            }}
            thumbColor={
              enabled
                ? thumbColor || trackColor || theme.colorLeafyGreen
                : "#f4f3f4"
            }
          />
        </View>

        {/* Time Picker Row - Only show when enabled */}
        {enabled && (
          <View style={styles.timePickerInlineRow}>
            <Text style={styles.timeLabel}>Time:</Text>
            <TouchableOpacity
              style={styles.inlineTimeButton}
              onPress={() => setShowTimePicker(true)}
            >
              <Text style={styles.timePickerText}>
                {formatTime(time.hour, time.minute)}
              </Text>
              <FontAwesome6
                name="clock"
                size={14}
                color={theme.colorLeafyGreen}
              />
            </TouchableOpacity>
          </View>
        )}
      </View>

      {/* Time Picker Modal */}
      <Modal
        visible={showTimePicker}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowTimePicker(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.timePickerModal}>
            <Text style={styles.modalTitle}>Select {label} Time</Text>

            <View style={styles.timePickerRow}>
              <View style={styles.pickerColumn}>
                <Text style={styles.pickerLabel}>Hour</Text>
                <ScrollView
                  style={styles.picker}
                  showsVerticalScrollIndicator={false}
                >
                  {hours.map((hour) => (
                    <TouchableOpacity
                      key={hour}
                      style={[
                        styles.pickerItem,
                        selectedHour === hour && styles.selectedPickerItem,
                      ]}
                      onPress={() => setSelectedHour(hour)}
                    >
                      <Text
                        style={[
                          styles.pickerItemText,
                          selectedHour === hour &&
                            styles.selectedPickerItemText,
                        ]}
                      >
                        {hour === 0 ? 12 : hour > 12 ? hour - 12 : hour}{" "}
                        {hour >= 12 ? "PM" : "AM"}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>

              <View style={styles.pickerColumn}>
                <Text style={styles.pickerLabel}>Minute</Text>
                <ScrollView
                  style={styles.picker}
                  showsVerticalScrollIndicator={false}
                >
                  {minutes.map((minute) => (
                    <TouchableOpacity
                      key={minute}
                      style={[
                        styles.pickerItem,
                        selectedMinute === minute && styles.selectedPickerItem,
                      ]}
                      onPress={() => setSelectedMinute(minute)}
                    >
                      <Text
                        style={[
                          styles.pickerItemText,
                          selectedMinute === minute &&
                            styles.selectedPickerItemText,
                        ]}
                      >
                        {minute.toString().padStart(2, "0")}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>
            </View>

            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => setShowTimePicker(false)}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.modalSaveButton]}
                onPress={handleSaveTime}
              >
                <Text style={styles.modalSaveButtonText}>Save</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

export default function NotificationSettingsScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { notificationPreferences, updateNotificationPreferences } =
    usePlantIdentificationStore();

  const [preferences, setPreferences] = useState(notificationPreferences);

  const handleSave = () => {
    updateNotificationPreferences(preferences);
    Alert.alert(
      "Settings Saved",
      "Your notification preferences have been updated! All plant reminders will use the new times.",
      [{ text: "OK", onPress: () => router.back() }]
    );
  };

  const handleCancel = () => {
    const hasChanges =
      JSON.stringify(preferences) !== JSON.stringify(notificationPreferences);
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

  const updatePreference = (key: keyof typeof preferences, value: any) => {
    setPreferences((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={handleCancel}>
          <FontAwesome6
            name="arrow-left"
            size={22}
            color={theme.colorLeafyGreen}
          />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Notification Settings</Text>
        <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
          <FontAwesome name="save" size={24} color={theme.colorWhite} />
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={{
          paddingBottom: Math.max(insets.bottom + 40, 60),
          flexGrow: 1,
        }}
        showsVerticalScrollIndicator={false}
        bounces={true}
        keyboardShouldPersistTaps="handled"
      >
        {/* Main Notifications Toggle */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>General Settings</Text>

          <View style={styles.settingRow}>
            <View style={styles.settingInfo}>
              <FontAwesome6
                name="bell"
                size={16}
                color={theme.colorLeafyGreen}
              />
              <View style={styles.settingTextContainer}>
                <Text style={styles.settingLabel}>Enable Notifications</Text>
                <Text style={styles.settingDescription}>
                  Receive reminders to water your plants
                </Text>
              </View>
            </View>
            <Switch
              value={preferences.enableNotifications}
              onValueChange={(value) =>
                updatePreference("enableNotifications", value)
              }
              trackColor={{
                false: "#e0e0e0",
                true: theme.colorLeafyGreen + "40",
              }}
              thumbColor={
                preferences.enableNotifications
                  ? theme.colorLeafyGreen
                  : "#f4f3f4"
              }
            />
          </View>
        </View>

        {/* Reminder Times */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Reminder Times</Text>
          <Text style={styles.sectionSubtitle}>
            Choose when you'd like to receive different types of reminders
          </Text>

          <TimePickerField
            label="Daily Watering Reminders"
            description="When to remind you on watering day"
            time={preferences.reminderTime}
            onTimeChange={(time) => updatePreference("reminderTime", time)}
            icon="droplet"
            enabled={preferences.enableNotifications}
          />

          <ToggleTimePicker
            label="Day Before Reminders"
            description="Get reminded the evening before watering day"
            time={preferences.dayBeforeTime}
            enabled={preferences.enableDayBeforeReminders}
            onToggle={(value) =>
              updatePreference("enableDayBeforeReminders", value)
            }
            onTimeChange={(time) => updatePreference("dayBeforeTime", time)}
            icon="calendar-minus"
            disabled={!preferences.enableNotifications}
            trackColor={theme.colorLeafyGreen}
          />

          <ToggleTimePicker
            label="Overdue Reminders"
            description="Get notified when plants are overdue for watering"
            time={preferences.overdueTime}
            enabled={preferences.enableOverdueReminders}
            onToggle={(value) =>
              updatePreference("enableOverdueReminders", value)
            }
            onTimeChange={(time) => updatePreference("overdueTime", time)}
            icon="exclamation-triangle"
            disabled={!preferences.enableNotifications}
            trackColor={theme.colorDarkGreen}
            thumbColor={theme.colorDarkGreen}
          />
        </View>

        {/* Preview Section */}
        <View style={[styles.section, styles.lastSection]}>
          <Text style={styles.sectionTitle}>Preview</Text>
          <Text style={styles.sectionSubtitle}>
            Based on your settings, here's when you'll receive notifications:
          </Text>

          <View style={styles.previewContainer}>
            {preferences.enableNotifications ? (
              <>
                {preferences.enableDayBeforeReminders && (
                  <View style={styles.previewItem}>
                    <FontAwesome6
                      name="calendar-minus"
                      size={14}
                      color={theme.colorLeafyGreen}
                    />
                    <Text style={styles.previewText}>
                      Day before at{" "}
                      {preferences.dayBeforeTime.hour >= 12
                        ? `${preferences.dayBeforeTime.hour === 12 ? 12 : preferences.dayBeforeTime.hour - 12}:${preferences.dayBeforeTime.minute.toString().padStart(2, "0")} PM`
                        : `${preferences.dayBeforeTime.hour === 0 ? 12 : preferences.dayBeforeTime.hour}:${preferences.dayBeforeTime.minute.toString().padStart(2, "0")} AM`}
                    </Text>
                  </View>
                )}

                <View style={styles.previewItem}>
                  <FontAwesome6
                    name="droplet"
                    size={14}
                    color={theme.colorLeafyGreen}
                  />
                  <Text style={styles.previewText}>
                    Watering day at{" "}
                    {preferences.reminderTime.hour >= 12
                      ? `${preferences.reminderTime.hour === 12 ? 12 : preferences.reminderTime.hour - 12}:${preferences.reminderTime.minute.toString().padStart(2, "0")} PM`
                      : `${preferences.reminderTime.hour === 0 ? 12 : preferences.reminderTime.hour}:${preferences.reminderTime.minute.toString().padStart(2, "0")} AM`}
                  </Text>
                </View>

                {preferences.enableOverdueReminders && (
                  <View style={styles.previewItem}>
                    <FontAwesome
                      name="exclamation-triangle"
                      size={14}
                      color={theme.colorDarkGreen}
                    />
                    <Text style={styles.previewText}>
                      If overdue at{" "}
                      {preferences.overdueTime.hour >= 12
                        ? `${preferences.overdueTime.hour === 12 ? 12 : preferences.overdueTime.hour - 12}:${preferences.overdueTime.minute.toString().padStart(2, "0")} PM`
                        : `${preferences.overdueTime.hour === 0 ? 12 : preferences.overdueTime.hour}:${preferences.overdueTime.minute.toString().padStart(2, "0")} AM`}
                    </Text>
                  </View>
                )}
              </>
            ) : (
              <View style={styles.previewItem}>
                <FontAwesome6
                  name="bell-slash"
                  size={14}
                  color={theme.colorGrey}
                />
                <Text style={[styles.previewText, styles.disabledText]}>
                  Notifications are disabled
                </Text>
              </View>
            )}
          </View>
        </View>
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
    paddingVertical: 20,
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
  saveButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius:4,
    backgroundColor: theme.colorLeafyGreen,
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: theme.colorWhite,
  },
  scrollView: {
    flex: 1,
  },
  section: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    marginBottom: 40,
  },
  lastSection: {
    marginBottom: 80,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: theme.colorLeafyGreen,
    marginBottom: 20,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: theme.colorGrey,
    marginBottom: 20,
  },
  settingRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: "#f8f9fa",
    borderRadius: 8,
    marginBottom: 12,
  },
  settingInfo: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  settingTextContainer: {
    marginLeft: 12,
    flex: 1,
  },
  settingLabel: {
    fontSize: 16,
    fontWeight: "600",
    color: theme.colorLeafyGreen,
  },
  settingDescription: {
    fontSize: 14,
    color: theme.colorGrey,
    marginTop: 2,
  },
  timePickerContainer: {
    marginBottom: 16,
    padding: 16,
    backgroundColor: "#f8f9fa",
    borderRadius: 8,
  },
  disabledContainer: {
    opacity: 0.5,
  },
  timePickerHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 12,
  },
  timePickerLabelContainer: {
    marginLeft: 12,
    flex: 1,
  },
  timePickerLabel: {
    fontSize: 16,
    fontWeight: "600",
    color: theme.colorLeafyGreen,
  },
  timePickerDescription: {
    fontSize: 14,
    color: theme.colorGrey,
    marginTop: 2,
  },
  timePickerButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: theme.colorWhite,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#e0e0e0",
  },
  disabledButton: {
    backgroundColor: "#f0f0f0",
  },
  timePickerText: {
    fontSize: 16,
    color: theme.colorLeafyGreen,
    fontWeight: "500",
  },
  disabledText: {
    color: theme.colorGrey,
  },
  reminderTypeSection: {
    marginTop: 8,
  },
  reminderToggleRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: "transparent",
    marginBottom: 0,
  },
  reminderToggleInfo: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  reminderToggleLabel: {
    fontSize: 16,
    fontWeight: "600",
    color: theme.colorLeafyGreen,
    marginLeft: 12,
  },
  previewContainer: {
    padding: 16,
    backgroundColor: "#f8f9fa",
    borderRadius: 8,
  },
  previewItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  previewText: {
    fontSize: 14,
    color: theme.colorLeafyGreen,
    marginLeft: 12,
    fontWeight: "500",
  },
  // Modal styles for time picker
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  timePickerModal: {
    backgroundColor: theme.colorWhite,
    borderRadius: 16,
    padding: 24,
    width: "90%",
    maxWidth: 400,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: theme.colorLeafyGreen,
    textAlign: "center",
    marginBottom: 20,
  },
  timePickerRow: {
    flexDirection: "row",
    gap: 20,
    marginBottom: 24,
  },
  pickerColumn: {
    flex: 1,
  },
  pickerLabel: {
    fontSize: 16,
    fontWeight: "500",
    color: theme.colorLeafyGreen,
    textAlign: "center",
    marginBottom: 12,
  },
  picker: {
    height: 200,
    borderWidth: 1,
    borderColor: "#e0e0e0",
    borderRadius: 8,
  },
  pickerItem: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
  },
  selectedPickerItem: {
    backgroundColor: theme.colorLeafyGreen,
  },
  pickerItemText: {
    fontSize: 16,
    color: theme.colorLeafyGreen,
    textAlign: "center",
  },
  selectedPickerItemText: {
    color: theme.colorWhite,
    fontWeight: "600",
  },
  modalButtons: {
    flexDirection: "row",
    gap: 12,
  },
  modalButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
  },
  cancelButton: {
    backgroundColor: "#e0e0e0",
  },
  modalSaveButton: {
    backgroundColor: theme.colorLeafyGreen,
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: theme.colorLeafyGreen,
  },
  modalSaveButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: theme.colorWhite,
  },
  // New styles for ToggleTimePicker
  toggleTimePickerContainer: {
    marginBottom: 16,
  },
  toggleTimePickerBackground: {
    backgroundColor: "#f8f9fa",
    borderRadius: 8,
    overflow: "hidden",
  },
  toggleTextContainer: {
    marginLeft: 12,
    flex: 1,
  },
  toggleDescription: {
    fontSize: 14,
    color: theme.colorGrey,
    marginTop: 2,
  },
  timePickerInlineRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingBottom: 12,
    backgroundColor: "#f8f9fa",
  },
  timeLabel: {
    fontSize: 14,
    color: theme.colorLeafyGreen,
    fontWeight: "500",
  },
  inlineTimeButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: theme.colorWhite,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: "#e0e0e0",
    gap: 8,
  },
});
