import { ThemeColors } from "@/constants/colors";
import { Fonts } from "@/constants/fonts";
import { useThemeColors } from "@/hooks/use-theme-colors";
import { router } from "expo-router";
import { Image, Pressable, StyleSheet, Text, View } from "react-native";

export default function Welcome() {
  const colors = useThemeColors();
  const styles = getStyles(colors);

  return (
    <View style={styles.container}>
      <View style={[styles.circleOutline, styles.circleTopLeft]} />
      <View style={[styles.circleOutline, styles.circleRight]} />

      <View style={styles.heroWrapper}>
        <View style={styles.heroFrame}>
          <Image
            source={require("../../assets/images/hero_middle_img.png")}
            style={styles.heroImage}
            resizeMode="cover"
          />
        </View>

        <View style={[styles.circlePhoto, styles.circlePhotoTopRight]}>
          <Image
            source={require("../../assets/images/hero_top_right_img.jpg")}
            style={styles.circlePhotoImage}
            resizeMode="cover"
          />
        </View>

        <View style={[styles.circlePhotoBottom, styles.circlePhotoBottomLeft]}>
          <Image
            source={require("../../assets/images/hero_bottom_left_img.jpg")}
            style={styles.circlePhotoImage}
            resizeMode="cover"
          />
        </View>
      </View>

      <Text style={styles.heading}>
        The <Text style={styles.headingAccent}>Furniture</Text> App That
        Elevates Your Home
      </Text>

      <Text style={styles.subheading}>
        Beautiful designs. Premium comfort.{"\n"}Made for the way you live.
      </Text>

      <Pressable style={styles.cta} onPress={() => router.push("/sign-up")}>
        <Text style={styles.ctaText}>Let&apos;s Get Started</Text>
      </Pressable>

      <Text style={styles.signInRow}>
        Already have an account?{" "}
        <Text style={styles.signInLink} onPress={() => router.push("/sign-in")}>
          Sign In
        </Text>
      </Text>
    </View>
  );
}

function getStyles(colors: ThemeColors) {
  return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
      alignItems: "center",
      paddingTop: 70,
      paddingHorizontal: 24,
    },
    circleOutline: {
      position: "absolute",
      borderWidth: 1,
      borderColor: colors.outline,
      borderRadius: 999,
    },
    circleTopLeft: {
      width: 180,
      height: 180,
      top: -60,
      left: -80,
    },
    circleRight: {
      width: 220,
      height: 220,
      top: 520,
      right: -100,
    },
    heroWrapper: {
      width: "100%",
      height: 420,
      alignItems: "center",
      justifyContent: "center",
    },
    heroFrame: {
      width: 300,
      height: 400,
    },
    heroImage: {
      width: "100%",
      height: "100%",
    },
    circlePhoto: {
      position: "absolute",
      width: 90,
      height: 90,
      borderRadius: 45,
      overflow: "hidden",
      borderWidth: 3,
      borderColor: colors.background,
    },
    circlePhotoBottom: {
      position: "absolute",
      width: 110,
      height: 110,
      borderRadius: 70,
      overflow: "hidden",
      borderWidth: 3,
      borderColor: colors.background,
    },
    circlePhotoTopRight: {
      top: -6,
      right: -8,
    },
    circlePhotoBottomLeft: {
      bottom: -6,
      left: -10,
    },
    circlePhotoImage: {
      width: "100%",
      height: "100%",
    },
    heading: {
      fontFamily: Fonts.bold,
      fontSize: 30,
      lineHeight: 36,
      textAlign: "center",
      color: colors.textPrimary,
      marginTop: 30,
    },
    headingAccent: {
      color: colors.accent,
    },
    subheading: {
      fontFamily: Fonts.regular,
      fontSize: 15,
      lineHeight: 22,
      textAlign: "center",
      color: colors.textMuted,
      marginTop: 16,
    },
    cta: {
      width: "100%",
      backgroundColor: colors.accent,
      borderRadius: 32,
      paddingVertical: 18,
      alignItems: "center",
      marginTop: 32,
    },
    ctaText: {
      fontFamily: Fonts.semiBold,
      fontSize: 16,
      color: colors.onAccent,
    },
    signInRow: {
      fontFamily: Fonts.regular,
      fontSize: 14,
      color: colors.textPrimary,
      marginTop: 20,
    },
    signInLink: {
      fontFamily: Fonts.semiBold,
      color: colors.accent,
      textDecorationLine: "underline",
    },
  });
}
