// screens/PreviousRoundsScreen.js
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { useCallback, useEffect, useState } from "react";
import {
  Alert,
  FlatList,
  RefreshControl,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";

import EmptyState from "../components/EmptyState";
import ErrorBanner from "../components/ErrorBanner";
import FadeInSlide from "../components/FadeInSlide";
import LoadingView from "../components/LoadingView";
import LogoHeader from "../components/LogoHeader";
import PrimaryButton from "../components/PrimaryButton";
import RoundListItem from "../components/RoundListItem"; // ✅ use the extracted component
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
  const [navigatingId, setNavigatingId] = useState(null);

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
    const unsub = navigation.addListener("focus", () => {
      setNavigatingId(null); // stop any spinner when we come back
      loadRounds();
    });
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

  /** Render a single round row. */
  const renderItem = useCallback(
    ({ item, index }) => {
      const course = item.course || "—";
      const date = formatDate(item.date);
      const total = item.total_strokes ?? 0;
      const isDeleting = deletingId === item.id;
      const isNavigating = navigatingId === item.id;

      return (
        <FadeInSlide delay={50 + index * 40} fromY={8}>
          <RoundListItem
            course={course}
            date={date}
            totalStrokes={total}
            isDeleting={isDeleting}
            isNavigating={isNavigating}
            onOpen={() => {
              if (isNavigating) return; // ignore double taps
              setNavigatingId(item.id); // show spinner
              navigation.navigate("RoundSummary", { id: item.id });
            }}
            onDelete={() => confirmDelete(item.id)}
          />
        </FadeInSlide>
      );
    },
    [confirmDelete, deletingId, navigation, navigatingId]
  );

  // Loading screen (first load)
  if (loading) return <LoadingView label="Laddar rundor…" />;

  // Empty state
  if (!rounds.length) {
    return (
      <ScreenGradient>
        <SafeAreaView style={styles.screen}>
          <View style={styles.headerWrap}>
            <FadeInSlide delay={0} fromY={-10}>
              <LogoHeader
                variant="compact"
                showButton={false}
                topPadding={12}
                logoHeight={64}
              />
              <Text style={styles.title}>Previous rounds</Text>
            </FadeInSlide>
          </View>

          {loadError ? (
            <View style={styles.errorWrap}>
              <ErrorBanner message={loadError} onRetry={loadRounds} />
            </View>
          ) : null}

          <EmptyState
            title="Inga sparade rundor ännu"
            body="Starta en runda från hemskärmen och spara den här."
            actionTitle="Start a round"
            actionIcon={
              <MaterialCommunityIcons
                name="golf-tee"
                size={20}
                color={GREEN_TEXT_DARK}
              />
            }
            onPress={() => navigation.navigate("StartRound")}
          />
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
            <LogoHeader
              variant="compact"
              showButton={false}
              topPadding={12}
              logoHeight={64}
            />
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
            contentContainerStyle={[styles.listContent, { paddingBottom: 8 }]}
            ItemSeparatorComponent={() => <View style={styles.separator} />}
          />

          {/* Sticky footer */}
          <View
            style={[styles.footerWrap, { paddingBottom: Math.max(insets.bottom, 12) }]}
          >
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

const styles = StyleSheet.create({
  screen: { flex: 1 },

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
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  footerWrap: {
    paddingTop: 8,
    backgroundColor: "transparent",
  },
  listContent: {
    paddingHorizontal: 0,
    paddingBottom: 24,
  },
  separator: { height: 10 },
});
