// screens/RoundSummaryScreen.js
import { Ionicons } from "@expo/vector-icons";
import { useEffect, useMemo, useState } from "react";
import { Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import FadeInSlide from "../components/FadeInSlide";
import FormCard from "../components/FormCard";
import LogoHeader from "../components/LogoHeader";
import PrimaryButton from "../components/PrimaryButton";
import ScreenGradient from "../components/ScreenGradient";

import { getRoundDetails } from "../db/rounds";
import { GREEN_TEXT_DARK } from "../theme/colors";

export default function RoundSummaryScreen({ route, navigation }) {
  const { id } = route.params;
  const [data, setData] = useState(null);

  useEffect(() => {
    getRoundDetails(id).then(setData).catch(console.warn);
  }, [id]);

  const summary = useMemo(() => {
    if (!data?.holes) return null;

    const holesPlayed = data.holes_count ?? data.holes.length ?? 0;
    const totalStrokes =
      data.total_strokes ?? data.holes.reduce((s, h) => s + (h.strokes ?? 0), 0);
    const totalPutts = data.holes.reduce((s, h) => s + (h.putts ?? 0), 0);
    const fairwaysHit = data.holes.reduce((s, h) => s + (h.fairwayHit ? 1 : 0), 0);
    const totalPenalties = data.holes.reduce((s, h) => s + (h.penalties ?? 0), 0);

    return {
      holesPlayed,
      totalStrokes,
      totalPutts,
      fairwaysHit,
      totalPenalties,
    };
  }, [data]);

  if (!data || !summary) return null;

  const hasWeather =
    !!data.weather &&
    (data.weather.tempC != null || data.weather.desc || data.weather.windMps != null);

  const weatherLine = hasWeather ? buildWeatherLine(data.weather) : null;

  return (
    <ScreenGradient>
      <SafeAreaView style={{ flex: 1 }}>
        {/* Header */}
        <View style={{ paddingHorizontal: 20, paddingTop: 24 }}>
          <FadeInSlide delay={0} fromY={-10}>
            <LogoHeader title="Round summary" />
          </FadeInSlide>
        </View>

        {/* Intro: centrera rundnamn + datum (+ ev. väder under) */}
        <View style={{ paddingHorizontal: 20, marginTop: 14, alignItems: "center" }}>
          <FadeInSlide delay={80} fromY={6}>
            <Text
              style={{
                fontSize: 24,
                fontWeight: "900",
                color: GREEN_TEXT_DARK,
                textAlign: "center",
              }}
              numberOfLines={2}
            >
              {data.course || "—"}
            </Text>

            <Text
              style={{
                color: "#5E6D63",
                marginTop: 6,
                textAlign: "center",
                fontSize: 14,
                fontWeight: "600",
              }}
            >
              {data.date} • {summary.holesPlayed} holes
            </Text>

            {hasWeather && (
              <Text
                style={{
                  color: "#6F7C75",
                  marginTop: 4,
                  textAlign: "center",
                  fontSize: 13,
                }}
                numberOfLines={2}
              >
                {weatherLine}
              </Text>
            )}
          </FadeInSlide>
        </View>

        {/* Stats-kort */}
        <View style={{ paddingHorizontal: 20, marginTop: 28, gap: 10 }}>
          <FadeInSlide delay={120} fromY={8}>
            <FormCard>
              <StatRow label="Holes played" value={summary.holesPlayed} />
            </FormCard>
          </FadeInSlide>

          <FadeInSlide delay={160} fromY={8}>
            <FormCard>
              <StatRow label="Total strokes" value={summary.totalStrokes} />
            </FormCard>
          </FadeInSlide>

          <FadeInSlide delay={200} fromY={8}>
            <FormCard>
              <StatRow label="Putts" value={summary.totalPutts} />
            </FormCard>
          </FadeInSlide>

          <FadeInSlide delay={240} fromY={8}>
            <FormCard>
              <StatRow label="Fairways hit" value={summary.fairwaysHit} />
            </FormCard>
          </FadeInSlide>

          <FadeInSlide delay={280} fromY={8}>
            <FormCard>
              <StatRow label="Penalty strokes" value={summary.totalPenalties} />
            </FormCard>
          </FadeInSlide>
        </View>

        {/* Extra luft innan CTA */}
        <View style={{ height: 16 }} />

        {/* CTA */}
        <View style={{ paddingHorizontal: 20, marginTop: 24 }}>
          <FadeInSlide delay={320} fromY={10}>
            <PrimaryButton
              title="Back to the landing page"
              variant="primary"
              onPress={() => navigation.navigate("Home")}
              icon={<Ionicons name="home" size={20} color={GREEN_TEXT_DARK} />}
            />
          </FadeInSlide>
        </View>
      </SafeAreaView>
    </ScreenGradient>
  );
}

function StatRow({ label, value }) {
  return (
    <View
      style={{
        paddingVertical: 6, // slim
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
      }}
    >
      <Text style={{ color: GREEN_TEXT_DARK, fontWeight: "700" }}>{label}</Text>
      <Text
        style={{
          fontSize: 20, // slim
          fontWeight: "800",
          color: GREEN_TEXT_DARK,
        }}
      >
        {value}
      </Text>
    </View>
  );
}

// Hjälpare för en kompakt väderrad
function buildWeatherLine(weather) {
  const parts = [];

  if (typeof weather.tempC === "number") {
    parts.push(`${Math.round(weather.tempC)}°C`);
  }
  if (weather.desc) {
    parts.push(weather.desc);
  }
  if (typeof weather.windMps === "number") {
    parts.push(`${Math.round(weather.windMps)} m/s`);
  }

  // valfritt: tid (lokal)
  if (weather.time) {
    try {
      const d = new Date(weather.time);
      const hh = String(d.getHours()).padStart(2, "0");
      const mm = String(d.getMinutes()).padStart(2, "0");
      parts.push(`${hh}:${mm}`);
    } catch {}
  }

  return parts.join(" • ");
}
