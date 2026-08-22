import { ThemeColors } from "@/constants/colors";
import { Fonts } from "@/constants/fonts";
import { useThemeColors } from "@/hooks/use-theme-colors";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useState } from "react";
import { Pressable, StyleSheet, Text, TextInput, View } from "react-native";

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

export default function NewPassword() {
  const colors = useThemeColors();
  const styles = getStyles(colors);

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState("");

  const strength = getPasswordStrength(password);

  function handleUpdatePassword() {
    if (!password || !confirmPassword) {
      setError("Please fill in both fields.");
      return;
    }
    if (password !== confirmPassword) {
      setError("Passwords don't match.");
      return;
    }

    router.replace({
      pathname: "/sign-in",
      params: { passwordReset: "success" },
    });
  }

  return (
    <View style={styles.container}>
      <View style={[styles.circleOutline, styles.circleTopLeft]} />
      <View style={[styles.circleOutline, styles.circleBottomRight]} />

      <Pressable style={styles.backButton} onPress={() => router.back()}>
        <Ionicons name="arrow-back" size={22} color={colors.accent} />
      </Pressable>

      <Text style={styles.heading}>New Password</Text>
      <Text style={styles.subheading}>
        Please create a new password. Ensure{"\n"}that it is different from
        previous ones.
      </Text>

      <Text style={styles.label}>Password</Text>
      <Text style={styles.helperText}>
        Use a mix of uppercase, lowercase, numbers, and a special character for
        a stronger password.
      </Text>
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
          onChangeText={(text) => {
            setPassword(text);
            setError("");
          }}
        />
        <Pressable onPress={() => setShowPassword((prev) => !prev)}>
          <Ionicons
            name={showPassword ? "eye-outline" : "eye-off-outline"}
            size={20}
            color={colors.textMuted}
          />
        </Pressable>
      </View>

      {password.length > 0 && (
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

      <Text style={styles.label}>Confirm Password</Text>
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
          secureTextEntry={!showConfirmPassword}
          value={confirmPassword}
          onChangeText={(text) => {
            setConfirmPassword(text);
            setError("");
          }}
        />
        <Pressable onPress={() => setShowConfirmPassword((prev) => !prev)}>
          <Ionicons
            name={showConfirmPassword ? "eye-outline" : "eye-off-outline"}
            size={20}
            color={colors.textMuted}
          />
        </Pressable>
      </View>

      {!!error && <Text style={styles.errorText}>{error}</Text>}

      <Pressable style={styles.cta} onPress={handleUpdatePassword}>
        <Text style={styles.ctaText}>Update Password</Text>
      </Pressable>
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
      marginBottom: 6,
    },
    helperText: {
      fontFamily: Fonts.regular,
      fontSize: 12,
      lineHeight: 17,
      color: colors.textMuted,
      marginBottom: 10,
    },
    inputWrapper: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: colors.placeholder,
      borderRadius: 16,
      paddingHorizontal: 16,
      height: 56,
      marginBottom: 12,
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
    errorText: {
      fontFamily: Fonts.medium,
      fontSize: 13,
      color: "#D64545",
      marginBottom: 16,
    },
    cta: {
      width: "100%",
      backgroundColor: colors.accent,
      borderRadius: 32,
      paddingVertical: 18,
      alignItems: "center",
      marginTop: 8,
    },
    ctaText: {
      fontFamily: Fonts.semiBold,
      fontSize: 16,
      color: colors.onAccent,
    },
  });
}
