// Edit Profile screen — accessible from Account > "Your profile". Lets the user
// update name, email, and phone (persisted to profile-store). Password changes
// live in their own screen, reached via the "Change Password" row below.

import { ThemeColors } from "@/constants/colors";
import { Fonts } from "@/constants/fonts";
import { useThemeColors } from "@/hooks/use-theme-colors";
import { useProfileStore } from "@/store/profile-store";
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

export default function EditProfile() {
  const colors = useThemeColors();
  const insets = useSafeAreaInsets();
  const styles = getStyles(colors, insets.bottom, insets.top);

  const profile = useProfileStore((s) => s);
  const setProfile = useProfileStore((s) => s.setProfile);

  const [name, setName] = useState(profile.name);
  const [email, setEmail] = useState(profile.email);
  const [phone, setPhone] = useState(profile.phone);

  const [saving, setSaving] = useState(false);
  const [successVisible, setSuccessVisible] = useState(false);

  // --- Per-field errors, shown directly under each input ---
  const [nameError, setNameError] = useState("");
  const [emailError, setEmailError] = useState("");

  function validate(): boolean {
    let isValid = true;

    setNameError("");
    setEmailError("");

    if (!name.trim()) {
      setNameError("Name can't be empty.");
      isValid = false;
    }
    if (!email.trim() || !email.includes("@")) {
      setEmailError("Enter a valid email.");
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
      setProfile({
        name: name.trim(),
        email: email.trim(),
        phone: phone.trim(),
      });

      setSaving(false);
      setSuccessVisible(true);

      setTimeout(() => setSuccessVisible(false), 2500);
    }, 700);
  }

  return (
    <View style={styles.container}>
      <View style={[styles.circleOutline, styles.circleTopLeft]} />
      <View style={[styles.circleOutline, styles.circleBottomRight]} />

      {successVisible && (
        <View style={styles.banner}>
          <Ionicons name="checkmark-circle" size={20} color={colors.onAccent} />
          <Text style={styles.bannerText}>Profile updated successfully.</Text>
        </View>
      )}

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <Pressable style={styles.backButton} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={22} color={colors.accent} />
        </Pressable>

        <Text style={styles.heading}>Edit Profile</Text>
        <Text style={styles.subheading}>
          Update your personal details below.
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
            placeholder="Your name"
            placeholderTextColor={colors.textMuted}
            value={name}
            onChangeText={setName}
          />
        </View>
        {!!nameError && <Text style={styles.fieldErrorText}>{nameError}</Text>}

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
            placeholder="you@example.com"
            placeholderTextColor={colors.textMuted}
            keyboardType="email-address"
            autoCapitalize="none"
            value={email}
            onChangeText={setEmail}
          />
        </View>
        {!!emailError && (
          <Text style={styles.fieldErrorText}>{emailError}</Text>
        )}

        <Text style={styles.label}>Phone Number</Text>
        <View style={styles.inputWrapper}>
          <Ionicons
            name="call-outline"
            size={20}
            color={colors.textMuted}
            style={styles.inputIcon}
          />
          <Text style={styles.dialCodeText}>{profile.countryDialCode}</Text>
          <TextInput
            style={styles.input}
            placeholder="Phone number"
            placeholderTextColor={colors.textMuted}
            keyboardType="phone-pad"
            value={phone}
            onChangeText={setPhone}
          />
        </View>
        <Text style={styles.label}>Location</Text>
        <Pressable
          style={styles.passwordRow}
          onPress={() =>
            router.push({
              pathname: "/location-access",
              params: { returnTo: "edit-profile" },
            })
          }
        >
          <View style={styles.passwordRowLeft}>
            <Ionicons
              name="location-outline"
              size={20}
              color={colors.textPrimary}
            />
            <Text style={styles.passwordRowText}>
              {profile.location ?? "Not set"}
            </Text>
          </View>
          <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />
        </Pressable>
        <View style={styles.divider} />

        <Pressable
          style={styles.passwordRow}
          onPress={() => router.push("/change-password")}
        >
          <View style={styles.passwordRowLeft}>
            <Ionicons
              name="lock-closed-outline"
              size={20}
              color={colors.textPrimary}
            />
            <Text style={styles.passwordRowText}>Change Password</Text>
          </View>
          <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />
        </Pressable>

        <Pressable
          style={[styles.cta, saving && styles.ctaBusy]}
          onPress={handleSave}
          disabled={saving}
        >
          {saving ? (
            <ActivityIndicator color={colors.onAccent} size="small" />
          ) : (
            <Text style={styles.ctaText}>Save Changes</Text>
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
    dialCodeText: {
      fontFamily: Fonts.medium,
      fontSize: 15,
      color: colors.textPrimary,
      marginRight: 4,
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
    divider: {
      height: 1,
      backgroundColor: colors.outline,
      marginTop: 4,
      marginBottom: 24,
    },
    passwordRow: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      backgroundColor: colors.cardBackground,
      borderRadius: 16,
      paddingHorizontal: 16,
      height: 56,
      marginBottom: 24,
    },
    passwordRowLeft: {
      flexDirection: "row",
      alignItems: "center",
      gap: 12,
    },
    passwordRowText: {
      fontFamily: Fonts.medium,
      fontSize: 15,
      color: colors.textPrimary,
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
