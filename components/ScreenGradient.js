// components/ScreenGradient.js
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
