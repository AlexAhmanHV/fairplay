// components/LogoHeader.js

// Displays the app logo with optional spacing, sizing, and a start button or custom CTA.
// Used on the HomeScreen and PreviousRoundsScreen for consistent branded headers.

import { Ionicons } from "@expo/vector-icons";
import PropTypes from "prop-types";
import { Image, useWindowDimensions, View } from "react-native";
import { GREEN_TEXT_DARK } from "../theme/colors";
import FadeInSlide from "./FadeInSlide";
import PrimaryButton from "./PrimaryButton";

export default function LogoHeader({
  onStart,
  variant = "home",       // "home" | "compact"
  style,
  cta,                    // valfri egen CTA (node). Om satt, ersätter knappen.
  topPadding,
  logoHeight,
  maxWidthPct,
  gap,
  showButton,             // valfri hård override (true/false)
}) {
  const { width } = useWindowDimensions();

  // default-konfig per variant
  const presets = {
    home:    { gap: 28, paddingTop: 140, logoH: 120, pct: 0.8, defaultShowBtn: true },
    compact: { gap: 12, paddingTop: 16,  logoH: 56,  pct: 0.5, defaultShowBtn: false },
  };
  const cfg = presets[variant] || presets.home;

  const resolvedGap        = gap ?? cfg.gap;
  const resolvedPaddingTop = topPadding ?? cfg.paddingTop;
  const resolvedLogoH      = logoHeight ?? cfg.logoH;
  const resolvedPct        = maxWidthPct ?? cfg.pct;

  // Visa knapp? (1) explicit showButton prop vinner, annars (2) cta finns, annars (3) preset + onStart
  const shouldShowButton =
    typeof showButton === "boolean"
      ? showButton
      : cta
      ? true
      : cfg.defaultShowBtn && !!onStart;

  return (
    <View style={[{ alignItems: "center", gap: resolvedGap, paddingTop: resolvedPaddingTop, width: "100%" }, style]}>
      <FadeInSlide delay={0} fromY={-12} style={{ alignItems: "center" }}>
        <Image
          source={require("../assets/logo.png")}
          style={{
            height: resolvedLogoH,
            resizeMode: "contain",
            alignSelf: "center",
            width: width * resolvedPct,
            maxWidth: 420,
          }}
        />
      </FadeInSlide>

      {shouldShowButton && (
        <FadeInSlide delay={120} fromY={8} style={{ width: "100%" }}>
          {cta ?? (
            <PrimaryButton
              title="Start a new round"
              onPress={onStart}
              icon={<Ionicons name="arrow-forward" size={26} color={GREEN_TEXT_DARK} />}
              variant="primary"
            />
          )}
        </FadeInSlide>
      )}
    </View>
  );
}

LogoHeader.propTypes = {
  onStart: PropTypes.func, // bara nödvändig om du vill visa default-knappen
  variant: PropTypes.oneOf(["home", "compact"]),
  style: PropTypes.any,
  cta: PropTypes.node,
  topPadding: PropTypes.number,
  logoHeight: PropTypes.number,
  maxWidthPct: PropTypes.number,
  gap: PropTypes.number,
  showButton: PropTypes.bool,
};
