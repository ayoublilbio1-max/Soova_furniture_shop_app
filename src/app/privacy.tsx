// Privacy Policy screen — reached from Account > "Privacy Policy". Honest,
// static description of what this specific demo app actually stores and
// doesn't, rather than generic boilerplate — matching the app's overall
// pattern of being upfront about its demo limitations.

import { ThemeColors } from "@/constants/colors";
import { Fonts } from "@/constants/fonts";
import { useThemeColors } from "@/hooks/use-theme-colors";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";

function PolicySection({
  title,
  body,
  styles,
}: {
  title: string;
  body: string;
  styles: ReturnType<typeof getStyles>;
}) {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      <Text style={styles.sectionBody}>{body}</Text>
    </View>
  );
}

export default function Privacy() {
  const colors = useThemeColors();
  const styles = getStyles(colors);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Pressable style={styles.backButton} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={22} color={colors.textPrimary} />
        </Pressable>
        <Text style={styles.headerTitle}>Privacy Policy</Text>
        <View style={styles.backButton} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text style={styles.intro}>
          Soova is a portfolio demonstration project, not a commercial product.
          This policy describes what the app actually does with your data, in
          plain terms.
        </Text>

        <PolicySection
          styles={styles}
          title="What's Stored, and Where"
          body="Your profile, cart, order history, saved addresses, and payment method details (last four digits only) are stored locally on your device. None of it is sent to a server Soova controls, because there isn't one — this app has no backend."
        />

        <PolicySection
          styles={styles}
          title="Card Information"
          body="Soova never stores a full card number or CVV, on this device or anywhere else. Only the last four digits, cardholder name, and expiry are kept, matching how real payment processors handle card data."
        />

        <PolicySection
          styles={styles}
          title="Third-Party Services"
          body="Product photos are served from Supabase Storage and Cloudflare R2. Neither service receives any of your personal information — they only host the images the app displays."
        />

        <PolicySection
          styles={styles}
          title="Account Sign-In"
          body="Sign-in is simulated for demo purposes and only accepts a fixed demo credential. No real authentication provider is involved, and no account data leaves your device."
        />

        <PolicySection
          styles={styles}
          title="Your Control Over This Data"
          body="Account > Settings lets you reset all demo data (cart, orders, saved cards) at any time, or delete your profile entirely and sign out. Both actions happen instantly on-device."
        />

        <PolicySection
          styles={styles}
          title="Data Sharing"
          body="Soova does not sell, share, or transmit any of your data to advertisers or third parties, because it has no mechanism to do so in the first place."
        />
      </ScrollView>
    </View>
  );
}

function getStyles(colors: ThemeColors) {
  return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
      paddingTop: 60,
    },
    header: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      paddingHorizontal: 24,
      marginBottom: 20,
    },
    backButton: {
      width: 40,
      height: 40,
      alignItems: "center",
      justifyContent: "center",
    },
    headerTitle: {
      fontFamily: Fonts.bold,
      fontSize: 18,
      color: colors.textPrimary,
    },
    scrollContent: {
      paddingHorizontal: 24,
      paddingBottom: 50,
    },
    intro: {
      fontFamily: Fonts.regular,
      fontSize: 13,
      lineHeight: 20,
      color: colors.textMuted,
      marginBottom: 24,
    },
    section: {
      marginBottom: 22,
    },
    sectionTitle: {
      fontFamily: Fonts.semiBold,
      fontSize: 15,
      color: colors.textPrimary,
      marginBottom: 6,
    },
    sectionBody: {
      fontFamily: Fonts.regular,
      fontSize: 13,
      lineHeight: 20,
      color: colors.textMuted,
    },
  });
}
