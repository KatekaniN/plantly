import React, { useState } from "react";
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  TextInput,
  StyleSheet,
  Alert,
  Linking,
  Platform,
} from "react-native";
import { FontAwesome6, FontAwesome } from "@expo/vector-icons";
import { useTheme } from "@/contexts/ThemeContext";

interface RatingModalProps {
  visible: boolean;
  onClose: () => void;
}

export const RatingModal: React.FC<RatingModalProps> = ({
  visible,
  onClose,
}) => {
  const { theme: currentTheme } = useTheme();
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");

  const handleStarPress = (selectedRating: number) => {
    setRating(selectedRating);
  };

  const handleSubmit = () => {
    if (rating === 0) {
      Alert.alert(
        "Rating Required",
        "Please select a star rating before submitting."
      );
      return;
    }

    const subject = encodeURIComponent("Plantly App - User Rating & Feedback");
    const ratingStars = "⭐".repeat(rating);
    const body = encodeURIComponent(`
Dear Plantly Team,

I would like to share my rating and feedback for the Plantly app:

Rating: ${rating}/5 stars ${ratingStars}

Comments:
${comment || "No additional comments provided."}

Device: ${Platform.OS}
App Version: 1.0.0

Thank you for creating this amazing plant care app!

Best regards,
`);

    Linking.openURL(
      `mailto:support@plantly.app?subject=${subject}&body=${body}`
    );

    // Reset form and close modal
    setRating(0);
    setComment("");
    onClose();
  };

  const handleCancel = () => {
    setRating(0);
    setComment("");
    onClose();
  };

  const getRatingText = (rating: number) => {
    switch (rating) {
      case 1:
        return "Poor";
      case 2:
        return "Fair";
      case 3:
        return "Good";
      case 4:
        return "Very Good";
      case 5:
        return "Excellent";
      default:
        return "Tap a star to rate";
    }
  };

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
          <TouchableOpacity onPress={handleCancel}>
            <Text
              style={[
                styles.headerButton,
                { color: currentTheme.colorTextSecondary },
              ]}
            >
              Cancel
            </Text>
          </TouchableOpacity>
          <Text style={[styles.title, { color: currentTheme.colorText }]}>
            Rate Plantly
          </Text>
          <TouchableOpacity onPress={handleSubmit}>
            <Text
              style={[
                styles.headerButton,
                { color: currentTheme.colorLeafyGreen },
              ]}
            >
              Submit
            </Text>
          </TouchableOpacity>
        </View>

        {/* Content */}
        <View style={styles.content}>
          {/* App Icon and Name */}
          <View style={styles.appSection}>
            <View
              style={[
                styles.appIcon,
                { backgroundColor: currentTheme.colorLeafyGreen },
              ]}
            >
              <FontAwesome6 name="seedling" size={32} color="white" />
            </View>
            <Text style={[styles.appName, { color: currentTheme.colorText }]}>
              Plantly
            </Text>
            <Text
              style={[
                styles.appDescription,
                { color: currentTheme.colorTextSecondary },
              ]}
            >
              Your Plant Care Companion
            </Text>
          </View>

          {/* Rating Section */}
          <View style={styles.ratingSection}>
            <Text
              style={[styles.ratingPrompt, { color: currentTheme.colorText }]}
            >
              How would you rate your experience?
            </Text>

            <View style={styles.starsContainer}>
              {[1, 2, 3, 4, 5].map((star) => (
                <TouchableOpacity
                  key={star}
                  onPress={() => handleStarPress(star)}
                  style={styles.starButton}
                >
                  <FontAwesome
                    name={star <= rating ? "star" : "star-o"}
                    size={36}
                    color={
                      star <= rating
                        ? "#FFD700"
                        : currentTheme.colorTextSecondary
                    }
                  />
                </TouchableOpacity>
              ))}
            </View>

            <Text
              style={[
                styles.ratingText,
                { color: currentTheme.colorTextSecondary },
              ]}
            >
              {getRatingText(rating)}
            </Text>
          </View>

          {/* Comment Section */}
          <View style={styles.commentSection}>
            <Text
              style={[styles.commentLabel, { color: currentTheme.colorText }]}
            >
              Tell us more (optional)
            </Text>
            <TextInput
              style={[
                styles.commentInput,
                {
                  backgroundColor: currentTheme.colorSurface,
                  borderColor: currentTheme.colorBorder,
                  color: currentTheme.colorText,
                },
              ]}
              value={comment}
              onChangeText={setComment}
              placeholder="What do you love about Plantly? Any suggestions for improvement?"
              placeholderTextColor={currentTheme.colorTextSecondary}
              multiline
              numberOfLines={4}
              textAlignVertical="top"
            />
          </View>

          {/* Info Text */}
          <Text
            style={[
              styles.infoText,
              { color: currentTheme.colorTextSecondary },
            ]}
          >
            Your feedback helps us improve Plantly. This will open your email
            app to send your rating and comments to our team.
          </Text>
        </View>
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
    padding: 16,
    borderBottomWidth: 1,
  },
  title: {
    fontSize: 18,
    fontWeight: "600",
  },
  headerButton: {
    fontSize: 16,
    fontWeight: "600",
  },
  content: {
    flex: 1,
    padding: 20,
  },
  appSection: {
    alignItems: "center",
    marginBottom: 32,
  },
  appIcon: {
    width: 64,
    height: 64,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
  },
  appName: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 4,
  },
  appDescription: {
    fontSize: 16,
  },
  ratingSection: {
    alignItems: "center",
    marginBottom: 32,
  },
  ratingPrompt: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 20,
    textAlign: "center",
  },
  starsContainer: {
    flexDirection: "row",
    justifyContent: "center",
    marginBottom: 12,
  },
  starButton: {
    padding: 8,
    marginHorizontal: 4,
  },
  ratingText: {
    fontSize: 16,
    fontWeight: "500",
  },
  commentSection: {
    marginBottom: 24,
  },
  commentLabel: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 12,
  },
  commentInput: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    minHeight: 100,
  },
  infoText: {
    fontSize: 14,
    textAlign: "center",
    lineHeight: 20,
  },
});
