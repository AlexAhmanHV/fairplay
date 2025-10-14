// screens/PreviousRoundsScreen.js
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Pressable,
  RefreshControl,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";

import ErrorBanner from "../components/ErrorBanner";
import FadeInSlide from "../components/FadeInSlide";
import FormCard from "../components/FormCard";
import LogoHeader from "../components/LogoHeader";
import PrimaryButton from "../components/PrimaryButton";
import ScreenGradient from "../components/ScreenGradient";

import { deleteRound, getRounds } from "../db/rounds";
import { GREEN_PRIMARY, GREEN_TEXT_DARK } from "../theme/colors";

/** Formatter for ISO date → visible date. Expand later if needed. */
function formatDate(iso) {
  return iso ?? "";
}

/**
 * PreviousRoundsScreen
 * - Fetches and lists all saved rounds.
 * - Supports pull-to-refresh, navigation to summary, and deletion with confirm.
 * - Shows loading and error states with user-friendly feedback.
 * - Keeps a sticky footer button to go back home while the list remains scrollable.
 */
export default function PreviousRoundsScreen({ navigation }) {
  const insets = useSafeAreaInsets();

  const [rounds, setRounds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [loadError, setLoadError] = useState(null);

  /** Fetch rounds from DB with error handling. */
  const loadRounds = useCallback(async () => {
    setLoadError(null);
    try {
      const data = await getRounds();
      setRounds(data || []);
    } catch (e) {
      console.warn("Failed to load rounds:", e);
      setLoadError("Could not load rounds.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  /** Reload when screen gains focus (e.g., returning from another screen). */
  useEffect(() => {
    const unsub = navigation.addListener("focus", loadRounds);
    loadRounds();
    return unsub;
  }, [navigation, loadRounds]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    loadRounds();
  }, [loadRounds]);

  /** Confirm deletion and update list on success. */
  const confirmDelete = useCallback((roundId) => {
    Alert.alert(
      "Remove round",
      "Are you sure you want to remove this round? This cannot be undone.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Remove",
          style: "destructive",
          onPress: async () => {
            try {
              setDeletingId(roundId);
              await deleteRound(roundId);
              setRounds((prev) => prev.filter((r) => r.id !== roundId));
            } catch (e) {
              console.warn("Delete failed:", e);
              Alert.alert("Error", "Could not remove round.");
            } finally {
              setDeletingId(null);
            }
          },
        },
      ]
    );
  }, []);

  /** Stable key extractor for FlatList. */
  const keyExtractor = useCallback((item) => String(item.id), []);

  /** Render a single round row. Kept as a small component for clarity. */
  const renderItem = useCallback(
    ({ item, index }) => {
      const course = item.course || "—";
      const date = formatDate(item.date);
      const total = item.total_strokes ?? 0;
      const isDeleting = deletingId === item.id;

      return (
        <FadeInSlide delay={50 + index * 40} fromY={8}>
          <RoundListItem
            course={course}
            date={date}
            totalStrokes={total}
            isDeleting={isDeleting}
            onOpen={() => navigation.navigate("RoundSummary", { id: item.id })}
            onDelete={() => confirmDelete(item.id)}
          />
        </FadeInSlide>
      );
    },
    [confirmDelete, deletingId, navigation]
  );

  // Loading screen (first load)
  if (loading) {
    return (
      <ScreenGradient>
        <SafeAreaView style={styles.fillCenter}>
          <ActivityIndicator color={GREEN_PRIMARY} />
          <Text style={styles.loadingText}>Laddar rundor…</Text>
        </SafeAreaView>
      </ScreenGradient>
    );
  }

  // Empty state
  if (!rounds.length) {
    return (
      <ScreenGradient>
        <SafeAreaView style={styles.screen}>
          <View style={styles.headerWrap}>
            <FadeInSlide delay={0} fromY={-10}>
              <LogoHeader variant="compact" showButton={false} topPadding={12} logoHeight={64} />
              <Text style={styles.title}>Previous rounds</Text>
            </FadeInSlide>
          </View>

          {loadError ? (
            <View style={styles.errorWrap}>
              <ErrorBanner message={loadError} onRetry={loadRounds} />
            </View>
          ) : null}

          <View style={styles.emptyWrap}>
            <Text style={styles.emptyTitle}>Inga sparade rundor ännu</Text>
            <Text style={styles.emptyBody}>Starta en runda från hemskärmen och spara den här.</Text>

            <PrimaryButton
              title="Start a round"
              variant="primary"
              onPress={() => navigation.navigate("StartRound")}
              icon={<MaterialCommunityIcons name="golf-tee" size={20} color={GREEN_TEXT_DARK} />}
              style={{ marginTop: 8 }}
            />
          </View>
        </SafeAreaView>
      </ScreenGradient>
    );
  }

  // Normal list with sticky footer
  return (
    <ScreenGradient>
      <SafeAreaView style={styles.screen}>
        {/* Header */}
        <View style={styles.headerWrap}>
          <FadeInSlide delay={0} fromY={-10}>
            <LogoHeader variant="compact" showButton={false} topPadding={12} logoHeight={64} />
            <Text style={styles.title}>Previous rounds</Text>
          </FadeInSlide>
        </View>

        {/* Error (if any) */}
        {loadError ? (
          <View style={styles.errorWrap}>
            <ErrorBanner message={loadError} onRetry={loadRounds} />
          </View>
        ) : null}

        {/* Main content: list scrolls; footer stays at the bottom */}
        <View style={styles.content}>
          <FlatList
            data={rounds}
            keyExtractor={keyExtractor}
            renderItem={renderItem}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={onRefresh}
                colors={[GREEN_PRIMARY]}
                tintColor={GREEN_PRIMARY}
              />
            }
            // minor bottom spacing so the last card isn't tight against the footer shadow/edge
            contentContainerStyle={[styles.listContent, { paddingBottom: 8 }]}
            ItemSeparatorComponent={() => <View style={styles.separator} />}
          />

          {/* Sticky footer (non-scrolling) */}
          <View style={[styles.footerWrap, { paddingBottom: Math.max(insets.bottom, 12) }]}>
            <PrimaryButton
              title="Back to the landing page"
              variant="primary"
              onPress={() => navigation.navigate("Home")}
              icon={<Ionicons name="home" size={20} color={GREEN_TEXT_DARK} />}
            />
          </View>
        </View>
      </SafeAreaView>
    </ScreenGradient>
  );
}

/**
 * RoundListItem
 * Single row with:
 * - pressable "open summary" area (course/date/total + chevron)
 * - separate delete button to avoid overlap
 */
function RoundListItem({ course, date, totalStrokes, isDeleting, onOpen, onDelete }) {
  return (
    <FormCard>
      <View style={styles.row}>
        {/* Navigate to summary */}
        <Pressable
          onPress={onOpen}
          style={styles.rowPressable}
          accessibilityRole="button"
          accessibilityLabel={`View round ${course} ${date}`}
        >
          <View style={styles.rowTextWrap}>
            <Text style={styles.rowCourse}>{course}</Text>
            <Text style={styles.rowMeta}>
              {date} • {totalStrokes} slag
            </Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color={GREEN_TEXT_DARK} />
        </Pressable>

        {/* Delete button */}
        <Pressable
          onPress={onDelete}
          disabled={isDeleting}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          style={styles.deleteBtn}
          accessibilityRole="button"
          accessibilityLabel="Remove round"
        >
          <Ionicons
            name="close"
            size={16}
            color={isDeleting ? "#AAA" : "#B00020"}
          />
        </Pressable>
      </View>
    </FormCard>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  fillCenter: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 20,
  },
  loadingText: {
    marginTop: 8,
    color: GREEN_TEXT_DARK,
  },

  headerWrap: {
    paddingHorizontal: 20,
    paddingTop: 16,
    marginBottom: 8,
    alignItems: "center",
  },
  title: {
    marginTop: 4,
    textAlign: "center",
    color: GREEN_TEXT_DARK,
    fontWeight: "800",
    fontSize: 20,
  },

  errorWrap: {
    paddingHorizontal: 20,
    marginBottom: 8,
  },

  emptyWrap: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 24,
    gap: 12,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: GREEN_TEXT_DARK,
  },
  emptyBody: {
    color: "#666",
    textAlign: "center",
  },

  // Main content: FlatList (flex:1) + sticky footer
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  footerWrap: {
    paddingTop: 8,
    backgroundColor: "transparent",
  },

  // List styles
  listContent: {
    paddingHorizontal: 0, // content already has horizontal padding
    paddingBottom: 24,
  },
  separator: {
    height: 10,
  },

  // Row styles
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    minHeight: 56,
  },
  rowPressable: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 4,
    paddingRight: 6,
  },
  rowTextWrap: {
    flex: 1,
    gap: 4,
    paddingRight: 12,
  },
  rowCourse: {
    fontWeight: "700",
    fontSize: 16,
    color: GREEN_TEXT_DARK,
  },
  rowMeta: {
    color: "#5E6D63",
  },
  deleteBtn: {
    padding: 8,
    borderRadius: 999,
    backgroundColor: "#F7F7F7",
  },
});
