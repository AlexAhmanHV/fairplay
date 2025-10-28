// components/Logo.js

// Renders the app logo responsively based on screen width.
// Used in headers and summary screens for consistent branding.

import PropTypes from "prop-types";
import { Image, useWindowDimensions } from "react-native";

export default function Logo({
  height = 56,
  maxWidthPct = 0.5,  
  style,
  source = require("../assets/logo.png"),
}) {
  const { width } = useWindowDimensions();
  return (
    <Image
      source={source}
      style={[
        {
          height,
          width: width * maxWidthPct,
          maxWidth: 420,
          resizeMode: "contain",
          alignSelf: "center",
        },
        style,
      ]}
    />
  );
}

Logo.propTypes = {
  height: PropTypes.number,
  maxWidthPct: PropTypes.number,
  style: PropTypes.any,
  source: PropTypes.any,
};
