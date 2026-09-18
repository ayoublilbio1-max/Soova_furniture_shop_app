// Best Sellers screen — reached from Home's "See All" next to Best Sellers.
// Category filter chips show real per-category counts (sofa subtypes grouped
// together); every card here shows the "Best Seller" badge unconditionally.
// Chips show a brief loading spinner before switching category (color-fade
// animation between active/inactive states is unchanged).

import { AddToCartButton } from "@/components/ui/add-to-cart-button";
import { ProductGridSkeleton } from "@/components/ui/product-grid-skeleton";
import { RemoteImage } from "@/components/ui/remote-image";
import { Skeleton } from "@/components/ui/skeleton";
import { ThemeColors } from "@/constants/colors";
import { Fonts } from "@/constants/fonts";
import { categories } from "@/data/categories";
import { matchesCategoryFilter } from "@/data/product-badges";
import { Product, products } from "@/data/products";
import { useDeferredReady } from "@/hooks/use-deferred-ready";
import { useThemeColors } from "@/hooks/use-theme-colors";
import { useWishlistStore } from "@/store/wishlist-store";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  ActivityIndicator,
  Animated,
  Easing,
  FlatList,
  InteractionManager,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";

const WISHLIST_ACTIVE_COLOR = "#DC143C";
const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

// --- Category filter chip (All + one per category, with live counts) ---
// Background/text color fade is unchanged; a loading spinner now replaces
// the label briefly before the category switch is applied.
function CategoryFilterChip({
  label,
  count,
  active,
  loading,
  disabled,
  colors,
  styles,
  onPress,
}: {
  label: string;
  count: number;
  active: boolean;
  loading: boolean;
  disabled: boolean;
  colors: ThemeColors;
  styles: ReturnType<typeof getStyles>;
  onPress: () => void;
}) {
  const colorAnim = useRef(new Animated.Value(active ? 1 : 0)).current;

  useEffect(() => {
    Animated.timing(colorAnim, {
      toValue: active ? 1 : 0,
      duration: 150,
      easing: Easing.ease,
      useNativeDriver: false,
    }).start();
  }, [active, colorAnim]);

  return (
    <AnimatedPressable
      style={[
        styles.categoryChip,
        {
          backgroundColor: colorAnim.interpolate({
            inputRange: [0, 1],
            outputRange: [colors.cardBackground, colors.accent],
          }),
        },
      ]}
      onPress={onPress}
      disabled={disabled}
    >
      {loading ? (
        <ActivityIndicator
          color={active ? colors.onAccent : colors.textPrimary}
          size="small"
        />
      ) : (
        <Animated.Text
          style={[
            styles.categoryChipText,
            {
              color: colorAnim.interpolate({
                inputRange: [0, 1],
                outputRange: [colors.textPrimary, colors.onAccent],
              }),
            },
          ]}
        >
          {label} ({count})
        </Animated.Text>
      )}
    </AnimatedPressable>
  );
}

// --- Product grid card: badges, title, sale/rating, price/cart ---
function BestSellerCard({
  item,
  colors,
  styles,
  isWishlisted,
  onToggleWishlist,
  onPress,
}: {
  item: Product;
  colors: ThemeColors;
  styles: ReturnType<typeof getStyles>;
  isWishlisted: boolean;
  onToggleWishlist: (id: string) => void;
  onPress: () => void;
}) {
  const wishlistScaleAnim = useRef(new Animated.Value(1)).current;

  function handleWishlistPress() {
    onToggleWishlist(item.id);
    Animated.sequence([
      Animated.timing(wishlistScaleAnim, {
        toValue: 1.3,
        duration: 150,
        easing: Easing.ease,
        useNativeDriver: true,
      }),
      Animated.timing(wishlistScaleAnim, {
        toValue: 1,
        duration: 150,
        easing: Easing.ease,
        useNativeDriver: true,
      }),
    ]).start();
  }

  return (
    <Pressable style={styles.productCard} onPress={onPress}>
      <View style={styles.badgeStack}>
        {item.isTopDeal && (
          <View style={styles.topDealSticker}>
            <Text style={styles.topDealText}>Top Deal</Text>
          </View>
        )}
        {/* Every card on this screen is a best seller by definition */}
        <View style={styles.bestSellerSticker}>
          <Text style={styles.bestSellerText}>Best Seller</Text>
        </View>
      </View>

      <RemoteImage
        uri={item.thumbPath}
        fallbackUri={item.fallbackThumbPath}
        style={styles.productImage}
      />
      <AnimatedPressable
        style={[
          styles.wishlistButton,
          { transform: [{ scale: wishlistScaleAnim }] },
        ]}
        onPress={handleWishlistPress}
      >
        <Ionicons
          name={isWishlisted ? "heart" : "heart-outline"}
          size={18}
          color={isWishlisted ? WISHLIST_ACTIVE_COLOR : colors.accent}
        />
      </AnimatedPressable>

      <Text style={styles.productName}>{item.name}</Text>

      {item.salePercent ? (
        <>
          <View style={styles.saleRow}>
            <Text style={styles.saleText}>Sale -{item.salePercent}%</Text>
            <Ionicons name="arrow-down" size={12} color="#FF2C2C" />
          </View>
          <View style={styles.ratingRow}>
            <Ionicons name="star" size={12} color="#F5A623" />
            <Text style={styles.ratingText}>{item.rating.toFixed(1)}</Text>
          </View>
        </>
      ) : (
        <View style={styles.ratingRow}>
          <Ionicons name="star" size={12} color="#F5A623" />
          <Text style={styles.ratingText}>{item.rating.toFixed(1)}</Text>
        </View>
      )}

      <View style={styles.productFooter}>
        <Text style={styles.productPrice}>${item.price.toFixed(2)}</Text>
        <AddToCartButton productId={item.id} colors={colors} size={32} />
      </View>
    </Pressable>
  );
}

