// screens/StartRoundScreen.js
import { Ionicons } from "@expo/vector-icons";
import * as Location from "expo-location";
import { useMemo, useRef, useState } from "react";
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, TextInput, View, } from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import FadeInSlide from "../components/FadeInSlide";
import FormCard from "../components/FormCard";
import LabeledSwitch from "../components/LabeledSwitch";
import Logo from "../components/Logo";
import PrimaryButton from "../components/PrimaryButton";
import ScreenGradient from "../components/ScreenGradient";
import TogglePill from "../components/TogglePill";
import { useRound } from "../context/RoundContext";
import { fetchCurrentWeather } from "../services/weather";
import { GREEN_PRIMARY, GREEN_TEXT_DARK } from "../theme/colors";

export default function StartRoundScreen({ navigation }) {
  const insets = useSafeAreaInsets();
  const [course, setCourse] = useState("");
  const [holes, setHoles] = useState(18);
  const [withStats, setWithStats] = useState(true);
  const [includeWeather, setIncludeWeather] = useState(true);
  const [touchedCourse, setTouchedCourse] = useState(false);
  const [attemptedStart, setAttemptedStart] = useState(false);
  const scrollRef = useRef(null);
  const courseInputRef = useRef(null);
  const { startRound } = useRound();
  const courseEmpty = course.trim().length === 0;
  const showCourseError = (touchedCourse || attemptedStart) && courseEmpty;
  const canStart = useMemo(() => !courseEmpty && !!holes, [courseEmpty, holes]);
  const handleStart = async () => {
    if (!canStart) {
      setAttemptedStart(true);
      setTouchedCourse(true);
      try {
        scrollRef.current?.scrollTo({ y: 0, animated: true });
        courseInputRef.current?.focus();
      } catch {}
      return;
    }

    let weather = null;
    if (includeWeather) {
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status === "granted") {
          const pos = await Location.getCurrentPositionAsync({
            accuracy: Location.Accuracy.Balanced,
          });
          const lat = pos.coords.latitude;
          const lon = pos.coords.longitude;
          const w = await fetchCurrentWeather(lat, lon);
          weather = { ...w, lat, lon };
        } else {
          console.warn("Location permission denied; continuing without weather.");
        }
      } catch (e) {
        console.warn("Weather fetch failed; continuing without weather.", e);
      }
    }

    startRound(holes, {
      course,
      mode: withStats ? "stats" : "simple",
      startedAt: new Date().toISOString(),
      weather,
    });

    navigation.navigate("Round", { holesCount: holes });
  };

  return (
    <ScreenGradient>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={{ flex: 1 }}
      >
        {/* Ingen top-edge → inget extra top-inset */}
        <SafeAreaView style={{ flex: 1 }} edges={[]}>
          <ScrollView
            ref={scrollRef}
            contentContainerStyle={[
              styles.container,
              { paddingBottom: insets.bottom + 16 },
            ]}
            keyboardShouldPersistTaps="handled"
            contentInsetAdjustmentBehavior="never"
          >
            {/* Logga + Titel */}
            <FadeInSlide delay={0} fromY={-10}>
              <Logo height={160} maxWidthPct={0.44} style={{ marginTop: 40, marginBottom: 6 }} />
              <Text style={styles.screenTitle}>Start a new round</Text>
            </FadeInSlide>

            {/* Form */}
            <View style={styles.form}>
              {/* Course */}
              <FadeInSlide delay={100} fromY={6}>
                <FormCard>
                  <Text style={styles.label}>Course</Text>
                  <TextInput
                    ref={courseInputRef}
                    placeholder="Enter the course name (e.g. Ullna GC)"
                    placeholderTextColor="#1b433299"
                    value={course}
                    onChangeText={(t) => {
                      setCourse(t);
                      if (!touchedCourse) setTouchedCourse(true);
                    }}
                    onBlur={() => setTouchedCourse(true)}
                    style={[
                      styles.input,
                      showCourseError && { borderColor: "#B00020" },
                    ]}
                    returnKeyType="done"
                  />
                  {showCourseError && (
                    <Text style={styles.errorText}>
                      Please enter a course name to start the round.
                    </Text>
                  )}
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

              {/* Weather switch */}
              <FadeInSlide delay={280} fromY={6}>
                <LabeledSwitch
                  label="Include weather in summary"
                  help="Use your location to fetch current conditions at round start."
                  value={includeWeather}
                  onValueChange={setIncludeWeather}
                />
              </FadeInSlide>
            </View>

            {/* CTA */}
            <FadeInSlide delay={340} fromY={8} style={{ width: "100%" }}>
              <PrimaryButton
                title="Start a round"
                onPress={handleStart}
                icon={<Ionicons name="arrow-forward" size={22} color={GREEN_TEXT_DARK} />}
                variant="primary"
                style={!canStart ? styles.disabledBtn : undefined}
                accessibilityLabel={
                  canStart
                    ? "Start a round"
                    : "Cannot start. Please enter the course name first."
                }
              />
              {!canStart && (
                <Text style={styles.validationText}>
                  Enter the course name to continue.
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
    paddingTop: 0,    // tryck upp allt
    gap: 16,
  },
  screenTitle: {
    color: GREEN_TEXT_DARK,
    fontWeight: "800",
    fontSize: 22,
    marginTop: 0,
    marginBottom: 2,
    textAlign: "center",
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
  errorText: {
    marginTop: 6,
    color: "#B00020",
    fontSize: 12,
    fontWeight: "600",
  },
});
