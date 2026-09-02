// Checkout screen — shipping address (with a live Change link to
// /shipping-address), shipping type selection, and the order list summary.
// Continue to Payment leads to Payment Methods, where the order is actually
// placed — Review Summary/E-Receipt only have data once that happens.

import { CartSkeleton } from "@/components/ui/cart-skeleton";
import { RemoteImage } from "@/components/ui/remote-image";
import { ThemeColors } from "@/constants/colors";
import { Fonts } from "@/constants/fonts";
import {
  buildCartLines,
  formatAddress,
  getEstimatedArrival,
} from "@/data/cart-helpers";
import { useDeferredReady } from "@/hooks/use-deferred-ready";
import { useThemeColors } from "@/hooks/use-theme-colors";
import { SHIPPING_TYPES, ShippingType, useCartStore } from "@/store/cart-store";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useMemo, useState } from "react";
import {
  ActivityIndicator,
  InteractionManager,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";

const CHANGE_SHIPPING_TYPE_DELAY_MS = 300;

// --- Single shipping type option, radio-select style ---
function ShippingTypeRow({
  type,
  selected,
  colors,
  styles,
  onPress,
}: {
  type: ShippingType;
  selected: boolean;
  colors: ThemeColors;
  styles: ReturnType<typeof getStyles>;
  onPress: () => void;
}) {
  const arrival = useMemo(() => getEstimatedArrival(type.id), [type.id]);
  const arrivalLabel = arrival.toLocaleDateString("en-US", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  return (
    <Pressable style={styles.shippingRow} onPress={onPress}>
      <View style={styles.shippingIconCircle}>
        <Ionicons name="cube-outline" size={18} color={colors.accent} />
      </View>
      <View style={styles.shippingTextWrapper}>
        <Text style={styles.shippingName}>{type.name}</Text>
        <Text style={styles.shippingDetail}>
          Estimated Arrival {arrivalLabel} · ${type.fee.toFixed(2)}
        </Text>
      </View>
      <View style={[styles.radioOuter, selected && styles.radioOuterActive]}>
        {selected && <View style={styles.radioInner} />}
      </View>
    </Pressable>
  );
}

export default function Checkout() {
  const colors = useThemeColors();
  const styles = getStyles(colors);
  const ready = useDeferredReady();

  const items = useCartStore((s) => s.items);
  const addresses = useCartStore((s) => s.addresses);
  const selectedAddressId = useCartStore((s) => s.selectedAddressId);
  const selectedShippingTypeId = useCartStore((s) => s.selectedShippingTypeId);
  const selectShippingType = useCartStore((s) => s.selectShippingType);
  const hasHydrated = useCartStore((s) => s.hasHydrated);

  const [shippingTypeModalVisible, setShippingTypeModalVisible] =
    useState(false);
  const [isContinuing, setIsContinuing] = useState(false);

  // --- Busy states for the two "Change" actions, so each tap is
  // acknowledged immediately rather than the UI just jumping. ---
  const [isChangingAddress, setIsChangingAddress] = useState(false);
  const [isChangingShippingType, setIsChangingShippingType] = useState(false);

  const lines = useMemo(() => buildCartLines(items), [items]);
  const selectedAddress = addresses.find((a) => a.id === selectedAddressId);
  const selectedShippingType =
    SHIPPING_TYPES.find((t) => t.id === selectedShippingTypeId) ??
    SHIPPING_TYPES[0];
  const arrival = useMemo(
    () => getEstimatedArrival(selectedShippingTypeId),
    [selectedShippingTypeId],
  );
  const arrivalLabel = arrival.toLocaleDateString("en-US", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  function handleContinue() {
    if (isContinuing) return;
    setIsContinuing(true);

    // Payment Methods is the next real step — it's where placeOrder()
    // actually runs and lastOrder gets set. Review Summary/E-Receipt read
    // from that snapshot, so they must never be reached before payment.
    router.push("/payment-methods");

    InteractionManager.runAfterInteractions(() => {
      setIsContinuing(false);
    });
  }

  function handleChangeAddress() {
    if (isChangingAddress) return;
    setIsChangingAddress(true);

    router.push("/shipping-address");

    InteractionManager.runAfterInteractions(() => {
      setIsChangingAddress(false);
    });
  }

  function handleChangeShippingType() {
    if (isChangingShippingType) return;
    setIsChangingShippingType(true);

    // Opening the picker is near-instant (it's a local bottom sheet, not a
    // navigation), but a brief deliberate delay still confirms the tap was
    // registered rather than the sheet just appearing with no feedback.
    setTimeout(() => {
      setShippingTypeModalVisible(true);
      setIsChangingShippingType(false);
    }, CHANGE_SHIPPING_TYPE_DELAY_MS);
  }

  if (!ready || !hasHydrated) {
    return (
      <View style={styles.screen}>
        <CartSkeleton />
      </View>
    );
  }

  return (
    <View style={styles.screen}>
      <View style={styles.header}>
        <Pressable style={styles.backButton} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={22} color={colors.textPrimary} />
        </Pressable>
        <Text style={styles.headerTitle}>Checkout</Text>
        <View style={styles.backButton} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* --- Shipping address --- */}
        <View style={styles.sectionHeaderRow}>
          <Text style={styles.sectionTitle}>Shipping Address</Text>
        </View>

        {selectedAddress ? (
          <View style={styles.addressCard}>
            <View style={styles.addressIconCircle}>
              <Ionicons name="location" size={18} color={colors.accent} />
            </View>
            <View style={styles.addressTextWrapper}>
              <Text style={styles.addressLabel}>{selectedAddress.label}</Text>
              <Text style={styles.addressDetail}>
                {formatAddress(
                  selectedAddress.street,
                  selectedAddress.city,
                  selectedAddress.state,
                  selectedAddress.zip,
                )}
              </Text>
            </View>
            <Pressable
              style={styles.changeButton}
              onPress={handleChangeAddress}
              disabled={isChangingAddress}
            >
              {isChangingAddress ? (
                <ActivityIndicator color={colors.accent} size="small" />
              ) : (
                <Text style={styles.changeLink}>CHANGE</Text>
              )}
            </Pressable>
          </View>
        ) : (
          <Pressable
            style={styles.noAddressCard}
            onPress={() => router.push("/shipping-address")}
          >
            <Ionicons
              name="add-circle-outline"
              size={20}
              color={colors.accent}
            />
            <Text style={styles.noAddressText}>Add a shipping address</Text>
          </Pressable>
        )}

        {/* --- Shipping type --- */}
        <View style={styles.sectionHeaderRow}>
          <Text style={styles.sectionTitle}>Choose Shipping Type</Text>
        </View>

        <View style={styles.shippingSummaryCard}>
          <View style={styles.shippingIconCircle}>
            <Ionicons name="cube-outline" size={18} color={colors.accent} />
          </View>
          <View style={styles.shippingTextWrapper}>
            <Text style={styles.shippingName}>{selectedShippingType.name}</Text>
            <Text style={styles.shippingDetail}>
              Estimated Arrival {arrivalLabel}
            </Text>
          </View>
          <Pressable
            style={styles.changeButton}
            onPress={handleChangeShippingType}
            disabled={isChangingShippingType}
          >
            {isChangingShippingType ? (
              <ActivityIndicator color={colors.accent} size="small" />
            ) : (
              <Text style={styles.changeLink}>CHANGE</Text>
            )}
          </Pressable>
        </View>

        {/* --- Order list --- */}
        <View style={styles.sectionHeaderRow}>
          <Text style={styles.sectionTitle}>Order List</Text>
        </View>

        {lines.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="cart-outline" size={36} color={colors.textMuted} />
            <Text style={styles.emptyText}>Your cart is empty</Text>
          </View>
        ) : (
          lines.map((line) => (
            <View key={line.product.id} style={styles.orderRow}>
              <RemoteImage
                uri={line.product.thumbPath}
                fallbackUri={line.product.fallbackThumbPath}
                style={styles.orderImage}
              />
              <View style={styles.orderTextWrapper}>
                <Text style={styles.orderName} numberOfLines={2}>
                  {line.product.name}
                </Text>
                <Text style={styles.orderCategory}>Qty {line.quantity}</Text>
                <Text style={styles.orderPrice}>
                  ${line.product.price.toFixed(2)}
                </Text>
              </View>
            </View>
          ))
        )}
      </ScrollView>

      <View style={styles.footer}>
        <Pressable
          style={[
            styles.continueButton,
            (isContinuing || lines.length === 0 || !selectedAddress) &&
              styles.continueButtonDisabled,
          ]}
          onPress={handleContinue}
          disabled={isContinuing || lines.length === 0 || !selectedAddress}
        >
          {isContinuing ? (
            <ActivityIndicator color={colors.onAccent} size="small" />
          ) : (
            <Text style={styles.continueButtonText}>Continue to Payment</Text>
          )}
        </Pressable>
      </View>

      {/* --- Shipping type picker --- */}
      {shippingTypeModalVisible && (
        <View style={styles.shippingModalBackdrop}>
          <Pressable
            style={StyleSheet.absoluteFill}
            onPress={() => setShippingTypeModalVisible(false)}
          />
          <View style={styles.shippingModalCard}>
            <Text style={styles.modalTitle}>Choose Shipping Type</Text>
            {SHIPPING_TYPES.map((type) => (
              <ShippingTypeRow
                key={type.id}
                type={type}
                selected={type.id === selectedShippingTypeId}
                colors={colors}
                styles={styles}
                onPress={() => {
                  selectShippingType(type.id);
                  setShippingTypeModalVisible(false);
                }}
              />
            ))}
          </View>
        </View>
      )}
    </View>
  );
}

function getStyles(colors: ThemeColors) {
  return StyleSheet.create({
    screen: {
      flex: 1,
      backgroundColor: colors.background,
    },
    header: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      paddingHorizontal: 24,
      paddingTop: 60,
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
    sectionHeaderRow: {
      marginBottom: 12,
      marginTop: 4,
    },
    sectionTitle: {
      fontFamily: Fonts.bold,
      fontSize: 16,
      color: colors.textPrimary,
    },

    // --- Address card ---
    addressCard: {
      flexDirection: "row",
      alignItems: "center",
      gap: 14,
      backgroundColor: colors.cardBackground,
      borderRadius: 16,
      padding: 14,
      marginBottom: 24,
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
      fontSize: 12,
      lineHeight: 17,
      color: colors.textMuted,
    },
    changeButton: {
      minWidth: 52,
      alignItems: "flex-end",
      justifyContent: "center",
    },
    changeLink: {
      fontFamily: Fonts.semiBold,
      fontSize: 12,
      color: colors.accent,
    },
    noAddressCard: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: 10,
      borderRadius: 16,
      borderWidth: 1,
      borderStyle: "dashed",
      borderColor: colors.outline,
      paddingVertical: 18,
      marginBottom: 24,
    },
    noAddressText: {
      fontFamily: Fonts.semiBold,
      fontSize: 14,
      color: colors.accent,
    },

    // --- Shipping type ---
    shippingSummaryCard: {
      flexDirection: "row",
      alignItems: "center",
      gap: 14,
      backgroundColor: colors.cardBackground,
      borderRadius: 16,
      padding: 14,
      marginBottom: 24,
    },
    shippingRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: 14,
      backgroundColor: colors.cardBackground,
      borderRadius: 16,
      padding: 14,
      marginBottom: 10,
    },
    shippingIconCircle: {
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: colors.background,
      alignItems: "center",
      justifyContent: "center",
    },
    shippingTextWrapper: {
      flex: 1,
    },
    shippingName: {
      fontFamily: Fonts.semiBold,
      fontSize: 15,
      color: colors.textPrimary,
      marginBottom: 4,
    },
    shippingDetail: {
      fontFamily: Fonts.regular,
      fontSize: 12,
      color: colors.textMuted,
    },
    radioOuter: {
      width: 20,
      height: 20,
      borderRadius: 10,
      borderWidth: 1.5,
      borderColor: colors.outline,
      alignItems: "center",
      justifyContent: "center",
    },
    radioOuterActive: {
      borderColor: colors.accent,
    },
    radioInner: {
      width: 11,
      height: 11,
      borderRadius: 6,
      backgroundColor: colors.accent,
    },

    // --- Order list ---
    orderRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: 14,
      marginBottom: 16,
    },
    orderImage: {
      width: 72,
      height: 72,
      borderRadius: 14,
      backgroundColor: colors.cardBackground,
    },
    orderTextWrapper: {
      flex: 1,
    },
    orderName: {
      fontFamily: Fonts.semiBold,
      fontSize: 14,
      color: colors.textPrimary,
      marginBottom: 2,
    },
    orderCategory: {
      fontFamily: Fonts.regular,
      fontSize: 12,
      color: colors.textMuted,
      marginBottom: 4,
    },
    orderPrice: {
      fontFamily: Fonts.bold,
      fontSize: 14,
      color: colors.accent,
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

    footer: {
      paddingHorizontal: 24,
      paddingTop: 12,
      paddingBottom: 50,
    },
    continueButton: {
      backgroundColor: colors.accent,
      borderRadius: 28,
      paddingVertical: 16,
      alignItems: "center",
      justifyContent: "center",
    },
    continueButtonDisabled: {
      opacity: 0.6,
    },
    continueButtonText: {
      fontFamily: Fonts.semiBold,
      fontSize: 15,
      color: colors.onAccent,
    },

    // --- Shipping type picker ---
    shippingModalBackdrop: {
      position: "absolute",
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: "rgba(0, 0, 0, 0.5)",
      justifyContent: "flex-end",
    },
    shippingModalCard: {
      backgroundColor: colors.background,
      borderTopLeftRadius: 24,
      borderTopRightRadius: 24,
      padding: 24,
      paddingBottom: 40,
    },
    modalTitle: {
      fontFamily: Fonts.bold,
      fontSize: 17,
      color: colors.textPrimary,
      marginBottom: 16,
    },
  });
}
