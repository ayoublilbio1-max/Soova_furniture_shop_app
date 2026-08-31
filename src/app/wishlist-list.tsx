// Single wishlist list detail — reached by tapping a list card on the
// Wishlist tab's "My lists" section. Shows that list's products, lets you
// remove items from just this list (they stay in the overall wishlist),
// and delete the whole list.

import { RemoteImage } from "@/components/ui/remote-image";
import { WishlistListSkeleton } from "@/components/ui/wishlist-list-skeleton";
import { ThemeColors } from "@/constants/colors";
import { Fonts } from "@/constants/fonts";
import { bestSellerIds } from "@/data/product-badges";
import { Product, products } from "@/data/products";
import { useDeferredReady } from "@/hooks/use-deferred-ready";
import { useThemeColors } from "@/hooks/use-theme-colors";
import { useWishlistStore } from "@/store/wishlist-store";
import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import { useMemo, useRef } from "react";
import {
  Alert,
  Animated,
  Easing,
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";

const WISHLIST_ACTIVE_COLOR = "#DC143C";
const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

// --- Full-width row: image, badges, title, rating/price, cart + remove ---
function ListDetailRow({
  item,
  colors,
  styles,
  onAddToCart,
  onRemoveFromList,
  onPress,
}: {
  item: Product;
  colors: ThemeColors;
  styles: ReturnType<typeof getStyles>;
  onAddToCart: () => void;
  onRemoveFromList: () => void;
  onPress: () => void;
}) {
  const toggleWishlist = useWishlistStore((s) => s.toggleWishlist);
  const heartScaleAnim = useRef(new Animated.Value(1)).current;
  const isBestSeller = bestSellerIds.has(item.id);
  const originalPrice = item.salePercent
    ? item.price / (1 - item.salePercent / 100)
    : null;

  function handleHeartPress() {
    toggleWishlist(item.id);
    Animated.sequence([
      Animated.timing(heartScaleAnim, {
        toValue: 1.3,
        duration: 150,
        easing: Easing.ease,
        useNativeDriver: true,
      }),
      Animated.timing(heartScaleAnim, {
        toValue: 1,
        duration: 150,
        easing: Easing.ease,
        useNativeDriver: true,
      }),
    ]).start();
  }

  return (
    <Pressable style={styles.row} onPress={onPress}>
      <View style={styles.imageWrapper}>
        {(item.isTopDeal || isBestSeller) && (
          <View style={styles.badgeStack}>
            {item.isTopDeal && (
              <View style={styles.topDealSticker}>
                <Text style={styles.topDealText}>Top Deal</Text>
              </View>
            )}
            {isBestSeller && (
              <View style={styles.bestSellerSticker}>
                <Text style={styles.bestSellerText}>Best Seller</Text>
              </View>
            )}
          </View>
        )}
        <RemoteImage
          uri={item.thumbPath}
          fallbackUri={item.fallbackThumbPath}
          style={styles.rowImage}
        />
        <AnimatedPressable
          style={[
            styles.heartButton,
            { transform: [{ scale: heartScaleAnim }] },
          ]}
          onPress={handleHeartPress}
        >
          <Ionicons name="heart" size={16} color={WISHLIST_ACTIVE_COLOR} />
        </AnimatedPressable>
      </View>

      <View style={styles.rowContent}>
        <Text style={styles.rowTitle} numberOfLines={2}>
          {item.name}
        </Text>
        <View style={styles.ratingRow}>
          <Ionicons name="star" size={12} color="#F5A623" />
          <Text style={styles.ratingText}>{item.rating.toFixed(1)}</Text>
        </View>
        <View style={styles.priceRow}>
          <Text style={styles.price}>${item.price.toFixed(2)}</Text>
          {originalPrice && (
            <Text style={styles.originalPrice}>
              ${originalPrice.toFixed(2)}
            </Text>
          )}
        </View>

        <View style={styles.rowActions}>
          <Pressable style={styles.addToCartButton} onPress={onAddToCart}>
            <Text style={styles.addToCartText}>Add to Cart</Text>
          </Pressable>
          <Pressable style={styles.removeButton} onPress={onRemoveFromList}>
            <Ionicons name="close" size={18} color={colors.textMuted} />
          </Pressable>
        </View>
      </View>
    </Pressable>
  );
}

export default function WishlistListDetail() {
  const colors = useThemeColors();
  const styles = getStyles(colors);
  const ready = useDeferredReady();
  const params = useLocalSearchParams<{ listId: string }>();

  const lists = useWishlistStore((s) => s.lists);
  const hasHydrated = useWishlistStore((s) => s.hasHydrated);
  const removeFromList = useWishlistStore((s) => s.removeFromList);
  const deleteList = useWishlistStore((s) => s.deleteList);

  const list = lists.find((l) => l.id === params.listId);

  const listProducts = useMemo(() => {
    if (!list) return [];
    return list.productIds
      .map((id) => products.find((p) => p.id === id))
      .filter((p): p is Product => !!p);
  }, [list]);

  function notImplemented(label: string) {
    Alert.alert(
      label,
      "This will continue once the corresponding screen is built.",
    );
  }

  function openProductDetails(id: string) {
    router.push({ pathname: "/product-details", params: { id } });
  }

  function handleDeleteList() {
    if (!list) return;
    Alert.alert(
      `Delete "${list.name}"?`,
      "This won't remove the items from your wishlist.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => {
            deleteList(list.id);
            router.back();
          },
        },
      ],
    );
  }

  // --- Wait for both the deferred-mount skeleton AND the wishlist store's
  // persisted data to finish loading before deciding whether this list
  // exists — otherwise a screen opened right at app start can briefly see
  // an empty store and wrongly conclude a real list is missing. ---
  if (!ready || !hasHydrated) {
    return (
      <View style={styles.container}>
        <WishlistListSkeleton />
      </View>
    );
  }

  if (!list) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <Pressable style={styles.headerButton} onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={22} color={colors.textPrimary} />
          </Pressable>
          <Text style={styles.headerTitle}>List</Text>
          <View style={styles.headerButton} />
        </View>
        <View style={styles.emptyState}>
          <Ionicons name="albums-outline" size={40} color={colors.textMuted} />
          <Text style={styles.emptyText}>This list no longer exists</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Pressable style={styles.headerButton} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={22} color={colors.textPrimary} />
        </Pressable>
        <Text style={styles.headerTitle} numberOfLines={1}>
          {list.name}
        </Text>
        <Pressable style={styles.headerButton} onPress={handleDeleteList}>
          <Ionicons name="trash-outline" size={20} color={colors.textPrimary} />
        </Pressable>
      </View>

      {listProducts.length === 0 ? (
        <View style={styles.emptyState}>
          <Ionicons name="heart-outline" size={40} color={colors.textMuted} />
          <Text style={styles.emptyText}>No items in this list yet</Text>
        </View>
      ) : (
        <FlatList
          data={listProducts}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          renderItem={({ item }) => (
            <ListDetailRow
              item={item}
              colors={colors}
              styles={styles}
              onAddToCart={() => notImplemented("Add to Cart")}
              onRemoveFromList={() => removeFromList(list.id, item.id)}
              onPress={() => openProductDetails(item.id)}
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
    headerButton: {
      width: 40,
      height: 40,
      alignItems: "center",
      justifyContent: "center",
    },
    headerTitle: {
      flex: 1,
      textAlign: "center",
      fontFamily: Fonts.bold,
      fontSize: 18,
      color: colors.textPrimary,
      marginHorizontal: 8,
    },

    listContent: {
      paddingHorizontal: 24,
      paddingBottom: 40,
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

    row: {
      flexDirection: "row",
      gap: 14,
      marginBottom: 20,
    },
    imageWrapper: {
      width: 100,
      height: 100,
    },
    rowImage: {
      width: 100,
      height: 100,
      borderRadius: 16,
      backgroundColor: colors.cardBackground,
    },
    heartButton: {
      position: "absolute",
      top: 6,
      right: 6,
      width: 26,
      height: 26,
      borderRadius: 13,
      backgroundColor: colors.background,
      alignItems: "center",
      justifyContent: "center",
    },
    badgeStack: {
      position: "absolute",
      bottom: 6,
      left: 6,
      zIndex: 1,
      gap: 3,
    },
    topDealSticker: {
      backgroundColor: "#FF2C2C",
      borderRadius: 6,
      paddingHorizontal: 6,
      paddingVertical: 2,
    },
    topDealText: {
      fontFamily: Fonts.semiBold,
      fontSize: 8,
      color: "#FFFFFF",
    },
    bestSellerSticker: {
      backgroundColor: "#FF9900",
      borderRadius: 6,
      paddingHorizontal: 6,
      paddingVertical: 2,
    },
    bestSellerText: {
      fontFamily: Fonts.semiBold,
      fontSize: 8,
      color: "#FFFFFF",
    },

    rowContent: {
      flex: 1,
    },
    rowTitle: {
      fontFamily: Fonts.semiBold,
      fontSize: 14,
      color: colors.textPrimary,
      marginBottom: 4,
    },
    ratingRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: 3,
      marginBottom: 4,
    },
    ratingText: {
      fontFamily: Fonts.medium,
      fontSize: 12,
      color: colors.textMuted,
    },
    priceRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: 8,
      marginBottom: 10,
    },
    price: {
      fontFamily: Fonts.bold,
      fontSize: 16,
      color: colors.accent,
    },
    originalPrice: {
      fontFamily: Fonts.regular,
      fontSize: 13,
      color: colors.textMuted,
      textDecorationLine: "line-through",
    },
    rowActions: {
      flexDirection: "row",
      gap: 8,
    },
    addToCartButton: {
      flex: 1,
      backgroundColor: colors.accent,
      borderRadius: 20,
      paddingVertical: 10,
      alignItems: "center",
    },
    addToCartText: {
      fontFamily: Fonts.semiBold,
      fontSize: 13,
      color: colors.onAccent,
    },
    removeButton: {
      width: 40,
      height: 40,
      borderRadius: 20,
      borderWidth: 1,
      borderColor: colors.outline,
      alignItems: "center",
      justifyContent: "center",
    },
  });
}
