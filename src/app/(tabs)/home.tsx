// Home tab — location header, search, promo banner carousel, category
// shortcuts, flash sale, sort/filter product grid, best sellers, shipping banner.

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
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  Alert,
  Animated,
  Easing,
  InteractionManager,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  useWindowDimensions,
  View,
} from "react-native";

const FILTERS = ["All", "Newest", "Popular"];
const FLASH_SALE_SECONDS = 2 * 3600 + 12 * 60 + 56;
const DEFAULT_LOCATION = "Casablanca, Morocco";
const WISHLIST_ACTIVE_COLOR = "#DC143C";
const RATING_OPTIONS = [
  { label: "Any", value: 0 },
  { label: "3+", value: 3 },
  { label: "4+", value: 4 },
  { label: "4.5+", value: 4.5 },
];
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

type FilterState = {
  minPrice: string;
  maxPrice: string;
  categoryIds: Set<string>;
  minRating: number;
};

const EMPTY_FILTERS: FilterState = {
  minPrice: "",
  maxPrice: "",
  categoryIds: new Set(),
  minRating: 0,
};

// --- Product grid card (used in the main sort/filter section) ---
type ProductCardProps = {
  item: Product;
  colors: ThemeColors;
  styles: ReturnType<typeof getStyles>;
  isWishlisted: boolean;
  onToggleWishlist: (id: string) => void;
  onAddToCart: () => void;
};

