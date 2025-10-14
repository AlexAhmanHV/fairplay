// components/RecentRoundsList.js
import PropTypes from "prop-types";
import { FlatList, Pressable, Text, View } from "react-native";
import FadeInSlide from "./FadeInSlide";
import LogoHeader from "./LogoHeader";
import PrimaryButton from "./PrimaryButton";
import RoundCard from "./RoundCard";

export default function RecentRoundsList({
  rounds = [],
  onOpenRound,
  onShowAll,
  showCompactHeader = false,
}) {
  return (
    <FadeInSlide delay={240} fromY={10} style={{ marginBottom: 70, width: "100%" }}>
      {showCompactHeader && (
        <LogoHeader
          variant="compact"
          showButton={false}
          style={{ marginBottom: 12 }}
        />
      )}

      <FlatList
        data={rounds}
        keyExtractor={(item) => String(item.id)}
        scrollEnabled={false}
        ItemSeparatorComponent={() => <View style={{ height: 10 }} />}
        renderItem={({ item }) => (
          <Pressable onPress={() => onOpenRound(item.id)}>
            <RoundCard course={item.course || "—"} date={item.date} />
          </Pressable>
        )}
        ListFooterComponent={<View style={{ height: 14 }} />}
        ListEmptyComponent={
          <Text style={{ textAlign: "center", color: "#ffffffcc", marginVertical: 8 }}>
            Inga rundor ännu.
          </Text>
        }
      />

      <View style={{ marginTop: 10, width: "100%" }}>
        <PrimaryButton title="Show previous rounds" onPress={onShowAll} variant="primary" />
      </View>
    </FadeInSlide>
  );
}

RecentRoundsList.propTypes = {
  rounds: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.oneOfType([PropTypes.number, PropTypes.string]).isRequired,
      course: PropTypes.string,
      date: PropTypes.string.isRequired,
    })
  ),
  onOpenRound: PropTypes.func.isRequired,
  onShowAll: PropTypes.func.isRequired,
  showCompactHeader: PropTypes.bool,
};
