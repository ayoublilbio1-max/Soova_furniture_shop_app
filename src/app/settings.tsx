// Settings screen — reached from Account > "Settings". Notification
// preference toggles, a "Reset Demo Data" utility for showing the app fresh
// without reinstalling, Delete Account (destructive, red), and app info.
//
// Reset Demo Data currently clears cart/orders/saved cards/addresses only
// (cart-store). Delete Account clears that plus profile identity
// (profile-store) and logs out. Wishlist, recent searches, and notification
// history aren't cleared yet — those stores weren't available when this
// screen was built. Extend resetStore()/resetProfile() calls below once
// their store files are on hand.

import { ThemeColors } from "@/constants/colors";
import { Fonts } from "@/constants/fonts";
import { useThemeColors } from "@/hooks/use-theme-colors";
import { useCartStore } from "@/store/cart-store";
import { useProfileStore } from "@/store/profile-store";
import { useSettingsStore } from "@/store/settings-store";
import { Ionicons } from "@expo/vector-icons";
import Constants from "expo-constants";
import { router } from "expo-router";
import { useState } from "react";
import {
    Modal,
    Platform,
    Pressable,
    ScrollView,
    StyleSheet,
    Switch,
    Text,
    View,
} from "react-native";

type ConfirmKind = "reset" | "delete" | null;

