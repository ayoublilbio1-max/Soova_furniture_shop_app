// Shop tab — search + photo search, Explore/New Sale/Vintage/Modern tabs,
// promo banner with countdown, sale coupons row, infinite-scroll product grid.

import { AddToCartButton } from "@/components/ui/add-to-cart-button";
import { CouponCard } from "@/components/ui/coupon-card";
import { ProductGridSkeleton } from "@/components/ui/product-grid-skeleton";
import { RemoteImage } from "@/components/ui/remote-image";
import { ShopSkeleton } from "@/components/ui/shop-skeleton";
import { ThemeColors } from "@/constants/colors";
import { Fonts } from "@/constants/fonts";
import { SHOP_COUPONS } from "@/data/coupons";
import { bestSellerIds } from "@/data/product-badges";
import { Product, products } from "@/data/products";
import { useDeferredReady } from "@/hooks/use-deferred-ready";
import { useThemeColors } from "@/hooks/use-theme-colors";
import { useWishlistStore } from "@/store/wishlist-store";
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
  Modal,
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

// --- Product grid card: badges, title, sale/rating, price/cart ---
type ShopProductCardProps = {
  item: Product;
  colors: ThemeColors;
  styles: ReturnType<typeof getStyles>;
  isWishlisted: boolean;
  onToggleWishlist: (id: string) => void;
  onPress: () => void;
};

function ShopProductCard({
  item,
  colors,
  styles,
  isWishlisted,
  onToggleWishlist,
  onPress,
}: ShopProductCardProps) {
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

export default function Shop() {
  const colors = useThemeColors();
  const styles = getStyles(colors);

  // --- Defers building the heavy content below until the tab transition
  // has finished, so the skeleton (cheap) is what paints instantly on tap ---
  const ready = useDeferredReady();

  // --- Global wishlist state, shared with every other screen and the
  // Wishlist tab itself ---
  const wishlistedIds = useWishlistStore((s) => s.wishlistedIds);
  const toggleWishlist = useWishlistStore((s) => s.toggleWishlist);

  // --- Screen state ---
  const [activeTab, setActiveTab] = useState<TabId>("explore");
  const [tabTransitioning, setTabTransitioning] = useState(false);
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  const [loadingMore, setLoadingMore] = useState(false);

  // --- Busy state for the photo search button. Requesting permission and
  // opening the system image picker takes a real moment, so the button
  // acknowledges the tap immediately and can't be fired twice. ---
  const [isPhotoSearching, setIsPhotoSearching] = useState(false);

  // --- Shown after a photo is picked, explaining that visual search isn't
  // wired to a live service in this portfolio build. ---
  const [visualSearchModalVisible, setVisualSearchModalVisible] =
    useState(false);

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

  function openProductDetails(id: string) {
    router.push({ pathname: "/product-details", params: { id } });
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
    if (isPhotoSearching) return;
    setIsPhotoSearching(true);

    try {
      const permission =
        await ImagePicker.requestMediaLibraryPermissionsAsync();
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
        setVisualSearchModalVisible(true);
      }
    } finally {
      // finally: clears the busy state on every exit path — permission
      // denied, picker cancelled, image chosen, or an unexpected error.
      setIsPhotoSearching(false);
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
                style={[
                  styles.photoSearchButton,
                  isPhotoSearching && styles.photoSearchButtonBusy,
                ]}
                onPress={handlePhotoSearch}
                disabled={isPhotoSearching}
              >
                {isPhotoSearching ? (
                  <ActivityIndicator color={colors.onAccent} size="small" />
                ) : (
                  <Ionicons
                    name="camera-outline"
                    size={20}
                    color={colors.onAccent}
                  />
                )}
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
              <Text style={styles.couponHeaderTitle}>
                <Text style={{ color: colors.accent }}>Sale</Text> coupons
              </Text>
              <Ionicons
                name="chevron-forward"
                size={16}
                color={colors.textPrimary}
              />
              <Text style={styles.couponApplicableLink}>
                <Text style={{ color: colors.accent }}>Coupon applicable</Text>{" "}
                items
              </Text>
            </View>

            {/* --- Sale coupons row --- */}
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.couponsRow}
            >
              {SHOP_COUPONS.map((coupon) => (
                <CouponCard key={coupon.id} coupon={coupon} colors={colors} />
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
            isWishlisted={!!wishlistedIds[item.id]}
            onToggleWishlist={toggleWishlist}
            onPress={() => openProductDetails(item.id)}
          />
        )}
      />

      {/* --- Visual search demo notice --- */}
      <Modal
        transparent
        visible={visualSearchModalVisible}
        animationType="fade"
        onRequestClose={() => setVisualSearchModalVisible(false)}
      >
        <View style={styles.modalBackdrop}>
          <View style={styles.modalCard}>
            <View style={styles.modalIconCircle}>
              <Ionicons name="sparkles" size={26} color={colors.accent} />
            </View>

            <Text style={styles.modalTitle}>Visual Search</Text>
            <Text style={styles.modalBody}>
              Visual search matches your photo against the catalogue using an
              image recognition service.
            </Text>
            <Text style={styles.modalBody}>
              Soova is a portfolio demonstration, so this feature isn&apos;t
              connected to a live service here. Reach out to the developer to
              see it running or to build it into your own project.
            </Text>

            <Pressable
              style={styles.modalPrimaryButton}
              onPress={() => setVisualSearchModalVisible(false)}
            >
              <Text style={styles.modalPrimaryButtonText}>Got It</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
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
    photoSearchButtonBusy: {
      opacity: 0.7,
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
      backgroundColor: colors.cardBackground,
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

    // --- Sale coupons (layout only — card styling lives in CouponCard) ---
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

    // --- Visual search demo modal ---
    modalBackdrop: {
      flex: 1,
      backgroundColor: "rgba(0, 0, 0, 0.5)",
      justifyContent: "center",
      alignItems: "center",
      paddingHorizontal: 24,
    },
    modalCard: {
      width: "100%",
      backgroundColor: colors.background,
      borderRadius: 24,
      padding: 24,
    },
    modalIconCircle: {
      width: 56,
      height: 56,
      borderRadius: 28,
      backgroundColor: colors.cardBackground,
      alignItems: "center",
      justifyContent: "center",
      marginBottom: 16,
    },
    modalTitle: {
      fontFamily: Fonts.bold,
      fontSize: 20,
      color: colors.textPrimary,
      marginBottom: 12,
    },
    modalBody: {
      fontFamily: Fonts.regular,
      fontSize: 14,
      lineHeight: 21,
      color: colors.textMuted,
      marginBottom: 12,
    },
    modalPrimaryButton: {
      backgroundColor: colors.accent,
      borderRadius: 28,
      paddingVertical: 16,
      alignItems: "center",
      marginTop: 12,
    },
    modalPrimaryButtonText: {
      fontFamily: Fonts.semiBold,
      fontSize: 15,
      color: colors.onAccent,
    },
  });
}
