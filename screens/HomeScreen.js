import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import {
  Dimensions,
  FlatList,
  Image,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import FadeInSlide from "../components/FadeInSlide";
import PrimaryButton from "../components/PrimaryButton";
import RoundCard from "../components/RoundCard";
import ScreenGradient from "../components/ScreenGradient";
import { GREEN_TEXT_DARK } from "../theme/colors";

export default function HomeScreen() {
  const navigation = useNavigation();
  const recentRounds = [
    { id: "1", course: "Ullna GC", date: "2025-09-28" },
    { id: "2", course: "Visby GK", date: "2025-09-21" },
    { id: "3", course: "Oskarshamns GK", date: "2025-09-18" },
  ];

  const screenWidth = Dimensions.get("window").width;

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

        {/* NEDRE SEKTION */}
        <FadeInSlide delay={240} fromY={10} style={{ marginBottom: 70 }}>
          <FlatList
            data={recentRounds}
            keyExtractor={(item) => item.id}
            scrollEnabled={false}
            ItemSeparatorComponent={() => <View style={{ height: 10 }} />}
            renderItem={({ item }) => (
              <RoundCard course={item.course} date={item.date} />
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
