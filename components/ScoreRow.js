// components/ScoreRow.js

// A simple horizontal layout with a label on the left and a control on the right.
// Used in RoundScreen to display score inputs like shots, putts, and penalties.

import { StyleSheet, Text, View } from "react-native";
import { GREEN_TEXT_DARK } from "../theme/colors";

export default function ScoreRow({ label, children }) {
  return (
    <View style={styles.row}>
      <Text style={styles.label}>{label}</Text>
      {children}
    </View>
  );
}
const styles = StyleSheet.create({
  row: { height: 44, flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 12 },
  label: { color: GREEN_TEXT_DARK, fontWeight: "700" },
});
