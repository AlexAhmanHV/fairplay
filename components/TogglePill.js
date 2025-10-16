// components/TogglePill.js

// A rounded toggle button that visually switches between active and inactive states.
// Used for option selection, such as choosing 9 or 18 holes when starting a round.

import { StyleSheet, Text, TouchableOpacity } from "react-native";

export default function TogglePill({ label, active, onPress, style }) {
  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.9}
      style={[
        styles.pill,
        active ? styles.active : styles.inactive,
        style,
      ]}
    >
      <Text
        style={[
          styles.text,
          active ? styles.textActive : styles.textInactive,
        ]}
      >
        {label}
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  pill: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    // liten skugga för djup
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  // 🔹 Aktiv: tydligt mörkare grön + markerad kant
active: {
  backgroundColor: "#52b788",
  borderColor: "#1b4332",
  shadowColor: "#95d5b2",
  shadowOpacity: 0.8,
  shadowRadius: 10,
  shadowOffset: { width: 0, height: 0 },
  elevation: 6,
},
  // 🔸 Inaktiv: ljus med grön ton
  inactive: {
    backgroundColor: "#f3fbf6",
    borderColor: "#d8f3dc",
  },
  text: { fontSize: 16, fontWeight: "700" },
  textActive: { color: "#ffffff" },
  textInactive: { color: "#2d6a4f" },
});