export default function BestSellers() {
  const colors = useThemeColors();
  const styles = getStyles(colors);

  // --- Defers building the heavy grid until the push transition has
  // finished, so the skeleton is what paints instantly on tap ---
  const ready = useDeferredReady();

  // --- Global wishlist state, shared with every other screen and the
  // Wishlist tab itself ---
  const wishlistedIds = useWishlistStore((s) => s.wishlistedIds);
  const toggleWishlist = useWishlistStore((s) => s.toggleWishlist);

  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [categoryTransitioning, setCategoryTransitioning] = useState(false);

  // --- Tracks which chip (by key: "all" or category id) is mid-press,
  // so it can show a spinner while every chip is briefly disabled ---
  const [loadingChipKey, setLoadingChipKey] = useState<string | null>(null);

  const sorted = useMemo(
    () => [...products].sort((a, b) => b.salesCount - a.salesCount),
    [],
  );

  // --- Real per-category counts, sofa subtypes grouped under "sofa" ---
  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const category of categories) {
      counts[category.id] = products.filter((product) =>
        matchesCategoryFilter(product.category, category.id),
      ).length;
    }
    return counts;
  }, []);

  const filtered = useMemo(() => {
    if (!activeCategory) return sorted;
    return sorted.filter((item) =>
      matchesCategoryFilter(item.category, activeCategory),
    );
  }, [sorted, activeCategory]);

  // --- Show the grid skeleton for a beat after switching category chips ---
  useEffect(() => {
    const task = InteractionManager.runAfterInteractions(() => {
      setCategoryTransitioning(false);
    });
    return () => task.cancel();
  }, [activeCategory]);

  function handleCategoryPress(key: string, id: string | null) {
    if (loadingChipKey) return;
    setLoadingChipKey(key);

    setTimeout(() => {
      setCategoryTransitioning(true);
      setActiveCategory(id);
      setLoadingChipKey(null);
    }, 400);
  }

  function openProductDetails(id: string) {
    router.push({ pathname: "/product-details", params: { id } });
  }

  if (!ready) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <Pressable style={styles.backButton} onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={22} color={colors.textPrimary} />
          </Pressable>
          <Text style={styles.headerTitle}>Best Sellers</Text>
          <View style={styles.backButton} />
        </View>
        <View style={styles.categoryChipsRow}>
          <Skeleton width={70} height={30} borderRadius={20} />
          <Skeleton width={90} height={30} borderRadius={20} />
          <Skeleton width={90} height={30} borderRadius={20} />
          <Skeleton width={80} height={30} borderRadius={20} />
          <Skeleton width={100} height={30} borderRadius={20} />
        </View>
        <View style={styles.listContent}>
          <ProductGridSkeleton rows={4} />
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* --- Header --- */}
      <View style={styles.header}>
        <Pressable style={styles.backButton} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={22} color={colors.textPrimary} />
        </Pressable>
        <Text style={styles.headerTitle}>Best Sellers</Text>
        <View style={styles.backButton} />
      </View>

      {/* --- Category filter chips --- */}
      <FlatList
        horizontal
        showsHorizontalScrollIndicator={false}
        removeClippedSubviews={false}
        contentContainerStyle={styles.categoryChipsRow}
        data={[{ id: null, name: "All" }, ...categories]}
        keyExtractor={(item) => item.id ?? "all"}
        renderItem={({ item }) => {
          const key = item.id ?? "all";
          return (
            <CategoryFilterChip
              label={item.name}
              count={item.id ? (categoryCounts[item.id] ?? 0) : products.length}
              active={activeCategory === item.id}
              loading={loadingChipKey === key}
              disabled={!!loadingChipKey}
              colors={colors}
              styles={styles}
              onPress={() => handleCategoryPress(key, item.id)}
            />
          );
        }}
      />

      {/* --- Product grid --- */}
      {categoryTransitioning ? (
        <View style={styles.listContent}>
          <ProductGridSkeleton rows={4} />
        </View>
      ) : filtered.length === 0 ? (
        <View style={styles.emptyState}>
          <Ionicons name="cube-outline" size={40} color={colors.textMuted} />
          <Text style={styles.emptyText}>
            No best sellers in this category yet
          </Text>
        </View>
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={(item) => item.id}
          numColumns={2}
          columnWrapperStyle={styles.productRow}
          contentContainerStyle={styles.listContent}
          renderItem={({ item }) => (
            <BestSellerCard
              item={item}
              colors={colors}
              styles={styles}
              isWishlisted={!!wishlistedIds[item.id]}
              onToggleWishlist={toggleWishlist}
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
    // --- Screen / header ---
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
      marginBottom: 10,
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

    // --- Category filter chips ---
    categoryChipsRow: {
      paddingHorizontal: 24,
      gap: 10,
      marginBottom: 20,
    },
    categoryChip: {
      borderRadius: 20,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      paddingHorizontal: 16,
      height: 30,
      minWidth: 30,
    },
    categoryChipText: {
      fontFamily: Fonts.medium,
      fontSize: 13,
    },

    // --- Product grid ---
    listContent: {
      paddingHorizontal: 24,
      paddingBottom: 40,
    },
    productRow: {
      justifyContent: "space-between",
      marginBottom: 16,
    },
    productCard: {
      width: "48%",
      backgroundColor: colors.cardBackground,
      borderRadius: 20,
      padding: 12,
    },

    // --- Badge stack (Top Deal / Best Seller), stacked top-left ---
    badgeStack: {
      position: "absolute",
      top: 20,
      left: 20,
      zIndex: 1,
      gap: 4,
    },
    topDealSticker: {
      backgroundColor: "#FF2C2C",
      borderRadius: 8,
      paddingHorizontal: 8,
      paddingVertical: 3,
    },
    topDealText: {
      fontFamily: Fonts.semiBold,
      fontSize: 10,
      color: "#FFFFFF",
    },
    bestSellerSticker: {
      backgroundColor: "#FF9900",
      borderRadius: 8,
      paddingHorizontal: 8,
      paddingVertical: 3,
    },
    bestSellerText: {
      fontFamily: Fonts.semiBold,
      fontSize: 10,
      color: "#FFFFFF",
    },

    productImage: {
      width: "100%",
      height: 140,
      borderRadius: 14,
      marginBottom: 12,
    },
    wishlistButton: {
      position: "absolute",
      top: 20,
      right: 20,
      width: 32,
      height: 32,
      borderRadius: 16,
      backgroundColor: colors.background,
      alignItems: "center",
      justifyContent: "center",
    },

    // --- Title / sale / rating stack ---
    productName: {
      fontFamily: Fonts.semiBold,
      fontSize: 13,
      color: colors.textPrimary,
      marginBottom: 4,
    },
    saleRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: 3,
      marginBottom: 4,
    },
    saleText: {
      fontFamily: Fonts.semiBold,
      fontSize: 11,
      color: "#FF2C2C",
    },
    ratingRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: 3,
      marginBottom: 6,
    },
    ratingText: {
      fontFamily: Fonts.medium,
      fontSize: 12,
      color: colors.textMuted,
    },

    productFooter: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
    },
    productPrice: {
      fontFamily: Fonts.bold,
      fontSize: 15,
      color: colors.accent,
    },
    emptyState: {
      alignItems: "center",
      justifyContent: "center",
      paddingVertical: 60,
      gap: 12,
    },
    emptyText: {
      fontFamily: Fonts.medium,
      fontSize: 14,
      color: colors.textMuted,
      textAlign: "center",
      paddingHorizontal: 40,
    },
  });
}
