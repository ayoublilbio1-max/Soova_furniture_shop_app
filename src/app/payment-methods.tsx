// Payment Methods screen — Cash, saved cards, and (demo, unconnected)
// PayPal/Apple Pay/Google Pay options. Confirm Payment triggers a deliberate
// short delay before navigating, since instant confirmation would read as
// fake for what's meant to feel like a real payment step. Confirming also
// snapshots the order (placeOrder) and clears the live cart, matching
// normal post-purchase behavior.

import { ThemeColors } from "@/constants/colors";
import { Fonts } from "@/constants/fonts";
import { useThemeColors } from "@/hooks/use-theme-colors";
import { PaymentMethodId, SavedCard, useCartStore } from "@/store/cart-store";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";

// Use require() for local WebP assets.
// This avoids TypeScript errors related to WebP module declarations.
const visaLogo = require("@/assets/images/visa-default.webp");
const mastercardLogo = require("@/assets/images/mastercard.webp");

const CONFIRM_DELAY_MS = 1200;

// --- Single selectable payment row (radio-style) ---
function PaymentRow({
  icon,
  label,
  selected,
  colors,
  styles,
  onPress,
  trailing,
}: {
  icon: React.ReactNode;
  label: string;
  selected: boolean;
  colors: ThemeColors;
  styles: ReturnType<typeof getStyles>;
  onPress: () => void;
  trailing?: React.ReactNode;
}) {
  return (
    <Pressable style={styles.row} onPress={onPress}>
      <View style={styles.rowIconCircle}>{icon}</View>

      <Text style={styles.rowLabel}>{label}</Text>

      {trailing}

      <View style={[styles.radioOuter, selected && styles.radioOuterActive]}>
        {selected && <View style={styles.radioInner} />}
      </View>
    </Pressable>
  );
}

