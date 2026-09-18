// E-Receipt screen — same order snapshot as Review Summary, styled as a
// receipt with a generated barcode pattern above the items. "Download
// E-Receipt" generates a real PDF (via expo-print) and opens the native
// share/save sheet (via expo-sharing) — requires a dev build with those
// two packages compiled in.
//
// The barcode is a deterministic bar pattern seeded from the order id —
// not a real scannable barcode (no barcode library or real backend behind
// it), just a visual match for the reference design.
//
// Cash on Delivery orders haven't actually been paid yet, so this screen
// (and the generated PDF) swap "E-Receipt"/"Total" for "Order Summary"/
// "Amount Due", and show a pay-on-delivery note instead of implying money
// already changed hands.

import { CartSkeleton } from "@/components/ui/cart-skeleton";
import { RemoteImage } from "@/components/ui/remote-image";
import { ThemeColors } from "@/constants/colors";
import { Fonts } from "@/constants/fonts";
import { buildCartLines, getShippingType } from "@/data/cart-helpers";
import { categories } from "@/data/categories";
import { useDeferredReady } from "@/hooks/use-deferred-ready";
import { useThemeColors } from "@/hooks/use-theme-colors";
import { useCartStore } from "@/store/cart-store";
import { Ionicons } from "@expo/vector-icons";
import * as Print from "expo-print";
import { router } from "expo-router";
import * as Sharing from "expo-sharing";
import { useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";

function formatPaymentMethod(
  method: string,
  savedCards: { id: string; lastFour: string }[],
) {
  if (method === "cash") return "Cash On Delivery";
  if (method === "paypal") return "PayPal";
  if (method === "apple-pay") return "Apple Pay";
  if (method === "google-pay") return "Google Pay";

  if (method.startsWith("card:")) {
    const cardId = method.slice("card:".length);
    const card = savedCards.find((c) => c.id === cardId);
    return card ? `Card •••• ${card.lastFour}` : "Card";
  }

  return method;
}

function getCategoryLabel(categoryId: string) {
  const match = categories.find((c) => c.id === categoryId);
  if (match) return match.name;
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

// --- Deterministic pseudo-random generator, seeded from the order id, so
// the barcode pattern is stable across re-renders rather than reshuffling. ---
function seededRandom(seed: number) {
  let value = seed;
  return () => {
    value = (value * 1103515245 + 12345) & 0x7fffffff;
    return value / 0x7fffffff;
  };
}

function hashString(input: string) {
  let hash = 0;
  for (let i = 0; i < input.length; i++) {
    hash = (hash * 31 + input.charCodeAt(i)) & 0x7fffffff;
  }
  return hash;
}

function Barcode({
  orderId,
  colors,
}: {
  orderId: string;
  colors: ThemeColors;
}) {
  const bars = useMemo(() => {
    const random = seededRandom(hashString(orderId));
    return Array.from({ length: 48 }, () => (random() > 0.5 ? 3 : 1.5));
  }, [orderId]);

  return (
    <View style={barcodeStyles.row}>
      {bars.map((width, i) => (
        <View
          key={i}
          style={{
            width,
            height: 60,
            backgroundColor: colors.textPrimary,
            marginRight: 2,
          }}
        />
      ))}
    </View>
  );
}

const barcodeStyles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
  },
});

