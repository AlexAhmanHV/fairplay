// components/LoadingView.js

// Displays a centered loading spinner with optional text inside a gradient background.
// Used during data fetches or app initialization to indicate progress.

import { ActivityIndicator, StyleSheet, Text } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { GREEN_PRIMARY, GREEN_TEXT_DARK } from "../theme/colors";
import ScreenGradient from "./ScreenGradient";

export default function LoadingView({ label = "Loading…" }) {
  return (
    <ScreenGradient>
      <SafeAreaView style={styles.fillCenter}>
        <ActivityIndicator color={GREEN_PRIMARY} />
        <Text style={styles.loadingText}>{label}</Text>
      </SafeAreaView>
    </ScreenGradient>
  );
}

const styles = StyleSheet.create({
  fillCenter: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 20,
  },
  loadingText: { marginTop: 8, color: GREEN_TEXT_DARK },
});
