// screens/HomeScreen.js
import { useNavigation } from "@react-navigation/native";
import { useCallback, useEffect, useMemo, useState } from "react";
import { ActivityIndicator, StyleSheet, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import ErrorBanner from "../components/ErrorBanner";
import LogoHeader from "../components/LogoHeader";
import RecentRoundsList from "../components/RecentRoundsList";
import ScreenGradient from "../components/ScreenGradient";
import { useRecentRounds } from "../hooks/useRecentRounds";

/**
 * HomeScreen
 * - Shows a branded header with CTA to start a new round.
 * - Lists the 3 most recent rounds.
 * - Handles loading and error states gracefully.
 */
export default function HomeScreen() {
  const navigation = useNavigation();

  // Error state for recent rounds load
  const [loadError, setLoadError] = useState(null);
  // Optional local loading indicator if the hook does not expose loading state
  const [isLoading, setIsLoading] = useState(false);

  /** Called by the hook if loading recent rounds fails. */
  const handleRoundsLoadError = useCallback((err) => {
    console.warn("Failed to load recent rounds:", err);
    setLoadError("Could not load recent rounds.");
  }, []);

  const { rounds, load } = useRecentRounds(3, handleRoundsLoadError);

  /** Load rounds on mount and whenever screen regains focus. */
  useEffect(() => {
    const run = async () => {
      setLoadError(null);
      setIsLoading(true);
      try {
        // If your hook's `load` doesn't return a promise,
        // remove `await` and keep the spinner logic minimal.
        await load();
      } finally {
        setIsLoading(false);
      }
    };

    const unsub = navigation.addListener("focus", run);
    run();
    return unsub;
  }, [navigation, load]);

  /** Handlers keep JSX clean and names self-explanatory. */
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
      await load();
    } finally {
      setIsLoading(false);
    }
  }, [load]);

  // Responsive header sizing (keeps intent but adapts on small screens)
  const headerProps = useMemo(
    () => ({
      variant: "compact",
      showButton: true,
      onStart: handleStartNewRound,
      topPadding: 132,
      logoHeight: 190,  
      maxWidthPct: 1,    
    }),
    [handleStartNewRound]
  );

  return (
    <ScreenGradient>
      <SafeAreaView style={styles.container}>
        <LogoHeader {...headerProps} />

        {/* Error and loading feedback near the top to be noticed but not intrusive */}
        {loadError && <ErrorBanner message={loadError} onRetry={handleRetry} />}
        {isLoading && !loadError && (
          <View style={styles.loadingRow}>
            <ActivityIndicator size="small" />
          </View>
        )}

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
    justifyContent: "space-between",
  },
  listSection: {
    width: "100%",
  },
  loadingRow: {
    width: "100%",
    paddingVertical: 6,
    alignItems: "center",
  },
});
