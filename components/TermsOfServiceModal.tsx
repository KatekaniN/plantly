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

interface TermsOfServiceModalProps {
  visible: boolean;
  onClose: () => void;
}

export const TermsOfServiceModal: React.FC<TermsOfServiceModalProps> = ({
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
            Terms of Service
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
            Acceptance of Terms
          </Text>
          <Text
            style={[
              styles.paragraph,
              { color: currentTheme.colorTextSecondary },
            ]}
          >
            By downloading, installing, or using the Plantly app, you agree to
            be bound by these Terms of Service. If you do not agree to these
            terms, please do not use the app.
          </Text>

          <Text
            style={[styles.sectionTitle, { color: currentTheme.colorText }]}
          >
            Description of Service
          </Text>
          <Text
            style={[
              styles.paragraph,
              { color: currentTheme.colorTextSecondary },
            ]}
          >
            Plantly is a plant care management application that helps users:
          </Text>
          <Text
            style={[
              styles.bulletPoint,
              { color: currentTheme.colorTextSecondary },
            ]}
          >
            • Track and manage their plant collection
          </Text>
          <Text
            style={[
              styles.bulletPoint,
              { color: currentTheme.colorTextSecondary },
            ]}
          >
            • Set watering reminders and care schedules
          </Text>
          <Text
            style={[
              styles.bulletPoint,
              { color: currentTheme.colorTextSecondary },
            ]}
          >
            • Access plant care information and tips
          </Text>
          <Text
            style={[
              styles.bulletPoint,
              { color: currentTheme.colorTextSecondary },
            ]}
          >
            • Identify plants using camera functionality
          </Text>

          <Text
            style={[styles.sectionTitle, { color: currentTheme.colorText }]}
          >
            User Responsibilities
          </Text>
          <Text
            style={[
              styles.paragraph,
              { color: currentTheme.colorTextSecondary },
            ]}
          >
            You agree to:
          </Text>
          <Text
            style={[
              styles.bulletPoint,
              { color: currentTheme.colorTextSecondary },
            ]}
          >
            • Use the app only for lawful purposes
          </Text>
          <Text
            style={[
              styles.bulletPoint,
              { color: currentTheme.colorTextSecondary },
            ]}
          >
            • Provide accurate information when creating your profile
          </Text>
          <Text
            style={[
              styles.bulletPoint,
              { color: currentTheme.colorTextSecondary },
            ]}
          >
            • Not attempt to reverse engineer or modify the app
          </Text>
          <Text
            style={[
              styles.bulletPoint,
              { color: currentTheme.colorTextSecondary },
            ]}
          >
            • Not use the app to distribute harmful or malicious content
          </Text>

          <Text
            style={[styles.sectionTitle, { color: currentTheme.colorText }]}
          >
            Plant Care Information
          </Text>
          <Text
            style={[
              styles.paragraph,
              { color: currentTheme.colorTextSecondary },
            ]}
          >
            The plant care information provided in Plantly is for general
            guidance only. We are not responsible for any damage to your plants
            resulting from following our recommendations. Always research
            specific care requirements for your plants.
          </Text>

          <Text
            style={[styles.sectionTitle, { color: currentTheme.colorText }]}
          >
            Camera and Photo Features
          </Text>
          <Text
            style={[
              styles.paragraph,
              { color: currentTheme.colorTextSecondary },
            ]}
          >
            The plant identification feature uses your device's camera. Photos
            are processed locally on your device and are not uploaded to our
            servers unless you explicitly choose to share them.
          </Text>

          <Text
            style={[styles.sectionTitle, { color: currentTheme.colorText }]}
          >
            Intellectual Property
          </Text>
          <Text
            style={[
              styles.paragraph,
              { color: currentTheme.colorTextSecondary },
            ]}
          >
            The Plantly app, including its design, features, and content, is
            owned by us and protected by copyright and other intellectual
            property laws. You may not copy, modify, or distribute any part of
            the app without our permission.
          </Text>

          <Text
            style={[styles.sectionTitle, { color: currentTheme.colorText }]}
          >
            Disclaimers
          </Text>
          <Text
            style={[
              styles.paragraph,
              { color: currentTheme.colorTextSecondary },
            ]}
          >
            The app is provided "as is" without warranties of any kind. We do
            not guarantee that the app will be error-free or continuously
            available. We are not liable for any damages resulting from your use
            of the app.
          </Text>

          <Text
            style={[styles.sectionTitle, { color: currentTheme.colorText }]}
          >
            Limitation of Liability
          </Text>
          <Text
            style={[
              styles.paragraph,
              { color: currentTheme.colorTextSecondary },
            ]}
          >
            To the maximum extent permitted by law, we shall not be liable for
            any indirect, incidental, special, or consequential damages arising
            from your use of the app.
          </Text>

          <Text
            style={[styles.sectionTitle, { color: currentTheme.colorText }]}
          >
            Termination
          </Text>
          <Text
            style={[
              styles.paragraph,
              { color: currentTheme.colorTextSecondary },
            ]}
          >
            We may terminate or suspend your access to the app at any time, with
            or without notice, for any reason including violation of these
            terms.
          </Text>

          <Text
            style={[styles.sectionTitle, { color: currentTheme.colorText }]}
          >
            Changes to Terms
          </Text>
          <Text
            style={[
              styles.paragraph,
              { color: currentTheme.colorTextSecondary },
            ]}
          >
            We reserve the right to modify these terms at any time. Changes will
            be effective immediately upon posting in the app. Continued use of
            the app after changes constitutes acceptance of the new terms.
          </Text>

          <Text
            style={[styles.sectionTitle, { color: currentTheme.colorText }]}
          >
            Contact Information
          </Text>
          <Text
            style={[
              styles.paragraph,
              { color: currentTheme.colorTextSecondary },
            ]}
          >
            If you have questions about these Terms of Service, please contact
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
