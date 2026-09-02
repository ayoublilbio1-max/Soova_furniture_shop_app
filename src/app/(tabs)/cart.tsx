// My Cart tab — line items with quantity steppers and swipe-to-delete,
// promo code entry, totals summary, and the entry point into checkout.

import { CartSkeleton } from "@/components/ui/cart-skeleton";
import { RemoteImage } from "@/components/ui/remote-image";
import { ThemeColors } from "@/constants/colors";
import { Fonts } from "@/constants/fonts";
import { buildCartLines, calculateTotals, CartLine } from "@/data/cart-helpers";
import { categories } from "@/data/categories";
import { useDeferredReady } from "@/hooks/use-deferred-ready";
import { useThemeColors } from "@/hooks/use-theme-colors";
import { useCartStore } from "@/store/cart-store";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useMemo, useRef, useState } from "react";
import {
  ActivityIndicator,
  Animated,
  FlatList,
  InteractionManager,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View
} from "react-native";
import { Swipeable } from "react-native-gesture-handler";

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

function getCategoryLabel(categoryId: string) {
  const match = categories.find((c) => c.id === categoryId);
  if (match) return match.name;
  // Sofa subtypes aren't top-level categories, so fall back to a readable
  // version of the raw id rather than showing "one_seater_sofa".
  return categoryId
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

// --- Single cart line: image, name, category, price, quantity stepper ---
function CartRow({
  line,
  colors,
  styles,
  onIncrease,
  onDecrease,
  onRequestRemove,
  onPress,
}: {
  line: CartLine;
  colors: ThemeColors;
  styles: ReturnType<typeof getStyles>;
  onIncrease: () => void;
  onDecrease: () => void;
  onRequestRemove: () => void;
  onPress: () => void;
}) {
  const swipeableRef = useRef<Swipeable>(null);

  function renderRightActions() {
    return (
      <Pressable
        style={styles.swipeDeleteAction}
        onPress={() => {
          swipeableRef.current?.close();
          onRequestRemove();
        }}
      >
        <Ionicons name="trash" size={22} color="#FFFFFF" />
      </Pressable>
    );
  }

  return (
    <Swipeable
      ref={swipeableRef}
      renderRightActions={renderRightActions}
      overshootRight={false}
    >
      <Pressable style={styles.row} onPress={onPress}>
        <RemoteImage
          uri={line.product.thumbPath}
          fallbackUri={line.product.fallbackThumbPath}
          style={styles.rowImage}
        />

        <View style={styles.rowContent}>
          <Text style={styles.rowTitle} numberOfLines={2}>
            {line.product.name}
          </Text>
          <Text style={styles.rowCategory}>
            {getCategoryLabel(line.product.category)}
          </Text>
          <Text style={styles.rowPrice}>${line.product.price.toFixed(2)}</Text>
        </View>

        <View style={styles.stepper}>
          <Pressable style={styles.stepperButton} onPress={onDecrease}>
            <Ionicons name="remove" size={16} color={colors.textPrimary} />
          </Pressable>
          <Text style={styles.stepperValue}>{line.quantity}</Text>
          <Pressable
            style={[styles.stepperButton, styles.stepperButtonAccent]}
            onPress={onIncrease}
          >
            <Ionicons name="add" size={16} color={colors.onAccent} />
          </Pressable>
        </View>
      </Pressable>
    </Swipeable>
  );
}

export default function Cart() {
  const colors = useThemeColors();
  const styles = getStyles(colors);
  const ready = useDeferredReady();

  const items = useCartStore((s) => s.items);
  const hasHydrated = useCartStore((s) => s.hasHydrated);
  const selectedShippingTypeId = useCartStore((s) => s.selectedShippingTypeId);
  const appliedPromo = useCartStore((s) => s.appliedPromo);
  const collectedSpecialOfferIds = useCartStore(
    (s) => s.collectedSpecialOfferIds,
  );
  const setQuantity = useCartStore((s) => s.setQuantity);
  const removeFromCart = useCartStore((s) => s.removeFromCart);
  const applyPromo = useCartStore((s) => s.applyPromo);
  const clearPromo = useCartStore((s) => s.clearPromo);

  const [promoInput, setPromoInput] = useState("");
  const [promoError, setPromoError] = useState<string | null>(null);
  const [isApplyingPromo, setIsApplyingPromo] = useState(false);
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const [pendingRemovalId, setPendingRemovalId] = useState<string | null>(null);

  const lines = useMemo(() => buildCartLines(items), [items]);
  const totals = useMemo(
    () =>
      calculateTotals(
        lines,
        selectedShippingTypeId,
        appliedPromo,
        collectedSpecialOfferIds,
      ),
    [lines, selectedShippingTypeId, appliedPromo, collectedSpecialOfferIds],
  );

  const pendingRemovalLine = lines.find(
    (l) => l.product.id === pendingRemovalId,
  );

  function handleDecrease(line: CartLine) {
    // At quantity 1, decreasing means removing — ask first rather than
    // silently dropping the item.
    if (line.quantity <= 1) {
      setPendingRemovalId(line.product.id);
      return;
    }
    setQuantity(line.product.id, line.quantity - 1);
  }

  function handleApplyPromo() {
    if (isApplyingPromo) return;
    setIsApplyingPromo(true);
    setPromoError(null);

    const success = applyPromo(promoInput);
    if (success) {
      setPromoInput("");
    } else {
      setPromoError("That code isn't valid.");
    }

    setIsApplyingPromo(false);
  }

  function handleCheckout() {
    if (isCheckingOut || lines.length === 0) return;
    setIsCheckingOut(true);

    router.push("/checkout");

    InteractionManager.runAfterInteractions(() => {
      setIsCheckingOut(false);
    });
  }

  function confirmRemoval() {
    if (!pendingRemovalId) return;
    removeFromCart(pendingRemovalId);
    setPendingRemovalId(null);
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
      {/* --- Header --- */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>My Cart</Text>
        {lines.length > 0 && (
          <Text style={styles.headerCount}>
            {lines.length} {lines.length === 1 ? "item" : "items"}
          </Text>
        )}
      </View>

      {lines.length === 0 ? (
        <View style={styles.emptyState}>
          <Ionicons name="cart-outline" size={44} color={colors.textMuted} />
          <Text style={styles.emptyTitle}>Your cart is empty</Text>
          <Text style={styles.emptyText}>
            Browse the shop and add something you love.
          </Text>
          <Pressable
            style={styles.emptyButton}
            onPress={() => router.push("/shop")}
          >
            <Text style={styles.emptyButtonText}>Start Shopping</Text>
          </Pressable>
        </View>
      ) : (
        <>
          <FlatList
            data={lines}
            keyExtractor={(line) => line.product.id}
            contentContainerStyle={styles.listContent}
            renderItem={({ item }) => (
              <CartRow
                line={item}
                colors={colors}
                styles={styles}
                onIncrease={() =>
                  setQuantity(item.product.id, item.quantity + 1)
                }
                onDecrease={() => handleDecrease(item)}
                onRequestRemove={() => setPendingRemovalId(item.product.id)}
                onPress={() =>
                  router.push({
                    pathname: "/product-details",
                    params: { id: item.product.id },
                  })
                }
              />
            )}
          />

          {/* --- Promo + totals + checkout --- */}
          <View style={styles.summaryCard}>
            <View style={styles.promoRow}>
              {appliedPromo ? (
                <View style={styles.appliedPromoPill}>
                  <Ionicons name="pricetag" size={14} color={colors.accent} />
                  <Text style={styles.appliedPromoText}>
                    {appliedPromo.code} applied
                  </Text>
                  <Pressable onPress={clearPromo} hitSlop={8}>
                    <Ionicons name="close" size={16} color={colors.textMuted} />
                  </Pressable>
                </View>
              ) : (
                <>
                  <TextInput
                    style={styles.promoInput}
                    placeholder="Promo Code"
                    placeholderTextColor={colors.textMuted}
                    value={promoInput}
                    onChangeText={(text) => {
                      setPromoInput(text);
                      setPromoError(null);
                    }}
                    autoCapitalize="characters"
                  />
                  <Pressable
                    style={[
                      styles.promoApplyButton,
                      isApplyingPromo && styles.buttonBusy,
                    ]}
                    onPress={handleApplyPromo}
                    disabled={isApplyingPromo}
                  >
                    {isApplyingPromo ? (
                      <ActivityIndicator color={colors.onAccent} size="small" />
                    ) : (
                      <Text style={styles.promoApplyText}>Apply</Text>
                    )}
                  </Pressable>
                </>
              )}
            </View>

            {promoError && <Text style={styles.promoError}>{promoError}</Text>}

            <View style={styles.totalsBlock}>
              <View style={styles.totalRow}>
                <Text style={styles.totalLabel}>Sub-Total</Text>
                <Text style={styles.totalValue}>
                  ${totals.subTotal.toFixed(2)}
                </Text>
              </View>
              <View style={styles.totalRow}>
                <Text style={styles.totalLabel}>Delivery Fee</Text>
                <Text style={styles.totalValue}>
                  ${totals.deliveryFee.toFixed(2)}
                </Text>
              </View>
              <View style={styles.totalRow}>
                <Text style={styles.totalLabel}>Tax</Text>
                <Text style={styles.totalValue}>${totals.tax.toFixed(2)}</Text>
              </View>
              {totals.discount > 0 && (
                <View style={styles.totalRow}>
                  <Text style={styles.totalLabel}>Discount</Text>
                  <Text style={styles.discountValue}>
                    -${totals.discount.toFixed(2)}
                  </Text>
                </View>
              )}

              <View style={styles.totalsDivider} />

              <View style={styles.totalRow}>
                <Text style={styles.grandTotalLabel}>Total Cost</Text>
                <Text style={styles.grandTotalValue}>
                  ${totals.total.toFixed(2)}
                </Text>
              </View>
            </View>

            <Pressable
              style={[
                styles.checkoutButton,
                isCheckingOut && styles.buttonBusy,
              ]}
              onPress={handleCheckout}
              disabled={isCheckingOut}
            >
              {isCheckingOut ? (
                <ActivityIndicator color={colors.onAccent} size="small" />
              ) : (
                <Text style={styles.checkoutButtonText}>
                  Proceed to Checkout
                </Text>
              )}
            </Pressable>
          </View>
        </>
      )}

      {/* --- Remove confirmation sheet --- */}
      <Modal
        transparent
        visible={!!pendingRemovalId}
        animationType="slide"
        onRequestClose={() => setPendingRemovalId(null)}
      >
        <View style={styles.sheetBackdrop}>
          <View style={styles.sheetCard}>
            <Text style={styles.sheetTitle}>Remove from Cart?</Text>
            <View style={styles.sheetDivider} />

            {pendingRemovalLine && (
              <View style={styles.sheetItemRow}>
                <RemoteImage
                  uri={pendingRemovalLine.product.thumbPath}
                  fallbackUri={pendingRemovalLine.product.fallbackThumbPath}
                  style={styles.sheetItemImage}
                />
                <View style={styles.rowContent}>
                  <Text style={styles.rowTitle} numberOfLines={2}>
                    {pendingRemovalLine.product.name}
                  </Text>
                  <Text style={styles.rowCategory}>
                    {getCategoryLabel(pendingRemovalLine.product.category)}
                  </Text>
                  <Text style={styles.rowPrice}>
                    ${pendingRemovalLine.product.price.toFixed(2)}
                  </Text>
                </View>
              </View>
            )}

            <View style={styles.sheetActionsRow}>
              <Pressable
                style={styles.sheetCancelButton}
                onPress={() => setPendingRemovalId(null)}
              >
                <Text style={styles.sheetCancelText}>Cancel</Text>
              </Pressable>
              <Pressable
                style={styles.sheetConfirmButton}
                onPress={confirmRemoval}
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
    screen: {
      flex: 1,
      backgroundColor: colors.background,
    },
    header: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      paddingHorizontal: 24,
      paddingTop: 60,
      marginBottom: 20,
    },
    headerTitle: {
      fontFamily: Fonts.bold,
      fontSize: 22,
      color: colors.textPrimary,
    },
    headerCount: {
      fontFamily: Fonts.medium,
      fontSize: 13,
      color: colors.textMuted,
    },

    listContent: {
      paddingHorizontal: 24,
      paddingBottom: 20,
    },

    // --- Cart row ---
    row: {
      flexDirection: "row",
      alignItems: "center",
      gap: 12,
      backgroundColor: colors.background,
      paddingVertical: 12,
    },
    rowImage: {
      width: 90,
      height: 90,
      borderRadius: 16,
      backgroundColor: colors.cardBackground,
    },
    rowContent: {
      flex: 1,
    },
    rowTitle: {
      fontFamily: Fonts.semiBold,
      fontSize: 14,
      color: colors.textPrimary,
      marginBottom: 2,
    },
    rowCategory: {
      fontFamily: Fonts.regular,
      fontSize: 12,
      color: colors.textMuted,
      marginBottom: 6,
    },
    rowPrice: {
      fontFamily: Fonts.bold,
      fontSize: 15,
      color: colors.accent,
    },

    // --- Quantity stepper ---
    stepper: {
      flexDirection: "row",
      alignItems: "center",
      gap: 8,
    },
    stepperButton: {
      width: 30,
      height: 30,
      borderRadius: 10,
      backgroundColor: colors.cardBackground,
      alignItems: "center",
      justifyContent: "center",
    },
    stepperButtonAccent: {
      backgroundColor: colors.accent,
    },
    stepperValue: {
      fontFamily: Fonts.semiBold,
      fontSize: 14,
      color: colors.textPrimary,
      minWidth: 16,
      textAlign: "center",
    },

    swipeDeleteAction: {
      width: 52,
      backgroundColor: colors.roseRed,
      alignItems: "center",
      justifyContent: "center",
      borderRadius: 16,
      marginVertical: 12,
      marginHorizontal: 10,
    },

    // --- Summary card ---
    summaryCard: {
      backgroundColor: colors.cardBackground,
      borderTopLeftRadius: 28,
      borderTopRightRadius: 28,
      paddingHorizontal: 24,
      paddingTop: 20,
      paddingBottom: 28,
    },
    promoRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: 10,
      marginBottom: 4,
    },
    promoInput: {
      flex: 1,
      backgroundColor: colors.background,
      borderRadius: 24,
      paddingHorizontal: 18,
      height: 48,
      fontFamily: Fonts.regular,
      fontSize: 14,
      color: colors.textPrimary,
    },
    promoApplyButton: {
      backgroundColor: colors.accent,
      borderRadius: 24,
      paddingHorizontal: 24,
      height: 48,
      alignItems: "center",
      justifyContent: "center",
      minWidth: 96,
    },
    promoApplyText: {
      fontFamily: Fonts.semiBold,
      fontSize: 14,
      color: colors.onAccent,
    },
    appliedPromoPill: {
      flexDirection: "row",
      alignItems: "center",
      gap: 8,
      backgroundColor: colors.background,
      borderRadius: 24,
      paddingHorizontal: 18,
      height: 48,
      flex: 1,
    },
    appliedPromoText: {
      flex: 1,
      fontFamily: Fonts.semiBold,
      fontSize: 14,
      color: colors.accent,
    },
    promoError: {
      fontFamily: Fonts.medium,
      fontSize: 12,
      color: colors.roseRed,
      marginTop: 8,
      marginLeft: 4,
    },

    totalsBlock: {
      marginTop: 20,
      marginBottom: 20,
    },
    totalRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: 10,
    },
    totalLabel: {
      fontFamily: Fonts.regular,
      fontSize: 14,
      color: colors.textMuted,
    },
    totalValue: {
      fontFamily: Fonts.semiBold,
      fontSize: 14,
      color: colors.textPrimary,
    },
    discountValue: {
      fontFamily: Fonts.semiBold,
      fontSize: 14,
      color: colors.accent,
    },
    totalsDivider: {
      height: 1,
      borderStyle: "dashed",
      borderWidth: 1,
      borderColor: colors.outline,
      marginTop: 4,
      marginBottom: 14,
    },
    grandTotalLabel: {
      fontFamily: Fonts.bold,
      fontSize: 16,
      color: colors.textPrimary,
    },
    grandTotalValue: {
      fontFamily: Fonts.bold,
      fontSize: 18,
      color: colors.accent,
    },

    checkoutButton: {
      backgroundColor: colors.accent,
      borderRadius: 32,
      paddingVertical: 18,
      alignItems: "center",
      justifyContent: "center",
    },
    checkoutButtonText: {
      fontFamily: Fonts.semiBold,
      fontSize: 16,
      color: colors.onAccent,
    },
    buttonBusy: {
      opacity: 0.7,
    },

    // --- Empty state ---
    emptyState: {
      flex: 1,
      alignItems: "center",
      justifyContent: "center",
      gap: 10,
      paddingHorizontal: 40,
    },
    emptyTitle: {
      fontFamily: Fonts.bold,
      fontSize: 18,
      color: colors.textPrimary,
      marginTop: 6,
    },
    emptyText: {
      fontFamily: Fonts.regular,
      fontSize: 14,
      color: colors.textMuted,
      textAlign: "center",
      marginBottom: 10,
    },
    emptyButton: {
      backgroundColor: colors.accent,
      borderRadius: 28,
      paddingVertical: 14,
      paddingHorizontal: 32,
    },
    emptyButtonText: {
      fontFamily: Fonts.semiBold,
      fontSize: 15,
      color: colors.onAccent,
    },

    // --- Remove confirmation sheet ---
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
    sheetItemRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: 12,
      marginBottom: 24,
    },
    sheetItemImage: {
      width: 80,
      height: 80,
      borderRadius: 16,
      backgroundColor: colors.cardBackground,
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
