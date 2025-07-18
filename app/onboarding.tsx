import { StyleSheet, Text, View, Dimensions } from "react-native";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { OnboardingButton } from "@/components/OnboardingButton";
import Onboarding from "react-native-onboarding-swiper";
import { theme } from "@/theme";
import { useRouter } from "expo-router";
import { useUserStore } from "@/store/userStore";
import OnboardingImage from "@/components/OnboardingImage";
import { StatusBar } from "expo-status-bar";
import { useRef } from "react";

const windowWidth = Dimensions.get("window").width;
const windowHeight = Dimensions.get("window").height;

export default function OnboardingScreen() {
  const router = useRouter();
  const swiperRef = useRef<Onboarding>(null);
  const toggleHasOnboarded = useUserStore((state) => state.toggleHasOnboarded);

  const handleDone = () => {
    toggleHasOnboarded();
    router.replace("/");
  };

  const CustomButton = ({ ...props }) => (
    <OnboardingButton
      title={props.title || "Next"}
      onPress={props.onPress}
      variant="primary"
    />
  );

  const handleSkip = () => {
    if (swiperRef.current) {
      (swiperRef.current as any).goToPage(3, true);
    }
  };

  const DoneButton = ({ ...props }) => (
    <View style={styles.doneButton}>
      <OnboardingButton
        title="Get Started"
        onPress={props.onPress}
        variant="done"
      />
    </View>
  );

  const SkipButton = ({ ...props }) => (
    <OnboardingButton title="Skip" onPress={props.onPress} variant="skip" />
  );

  return (
    <SafeAreaProvider>
      <SafeAreaView style={{ flex: 1 }}>
        <LinearGradient
          colors={["#E8F5E8", "#B8E6CC", "#A0D4B8"]}
          locations={[0, 0.6, 1]}
          style={styles.container}
        >
          <StatusBar style="dark" />
          <Onboarding
            ref={swiperRef}
            onSkip={handleSkip}
            onDone={handleDone}
            NextButtonComponent={CustomButton}
            DoneButtonComponent={DoneButton}
            SkipButtonComponent={SkipButton}
            containerStyles={styles.onboardingContainer}
            imageContainerStyles={styles.imageContainer}
            bottomBarHighlight={false}
            showPagination={true}
            pages={[
              {
                backgroundColor: "transparent",
                image: (
                  <View style={styles.pageImageContainer}>
                    <OnboardingImage
                      source={require("../assets/images/plantly-1.png")}
                    />
                  </View>
                ),
                title: (
                  <Text style={styles.title}>
                    Keeping your green friends happy
                  </Text>
                ),
                subtitle: (
                  <Text style={styles.subtitle}>
                    Discover your personal plant care assistant. Helping you
                    nurture your plants with ease and joy
                  </Text>
                ),
              },
              {
                backgroundColor: "transparent",
                image: (
                  <View style={styles.pageImageContainer}>
                    <OnboardingImage
                      source={require("../assets/images/plantly-2.png")}
                    />
                  </View>
                ),
                title: <Text style={styles.title}>Smart Reminders</Text>,
                subtitle: (
                  <Text style={styles.subtitle}>
                    Never forget to water your plants again! Get personalized
                    reminders based on each plant's needs
                  </Text>
                ),
              },
              {
                backgroundColor: "transparent",
                image: (
                  <View style={styles.pageImageContainer}>
                    <OnboardingImage
                      source={require("../assets/images/plantly-3.png")}
                    />
                  </View>
                ),
                title: <Text style={styles.title}>Personalized Care</Text>,
                subtitle: (
                  <Text style={styles.subtitle}>
                    Every plant is unique! Track individual watering schedules,
                    light requirements, and growth progress
                  </Text>
                ),
              },
              {
                backgroundColor: "transparent",
                image: (
                  <View style={styles.pageImageContainer}>
                    <OnboardingImage
                      source={require("../assets/images/plantly-4.png")}
                    />
                  </View>
                ),
                title: <Text style={styles.title}>Watch Them Thrive</Text>,
                subtitle: (
                  <Text style={styles.subtitle}>
                    Track your plant's growth journey and become the plant
                    parent you've always wanted to be!
                  </Text>
                ),
              },
            ]}
          />
        </LinearGradient>
      </SafeAreaView>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  onboardingContainer: {
    backgroundColor: "transparent",
  },
  imageContainer: {
    paddingBottom: 0,
  },
  pageImageContainer: {
    width: 250,
    height: 250,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: -(windowHeight * 0.01),
  },
  title: {
    fontSize: 30,
    fontWeight: "bold",
    paddingTop: 20,
    color: theme.colorWhite,
    textAlign: "center",
    marginBottom: 10,
    paddingHorizontal: windowWidth * 0.1,
  },
  subtitle: {
    fontSize: 16,
    color: theme.colorDarkGreen,
    marginTop: windowHeight * 0.01,
    textAlign: "center",
    paddingHorizontal: windowWidth * 0.1,
    lineHeight: 24,
    opacity: 0.9,
  },
  doneButton: {
    zIndex: 2,
    marginBottom: "8%",
    marginRight: 200,
    alignSelf: "center",
    alignItems: "center",
    justifyContent: "center",
    flex: 1,
  },
});
