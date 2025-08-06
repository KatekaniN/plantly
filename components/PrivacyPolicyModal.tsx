import React from "react";
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
} from "react-native";
import { FontAwesome6 } from "@expo/vector-icons";
import { useTheme } from "@/contexts/ThemeContext";

interface PrivacyPolicyModalProps {
  visible: boolean;
  onClose: () => void;
}

export const PrivacyPolicyModal: React.FC<PrivacyPolicyModalProps> = ({
  visible,
  onClose,
}) => {
  const { theme: currentTheme } = useTheme();

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
    >
      <View
        style={[
          styles.container,
          { backgroundColor: currentTheme.colorBackground },
        ]}
      >
        {/* Header */}
        <View
          style={[
            styles.header,
            { borderBottomColor: currentTheme.colorBorder },
          ]}
        >
          <Text style={[styles.title, { color: currentTheme.colorText }]}>
            Privacy Policy
          </Text>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <FontAwesome6
              name="xmark"
              size={24}
              color={currentTheme.colorTextSecondary}
            />
          </TouchableOpacity>
        </View>

        {/* Content */}
        <ScrollView style={styles.content}>
          <Text
            style={[
              styles.lastUpdated,
              { color: currentTheme.colorTextSecondary },
            ]}
          >
            Last updated: August 6, 2025
          </Text>

          <Text
            style={[styles.sectionTitle, { color: currentTheme.colorText }]}
          >
            Information We Collect
          </Text>
          <Text
            style={[
              styles.paragraph,
              { color: currentTheme.colorTextSecondary },
            ]}
          >
            Plantly collects information you provide directly to us, including:
          </Text>
          <Text
            style={[
              styles.bulletPoint,
              { color: currentTheme.colorTextSecondary },
            ]}
          >
            • Personal information (name, email address, location)
          </Text>
          <Text
            style={[
              styles.bulletPoint,
              { color: currentTheme.colorTextSecondary },
            ]}
          >
            • Plant collection data and care schedules
          </Text>
          <Text
            style={[
              styles.bulletPoint,
              { color: currentTheme.colorTextSecondary },
            ]}
          >
            • Photos of your plants (stored locally on your device)
          </Text>
          <Text
            style={[
              styles.bulletPoint,
              { color: currentTheme.colorTextSecondary },
            ]}
          >
            • App usage preferences and settings
          </Text>

          <Text
            style={[styles.sectionTitle, { color: currentTheme.colorText }]}
          >
            How We Use Your Information
          </Text>
          <Text
            style={[
              styles.paragraph,
              { color: currentTheme.colorTextSecondary },
            ]}
          >
            We use the information we collect to:
          </Text>
          <Text
            style={[
              styles.bulletPoint,
              { color: currentTheme.colorTextSecondary },
            ]}
          >
            • Provide and maintain the Plantly app services
          </Text>
          <Text
            style={[
              styles.bulletPoint,
              { color: currentTheme.colorTextSecondary },
            ]}
          >
            • Send you plant care reminders and tips (if subscribed)
          </Text>
          <Text
            style={[
              styles.bulletPoint,
              { color: currentTheme.colorTextSecondary },
            ]}
          >
            • Improve our app and develop new features
          </Text>
          <Text
            style={[
              styles.bulletPoint,
              { color: currentTheme.colorTextSecondary },
            ]}
          >
            • Respond to your comments and questions
          </Text>

          <Text
            style={[styles.sectionTitle, { color: currentTheme.colorText }]}
          >
            Data Storage and Security
          </Text>
          <Text
            style={[
              styles.paragraph,
              { color: currentTheme.colorTextSecondary },
            ]}
          >
            Your plant data is stored locally on your device. We implement
            appropriate security measures to protect your personal information
            against unauthorized access, alteration, disclosure, or destruction.
          </Text>

          <Text
            style={[styles.sectionTitle, { color: currentTheme.colorText }]}
          >
            Newsletter and Communications
          </Text>
          <Text
            style={[
              styles.paragraph,
              { color: currentTheme.colorTextSecondary },
            ]}
          >
            If you subscribe to our newsletter, we will send you plant care tips
            and app updates. You can unsubscribe at any time through the Profile
            section of the app.
          </Text>

          <Text
            style={[styles.sectionTitle, { color: currentTheme.colorText }]}
          >
            Data Export and Deletion
          </Text>
          <Text
            style={[
              styles.paragraph,
              { color: currentTheme.colorTextSecondary },
            ]}
          >
            You can export your plant data at any time through the app. You can
            also delete all your data using the "Clear All Data" option in the
            Profile section.
          </Text>

          <Text
            style={[styles.sectionTitle, { color: currentTheme.colorText }]}
          >
            Children's Privacy
          </Text>
          <Text
            style={[
              styles.paragraph,
              { color: currentTheme.colorTextSecondary },
            ]}
          >
            Plantly is not intended for children under 13 years of age. We do
            not knowingly collect personal information from children under 13.
          </Text>

          <Text
            style={[styles.sectionTitle, { color: currentTheme.colorText }]}
          >
            Changes to This Privacy Policy
          </Text>
          <Text
            style={[
              styles.paragraph,
              { color: currentTheme.colorTextSecondary },
            ]}
          >
            We may update this Privacy Policy from time to time. We will notify
            you of any changes by posting the new Privacy Policy in the app.
          </Text>

          <Text
            style={[styles.sectionTitle, { color: currentTheme.colorText }]}
          >
            Contact Us
          </Text>
          <Text
            style={[
              styles.paragraph,
              { color: currentTheme.colorTextSecondary },
            ]}
          >
            If you have any questions about this Privacy Policy, please contact
            us at support@plantly.app
          </Text>

          <View style={styles.bottomSpacing} />
        </ScrollView>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 20,
    borderBottomWidth: 1,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
  },
  closeButton: {
    padding: 4,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  lastUpdated: {
    fontSize: 14,
    fontStyle: "italic",
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginTop: 24,
    marginBottom: 12,
  },
  paragraph: {
    fontSize: 16,
    lineHeight: 24,
    marginBottom: 12,
  },
  bulletPoint: {
    fontSize: 16,
    lineHeight: 24,
    marginBottom: 6,
    marginLeft: 8,
  },
  bottomSpacing: {
    height: 40,
  },
});
