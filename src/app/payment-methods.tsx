// Payment Methods screen — Cash, saved cards, and (demo, unconnected)
// PayPal/Apple Pay/Google Pay options, shown via a styled modal instead of a
// plain Alert. Reached two ways:
// - From Checkout (no "mode" param): Confirm Payment runs the real purchase
//   flow — snapshots the order (placeOrder), clears the cart, navigates to
//   payment-success. Confirm has a deliberate short delay so it doesn't read
//   as fake.
// - From Account (?mode=manage): "Save Payment Method" just saves the
//   selection and shows a brief success banner — no fake purchase, no
//   navigation away.

import { ThemeColors } from "@/constants/colors";
import { Fonts } from "@/constants/fonts";
import { useThemeColors } from "@/hooks/use-theme-colors";
import { PaymentMethodId, SavedCard, useCartStore } from "@/store/cart-store";
import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import { useState } from "react";
import {
  ActivityIndicator,
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
const SAVE_DELAY_MS = 600;

type DemoModalInfo = {
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
  color: string;
};

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
  const params = useLocalSearchParams<{ mode?: string }>();
  const isManageMode = params.mode === "manage";

  const savedCards = useCartStore((s) => s.savedCards);

  const selectedPaymentMethod = useCartStore((s) => s.selectedPaymentMethod);

  const selectPaymentMethod = useCartStore((s) => s.selectPaymentMethod);

  const removeCard = useCartStore((s) => s.removeCard);

  const placeOrder = useCartStore((s) => s.placeOrder);

  const [draftSelection, setDraftSelection] = useState<PaymentMethodId>(
    selectedPaymentMethod,
  );

  const [isConfirming, setIsConfirming] = useState(false);
  const [saveSuccessVisible, setSaveSuccessVisible] = useState(false);

  // --- Styled remove-card confirmation ---
  const [pendingRemoveCard, setPendingRemoveCard] = useState<SavedCard | null>(
    null,
  );

  // --- Styled demo-limitation modal (replaces the old Alert) ---
  const [demoModal, setDemoModal] = useState<DemoModalInfo | null>(null);

  function openDemoModal(info: DemoModalInfo) {
    setDemoModal(info);
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

    if (isManageMode) {
      setTimeout(() => {
        setIsConfirming(false);
        setSaveSuccessVisible(true);
        setTimeout(() => setSaveSuccessVisible(false), 2000);
      }, SAVE_DELAY_MS);
      return;
    }

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
      {saveSuccessVisible && (
        <View style={styles.banner}>
          <Ionicons name="checkmark-circle" size={20} color={colors.onAccent} />
          <Text style={styles.bannerText}>Payment method saved.</Text>
        </View>
      )}

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
          onPress={() =>
            openDemoModal({
              label: "PayPal",
              icon: "logo-paypal",
              color: "#003087",
            })
          }
        />

        <PaymentRow
          icon={
            <Ionicons name="logo-apple" size={20} color={colors.textPrimary} />
          }
          label="Apple Pay"
          selected={false}
          colors={colors}
          styles={styles}
          onPress={() =>
            openDemoModal({
              label: "Apple Pay",
              icon: "logo-apple",
              color: colors.textPrimary,
            })
          }
        />

        <PaymentRow
          icon={<Ionicons name="logo-google" size={20} color="#4285F4" />}
          label="Google Pay"
          selected={false}
          colors={colors}
          styles={styles}
          onPress={() =>
            openDemoModal({
              label: "Google Pay",
              icon: "logo-google",
              color: "#4285F4",
            })
          }
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
            <Text style={styles.confirmButtonText}>
              {isManageMode ? "Save Payment Method" : "Confirm Payment"}
            </Text>
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

      {/* --- Demo-limitation modal for PayPal / Apple Pay / Google Pay —
      centered dialog, not a bottom sheet like the remove-card confirm --- */}
      <Modal
        transparent
        visible={!!demoModal}
        animationType="fade"
        onRequestClose={() => setDemoModal(null)}
      >
        <Pressable
          style={styles.demoBackdrop}
          onPress={() => setDemoModal(null)}
        >
          <Pressable style={styles.demoModalCard} onPress={() => {}}>
            <View style={styles.demoIconCircle}>
              {demoModal && (
                <Ionicons
                  name={demoModal.icon}
                  size={28}
                  color={demoModal.color}
                />
              )}
            </View>
            <Text style={styles.demoModalTitle}>{demoModal?.label}</Text>
            <Text style={styles.demoModalBody}>
              Soova is a portfolio demonstration, so this payment method
              isn&apos;t connected to a live provider. Cash and saved cards are
              fully functional for the demo.
            </Text>
            <Pressable
              style={styles.demoGotItButton}
              onPress={() => setDemoModal(null)}
            >
              <Text style={styles.demoGotItText}>Got It</Text>
            </Pressable>
          </Pressable>
        </Pressable>
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

    banner: {
      position: "absolute",
      top: 50,
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

    // --- Demo-limitation modal (PayPal / Apple Pay / Google Pay) — centered ---
    demoBackdrop: {
      flex: 1,
      backgroundColor: "rgba(0, 0, 0, 0.5)",
      justifyContent: "center",
      alignItems: "center",
      paddingHorizontal: 24,
    },

    demoModalCard: {
      width: "100%",
      backgroundColor: colors.background,
      borderRadius: 24,
      paddingHorizontal: 24,
      paddingTop: 32,
      paddingBottom: 32,
      alignItems: "center",
    },

    demoIconCircle: {
      width: 64,
      height: 64,
      borderRadius: 32,
      backgroundColor: colors.cardBackground,
      alignItems: "center",
      justifyContent: "center",
      marginBottom: 16,
    },

    demoModalTitle: {
      fontFamily: Fonts.bold,
      fontSize: 18,
      color: colors.textPrimary,
      marginBottom: 8,
    },

    demoModalBody: {
      fontFamily: Fonts.medium,
      fontSize: 14,
      color: colors.textMuted,
      textAlign: "center",
      marginBottom: 28,
    },

    demoGotItButton: {
      width: "100%",
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: colors.accent,
      borderRadius: 28,
      paddingVertical: 16,
    },

    demoGotItText: {
      fontFamily: Fonts.semiBold,
      fontSize: 15,
      color: colors.onAccent,
    },
  });
}
