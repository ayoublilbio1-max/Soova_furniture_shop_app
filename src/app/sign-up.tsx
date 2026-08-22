import { GoogleIcon } from "@/components/ui/google-icon";
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

const DEMO_NAME = "John Doe";
const DEMO_EMAIL = "demo@gmail.com";
const DEMO_PASSWORD = "Demo1234@";

export default function SignUp() {
  const colors = useThemeColors();
  const styles = getStyles(colors);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [agreed, setAgreed] = useState(true);
  const [demoModalVisible, setDemoModalVisible] = useState(false);

  function openDemoModal() {
    setDemoModalVisible(true);
  }

  function useDemoAccount() {
    setName(DEMO_NAME);
    setEmail(DEMO_EMAIL);
    setPassword(DEMO_PASSWORD);
    setDemoModalVisible(false);
  }

  function handleSignUp() {
    if (email === DEMO_EMAIL && password === DEMO_PASSWORD && agreed) {
      router.push({
        pathname: "/complete-profile",
        params: { source: "signup", name: name || DEMO_NAME },
      });
    } else {
      openDemoModal();
    }
  }

  return (
    <View style={styles.container}>
      <View style={[styles.circleOutline, styles.circleTopLeft]} />
      <View style={[styles.circleOutline, styles.circleBottomRight]} />

      <Text style={styles.heading}>Create Account</Text>
      <Text style={styles.subheading}>
        Fill your information below or register{"\n"}with your social account.
      </Text>

      <Text style={styles.label}>Name</Text>
      <View style={styles.inputWrapper}>
        <Ionicons
          name="person-outline"
          size={20}
          color={colors.textMuted}
          style={styles.inputIcon}
        />
        <TextInput
          style={styles.input}
          placeholder="John Doe"
          placeholderTextColor={colors.textMuted}
          value={name}
          onChangeText={setName}
        />
      </View>

      <Text style={styles.label}>Email</Text>
      <View style={styles.inputWrapper}>
        <Ionicons
          name="mail-outline"
          size={20}
          color={colors.textMuted}
          style={styles.inputIcon}
        />
        <TextInput
          style={styles.input}
          placeholder="demo@gmail.com"
          placeholderTextColor={colors.textMuted}
          keyboardType="email-address"
          autoCapitalize="none"
          value={email}
          onChangeText={setEmail}
        />
      </View>

      <Text style={styles.label}>Password</Text>
      <View style={styles.inputWrapper}>
        <Ionicons
          name="lock-closed-outline"
          size={20}
          color={colors.textMuted}
          style={styles.inputIcon}
        />
        <TextInput
          style={styles.input}
          placeholder="••••••••••••"
          placeholderTextColor={colors.textMuted}
          secureTextEntry={!showPassword}
          value={password}
          onChangeText={setPassword}
        />
        <Pressable onPress={() => setShowPassword((prev) => !prev)}>
          <Ionicons
            name={showPassword ? "eye-outline" : "eye-off-outline"}
            size={20}
            color={colors.textMuted}
          />
        </Pressable>
      </View>

      <View style={styles.termsRow}>
        <Pressable
          style={styles.checkbox}
          onPress={() => setAgreed((prev) => !prev)}
        >
          <View
            style={[
              styles.checkboxInner,
              agreed && { backgroundColor: colors.accent },
            ]}
          >
            {agreed && (
              <Ionicons name="checkmark" size={16} color={colors.onAccent} />
            )}
          </View>
        </Pressable>
        <Text style={styles.termsText}>
          Agree with{" "}
          <Text style={styles.termsLink} onPress={() => router.push("/terms")}>
            Terms & Condition
          </Text>
        </Text>
      </View>

      <Pressable style={styles.cta} onPress={handleSignUp}>
        <Text style={styles.ctaText}>Sign Up</Text>
      </Pressable>

      <View style={styles.dividerRow}>
        <View style={styles.dividerLine} />
        <Text style={styles.dividerText}>Or sign up with</Text>
        <View style={styles.dividerLine} />
      </View>

      <View style={styles.socialRow}>
        <Pressable style={styles.socialButton} onPress={openDemoModal}>
          <Ionicons name="logo-apple" size={24} color={colors.textPrimary} />
        </Pressable>
        <Pressable style={styles.socialButton} onPress={openDemoModal}>
          <GoogleIcon size={22} />
        </Pressable>
        <Pressable style={styles.socialButton} onPress={openDemoModal}>
          <Ionicons name="logo-facebook" size={24} color="#1877F2" />
        </Pressable>
      </View>

      <Text style={styles.signInRow}>
        Already have an account?{" "}
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
              Soova is a portfolio demonstration.
            </Text>
            <Text style={styles.modalBody}>
              Tap below to fill in a demo account and explore the full shopping
              experience.
            </Text>

            <Pressable
              style={styles.modalPrimaryButton}
              onPress={useDemoAccount}
            >
              <Text style={styles.modalPrimaryButtonText}>
                Use Demo Account
              </Text>
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
      paddingTop: 80,
    },
    circleOutline: {
      position: "absolute",
      borderWidth: 1,
      borderColor: colors.outline,
      borderRadius: 999,
    },
    circleTopLeft: {
      width: 220,
      height: 220,
      top: -80,
      left: -100,
    },
    circleBottomRight: {
      width: 220,
      height: 220,
      bottom: -100,
      right: -100,
    },
    heading: {
      fontFamily: Fonts.bold,
      fontSize: 32,
      textAlign: "center",
      color: colors.textPrimary,
      marginTop: 20,
    },
    subheading: {
      fontFamily: Fonts.regular,
      fontSize: 15,
      lineHeight: 22,
      textAlign: "center",
      color: colors.textMuted,
      marginTop: 12,
      marginBottom: 28,
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
      marginBottom: 20,
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
    termsRow: {
      flexDirection: "row",
      alignItems: "center",
      marginBottom: 24,
    },
    checkbox: {
      marginRight: 10,
    },
    checkboxInner: {
      width: 22,
      height: 22,
      borderRadius: 6,
      borderWidth: 1.5,
      borderColor: colors.accent,
      alignItems: "center",
      justifyContent: "center",
    },
    termsText: {
      fontFamily: Fonts.regular,
      fontSize: 14,
      color: colors.textPrimary,
    },
    termsLink: {
      color: colors.accent,
      fontFamily: Fonts.semiBold,
      textDecorationLine: "underline",
    },
    cta: {
      width: "100%",
      backgroundColor: colors.accent,
      borderRadius: 32,
      paddingVertical: 18,
      alignItems: "center",
      marginBottom: 24,
    },
    ctaText: {
      fontFamily: Fonts.semiBold,
      fontSize: 16,
      color: colors.onAccent,
    },
    dividerRow: {
      flexDirection: "row",
      alignItems: "center",
      marginBottom: 24,
    },
    dividerLine: {
      flex: 1,
      height: 1,
      backgroundColor: colors.outline,
    },
    dividerText: {
      fontFamily: Fonts.regular,
      fontSize: 13,
      color: colors.textMuted,
      marginHorizontal: 12,
    },
    socialRow: {
      flexDirection: "row",
      justifyContent: "center",
      gap: 16,
      marginBottom: 28,
    },
    socialButton: {
      width: 56,
      height: 56,
      borderRadius: 28,
      borderWidth: 1,
      borderColor: colors.outline,
      alignItems: "center",
      justifyContent: "center",
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
