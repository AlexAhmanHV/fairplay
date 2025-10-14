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
import { SafeAreaView } from "react-native-safe-area-context";
import FadeInSlide from "../components/FadeInSlide";
import FormCard from "../components/FormCard";
import LogoHeader from "../components/LogoHeader";
import PrimaryButton from "../components/PrimaryButton";
import ScreenGradient from "../components/ScreenGradient";
import { deleteRound, getRounds } from "../db/rounds";
import { GREEN_PRIMARY, GREEN_TEXT_DARK } from "../theme/colors";

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
    const unsub = navigation.addListener("focus", load);
    load();
    return unsub;
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

  const renderItem = ({ item, index }) => {
    const course = item.course || "—";
    const date = formatDate(item.date);
    const total = item.total_strokes ?? 0;
    const isDeleting = deletingId === item.id;

    return (
      <FadeInSlide delay={50 + index * 40} fromY={8}>
        <FormCard>
          {/* Rada upp: [Navigationsknapp (flex:1)] [Delete-knapp] */}
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              gap: 8,
              minHeight: 56,
            }}
          >
            {/* Hela raden klickbar till summering – inkluderar chevron */}
            <Pressable
              onPress={() => navigation.navigate("RoundSummary", { id: item.id })}
              style={{
                flex: 1,
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "space-between",
                paddingVertical: 4,
                paddingRight: 6, // lämna lite luft innan X-knappen
              }}
              accessibilityRole="button"
              accessibilityLabel={`Visa runda ${course} ${date}`}
            >
              <View style={{ flex: 1, gap: 4, paddingRight: 12 }}>
                <Text style={{ fontWeight: "700", fontSize: 16, color: GREEN_TEXT_DARK }}>
                  {course}
                </Text>
                <Text style={{ color: "#5E6D63" }}>
                  {date} • {total} slag
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color={GREEN_TEXT_DARK} />
            </Pressable>

            {/* X-knappen är separat element, så den överlappar aldrig pilen */}
            <Pressable
              onPress={() => confirmDelete(item.id)}
              disabled={isDeleting}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              style={{
                padding: 8,
                borderRadius: 999,
                backgroundColor: "#F7F7F7",
              }}
              accessibilityRole="button"
              accessibilityLabel="Ta bort runda"
            >
              <Ionicons
                name="close"
                size={16}
                color={isDeleting ? "#AAA" : "#B00020"}
              />
            </Pressable>
          </View>
        </FormCard>
      </FadeInSlide>
    );
  };

  if (loading) {
    return (
      <ScreenGradient>
        <SafeAreaView style={{ flex: 1 }}>
          <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
            <ActivityIndicator color={GREEN_PRIMARY} />
            <Text style={{ marginTop: 8, color: GREEN_TEXT_DARK }}>Laddar rundor…</Text>
          </View>
        </SafeAreaView>
      </ScreenGradient>
    );
  }

  if (!rounds.length) {
    return (
      <ScreenGradient>
        <SafeAreaView style={{ flex: 1 }}>
          <View style={{ paddingHorizontal: 20, paddingTop: 24 }}>
            <FadeInSlide delay={0} fromY={-10}>
              <LogoHeader title="Previous rounds" />
            </FadeInSlide>
          </View>

          <View style={{ flex: 1, alignItems: "center", justifyContent: "center", padding: 24, gap: 12 }}>
            <Text style={{ fontSize: 18, fontWeight: "700", color: GREEN_TEXT_DARK }}>
              Inga sparade rundor ännu
            </Text>
            <Text style={{ color: "#666", textAlign: "center" }}>
              Starta en runda från hemskärmen och spara den här.
            </Text>

            <PrimaryButton
              title="Start a round"
              variant="primary"
              onPress={() => navigation.navigate("StartRound")}
              icon={<Ionicons name="golf" size={20} color={GREEN_TEXT_DARK} />}
              styleOverride={{ marginTop: 8 }}
            />
          </View>
        </SafeAreaView>
      </ScreenGradient>
    );
  }

  return (
    <ScreenGradient>
      <SafeAreaView style={{ flex: 1 }}>
        <View style={{ paddingHorizontal: 20, paddingTop: 24, marginBottom: 8 }}>
          <FadeInSlide delay={0} fromY={-10}>
            <LogoHeader title="Previous rounds" />
          </FadeInSlide>
        </View>

        <FlatList
          data={rounds}
          keyExtractor={(item) => String(item.id)}
          renderItem={renderItem}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={[GREEN_PRIMARY]}
              tintColor={GREEN_PRIMARY}
            />
          }
          contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 24 }}
          ItemSeparatorComponent={() => <View style={{ height: 10 }} />}
        />
      </SafeAreaView>
    </ScreenGradient>
  );
}
