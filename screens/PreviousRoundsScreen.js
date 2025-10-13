// screens/PreviousRoundsScreen.js
import { Ionicons } from "@expo/vector-icons";
import { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Pressable,
  RefreshControl,
  Text,
  View,
} from "react-native";
import { deleteRound, getRounds } from "../db/rounds";

function formatDate(iso) {
  return iso ?? "";
}

export default function PreviousRoundsScreen({ navigation }) {
  const [rounds, setRounds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [deletingId, setDeletingId] = useState(null);

  const load = useCallback(async () => {
    try {
      const data = await getRounds();
      setRounds(data || []);
    } catch (e) {
      console.warn("Failed to load rounds:", e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    const unsubscribe = navigation.addListener("focus", load);
    load();
    return unsubscribe;
  }, [navigation, load]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    load();
  }, [load]);

  const confirmDelete = useCallback((roundId) => {
    Alert.alert(
      "Ta bort runda",
      "Är du säker på att du vill ta bort den här rundan? Detta går inte att ångra.",
      [
        { text: "Avbryt", style: "cancel" },
        {
          text: "Ta bort",
          style: "destructive",
          onPress: async () => {
            try {
              setDeletingId(roundId);
              await deleteRound(roundId);
              // Optimistisk uppdatering – ta bort från state direkt
              setRounds((prev) => prev.filter((r) => r.id !== roundId));
            } catch (e) {
              Alert.alert("Fel", "Kunde inte ta bort rundan.");
              console.warn(e);
            } finally {
              setDeletingId(null);
            }
          },
        },
      ]
    );
  }, []);

  const renderItem = ({ item }) => {
    const course = item.course || "—";
    const date = formatDate(item.date);
    const total = item.total_strokes ?? 0;
    const isDeleting = deletingId === item.id;

    return (
      <View
        style={{
          padding: 14,
          borderRadius: 12,
          borderWidth: 1,
          borderColor: "#E6E6E6",
          backgroundColor: "white",
          marginHorizontal: 16,
          marginVertical: 6,
        }}
      >
        {/* Radens innehåll som knapp till summering */}
        <Pressable
          onPress={() => navigation.navigate("RoundSummary", { id: item.id })}
          style={{
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <View style={{ flex: 1, gap: 4, paddingRight: 12 }}>
            {/* Rad 1: Bana */}
            <Text style={{ fontWeight: "700", fontSize: 16 }}>{course}</Text>
            {/* Rad 2: Datum • Antal slag */}
            <Text style={{ color: "#666" }}>
              {date} • {total} slag
            </Text>
          </View>
          <Text style={{ color: "#3C6E47", fontWeight: "600" }}>Visa ➜</Text>
        </Pressable>

        {/* Kryss-knapp uppe till höger */}
        <Pressable
          onPress={() => confirmDelete(item.id)}
          disabled={isDeleting}
          hitSlop={12}
          style={{
            position: "absolute",
            right: 8,
            top: 8,
            padding: 6,
            borderRadius: 999,
            backgroundColor: "#F7F7F7",
          }}
        >
          <Ionicons
            name="close"
            size={16}
            color={isDeleting ? "#AAA" : "#B00020"}
          />
        </Pressable>
      </View>
    );
  };

  if (loading) {
    return (
      <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
        <ActivityIndicator />
        <Text style={{ marginTop: 8 }}>Laddar rundor…</Text>
      </View>
    );
  }

  if (!rounds.length) {
    return (
      <View
        style={{ flex: 1, alignItems: "center", justifyContent: "center", padding: 24 }}
      >
        <Text style={{ fontSize: 18, fontWeight: "700", marginBottom: 6 }}>
          Inga sparade rundor ännu
        </Text>
        <Text style={{ color: "#666", textAlign: "center" }}>
          Starta en runda från hemskärmen och spara den här.
        </Text>
        <FlatList
          data={[]}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        />
      </View>
    );
  }

  return (
    <View style={{ flex: 1, paddingTop: 12 }}>
      <FlatList
        data={rounds}
        keyExtractor={(item) => String(item.id)}
        renderItem={renderItem}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        contentContainerStyle={{ paddingVertical: 6 }}
        ItemSeparatorComponent={() => <View style={{ height: 4 }} />}
      />
    </View>
  );
}
