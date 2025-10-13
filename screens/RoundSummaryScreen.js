// screens/RoundSummaryScreen.js
import { useEffect, useMemo, useState } from "react";
import { Text, View } from "react-native";
import { getRoundDetails } from "../db/rounds";

export default function RoundSummaryScreen({ route }) {
  const { id } = route.params;
  const [data, setData] = useState(null);

  useEffect(() => {
    getRoundDetails(id).then(setData).catch(console.warn);
  }, [id]);

  const summary = useMemo(() => {
    if (!data?.holes) return null;
    const holesPlayed = data.holes_count ?? data.holes.length ?? 0;
    const totalStrokes = data.total_strokes ?? data.holes.reduce((s, h) => s + (h.strokes ?? 0), 0);
    const totalPutts = data.holes.reduce((s, h) => s + (h.putts ?? 0), 0);
    const fairwaysHit = data.holes.reduce((s, h) => s + (h.fairwayHit ? 1 : 0), 0);
    return { holesPlayed, totalStrokes, totalPutts, fairwaysHit };
  }, [data]);

  if (!data || !summary) return null;

  return (
    <View style={{ flex: 1, padding: 20, gap: 16 }}>
      <Text style={{ fontSize: 24, fontWeight: "700" }}>Runda sparad</Text>
      <Text style={{ color: "#444" }}>
        {data.course ? `${data.course} • ` : ""}
        {data.date} • {summary.holesPlayed} hål
      </Text>

      {/* Stats grid */}
      <View
        style={{
          marginTop: 6,
          flexDirection: "row",
          flexWrap: "wrap",
          gap: 12,
        }}
      >
        <StatCard label="Hål spelade" value={summary.holesPlayed} />
        <StatCard label="Totala slag" value={summary.totalStrokes} />
        <StatCard label="Puttar" value={summary.totalPutts} />
        <StatCard label="Fairways träffade" value={summary.fairwaysHit} />
      </View>

      {/* (Valfritt) kort textsummering */}
      <View
        style={{
          marginTop: 8,
          padding: 12,
          borderRadius: 12,
          backgroundColor: "#F7F9F7",
          borderWidth: 1,
          borderColor: "#E5EEE8",
        }}
      >
        <Text style={{ color: "#2E6B44" }}>
          {data.course ? `${data.course} • ` : ""}
          {summary.holesPlayed} hål • {summary.totalStrokes} slag • {summary.totalPutts} puttar •{" "}
          {summary.fairwaysHit} fairways
        </Text>
      </View>
    </View>
  );
}

function StatCard({ label, value }) {
  return (
    <View
      style={{
        flexGrow: 1,
        minWidth: "45%",
        padding: 14,
        borderRadius: 14,
        backgroundColor: "white",
        borderWidth: 1,
        borderColor: "#E6E6E6",
      }}
    >
      <Text style={{ fontSize: 22, fontWeight: "800", marginBottom: 4 }}>{value}</Text>
      <Text style={{ color: "#666" }}>{label}</Text>
    </View>
  );
}
