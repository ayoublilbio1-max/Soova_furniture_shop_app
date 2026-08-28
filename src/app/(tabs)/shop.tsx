// Shop tab — search + photo search, Explore/New Sale/Vintage/Modern tabs,
// promo banner with countdown, sale coupons row, infinite-scroll product grid.

import { ProductGridSkeleton } from "@/components/ui/product-grid-skeleton";
import { RemoteImage } from "@/components/ui/remote-image";
import { ShopSkeleton } from "@/components/ui/shop-skeleton";
import { ThemeColors } from "@/constants/colors";
import { Fonts } from "@/constants/fonts";
import { bestSellerIds } from "@/data/product-badges";
import { Product, products } from "@/data/products";
import { useDeferredReady } from "@/hooks/use-deferred-ready";
import { useThemeColors } from "@/hooks/use-theme-colors";
import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import * as ImagePicker from "expo-image-picker";
import { router } from "expo-router";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Animated,
  Easing,
  FlatList,
  InteractionManager,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";

const WISHLIST_ACTIVE_COLOR = "#DC143C";
const AnimatedPressable = Animated.createAnimatedComponent(Pressable);
const PAGE_SIZE = 10;
const SALE_COUNTDOWN_SECONDS = 10 * 3600 + 15 * 60 + 36;

type TabId = "explore" | "new-sale" | "vintage" | "modern";

const TABS: { id: TabId; label: string }[] = [
  { id: "explore", label: "Explore" },
  { id: "new-sale", label: "New Sale" },
  { id: "vintage", label: "Vintage" },
  { id: "modern", label: "Modern" },
];

type Coupon = {
  id: string;
  amountOff: number;
  minOrder: number;
  code?: string;
  isSpecial?: boolean;
};

const COUPONS: Coupon[] = [
  { id: "c1", amountOff: 5, minOrder: 50, isSpecial: true },
  { id: "c2", amountOff: 2, minOrder: 20, isSpecial: true },
  { id: "c3", amountOff: 50, minOrder: 400, code: "SOOVA55" },
  { id: "c4", amountOff: 3, minOrder: 30, code: "SOOVA10" },
];

// --- Category-style tab chip (Explore / New Sale / Vintage / Modern) ---
function ShopTab({
  label,
  active,
  colors,
  styles,
  onPress,
}: {
  label: string;
  active: boolean;
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
        styles.tabChip,
        {
          backgroundColor: colorAnim.interpolate({
            inputRange: [0, 1],
            outputRange: [colors.cardBackground, colors.accent],
          }),
        },
      ]}
      onPress={onPress}
    >
      <Animated.Text
        style={[
          styles.tabChipText,
          {
            color: colorAnim.interpolate({
              inputRange: [0, 1],
              outputRange: [colors.textPrimary, colors.onAccent],
            }),
          },
        ]}
      >
        {label}
      </Animated.Text>
    </AnimatedPressable>
  );
}

