// Change Password screen — accessible from Edit Profile > "Change Password".
// Simulated password change (no real backend, matching the rest of the auth flow).

import { ThemeColors } from "@/constants/colors";
import { Fonts } from "@/constants/fonts";
import { useThemeColors } from "@/hooks/use-theme-colors";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

function getPasswordStrength(password: string) {
  let score = 0;
  if (password.length >= 8) score++;
  if (/[a-z]/.test(password)) score++;
  if (/[A-Z]/.test(password)) score++;
  if (/[0-9]/.test(password)) score++;
  if (/[^A-Za-z0-9]/.test(password)) score++;

  if (score <= 2) return { score, label: "Weak", color: "#D64545" };
  if (score <= 4) return { score, label: "Medium", color: "#E0A72E" };
  return { score, label: "Strong", color: "#3FA34D" };
}

export default function ChangePassword() {
  const colors = useThemeColors();
  const insets = useSafeAreaInsets();
  const styles = getStyles(colors, insets.bottom, insets.top);

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);

  const [saving, setSaving] = useState(false);
  const [successVisible, setSuccessVisible] = useState(false);

  const [currentPasswordError, setCurrentPasswordError] = useState("");
  const [newPasswordError, setNewPasswordError] = useState("");
  const [confirmPasswordError, setConfirmPasswordError] = useState("");

  const strength = getPasswordStrength(newPassword);

  function validate(): boolean {
    let isValid = true;

    setCurrentPasswordError("");
    setNewPasswordError("");
    setConfirmPasswordError("");

    if (!currentPassword) {
      setCurrentPasswordError("Enter your current password.");
      isValid = false;
    }
    if (newPassword.length < 8) {
      setNewPasswordError("New password must be at least 8 characters.");
      isValid = false;
    }
    if (newPassword !== confirmPassword) {
      setConfirmPasswordError("New passwords don't match.");
      isValid = false;
    }

    return isValid;
  }

  function handleSave() {
    if (saving) return;

    if (!validate()) return;

    setSaving(true);

    // Simulated save — no real backend, mirrors the rest of the app's demo auth.
    setTimeout(() => {
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setSaving(false);
      setSuccessVisible(true);

      setTimeout(() => {
        setSuccessVisible(false);
        router.back();
      }, 1500);
    }, 700);
  }

  return (
    <View style={styles.container}>
      <View style={[styles.circleOutline, styles.circleTopLeft]} />
      <View style={[styles.circleOutline, styles.circleBottomRight]} />

      {successVisible && (
        <View style={styles.banner}>
          <Ionicons name="checkmark-circle" size={20} color={colors.onAccent} />
          <Text style={styles.bannerText}>Password updated successfully.</Text>
        </View>
      )}

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <Pressable style={styles.backButton} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={22} color={colors.accent} />
        </Pressable>

        <Text style={styles.heading}>Change Password</Text>
        <Text style={styles.subheading}>
          Enter your current password, then choose a new one.
        </Text>

        <Text style={styles.label}>Current Password</Text>
        <View style={styles.inputWrapper}>
          <Ionicons
            name="lock-closed-outline"
            size={20}
            color={colors.textMuted}
            style={styles.inputIcon}
          />
          <TextInput
            style={styles.input}
            placeholder="Current password"
            placeholderTextColor={colors.textMuted}
            secureTextEntry={!showCurrentPassword}
            value={currentPassword}
            onChangeText={setCurrentPassword}
          />
          <Pressable onPress={() => setShowCurrentPassword((v) => !v)}>
            <Ionicons
              name={showCurrentPassword ? "eye-off-outline" : "eye-outline"}
              size={20}
              color={colors.textMuted}
            />
          </Pressable>
        </View>
        {!!currentPasswordError && (
          <Text style={styles.fieldErrorText}>{currentPasswordError}</Text>
        )}

        <Text style={styles.label}>New Password</Text>
        <View style={styles.inputWrapper}>
          <Ionicons
            name="lock-closed-outline"
            size={20}
            color={colors.textMuted}
            style={styles.inputIcon}
          />
          <TextInput
            style={styles.input}
            placeholder="New password"
            placeholderTextColor={colors.textMuted}
            secureTextEntry={!showNewPassword}
            value={newPassword}
            onChangeText={setNewPassword}
          />
          <Pressable onPress={() => setShowNewPassword((v) => !v)}>
            <Ionicons
              name={showNewPassword ? "eye-off-outline" : "eye-outline"}
              size={20}
              color={colors.textMuted}
            />
          </Pressable>
        </View>

        {newPassword.length > 0 && (
          <View style={styles.strengthWrapper}>
            <View style={styles.strengthTrack}>
              <View
                style={[
                  styles.strengthFill,
                  {
                    width: `${(strength.score / 5) * 100}%`,
                    backgroundColor: strength.color,
                  },
                ]}
              />
            </View>
            <Text style={[styles.strengthLabel, { color: strength.color }]}>
              {strength.label}
            </Text>
          </View>
        )}
        {!!newPasswordError && (
          <Text style={styles.fieldErrorText}>{newPasswordError}</Text>
        )}

        <Text style={styles.label}>Confirm New Password</Text>
        <View style={styles.inputWrapper}>
          <Ionicons
            name="lock-closed-outline"
            size={20}
            color={colors.textMuted}
            style={styles.inputIcon}
          />
          <TextInput
            style={styles.input}
            placeholder="Confirm new password"
            placeholderTextColor={colors.textMuted}
            secureTextEntry={!showNewPassword}
            value={confirmPassword}
            onChangeText={setConfirmPassword}
          />
        </View>
        {!!confirmPasswordError && (
          <Text style={styles.fieldErrorText}>{confirmPasswordError}</Text>
        )}

        <Pressable
          style={[styles.cta, saving && styles.ctaBusy]}
          onPress={handleSave}
          disabled={saving}
        >
          {saving ? (
            <ActivityIndicator color={colors.onAccent} size="small" />
          ) : (
            <Text style={styles.ctaText}>Update Password</Text>
          )}
        </Pressable>
      </ScrollView>
    </View>
  );
}

