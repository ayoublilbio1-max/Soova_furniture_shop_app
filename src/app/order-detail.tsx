// Order Detail screen — reached from My Orders, tapping a specific past
// order. Shows date, items, shipping address, shipping type, payment
// method, and the totals breakdown exactly as pre-computed at purchase
// time (never recalculated here — same principle as Review Summary).

import { RemoteImage } from "@/components/ui/remote-image";
import { ThemeColors } from "@/constants/colors";
import { Fonts } from "@/constants/fonts";
import { products } from "@/data/products";
import { useThemeColors } from "@/hooks/use-theme-colors";
import { SHIPPING_TYPES, useCartStore } from "@/store/cart-store";
import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";

function formatOrderDate(iso: string) {
  const date = new Date(iso);
  const datePart = date.toLocaleDateString(undefined, {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
  const timePart = date.toLocaleTimeString(undefined, {
    hour: "numeric",
    minute: "2-digit",
  });
  return `${datePart} at ${timePart}`;
}

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
    return card ? `Card •••• ${card.lastFour}` : "Card (no longer saved)";
  }

  return method;
}

export default function OrderDetail() {
  const colors = useThemeColors();
  const styles = getStyles(colors);
  const params = useLocalSearchParams<{ id?: string }>();

  const orders = useCartStore((s) => s.orders);
  const addresses = useCartStore((s) => s.addresses);
  const savedCards = useCartStore((s) => s.savedCards);

  const order = orders.find((o) => o.id === params.id);

  if (!order) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <Pressable style={styles.backButton} onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={22} color={colors.textPrimary} />
          </Pressable>
          <Text style={styles.headerTitle}>Order Detail</Text>
          <View style={styles.backButton} />
        </View>
        <View style={styles.emptyState}>
          <Ionicons
            name="alert-circle-outline"
            size={40}
            color={colors.textMuted}
          />
          <Text style={styles.emptyText}>
            This order couldn&apos;t be found.
          </Text>
        </View>
      </View>
    );
  }

  const address = order.addressId
    ? addresses.find((a) => a.id === order.addressId)
    : undefined;

  const shippingType = SHIPPING_TYPES.find(
    (t) => t.id === order.shippingTypeId,
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Pressable style={styles.backButton} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={22} color={colors.textPrimary} />
        </Pressable>
        <Text style={styles.headerTitle}>Order Detail</Text>
        <View style={styles.backButton} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* --- Order id + date --- */}
        <View style={styles.summaryCard}>
          <Text style={styles.orderIdText}>Order #{order.id.slice(-6)}</Text>
          <Text style={styles.orderDateText}>
            {formatOrderDate(order.placedAt)}
          </Text>
        </View>

        {/* --- Items --- */}
        <Text style={styles.sectionLabel}>Items</Text>
        <View style={styles.card}>
          {order.items.map((item, index) => {
            const product = products.find((p) => p.id === item.productId);

            return (
              <View
                key={`${item.productId}-${index}`}
                style={[
                  styles.itemRow,
                  index < order.items.length - 1 && styles.itemRowDivider,
                ]}
              >
                {product ? (
                  <RemoteImage
                    uri={product.thumbPath}
                    fallbackUri={product.fallbackThumbPath}
                    style={styles.itemImage}
                  />
                ) : (
                  <View style={styles.itemImagePlaceholder}>
                    <Ionicons
                      name="cube-outline"
                      size={20}
                      color={colors.textMuted}
                    />
                  </View>
                )}

                <View style={styles.itemInfo}>
                  <Text style={styles.itemName} numberOfLines={1}>
                    {product ? product.name : "Product no longer available"}
                  </Text>
                  <Text style={styles.itemQuantity}>Qty {item.quantity}</Text>
                </View>

                {product && (
                  <Text style={styles.itemPrice}>
                    ${(product.price * item.quantity).toFixed(2)}
                  </Text>
                )}
              </View>
            );
          })}
        </View>

        {/* --- Shipping address --- */}
        <Text style={styles.sectionLabel}>Shipping Address</Text>
        <View style={styles.card}>
          {address ? (
            <>
              <Text style={styles.addressLabel}>{address.label}</Text>
              <Text style={styles.addressLine}>
                {address.street}, {address.city}, {address.state} {address.zip}
              </Text>
            </>
          ) : (
            <Text style={styles.addressLine}>
              This address is no longer saved.
            </Text>
          )}
        </View>

        {/* --- Shipping type --- */}
        <Text style={styles.sectionLabel}>Shipping Method</Text>
        <View style={styles.card}>
          <Text style={styles.addressLabel}>
            {shippingType ? shippingType.name : "Standard"}
          </Text>
          {shippingType && (
            <Text style={styles.addressLine}>
              Estimated {shippingType.etaDays}-day delivery
            </Text>
          )}
        </View>

        {/* --- Payment method --- */}
        <Text style={styles.sectionLabel}>Payment Method</Text>
        <View style={styles.card}>
          <Text style={styles.addressLabel}>
            {formatPaymentMethod(order.paymentMethod, savedCards)}
          </Text>
        </View>

        {/* --- Totals breakdown --- */}
        <Text style={styles.sectionLabel}>Order Summary</Text>
        <View style={styles.card}>
          <View style={styles.totalsRow}>
            <Text style={styles.totalsLabel}>Subtotal</Text>
            <Text style={styles.totalsValue}>
              ${order.totals.subTotal.toFixed(2)}
            </Text>
          </View>
          <View style={styles.totalsRow}>
            <Text style={styles.totalsLabel}>Delivery Fee</Text>
            <Text style={styles.totalsValue}>
              ${order.totals.deliveryFee.toFixed(2)}
            </Text>
          </View>
          <View style={styles.totalsRow}>
            <Text style={styles.totalsLabel}>Tax</Text>
            <Text style={styles.totalsValue}>
              ${order.totals.tax.toFixed(2)}
            </Text>
          </View>
          {order.totals.discount > 0 && (
            <View style={styles.totalsRow}>
              <Text style={styles.totalsLabel}>Discount</Text>
              <Text style={styles.discountValue}>
                -${order.totals.discount.toFixed(2)}
              </Text>
            </View>
          )}

          <View style={styles.totalsDivider} />

          <View style={styles.totalsRow}>
            <Text style={styles.totalLabel}>Total</Text>
            <Text style={styles.totalValue}>
              ${order.totals.total.toFixed(2)}
            </Text>
          </View>
        </View>
      </ScrollView>
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
      paddingBottom: 50,
    },

    summaryCard: {
      backgroundColor: colors.cardBackground,
      borderRadius: 16,
      padding: 16,
      marginBottom: 20,
    },
    orderIdText: {
      fontFamily: Fonts.bold,
      fontSize: 17,
      color: colors.textPrimary,
      marginBottom: 4,
    },
    orderDateText: {
      fontFamily: Fonts.regular,
      fontSize: 13,
      color: colors.textMuted,
    },

    sectionLabel: {
      fontFamily: Fonts.semiBold,
      fontSize: 14,
      color: colors.textPrimary,
      marginBottom: 10,
    },
    card: {
      backgroundColor: colors.cardBackground,
      borderRadius: 16,
      padding: 14,
      marginBottom: 20,
    },

    itemRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: 12,
      paddingVertical: 10,
    },
    itemRowDivider: {
      borderBottomWidth: 1,
      borderBottomColor: colors.outline,
    },
    itemImage: {
      width: 48,
      height: 48,
      borderRadius: 10,
      backgroundColor: colors.placeholder,
    },
    itemImagePlaceholder: {
      width: 48,
      height: 48,
      borderRadius: 10,
      backgroundColor: colors.background,
      alignItems: "center",
      justifyContent: "center",
    },
    itemInfo: {
      flex: 1,
      gap: 2,
    },
    itemName: {
      fontFamily: Fonts.medium,
      fontSize: 14,
      color: colors.textPrimary,
    },
    itemQuantity: {
      fontFamily: Fonts.regular,
      fontSize: 12,
      color: colors.textMuted,
    },
    itemPrice: {
      fontFamily: Fonts.semiBold,
      fontSize: 14,
      color: colors.accent,
    },

    addressLabel: {
      fontFamily: Fonts.semiBold,
      fontSize: 14,
      color: colors.textPrimary,
      marginBottom: 4,
    },
    addressLine: {
      fontFamily: Fonts.regular,
      fontSize: 13,
      color: colors.textMuted,
      lineHeight: 19,
    },

    totalsRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      paddingVertical: 6,
    },
    totalsLabel: {
      fontFamily: Fonts.regular,
      fontSize: 14,
      color: colors.textMuted,
    },
    totalsValue: {
      fontFamily: Fonts.medium,
      fontSize: 14,
      color: colors.textPrimary,
    },
    discountValue: {
      fontFamily: Fonts.medium,
      fontSize: 14,
      color: colors.roseRed,
    },
    totalsDivider: {
      height: 1,
      backgroundColor: colors.outline,
      marginVertical: 8,
    },
    totalLabel: {
      fontFamily: Fonts.bold,
      fontSize: 16,
      color: colors.textPrimary,
    },
    totalValue: {
      fontFamily: Fonts.bold,
      fontSize: 16,
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
