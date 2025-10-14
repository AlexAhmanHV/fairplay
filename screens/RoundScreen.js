// screens/RoundScreen.js
import { Ionicons } from "@expo/vector-icons";
import { useCallback, useEffect, useMemo } from "react";
import { ActivityIndicator, Alert, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import FadeInSlide from "../components/FadeInSlide";
import FormCard from "../components/FormCard";
import LabeledSwitch from "../components/LabeledSwitch";
import Logo from "../components/Logo";
import NavButton from "../components/NavButton";
import PrimaryButton from "../components/PrimaryButton";
import ScoreStepper from "../components/ScoreStepper";
import ScreenGradient from "../components/ScreenGradient";
import { useRound } from "../context/RoundContext";
import { GREEN_PRIMARY, GREEN_TEXT_DARK } from "../theme/colors";

// Uniform row height for compact cards (shots/putts/switch rows).
const ROW_HEIGHT = 44;

/** Small presentational helper to keep rows visually consistent. */
function RowUniform({ children, style }) {
  return (
    <View style={[styles.rowUniform, style]}>{children}</View>
  );
}

export default function RoundScreen({ route, navigation }) {
  const { holesCount = 9 } = route.params ?? {};
  const {
    current,
    startRound,
    setStrokeForHole,
    setPuttsForHole,
    toggleFairwayHit,
    toggleGreenInReg,
    setPenaltiesForHole,
    nextHole,
    prevHole,
    endRound,
  } = useRound();

  // Start a round if none exists (e.g., deep-link or cold start).
  useEffect(() => {
    if (!current) startRound(holesCount);
  }, [current, holesCount, startRound]);

  // Loading guard while the round is being initialized.
  if (!current) {
    return (
      <ScreenGradient>
        <SafeAreaView style={styles.centerFill}>
          <ActivityIndicator size="small" color={GREEN_PRIMARY} />
          <Text style={styles.loadingText}>Preparing round…</Text>
        </SafeAreaView>
      </ScreenGradient>
    );
  }

  const hole = current?.holes?.[current.currentIndex];
  // Defensive guard: if for some reason the hole is missing, show a safe fallback.
  if (!hole) {
    return (
      <ScreenGradient>
        <SafeAreaView style={styles.centerFill}>
          <Text style={styles.errorText}>Could not load the current hole.</Text>
          <PrimaryButton
            title="Back to the landing page"
            variant="primary"
            onPress={() => navigation.navigate("Home")}
            icon={<Ionicons name="home" size={18} color={GREEN_TEXT_DARK} />}
            style={{ marginTop: 10 }}
          />
        </SafeAreaView>
      </ScreenGradient>
    );
  }

  const isStatsMode = current.mode === "stats";
  const isLastHole = current.currentIndex >= current.holesCount - 1;

  const totalStrokes = useMemo(
    () => current.holes.reduce((sum, h) => sum + (h.strokes ?? 0), 0),
    [current.holes]
  );

  /** Finish flow with confirmation and persistence error handling. */
  const handleFinishRound = useCallback(() => {
    Alert.alert("Finish round", "Do you want to save and finish this round?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Save & finish",
        style: "default",
        onPress: async () => {
          try {
            const saved = await endRound();
            navigation.replace("RoundSummary", { id: saved.id });
          } catch (e) {
            const msg = e?.message || "Something went wrong while saving the round.";
            Alert.alert("Saving failed", msg);
          }
        },
      },
    ]);
  }, [endRound, navigation]);

  const handleNext = isLastHole ? handleFinishRound : nextHole;

  // Switch styling shared config
  const switchTrackColor = { false: "#D9D9D9", true: GREEN_PRIMARY };
  const switchThumbColor = "#FFFFFF";

  return (
    <ScreenGradient>
      <SafeAreaView style={styles.screen}>
        <FadeInSlide delay={40} fromY={-6}>
          <View style={styles.header}>
            <Logo height={28} maxWidthPct={0.22} style={styles.headerLogo} />
            <Text style={styles.course} numberOfLines={2}>
              {current.course || "—"}
            </Text>
            <Text style={styles.dateText}>{current.date}</Text>
            <Text style={styles.holeProgress}>
              Hole {hole.number} of {current.holesCount}
            </Text>
          </View>
        </FadeInSlide>

        {/* Content cards */}
        <View style={styles.cards}>
          {/* Number of shots */}
          <FadeInSlide delay={100} fromY={8}>
            <FormCard>
              <RowUniform>
                <Text style={styles.rowLabel}>Number of shots</Text>
                <ScoreStepper
                  size="sm"
                  value={hole.strokes}
                  onChange={(v) => setStrokeForHole(hole.number, v)}
                />
              </RowUniform>
            </FormCard>
          </FadeInSlide>

          {isStatsMode && (
            <>
{/* Fairway in regulation */}
<FadeInSlide delay={140} fromY={8}>
  <LabeledSwitch
    label="Fairway in regulation"
    help="Tee shot landed on the fairway."
    value={!!hole.fairwayHit}
    onValueChange={() => toggleFairwayHit(hole.number)}
  />
</FadeInSlide>


{/* Green in regulation */}
<FadeInSlide delay={180} fromY={8}>
  <LabeledSwitch
    label="Green in regulation"
    help="Ball on the green with strokes ≤ par - 2."
    value={!!hole.greenInReg}
    onValueChange={() => toggleGreenInReg(hole.number)}
  />
</FadeInSlide>

              {/* Putts */}
              <FadeInSlide delay={220} fromY={8}>
                <FormCard>
                  <RowUniform>
                    <Text style={styles.rowLabel}>Putts</Text>
                    <ScoreStepper
                      size="sm"
                      value={hole.putts ?? 0}
                      onChange={(v) => setPuttsForHole(hole.number, v)}
                    />
                  </RowUniform>
                </FormCard>
              </FadeInSlide>

              {/* Penalty strokes */}
              <FadeInSlide delay={260} fromY={8}>
                <FormCard>
                  <RowUniform>
                    <Text style={styles.rowLabel}>Penalty strokes</Text>
                    <ScoreStepper
                      size="sm"
                      value={hole.penalties ?? 0}
                      onChange={(v) =>
                        typeof setPenaltiesForHole === "function" &&
                        setPenaltiesForHole(hole.number, v)
                      }
                    />
                  </RowUniform>
                </FormCard>
              </FadeInSlide>
            </>
          )}
        </View>

        {/* Navigation row: previous / next(or finish) */}
        <View style={styles.navRow}>
          <View style={styles.navCol}>
            <FadeInSlide delay={300} fromY={10}>
              <NavButton
                title="Previous hole"
                onPress={prevHole}
                variant={current.currentIndex === 0 ? "secondary" : "primary"}
                disabled={current.currentIndex === 0}
                iconPosition="left"
                icon={
                  <Ionicons
                    name="chevron-back"
                    size={18}
                    color={current.currentIndex === 0 ? GREEN_TEXT_DARK : "#FFFFFF"}
                  />
                }
              />
            </FadeInSlide>
          </View>

          <View style={styles.navCol}>
            <FadeInSlide delay={320} fromY={10}>
              <NavButton
                title={isLastHole ? "Finish" : "Next hole"}
                onPress={handleNext}
                variant="primary"
                iconPosition="right"
                icon={<Ionicons name="chevron-forward" size={18} color="#FFFFFF" />}
              />
            </FadeInSlide>
          </View>
        </View>

        {/* Finish now + running total */}
        <View style={styles.footer}>
          <FadeInSlide delay={340} fromY={10}>
            <PrimaryButton
              title="Finish round now"
              onPress={handleFinishRound}
              variant="primary"
              icon={<Ionicons name="checkmark" size={20} color={GREEN_TEXT_DARK} />}
            />
          </FadeInSlide>

          <Text style={styles.runningTotal}>
            Running total: {totalStrokes} shots
          </Text>
        </View>
      </SafeAreaView>
    </ScreenGradient>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },

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
  errorText: {
    color: GREEN_TEXT_DARK,
    fontWeight: "700",
  },

  header: {
    paddingHorizontal: 20,
    alignItems: "center",
    paddingTop: 8,
  },
  headerLogo: {
    marginBottom: 6,
    opacity: 0.95,
  },
  course: {
    fontSize: 20,
    fontWeight: "900",
    color: GREEN_TEXT_DARK,
    textAlign: "center",
  },
  dateText: {
    color: "#5E6D63",
    marginTop: 2,
    textAlign: "center",
    fontSize: 14,
    fontWeight: "600",
  },
  holeProgress: {
    textAlign: "center",
    marginTop: 8,
    fontSize: 22,
    fontWeight: "800",
    color: GREEN_PRIMARY,
  },

  cards: {
    paddingHorizontal: 20,
    marginTop: 16,
    gap: 10,
  },
  rowUniform: {
    height: ROW_HEIGHT,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
  },
  rowLabel: {
    color: GREEN_TEXT_DARK,
    fontWeight: "700",
  },
  switch: {
    transform: [{ scale: 0.9 }],
  },

  navRow: {
    paddingHorizontal: 20,
    flexDirection: "row",
    gap: 12,
    marginTop: "auto",
    marginBottom: 8,
  },
  navCol: {
    flex: 1,
    minWidth: 0,
  },

  footer: {
    paddingHorizontal: 20,
  },
  runningTotal: {
    textAlign: "center",
    color: "#6B6B6B",
    marginTop: 8,
  },
});
