import { StyleSheet, Text, View, Button } from "react-native";
import { theme } from "../../theme";
import { useUserStore } from "@/store/userStore";

export default function App() {
  const toggleHasOnboarded = useUserStore((state) => state.toggleHasOnboarded);
  return (
    <View style={styles.container}>
      <Button title="Go back to Onboarding" onPress={toggleHasOnboarded} />
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
