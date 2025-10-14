// components/RoundCard.js
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { StyleSheet, Text, View } from "react-native";
import { GREEN_PRIMARY, GREEN_TEXT_DARK } from "../theme/colors";

/**
 * @typedef {Object} RoundCardProps
 * @property {string} [course]  - Banförkortning/namn
 * @property {string} [date]    - Datumsträng
 * @property {import('react-native').StyleProp<import('react-native').ViewStyle>} [style] - Valfri extra stil
 */

/**
 * @param {RoundCardProps} props
 */
export default function RoundCard({ course = "—", date = "", style }) {
  return (
    <View style={[styles.row, style]}>
      <MaterialCommunityIcons
        name="golf-tee"
        size={20}
        color={GREEN_TEXT_DARK}
        style={{ marginRight: 10 }}
      />
      <Text style={styles.text}>
        {course} {date ? "– " + date : ""}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    backgroundColor: GREEN_PRIMARY,
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 14,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",

    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  text: {
    color: GREEN_TEXT_DARK,
    fontSize: 15,
    fontWeight: "500",
    flex: 1,
    textAlign: "center",
  },
});