export default function EReceipt() {
  const colors = useThemeColors();
  const s = getStyles(colors);
  const ready = useDeferredReady();

  const lastOrder = useCartStore((s) => s.lastOrder);
  const addresses = useCartStore((s) => s.addresses);
  const savedCards = useCartStore((s) => s.savedCards);
  const hasHydrated = useCartStore((s) => s.hasHydrated);

  const [isDownloading, setIsDownloading] = useState(false);

  const isCashOnDelivery = lastOrder?.paymentMethod === "cash";
  const screenTitle = isCashOnDelivery ? "Order Summary" : "E-Receipt";

  const lines = useMemo(
    () => (lastOrder ? buildCartLines(lastOrder.items) : []),
    [lastOrder],
  );
  const totals = lastOrder?.totals ?? null;
  const shippingType = lastOrder
    ? getShippingType(lastOrder.shippingTypeId)
    : null;
  const address = lastOrder
    ? addresses.find((a) => a.id === lastOrder.addressId)
    : undefined;
  const paymentMethodLabel = lastOrder
    ? formatPaymentMethod(lastOrder.paymentMethod, savedCards)
    : null;

  // --- Builds the printable HTML for this order. Kept plain/inline-styled
  // since expo-print renders through a basic HTML engine, not a full
  // browser — no external stylesheets or web fonts. ---
  function buildReceiptHtml(): string {
    if (!lastOrder || !totals || !shippingType) return "";

    const itemRows = lines
      .map(
        (line) => `
          <tr>
            <td style="padding:8px 0;">${line.product.name}<br/>
              <span style="color:#888;font-size:12px;">${getCategoryLabel(
                line.product.category,
              )}</span>
            </td>
            <td style="padding:8px 0;text-align:center;">${line.quantity}</td>
            <td style="padding:8px 0;text-align:right;">$${line.product.price.toFixed(
              2,
            )}</td>
          </tr>`,
      )
      .join("");

    const addressLine = address
      ? `${address.street} ${address.city}, ${address.state} ${address.zip}`
      : "—";

    const pdfTitle = isCashOnDelivery
      ? "Soova — Order Summary"
      : "Soova — E-Receipt";

    return `
      <html>
        <head><meta charset="utf-8" /></head>
        <body style="font-family: Helvetica, Arial, sans-serif; padding: 24px; color: #2B1D14;">
          <h1 style="font-size: 20px; margin-bottom: 4px;">${pdfTitle}</h1>
          <p style="color:#888; font-size: 12px; margin-top: 0;">Order ${lastOrder.id}</p>
          ${
            isCashOnDelivery
              ? `<p style="background:#FDF3E7; padding:10px 14px; border-radius:8px; font-size:13px; margin:16px 0;">Payment due on delivery — pay in cash when your order arrives.</p>`
              : ""
          }

          <table style="width:100%; border-collapse: collapse; margin: 20px 0;">
            <thead>
              <tr style="border-bottom: 1px solid #ddd; text-align:left;">
                <th style="padding-bottom:8px;">Item</th>
                <th style="padding-bottom:8px; text-align:center;">Qty</th>
                <th style="padding-bottom:8px; text-align:right;">Price</th>
              </tr>
            </thead>
            <tbody>${itemRows}</tbody>
          </table>

          <table style="width:100%; font-size: 13px; margin-bottom: 20px;">
            <tr><td style="color:#888;">Order Date</td><td style="text-align:right;">${formatOrderDate(
              lastOrder.placedAt,
            )}</td></tr>
            <tr><td style="color:#888;">Shipping Address</td><td style="text-align:right;">${addressLine}</td></tr>
            <tr><td style="color:#888;">Delivery Type</td><td style="text-align:right;">${shippingType.name}</td></tr>
            <tr><td style="color:#888;">Promo Code</td><td style="text-align:right;">${
              lastOrder.promo ? lastOrder.promo.code : "—"
            }</td></tr>
            <tr><td style="color:#888;">Payment Method</td><td style="text-align:right;">${formatPaymentMethod(
              lastOrder.paymentMethod,
              savedCards,
            )}</td></tr>
          </table>

          <table style="width:100%; font-size: 14px;">
            <tr><td style="padding:4px 0;">Amount</td><td style="text-align:right;">$${totals.subTotal.toFixed(
              2,
            )}</td></tr>
            <tr><td style="padding:4px 0;">Delivery Charge</td><td style="text-align:right;">$${totals.deliveryFee.toFixed(
              2,
            )}</td></tr>
            <tr><td style="padding:4px 0;">Tax</td><td style="text-align:right;">$${totals.tax.toFixed(
              2,
            )}</td></tr>
            ${
              totals.discount > 0
                ? `<tr><td style="padding:4px 0;">Discount</td><td style="text-align:right;">-$${totals.discount.toFixed(
                    2,
                  )}</td></tr>`
                : ""
            }
            <tr style="border-top: 1px solid #ddd;">
              <td style="padding-top:10px; font-weight:bold;">${
                isCashOnDelivery ? "Amount Due" : "Total"
              }</td>
              <td style="padding-top:10px; text-align:right; font-weight:bold;">$${totals.total.toFixed(
                2,
              )}</td>
            </tr>
          </table>
        </body>
      </html>`;
  }

  async function handleDownload() {
    if (isDownloading || !lastOrder) return;
    setIsDownloading(true);

    try {
      const html = buildReceiptHtml();
      const { uri } = await Print.printToFileAsync({ html });

      const canShare = await Sharing.isAvailableAsync();
      if (canShare) {
        await Sharing.shareAsync(uri, {
          mimeType: "application/pdf",
          dialogTitle: `Soova ${isCashOnDelivery ? "Order Summary" : "Receipt"} — ${lastOrder.id}`,
          UTI: "com.adobe.pdf",
        });
      } else {
        Alert.alert(
          "PDF Created",
          "Your receipt was generated, but sharing isn't available on this device.",
        );
      }
    } catch (error) {
      Alert.alert(
        "Something went wrong",
        "The receipt couldn't be generated. Please try again.",
      );
    } finally {
      setIsDownloading(false);
    }
  }

  if (!ready || !hasHydrated) {
    return (
      <View style={s.screen}>
        <CartSkeleton />
      </View>
    );
  }

  if (!lastOrder || !totals || !shippingType) {
    return (
      <View style={s.screen}>
        <View style={s.header}>
          <Pressable style={s.backButton} onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={22} color={colors.textPrimary} />
          </Pressable>
          <Text style={s.headerTitle}>E-Receipt</Text>
          <View style={s.backButton} />
        </View>
        <View style={s.emptyState}>
          <Ionicons name="receipt-outline" size={40} color={colors.textMuted} />
          <Text style={s.emptyText}>No completed order to show yet</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={s.screen}>
      <View style={s.header}>
        <Pressable style={s.backButton} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={22} color={colors.textPrimary} />
        </Pressable>
        <Text style={s.headerTitle}>{screenTitle}</Text>
        <View style={s.backButton} />
      </View>

      <ScrollView contentContainerStyle={s.scrollContent}>
        <View style={s.barcodeWrapper}>
          <Barcode orderId={lastOrder.id} colors={colors} />
        </View>
        <Text style={s.orderIdText}>{lastOrder.id}</Text>

        {isCashOnDelivery && (
          <View style={s.codBanner}>
            <Ionicons name="cash-outline" size={18} color={colors.accent} />
            <Text style={s.codBannerText}>
              Payment due on delivery — pay in cash when your order arrives.
            </Text>
          </View>
        )}

        {lines.map((line) => (
          <View key={line.product.id} style={s.itemRow}>
            <RemoteImage
              uri={line.product.thumbPath}
              fallbackUri={line.product.fallbackThumbPath}
              style={s.itemImage}
            />
            <View style={s.itemTextWrapper}>
              <View style={s.itemTitleRow}>
                <Text style={s.itemName} numberOfLines={1}>
                  {line.product.name}
                </Text>
                <View style={s.itemRating}>
                  <Ionicons name="star" size={12} color="#F5A623" />
                  <Text style={s.itemRatingText}>
                    {line.product.rating.toFixed(1)}
                  </Text>
                </View>
              </View>
              <Text style={s.itemCategory}>
                {getCategoryLabel(line.product.category)}
              </Text>
              <Text style={s.itemPriceQty}>
                ${line.product.price.toFixed(2)} | Qty. {line.quantity}
              </Text>
            </View>
          </View>
        ))}

        <View style={s.detailsBlock}>
          <View style={s.detailRow}>
            <Text style={s.detailLabel}>Order Date</Text>
            <Text style={s.detailValue}>
              {formatOrderDate(lastOrder.placedAt)}
            </Text>
          </View>
          <View style={s.detailRow}>
            <Text style={s.detailLabel}>Promo code</Text>
            <Text style={s.detailValue}>
              {lastOrder.promo ? lastOrder.promo.code : "—"}
            </Text>
          </View>
          <View style={s.detailRow}>
            <Text style={s.detailLabel}>Delivery Type</Text>
            <Text style={s.detailValue}>{shippingType.name}</Text>
          </View>
          <View style={s.detailRow}>
            <Text style={s.detailLabel}>Payment Method</Text>
            <Text style={s.detailValue}>{paymentMethodLabel}</Text>
          </View>
        </View>

        <View style={s.totalsBlock}>
          <View style={s.totalRow}>
            <Text style={s.totalLabel}>Amount</Text>
            <Text style={s.totalValue}>${totals.subTotal.toFixed(2)}</Text>
          </View>
          <View style={s.totalRow}>
            <Text style={s.totalLabel}>Delivery Charge</Text>
            <Text style={s.totalValue}>${totals.deliveryFee.toFixed(2)}</Text>
          </View>
          <View style={s.totalRow}>
            <Text style={s.totalLabel}>Tax</Text>
            <Text style={s.totalValue}>${totals.tax.toFixed(2)}</Text>
          </View>
          {totals.discount > 0 && (
            <View style={s.totalRow}>
              <Text style={s.totalLabel}>Discount</Text>
              <Text style={s.discountValue}>
                -${totals.discount.toFixed(2)}
              </Text>
            </View>
          )}

          <View style={s.totalsDivider} />

          <View style={s.totalRow}>
            <Text style={s.grandTotalLabel}>
              {isCashOnDelivery ? "Amount Due" : "Total"}
            </Text>
            <Text style={s.grandTotalValue}>${totals.total.toFixed(2)}</Text>
          </View>
        </View>
      </ScrollView>

      <View style={s.footer}>
        <Pressable
          style={[s.downloadButton, isDownloading && s.downloadButtonBusy]}
          onPress={handleDownload}
          disabled={isDownloading}
        >
          {isDownloading ? (
            <ActivityIndicator color={colors.onAccent} size="small" />
          ) : (
            <Text style={s.downloadButtonText}>
              {isCashOnDelivery
                ? "Download Order Summary"
                : "Download E-Receipt"}
            </Text>
          )}
        </Pressable>

        <Pressable
          style={s.shoppingButton}
          onPress={() => router.push("/(tabs)/shop")}
        >
          <Ionicons name="arrow-back" size={18} color={colors.accent} />
          <Text style={s.shoppingButtonText}>Back to Shopping</Text>
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
    barcodeWrapper: {
      alignItems: "center",
      backgroundColor: colors.cardBackground,
      borderRadius: 16,
      paddingVertical: 20,
      marginBottom: 8,
    },
    orderIdText: {
      fontFamily: Fonts.medium,
      fontSize: 12,
      color: colors.textMuted,
      textAlign: "center",
      marginBottom: 24,
    },
    codBanner: {
      flexDirection: "row",
      alignItems: "center",
      gap: 10,
      backgroundColor: colors.cardBackground,
      borderRadius: 14,
      padding: 14,
      marginBottom: 20,
    },
    codBannerText: {
      flex: 1,
      fontFamily: Fonts.medium,
      fontSize: 13,
      lineHeight: 18,
      color: colors.textPrimary,
    },

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
    downloadButton: {
      backgroundColor: colors.accent,
      borderRadius: 28,
      paddingVertical: 16,
      alignItems: "center",
      justifyContent: "center",
    },
    downloadButtonBusy: {
      opacity: 0.7,
    },
    downloadButtonText: {
      fontFamily: Fonts.semiBold,
      fontSize: 15,
      color: colors.onAccent,
    },
    shoppingButton: {
      marginTop: 12,
      borderRadius: 28,
      paddingVertical: 16,
      alignItems: "center",
      justifyContent: "center",
      flexDirection: "row",
      gap: 8,
      backgroundColor: colors.cardBackground,
      borderWidth: 1,
      borderColor: colors.accent,
    },

    shoppingButtonText: {
      fontFamily: Fonts.semiBold,
      fontSize: 15,
      color: colors.accent,
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
