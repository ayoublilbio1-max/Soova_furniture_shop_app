// Category products screen — reached from Home's Category grid or the Sofa
// subcategory list. Filters products by the category id passed via params
// (sofa subtypes are grouped under the single "sofa" filter).

import { AddToCartButton } from "@/components/ui/add-to-cart-button";
import { ProductGridSkeleton } from "@/components/ui/product-grid-skeleton";
import { RemoteImage } from "@/components/ui/remote-image";
import { ThemeColors } from "@/constants/colors";
import { Fonts } from "@/constants/fonts";
import { bestSellerIds, matchesCategoryFilter } from "@/data/product-badges";
import { Product, products } from "@/data/products";
import { useDeferredReady } from "@/hooks/use-deferred-ready";
import { useThemeColors } from "@/hooks/use-theme-colors";
import { useWishlistStore } from "@/store/wishlist-store";
import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import { useRef } from "react";
import {
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

// --- Product grid card: badges, title, sale/rating, price/cart ---
function CategoryProductCard({
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
  const isBestSeller = bestSellerIds.has(item.id);

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
        {isBestSeller && (
          <View style={styles.bestSellerSticker}>
            <Text style={styles.bestSellerText}>Best Seller</Text>
          </View>
        )}
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

export default function CategoryProducts() {
  const colors = useThemeColors();
  const styles = getStyles(colors);
  const params = useLocalSearchParams<{ category: string; title: string }>();

  // --- Defers building the heavy grid until the push transition has
  // finished, so the skeleton is what paints instantly on tap ---
  const ready = useDeferredReady();

  // --- Global wishlist state, shared with every other screen and the
  // Wishlist tab itself ---
  const wishlistedIds = useWishlistStore((s) => s.wishlistedIds);
  const toggleWishlist = useWishlistStore((s) => s.toggleWishlist);

  const filtered = products.filter((item) =>
    matchesCategoryFilter(item.category, params.category),
  );

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
          <Text style={styles.headerTitle}>{params.title}</Text>
          <View style={styles.backButton} />
        </View>
        <View style={styles.listContent}>
          <ProductGridSkeleton rows={4} />
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Pressable style={styles.backButton} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={22} color={colors.textPrimary} />
        </Pressable>
        <Text style={styles.headerTitle}>{params.title}</Text>
        <View style={styles.backButton} />
      </View>

      {filtered.length === 0 ? (
        <View style={styles.emptyState}>
          <Ionicons name="cube-outline" size={40} color={colors.textMuted} />
          <Text style={styles.emptyText}>No products yet in this category</Text>
        </View>
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={(item) => item.id}
          numColumns={2}
          columnWrapperStyle={styles.productRow}
          contentContainerStyle={styles.listContent}
          renderItem={({ item }) => (
            <CategoryProductCard
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
      flex: 1,
      alignItems: "center",
      justifyContent: "center",
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
