// screens/HomeScreen.js
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import { useCallback, useMemo, useRef, useState } from "react";
import { ActivityIndicator, StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import ErrorBanner from "../components/ErrorBanner";
import FadeInSlide from "../components/FadeInSlide";
import LogoHeader from "../components/LogoHeader";
import PrimaryButton from "../components/PrimaryButton";
import RecentRoundsList from "../components/RecentRoundsList";
import ScreenGradient from "../components/ScreenGradient";
import { useRound } from "../context/RoundContext";
import { dbClearActiveRound, dbLoadActiveRound } from "../db/rounds";
import { useRecentRounds } from "../hooks/useRecentRounds";


/**
HomeScreen
Shows the logo header, a conditional “Resume round” CTA (with discard), and a primary “Start a new round” button.
Loads and displays the 3 most recent rounds, with error and loading feedback; inserts a flex spacer to keep the list low when no draft exists.
Refreshes recent rounds and draft state on screen focus; resuming hydrates state from RoundContext and navigates back into the round.
*/


export default function HomeScreen() {
  const navigation = useNavigation();
  const { hydrateFromSnapshot } = useRound();

  // recent rounds + error/loading
  const [loadError, setLoadError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const { rounds, load } = useRecentRounds(3, (err) => {
    console.warn("Failed to load recent rounds:", err);
    setLoadError("Could not load recent rounds.");
  });

  // keep a stable reference to the latest load() without re-triggering effects
  const loadRef = useRef(load);
  loadRef.current = load;

  // resume draft state
  const [draft, setDraft] = useState(null);
  const [checkingDraft, setCheckingDraft] = useState(true);
  const [storageError, setStorageError] = useState(null);

  // Refresh on screen focus (stable callback; no deps that change every render)
  useFocusEffect(
    useCallback(() => {
      let cancelled = false;

      const run = async () => {
        if (cancelled) return;
        setLoadError(null);
        setStorageError(null);
        setIsLoading(true);
        setCheckingDraft(true);

        try {
          // recent rounds
          await loadRef.current?.();

          // draft
          try {
            const snap = await dbLoadActiveRound();
            const fresh = snap && Date.now() - snap.updatedAt < 3 * 24 * 60 * 60 * 1000; // 72h
            if (!cancelled) setDraft(fresh ? snap : null);
          } catch (e) {
            console.warn("Draft load failed:", e);
            if (!cancelled) {
              setDraft(null);
              setStorageError("Draft storage not available right now.");
            }
          }
        } finally {
          if (!cancelled) {
            setIsLoading(false);
            setCheckingDraft(false);
          }
        }
      };

      run();
      return () => {
        cancelled = true;
      };
    }, [])
  );

  // handlers
  const handleStartNewRound = useCallback(
    () => navigation.navigate("StartRound"),
    [navigation]
  );

  const handleOpenRound = useCallback(
    (id) => navigation.navigate("RoundSummary", { id }),
    [navigation]
  );

  const handleShowAllRounds = useCallback(
    () => navigation.navigate("PreviousRounds"),
    [navigation]
  );

  const handleRetry = useCallback(async () => {
    setLoadError(null);
    setIsLoading(true);
    try {
      await loadRef.current?.();
    } finally {
      setIsLoading(false);
    }
  }, []);

  const handleResume = useCallback(() => {
    if (!draft) return;
    hydrateFromSnapshot(draft);
    navigation.navigate("Round", { holeIndex: draft.holeIndex ?? draft.currentIndex ?? 0 });
  }, [draft, hydrateFromSnapshot, navigation]);

  const handleDiscard = useCallback(async () => {
    if (!draft) return;
    try {
      await dbClearActiveRound();
    } catch (e) {
      console.warn("Failed to clear draft:", e);
    }
    setDraft(null);
  }, [draft]);

  // logo-only header; we place Resume + Start below it
  const headerProps = useMemo(
    () => ({
      variant: "compact",
      showButton: false,
      topPadding: 132,
      logoHeight: 190,
      maxWidthPct: 1,
    }),
    []
  );

  return (
    <ScreenGradient>
      <SafeAreaView style={styles.container}>
        <LogoHeader {...headerProps} />

        {/* Resume button (if a draft exists) */}
        {!checkingDraft && draft ? (
          <FadeInSlide style={{ marginBottom: 20 }}>
            <PrimaryButton
              title="Resume round"
              subtitle={`${draft.course ?? draft.courseName ?? "Course"} • Hole ${(draft.holeIndex ?? draft.currentIndex ?? 0) + 1} • updated ${new Date(draft.updatedAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`}
              onPress={handleResume}
              rightIcon="close"
              onRightPress={handleDiscard}
              style={{ marginBottom: 16 }}   // extra spacing below the button
              accessibilityLabel={`Resume round at ${draft.courseName ?? "Course"}, hole ${(draft.holeIndex ?? draft.currentIndex ?? 0) + 1}`}
            />
          </FadeInSlide>
        ) : null}

        {/* Start CTA */}
        <FadeInSlide delay={draft ? 80 : 0} style={styles.startCtaWrap}>
          <PrimaryButton title="Start a new round" onPress={handleStartNewRound} />
        </FadeInSlide>

        {/* When there's NO draft, insert a spacer to push the list downward */}
        {!checkingDraft && !draft ? <View style={styles.flexSpacer} /> : null}

        {/* Errors */}
        {storageError && <ErrorBanner message={storageError} onRetry={handleRetry} />}
        {loadError && <ErrorBanner message={loadError} onRetry={handleRetry} />}

        {/* Loading */}
        {isLoading && !loadError && (
          <View style={styles.loadingRow}>
            <ActivityIndicator size="small" />
          </View>
        )}

        {/* Recent rounds */}
        <View style={styles.listSection}>
          <RecentRoundsList
            rounds={rounds}
            onOpenRound={handleOpenRound}
            onShowAll={handleShowAllRounds}
          />
        </View>
      </SafeAreaView>
    </ScreenGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 20,
  },
  // Spacer that expands to push the list to the bottom when there's no draft
  flexSpacer: {
    flexGrow: 1,
  },

  startCtaWrap: {
    marginBottom: 8,
  },

  // Let spacer control layout; avoid consuming all remaining space here
  listSection: {
    width: "100%",
    marginTop: 8,
    // (intentionally no flex: 1)
  },

  loadingRow: {
    width: "100%",
    paddingVertical: 6,
    alignItems: "center",
  },
});
