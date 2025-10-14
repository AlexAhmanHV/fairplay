// screens/RoundScreen.js
import { Ionicons } from "@expo/vector-icons";
import { useCallback, useEffect } from "react";
import { Alert, Image, Switch, Text, View } from "react-native"; // ⬅️ Image
import { SafeAreaView } from "react-native-safe-area-context";

import FadeInSlide from "../components/FadeInSlide";
import FormCard from "../components/FormCard";
import NavButton from "../components/NavButton";
import PrimaryButton from "../components/PrimaryButton";
import ScoreStepper from "../components/ScoreStepper";
import ScreenGradient from "../components/ScreenGradient";

import { useRound } from "../context/RoundContext";
import { GREEN_PRIMARY, GREEN_TEXT_DARK } from "../theme/colors";

// Gemensam rad: samma höjd för ALLA kort (matchar kompakta shots/putts)
const ROW_H = 44;
function RowUniform({ children, style }) {
  return (
    <View
      style={[
        {
          height: ROW_H,
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 12,
        },
        style,
      ]}
    >
      {children}
    </View>
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

  useEffect(() => {
    if (!current) startRound(holesCount);
  }, [current, holesCount, startRound]);

  if (!current) return null;

  const hole = current.holes[current.currentIndex];
  const totalStrokes = current.holes.reduce((s, h) => s + (h.strokes ?? 0), 0);
  const isStats = current.mode === "stats";

  const handleEnd = useCallback(() => {
    Alert.alert("Avsluta runda", "Vill du spara rundan och avsluta?", [
      { text: "Nej" },
      {
        text: "Ja, spara",
        onPress: async () => {
          try {
            const saved = await endRound();
            navigation.replace("RoundSummary", { id: saved.id });
          } catch (e) {
            Alert.alert("Fel vid sparning", e.message);
          }
        },
      },
    ]);
  }, [endRound, navigation]);

  const onNext = current.currentIndex < current.holesCount - 1 ? nextHole : handleEnd;

  const trackColor = { false: "#D9D9D9", true: GREEN_PRIMARY };
  const thumbColor = "#FFFFFF";
  const switchStyle = { transform: [{ scale: 0.9 }] };

  return (
    <ScreenGradient>
      <SafeAreaView style={{ flex: 1 }}>
        {/* Top info – kompakt logga + text */}
        <FadeInSlide delay={40} fromY={-6}>
          <View style={{ paddingHorizontal: 20, alignItems: "center", paddingTop: 8 }}>
            {/* Mini-logo (byt till din korrekta asset-path om annan) */}
            <Image
              source={require("../assets/logo.png")}
              style={{
                width: 32,
                height: 32,
                resizeMode: "contain",
                marginBottom: 6,
                opacity: 0.95,
              }}
            />
            <Text
              style={{
                fontSize: 20,
                fontWeight: "900",
                color: GREEN_TEXT_DARK,
                textAlign: "center",
              }}
              numberOfLines={2}
            >
              {current.course || "—"}
            </Text>
            <Text
              style={{
                color: "#5E6D63",
                marginTop: 2,
                textAlign: "center",
                fontSize: 14,
                fontWeight: "600",
              }}
            >
              {current.date}
            </Text>

            <Text
              style={{
                textAlign: "center",
                marginTop: 8,
                fontSize: 22,
                fontWeight: "800",
                color: GREEN_PRIMARY,
              }}
            >
              Hole {hole.number} of {current.holesCount}
            </Text>
          </View>
        </FadeInSlide>

        {/* Content cards */}
        <View style={{ paddingHorizontal: 20, marginTop: 16, gap: 10 }}>
          {/* Number of shots */}
          <FadeInSlide delay={100} fromY={8}>
            <FormCard>
              <RowUniform>
                <Text style={{ color: GREEN_TEXT_DARK, fontWeight: "700" }}>
                  Number of shots
                </Text>
                <ScoreStepper
                  size="sm"
                  value={hole.strokes}
                  onChange={(v) => setStrokeForHole(hole.number, v)}
                />
              </RowUniform>
            </FormCard>
          </FadeInSlide>

          {isStats && (
            <>
              {/* Fairway in regulation */}
              <FadeInSlide delay={140} fromY={8}>
                <FormCard>
                  <RowUniform>
                    <Text style={{ color: GREEN_TEXT_DARK, fontWeight: "700" }}>
                      Fairway in regulation
                    </Text>
                    <Switch
                      style={switchStyle}
                      value={!!hole.fairwayHit}
                      onValueChange={() => toggleFairwayHit(hole.number)}
                      trackColor={trackColor}
                      thumbColor={thumbColor}
                    />
                  </RowUniform>
                </FormCard>
              </FadeInSlide>

              {/* Green in regulation */}
              <FadeInSlide delay={180} fromY={8}>
                <FormCard>
                  <RowUniform>
                    <Text style={{ color: GREEN_TEXT_DARK, fontWeight: "700" }}>
                      Green in regulation
                    </Text>
                    <Switch
                      style={switchStyle}
                      value={!!hole.greenInReg}
                      onValueChange={() => toggleGreenInReg(hole.number)}
                      trackColor={trackColor}
                      thumbColor={thumbColor}
                    />
                  </RowUniform>
                </FormCard>
              </FadeInSlide>

              {/* Putts */}
              <FadeInSlide delay={220} fromY={8}>
                <FormCard>
                  <RowUniform>
                    <Text style={{ color: GREEN_TEXT_DARK, fontWeight: "700" }}>
                      Putts
                    </Text>
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
                    <Text style={{ color: GREEN_TEXT_DARK, fontWeight: "700" }}>
                      Penalty strokes
                    </Text>
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

        {/* Navigation row – lika breda, båda aktiva = gröna; på hål 1 är Previous disabled/outline */}
        <View
          style={{
            paddingHorizontal: 20,
            flexDirection: "row",
            gap: 12,
            marginTop: "auto",
            marginBottom: 8,
          }}
        >
          {/* Vänster halva */}
          <View style={{ flex: 1, minWidth: 0 }}>
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

          {/* Höger halva */}
          <View style={{ flex: 1, minWidth: 0 }}>
            <FadeInSlide delay={320} fromY={10}>
              <NavButton
                title={
                  current.currentIndex < current.holesCount - 1
                    ? "Next hole"
                    : "Finish"
                }
                onPress={onNext}
                variant="primary"
                iconPosition="right"
                icon={<Ionicons name="chevron-forward" size={18} color="#FFFFFF" />}
              />
            </FadeInSlide>
          </View>
        </View>

        {/* Finish now + running total */}
        <View style={{ paddingHorizontal: 20 }}>
          <FadeInSlide delay={340} fromY={10}>
            <PrimaryButton
              title="Finish round now"
              onPress={handleEnd}
              variant="primary"
              icon={<Ionicons name="checkmark" size={20} color={GREEN_TEXT_DARK} />}
            />
          </FadeInSlide>

          <Text style={{ textAlign: "center", color: "#6B6B6B", marginTop: 8 }}>
            Running total: {totalStrokes} shots
          </Text>
        </View>
      </SafeAreaView>
    </ScreenGradient>
  );
}
