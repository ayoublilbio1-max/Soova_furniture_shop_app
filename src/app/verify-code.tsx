import { ThemeColors } from "@/constants/colors";
import { Fonts } from "@/constants/fonts";
import { useThemeColors } from "@/hooks/use-theme-colors";
import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import { useEffect, useRef, useState } from "react";
import { Pressable, StyleSheet, Text, TextInput, View } from "react-native";

const CODE_LENGTH = 4;
const EXPIRY_SECONDS = 45;

function generateCode() {
  return Math.floor(1000 + Math.random() * 9000).toString();
}

export default function VerifyCode() {
  const colors = useThemeColors();
  const styles = getStyles(colors);
  const params = useLocalSearchParams<{ email: string; code: string }>();

  const [activeCode, setActiveCode] = useState(params.code);
  const [digits, setDigits] = useState<string[]>(Array(CODE_LENGTH).fill(""));
  const [secondsLeft, setSecondsLeft] = useState(EXPIRY_SECONDS);
  const [error, setError] = useState(false);
  const inputRefs = useRef<(TextInput | null)[]>([]);

  useEffect(() => {
    const autofillTimer = setTimeout(() => {
      setDigits(activeCode.split(""));
    }, 1000);

    const countdown = setInterval(() => {
      setSecondsLeft((prev) => Math.max(prev - 1, 0));
    }, 1000);

    return () => {
      clearTimeout(autofillTimer);
      clearInterval(countdown);
    };
  }, [activeCode]);

  const expired = secondsLeft === 0;

  function handleDigitChange(text: string, index: number) {
    setError(false);
    const next = [...digits];
    next[index] = text.slice(-1);
    setDigits(next);

    if (text && index < CODE_LENGTH - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  }

  function handleKeyPress(key: string, index: number) {
    if (key === "Backspace" && !digits[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  }

  function handleResend() {
    if (!expired) return;

    const newCode = generateCode();
    setActiveCode(newCode);
    setDigits(Array(CODE_LENGTH).fill(""));
    setSecondsLeft(EXPIRY_SECONDS);
    setError(false);
  }

  function handleVerify() {
    if (digits.join("") === activeCode) {
      router.push({
        pathname: "/new-password",
        params: { email: params.email },
      });
    } else {
      setError(true);
    }
  }

  return (
    <View style={styles.container}>
      <View style={[styles.circleOutline, styles.circleTopLeft]} />
      <View style={[styles.circleOutline, styles.circleBottomRight]} />

      <Pressable style={styles.backButton} onPress={() => router.back()}>
        <Ionicons name="arrow-back" size={22} color={colors.accent} />
      </Pressable>

      <Text style={styles.heading}>Verify Code</Text>
      <Text style={styles.subheading}>
        Please enter the 4-digit code sent to{"\n"}
        <Text style={styles.emailText}>{params.email}</Text>
      </Text>

      <View style={styles.codeRow}>
        {digits.map((digit, index) => (
          <TextInput
            key={index}
            ref={(ref) => {
              inputRefs.current[index] = ref;
            }}
            style={[styles.codeBox, error && styles.codeBoxError]}
            value={digit}
            onChangeText={(text) => handleDigitChange(text, index)}
            onKeyPress={({ nativeEvent }) =>
              handleKeyPress(nativeEvent.key, index)
            }
            keyboardType="number-pad"
            maxLength={1}
            editable={!expired}
          />
        ))}
      </View>

      {error && (
        <Text style={styles.errorText}>Incorrect code, please try again.</Text>
      )}

      <Text style={styles.timerText}>
        {expired
          ? "Code expired"
          : `Code expires in 00:${secondsLeft.toString().padStart(2, "0")}`}
      </Text>

      <Pressable onPress={handleResend} disabled={!expired}>
        <Text
          style={[styles.resendLink, !expired && styles.resendLinkDisabled]}
        >
          {expired
            ? "Send code again"
            : `Send code again in 00:${secondsLeft.toString().padStart(2, "0")}`}
        </Text>
      </Pressable>

      <Pressable
        style={[styles.cta, expired && styles.ctaDisabled]}
        onPress={handleVerify}
        disabled={expired}
      >
        <Text style={styles.ctaText}>Verify</Text>
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
      alignItems: "center",
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
      alignSelf: "flex-start",
    },
    heading: {
      fontFamily: Fonts.bold,
      fontSize: 28,
      color: colors.textPrimary,
      textAlign: "center",
    },
    subheading: {
      fontFamily: Fonts.regular,
      fontSize: 14,
      lineHeight: 21,
      color: colors.textMuted,
      textAlign: "center",
      marginTop: 10,
      marginBottom: 36,
    },
    emailText: {
      fontFamily: Fonts.semiBold,
      color: colors.accent,
    },
    codeRow: {
      flexDirection: "row",
      gap: 14,
      marginBottom: 16,
    },
    codeBox: {
      width: 56,
      height: 64,
      borderRadius: 16,
      backgroundColor: colors.cardBackground,
      textAlign: "center",
      fontFamily: Fonts.semiBold,
      fontSize: 22,
      color: colors.textPrimary,
    },
    codeBoxError: {
      borderWidth: 1.5,
      borderColor: "#D64545",
    },
    errorText: {
      fontFamily: Fonts.medium,
      fontSize: 13,
      color: "#D64545",
      marginBottom: 8,
    },
    timerText: {
      fontFamily: Fonts.regular,
      fontSize: 13,
      color: colors.textMuted,
      marginTop: 8,
    },
    resendLink: {
      fontFamily: Fonts.semiBold,
      fontSize: 14,
      color: colors.accent,
      textDecorationLine: "underline",
      marginTop: 10,
      marginBottom: 32,
    },
    resendLinkDisabled: {
      color: colors.textMuted,
      textDecorationLine: "none",
    },
    cta: {
      width: "100%",
      backgroundColor: colors.accent,
      borderRadius: 32,
      paddingVertical: 18,
      alignItems: "center",
    },
    ctaDisabled: {
      opacity: 0.5,
    },
    ctaText: {
      fontFamily: Fonts.semiBold,
      fontSize: 16,
      color: colors.onAccent,
    },
  });
}
