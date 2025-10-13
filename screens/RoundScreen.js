// screens/RoundScreen.js
import { useCallback, useEffect } from "react";
import { Alert, Pressable, Text, View } from "react-native";
import HoleHeader from "../components/HoleHeader";
import ScoreStepper from "../components/ScoreStepper";
import { useRound } from "../context/RoundContext";

function ToggleChip({ label, active, onPress }) {
  return (
    <Pressable
      onPress={onPress}
      style={{
        paddingVertical: 10,
        paddingHorizontal: 14,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: active ? "#3C9A5B" : "#D9D9D9",
        backgroundColor: active ? "#EAF7EF" : "#FFFFFF",
      }}
    >
      <Text style={{ color: active ? "#236B3C" : "#333" }}>{label}</Text>
    </Pressable>
  );
}

export default function RoundScreen({ route, navigation }) {
  const { holesCount = 9 } = route.params ?? {};
  const {
    current,
    startRound,
    setStrokeForHole,
    nextHole,
    prevHole,
    endRound,
    // nya setters för stats:
    setPuttsForHole,
    toggleFairwayHit,
    toggleGreenInReg,
  } = useRound();

  // Starta runda om ingen pågår (t.ex. deeplink)
  useEffect(() => {
    if (!current) startRound(holesCount);
  }, [current, holesCount, startRound]);

  if (!current) return null;

  const hole = current.holes[current.currentIndex];
  const total = current.holes.reduce((s, h) => s + (h.strokes ?? 0), 0);
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

  const onNext =
    current.currentIndex < current.holesCount - 1 ? nextHole : handleEnd;

  return (
    <View style={{ flex: 1, padding: 20, gap: 20 }}>
      <HoleHeader current={hole.number} total={current.holesCount} />

      {/* Slag */}
      <View style={{ alignItems: "center", marginTop: 8 }}>
        <Text style={{ marginBottom: 8, color: "#3C6E47" }}>
          Slag på hål {hole.number}
        </Text>
        <ScoreStepper
          value={hole.strokes}
          onChange={(v) => setStrokeForHole(hole.number, v)}
        />
      </View>

      {/* Statistik (visas bara i stats-läge) */}
      {isStats && (
        <View style={{ gap: 16, marginTop: 6 }}>
          {/* Putts */}
          <View style={{ alignItems: "center" }}>
            <Text style={{ marginBottom: 8, color: "#3C6E47" }}>
              Putts på hål {hole.number}
            </Text>
            <ScoreStepper
              value={hole.putts ?? 0}
              onChange={(v) => setPuttsForHole(hole.number, v)}
            />
          </View>

          {/* Fairway & GIR */}
          <View
            style={{
              flexDirection: "row",
              justifyContent: "center",
              gap: 10,
            }}
          >
            <ToggleChip
              label="Fairway hit"
              active={!!hole.fairwayHit}
              onPress={() => toggleFairwayHit(hole.number)}
            />
            <ToggleChip
              label="Green in reg."
              active={!!hole.greenInReg}
              onPress={() => toggleGreenInReg(hole.number)}
            />
          </View>
        </View>
      )}

      {/* Navigering */}
      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-between",
          marginTop: "auto",
          gap: 12,
        }}
      >
        <Pressable
          disabled={current.currentIndex === 0}
          onPress={prevHole}
          style={{
            flex: 1,
            padding: 16,
            borderRadius: 14,
            backgroundColor: "#F1F1F1",
            alignItems: "center",
            opacity: current.currentIndex === 0 ? 0.6 : 1,
          }}
        >
          <Text>Föregående</Text>
        </Pressable>

        <Pressable
          onPress={onNext}
          style={{
            flex: 1,
            padding: 16,
            borderRadius: 14,
            backgroundColor: "#3C9A5B",
            alignItems: "center",
          }}
        >
          <Text style={{ color: "white", fontWeight: "600" }}>
            {current.currentIndex < current.holesCount - 1
              ? "Nästa hål"
              : "Avsluta"}
          </Text>
        </Pressable>
      </View>

      {/* Total + avsluta nu */}
      <View style={{ alignItems: "center" }}>
        <Text style={{ color: "#6B6B6B" }}>Löpande total: {total} slag</Text>
        <Pressable onPress={handleEnd} style={{ marginTop: 8 }}>
          <Text style={{ textDecorationLine: "underline", color: "#3C6E47" }}>
            Avsluta runda nu
          </Text>
        </Pressable>
      </View>
    </View>
  );
}
