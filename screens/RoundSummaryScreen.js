// screens/RoundSummaryScreen.js
import { Ionicons } from "@expo/vector-icons";
import { useCallback, useEffect, useMemo, useState } from "react";
import { ActivityIndicator, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import ErrorBanner from "../components/ErrorBanner";
import FadeInSlide from "../components/FadeInSlide";
import FormCard from "../components/FormCard";
import Logo from "../components/Logo";
import PrimaryButton from "../components/PrimaryButton";
import ScreenGradient from "../components/ScreenGradient";
import StatRow from "../components/StatRow";
import { getRoundDetails } from "../db/rounds";
import { GREEN_PRIMARY, GREEN_TEXT_DARK } from "../theme/colors";
import { formatWeatherLine } from "../utils/formatters";

/**
RoundSummaryScreen
Loads a saved round by id, shows a loading state, and handles errors with a retry + CTA back to PreviousRounds.
On success, renders course/date, optional weather line, and compact stat cards (holes, strokes, putts, fairways, penalties) with subtle animations.
Keeps content inside a ScrollView with safe-area padding and ends with a primary button to return to PreviousRounds.
*/

export default function RoundSummaryScreen({ route, navigation }) {
  const { id } = route.params ?? {};
  const insets = useSafeAreaInsets();

  // UI state
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(null);
  const [data, setData] = useState(null);

  /** Load round details from DB with basic error handling. */
  const loadRound = useCallback(async () => {
    setLoading(true);
    setLoadError(null);
    try {
      if (id == null) throw new Error("Missing round id.");
      const res = await getRoundDetails(id);
      if (!res) throw new Error("Round not found.");
      setData(res);
    } catch (e) {
      console.warn("Failed to load round details:", e);
      setLoadError("Could not load this round.");
      setData(null);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    loadRound();
  }, [loadRound]);

  /** Derive summary metrics from raw round data. */
  const summary = useMemo(() => {
    if (!data?.holes) return null;
    const holesPlayed = data.holes_count ?? data.holes.length ?? 0;
    const totalStrokes =
      data.total_strokes ?? data.holes.reduce((s, h) => s + (h.strokes ?? 0), 0);
    const totalPutts = data.holes.reduce((s, h) => s + (h.putts ?? 0), 0);
    const fairwaysHit = data.holes.reduce((s, h) => s + (h.fairwayHit ? 1 : 0), 0);
    const totalPenalties = data.holes.reduce((s, h) => s + (h.penalties ?? 0), 0);
    return { holesPlayed, totalStrokes, totalPutts, fairwaysHit, totalPenalties };
  }, [data]);

  const hasWeather =
    !!data?.weather &&
    (data.weather.tempC != null || data.weather.desc || data.weather.windMps != null);
  const weatherLine = hasWeather ? formatWeatherLine(data.weather) : null;

  // Handlers
  // ✅ Jump directly to PreviousRounds screen
  const handleGoToPreviousRounds = useCallback(() => {
    navigation.navigate("PreviousRounds");
  }, [navigation]);

  // Loading state UI
  if (loading) {
    return (
      <ScreenGradient>
        <SafeAreaView style={styles.centerFill} edges={["left", "right", "bottom"]}>
          <ActivityIndicator size="small" color={GREEN_PRIMARY} />
          <Text style={styles.loadingText}>Loading round…</Text>
        </SafeAreaView>
      </ScreenGradient>
    );
  }

  // Error state UI
  if (loadError || !data || !summary) {
    return (
      <ScreenGradient>
        <SafeAreaView style={styles.centerFill} edges={["left", "right", "bottom"]}>
          <Logo height={72} maxWidthPct={0.5} style={styles.errorLogo} />
          <Text style={styles.title}>Round summary</Text>

          <View style={styles.errorBannerWrap}>
            <ErrorBanner
              message={loadError || "Something went wrong."}
              onRetry={loadRound}
            />
          </View>

          <PrimaryButton
            title="Back to previous rounds"
            variant="primary"
            onPress={handleGoToPreviousRounds}
            icon={<Ionicons name="arrow-back" size={20} color={GREEN_TEXT_DARK} />}
            style={styles.errorCta}
          />
        </SafeAreaView>
      </ScreenGradient>
    );
  }

  // Normal UI
  return (
    <ScreenGradient>
      <SafeAreaView style={styles.screen} edges={["left", "right", "bottom"]}>
        <ScrollView
          contentContainerStyle={[styles.container, { paddingBottom: insets.bottom + 16 }]}
          contentInsetAdjustmentBehavior="never"
        >

          <FadeInSlide delay={0} fromY={-10}>
            <Logo
              height={104}
              maxWidthPct={0.42}
              style={{ marginTop: Math.max(insets.top + 8, 16), marginBottom: 2 }}
            />
            <Text style={styles.title}>Round summary</Text>
          </FadeInSlide>

          {/* Intro */}
          <SummaryHeader
            delay={80}
            course={data.course}
            date={data.date}
            holesPlayed={summary.holesPlayed}
            weatherLine={weatherLine}
          />

          {/* Stats cards */}
          <StatsCards delayStart={120} summary={summary} />

          {/* CTA */}
          <View style={styles.ctaWrap}>
            <FadeInSlide delay={320} fromY={10}>
              <PrimaryButton
                title="Back to previous rounds"
                variant="primary"
                onPress={handleGoToPreviousRounds}
                icon={<Ionicons name="arrow-back" size={20} color={GREEN_TEXT_DARK} />}
              />
            </FadeInSlide>
          </View>
        </ScrollView>
      </SafeAreaView>
    </ScreenGradient>
  );
}

/** Intro block with course/date/weather. */
function SummaryHeader({ delay, course, date, holesPlayed, weatherLine }) {
  return (
    <View style={styles.introWrap}>
      <FadeInSlide delay={delay} fromY={6}>
        <Text style={styles.course} numberOfLines={2}>
          {course || "—"}
        </Text>
        <Text style={styles.meta}>
          {date} • {holesPlayed} holes
        </Text>
        {weatherLine ? (
          <Text style={styles.weather} numberOfLines={2}>
            {weatherLine}
          </Text>
        ) : null}
      </FadeInSlide>
    </View>
  );
}

/** Stats list rendered as compact cards. */
function StatsCards({ delayStart, summary }) {
  const items = useMemo(
    () => [
      { label: "Holes played", value: summary.holesPlayed, delay: delayStart },
      { label: "Total strokes", value: summary.totalStrokes, delay: delayStart + 40 },
      { label: "Putts", value: summary.totalPutts, delay: delayStart + 80 },
      { label: "Fairways hit", value: summary.fairwaysHit, delay: delayStart + 120 },
      { label: "Penalty strokes", value: summary.totalPenalties, delay: delayStart + 160 },
    ],
    [summary, delayStart]
  );

  return (
    <View style={styles.statsWrap}>
      {items.map((it) => (
        <FadeInSlide key={it.label} delay={it.delay} fromY={8}>
          <FormCard>
            <StatRow label={it.label} value={it.value} />
          </FormCard>
        </FadeInSlide>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },

  container: {
    flexGrow: 1,
    paddingTop: 0,
    gap: 10,
  },

  // Loading & error shared
  centerFill: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
  },
  loadingText: {
    marginTop: 8,
    color: "#ffffffcc",
  },
  errorLogo: { marginBottom: 10 },
  errorBannerWrap: { width: "88%", marginTop: 12 },
  errorCta: { marginTop: 6 },


  title: {
    textAlign: "center",
    color: GREEN_TEXT_DARK,
    fontWeight: "800",
    fontSize: 20,
    marginTop: 0,
    marginBottom: 2,
  },


  introWrap: {
    paddingHorizontal: 20,
    marginTop: 10,
    alignItems: "center",
  },
  course: {
    fontSize: 24,
    fontWeight: "900",
    color: GREEN_TEXT_DARK,
    textAlign: "center",
  },
  meta: {
    color: "#5E6D63",
    marginTop: 6,
    textAlign: "center",
    fontSize: 14,
    fontWeight: "600",
  },
  weather: {
    color: "#6F7C75",
    marginTop: 4,
    textAlign: "center",
    fontSize: 13,
  },

  statsWrap: {
    paddingHorizontal: 20,
    marginTop: 24,
    gap: 10,
  },

  ctaWrap: {
    paddingHorizontal: 20,
    marginTop: 8,
  },
});
