// Review Summary screen — order breakdown, reached via Payment Success'
// "View Order" button. Reads from the order snapshot (lastOrder) rather
// than the live cart, since the cart clears right after payment — this
// screen needs to keep showing the order that was actually placed.

import { CartSkeleton } from "@/components/ui/cart-skeleton";
import { RemoteImage } from "@/components/ui/remote-image";
import { ThemeColors } from "@/constants/colors";
import { Fonts } from "@/constants/fonts";
import {
  buildCartLines,
  calculateTotals,
  getShippingType,
} from "@/data/cart-helpers";
import { categories } from "@/data/categories";
import { useDeferredReady } from "@/hooks/use-deferred-ready";
import { useThemeColors } from "@/hooks/use-theme-colors";
import { useCartStore } from "@/store/cart-store";
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

function formatOrderDate(isoString: string) {
  const date = new Date(isoString);
  const datePart = date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
  const timePart = date.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
  });
  return `${datePart} | ${timePart}`;
}

export default function ReviewSummary() {
  const colors = useThemeColors();
  const styles = getStyles(colors);
  const ready = useDeferredReady();

  const lastOrder = useCartStore((s) => s.lastOrder);
  const hasHydrated = useCartStore((s) => s.hasHydrated);

  const [isContinuing, setIsContinuing] = useState(false);

  const lines = useMemo(
    () => (lastOrder ? buildCartLines(lastOrder.items) : []),
    [lastOrder],
  );
  const totals = useMemo(
    () =>
      lastOrder
        ? calculateTotals(lines, lastOrder.shippingTypeId, lastOrder.promo)
        : null,
    [lines, lastOrder],
  );
  const shippingType = lastOrder
    ? getShippingType(lastOrder.shippingTypeId)
    : null;

  function handleContinue() {
    if (isContinuing) return;
    setIsContinuing(true);

    router.push("/e-receipt");

    InteractionManager.runAfterInteractions(() => {
      setIsContinuing(false);
    });
  }

  if (!ready || !hasHydrated) {
    return (
      <View style={styles.screen}>
        <CartSkeleton />
      </View>
    );
  }

  if (!lastOrder || !totals || !shippingType) {
    return (
      <View style={styles.screen}>
        <View style={styles.header}>
          <Pressable style={styles.backButton} onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={22} color={colors.textPrimary} />
          </Pressable>
          <Text style={styles.headerTitle}>Review Summary</Text>
          <View style={styles.backButton} />
        </View>
        <View style={styles.emptyState}>
          <Ionicons name="receipt-outline" size={40} color={colors.textMuted} />
          <Text style={styles.emptyText}>No completed order to show yet</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.screen}>
      <View style={styles.header}>
        <Pressable style={styles.backButton} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={22} color={colors.textPrimary} />
        </Pressable>
        <Text style={styles.headerTitle}>Review Summary</Text>
        <View style={styles.backButton} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {lines.map((line) => (
          <View key={line.product.id} style={styles.itemRow}>
            <RemoteImage
              uri={line.product.thumbPath}
              fallbackUri={line.product.fallbackThumbPath}
              style={styles.itemImage}
            />
            <View style={styles.itemTextWrapper}>
              <View style={styles.itemTitleRow}>
                <Text style={styles.itemName} numberOfLines={1}>
                  {line.product.name}
                </Text>
                <View style={styles.itemRating}>
                  <Ionicons name="star" size={12} color="#F5A623" />
                  <Text style={styles.itemRatingText}>
                    {line.product.rating.toFixed(1)}
                  </Text>
                </View>
              </View>
              <Text style={styles.itemCategory}>
                {getCategoryLabel(line.product.category)}
              </Text>
              <Text style={styles.itemPriceQty}>
                ${line.product.price.toFixed(2)} | Qty. {line.quantity}
              </Text>
            </View>
          </View>
        ))}

        <View style={styles.detailsBlock}>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Order Date</Text>
            <Text style={styles.detailValue}>
              {formatOrderDate(lastOrder.placedAt)}
            </Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Promo code</Text>
            <Text style={styles.detailValue}>
              {lastOrder.promo ? lastOrder.promo.code : "—"}
            </Text>
          </View>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Delivery Type</Text>
            <Text style={styles.detailValue}>{shippingType.name}</Text>
          </View>
        </View>

        <View style={styles.totalsBlock}>
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Amount</Text>
            <Text style={styles.totalValue}>${totals.subTotal.toFixed(2)}</Text>
          </View>
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Delivery Charge</Text>
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
            <Text style={styles.grandTotalLabel}>Total</Text>
            <Text style={styles.grandTotalValue}>
              ${totals.total.toFixed(2)}
            </Text>
          </View>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <Pressable
          style={[
            styles.continueButton,
            isContinuing && styles.continueButtonDisabled,
          ]}
          onPress={handleContinue}
          disabled={isContinuing}
        >
          {isContinuing ? (
            <ActivityIndicator color={colors.onAccent} size="small" />
          ) : (
            <Text style={styles.continueButtonText}>Continue</Text>
          )}
        </Pressable>
      </View>
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

    // --- Item rows ---
    itemRow: {
      flexDirection: "row",
      gap: 14,
      marginBottom: 20,
    },
    itemImage: {
      width: 72,
      height: 72,
      borderRadius: 14,
      backgroundColor: colors.cardBackground,
    },
    itemTextWrapper: {
      flex: 1,
      justifyContent: "center",
    },
    itemTitleRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: 2,
    },
    itemName: {
      flex: 1,
      fontFamily: Fonts.semiBold,
      fontSize: 14,
      color: colors.textPrimary,
      marginRight: 8,
    },
    itemRating: {
      flexDirection: "row",
      alignItems: "center",
      gap: 3,
    },
    itemRatingText: {
      fontFamily: Fonts.medium,
      fontSize: 12,
      color: colors.textMuted,
    },
    itemCategory: {
      fontFamily: Fonts.regular,
      fontSize: 12,
      color: colors.textMuted,
      marginBottom: 4,
    },
    itemPriceQty: {
      fontFamily: Fonts.bold,
      fontSize: 14,
      color: colors.textPrimary,
    },

    // --- Order details ---
    detailsBlock: {
      backgroundColor: colors.cardBackground,
      borderRadius: 16,
      padding: 16,
      marginTop: 4,
      marginBottom: 20,
    },
    detailRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      marginBottom: 10,
    },
    detailLabel: {
      fontFamily: Fonts.regular,
      fontSize: 13,
      color: colors.textMuted,
    },
    detailValue: {
      fontFamily: Fonts.semiBold,
      fontSize: 13,
      color: colors.textPrimary,
    },

    // --- Totals ---
    totalsBlock: {
      marginBottom: 20,
    },
    totalRow: {
      flexDirection: "row",
      justifyContent: "space-between",
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
      fontSize: 20,
      color: colors.accent,
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

    emptyState: {
      flex: 1,
      alignItems: "center",
      justifyContent: "center",
      gap: 12,
      paddingHorizontal: 40,
    },
    emptyText: {
      fontFamily: Fonts.medium,
      fontSize: 14,
      color: colors.textMuted,
      textAlign: "center",
    },
  });
}
