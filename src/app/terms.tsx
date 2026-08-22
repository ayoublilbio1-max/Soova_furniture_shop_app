import { ThemeColors } from "@/constants/colors";
import { Fonts } from "@/constants/fonts";
import { useThemeColors } from "@/hooks/use-theme-colors";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";

export default function Terms() {
  const colors = useThemeColors();
  const styles = getStyles(colors);

  return (
    <View style={styles.container}>
      <Pressable style={styles.backButton} onPress={() => router.back()}>
        <Ionicons name="arrow-back" size={24} color={colors.textPrimary} />
      </Pressable>

      <Text style={styles.heading}>Terms & Conditions</Text>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text style={styles.paragraph}>
          This is a placeholder Terms & Conditions screen for the Soova
          portfolio demo. In a production version of this app, this space would
          contain the actual legal terms governing use of the service, account
          creation, purchases, and user data.
        </Text>
        <Text style={styles.paragraph}>
          Since Soova is a demonstration project, no real account data,
          payments, or personal information are collected or processed.
        </Text>
      </ScrollView>
    </View>
  );
}

function getStyles(colors: ThemeColors) {
  return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
      paddingHorizontal: 24,
      paddingTop: 60,
    },
    backButton: {
      width: 40,
      height: 40,
      justifyContent: "center",
      marginBottom: 12,
    },
    heading: {
      fontFamily: Fonts.bold,
      fontSize: 26,
      color: colors.textPrimary,
      marginBottom: 20,
    },
    scrollContent: {
      paddingBottom: 40,
    },
    paragraph: {
      fontFamily: Fonts.regular,
      fontSize: 15,
      lineHeight: 24,
      color: colors.textMuted,
      marginBottom: 16,
    },
  });
}
