// components/ScoreStepper.js

// A compact stepper control for increasing or decreasing numeric values like strokes or putts.
// Used in RoundScreen inside ScoreRow components for quick score adjustments.

import { Ionicons } from "@expo/vector-icons";
import { Pressable, Text, View } from "react-native";

export default function ScoreStepper({
  value = 0,
  onChange,
  min = 0,
  max = 99,
  step = 1,
  size = "md", // "sm" | "md"
}) {
  const isSm = size === "sm";

  const btnSize = isSm ? 34 : 44; 
  const iconSize = isSm ? 16 : 22; 
  const fontSize = isSm ? 18 : 22; 
  const gap = isSm ? 10 : 14;

  const dec = () => onChange?.(Math.max(min, (value ?? 0) - step));
  const inc = () => onChange?.(Math.min(max, (value ?? 0) + step));

  return (
    <View
      style={{
        flexDirection: "row",
        alignItems: "center",
        gap,
      }}
    >
      <Pressable
        onPress={dec}
        hitSlop={10}
        style={{
          width: btnSize,
          height: btnSize,
          borderRadius: 999,
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "#F4F4F4",
          borderWidth: 1,
          borderColor: "#E6E6E6",
        }}
        accessibilityLabel="Decrease"
      >
        <Ionicons name="remove" size={iconSize} color="#1f2937" />
      </Pressable>

      <Text
        style={{
          minWidth: isSm ? 28 : 36,
          textAlign: "center",
          fontSize,
          fontWeight: "800",
          color: "#1f2937",
        }}
      >
        {value ?? 0}
      </Text>

      <Pressable
        onPress={inc}
        hitSlop={10}
        style={{
          width: btnSize,
          height: btnSize,
          borderRadius: 999,
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "#F4F4F4",
          borderWidth: 1,
          borderColor: "#E6E6E6",
        }}
        accessibilityLabel="Increase"
      >
        <Ionicons name="add" size={iconSize} color="#1f2937" />
      </Pressable>
    </View>
  );
}
