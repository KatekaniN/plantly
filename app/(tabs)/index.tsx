import { StyleSheet, Text, View, Button } from "react-native";
import { theme } from "../../theme";
import { PlantlyButton } from "@/components/PlantlyButton";
import { useUserStore } from "@/store/userStore";

export default function App() {
  const toggleHasOnboarded = useUserStore((state) => state.toggleHasOnboarded);
  return (
    <View style={styles.container}>
      <PlantlyButton title="Go to Onboarding" onPress={toggleHasOnboarded} icon={"backward"} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colorWhite,
    alignItems: "center",
    justifyContent: "center",
  },
});