export default function PaymentMethods() {
  const colors = useThemeColors();
  const styles = getStyles(colors);

  const savedCards = useCartStore((s) => s.savedCards);

  const selectedPaymentMethod = useCartStore((s) => s.selectedPaymentMethod);

  const selectPaymentMethod = useCartStore((s) => s.selectPaymentMethod);

  const removeCard = useCartStore((s) => s.removeCard);

  const placeOrder = useCartStore((s) => s.placeOrder);

  const [draftSelection, setDraftSelection] = useState<PaymentMethodId>(
    selectedPaymentMethod,
  );

  const [isConfirming, setIsConfirming] = useState(false);

  // --- Styled remove-card confirmation ---
  const [pendingRemoveCard, setPendingRemoveCard] = useState<SavedCard | null>(
    null,
  );

  function notImplemented(label: string) {
    Alert.alert(
      label,
      "Soova is a portfolio demonstration, so this payment method isn't connected to a live provider. Cash and saved cards are fully functional for the demo.",
    );
  }

  function confirmRemoveCard() {
    if (!pendingRemoveCard) return;

    removeCard(pendingRemoveCard.id);

    if (draftSelection === `card:${pendingRemoveCard.id}`) {
      setDraftSelection("cash");
    }

    setPendingRemoveCard(null);
  }

  function handleConfirmPayment() {
    if (isConfirming) return;

    setIsConfirming(true);

    selectPaymentMethod(draftSelection);

    setTimeout(() => {
      placeOrder();
      router.push("/payment-success");
      setIsConfirming(false);
    }, CONFIRM_DELAY_MS);
  }

  // Returns the correct logo for a saved card.
  // Old cards without a brand continue using the
  // existing generic card icon.
  function getSavedCardIcon(card: SavedCard) {
    if (card.brand === "visa") {
      return (
        <Image
          source={visaLogo}
          resizeMode="contain"
          style={styles.savedVisaLogo}
        />
      );
    }

    if (card.brand === "mastercard") {
      return (
        <Image
          source={mastercardLogo}
          resizeMode="contain"
          style={styles.savedMastercardLogo}
        />
      );
    }

    return <Ionicons name="card-outline" size={20} color={colors.accent} />;
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Pressable style={styles.backButton} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={22} color={colors.textPrimary} />
        </Pressable>

        <Text style={styles.headerTitle}>Payment Methods</Text>

        <View style={styles.backButton} />
      </View>

      <ScrollView contentContainerStyle={styles.listContent}>
        <Text style={styles.sectionLabel}>Cash</Text>

        <PaymentRow
          icon={
            <Ionicons name="cash-outline" size={20} color={colors.accent} />
          }
          label="Cash On Delivery"
          selected={draftSelection === "cash"}
          colors={colors}
          styles={styles}
          onPress={() => setDraftSelection("cash")}
        />

        <Text style={styles.sectionLabel}>Credit & Debit Card</Text>

        {savedCards.map((card) => (
          <PaymentRow
            key={card.id}
            icon={getSavedCardIcon(card)}
            label={`•••• ${card.lastFour}`}
            selected={draftSelection === `card:${card.id}`}
            colors={colors}
            styles={styles}
            onPress={() =>
              setDraftSelection(`card:${card.id}` as PaymentMethodId)
            }
            trailing={
              <Pressable
                hitSlop={8}
                style={styles.removeCardButton}
                onPress={() => setPendingRemoveCard(card)}
              >
                <Ionicons
                  name="trash-outline"
                  size={16}
                  color={colors.textMuted}
                />
              </Pressable>
            }
          />
        ))}

        <Pressable
          style={styles.addCardRow}
          onPress={() => router.push("/add-card")}
        >
          <View style={styles.rowIconCircle}>
            <Ionicons name="card-outline" size={20} color={colors.accent} />
          </View>

          <Text style={styles.rowLabel}>Add Card</Text>

          <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />
        </Pressable>

        <Text style={styles.sectionLabel}>More Payment Options</Text>

        <PaymentRow
          icon={<Ionicons name="logo-paypal" size={20} color="#003087" />}
          label="Paypal"
          selected={false}
          colors={colors}
          styles={styles}
          onPress={() => notImplemented("PayPal")}
        />

        <PaymentRow
          icon={
            <Ionicons name="logo-apple" size={20} color={colors.textPrimary} />
          }
          label="Apple Pay"
          selected={false}
          colors={colors}
          styles={styles}
          onPress={() => notImplemented("Apple Pay")}
        />

        <PaymentRow
          icon={<Ionicons name="logo-google" size={20} color="#4285F4" />}
          label="Google Pay"
          selected={false}
          colors={colors}
          styles={styles}
          onPress={() => notImplemented("Google Pay")}
        />
      </ScrollView>

      <View style={styles.footer}>
        <Pressable
          style={[
            styles.confirmButton,
            isConfirming && styles.confirmButtonBusy,
          ]}
          onPress={handleConfirmPayment}
          disabled={isConfirming}
        >
          {isConfirming ? (
            <ActivityIndicator color={colors.onAccent} size="small" />
          ) : (
            <Text style={styles.confirmButtonText}>Confirm Payment</Text>
          )}
        </Pressable>
      </View>

      {/* --- Remove card confirmation sheet --- */}
      <Modal
        transparent
        visible={!!pendingRemoveCard}
        animationType="slide"
        onRequestClose={() => setPendingRemoveCard(null)}
      >
        <View style={styles.sheetBackdrop}>
          <View style={styles.sheetCard}>
            <Text style={styles.sheetTitle}>Remove Card?</Text>

            <View style={styles.sheetDivider} />

            {pendingRemoveCard && (
              <View style={styles.sheetCardRow}>
                <View style={styles.rowIconCircle}>
                  {getSavedCardIcon(pendingRemoveCard)}
                </View>

                <Text style={styles.sheetCardLabel}>
                  •••• {pendingRemoveCard.lastFour}
                </Text>
              </View>
            )}

            <Text style={styles.sheetWarning}>This can&apos;t be undone.</Text>

            <View style={styles.sheetActionsRow}>
              <Pressable
                style={styles.sheetCancelButton}
                onPress={() => setPendingRemoveCard(null)}
              >
                <Text style={styles.sheetCancelText}>Cancel</Text>
              </Pressable>

              <Pressable
                style={styles.sheetConfirmButton}
                onPress={confirmRemoveCard}
              >
                <Text style={styles.sheetConfirmText}>Yes, Remove</Text>
              </Pressable>
            </View>
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

    listContent: {
      paddingHorizontal: 24,
      paddingBottom: 20,
    },

    sectionLabel: {
      fontFamily: Fonts.semiBold,
      fontSize: 14,
      color: colors.textPrimary,
      marginTop: 16,
      marginBottom: 12,
    },

    row: {
      flexDirection: "row",
      alignItems: "center",
      gap: 14,
      backgroundColor: colors.cardBackground,
      borderRadius: 16,
      padding: 14,
      marginBottom: 10,
    },

    rowIconCircle: {
      width: 38,
      height: 38,
      borderRadius: 19,
      backgroundColor: colors.background,
      alignItems: "center",
      justifyContent: "center",
    },

    rowLabel: {
      flex: 1,
      fontFamily: Fonts.medium,
      fontSize: 14,
      color: colors.textPrimary,
    },

    removeCardButton: {
      padding: 4,
      marginRight: 4,
    },

    // Saved Visa logo
    savedVisaLogo: {
      width: 28,
      height: 22,
    },

    // Saved Mastercard logo
    savedMastercardLogo: {
      width: 28,
      height: 22,
    },

    radioOuter: {
      width: 22,
      height: 22,
      borderRadius: 11,
      borderWidth: 1.5,
      borderColor: colors.outline,
      alignItems: "center",
      justifyContent: "center",
    },

    radioOuterActive: {
      borderColor: colors.accent,
    },

    radioInner: {
      width: 12,
      height: 12,
      borderRadius: 6,
      backgroundColor: colors.accent,
    },

    addCardRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: 14,
      borderRadius: 16,
      borderWidth: 1,
      borderStyle: "dashed",
      borderColor: colors.outline,
      padding: 14,
      marginBottom: 10,
    },

    footer: {
      paddingHorizontal: 24,
      paddingTop: 12,
      paddingBottom: 50,
    },

    confirmButton: {
      backgroundColor: colors.accent,
      borderRadius: 28,
      paddingVertical: 16,
      alignItems: "center",
      justifyContent: "center",
    },

    confirmButtonBusy: {
      opacity: 0.7,
    },

    confirmButtonText: {
      fontFamily: Fonts.semiBold,
      fontSize: 15,
      color: colors.onAccent,
    },

    // --- Remove card confirmation sheet ---
    sheetBackdrop: {
      flex: 1,
      backgroundColor: "rgba(0, 0, 0, 0.5)",
      justifyContent: "flex-end",
    },

    sheetCard: {
      backgroundColor: colors.background,
      borderTopLeftRadius: 28,
      borderTopRightRadius: 28,
      paddingHorizontal: 24,
      paddingTop: 20,
      paddingBottom: 50,
    },

    sheetTitle: {
      fontFamily: Fonts.bold,
      fontSize: 18,
      color: colors.textPrimary,
      textAlign: "center",
      marginBottom: 16,
    },

    sheetDivider: {
      height: 1,
      backgroundColor: colors.outline,
      marginBottom: 16,
    },

    sheetCardRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: 14,
      marginBottom: 16,
    },

    sheetCardLabel: {
      fontFamily: Fonts.semiBold,
      fontSize: 15,
      color: colors.textPrimary,
    },

    sheetWarning: {
      fontFamily: Fonts.regular,
      fontSize: 13,
      color: colors.textMuted,
      textAlign: "center",
      marginBottom: 20,
    },

    sheetActionsRow: {
      flexDirection: "row",
      gap: 12,
    },

    sheetCancelButton: {
      flex: 1,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: colors.cardBackground,
      borderRadius: 28,
      paddingVertical: 16,
    },

    sheetCancelText: {
      fontFamily: Fonts.semiBold,
      fontSize: 15,
      color: colors.textPrimary,
    },

    sheetConfirmButton: {
      flex: 1,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: colors.accent,
      borderRadius: 28,
      paddingVertical: 16,
    },

    sheetConfirmText: {
      fontFamily: Fonts.semiBold,
      fontSize: 15,
      color: colors.onAccent,
    },
  });
}
