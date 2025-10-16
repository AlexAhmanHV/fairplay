// components/PrimaryButton.js

// A versatile green-themed button used across the app for primary and secondary actions.
// Commonly appears in forms, empty states, and confirmation prompts.

import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

export default function PrimaryButton({ title, onPress, icon, variant = "primary" }) {
  const isPrimary = variant === "primary";

  return (
    <TouchableOpacity
      style={[styles.button, isPrimary ? styles.primary : styles.secondary]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <Text style={[styles.text, isPrimary ? styles.textPrimary : styles.textSecondary]}>
        {title}
      </Text>
      {icon && <View style={styles.iconContainer}>{icon}</View>}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    borderRadius: 14,
    paddingVertical: 16,
    paddingHorizontal: 22,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",

    // 🌫️ Subtil skugga
    shadowColor: "#000",
    shadowOpacity: 0.15,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
    elevation: 3, // för Android
  },

  // 🌿 Primär ljusgrön knapp
  primary: {
    backgroundColor: "#95d5b2", // ljusgrön
  },
  textPrimary: {
    color: "#1b4332", // mörkgrön text
    fontSize: 18,
    fontWeight: "600",
  },

  // 🍃 Sekundär ännu ljusare variant
  secondary: {
    backgroundColor: "#d8f3dc",
  },
  textSecondary: {
    color: "#2d6a4f",
    fontSize: 18,
    fontWeight: "600",
  },

  text: {
    textAlign: "center",
  },
  iconContainer: {
    marginLeft: 8,
  },
});
