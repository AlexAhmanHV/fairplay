// components/ErrorBanner.js

// A small, reusable error banner.
// Displays an error message and a "Try again" button to retry the failed action.

import PropTypes from "prop-types";
import { StyleSheet, Text, View } from "react-native";
import { GREEN_TEXT_DARK } from "../theme/colors";
import PrimaryButton from "./PrimaryButton";


export default function ErrorBanner({ message, onRetry, style }) {
  return (
    <View style={[styles.errorBanner, style]}>
      <Text style={styles.errorText}>{message}</Text>
      <PrimaryButton
        title="Try again"
        onPress={onRetry}
        variant="secondary"
        style={{ alignSelf: "center", paddingVertical: 8 }}
      />
    </View>
  );
}

ErrorBanner.propTypes = {
  message: PropTypes.string.isRequired,
  onRetry: PropTypes.func.isRequired,
  style: PropTypes.any,
};

const styles = StyleSheet.create({
  errorBanner: {
    width: "100%",
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 10,
    backgroundColor: "#ffffff",
    opacity: 0.96,
    marginBottom: 8,
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 1,
  },
  errorText: {
    textAlign: "center",
    color: GREEN_TEXT_DARK,
    fontWeight: "700",
    marginBottom: 6,
  },
});