// --- New Season Sale promo banner with live countdown ---
function SaleBanner({
  colors,
  styles,
}: {
  colors: ThemeColors;
  styles: ReturnType<typeof getStyles>;
}) {
  const [secondsLeft, setSecondsLeft] = useState(SALE_COUNTDOWN_SECONDS);

  useEffect(() => {
    const interval = setInterval(() => {
      setSecondsLeft((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const hours = Math.floor(secondsLeft / 3600);
  const minutes = Math.floor((secondsLeft % 3600) / 60);
  const seconds = secondsLeft % 60;

  return (
    <View style={styles.banner}>
      {/* Local asset, not a remote fetch — unaffected by the cold-start
          network image bug that RemoteImage exists to work around. */}
      <Image
        source={require("../../../assets/images/new_sales.webp")}
        style={styles.bannerImage}
        contentFit="contain"
      />
      <View style={styles.bannerContent}>
        <View style={styles.timerRow}>
          <Text style={styles.timerLabel}>Sale Ends in:</Text>
          <View style={styles.timerBox}>
            <Text style={styles.timerText}>
              {hours.toString().padStart(2, "0")}
            </Text>
          </View>
          <Text style={styles.timerColon}>:</Text>
          <View style={styles.timerBox}>
            <Text style={styles.timerText}>
              {minutes.toString().padStart(2, "0")}
            </Text>
          </View>
          <Text style={styles.timerColon}>:</Text>
          <View style={styles.timerBox}>
            <Text style={styles.timerText}>
              {seconds.toString().padStart(2, "0")}
            </Text>
          </View>
        </View>

        <Text style={styles.bannerTitle}>
          NEW SEASON <Text style={{ color: colors.accent }}>SALE</Text>
        </Text>
        <Text style={styles.bannerSubtitle}>
          Up to 80% off on selected items
        </Text>
      </View>
    </View>
  );
}

// --- Single "Sale coupons" card, toggles to a collected state on tap ---
function CouponCard({
  coupon,
  colors,
  styles,
}: {
  coupon: Coupon;
  colors: ThemeColors;
  styles: ReturnType<typeof getStyles>;
}) {
  const [collected, setCollected] = useState(false);
  const scaleAnim = useRef(new Animated.Value(1)).current;

  function handleCollect() {
    setCollected(true);
    Animated.sequence([
      Animated.timing(scaleAnim, {
        toValue: 1.05,
        duration: 100,
        easing: Easing.ease,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 150,
        easing: Easing.ease,
        useNativeDriver: true,
      }),
    ]).start();
  }

  return (
    <Animated.View
      style={[styles.couponCard, { transform: [{ scale: scaleAnim }] }]}
    >
      <Text style={styles.couponAmount}>
        ${coupon.amountOff} <Text style={styles.couponOff}>OFF</Text>
      </Text>
      <Text style={styles.couponMinOrder}>orders ${coupon.minOrder}+</Text>
      <View style={styles.couponDivider} />
      {coupon.isSpecial ? (
        <View style={styles.couponSpecialTag}>
          <Text style={styles.couponSpecialText}>Special coupon</Text>
        </View>
      ) : (
        <Text style={styles.couponCode}>{coupon.code}</Text>
      )}
      <Pressable
        style={[
          styles.collectButton,
          collected && styles.collectButtonCollected,
        ]}
        onPress={handleCollect}
        disabled={collected}
      >
        <Text style={styles.collectButtonText}>
          {collected ? "Collected" : "Collect"}
        </Text>
      </Pressable>
    </Animated.View>
  );
}

// --- Product grid card: badges, title, sale/rating, price/cart ---
type ShopProductCardProps = {
  item: Product;
  colors: ThemeColors;
  styles: ReturnType<typeof getStyles>;
  isWishlisted: boolean;
  onToggleWishlist: (id: string) => void;
  onAddToCart: () => void;
};

function ShopProductCard({
  item,
  colors,
  styles,
  isWishlisted,
  onToggleWishlist,
  onAddToCart,
}: ShopProductCardProps) {
  const wishlistScaleAnim = useRef(new Animated.Value(1)).current;
  const cartScaleAnim = useRef(new Animated.Value(1)).current;
  const isBestSeller = bestSellerIds.has(item.id);

  function popAnimation(anim: Animated.Value) {
    Animated.sequence([
      Animated.timing(anim, {
        toValue: 1.3,
        duration: 150,
        easing: Easing.ease,
        useNativeDriver: true,
      }),
      Animated.timing(anim, {
        toValue: 1,
        duration: 150,
        easing: Easing.ease,
        useNativeDriver: true,
      }),
    ]).start();
  }

  function handleWishlistPress() {
    onToggleWishlist(item.id);
    popAnimation(wishlistScaleAnim);
  }

  function handleCartPress() {
    onAddToCart();
    popAnimation(cartScaleAnim);
  }

  return (
    <View style={styles.productCard}>
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
        <AnimatedPressable
          style={[styles.cartButton, { transform: [{ scale: cartScaleAnim }] }]}
          onPress={handleCartPress}
        >
          <Ionicons name="cart-outline" size={18} color={colors.onAccent} />
        </AnimatedPressable>
      </View>
    </View>
  );
}

export default function Shop() {
  const colors = useThemeColors();
  const styles = getStyles(colors);

  // --- Defers building the heavy content below until the tab transition
  // has finished, so the skeleton (cheap) is what paints instantly on tap ---
  const ready = useDeferredReady();

  // --- Screen state ---
  const [activeTab, setActiveTab] = useState<TabId>("explore");
  const [tabTransitioning, setTabTransitioning] = useState(false);
  const [wishlisted, setWishlisted] = useState<Set<string>>(new Set());
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  const [loadingMore, setLoadingMore] = useState(false);

  // --- Explore / New Sale / Vintage / Modern filtering ---
  const filteredProducts = useMemo(() => {
    switch (activeTab) {
      case "new-sale":
        return products.filter((item) => !!item.salePercent);
      case "vintage":
        return products.filter((item) => item.style === "vintage");
      case "modern":
        return products.filter((item) => item.style === "modern");
      case "explore":
      default:
        return products;
    }
  }, [activeTab]);

  // --- Reset infinite scroll back to the first page whenever the tab changes ---
  useEffect(() => {
    setVisibleCount(PAGE_SIZE);
  }, [activeTab]);

  // --- Show the grid skeleton for a beat after switching tabs, so the
  // heavy re-render of up to 10 fresh cards doesn't block the tap feedback ---
  useEffect(() => {
    const task = InteractionManager.runAfterInteractions(() => {
      setTabTransitioning(false);
    });
    return () => task.cancel();
  }, [activeTab]);

  function handleTabPress(id: TabId) {
    setTabTransitioning(true);
    setActiveTab(id);
  }

  const visibleProducts = filteredProducts.slice(0, visibleCount);
  const hasMore = visibleCount < filteredProducts.length;

  function toggleWishlist(id: string) {
    setWishlisted((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  }

  function notImplemented(label: string) {
    Alert.alert(
      label,
      "This will continue once the corresponding screen is built.",
    );
  }

  // --- Infinite scroll: simulates a fetch delay, then reveals the next 10 ---
  function handleLoadMore() {
    if (!hasMore || loadingMore) return;
    setLoadingMore(true);
    setTimeout(() => {
      setVisibleCount((prev) =>
        Math.min(prev + PAGE_SIZE, filteredProducts.length),
      );
      setLoadingMore(false);
    }, 700);
  }

  // --- "Search with photo" button next to the search bar ---
  async function handlePhotoSearch() {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      Alert.alert(
        "Permission needed",
        "Allow photo access to search with an image.",
      );
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.8,
    });

    if (!result.canceled) {
      Alert.alert(
        "Search by Photo",
        "This will continue once the corresponding screen is built.",
      );
    }
  }

  if (!ready) {
    return (
      <View style={styles.screen}>
        <ShopSkeleton />
      </View>
    );
  }

  return (
    <View style={styles.screen}>
      <FlatList
        data={tabTransitioning ? [] : visibleProducts}
        keyExtractor={(item) => item.id}
        numColumns={2}
        columnWrapperStyle={styles.productRow}
        contentContainerStyle={styles.listContent}
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.5}
        ListHeaderComponent={
          <>
            {/* --- Search bar + search-by-photo button --- */}
            <View style={styles.searchRow}>
              <Pressable
                style={styles.searchWrapper}
                onPress={() => router.push("/search")}
              >
                <Ionicons name="search" size={20} color={colors.textMuted} />
                <Text style={styles.searchPlaceholder}>
                  Search furniture, categories...
                </Text>
              </Pressable>
              <Pressable
                style={styles.photoSearchButton}
                onPress={handlePhotoSearch}
              >
                <Ionicons
                  name="camera-outline"
                  size={20}
                  color={colors.onAccent}
                />
              </Pressable>
            </View>

            {/* --- Explore / New Sale / Vintage / Modern tabs --- */}
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.tabsRow}
            >
              {TABS.map((tab) => (
                <ShopTab
                  key={tab.id}
                  label={tab.label}
                  active={activeTab === tab.id}
                  colors={colors}
                  styles={styles}
                  onPress={() => handleTabPress(tab.id)}
                />
              ))}
            </ScrollView>

            {/* --- Sale banner --- */}
            <SaleBanner colors={colors} styles={styles} />

            {/* --- Sale coupons header --- */}
            <View style={styles.couponHeaderRow}>
              <Pressable
                style={styles.couponHeaderLeft}
                onPress={() => notImplemented("Sale Coupons")}
              >
                <Text style={styles.couponHeaderTitle}>
                  <Text style={{ color: colors.accent }}>Sale</Text> coupons
                </Text>
                <Ionicons
                  name="chevron-forward"
                  size={16}
                  color={colors.textPrimary}
                />
              </Pressable>
              <Pressable
                onPress={() => notImplemented("Coupon Applicable Items")}
              >
                <Text style={styles.couponApplicableLink}>
                  <Text style={{ color: colors.accent }}>
                    Coupon applicable
                  </Text>{" "}
                  items
                </Text>
              </Pressable>
            </View>

            {/* --- Sale coupons row --- */}
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.couponsRow}
            >
              {COUPONS.map((coupon) => (
                <CouponCard
                  key={coupon.id}
                  coupon={coupon}
                  colors={colors}
                  styles={styles}
                />
              ))}
            </ScrollView>
          </>
        }
        ListFooterComponent={
          loadingMore ? (
            <ActivityIndicator
              color={colors.accent}
              style={styles.loadingIndicator}
            />
          ) : null
        }
        ListEmptyComponent={
          tabTransitioning ? (
            <ProductGridSkeleton rows={4} />
          ) : (
            <View style={styles.emptyState}>
              <Ionicons
                name="cube-outline"
                size={40}
                color={colors.textMuted}
              />
              <Text style={styles.emptyText}>
                No products in this category yet
              </Text>
            </View>
          )
        }
        renderItem={({ item }) => (
          <ShopProductCard
            item={item}
            colors={colors}
            styles={styles}
            isWishlisted={wishlisted.has(item.id)}
            onToggleWishlist={toggleWishlist}
            onAddToCart={() => notImplemented("Add to Cart")}
          />
        )}
      />
    </View>
  );
}

function getStyles(colors: ThemeColors) {
  return StyleSheet.create({
    // --- Screen / list container ---
    screen: {
      flex: 1,
      backgroundColor: colors.background,
    },
    listContent: {
      paddingHorizontal: 24,
      paddingTop: 60,
      paddingBottom: 40,
    },

    // --- Search bar + photo search button ---
    searchRow: {
      flexDirection: "row",
      gap: 10,
      marginBottom: 20,
    },
    searchWrapper: {
      flex: 1,
      flexDirection: "row",
      alignItems: "center",
      gap: 10,
      backgroundColor: colors.cardBackground,
      borderRadius: 16,
      paddingHorizontal: 16,
      height: 52,
    },
    searchPlaceholder: {
      flex: 1,
      fontFamily: Fonts.regular,
      fontSize: 14,
      color: colors.textMuted,
    },
    photoSearchButton: {
      width: 52,
      height: 52,
      borderRadius: 16,
      backgroundColor: colors.accent,
      alignItems: "center",
      justifyContent: "center",
    },

    // --- Explore/New Sale/Vintage/Modern tabs ---
    tabsRow: {
      gap: 10,
      marginBottom: 20,
    },
    tabChip: {
      borderRadius: 20,
      paddingHorizontal: 18,
      height: 38,
      alignItems: "center",
      justifyContent: "center",
    },
    tabChipText: {
      fontFamily: Fonts.semiBold,
      fontSize: 13,
    },

    // --- Sale banner ---
    banner: {
      backgroundColor: colors.dealBg,
      borderRadius: 24,
      padding: 20,
      marginBottom: 24,
      overflow: "hidden",
    },
    bannerImage: {
      position: "absolute",
      top: "50%",
      transform: [{ translateY: -50 }], // Half of the 140 height
      right: 0,
      width: 140,
      height: 140,
    },
    bannerContent: {
      maxWidth: "62%",
    },
    timerRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: 6,
      marginBottom: 12,
    },
    timerLabel: {
      fontFamily: Fonts.medium,
      fontSize: 12,
      color: colors.textMuted,
      marginRight: 4,
    },
    timerBox: {
      backgroundColor: colors.background,
      borderRadius: 8,
      paddingHorizontal: 8,
      paddingVertical: 4,
    },
    timerText: {
      fontFamily: Fonts.bold,
      fontSize: 13,
      color: colors.accent,
    },
    timerColon: {
      fontFamily: Fonts.semiBold,
      color: colors.textMuted,
    },
    bannerTitle: {
      fontFamily: Fonts.bold,
      fontSize: 22,
      lineHeight: 26,
      color: colors.textPrimary,
      marginBottom: 8,
    },
    bannerSubtitle: {
      fontFamily: Fonts.regular,
      fontSize: 13,
      color: colors.textMuted,
    },

    // --- Sale coupons ---
    couponHeaderRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: 16,
    },
    couponHeaderLeft: {
      flexDirection: "row",
      alignItems: "center",
      gap: 4,
    },
    couponHeaderTitle: {
      fontFamily: Fonts.bold,
      fontSize: 17,
      color: colors.textPrimary,
    },
    couponApplicableLink: {
      fontFamily: Fonts.medium,
      fontSize: 13,
      color: colors.textPrimary,
    },
    couponsRow: {
      gap: 12,
      marginBottom: 28,
    },
    couponCard: {
      width: 140,
      backgroundColor: colors.dealBg,
      borderRadius: 16,
      padding: 16,
      alignItems: "center",
    },
    couponAmount: {
      fontFamily: Fonts.bold,
      fontSize: 18,
      color: colors.accent,
      marginBottom: 4,
    },
    couponOff: {
      fontFamily: Fonts.semiBold,
      fontSize: 12,
      color: colors.accent,
    },
    couponMinOrder: {
      fontFamily: Fonts.regular,
      fontSize: 12,
      color: colors.textMuted,
      marginBottom: 12,
      textAlign: "center",
    },
    couponDivider: {
      width: "100%",
      height: 1,
      borderStyle: "dashed",
      borderWidth: 1,
      borderColor: colors.outline,
      marginBottom: 12,
    },
    couponSpecialTag: {
      backgroundColor: colors.background,
      borderRadius: 12,
      paddingHorizontal: 10,
      paddingVertical: 4,
      marginBottom: 12,
    },
    couponSpecialText: {
      fontFamily: Fonts.medium,
      fontSize: 11,
      color: colors.textPrimary,
    },
    couponCode: {
      fontFamily: Fonts.bold,
      fontSize: 13,
      color: colors.textPrimary,
      marginBottom: 12,
    },
    collectButton: {
      backgroundColor: colors.accent,
      borderRadius: 20,
      paddingHorizontal: 20,
      paddingVertical: 8,
      width: "100%",
      alignItems: "center",
    },
    collectButtonCollected: {
      backgroundColor: colors.textMuted,
    },
    collectButtonText: {
      fontFamily: Fonts.semiBold,
      fontSize: 13,
      color: colors.onAccent,
    },

    // --- Product grid ---
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
    cartButton: {
      width: 32,
      height: 32,
      borderRadius: 10,
      backgroundColor: colors.accent,
      alignItems: "center",
      justifyContent: "center",
    },
    loadingIndicator: {
      marginVertical: 20,
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
