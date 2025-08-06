import React, { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
  Dimensions,
  Alert,
} from "react-native";
import { useRouter } from "expo-router";
import { FontAwesome6 } from "@expo/vector-icons";
import { useTheme } from "@/contexts/ThemeContext";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const { width: screenWidth } = Dimensions.get("window");

interface CareGuideSection {
  id: string;
  title: string;
  icon: string;
  color: string;
  description: string;
  content: CareGuideItem[];
}

interface CareGuideItem {
  title: string;
  description: string;
  tips: string[];
  warning?: string;
}

const careGuideData: CareGuideSection[] = [
  {
    id: "watering",
    title: "Watering Essentials",
    icon: "droplet",
    color: "#2196F3",
    description: "Master the art of proper plant hydration",
    content: [
      {
        title: "Understanding Watering Needs",
        description:
          "Different plants have vastly different water requirements based on their natural habitat and growth patterns.",
        tips: [
          "Check soil moisture 1-2 inches deep before watering",
          "Water early morning for best absorption",
          "Use room temperature water when possible",
          "Ensure proper drainage to prevent root rot",
          "Group plants with similar water needs together",
        ],
        warning: "Overwatering kills more houseplants than underwatering!",
      },
      {
        title: "Watering Techniques",
        description: "How you water is just as important as when you water.",
        tips: [
          "Water slowly and evenly around the base",
          "Water until you see drainage from the bottom",
          "Remove excess water from saucers after 30 minutes",
          "Use a watering can with a narrow spout for precision",
          "Consider bottom watering for plants prone to crown rot",
        ],
      },
      {
        title: "Seasonal Adjustments",
        description: "Plant water needs change throughout the year.",
        tips: [
          "Reduce watering frequency in winter months",
          "Increase during spring growth period",
          "Monitor humidity levels in summer",
          "Adjust for indoor heating and cooling systems",
          "Watch for seasonal dormancy periods",
        ],
      },
    ],
  },
  {
    id: "light",
    title: "Light Requirements",
    icon: "sun",
    color: "#FF9800",
    description: "Provide the perfect lighting conditions for healthy growth",
    content: [
      {
        title: "Understanding Light Levels",
        description:
          "Light is essential for photosynthesis and healthy plant growth.",
        tips: [
          "Bright direct light: South-facing windows, 6+ hours direct sun",
          "Bright indirect light: Near windows but not in direct rays",
          "Medium light: East or west-facing windows with some direct sun",
          "Low light: North-facing windows or areas away from windows",
          "Use a light meter app to measure actual light levels",
        ],
      },
      {
        title: "Signs of Light Problems",
        description:
          "Learn to recognize when your plants need light adjustments.",
        tips: [
          "Too much light: Scorched, brown, or bleached leaves",
          "Too little light: Leggy growth, pale leaves, dropping leaves",
          "Leaves turning toward light source indicate need for rotation",
          "Flowering plants need adequate light to bloom",
          "Variegated plants may lose patterns in low light",
        ],
      },
      {
        title: "Artificial Lighting Solutions",
        description: "Supplement natural light with grow lights when needed.",
        tips: [
          "LED grow lights are energy-efficient and effective",
          "Full spectrum lights mimic natural sunlight",
          "Keep lights 12-24 inches above plants",
          "Provide 12-16 hours of artificial light daily",
          "Timer switches ensure consistent lighting schedules",
        ],
      },
    ],
  },
  {
    id: "humidity",
    title: "Humidity Control",
    icon: "cloud-rain",
    color: "#4CAF50",
    description: "Create the ideal moisture environment for your plants",
    content: [
      {
        title: "Why Humidity Matters",
        description:
          "Many houseplants originate from tropical environments with high humidity.",
        tips: [
          "Most houseplants prefer 40-60% humidity",
          "Tropical plants often need 60-80% humidity",
          "Cacti and succulents prefer lower humidity (30-40%)",
          "Use a hygrometer to monitor humidity levels",
          "Winter heating can drastically reduce indoor humidity",
        ],
      },
      {
        title: "Increasing Humidity",
        description: "Simple methods to boost humidity around your plants.",
        tips: [
          "Group plants together to create a humid microclimate",
          "Use pebble trays filled with water under plants",
          "Mist plants regularly (avoid fuzzy-leaved plants)",
          "Use a humidifier in rooms with many plants",
          "Place plants in naturally humid areas like bathrooms",
        ],
      },
      {
        title: "Signs of Humidity Issues",
        description: "Recognize when humidity levels need adjustment.",
        tips: [
          "Brown, crispy leaf tips indicate low humidity",
          "Wilting despite adequate watering may signal low humidity",
          "Pest problems can increase in low humidity",
          "Excessive humidity can lead to fungal issues",
          "Monitor plants closely during seasonal changes",
        ],
      },
    ],
  },
  {
    id: "soil",
    title: "Soil & Fertilizing",
    icon: "seedling",
    color: "#8D6E63",
    description: "Provide the perfect growing medium and nutrients",
    content: [
      {
        title: "Choosing the Right Soil",
        description:
          "Different plants need different soil compositions for optimal health.",
        tips: [
          "Well-draining potting mix for most houseplants",
          "Cactus/succulent mix for drought-tolerant plants",
          "Orchid bark mix for epiphytes",
          "African violet mix for humidity-loving plants",
          "Never use garden soil for container plants",
        ],
      },
      {
        title: "Fertilizing Basics",
        description: "Provide essential nutrients for healthy growth.",
        tips: [
          "Fertilize during active growing season (spring/summer)",
          "Use balanced fertilizer (equal N-P-K) for most plants",
          "Dilute fertilizer to half strength to prevent burning",
          "Fertilize every 2-4 weeks during growing season",
          "Reduce or stop fertilizing in winter months",
        ],
      },
      {
        title: "Signs of Soil Problems",
        description:
          "Recognize when it's time to repot or adjust soil conditions.",
        tips: [
          "Water runs straight through: soil is too loose or plant is rootbound",
          "Water sits on top: soil is compacted or has poor drainage",
          "White crust on soil surface: mineral buildup from hard water",
          "Musty smell: soil may be retaining too much moisture",
          "Yellowing leaves: may indicate nutrient deficiency or excess",
        ],
      },
    ],
  },
  {
    id: "temperature",
    title: "Temperature Management",
    icon: "thermometer",
    color: "#E57373",
    description: "Maintain optimal temperature ranges for plant health",
    content: [
      {
        title: "Ideal Temperature Ranges",
        description:
          "Most houseplants prefer consistent, moderate temperatures.",
        tips: [
          "Most houseplants thrive in 65-75°F (18-24°C)",
          "Avoid temperature fluctuations greater than 10°F",
          "Keep plants away from heating/cooling vents",
          "Nighttime temperatures can be 5-10°F cooler",
          "Some plants need cool winter rest periods",
        ],
      },
      {
        title: "Protecting from Temperature Stress",
        description: "Shield your plants from harmful temperature extremes.",
        tips: [
          "Move plants away from drafty windows in winter",
          "Protect from hot afternoon sun in summer",
          "Use curtains or blinds to moderate temperature",
          "Group plants together for temperature stability",
          "Monitor temperature with a min/max thermometer",
        ],
      },
      {
        title: "Seasonal Temperature Adjustments",
        description: "Adapt care routines to seasonal temperature changes.",
        tips: [
          "Reduce watering when temperatures drop",
          "Increase humidity when heating systems run",
          "Watch for cold damage on leaves near windows",
          "Some plants need vernalization (cold period) to bloom",
          "Gradually acclimate plants to outdoor temperatures",
        ],
      },
    ],
  },
  {
    id: "common-problems",
    title: "Common Problems",
    icon: "triangle-exclamation",
    color: "#FF7043",
    description: "Identify and solve frequent plant care issues",
    content: [
      {
        title: "Pest Management",
        description: "Common houseplant pests and how to deal with them.",
        tips: [
          "Spider mites: Increase humidity, use insecticidal soap",
          "Aphids: Rinse with water, use neem oil spray",
          "Mealybugs: Remove with alcohol-dipped cotton swabs",
          "Scale insects: Scrape off, treat with horticultural oil",
          "Fungus gnats: Reduce watering, use yellow sticky traps",
        ],
        warning: "Isolate infected plants to prevent pest spread!",
      },
      {
        title: "Disease Prevention",
        description: "Keep your plants healthy and disease-free.",
        tips: [
          "Ensure good air circulation around plants",
          "Avoid overhead watering on fuzzy leaves",
          "Remove dead or dying plant material promptly",
          "Don't overcrowd plants",
          "Quarantine new plants for 2-3 weeks",
        ],
      },
      {
        title: "Troubleshooting Symptoms",
        description: "Common symptoms and their likely causes.",
        tips: [
          "Yellow leaves: Overwatering, nutrient deficiency, or natural aging",
          "Brown leaf tips: Low humidity, fluoride in water, or over-fertilizing",
          "Dropping leaves: Stress from environmental changes",
          "Wilting: Under or overwatering, root problems",
          "No growth: Insufficient light, nutrients, or dormancy period",
        ],
      },
    ],
  },
];

