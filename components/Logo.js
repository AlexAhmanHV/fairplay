// components/Logo.js
import PropTypes from "prop-types";
import { Image, useWindowDimensions } from "react-native";

export default function Logo({
  height = 56,
  maxWidthPct = 0.5,   // 50% av skärmbredd
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
