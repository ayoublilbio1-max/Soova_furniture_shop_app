import { ThemeColors } from "@/constants/colors";
import { Fonts } from "@/constants/fonts";
import { useThemeColors } from "@/hooks/use-theme-colors";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useState } from "react";
import {
    Modal,
    Pressable,
    StyleSheet,
    Text,
    TextInput,
    View,
} from "react-native";

const DEMO_EMAIL = "demo@gmail.com";

function generateCode() {
  return Math.floor(1000 + Math.random() * 9000).toString();
}

export default function PasswordReset() {
  const colors = useThemeColors();
  const styles = getStyles(colors);

  const [email, setEmail] = useState(DEMO_EMAIL);
  const [demoModalVisible, setDemoModalVisible] = useState(false);

  function handleSendCode() {
    if (email !== DEMO_EMAIL) {
      setDemoModalVisible(true);
      return;
    }

    router.push({
      pathname: "/verify-code",
      params: { email, code: generateCode() },
    });
  }

  return (
    <View style={styles.container}>
      <View style={[styles.circleOutline, styles.circleTopLeft]} />
      <View style={[styles.circleOutline, styles.circleBottomRight]} />

      <Pressable style={styles.backButton} onPress={() => router.back()}>
        <Ionicons name="arrow-back" size={22} color={colors.accent} />
      </Pressable>

      <Text style={styles.heading}>Forgot Password?</Text>
      <Text style={styles.subheading}>
        No worries! Enter your email address and{"\n"}we&apos;ll send you a code
        to reset your password.
      </Text>

      <Text style={styles.label}>Email Address</Text>
      <View style={styles.inputWrapper}>
        <Ionicons
          name="mail-outline"
          size={20}
          color={colors.textMuted}
          style={styles.inputIcon}
        />
        <TextInput
          style={styles.input}
          placeholder="Enter your email"
          placeholderTextColor={colors.textMuted}
          keyboardType="email-address"
          autoCapitalize="none"
          value={email}
          onChangeText={setEmail}
        />
      </View>

      <Pressable style={styles.cta} onPress={handleSendCode}>
        <Text style={styles.ctaText}>Send Reset Code</Text>
      </Pressable>

      <Text style={styles.signInRow}>
        Remember your password?{" "}
        <Text style={styles.signInLink} onPress={() => router.push("/sign-in")}>
          Sign In
        </Text>
      </Text>

      <Modal
        transparent
        visible={demoModalVisible}
        animationType="fade"
        onRequestClose={() => setDemoModalVisible(false)}
      >
        <View style={styles.modalBackdrop}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>This Is a Demo</Text>
            <Text style={styles.modalBody}>
              Only the demo account (demo@gmail.com) can go through this
              simulated reset flow.
            </Text>
            <Pressable
              style={styles.modalPrimaryButton}
              onPress={() => {
                setEmail(DEMO_EMAIL);
                setDemoModalVisible(false);
              }}
            >
              <Text style={styles.modalPrimaryButtonText}>Use Demo Email</Text>
            </Pressable>
            <Pressable
              style={styles.modalSecondaryButton}
              onPress={() => setDemoModalVisible(false)}
            >
              <Text style={styles.modalSecondaryButtonText}>Maybe Later</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
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
    circleOutline: {
      position: "absolute",
      borderWidth: 1,
      borderColor: colors.outline,
      borderRadius: 999,
    },
    circleTopLeft: {
      width: 200,
      height: 200,
      top: -70,
      left: -90,
    },
    circleBottomRight: {
      width: 200,
      height: 200,
      bottom: -90,
      right: -90,
    },
    backButton: {
      width: 44,
      height: 44,
      borderRadius: 22,
      borderWidth: 1,
      borderColor: colors.outline,
      alignItems: "center",
      justifyContent: "center",
      marginBottom: 24,
    },
    heading: {
      fontFamily: Fonts.bold,
      fontSize: 28,
      color: colors.textPrimary,
    },
    subheading: {
      fontFamily: Fonts.regular,
      fontSize: 14,
      lineHeight: 21,
      color: colors.textMuted,
      marginTop: 10,
      marginBottom: 32,
    },
    label: {
      fontFamily: Fonts.semiBold,
      fontSize: 14,
      color: colors.textPrimary,
      marginBottom: 8,
    },
    inputWrapper: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: colors.placeholder,
      borderRadius: 16,
      paddingHorizontal: 16,
      height: 56,
      marginBottom: 28,
    },
    inputIcon: {
      marginRight: 10,
    },
    input: {
      flex: 1,
      fontFamily: Fonts.regular,
      fontSize: 15,
      color: colors.textPrimary,
    },
    cta: {
      width: "100%",
      backgroundColor: colors.accent,
      borderRadius: 32,
      paddingVertical: 18,
      alignItems: "center",
      marginBottom: 20,
    },
    ctaText: {
      fontFamily: Fonts.semiBold,
      fontSize: 16,
      color: colors.onAccent,
    },
    signInRow: {
      fontFamily: Fonts.regular,
      fontSize: 14,
      textAlign: "center",
      color: colors.textPrimary,
    },
    signInLink: {
      fontFamily: Fonts.semiBold,
      color: colors.accent,
      textDecorationLine: "underline",
    },
    modalBackdrop: {
      flex: 1,
      backgroundColor: "rgba(0, 0, 0, 0.5)",
      justifyContent: "center",
      alignItems: "center",
      paddingHorizontal: 24,
    },
    modalCard: {
      width: "100%",
      backgroundColor: colors.background,
      borderRadius: 24,
      padding: 24,
    },
    modalTitle: {
      fontFamily: Fonts.bold,
      fontSize: 20,
      color: colors.textPrimary,
      marginBottom: 12,
    },
    modalBody: {
      fontFamily: Fonts.regular,
      fontSize: 14,
      lineHeight: 21,
      color: colors.textMuted,
      marginBottom: 12,
    },
    modalPrimaryButton: {
      backgroundColor: colors.accent,
      borderRadius: 28,
      paddingVertical: 16,
      alignItems: "center",
      marginTop: 12,
    },
    modalPrimaryButtonText: {
      fontFamily: Fonts.semiBold,
      fontSize: 15,
      color: colors.onAccent,
    },
    modalSecondaryButton: {
      alignItems: "center",
      marginTop: 12,
    },
    modalSecondaryButtonText: {
      fontFamily: Fonts.medium,
      fontSize: 14,
      color: colors.textMuted,
    },
  });
}
