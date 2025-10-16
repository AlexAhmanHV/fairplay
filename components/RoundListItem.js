// components/RoundListItem.js

// Renders a pressable round row with course, date, and total strokes.
// Shows ripple/opacity feedback and a spinner while navigating to the summary.
// Includes a separate delete button that disables during navigation/deletion.
// Used in PreviousRoundsScreen to list saved rounds.

import { Ionicons } from "@expo/vector-icons";
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from "react-native";
import { GREEN_TEXT_DARK } from "../theme/colors";
import FormCard from "./FormCard";

export default function RoundListItem({
  course,
  date,
  totalStrokes,
  isDeleting,
  isNavigating,
  onOpen,
  onDelete,
}) {
  return (
    <FormCard>
      <View style={styles.row}>
        <Pressable
          onPress={onOpen}
          android_ripple={{ color: "#00000014", borderless: false }}
          style={({ pressed }) => [styles.rowPressable, pressed && { opacity: 0.6 }]}
          accessibilityRole="button"
          accessibilityLabel={`View round ${course} ${date}`}
          accessibilityState={{ busy: !!isNavigating }}
        >
          <View style={styles.rowTextWrap}>
            <Text style={styles.rowCourse}>{course}</Text>
            <Text style={styles.rowMeta}>
              {date} • {totalStrokes} slag
            </Text>
          </View>
          {isNavigating ? (
            <ActivityIndicator size="small" color={GREEN_TEXT_DARK} />
          ) : (
            <View style={{ width: 20 }} />
          )}
        </Pressable>

        <Pressable
          onPress={onDelete}
          disabled={isDeleting || isNavigating}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          style={[styles.deleteBtn, (isDeleting || isNavigating) && { opacity: 0.5 }]}
          accessibilityRole="button"
          accessibilityLabel="Remove round"
        >
          <Ionicons name="close" size={16} color={isDeleting ? "#AAA" : "#B00020"} />
        </Pressable>
      </View>
    </FormCard>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: "row", alignItems: "center", gap: 8, minHeight: 56 },
  rowPressable: {
    flex: 1, flexDirection: "row", alignItems: "center", justifyContent: "space-between",
    paddingVertical: 6, paddingRight: 6,
  },
  rowTextWrap: { flex: 1, gap: 4, paddingRight: 12 },
  rowCourse: { fontWeight: "700", fontSize: 16, color: GREEN_TEXT_DARK },
  rowMeta: { color: "#5E6D63", marginTop: 2 },
  deleteBtn: { padding: 8, borderRadius: 999, },
});
