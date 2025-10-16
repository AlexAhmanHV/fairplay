// components/EmptyState.js

// Displays a friendly message when there’s no data to show.
// Includes a title, optional description, and an action button
// to guide the user toward creating or loading content.

import { StyleSheet, Text, View } from "react-native";
import { GREEN_TEXT_DARK } from "../theme/colors";
import PrimaryButton from "./PrimaryButton";

export default function EmptyState({ title, body, actionTitle, actionIcon, onPress }) {
  return (
    <View style={styles.wrap}>
      <Text style={styles.title}>{title}</Text>
      {body ? <Text style={styles.body}>{body}</Text> : null}
      {actionTitle ? (
        <PrimaryButton
          title={actionTitle}
          variant="primary"
          onPress={onPress}
          icon={actionIcon}
          style={{ marginTop: 8 }}
        />
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 24,
    gap: 12,
  },
  title: { fontSize: 18, fontWeight: "700", color: GREEN_TEXT_DARK },
  body: { color: "#666", textAlign: "center" },
});
