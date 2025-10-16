// components/NavButton.js

// A reusable navigation-style button supporting primary and secondary variants.
// Commonly used in RoundScreen for "Next hole" and "Previous hole" actions.

import { Pressable, Text, View } from "react-native";
import { GREEN_PRIMARY, GREEN_TEXT_DARK } from "../theme/colors";

export default function NavButton({
  title,
  onPress,
  icon,
  iconPosition = "left", // "left" | "right"
  variant = "primary",   // "primary" | "secondary"
  disabled = false,
  style,
}) {
  let bg = "#FFFFFF";
  let border = "#E6E6E6";
  let text = GREEN_TEXT_DARK;

  if (variant === "primary") {
    bg = GREEN_PRIMARY;
    border = GREEN_PRIMARY;
    text = "#FFFFFF";
  } else if (variant === "secondary") {
    bg = "#FFFFFF";
    border = "#E6E6E6";
    text = GREEN_TEXT_DARK;
  }

  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      style={[
        {
          width: "100%",
          paddingVertical: 12,
          borderRadius: 14,
          borderWidth: 1,
          borderColor: border,
          backgroundColor: bg,
          flexDirection: iconPosition === "right" ? "row-reverse" : "row",
          alignItems: "center",
          justifyContent: "center",
          gap: 8,
          opacity: disabled ? 0.6 : 1,
        },
        style,
      ]}
      accessibilityRole="button"
      accessibilityLabel={title}
    >
      {icon ? <View>{icon}</View> : null}
      <Text style={{ color: text, fontWeight: "700", fontSize: 16 }}>{title}</Text>
    </Pressable>
  );
}
