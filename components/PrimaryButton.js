// components/PrimaryButton.js

//A branded CTA with optional subtitle and an optional right-side icon button (e.g., a close “X”) with its own handler.
//Centers the title/subtitle, applies consistent padding, rounded corners, and subtle elevation; supports disabled state and custom styles.
//Ideal for primary actions (e.g., Start/Resume), while the right icon enables inline secondary actions like discarding a draft.

import { Ionicons } from "@expo/vector-icons";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { GREEN_PRIMARY, GREEN_TEXT_DARK } from "../theme/colors";

const ICON_SIZE = 18;

export default function PrimaryButton({
  title,
  subtitle,                 
  onPress,
  disabled = false,
  style,
  textStyle,
  rightIcon,                
  onRightPress,             
  testID,
  accessibilityLabel,
}) {
  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled}
      testID={testID}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel ?? title}
      style={[styles.button, disabled && styles.disabled, style]}
      activeOpacity={0.8}
    >
      <View style={styles.inner}>
        <Text style={[styles.title, textStyle]}>{title}</Text>
        {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
      </View>

      {rightIcon && onRightPress ? (
        <TouchableOpacity
          onPress={onRightPress}
          accessibilityRole="button"
          accessibilityLabel={rightIcon === "close" ? "Discard" : "Action"}
          hitSlop={{ top: 10, right: 10, bottom: 10, left: 10 }}
          style={styles.rightIconBtn}
        >
          <Ionicons name={rightIcon} size={ICON_SIZE} color={GREEN_TEXT_DARK} />
        </TouchableOpacity>
      ) : null}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    backgroundColor: GREEN_PRIMARY,
    borderRadius: 16,
    paddingVertical: 14,
    paddingHorizontal: 16,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  disabled: { opacity: 0.6 },
  inner: { alignItems: "center" },
  title: {
    color: GREEN_TEXT_DARK,
    fontSize: 16,
    fontWeight: "700",
  },
  subtitle: {
    color: GREEN_TEXT_DARK,
    opacity: 0.9,
    fontSize: 12,
    marginTop: 2,
  },
  rightIconBtn: {
    position: "absolute",
    right: 8,
    top: 0,
    bottom: 0,                 
    justifyContent: "center",  
    alignItems: "center",
    paddingHorizontal: 8,      
    minWidth: 36,              
  },
});