export default function Settings() {
  const colors = useThemeColors();
  const styles = getStyles(colors);

  const pushEnabled = useSettingsStore((s) => s.pushEnabled);
  const orderUpdates = useSettingsStore((s) => s.orderUpdates);
  const promotions = useSettingsStore((s) => s.promotions);
  const newArrivals = useSettingsStore((s) => s.newArrivals);
  const setPreference = useSettingsStore((s) => s.setPreference);

  const resetCartStore = useCartStore((s) => s.resetStore);
  const resetProfile = useProfileStore((s) => s.resetProfile);

  const [confirmVisible, setConfirmVisible] = useState<ConfirmKind>(null);
  const [successVisible, setSuccessVisible] = useState(false);

  function handleResetDemoData() {
    resetCartStore();
    setConfirmVisible(null);
    setSuccessVisible(true);
    setTimeout(() => setSuccessVisible(false), 2200);
  }

  function handleDeleteAccount() {
    resetCartStore();
    resetProfile();
    setConfirmVisible(null);
    router.replace("/sign-in");
  }

  const appVersion = Constants.expoConfig?.version ?? "1.0.0";

  return (
    <View style={styles.container}>
      {successVisible && (
        <View style={styles.banner}>
          <Ionicons name="checkmark-circle" size={20} color={colors.onAccent} />
          <Text style={styles.bannerText}>Demo data reset.</Text>
        </View>
      )}

      <View style={styles.header}>
        <Pressable style={styles.backButton} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={22} color={colors.textPrimary} />
        </Pressable>
        <Text style={styles.headerTitle}>Settings</Text>
        <View style={styles.backButton} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* --- Notifications --- */}
        <Text style={styles.sectionLabel}>Notifications</Text>
        <View style={styles.card}>
          <View style={styles.toggleRow}>
            <View style={styles.toggleTextWrapper}>
              <Text style={styles.toggleLabel}>Push Notifications</Text>
              <Text style={styles.toggleHint}>
                Master switch for all alerts
              </Text>
            </View>
            <Switch
              value={pushEnabled}
              onValueChange={(value) => setPreference("pushEnabled", value)}
              trackColor={{ false: colors.outline, true: colors.accent }}
              thumbColor="#FFFFFF"
            />
          </View>

          <View style={styles.toggleDivider} />

          <View
            style={[styles.toggleRow, !pushEnabled && styles.toggleRowDisabled]}
          >
            <View style={styles.toggleTextWrapper}>
              <Text style={styles.toggleLabel}>Order Updates</Text>
            </View>
            <Switch
              value={orderUpdates && pushEnabled}
              onValueChange={(value) => setPreference("orderUpdates", value)}
              disabled={!pushEnabled}
              trackColor={{ false: colors.outline, true: colors.accent }}
              thumbColor="#FFFFFF"
            />
          </View>

          <View
            style={[styles.toggleRow, !pushEnabled && styles.toggleRowDisabled]}
          >
            <View style={styles.toggleTextWrapper}>
              <Text style={styles.toggleLabel}>Promotions & Deals</Text>
            </View>
            <Switch
              value={promotions && pushEnabled}
              onValueChange={(value) => setPreference("promotions", value)}
              disabled={!pushEnabled}
              trackColor={{ false: colors.outline, true: colors.accent }}
              thumbColor="#FFFFFF"
            />
          </View>

          <View
            style={[styles.toggleRow, !pushEnabled && styles.toggleRowDisabled]}
          >
            <View style={styles.toggleTextWrapper}>
              <Text style={styles.toggleLabel}>New Arrivals</Text>
            </View>
            <Switch
              value={newArrivals && pushEnabled}
              onValueChange={(value) => setPreference("newArrivals", value)}
              disabled={!pushEnabled}
              trackColor={{ false: colors.outline, true: colors.accent }}
              thumbColor="#FFFFFF"
            />
          </View>
        </View>

        {/* --- Demo utilities --- */}
        <Text style={styles.sectionLabel}>Demo</Text>
        <Pressable
          style={styles.rowCard}
          onPress={() => setConfirmVisible("reset")}
        >
          <View style={styles.rowIconCircle}>
            <Ionicons name="refresh-outline" size={20} color={colors.accent} />
          </View>
          <View style={styles.toggleTextWrapper}>
            <Text style={styles.toggleLabel}>Reset Demo Data</Text>
            <Text style={styles.toggleHint}>
              Clears cart, orders, and saved cards
            </Text>
          </View>
          <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />
        </Pressable>

        {/* --- Account --- */}
        <Text style={styles.sectionLabel}>Account</Text>
        <Pressable
          style={styles.rowCard}
          onPress={() => setConfirmVisible("delete")}
        >
          <View style={[styles.rowIconCircle, styles.dangerIconCircle]}>
            <Ionicons name="trash-outline" size={20} color={colors.roseRed} />
          </View>
          <View style={styles.toggleTextWrapper}>
            <Text style={[styles.toggleLabel, styles.dangerText]}>
              Delete Account
            </Text>
            <Text style={styles.toggleHint}>
              Erases your profile and shopping data
            </Text>
          </View>
          <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />
        </Pressable>

        {/* --- About --- */}
        <Text style={styles.sectionLabel}>About</Text>
        <View style={styles.card}>
          <View style={styles.aboutRow}>
            <Text style={styles.toggleLabel}>App Version</Text>
            <Text style={styles.aboutValue}>{appVersion}</Text>
          </View>
          <View style={styles.toggleDivider} />
          <View style={styles.aboutRow}>
            <Text style={styles.toggleLabel}>Platform</Text>
            <Text style={styles.aboutValue}>
              {Platform.OS === "ios" ? "iOS" : "Android"}
            </Text>
          </View>
        </View>
      </ScrollView>

      {/* --- Reset Demo Data confirmation --- */}
      <Modal
        transparent
        visible={confirmVisible === "reset"}
        animationType="slide"
        onRequestClose={() => setConfirmVisible(null)}
      >
        <View style={styles.sheetBackdrop}>
          <View style={styles.sheetCard}>
            <Text style={styles.sheetTitle}>Reset Demo Data?</Text>
            <View style={styles.sheetDivider} />
            <Text style={styles.sheetBody}>
              This clears your cart, order history, saved cards, and addresses.
              Your profile stays as-is. This can&apos;t be undone.
            </Text>
            <View style={styles.sheetActionsRow}>
              <Pressable
                style={styles.sheetCancelButton}
                onPress={() => setConfirmVisible(null)}
              >
                <Text style={styles.sheetCancelText}>Cancel</Text>
              </Pressable>
              <Pressable
                style={styles.sheetConfirmButton}
                onPress={handleResetDemoData}
              >
                <Text style={styles.sheetConfirmText}>Yes, Reset</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>

      {/* --- Delete Account confirmation --- */}
      <Modal
        transparent
        visible={confirmVisible === "delete"}
        animationType="slide"
        onRequestClose={() => setConfirmVisible(null)}
      >
        <View style={styles.sheetBackdrop}>
          <View style={styles.sheetCard}>
            <Text style={[styles.sheetTitle, styles.dangerText]}>
              Delete Account?
            </Text>
            <View style={styles.sheetDivider} />
            <Text style={styles.sheetBody}>
              This erases your profile info, cart, orders, and saved payment
              methods on this device, then signs you out. This can&apos;t be
              undone.
            </Text>
            <View style={styles.sheetActionsRow}>
              <Pressable
                style={styles.sheetCancelButton}
                onPress={() => setConfirmVisible(null)}
              >
                <Text style={styles.sheetCancelText}>Cancel</Text>
              </Pressable>
              <Pressable
                style={styles.sheetDangerButton}
                onPress={handleDeleteAccount}
              >
                <Text style={styles.sheetConfirmText}>Yes, Delete</Text>
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
    scrollContent: {
      paddingHorizontal: 24,
      paddingBottom: 50,
    },
    sectionLabel: {
      fontFamily: Fonts.semiBold,
      fontSize: 14,
      color: colors.textPrimary,
      marginBottom: 10,
      marginTop: 8,
    },
    card: {
      backgroundColor: colors.cardBackground,
      borderRadius: 16,
      padding: 14,
      marginBottom: 24,
    },
    toggleRow: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      paddingVertical: 10,
    },
    toggleRowDisabled: {
      opacity: 0.5,
    },
    toggleTextWrapper: {
      flex: 1,
      gap: 2,
      paddingRight: 12,
    },
    toggleLabel: {
      fontFamily: Fonts.medium,
      fontSize: 14,
      color: colors.textPrimary,
    },
    toggleHint: {
      fontFamily: Fonts.regular,
      fontSize: 12,
      color: colors.textMuted,
    },
    toggleDivider: {
      height: 1,
      backgroundColor: colors.outline,
    },
    rowCard: {
      flexDirection: "row",
      alignItems: "center",
      gap: 14,
      backgroundColor: colors.cardBackground,
      borderRadius: 16,
      padding: 14,
      marginBottom: 24,
    },
    rowIconCircle: {
      width: 38,
      height: 38,
      borderRadius: 19,
      backgroundColor: colors.background,
      alignItems: "center",
      justifyContent: "center",
    },
    dangerIconCircle: {
      backgroundColor: colors.background,
    },
    dangerText: {
      color: colors.roseRed,
    },
    aboutRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      paddingVertical: 10,
    },
    aboutValue: {
      fontFamily: Fonts.regular,
      fontSize: 14,
      color: colors.textMuted,
    },

    // --- Confirmation sheets ---
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
    sheetBody: {
      fontFamily: Fonts.regular,
      fontSize: 13,
      lineHeight: 19,
      color: colors.textMuted,
      textAlign: "center",
      marginBottom: 24,
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
    sheetDangerButton: {
      flex: 1,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: colors.roseRed,
      borderRadius: 28,
      paddingVertical: 16,
    },
    sheetConfirmText: {
      fontFamily: Fonts.semiBold,
      fontSize: 15,
      color: "#FFFFFF",
    },
  });
}
