// Add Card screen — live card preview above the form, with real inline
// validation (card number length, expiry month range, expiry not in the
// past, CVV length) and brand detection (Visa / Mastercard, by BIN prefix)
// reflected live in the preview. Only the last four digits, holder name,
// expiry, and detected brand are ever saved — never the full number or CVV.

import { ThemeColors } from "@/constants/colors";
import { Fonts } from "@/constants/fonts";
import { useThemeColors } from "@/hooks/use-theme-colors";
import { CardBrand, useCartStore } from "@/store/cart-store";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useMemo, useState } from "react";
import {
  ActivityIndicator,
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

// Use require() for local WebP assets.
// This avoids TypeScript errors related to WebP module declarations.
const visaLogo = require("@/assets/images/visa.webp");
const mastercardLogo = require("@/assets/images/mastercard.webp");

const SAVE_DELAY_MS = 500;

function detectCardBrand(digits: string): CardBrand {
  // Visa cards start with 4
  if (digits.startsWith("4")) {
    return "visa";
  }

  const prefix2 = Number(digits.slice(0, 2));
  const prefix4 = Number(digits.slice(0, 4));

  // Mastercard 51–55 range
  if (prefix2 >= 51 && prefix2 <= 55) {
    return "mastercard";
  }

  // Mastercard 2221–2720 range
  if (prefix4 >= 2221 && prefix4 <= 2720) {
    return "mastercard";
  }

  // Unknown card brand
  return null;
}

function formatCardNumber(digits: string) {
  return digits.match(/.{1,4}/g)?.join(" ") ?? digits;
}

function formatExpiry(digits: string) {
  if (digits.length <= 2) {
    return digits;
  }

  return `${digits.slice(0, 2)}/${digits.slice(2, 4)}`;
}

export default function AddCard() {
  const colors = useThemeColors();
  const styles = getStyles(colors);
  const addCard = useCartStore((s) => s.addCard);

  const [holderName, setHolderName] = useState("");
  const [cardNumberDigits, setCardNumberDigits] = useState("");
  const [expiryDigits, setExpiryDigits] = useState("");
  const [cvv, setCvv] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  const [touched, setTouched] = useState({
    holderName: false,
    cardNumber: false,
    expiry: false,
    cvv: false,
  });

  // Detect card brand live while the user types.
  const brand = useMemo(
    () => detectCardBrand(cardNumberDigits),
    [cardNumberDigits],
  );

  const displayNumber = cardNumberDigits
    ? formatCardNumber(cardNumberDigits.padEnd(16, "•"))
    : "•••• •••• •••• ••••";

  const displayExpiry = expiryDigits ? formatExpiry(expiryDigits) : "MM/YY";

  // --- Field-level validation ---
  const holderNameError =
    touched.holderName && holderName.trim().length === 0
      ? "Enter the name on the card"
      : null;

  const cardNumberError =
    touched.cardNumber &&
    cardNumberDigits.length > 0 &&
    cardNumberDigits.length < 16
      ? "Card number must be 16 digits"
      : null;

  const expiryMonth = Number(expiryDigits.slice(0, 2));
  const expiryYearTwoDigit = Number(expiryDigits.slice(2, 4));

  // Cards are valid through the END of their expiry month, so a card
  // expiring this month is still valid — only strictly earlier months
  // (or earlier years) count as expired.
  const isMonthInRange = expiryMonth >= 1 && expiryMonth <= 12;

  const isExpired = (() => {
    if (expiryDigits.length < 4 || !isMonthInRange) return false;

    const fullExpiryYear = 2000 + expiryYearTwoDigit;
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth() + 1; // getMonth() is 0-indexed

    return (
      fullExpiryYear < currentYear ||
      (fullExpiryYear === currentYear && expiryMonth < currentMonth)
    );
  })();

  const expiryError =
    touched.expiry && expiryDigits.length >= 2 && !isMonthInRange
      ? "Enter a valid month (01–12)"
      : touched.expiry && expiryDigits.length > 0 && expiryDigits.length < 4
        ? "Enter the full expiry date"
        : touched.expiry && expiryDigits.length === 4 && isExpired
          ? "This card has expired"
          : null;

  const cvvError =
    touched.cvv && cvv.length > 0 && cvv.length < 3
      ? "CVV must be 3 digits"
      : null;

  const isValid =
    holderName.trim().length > 0 &&
    cardNumberDigits.length === 16 &&
    expiryDigits.length === 4 &&
    isMonthInRange &&
    !isExpired &&
    cvv.length === 3;

  function handleCardNumberChange(text: string) {
    const digits = text.replace(/\D/g, "").slice(0, 16);

    setCardNumberDigits(digits);
  }

  function handleExpiryChange(text: string) {
    const digits = text.replace(/\D/g, "").slice(0, 4);

    setExpiryDigits(digits);
  }

  function handleCvvChange(text: string) {
    const digits = text.replace(/\D/g, "").slice(0, 3);

    setCvv(digits);
  }

  function markTouched(field: keyof typeof touched) {
    setTouched((prev) => ({
      ...prev,
      [field]: true,
    }));
  }

  function handleAddCard() {
    setTouched({
      holderName: true,
      cardNumber: true,
      expiry: true,
      cvv: true,
    });

    if (!isValid || isSaving) {
      return;
    }

    setIsSaving(true);

    setTimeout(() => {
      addCard({
        holderName: holderName.trim(),
        lastFour: cardNumberDigits.slice(-4),
        expiry: formatExpiry(expiryDigits),

        // Save the detected brand so Payment Methods can show
        // the correct logo after returning to that screen.
        brand,
      });

      setIsSaving(false);
      router.back();
    }, SAVE_DELAY_MS);
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Pressable style={styles.backButton} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={22} color={colors.textPrimary} />
        </Pressable>

        <Text style={styles.headerTitle}>Add Card</Text>

        <View style={styles.backButton} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* --- Live card preview --- */}
        <View style={styles.cardPreview}>
          {brand === "visa" ? (
            <Image
              source={visaLogo}
              resizeMode="contain"
              style={styles.cardVisaLogo}
            />
          ) : brand === "mastercard" ? (
            <Image
              source={mastercardLogo}
              resizeMode="contain"
              style={styles.cardMastercardLogo}
            />
          ) : (
            <Ionicons
              name="card-outline"
              size={26}
              color={colors.onAccent}
              style={styles.cardGenericIcon}
            />
          )}

          <Text style={styles.cardNumber}>{displayNumber}</Text>

          <View style={styles.cardBottomRow}>
            <View>
              <Text style={styles.cardFieldLabel}>Card holder name</Text>

              <Text style={styles.cardFieldValue}>
                {holderName.trim() || "Your Name"}
              </Text>
            </View>

            <View>
              <Text style={styles.cardFieldLabel}>Expiry date</Text>

              <Text style={styles.cardFieldValue}>{displayExpiry}</Text>
            </View>
          </View>
        </View>

        <Text style={styles.fieldLabel}>Card Holder Name</Text>

        <TextInput
          style={[styles.input, holderNameError && styles.inputError]}
          placeholder="Esther Howard"
          placeholderTextColor={colors.textMuted}
          value={holderName}
          onChangeText={setHolderName}
          onBlur={() => markTouched("holderName")}
        />

        {holderNameError && (
          <Text style={styles.errorText}>{holderNameError}</Text>
        )}

        <Text style={styles.fieldLabel}>Card Number</Text>

        <TextInput
          style={[styles.input, cardNumberError && styles.inputError]}
          placeholder="0000 0000 0000 0000"
          placeholderTextColor={colors.textMuted}
          keyboardType="number-pad"
          value={formatCardNumber(cardNumberDigits)}
          onChangeText={handleCardNumberChange}
          onBlur={() => markTouched("cardNumber")}
          maxLength={19}
        />

        {cardNumberError && (
          <Text style={styles.errorText}>{cardNumberError}</Text>
        )}

        <View style={styles.fieldRow}>
          <View style={{ flex: 1 }}>
            <Text style={styles.fieldLabel}>Expiry Date</Text>

            <TextInput
              style={[styles.input, expiryError && styles.inputError]}
              placeholder="MM/YY"
              placeholderTextColor={colors.textMuted}
              keyboardType="number-pad"
              value={formatExpiry(expiryDigits)}
              onChangeText={handleExpiryChange}
              onBlur={() => markTouched("expiry")}
              maxLength={5}
            />

            {expiryError && <Text style={styles.errorText}>{expiryError}</Text>}
          </View>

          <View style={{ flex: 1 }}>
            <Text style={styles.fieldLabel}>CVV</Text>

            <TextInput
              style={[styles.input, cvvError && styles.inputError]}
              placeholder="000"
              placeholderTextColor={colors.textMuted}
              keyboardType="number-pad"
              secureTextEntry
              value={cvv}
              onChangeText={handleCvvChange}
              onBlur={() => markTouched("cvv")}
              maxLength={3}
            />

            {cvvError && <Text style={styles.errorText}>{cvvError}</Text>}
          </View>
        </View>

        <Text style={styles.disclaimer}>
          This is a demo. Card details stay on your device — only the last four
          digits, name, expiry, and card brand are saved; the full number and
          CVV are never stored.
        </Text>
      </ScrollView>

      <View style={styles.footer}>
        <Pressable
          style={[
            styles.addButton,
            (!isValid || isSaving) && styles.addButtonDisabled,
          ]}
          onPress={handleAddCard}
          disabled={isSaving}
        >
          {isSaving ? (
            <ActivityIndicator color={colors.onAccent} size="small" />
          ) : (
            <Text style={styles.addButtonText}>Add Card</Text>
          )}
        </Pressable>
      </View>
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
      paddingBottom: 20,
    },

    // --- Live card preview ---
    cardPreview: {
      backgroundColor: colors.accent,
      borderRadius: 20,
      padding: 20,
      height: 190,
      justifyContent: "space-between",
      marginBottom: 28,
    },

    // Visa WebP logo
    cardVisaLogo: {
      alignSelf: "flex-end",
      width: 58,
      height: 38,
    },

    // Mastercard WebP logo
    cardMastercardLogo: {
      alignSelf: "flex-end",
      width: 52,
      height: 38,
    },

    // Generic card icon
    cardGenericIcon: {
      alignSelf: "flex-end",
      fontSize: 40,
    },

    cardNumber: {
      fontFamily: Fonts.semiBold,
      fontSize: 20,
      letterSpacing: 2,
      color: colors.onAccent,
    },

    cardBottomRow: {
      flexDirection: "row",
      justifyContent: "space-between",
    },

    cardFieldLabel: {
      fontFamily: Fonts.regular,
      fontSize: 10,
      color: colors.onAccent,
      opacity: 0.75,
      marginBottom: 4,
    },

    cardFieldValue: {
      fontFamily: Fonts.semiBold,
      fontSize: 14,
      color: colors.onAccent,
    },

    fieldLabel: {
      fontFamily: Fonts.semiBold,
      fontSize: 13,
      color: colors.textPrimary,
      marginBottom: 8,
    },

    input: {
      backgroundColor: colors.cardBackground,
      borderRadius: 14,
      paddingHorizontal: 16,
      height: 48,
      fontFamily: Fonts.regular,
      fontSize: 14,
      color: colors.textPrimary,
      marginBottom: 6,
    },

    inputError: {
      borderWidth: 1.5,
      borderColor: colors.roseRed,
    },

    errorText: {
      fontFamily: Fonts.medium,
      fontSize: 12,
      color: colors.roseRed,
      marginBottom: 10,
      marginLeft: 4,
    },

    fieldRow: {
      flexDirection: "row",
      gap: 12,
    },

    disclaimer: {
      fontFamily: Fonts.regular,
      fontSize: 12,
      lineHeight: 18,
      color: colors.textMuted,
      marginTop: 4,
    },

    footer: {
      paddingHorizontal: 24,
      paddingTop: 12,
      paddingBottom: 50,
    },

    addButton: {
      backgroundColor: colors.accent,
      borderRadius: 28,
      paddingVertical: 16,
      alignItems: "center",
      justifyContent: "center",
    },

    addButtonDisabled: {
      opacity: 0.6,
    },

    addButtonText: {
      fontFamily: Fonts.semiBold,
      fontSize: 15,
      color: colors.onAccent,
    },
  });
}