function ProductCard({
  item,
  colors,
  styles,
  isWishlisted,
  onToggleWishlist,
  onAddToCart,
}: ProductCardProps) {
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

// --- Minimum rating chip used inside the filter modal ---
function RatingChip({
  label,
  value,
  activeValue,
  colors,
  styles,
  onPress,
}: {
  label: string;
  value: number;
  activeValue: number;
  colors: ThemeColors;
  styles: ReturnType<typeof getStyles>;
  onPress: () => void;
}) {
  const active = value === activeValue;
  const colorAnim = useRef(new Animated.Value(active ? 1 : 0)).current;

  useEffect(() => {
    Animated.timing(colorAnim, {
      toValue: active ? 1 : 0,
      duration: 200,
      easing: Easing.ease,
      useNativeDriver: false,
    }).start();
  }, [active, colorAnim]);

  return (
    <AnimatedPressable
      style={[
        styles.ratingChip,
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
          styles.ratingChipText,
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
  onAddToCart,
}: {
  item: Product;
  colors: ThemeColors;
  styles: ReturnType<typeof getStyles>;
  onAddToCart: () => void;
}) {
  const cartScaleAnim = useRef(new Animated.Value(1)).current;

  function handleCartPress() {
    onAddToCart();
    Animated.sequence([
      Animated.timing(cartScaleAnim, {
        toValue: 1.2,
        duration: 150,
        easing: Easing.ease,
        useNativeDriver: true,
      }),
      Animated.timing(cartScaleAnim, {
        toValue: 1,
        duration: 150,
        easing: Easing.ease,
        useNativeDriver: true,
      }),
    ]).start();
  }

  return (
    <View style={styles.bestSellerRow}>
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
      <AnimatedPressable
        style={[
          styles.bestSellerCartButton,
          { transform: [{ scale: cartScaleAnim }] },
        ]}
        onPress={handleCartPress}
      >
        <Ionicons name="cart-outline" size={18} color={colors.onAccent} />
      </AnimatedPressable>
    </View>
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

  // --- Screen state ---
  const [location, setLocation] = useState(params.location ?? DEFAULT_LOCATION);
  const [activeFilter, setActiveFilter] = useState("Newest");
  const [wishlisted, setWishlisted] = useState<Set<string>>(new Set());
  const [timeLeft, setTimeLeft] = useState(FLASH_SALE_SECONDS);
  const [hasUnread, setHasUnread] = useState(true);
  const [gridTransitioning, setGridTransitioning] = useState(false);

  const [filterModalVisible, setFilterModalVisible] = useState(false);
  const [draftFilters, setDraftFilters] = useState<FilterState>(EMPTY_FILTERS);
  const [appliedFilters, setAppliedFilters] =
    useState<FilterState>(EMPTY_FILTERS);

  // --- Animated values ---
  // Live scroll position for each paginated horizontal scroller, driving
  // the accent-colored progress bar thumbs directly (native-driven).
  const bannerScrollX = useRef(new Animated.Value(0)).current;
  const productScrollX = useRef(new Animated.Value(0)).current;
  const bellScaleAnim = useRef(new Animated.Value(1)).current;
  const filterScaleAnim = useRef(new Animated.Value(1)).current;
  const resetScaleAnim = useRef(new Animated.Value(1)).current;
  const applyScaleAnim = useRef(new Animated.Value(1)).current;

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
  // skeleton for a beat whenever sort or filters change ---
  useEffect(() => {
    productScrollX.setValue(0);
    const task = InteractionManager.runAfterInteractions(() => {
      setGridTransitioning(false);
    });
    return () => task.cancel();
  }, [activeFilter, appliedFilters]);

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

  // --- Price/category/rating filter modal applied on top of the sort ---
  const displayedProducts = useMemo(() => {
    return sortedProducts.filter((item) => {
      if (
        appliedFilters.minPrice &&
        item.price < Number(appliedFilters.minPrice)
      ) {
        return false;
      }
      if (
        appliedFilters.maxPrice &&
        item.price > Number(appliedFilters.maxPrice)
      ) {
        return false;
      }
      if (
        appliedFilters.categoryIds.size > 0 &&
        !appliedFilters.categoryIds.has(item.category)
      ) {
        return false;
      }
      if (item.rating < appliedFilters.minRating) {
        return false;
      }
      return true;
    });
  }, [sortedProducts, appliedFilters]);

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

  const hasActiveFilters =
    appliedFilters.minPrice !== "" ||
    appliedFilters.maxPrice !== "" ||
    appliedFilters.categoryIds.size > 0 ||
    appliedFilters.minRating > 0;

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

  function handleFilterPressIn() {
    Animated.timing(filterScaleAnim, {
      toValue: 0.9,
      duration: 100,
      easing: Easing.ease,
      useNativeDriver: true,
    }).start();
  }

  function handleFilterPressOut() {
    Animated.timing(filterScaleAnim, {
      toValue: 1,
      duration: 150,
      easing: Easing.ease,
      useNativeDriver: true,
    }).start();
  }

  function handleResetPressIn() {
    Animated.timing(resetScaleAnim, {
      toValue: 0.95,
      duration: 100,
      easing: Easing.ease,
      useNativeDriver: true,
    }).start();
  }

  function handleResetPressOut() {
    Animated.timing(resetScaleAnim, {
      toValue: 1,
      duration: 150,
      easing: Easing.ease,
      useNativeDriver: true,
    }).start();
  }

  function handleApplyPressIn() {
    Animated.timing(applyScaleAnim, {
      toValue: 0.95,
      duration: 100,
      easing: Easing.ease,
      useNativeDriver: true,
    }).start();
  }

  function handleApplyPressOut() {
    Animated.timing(applyScaleAnim, {
      toValue: 1,
      duration: 150,
      easing: Easing.ease,
      useNativeDriver: true,
    }).start();
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

  function openFilterModal() {
    setDraftFilters(appliedFilters);
    setFilterModalVisible(true);
  }

  function toggleDraftCategory(id: string) {
    setDraftFilters((prev) => {
      const next = new Set(prev.categoryIds);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return { ...prev, categoryIds: next };
    });
  }

  function applyFilters() {
    setGridTransitioning(true);
    setAppliedFilters(draftFilters);
    setFilterModalVisible(false);
  }

  function resetFilters() {
    setDraftFilters(EMPTY_FILTERS);
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

        {/* --- Search bar + filter button --- */}
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
          <AnimatedPressable
            style={[
              styles.filterButton,
              { transform: [{ scale: filterScaleAnim }] },
            ]}
            onPress={openFilterModal}
            onPressIn={handleFilterPressIn}
            onPressOut={handleFilterPressOut}
          >
            <Ionicons
              name="options-outline"
              size={20}
              color={colors.onAccent}
            />
            {hasActiveFilters && <View style={styles.filterDot} />}
          </AnimatedPressable>
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
                      isWishlisted={wishlisted.has(item.id)}
                      onToggleWishlist={toggleWishlist}
                      onAddToCart={() => notImplemented("Add to Cart")}
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
            onAddToCart={() => notImplemented("Add to Cart")}
          />
        ))}

        {/* --- Free shipping promo --- */}
        <ShippingBanner
          colors={colors}
          styles={styles}
          onPress={() => notImplemented("Shipping Info")}
        />
      </ScrollView>

      {/* --- Filter modal (price / category / rating) --- */}
      <Modal
        transparent
        visible={filterModalVisible}
        animationType="slide"
        onRequestClose={() => setFilterModalVisible(false)}
      >
        <View style={styles.filterModalBackdrop}>
          <View style={styles.filterModalCard}>
            <View style={styles.filterModalHeader}>
              <Text style={styles.filterModalTitle}>Filters</Text>
              <Pressable onPress={() => setFilterModalVisible(false)}>
                <Ionicons name="close" size={22} color={colors.textPrimary} />
              </Pressable>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              <Text style={styles.filterSectionLabel}>Price Range</Text>
              <View style={styles.priceRow}>
                <View style={styles.priceInputWrapper}>
                  <Text style={styles.priceCurrency}>$</Text>
                  <TextInput
                    style={styles.priceInput}
                    placeholder="Min"
                    placeholderTextColor={colors.textMuted}
                    keyboardType="numeric"
                    value={draftFilters.minPrice}
                    onChangeText={(text) =>
                      setDraftFilters((prev) => ({ ...prev, minPrice: text }))
                    }
                  />
                </View>
                <Text style={styles.priceDash}>—</Text>
                <View style={styles.priceInputWrapper}>
                  <Text style={styles.priceCurrency}>$</Text>
                  <TextInput
                    style={styles.priceInput}
                    placeholder="Max"
                    placeholderTextColor={colors.textMuted}
                    keyboardType="numeric"
                    value={draftFilters.maxPrice}
                    onChangeText={(text) =>
                      setDraftFilters((prev) => ({ ...prev, maxPrice: text }))
                    }
                  />
                </View>
              </View>

              <Text style={styles.filterSectionLabel}>Category</Text>
              <View style={styles.categoryFilterList}>
                {categories.map((category) => {
                  const checked = draftFilters.categoryIds.has(category.id);
                  return (
                    <Pressable
                      key={category.id}
                      style={styles.categoryFilterRow}
                      onPress={() => toggleDraftCategory(category.id)}
                    >
                      <View
                        style={[
                          styles.checkbox,
                          checked && { backgroundColor: colors.accent },
                        ]}
                      >
                        {checked && (
                          <Ionicons
                            name="checkmark"
                            size={14}
                            color={colors.onAccent}
                          />
                        )}
                      </View>
                      <Text style={styles.categoryFilterLabel}>
                        {category.name}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>

              <Text style={styles.filterSectionLabel}>Minimum Rating</Text>
              <View style={styles.ratingChipsRow}>
                {RATING_OPTIONS.map((option) => (
                  <RatingChip
                    key={option.label}
                    label={option.label}
                    value={option.value}
                    activeValue={draftFilters.minRating}
                    colors={colors}
                    styles={styles}
                    onPress={() =>
                      setDraftFilters((prev) => ({
                        ...prev,
                        minRating: option.value,
                      }))
                    }
                  />
                ))}
              </View>
            </ScrollView>

            <View style={styles.filterActionsRow}>
              <AnimatedPressable
                style={[
                  styles.resetButton,
                  { transform: [{ scale: resetScaleAnim }] },
                ]}
                onPress={resetFilters}
                onPressIn={handleResetPressIn}
                onPressOut={handleResetPressOut}
              >
                <Text style={styles.resetButtonText}>Reset</Text>
              </AnimatedPressable>
              <AnimatedPressable
                style={[
                  styles.applyButton,
                  { transform: [{ scale: applyScaleAnim }] },
                ]}
                onPress={applyFilters}
                onPressIn={handleApplyPressIn}
                onPressOut={handleApplyPressOut}
              >
                <Text style={styles.applyButtonText}>Apply Filters</Text>
              </AnimatedPressable>
            </View>
          </View>
        </View>
      </Modal>
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

    // --- Search bar + filter button ---
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
    filterButton: {
      width: 52,
      height: 52,
      borderRadius: 16,
      backgroundColor: colors.accent,
      alignItems: "center",
      justifyContent: "center",
    },
    filterDot: {
      position: "absolute",
      top: 8,
      right: 8,
      width: 8,
      height: 8,
      borderRadius: 4,
      backgroundColor: "#FFFFFF",
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
    cartButton: {
      width: 32,
      height: 32,
      borderRadius: 10,
      backgroundColor: colors.accent,
      alignItems: "center",
      justifyContent: "center",
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
    bestSellerCartButton: {
      width: 36,
      height: 36,
      borderRadius: 10,
      backgroundColor: colors.accent,
      alignItems: "center",
      justifyContent: "center",
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

    // --- Filter modal ---
    filterModalBackdrop: {
      flex: 1,
      backgroundColor: "rgba(0, 0, 0, 0.5)",
      justifyContent: "flex-end",
    },
    filterModalCard: {
      backgroundColor: colors.background,
      borderTopLeftRadius: 24,
      borderTopRightRadius: 24,
      paddingTop: 20,
      paddingHorizontal: 24,
      paddingBottom: 60,
      maxHeight: "85%",
    },
    filterModalHeader: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: 20,
    },
    filterModalTitle: {
      fontFamily: Fonts.bold,
      fontSize: 18,
      color: colors.textPrimary,
    },
    filterSectionLabel: {
      fontFamily: Fonts.semiBold,
      fontSize: 14,
      color: colors.textPrimary,
      marginBottom: 12,
      marginTop: 8,
    },
    priceRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: 12,
      marginBottom: 8,
    },
    priceInputWrapper: {
      flex: 1,
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: colors.cardBackground,
      borderRadius: 14,
      paddingHorizontal: 14,
      height: 48,
    },
    priceCurrency: {
      fontFamily: Fonts.medium,
      fontSize: 15,
      color: colors.textMuted,
      marginRight: 4,
    },
    priceInput: {
      flex: 1,
      fontFamily: Fonts.regular,
      fontSize: 15,
      color: colors.textPrimary,
    },
    priceDash: {
      fontFamily: Fonts.medium,
      color: colors.textMuted,
    },
    categoryFilterList: {
      marginBottom: 8,
    },
    categoryFilterRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: 12,
      paddingVertical: 10,
    },
    checkbox: {
      width: 22,
      height: 22,
      borderRadius: 6,
      borderWidth: 1.5,
      borderColor: colors.accent,
      alignItems: "center",
      justifyContent: "center",
    },
    categoryFilterLabel: {
      fontFamily: Fonts.regular,
      fontSize: 15,
      color: colors.textPrimary,
    },
    ratingChipsRow: {
      flexDirection: "row",
      gap: 10,
      marginBottom: 20,
    },
    ratingChip: {
      borderRadius: 20,
      paddingHorizontal: 16,
      paddingVertical: 10,
    },
    ratingChipText: {
      fontFamily: Fonts.medium,
      fontSize: 13,
    },
    filterActionsRow: {
      flexDirection: "row",
      gap: 12,
      marginTop: 8,
    },
    resetButton: {
      flex: 1,
      alignItems: "center",
      justifyContent: "center",
      borderRadius: 32,
      borderWidth: 1,
      borderColor: colors.outline,
      paddingVertical: 16,
    },
    resetButtonText: {
      fontFamily: Fonts.semiBold,
      fontSize: 15,
      color: colors.textPrimary,
    },
    applyButton: {
      flex: 2,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: colors.accent,
      borderRadius: 32,
      paddingVertical: 16,
    },
    applyButtonText: {
      fontFamily: Fonts.semiBold,
      fontSize: 15,
      color: colors.onAccent,
    },
  });
}
