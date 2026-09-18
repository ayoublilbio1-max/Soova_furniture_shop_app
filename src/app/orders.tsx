// My Orders screen — reached from Account > "My Orders". Full order history
// (newest first), each row summarized by date, item count, and total.
// Tapping a row opens Order Detail for that specific order.

import { RemoteImage } from "@/components/ui/remote-image";
import { ThemeColors } from "@/constants/colors";
import { Fonts } from "@/constants/fonts";
import { products } from "@/data/products";
import { useThemeColors } from "@/hooks/use-theme-colors";
import { CompletedOrder, useCartStore } from "@/store/cart-store";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { FlatList, Pressable, StyleSheet, Text, View } from "react-native";

function formatOrderDate(iso: string) {
  const date = new Date(iso);
  return date.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

// --- Single order row: thumbnail of first item, date, item count, total ---
function OrderRow({
  order,
  colors,
  styles,
  onPress,
}: {
  order: CompletedOrder;
  colors: ThemeColors;
  styles: ReturnType<typeof getStyles>;
  onPress: () => void;
}) {
  const firstItem = order.items[0];
  const firstProduct = firstItem
    ? products.find((p) => p.id === firstItem.productId)
    : undefined;

  const itemCount = order.items.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <Pressable style={styles.row} onPress={onPress}>
      {firstProduct ? (
        <RemoteImage
          uri={firstProduct.thumbPath}
          fallbackUri={firstProduct.fallbackThumbPath}
          style={styles.rowImage}
        />
      ) : (
        <View style={styles.rowImagePlaceholder}>
          <Ionicons name="cube-outline" size={22} color={colors.textMuted} />
        </View>
      )}

      <View style={styles.rowInfo}>
        <Text style={styles.rowOrderId}>Order #{order.id.slice(-6)}</Text>
        <Text style={styles.rowDate}>{formatOrderDate(order.placedAt)}</Text>
        <Text style={styles.rowItemCount}>
          {itemCount} {itemCount === 1 ? "item" : "items"}
        </Text>
      </View>

      <View style={styles.rowRight}>
        <Text style={styles.rowTotal}>${order.totals.total.toFixed(2)}</Text>
        <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />
      </View>
    </Pressable>
  );
}

export default function Orders() {
  const colors = useThemeColors();
  const styles = getStyles(colors);
  const orders = useCartStore((s) => s.orders);

  function openOrderDetail(id: string) {
    router.push({ pathname: "/order-detail", params: { id } });
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Pressable style={styles.backButton} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={22} color={colors.textPrimary} />
        </Pressable>
        <Text style={styles.headerTitle}>My Orders</Text>
        <View style={styles.backButton} />
      </View>

      {orders.length === 0 ? (
        <View style={styles.emptyState}>
          <Ionicons name="receipt-outline" size={40} color={colors.textMuted} />
          <Text style={styles.emptyText}>
            You haven&apos;t placed any orders yet.
          </Text>
        </View>
      ) : (
        <FlatList
          data={orders}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          renderItem={({ item }) => (
            <OrderRow
              order={item}
              colors={colors}
              styles={styles}
              onPress={() => openOrderDetail(item.id)}
            />
          )}
        />
      )}
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
      paddingBottom: 40,
    },
    row: {
      flexDirection: "row",
      alignItems: "center",
      gap: 14,
      backgroundColor: colors.cardBackground,
      borderRadius: 16,
      padding: 14,
      marginBottom: 12,
    },
    rowImage: {
      width: 56,
      height: 56,
      borderRadius: 12,
      backgroundColor: colors.placeholder,
    },
    rowImagePlaceholder: {
      width: 56,
      height: 56,
      borderRadius: 12,
      backgroundColor: colors.background,
      alignItems: "center",
      justifyContent: "center",
    },
    rowInfo: {
      flex: 1,
      gap: 3,
    },
    rowOrderId: {
      fontFamily: Fonts.semiBold,
      fontSize: 14,
      color: colors.textPrimary,
    },
    rowDate: {
      fontFamily: Fonts.regular,
      fontSize: 12,
      color: colors.textMuted,
    },
    rowItemCount: {
      fontFamily: Fonts.regular,
      fontSize: 12,
      color: colors.textMuted,
    },
    rowRight: {
      alignItems: "flex-end",
      gap: 4,
    },
    rowTotal: {
      fontFamily: Fonts.bold,
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
