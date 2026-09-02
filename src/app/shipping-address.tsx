// Shipping Address screen — pick a saved address (radio select) or add a
// new one. Reached from Checkout's "Change" link and from Payment Methods'
// flow. The selection lives in the cart store, so it's shared across the
// whole checkout flow.

import { ThemeColors } from "@/constants/colors";
import { Fonts } from "@/constants/fonts";
import { formatAddress } from "@/data/cart-helpers";
import { useThemeColors } from "@/hooks/use-theme-colors";
import { ShippingAddress, useCartStore } from "@/store/cart-store";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useState } from "react";
import {
  ActivityIndicator,
  InteractionManager,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

// --- Single saved address row, radio-select style ---
function AddressRow({
  address,
  selected,
  colors,
  styles,
  onPress,
  onDelete,
}: {
  address: ShippingAddress;
  selected: boolean;
  colors: ThemeColors;
  styles: ReturnType<typeof getStyles>;
  onPress: () => void;
  onDelete: () => void;
}) {
  return (
    <Pressable style={styles.addressRow} onPress={onPress}>
      <View style={styles.addressIconCircle}>
        <Ionicons name="location" size={18} color={colors.accent} />
      </View>
      <View style={styles.addressTextWrapper}>
        <Text style={styles.addressLabel}>{address.label}</Text>
        <Text style={styles.addressDetail}>
          {formatAddress(
            address.street,
            address.city,
            address.state,
            address.zip,
          )}
        </Text>
      </View>
      <Pressable hitSlop={8} style={styles.deleteButton} onPress={onDelete}>
        <Ionicons name="trash-outline" size={16} color={colors.textMuted} />
      </Pressable>
      <View style={[styles.radioOuter, selected && styles.radioOuterActive]}>
        {selected && <View style={styles.radioInner} />}
      </View>
    </Pressable>
  );
}

export default function ShippingAddressScreen() {
  const colors = useThemeColors();
  const styles = getStyles(colors);

  const addresses = useCartStore((s) => s.addresses);
  const selectedAddressId = useCartStore((s) => s.selectedAddressId);
  const selectAddress = useCartStore((s) => s.selectAddress);
  const addAddress = useCartStore((s) => s.addAddress);
  const deleteAddress = useCartStore((s) => s.deleteAddress);

  const [draftSelection, setDraftSelection] = useState(selectedAddressId);
  const [isApplying, setIsApplying] = useState(false);

  const [addModalVisible, setAddModalVisible] = useState(false);
  const [label, setLabel] = useState("");
  const [street, setStreet] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [zip, setZip] = useState("");

  // --- Delete confirmation sheet state — replaces the plain OS Alert with
  // a styled sheet matching the rest of the app (same pattern as removing
  // a cart item or a wishlist list). ---
  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null);
  const pendingDeleteAddress = addresses.find((a) => a.id === pendingDeleteId);

  function resetAddForm() {
    setLabel("");
    setStreet("");
    setCity("");
    setState("");
    setZip("");
  }

  function handleSaveNewAddress() {
    if (
      !label.trim() ||
      !street.trim() ||
      !city.trim() ||
      !state.trim() ||
      !zip.trim()
    ) {
      return;
    }
    const newId = addAddress({
      label: label.trim(),
      street: street.trim(),
      city: city.trim(),
      state: state.trim(),
      zip: zip.trim(),
    });
    setDraftSelection(newId);
    setAddModalVisible(false);
    resetAddForm();
  }

  function confirmDeleteAddress() {
    if (!pendingDeleteId) return;
    deleteAddress(pendingDeleteId);
    if (draftSelection === pendingDeleteId) {
      setDraftSelection(null);
    }
    setPendingDeleteId(null);
  }

  function handleApply() {
    if (isApplying || !draftSelection) return;
    setIsApplying(true);

    selectAddress(draftSelection);
    router.back();

    InteractionManager.runAfterInteractions(() => {
      setIsApplying(false);
    });
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Pressable style={styles.backButton} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={22} color={colors.textPrimary} />
        </Pressable>
        <Text style={styles.headerTitle}>Shipping Address</Text>
        <View style={styles.backButton} />
      </View>

      <ScrollView contentContainerStyle={styles.listContent}>
        {addresses.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons
              name="location-outline"
              size={36}
              color={colors.textMuted}
            />
            <Text style={styles.emptyText}>No saved addresses yet</Text>
          </View>
        ) : (
          addresses.map((address) => (
            <AddressRow
              key={address.id}
              address={address}
              selected={draftSelection === address.id}
              colors={colors}
              styles={styles}
              onPress={() => setDraftSelection(address.id)}
              onDelete={() => setPendingDeleteId(address.id)}
            />
          ))
        )}

        <Pressable
          style={styles.addAddressButton}
          onPress={() => setAddModalVisible(true)}
        >
          <Ionicons name="add" size={18} color={colors.accent} />
          <Text style={styles.addAddressText}>Add New Shipping Address</Text>
        </Pressable>
      </ScrollView>

      <View style={styles.footer}>
        <Pressable
          style={[
            styles.applyButton,
            (isApplying || !draftSelection) && styles.applyButtonDisabled,
          ]}
          onPress={handleApply}
          disabled={isApplying || !draftSelection}
        >
          {isApplying ? (
            <ActivityIndicator color={colors.onAccent} size="small" />
          ) : (
            <Text style={styles.applyButtonText}>Apply</Text>
          )}
        </Pressable>
      </View>

      {/* --- Add new address modal --- */}
      <Modal
        transparent
        visible={addModalVisible}
        animationType="slide"
        onRequestClose={() => setAddModalVisible(false)}
      >
        <View style={styles.modalBackdrop}>
          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>New Address</Text>
              <Pressable onPress={() => setAddModalVisible(false)}>
                <Ionicons name="close" size={22} color={colors.textPrimary} />
              </Pressable>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              <Text style={styles.fieldLabel}>Label</Text>
              <TextInput
                style={styles.input}
                placeholder="e.g. Home, Office"
                placeholderTextColor={colors.textMuted}
                value={label}
                onChangeText={setLabel}
              />

              <Text style={styles.fieldLabel}>Street</Text>
              <TextInput
                style={styles.input}
                placeholder="123 Main St."
                placeholderTextColor={colors.textMuted}
                value={street}
                onChangeText={setStreet}
              />

              <Text style={styles.fieldLabel}>City</Text>
              <TextInput
                style={styles.input}
                placeholder="City"
                placeholderTextColor={colors.textMuted}
                value={city}
                onChangeText={setCity}
              />

              <View style={styles.fieldRow}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.fieldLabel}>State</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="State"
                    placeholderTextColor={colors.textMuted}
                    value={state}
                    onChangeText={setState}
                  />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.fieldLabel}>ZIP</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="ZIP"
                    placeholderTextColor={colors.textMuted}
                    keyboardType="number-pad"
                    value={zip}
                    onChangeText={setZip}
                  />
                </View>
              </View>
            </ScrollView>

            <Pressable
              style={styles.saveAddressButton}
              onPress={handleSaveNewAddress}
            >
              <Text style={styles.saveAddressText}>Save Address</Text>
            </Pressable>
          </View>
        </View>
      </Modal>

      {/* --- Delete confirmation sheet --- */}
      <Modal
        transparent
        visible={!!pendingDeleteId}
        animationType="slide"
        onRequestClose={() => setPendingDeleteId(null)}
      >
        <View style={styles.sheetBackdrop}>
          <View style={styles.sheetCard}>
            <Text style={styles.sheetTitle}>Delete Address?</Text>
            <View style={styles.sheetDivider} />

            {pendingDeleteAddress && (
              <View style={styles.sheetAddressRow}>
                <View style={styles.addressIconCircle}>
                  <Ionicons name="location" size={18} color={colors.accent} />
                </View>
                <View style={styles.addressTextWrapper}>
                  <Text style={styles.addressLabel}>
                    {pendingDeleteAddress.label}
                  </Text>
                  <Text style={styles.addressDetail}>
                    {formatAddress(
                      pendingDeleteAddress.street,
                      pendingDeleteAddress.city,
                      pendingDeleteAddress.state,
                      pendingDeleteAddress.zip,
                    )}
                  </Text>
                </View>
              </View>
            )}

            <Text style={styles.sheetWarning}>This can&apos;t be undone.</Text>

            <View style={styles.sheetActionsRow}>
              <Pressable
                style={styles.sheetCancelButton}
                onPress={() => setPendingDeleteId(null)}
              >
                <Text style={styles.sheetCancelText}>Cancel</Text>
              </Pressable>
              <Pressable
                style={styles.sheetConfirmButton}
                onPress={confirmDeleteAddress}
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
    emptyState: {
      alignItems: "center",
      justifyContent: "center",
      paddingVertical: 40,
      gap: 10,
    },
    emptyText: {
      fontFamily: Fonts.medium,
      fontSize: 14,
      color: colors.textMuted,
    },

    addressRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: 14,
      backgroundColor: colors.cardBackground,
      borderRadius: 16,
      padding: 16,
      marginBottom: 12,
    },
    addressIconCircle: {
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: colors.background,
      alignItems: "center",
      justifyContent: "center",
    },
    addressTextWrapper: {
      flex: 1,
    },
    addressLabel: {
      fontFamily: Fonts.semiBold,
      fontSize: 15,
      color: colors.textPrimary,
      marginBottom: 4,
    },
    addressDetail: {
      fontFamily: Fonts.regular,
      fontSize: 13,
      lineHeight: 18,
      color: colors.textMuted,
    },
    deleteButton: {
      padding: 4,
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

    addAddressButton: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: 8,
      borderRadius: 16,
      borderWidth: 1,
      borderStyle: "dashed",
      borderColor: colors.outline,
      paddingVertical: 16,
      marginTop: 4,
    },
    addAddressText: {
      fontFamily: Fonts.semiBold,
      fontSize: 14,
      color: colors.accent,
    },

    footer: {
      paddingHorizontal: 24,
      paddingTop: 12,
      paddingBottom: 50,
    },
    applyButton: {
      backgroundColor: colors.accent,
      borderRadius: 28,
      paddingVertical: 16,
      alignItems: "center",
      justifyContent: "center",
    },
    applyButtonDisabled: {
      opacity: 0.6,
    },
    applyButtonText: {
      fontFamily: Fonts.semiBold,
      fontSize: 15,
      color: colors.onAccent,
    },

    // --- Add address modal ---
    modalBackdrop: {
      flex: 1,
      backgroundColor: "rgba(0, 0, 0, 0.5)",
      justifyContent: "flex-end",
    },
    modalCard: {
      backgroundColor: colors.background,
      borderTopLeftRadius: 24,
      borderTopRightRadius: 24,
      padding: 24,
      paddingBottom: 50,
    },
    modalHeader: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: 20,
    },
    modalTitle: {
      fontFamily: Fonts.bold,
      fontSize: 18,
      color: colors.textPrimary,
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
      marginBottom: 16,
    },
    fieldRow: {
      flexDirection: "row",
      gap: 12,
    },
    saveAddressButton: {
      backgroundColor: colors.accent,
      borderRadius: 28,
      paddingVertical: 16,
      alignItems: "center",
      marginTop: 8,
    },
    saveAddressText: {
      fontFamily: Fonts.semiBold,
      fontSize: 15,
      color: colors.onAccent,
    },

    // --- Delete confirmation sheet ---
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
    sheetAddressRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: 14,
      marginBottom: 16,
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
