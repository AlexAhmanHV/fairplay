// components/ScreenGradient.js

// Wraps screen content in the app’s vertical green gradient background.
// Used on nearly all screens to maintain a consistent visual style.

import { LinearGradient } from "expo-linear-gradient";
import { GRADIENT } from "../theme/colors";

export default function ScreenGradient({ children, style }) {
  return (
    <LinearGradient
      colors={GRADIENT}
      start={{ x: 0, y: 0 }}
      end={{ x: 0, y: 1 }}
      style={[{ flex: 1 }, style]}
    >
      {children}
    </LinearGradient>
  );
}
