import PropTypes from "prop-types";
import { StyleSheet, Text, View } from "react-native";
import { GREEN_TEXT_DARK } from "../theme/colors";

export default function StatRow({ label, value, compact = true, style }) {
  return (
    <View style={[styles.row, compact && styles.compact, style]}>
      <Text style={styles.label}>{label}</Text>
      <Text style={styles.value}>{value}</Text>
    </View>
  );
}

StatRow.propTypes = {
  label: PropTypes.string.isRequired,
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  compact: PropTypes.bool,
  style: PropTypes.any,
};

const styles = StyleSheet.create({
  row: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingVertical: 10 },
  compact: { paddingVertical: 6 },
  label: { color: GREEN_TEXT_DARK, fontWeight: "700" },
  value: { color: GREEN_TEXT_DARK, fontWeight: "800", fontSize: 20 },
});
