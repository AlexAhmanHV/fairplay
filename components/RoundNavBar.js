// components/RoundNavBar.js

// Displays navigation buttons for moving between holes during a round.
// Used in RoundScreen to handle "Previous hole" and "Next hole" (or "Finish") actions.

import { Ionicons } from "@expo/vector-icons";
import { StyleSheet, View } from "react-native";
import { GREEN_TEXT_DARK } from "../theme/colors";
import NavButton from "./NavButton";

export default function RoundNavBar({ onPrev, onNext, isFirst, isLast }) {
  return (
    <View style={styles.wrap}>
      <View style={styles.col}>
        <NavButton
          title="Previous hole"
          onPress={onPrev}
          variant={isFirst ? "secondary" : "primary"}
          disabled={isFirst}
          iconPosition="left"
          textColor={GREEN_TEXT_DARK}
          icon={<Ionicons name="chevron-back" size={18} color={GREEN_TEXT_DARK} />}
          accessibilityRole="button"
        />
      </View>
      <View style={styles.col}>
        <NavButton
          title={isLast ? "Finish" : "Next hole"}
          onPress={onNext}
          variant="primary"
          iconPosition="right"
          textColor={GREEN_TEXT_DARK}
          icon={<Ionicons name="chevron-forward" size={18} color={GREEN_TEXT_DARK} />}
          accessibilityRole="button"
        />
      </View>
    </View>
  );
}
const styles = StyleSheet.create({
  wrap: { paddingHorizontal: 20, flexDirection: "row", gap: 12, marginTop: "auto", marginBottom: 8 },
  col: { flex: 1, minWidth: 0 },
});
