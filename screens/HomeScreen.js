import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { useCallback, useEffect, useState } from "react";
import {
  Dimensions,
  FlatList,
  Image,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import FadeInSlide from "../components/FadeInSlide";
import PrimaryButton from "../components/PrimaryButton";
import RoundCard from "../components/RoundCard";
import ScreenGradient from "../components/ScreenGradient";
import { getRounds } from "../db/rounds";
import { GREEN_TEXT_DARK } from "../theme/colors";

export default function HomeScreen() {
  const navigation = useNavigation();
  const screenWidth = Dimensions.get("window").width;

  const [recentRounds, setRecentRounds] = useState([]);

  const load = useCallback(async () => {
    try {
      // getRounds returnerar ORDER BY date DESC – ta topp 3
      const rows = await getRounds();
      const top3 = (rows || []).slice(0, 3);
      setRecentRounds(top3);
    } catch (e) {
      console.warn("Failed to load recent rounds:", e);
      setRecentRounds([]);
    }
  }, []);

  useEffect(() => {
    // Ladda initialt + när man kommer tillbaka till hem
    const unsub = navigation.addListener("focus", load);
    load();
    return unsub;
  }, [navigation, load]);

  return (
    <ScreenGradient>
      <SafeAreaView style={styles.container}>
        {/* TOPP: Logga + startknapp */}
        <View style={styles.topSection}>
          <FadeInSlide delay={0} fromY={-12} style={{ alignItems: "center" }}>
            <Image
              source={require("../assets/logo.png")}
              style={[styles.logoImage, { width: screenWidth * 0.8 }]}
            />
          </FadeInSlide>

          <FadeInSlide delay={120} fromY={8} style={{ width: "100%" }}>
            <PrimaryButton
              title="Start a new round"
              onPress={() => navigation.navigate("StartRound")}
              icon={<Ionicons name="arrow-forward" size={26} color={GREEN_TEXT_DARK} />}
              variant="primary"
            />
          </FadeInSlide>
        </View>

        {/* NEDRE SEKTION – senaste rundor (max 3) */}
        <FadeInSlide delay={240} fromY={10} style={{ marginBottom: 70 }}>
          <FlatList
            data={recentRounds}
            keyExtractor={(item) => String(item.id)}
            scrollEnabled={false}
            ItemSeparatorComponent={() => <View style={{ height: 10 }} />}
            renderItem={({ item }) => (
              <Pressable
                onPress={() => navigation.navigate("RoundSummary", { id: item.id })}
              >
                <RoundCard course={item.course || "—"} date={item.date} />
              </Pressable>
            )}
            ListFooterComponent={<View style={{ height: 14 }} />}
            ListEmptyComponent={
              <Text style={styles.emptyText}>Inga rundor ännu.</Text>
            }
          />

          <View style={{ marginTop: 10, width: "100%" }}>
            <PrimaryButton
              title="Show previous rounds"
              onPress={() => navigation.navigate("PreviousRounds")}
              variant="primary"
            />
          </View>
        </FadeInSlide>
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
  topSection: {
    alignItems: "center",
    paddingTop: 140,
    gap: 28,
  },
  logoImage: {
    height: 120,
    resizeMode: "contain",
    alignSelf: "center",
  },
  emptyText: {
    textAlign: "center",
    color: "#ffffffcc",
    marginVertical: 8,
  },
});
