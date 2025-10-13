import { Dimensions, Image, StyleSheet, Text, View } from "react-native";

export default function LogoHeader({ title, titleStyle, style }) {
  const screenWidth = Dimensions.get("window").width;
  return (
    <View style={[styles.wrap, style]}>
      <Image
        source={require("../assets/logo.png")}
        style={[styles.logo, { width: screenWidth * 0.8 }]}
      />
      {title ? <Text style={[styles.title, titleStyle]}>{title}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { alignItems: "center" },
  logo: { height: 90, resizeMode: "contain", alignSelf: "center", marginBottom: 6 },
  title: { textAlign: "center", fontSize: 22, fontWeight: "700", color: "#ffffffee" },
});
