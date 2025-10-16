// components/FinishBar.js

// Displays a "Finish round" button with the player's running total below.
// Used at the bottom of the round screen to summarize progress and end the session.

import { Ionicons } from "@expo/vector-icons";
import { StyleSheet, Text, View } from "react-native";
import { GREEN_TEXT_DARK } from "../theme/colors";
import PrimaryButton from "./PrimaryButton";

export default function FinishBar({ total, onFinish }) {
  return (
    <View style={styles.wrap}>
      <PrimaryButton
        title="Finish round now"
        onPress={onFinish}
        variant="primary"
        icon={<Ionicons name="checkmark" size={20} color={GREEN_TEXT_DARK} />}
        accessibilityRole="button"
      />
      <Text style={styles.total}>Running total: {total} shots</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    paddingHorizontal: 20,
  },
  total: {
    textAlign: "center",
    color: "#000000",       // 👈 black text
    fontWeight: "700",      // 👈 bold for emphasis
    marginTop: 8,
  },
});
