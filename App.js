// App.js
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

// Context
import { RoundProvider } from "./context/RoundContext";

// Skärmar
import HomeScreen from "./screens/HomeScreen";
import PreviousRoundsScreen from "./screens/PreviousRoundsScreen";
import RoundScreen from "./screens/RoundScreen";
import RoundSummaryScreen from "./screens/RoundSummaryScreen";
import StartRoundScreen from "./screens/StartRoundScreen";

const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <RoundProvider>
      <NavigationContainer>
        <Stack.Navigator
          screenOptions={{ headerShown: false }}
          initialRouteName="Home" // <-- behåll Home som startsida
        >
          <Stack.Screen name="Home" component={HomeScreen} />
          <Stack.Screen name="StartRound" component={StartRoundScreen} />
          <Stack.Screen name="PreviousRounds" component={PreviousRoundsScreen} />
          <Stack.Screen
            name="Round"
            component={RoundScreen}
            options={{ title: "Pågående runda" }}
          />
          <Stack.Screen
            name="RoundSummary"
            component={RoundSummaryScreen}
            options={{ title: "Rundsummering" }}
          />
        </Stack.Navigator>
      </NavigationContainer>
    </RoundProvider>
  );
}