function getStyles(colors: ThemeColors, bottomInset: number, topInset: number) {
  return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    scrollContent: {
      paddingHorizontal: 24,
      paddingTop: 50,
      paddingBottom: bottomInset + 50,
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
    banner: {
      position: "absolute",
      top: topInset + 12,
      left: 16,
      right: 16,
      zIndex: 10,
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: colors.accent,
      borderRadius: 16,
      paddingVertical: 12,
      paddingHorizontal: 16,
      gap: 10,
      shadowColor: "#000",
      shadowOpacity: 0.15,
      shadowRadius: 8,
      shadowOffset: { width: 0, height: 4 },
      elevation: 6,
    },
    bannerText: {
      flex: 1,
      fontFamily: Fonts.medium,
      fontSize: 13,
      color: colors.onAccent,
    },
    backButton: {
      width: 44,
      height: 44,
      borderRadius: 22,
      borderWidth: 1,
      borderColor: colors.outline,
      alignItems: "center",
      justifyContent: "center",
      marginBottom: 20,
    },
    heading: {
      fontFamily: Fonts.bold,
      fontSize: 26,
      color: colors.textPrimary,
    },
    subheading: {
      fontFamily: Fonts.regular,
      fontSize: 14,
      lineHeight: 21,
      color: colors.textMuted,
      marginTop: 8,
      marginBottom: 24,
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
      backgroundColor: colors.cardBackground,
      borderRadius: 16,
      paddingHorizontal: 16,
      height: 56,
      marginBottom: 20,
      gap: 4,
    },
    inputIcon: {
      marginRight: 6,
    },
    input: {
      flex: 1,
      fontFamily: Fonts.regular,
      fontSize: 15,
      color: colors.textPrimary,
    },
    fieldErrorText: {
      fontFamily: Fonts.medium,
      fontSize: 12,
      color: colors.roseRed,
      marginTop: -12,
      marginBottom: 16,
    },
    strengthWrapper: {
      flexDirection: "row",
      alignItems: "center",
      gap: 10,
      marginBottom: 20,
    },
    strengthTrack: {
      flex: 1,
      height: 6,
      borderRadius: 3,
      backgroundColor: colors.outline,
      overflow: "hidden",
    },
    strengthFill: {
      height: "100%",
      borderRadius: 3,
    },
    strengthLabel: {
      fontFamily: Fonts.semiBold,
      fontSize: 12,
    },
    cta: {
      width: "100%",
      backgroundColor: colors.accent,
      borderRadius: 32,
      paddingVertical: 18,
      alignItems: "center",
      justifyContent: "center",
      marginTop: 8,
    },
    ctaBusy: {
      opacity: 0.7,
    },
    ctaText: {
      fontFamily: Fonts.semiBold,
      fontSize: 16,
      color: colors.onAccent,
    },
  });
}