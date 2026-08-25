import { ThemeColors } from "@/constants/colors";
import { Fonts } from "@/constants/fonts";
import { useThemeColors } from "@/hooks/use-theme-colors";
import { StyleSheet, Text, View } from "react-native";

export default function Cart() {
  const colors = useThemeColors();
  const styles = getStyles(colors);

  return (
    <View style={styles.container}>
      <Text style={styles.text}>Cart — coming soon</Text>
    </View>
  );
}

function getStyles(colors: ThemeColors) {
  return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
      alignItems: "center",
      justifyContent: "center",
    },
    text: {
      fontFamily: Fonts.medium,
      fontSize: 16,
      color: colors.textPrimary,
    },
  });
}
