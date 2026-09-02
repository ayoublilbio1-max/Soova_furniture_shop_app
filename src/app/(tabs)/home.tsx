// Home tab — location header, search, promo banner carousel, category
// shortcuts, flash sale, sort product grid, best sellers, shipping banner.

import { AddToCartButton } from "@/components/ui/add-to-cart-button";
import { HomeSkeleton } from "@/components/ui/home-skeleton";
import { ProductGridSkeleton } from "@/components/ui/product-grid-skeleton";
import { RemoteImage } from "@/components/ui/remote-image";
import { ScrollProgressBar } from "@/components/ui/scroll-progress-bar";
import { ThemeColors } from "@/constants/colors";
import { Fonts } from "@/constants/fonts";
import { categories } from "@/data/categories";
import { bestSellerIds } from "@/data/product-badges";
import { Product, products } from "@/data/products";
import { useDeferredReady } from "@/hooks/use-deferred-ready";
import { useThemeColors } from "@/hooks/use-theme-colors";
import { useProfileStore } from "@/store/profile-store";
import { useWishlistStore } from "@/store/wishlist-store";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  Alert,
  Animated,
  Easing,
  InteractionManager,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from "react-native";

const FILTERS = ["All", "Newest", "Popular"];
const FLASH_SALE_SECONDS = 2 * 3600 + 12 * 60 + 56;
const DEFAULT_LOCATION = "Casablanca, Morocco";
const WISHLIST_ACTIVE_COLOR = "#DC143C";
const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

// Promo banner images live outside product data (they're editorial, not
// product photos), so they carry their own explicit primary/fallback URLs.
const SUPABASE_GENERAL_BASE =
  "https://limjfxtziyciiyxjuyyh.supabase.co/storage/v1/object/public/product-images/product-images";
const CLOUDFLARE_GENERAL_BASE =
  "https://pub-e5c0dd26c2e74f5686552a5198a41513.r2.dev";

const BANNER_SLIDES = [
  {
    id: "wine-sofa",
    uri: `${SUPABASE_GENERAL_BASE}/one_seater_sofa/sofa_07/color_wine_07_full.webp`,
    fallbackUri: `${CLOUDFLARE_GENERAL_BASE}/one_seater_sofa/sofa_07/color_wine_07_full.webp`,
  },
  {
    id: "coffee-sofa",
    uri: `${SUPABASE_GENERAL_BASE}/two_seater_sofa/sofa_03/color_coffe_full.webp`,
    fallbackUri: `${CLOUDFLARE_GENERAL_BASE}/two_seater_sofa/sofa_03/color_coffe_full.webp`,
  },
  {
    id: "sofa-04",
    uri: `${SUPABASE_GENERAL_BASE}/one_seater_sofa/sofa_04/product_04_a_full.webp`,
    fallbackUri: `${CLOUDFLARE_GENERAL_BASE}/one_seater_sofa/sofa_04/product_04_a_full.webp`,
  },
  {
    id: "sofa-06",
    uri: `${SUPABASE_GENERAL_BASE}/one_seater_sofa/sofa_06/product_06_a_full.webp`,
    fallbackUri: `${CLOUDFLARE_GENERAL_BASE}/one_seater_sofa/sofa_06/product_06_a_full.webp`,
  },
];

// --- Product grid card (used in the main sort/filter section) ---
type ProductCardProps = {
  item: Product;
  colors: ThemeColors;
  styles: ReturnType<typeof getStyles>;
  isWishlisted: boolean;
  onToggleWishlist: (id: string) => void;
  onPress: () => void;
};

