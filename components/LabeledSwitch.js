// components/LabeledSwitch.js

// Combines a text label and help text with a styled on/off switch inside a FormCard.
// Used in RoundScreen to toggle stats like "Fairway in regulation" and "Green in regulation".


import { StyleSheet, Switch, Text, View } from "react-native";
import { GREEN_TEXT_DARK } from "../theme/colors";
import FormCard from "./FormCard";

export default function LabeledSwitch({ label, help, value, onValueChange }) {
  return (
    <FormCard style={styles.cardPadFix}>
      <View style={styles.row}>
        <View style={{ flex: 1 }}>
          <Text style={styles.label}>{label}</Text>
          {help ? <Text style={styles.help}>{help}</Text> : null}
        </View>
        <Switch
          value={value}
          onValueChange={onValueChange}
          // ✅ vit "thumb" oavsett läge, ser ut som en riktig switch
          thumbColor={"#ffffff"}
          // ✅ tydlig grön track när på, diskret grå när av
          trackColor={{ false: "#cbd5d1", true: "#52b788" }}
          ios_backgroundColor="#cbd5d1"
          // lite större för tydlighet
          style={{ transform: [{ scale: 1.05 }] }}
        />
      </View>
    </FormCard>
  );
}

const styles = StyleSheet.create({
  cardPadFix: { paddingVertical: 12, paddingHorizontal: 14 },
  row: { flexDirection: "row", alignItems: "center", gap: 12 },
  label: { color: GREEN_TEXT_DARK, fontWeight: "700", fontSize: 14 },
  help: { color: "#1b4332cc", fontSize: 12, marginTop: 2 },
});