export default function PlantCareGuideScreen() {
  const router = useRouter();
  const { theme: currentTheme, isDark } = useTheme();
  const insets = useSafeAreaInsets();
  const [selectedSection, setSelectedSection] = useState<string | null>(null);
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());

  const toggleItemExpansion = (itemTitle: string) => {
    const newExpanded = new Set(expandedItems);
    if (newExpanded.has(itemTitle)) {
      newExpanded.delete(itemTitle);
    } else {
      newExpanded.add(itemTitle);
    }
    setExpandedItems(newExpanded);
  };

  const handleBackToSections = () => {
    setSelectedSection(null);
    setExpandedItems(new Set());
  };

  const renderSectionCard = (section: CareGuideSection) => (
    <TouchableOpacity
      key={section.id}
      style={[
        styles.sectionCard,
        {
          backgroundColor: currentTheme.colorSurface,
          borderColor: currentTheme.colorBorder,
        },
      ]}
      onPress={() => setSelectedSection(section.id)}
      activeOpacity={0.7}
    >
      <View style={styles.sectionGradient}>
        <View style={styles.sectionHeader}>
          <View
            style={[
              styles.sectionIconContainer,
              { backgroundColor: section.color + "20" },
            ]}
          >
            <FontAwesome6
              name={section.icon as any}
              size={32}
              color={section.color}
            />
          </View>
          <View style={styles.sectionTextContainer}>
            <Text
              style={[styles.sectionTitle, { color: currentTheme.colorText }]}
            >
              {section.title}
            </Text>
            <Text
              style={[
                styles.sectionDescription,
                { color: currentTheme.colorTextSecondary },
              ]}
            >
              {section.description}
            </Text>
          </View>
          <FontAwesome6
            name="chevron-right"
            size={16}
            color={currentTheme.colorTextSecondary}
          />
        </View>
      </View>
    </TouchableOpacity>
  );

  const renderSectionContent = (section: CareGuideSection) => (
    <ScrollView
      style={styles.sectionContentScrollView}
      contentContainerStyle={[
        styles.sectionContentContainer,
        { paddingBottom: insets.bottom + 40 },
      ]}
      showsVerticalScrollIndicator={false}
    >
      {/* Section Header */}
      <View style={styles.sectionContentHeader}>
        <View
          style={[
            styles.sectionContentIconContainer,
            { backgroundColor: section.color + "30" },
          ]}
        >
          <FontAwesome6
            name={section.icon as any}
            size={40}
            color={section.color}
          />
        </View>
        <Text
          style={[
            styles.sectionContentTitle,
            { color: currentTheme.colorText },
          ]}
        >
          {section.title}
        </Text>
        <Text
          style={[
            styles.sectionContentDescription,
            { color: currentTheme.colorTextSecondary },
          ]}
        >
          {section.description}
        </Text>
      </View>

      {/* Content Items */}
      {section.content.map((item, index) => (
        <View
          key={index}
          style={[
            styles.contentItem,
            {
              backgroundColor: currentTheme.colorSurface,
              borderColor: currentTheme.colorBorder,
            },
          ]}
        >
          <TouchableOpacity
            style={styles.contentItemHeader}
            onPress={() => toggleItemExpansion(item.title)}
            activeOpacity={0.7}
          >
            <Text
              style={[
                styles.contentItemTitle,
                { color: currentTheme.colorText },
              ]}
            >
              {item.title}
            </Text>
            <FontAwesome6
              name={
                expandedItems.has(item.title) ? "chevron-up" : "chevron-down"
              }
              size={16}
              color={currentTheme.colorTextSecondary}
            />
          </TouchableOpacity>

          {expandedItems.has(item.title) && (
            <View style={styles.contentItemBody}>
              <Text
                style={[
                  styles.contentItemDescription,
                  { color: currentTheme.colorTextSecondary },
                ]}
              >
                {item.description}
              </Text>

              {item.warning && (
                <View
                  style={[
                    styles.warningContainer,
                    { backgroundColor: currentTheme.colorError + "10" },
                  ]}
                >
                  <FontAwesome6
                    name="exclamation-triangle"
                    size={16}
                    color={currentTheme.colorError}
                  />
                  <Text
                    style={[
                      styles.warningText,
                      { color: currentTheme.colorError },
                    ]}
                  >
                    {item.warning}
                  </Text>
                </View>
              )}

              <View style={styles.tipsContainer}>
                {item.tips.map((tip, tipIndex) => (
                  <View key={tipIndex} style={styles.tipItem}>
                    <View
                      style={[
                        styles.tipBullet,
                        { backgroundColor: section.color },
                      ]}
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
            </View>
          )}
        </View>
      ))}
    </ScrollView>
  );

  const selectedSectionData = selectedSection
    ? careGuideData.find((section) => section.id === selectedSection)
    : null;

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
          {
            backgroundColor: currentTheme.colorBackground,
            borderBottomColor: currentTheme.colorBorder,
          },
        ]}
      >
        <TouchableOpacity
          style={styles.backButton}
          onPress={selectedSection ? handleBackToSections : () => router.back()}
        >
          <FontAwesome6
            name="arrow-left"
            size={22}
            color={currentTheme.colorLeafyGreen}
          />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: currentTheme.colorText }]}>
          {selectedSection ? selectedSectionData?.title : "Plant Care Guide"}
        </Text>
        <View style={styles.headerRight} />
      </View>

      {/* Content */}
      {selectedSection && selectedSectionData ? (
        renderSectionContent(selectedSectionData)
      ) : (
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={[
            styles.scrollContent,
            { paddingBottom: insets.bottom + 20 },
          ]}
          showsVerticalScrollIndicator={false}
        >
          {/* Introduction */}
          <View style={styles.introContainer}>
            <View style={styles.introGradient}>
              <FontAwesome6
                name="leaf"
                size={48}
                color={currentTheme.colorLeafyGreen}
              />
              <Text
                style={[styles.introTitle, { color: currentTheme.colorText }]}
              >
                Complete Plantly Care Guide
              </Text>
              <Text
                style={[
                  styles.introDescription,
                  { color: currentTheme.colorTextSecondary },
                ]}
              >
                Master the fundamentals of plant care with our comprehensive
                guide. Learn everything from watering techniques to pest
                management.
              </Text>
            </View>
          </View>

          {/* Quick Tips */}
          <View style={styles.quickTipsContainer}>
            <Text
              style={[
                styles.sectionHeaderText,
                { color: currentTheme.colorText },
              ]}
            >
              Quick Tips for Success
            </Text>
            <View
              style={[
                styles.quickTipsGrid,
                {
                  backgroundColor: currentTheme.colorSurface,
                  borderColor: currentTheme.colorBorder,
                },
              ]}
            >
              <View style={styles.quickTip}>
                <FontAwesome6
                  name="eye"
                  size={20}
                  color={currentTheme.colorLeafyGreen}
                />
                <Text
                  style={[
                    styles.quickTipText,
                    { color: currentTheme.colorTextSecondary },
                  ]}
                >
                  Observe your plants daily
                </Text>
              </View>
              <View style={styles.quickTip}>
                <FontAwesome6
                  name="calendar-check"
                  size={20}
                  color={currentTheme.colorLeafyGreen}
                />
                <Text
                  style={[
                    styles.quickTipText,
                    { color: currentTheme.colorTextSecondary },
                  ]}
                >
                  Maintain consistent routines
                </Text>
              </View>
              <View style={styles.quickTip}>
                <FontAwesome6
                  name="book"
                  size={20}
                  color={currentTheme.colorLeafyGreen}
                />
                <Text
                  style={[
                    styles.quickTipText,
                    { color: currentTheme.colorTextSecondary },
                  ]}
                >
                  Research your specific plants
                </Text>
              </View>
              <View style={styles.quickTip}>
                <FontAwesome6
                  name="clock"
                  size={20}
                  color={currentTheme.colorLeafyGreen}
                />
                <Text
                  style={[
                    styles.quickTipText,
                    { color: currentTheme.colorTextSecondary },
                  ]}
                >
                  Be patient with growth
                </Text>
              </View>
            </View>
          </View>

          {/* Care Guide Sections */}
          <View style={styles.sectionsContainer}>
            <Text
              style={[
                styles.sectionHeaderText,
                { color: currentTheme.colorText },
              ]}
            >
              Care Guide Topics
            </Text>
            {careGuideData.map(renderSectionCard)}
          </View>
        </ScrollView>
      )}
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
  headerRight: {
    width: 38,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
  },
  introContainer: {
    marginVertical: 20,
  },
  introGradient: {
    padding: 32,
    borderRadius: 20,
    alignItems: "center",
    backgroundColor: "rgba(76, 175, 80, 0.08)",
  },
  introTitle: {
    fontSize: 24,
    fontWeight: "700",
    marginTop: 16,
    marginBottom: 8,
    textAlign: "center",
  },
  introDescription: {
    fontSize: 16,
    textAlign: "center",
    lineHeight: 24,
  },
  quickTipsContainer: {
    marginBottom: 24,
  },
  sectionHeaderText: {
    fontSize: 20,
    fontWeight: "600",
    marginBottom: 16,
  },
  quickTipsGrid: {
    padding: 24,
    borderRadius: 16,
    borderWidth: 1,
  },
  quickTip: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  quickTipText: {
    fontSize: 16,
    marginLeft: 12,
    flex: 1,
  },
  sectionsContainer: {
    marginBottom: 20,
  },
  sectionCard: {
    borderRadius: 16,
    marginBottom: 16,
    borderWidth: 1,
    overflow: "hidden",
  },
  sectionGradient: {
    padding: 20,
    backgroundColor: "rgba(255, 255, 255, 0.02)",
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
  },
  sectionIconContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: "center",
    justifyContent: "center",
  },
  sectionImage: {
    width: 32,
    height: 32,
    borderRadius: 16,
  },
  sectionTextContainer: {
    flex: 1,
    marginLeft: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 4,
  },
  sectionDescription: {
    fontSize: 14,
    lineHeight: 20,
  },
  sectionContentScrollView: {
    flex: 1,
  },
  sectionContentContainer: {
    paddingHorizontal: 20,
  },
  sectionContentHeader: {
    padding: 24,
    borderRadius: 16,
    alignItems: "center",
    marginVertical: 20,
    backgroundColor: "rgba(255, 255, 255, 0.03)",
  },
  sectionContentIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
  },
  sectionContentImage: {
    width: 48,
    height: 48,
    borderRadius: 24,
  },
  sectionContentTitle: {
    fontSize: 28,
    fontWeight: "700",
    marginBottom: 8,
    textAlign: "center",
  },
  sectionContentDescription: {
    fontSize: 16,
    textAlign: "center",
    lineHeight: 24,
  },
  contentItem: {
    borderRadius: 16,
    marginBottom: 16,
    borderWidth: 1,
    overflow: "hidden",
  },
  contentItemHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 16,
  },
  contentItemTitle: {
    fontSize: 18,
    fontWeight: "600",
    flex: 1,
  },
  contentItemBody: {
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  contentItemDescription: {
    fontSize: 16,
    lineHeight: 24,
    marginBottom: 16,
  },
  warningContainer: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  warningText: {
    fontSize: 14,
    fontWeight: "500",
    marginLeft: 8,
    flex: 1,
  },
  tipsContainer: {
    marginTop: 8,
  },
  tipItem: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 12,
  },
  tipBullet: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginTop: 8,
    marginRight: 12,
  },
  tipText: {
    fontSize: 15,
    lineHeight: 22,
    flex: 1,
  },
});