function ProductCard({
  item,
  colors,
  styles,
  isWishlisted,
  onToggleWishlist,
  onPress,
}: ProductCardProps) {
  const isBestSeller = bestSellerIds.has(item.id);

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
      <Pressable
        style={styles.wishlistButton}
        onPress={() => onToggleWishlist(item.id)}
      >
        <Ionicons
          name={isWishlisted ? "heart" : "heart-outline"}
          size={18}
          color={isWishlisted ? WISHLIST_ACTIVE_COLOR : colors.accent}
        />
      </Pressable>

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

// --- "See All" text button with a small scale-pop on press ---
function SeeAllButton({
  colors,
  styles,
  onPress,
}: {
  colors: ThemeColors;
  styles: ReturnType<typeof getStyles>;
  onPress: () => void;
}) {
  const scaleAnim = useRef(new Animated.Value(1)).current;

  function handlePressIn() {
    Animated.timing(scaleAnim, {
      toValue: 0.9,
      duration: 100,
      easing: Easing.ease,
      useNativeDriver: true,
    }).start();
  }

  function handlePressOut() {
    Animated.timing(scaleAnim, {
      toValue: 1,
      duration: 150,
      easing: Easing.ease,
      useNativeDriver: true,
    }).start();
  }

  return (
    <AnimatedPressable
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      style={{ transform: [{ scale: scaleAnim }] }}
    >
      <Text style={styles.seeAll}>See All</Text>
    </AnimatedPressable>
  );
}

// --- Single category shortcut (Sofa/Chair/Lamp/Cupboard) ---
function CategoryItem({
  name,
  icon,
  colors,
  styles,
  onPress,
}: {
  name: string;
  icon: keyof typeof MaterialCommunityIcons.glyphMap;
  colors: ThemeColors;
  styles: ReturnType<typeof getStyles>;
  onPress: () => void;
}) {
  const scaleAnim = useRef(new Animated.Value(1)).current;

  function handlePressIn() {
    Animated.timing(scaleAnim, {
      toValue: 0.9,
      duration: 100,
      easing: Easing.ease,
      useNativeDriver: true,
    }).start();
  }

  function handlePressOut() {
    Animated.timing(scaleAnim, {
      toValue: 1,
      duration: 150,
      easing: Easing.ease,
      useNativeDriver: true,
    }).start();
  }

  return (
    <AnimatedPressable
      style={[styles.categoryItem, { transform: [{ scale: scaleAnim }] }]}
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
    >
      <View style={styles.categoryIconCircle}>
        <MaterialCommunityIcons name={icon} size={26} color={colors.accent} />
      </View>
      <Text style={styles.categoryLabel}>{name}</Text>
    </AnimatedPressable>
  );
}

// --- Best Sellers row (list item, not a grid card) ---
function BestSellerRow({
  item,
  colors,
  styles,
  onPress,
}: {
  item: Product;
  colors: ThemeColors;
  styles: ReturnType<typeof getStyles>;
  onPress: () => void;
}) {
  return (
    <Pressable style={styles.bestSellerRow} onPress={onPress}>
      <RemoteImage
        uri={item.thumbPath}
        fallbackUri={item.fallbackThumbPath}
        style={styles.bestSellerImage}
      />
      <View style={styles.bestSellerInfo}>
        <Text style={styles.bestSellerName}>{item.name}</Text>
        <View style={styles.bestSellerRatingRow}>
          <Ionicons name="star" size={14} color="#F5A623" />
          <Text style={styles.bestSellerRatingText}>
            {item.rating.toFixed(1)}
          </Text>
        </View>
        <Text style={styles.bestSellerPrice}>${item.price.toFixed(2)}</Text>
      </View>
      <AddToCartButton productId={item.id} colors={colors} size={36} />
    </Pressable>
  );
}

// --- Free shipping promo row at the bottom of the screen ---
function ShippingBanner({
  colors,
  styles,
  onPress,
}: {
  colors: ThemeColors;
  styles: ReturnType<typeof getStyles>;
  onPress: () => void;
}) {
  const scaleAnim = useRef(new Animated.Value(1)).current;

  function handlePressIn() {
    Animated.timing(scaleAnim, {
      toValue: 0.97,
      duration: 100,
      easing: Easing.ease,
      useNativeDriver: true,
    }).start();
  }

  function handlePressOut() {
    Animated.timing(scaleAnim, {
      toValue: 1,
      duration: 150,
      easing: Easing.ease,
      useNativeDriver: true,
    }).start();
  }

  return (
    <AnimatedPressable
      style={[styles.shippingBanner, { transform: [{ scale: scaleAnim }] }]}
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
    >
      <View style={styles.shippingIconCircle}>
        <MaterialCommunityIcons
          name="truck-fast-outline"
          size={22}
          color="#88E788"
        />
      </View>
      <View style={styles.shippingTextWrapper}>
        <Text style={styles.shippingTitle}>Free Shipping</Text>
        <Text style={styles.shippingSubtitle}>
          Free shipping on all orders{"\n"}over $200
        </Text>
      </View>
      <Ionicons name="chevron-forward" size={20} color={colors.textMuted} />
    </AnimatedPressable>
  );
}

export default function Home() {
  const colors = useThemeColors();
  const { width: screenWidth } = useWindowDimensions();
  const bannerWidth = screenWidth - 48;
  const styles = getStyles(colors, bannerWidth);
  const params = useLocalSearchParams<{ location?: string }>();

  // --- Defers building the full heavy screen until the tab transition
  // has finished, so the skeleton is what paints instantly on first mount ---
  const ready = useDeferredReady();

  // --- Global wishlist state, shared with every other screen and the
  // Wishlist tab itself ---
  const wishlistedIds = useWishlistStore((s) => s.wishlistedIds);
  const toggleWishlist = useWishlistStore((s) => s.toggleWishlist);

  // --- Screen state ---
  const profileLocation = useProfileStore((s) => s.location);
  const profileAvatarUri = useProfileStore((s) => s.avatarUri);
  const [location, setLocation] = useState(
    params.location ?? profileLocation ?? DEFAULT_LOCATION,
  );
  const [activeFilter, setActiveFilter] = useState("Newest");
  const [timeLeft, setTimeLeft] = useState(FLASH_SALE_SECONDS);
  const [hasUnread, setHasUnread] = useState(true);
  const [gridTransitioning, setGridTransitioning] = useState(false);

  // --- Animated values ---
  // Live scroll position for each paginated horizontal scroller, driving
  // the accent-colored progress bar thumbs directly (native-driven).
  const bannerScrollX = useRef(new Animated.Value(0)).current;
  const productScrollX = useRef(new Animated.Value(0)).current;
  const bellScaleAnim = useRef(new Animated.Value(1)).current;

  // --- Location coming back from the location-search/location-access screens ---
  useEffect(() => {
    if (params.location) {
      setLocation(params.location);
    }
  }, [params.location]);

  // --- Flash sale countdown, ticks every second ---
  useEffect(() => {
    const interval = setInterval(() => {
      setTimeLeft((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  // --- Reset the product pager's scroll position and show the grid
  // skeleton for a beat whenever sort changes ---
  useEffect(() => {
    productScrollX.setValue(0);
    const task = InteractionManager.runAfterInteractions(() => {
      setGridTransitioning(false);
    });
    return () => task.cancel();
  }, [activeFilter]);

  const hours = Math.floor(timeLeft / 3600);
  const minutes = Math.floor((timeLeft % 3600) / 60);
  const seconds = timeLeft % 60;

  // --- Sort (All / Newest / Popular) ---
  const sortedProducts = useMemo(() => {
    const sorted = [...products];

    switch (activeFilter) {
      case "Newest":
        return sorted.sort(
          (a, b) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
        );
      case "Popular":
        return sorted.sort((a, b) => b.rating - a.rating);
      case "All":
      default:
        return sorted;
    }
  }, [activeFilter]);

  const displayedProducts = sortedProducts;

  // --- Split into 2-per-page chunks for the horizontal paging grid ---
  const productPages = useMemo(() => {
    const pages: Product[][] = [];
    for (let i = 0; i < displayedProducts.length; i += 2) {
      pages.push(displayedProducts.slice(i, i + 2));
    }
    return pages;
  }, [displayedProducts]);

  // --- Top 3 best sellers by salesCount ---
  const bestSellers = useMemo(
    () => [...products].sort((a, b) => b.salesCount - a.salesCount).slice(0, 3),
    [],
  );

  function notImplemented(label: string) {
    Alert.alert(
      label,
      "This will continue once the corresponding screen is built.",
    );
  }

  function openProductDetails(id: string) {
    router.push({ pathname: "/product-details", params: { id } });
  }

  function handleBellPress() {
    Animated.sequence([
      Animated.timing(bellScaleAnim, {
        toValue: 1.2,
        duration: 150,
        easing: Easing.ease,
        useNativeDriver: true,
      }),
      Animated.timing(bellScaleAnim, {
        toValue: 1,
        duration: 150,
        easing: Easing.ease,
        useNativeDriver: true,
      }),
    ]).start();
    setHasUnread(false);
    router.push("/notifications");
  }

  function handleCategoryPress(id: string, name: string) {
    if (id === "sofa") {
      router.push("/sofa-subcategories");
    } else {
      router.push({
        pathname: "/category-products",
        params: { category: id, title: name },
      });
    }
  }

  function handleSortPress(filter: string) {
    setGridTransitioning(true);
    setActiveFilter(filter);
  }

  if (!ready) {
    return (
      <View style={styles.screen}>
        <HomeSkeleton />
      </View>
    );
  }

  return (
    <View style={styles.screen}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* --- Location + notifications header --- */}
        <View style={styles.headerRow}>
          <View>
            <Text style={styles.locationLabel}>Location</Text>
            <Pressable
              style={styles.locationRow}
              onPress={() => router.push("/location-search")}
            >
              <Ionicons name="location" size={16} color={colors.accent} />
              <Text style={styles.locationValue}>{location}</Text>
              <Ionicons
                name="chevron-down"
                size={16}
                color={colors.textPrimary}
              />
            </Pressable>
          </View>
          <AnimatedPressable
            style={[
              styles.bellButton,
              { transform: [{ scale: bellScaleAnim }] },
            ]}
            onPress={handleBellPress}
          >
            <Ionicons
              name="notifications-outline"
              size={22}
              color={colors.textPrimary}
            />
            {hasUnread && <View style={styles.bellDot} />}
          </AnimatedPressable>
        </View>

        {/* --- Search bar + profile avatar --- */}
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
            style={styles.avatarButton}
            onPress={() => router.push("/(tabs)/account")}
          >
            {profileAvatarUri ? (
              <RemoteImage
                uri={profileAvatarUri}
                style={styles.avatarButtonImage}
              />
            ) : (
              <Ionicons name="person" size={20} color={colors.onAccent} />
            )}
          </Pressable>
        </View>

        {/* --- Promo banner carousel --- */}
        <Animated.ScrollView
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          onScroll={Animated.event(
            [{ nativeEvent: { contentOffset: { x: bannerScrollX } } }],
            { useNativeDriver: true },
          )}
          scrollEventThrottle={16}
          style={styles.bannerScroll}
        >
          {BANNER_SLIDES.map((slide) => (
            <View key={slide.id} style={{ width: bannerWidth }}>
              <View style={styles.banner}>
                <RemoteImage
                  uri={slide.uri}
                  fallbackUri={slide.fallbackUri}
                  style={styles.bannerImage}
                />
                <View style={styles.bannerOverlay} />
                <View style={styles.bannerText}>
                  <Text style={styles.bannerTitle}>New Collection</Text>
                  <Text style={styles.bannerSubtitle}>
                    Discount 50% for{"\n"}the first transaction
                  </Text>
                  <Pressable
                    style={styles.bannerButton}
                    onPress={() => notImplemented("Shop Now")}
                  >
                    <Text style={styles.bannerButtonText}>Shop Now</Text>
                  </Pressable>
                </View>
              </View>
            </View>
          ))}
        </Animated.ScrollView>

        <ScrollProgressBar
          scrollX={bannerScrollX}
          viewportWidth={bannerWidth}
          pageCount={BANNER_SLIDES.length}
          colors={colors}
        />

        {/* --- Category shortcuts --- */}
        <View style={styles.sectionHeaderRow}>
          <Text style={styles.sectionTitle}>Category</Text>
          <SeeAllButton
            colors={colors}
            styles={styles}
            onPress={() => router.push("/category")}
          />
        </View>

        <View style={styles.categoryRow}>
          {categories.map((category) => (
            <CategoryItem
              key={category.id}
              name={category.name}
              icon={category.icon}
              colors={colors}
              styles={styles}
              onPress={() => handleCategoryPress(category.id, category.name)}
            />
          ))}
        </View>

        {/* --- Flash sale header + live countdown --- */}
        <View style={styles.flashSaleHeaderRow}>
          <Text style={styles.sectionTitle}>Flash Sale</Text>
          <View style={styles.timerRow}>
            <Text style={styles.timerLabel}>Closing in :</Text>
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
        </View>

        {/* --- Sort chips: All / Newest / Popular --- */}
        <View style={styles.filterChipsRow}>
          {FILTERS.map((filter) => (
            <Pressable
              key={filter}
              style={[
                styles.filterChip,
                activeFilter === filter && styles.filterChipActive,
              ]}
              onPress={() => handleSortPress(filter)}
            >
              <Text
                style={[
                  styles.filterChipText,
                  activeFilter === filter && styles.filterChipTextActive,
                ]}
              >
                {filter}
              </Text>
            </Pressable>
          ))}
        </View>

        {/* --- Paginated product grid (2 per page) --- */}
        {gridTransitioning ? (
          <ProductGridSkeleton rows={1} />
        ) : displayedProducts.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons
              name="filter-outline"
              size={40}
              color={colors.textMuted}
            />
            <Text style={styles.emptyText}>No products match your filters</Text>
          </View>
        ) : (
          <>
            <Animated.ScrollView
              horizontal
              pagingEnabled
              showsHorizontalScrollIndicator={false}
              onScroll={Animated.event(
                [{ nativeEvent: { contentOffset: { x: productScrollX } } }],
                { useNativeDriver: true },
              )}
              scrollEventThrottle={16}
            >
              {productPages.map((page, pageIndex) => (
                <View
                  key={pageIndex}
                  style={[styles.productPage, { width: bannerWidth }]}
                >
                  {page.map((item) => (
                    <ProductCard
                      key={item.id}
                      item={item}
                      colors={colors}
                      styles={styles}
                      isWishlisted={!!wishlistedIds[item.id]}
                      onToggleWishlist={toggleWishlist}
                      onPress={() => openProductDetails(item.id)}
                    />
                  ))}
                </View>
              ))}
            </Animated.ScrollView>

            <ScrollProgressBar
              scrollX={productScrollX}
              viewportWidth={bannerWidth}
              pageCount={productPages.length}
              colors={colors}
            />
          </>
        )}

        {/* --- Best sellers list --- */}
        <View style={styles.sectionHeaderRow}>
          <Text style={styles.sectionTitle}>Best Sellers</Text>
          <SeeAllButton
            colors={colors}
            styles={styles}
            onPress={() => router.push("/best-sellers")}
          />
        </View>

        {bestSellers.map((item) => (
          <BestSellerRow
            key={item.id}
            item={item}
            colors={colors}
            styles={styles}
            onPress={() => openProductDetails(item.id)}
          />
        ))}

        {/* --- Free shipping promo --- */}
        <ShippingBanner
          colors={colors}
          styles={styles}
          onPress={() => notImplemented("Shipping Info")}
        />
      </ScrollView>
    </View>
  );
}

function getStyles(colors: ThemeColors, bannerWidth: number) {
  return StyleSheet.create({
    // --- Screen / scroll container ---
    screen: {
      flex: 1,
      backgroundColor: colors.background,
    },
    scrollContent: {
      paddingHorizontal: 24,
      paddingTop: 60,
      paddingBottom: 40,
    },

    // --- Header: location + notification bell ---
    headerRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "flex-start",
      marginBottom: 20,
    },
    locationLabel: {
      fontFamily: Fonts.regular,
      fontSize: 12,
      color: colors.textMuted,
      marginBottom: 4,
    },
    locationRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: 6,
    },
    locationValue: {
      fontFamily: Fonts.semiBold,
      fontSize: 15,
      color: colors.textPrimary,
    },
    bellButton: {
      width: 44,
      height: 44,
      borderRadius: 22,
      backgroundColor: colors.cardBackground,
      alignItems: "center",
      justifyContent: "center",
    },
    bellDot: {
      position: "absolute",
      top: 10,
      right: 10,
      width: 8,
      height: 8,
      borderRadius: 4,
      backgroundColor: colors.accent,
    },

    // --- Search bar + profile avatar ---
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
    avatarButton: {
      width: 52,
      height: 52,
      borderRadius: 26,
      backgroundColor: colors.accent,
      alignItems: "center",
      justifyContent: "center",
      overflow: "hidden",
    },
    avatarButtonImage: {
      width: "100%",
      height: "100%",
    },

    // --- Promo banner carousel ---
    bannerScroll: {
      marginBottom: 12,
    },
    banner: {
      height: 160,
      borderRadius: 24,
      overflow: "hidden",
      justifyContent: "center",
      padding: 20,
      marginHorizontal: 8,
    },
    bannerImage: {
      position: "absolute",
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
    },
    bannerOverlay: {
      position: "absolute",
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: "rgba(0, 0, 0, 0.25)",
    },
    bannerText: {
      maxWidth: "70%",
    },
    bannerTitle: {
      fontFamily: Fonts.bold,
      fontSize: 22,
      color: "#FFFFFF",
      marginBottom: 8,
    },
    bannerSubtitle: {
      fontFamily: Fonts.regular,
      fontSize: 13,
      lineHeight: 19,
      color: "#F0F0F0",
      marginBottom: 16,
    },
    bannerButton: {
      backgroundColor: colors.accent,
      borderRadius: 20,
      paddingVertical: 10,
      paddingHorizontal: 20,
      alignSelf: "flex-start",
    },
    bannerButtonText: {
      fontFamily: Fonts.semiBold,
      fontSize: 13,
      color: colors.onAccent,
    },

    // --- Section header (Category / Best Sellers) ---
    sectionHeaderRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: 16,
    },
    sectionTitle: {
      fontFamily: Fonts.bold,
      fontSize: 18,
      color: colors.textPrimary,
    },
    seeAll: {
      fontFamily: Fonts.semiBold,
      fontSize: 13,
      color: colors.accent,
    },

    // --- Category shortcuts ---
    categoryRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      marginBottom: 28,
    },
    categoryItem: {
      alignItems: "center",
      gap: 8,
    },
    categoryIconCircle: {
      width: 64,
      height: 64,
      borderRadius: 32,
      backgroundColor: colors.cardBackground,
      alignItems: "center",
      justifyContent: "center",
    },
    categoryLabel: {
      fontFamily: Fonts.medium,
      fontSize: 12,
      color: colors.textPrimary,
    },

    // --- Flash sale countdown ---
    flashSaleHeaderRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: 16,
    },
    timerRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: 4,
    },
    timerLabel: {
      fontFamily: Fonts.regular,
      fontSize: 12,
      color: colors.textMuted,
      marginRight: 4,
    },
    timerBox: {
      backgroundColor: colors.cardBackground,
      borderRadius: 8,
      paddingHorizontal: 8,
      paddingVertical: 4,
    },
    timerText: {
      fontFamily: Fonts.semiBold,
      fontSize: 13,
      color: colors.roseRed,
    },
    timerColon: {
      fontFamily: Fonts.semiBold,
      color: colors.textMuted,
    },

    // --- Sort chips ---
    filterChipsRow: {
      flexDirection: "row",
      gap: 10,
      marginBottom: 20,
    },
    filterChip: {
      backgroundColor: colors.cardBackground,
      borderRadius: 20,
      paddingHorizontal: 16,
      paddingVertical: 10,
    },
    filterChipActive: {
      backgroundColor: colors.accent,
    },
    filterChipText: {
      fontFamily: Fonts.medium,
      fontSize: 13,
      color: colors.textPrimary,
    },
    filterChipTextActive: {
      color: colors.onAccent,
    },

    // --- Product grid ---
    productPage: {
      flexDirection: "row",
      justifyContent: "space-between",
    },
    productCard: {
      width: "48%",
      backgroundColor: colors.cardBackground,
      borderRadius: 20,
      padding: 12,
      marginBottom: 12,
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

    // --- Best sellers row (untouched horizontal layout) ---
    bestSellerRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: 14,
      backgroundColor: colors.cardBackground,
      borderRadius: 16,
      padding: 12,
      marginBottom: 12,
    },
    bestSellerImage: {
      width: 64,
      height: 64,
      borderRadius: 12,
      backgroundColor: colors.placeholder,
    },
    bestSellerInfo: {
      flex: 1,
      gap: 4,
    },
    bestSellerName: {
      fontFamily: Fonts.semiBold,
      fontSize: 15,
      color: colors.textPrimary,
    },
    bestSellerRatingRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: 4,
    },
    bestSellerRatingText: {
      fontFamily: Fonts.medium,
      fontSize: 12,
      color: colors.textMuted,
    },
    bestSellerPrice: {
      fontFamily: Fonts.bold,
      fontSize: 15,
      color: colors.accent,
    },

    // --- Free shipping banner ---
    shippingBanner: {
      flexDirection: "row",
      alignItems: "center",
      gap: 14,
      backgroundColor: colors.cardBackground,
      borderRadius: 16,
      padding: 14,
      marginTop: 8,
      marginBottom: 20,
    },
    shippingIconCircle: {
      width: 44,
      height: 44,
      borderRadius: 22,
      backgroundColor: colors.background,
      alignItems: "center",
      justifyContent: "center",
    },
    shippingTextWrapper: {
      flex: 1,
      gap: 2,
    },
    shippingTitle: {
      fontFamily: Fonts.semiBold,
      fontSize: 15,
      color: colors.textPrimary,
    },
    shippingSubtitle: {
      fontFamily: Fonts.regular,
      fontSize: 12,
      lineHeight: 17,
      color: colors.textMuted,
    },
  });
}
