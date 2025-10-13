import { Ionicons } from "@expo/vector-icons";
import { useMemo, useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";

import FadeInSlide from "../components/FadeInSlide";
import FormCard from "../components/FormCard";
import LabeledSwitch from "../components/LabeledSwitch";
import LogoHeader from "../components/LogoHeader";
import PrimaryButton from "../components/PrimaryButton";
import ScreenGradient from "../components/ScreenGradient";
import TogglePill from "../components/TogglePill";
import { GREEN_PRIMARY, GREEN_TEXT_DARK } from "../theme/colors";

import { useRound } from "../context/RoundContext";

export default function StartRoundScreen({ navigation }) {
  const insets = useSafeAreaInsets();

  const [course, setCourse] = useState("");
  const [holes, setHoles] = useState(18); // ✅ förvalt: 18 hål
  const [withStats, setWithStats] = useState(true);

  const { startRound } = useRound();

  const canStart = useMemo(
    () => course.trim().length > 0 && !!holes,
    [course, holes]
  );

  const handleStart = () => {
    if (!canStart) return;

    // Initiera rundan i contextet
    startRound(holes, {
      course,
      mode: withStats ? "stats" : "simple",
      startedAt: new Date().toISOString(),
    });

    // Navigera till RoundScreen
    navigation.navigate("Round", {
      holesCount: holes,
    });
  };

  return (
    <ScreenGradient>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={{ flex: 1 }}
      >
        <SafeAreaView style={{ flex: 1 }}>
          <ScrollView
            contentContainerStyle={[
              styles.container,
              { paddingBottom: insets.bottom + 16 },
            ]}
            keyboardShouldPersistTaps="handled"
          >
            {/* Logga + Titel */}
            <FadeInSlide delay={0} fromY={-10}>
              <LogoHeader title="Start a new round" />
            </FadeInSlide>

            {/* Form */}
            <View style={styles.form}>
              {/* Course */}
              <FadeInSlide delay={100} fromY={6}>
                <FormCard>
                  <Text style={styles.label}>Course</Text>
                  <TextInput
                    placeholder="Enter the course name (e.g. Ullna GC)"
                    placeholderTextColor="#1b433299"
                    value={course}
                    onChangeText={setCourse}
                    style={styles.input}
                    returnKeyType="done"
                  />
                </FormCard>
              </FadeInSlide>

              {/* Holes */}
              <FadeInSlide delay={170} fromY={6}>
                <FormCard>
                  <Text style={styles.label}>Number of holes</Text>
                  <View style={styles.holeRow}>
                    <TogglePill
                      label="9 holes"
                      active={holes === 9}
                      onPress={() => setHoles(9)}
                    />
                    <TogglePill
                      label="18 holes"
                      active={holes === 18}
                      onPress={() => setHoles(18)}
                    />
                  </View>
                </FormCard>
              </FadeInSlide>

              {/* Stats switch */}
              <FadeInSlide delay={240} fromY={6}>
                <LabeledSwitch
                  label="Add statistics"
                  help="Save fairways hits, greens hits, putts, etc. during the round."
                  value={withStats}
                  onValueChange={setWithStats}
                />
              </FadeInSlide>
            </View>

            {/* CTA */}
            <FadeInSlide delay={300} fromY={8} style={{ width: "100%" }}>
              <PrimaryButton
                title="Start a round"
                onPress={handleStart}
                icon={
                  <Ionicons
                    name="arrow-forward"
                    size={22}
                    color={GREEN_TEXT_DARK}
                  />
                }
                variant="primary"
                styleOverride={!canStart ? styles.disabledBtn : undefined}
              />
              {!canStart && (
                <Text style={styles.validationText}>
                  Enter the course to continue.
                </Text>
              )}
            </FadeInSlide>
          </ScrollView>
        </SafeAreaView>
      </KeyboardAvoidingView>
    </ScreenGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    paddingHorizontal: 20,
    paddingTop: 40,
    gap: 20,
  },
  form: { gap: 16 },
  label: { color: GREEN_TEXT_DARK, fontWeight: "700", fontSize: 14 },
  input: {
    backgroundColor: "#ffffff",
    borderRadius: 10,
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: GREEN_PRIMARY,
    color: GREEN_TEXT_DARK,
    fontSize: 16,
  },
  holeRow: { flexDirection: "row", gap: 10 },
  disabledBtn: { opacity: 0.6 },
  validationText: {
    marginTop: 8,
    textAlign: "center",
    color: "#ffffffcc",
    fontSize: 13,
  },
});
