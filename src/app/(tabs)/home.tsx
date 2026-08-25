import { ThemeColors } from "@/constants/colors";
import { Fonts } from "@/constants/fonts";
import { categories } from "@/data/categories";
import { Product, products } from "@/data/products";
import { useThemeColors } from "@/hooks/use-theme-colors";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { router, useLocalSearchParams } from "expo-router";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  Alert,
  Animated,
  Easing,
  FlatList,
  NativeScrollEvent,
  NativeSyntheticEvent,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  useWindowDimensions,
  View,
} from "react-native";

const FILTERS = ["All", "Newest", "Popular", "Top Selling"];
const FLASH_SALE_SECONDS = 2 * 3600 + 12 * 60 + 56;
const DEFAULT_LOCATION = "Casablanca, Morocco";
const WISHLIST_ACTIVE_COLOR = "#DC143C";
const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

const BANNER_SLIDES = [
  {
    id: "wine-sofa",
    imageUrl:
      "https://limjfxtziyciiyxjuyyh.supabase.co/storage/v1/object/public/product-images/product-images/one_seater_sofa/sofa_07/color_wine_07_full.webp",
  },
  {
    id: "coffee-sofa",
    imageUrl:
      "https://limjfxtziyciiyxjuyyh.supabase.co/storage/v1/object/public/product-images/product-images/two_seater_sofa/sofa_03/color_coffe_full.webp",
  },
  {
    id: "sofa-04",
    imageUrl:
      "https://limjfxtziyciiyxjuyyh.supabase.co/storage/v1/object/public/product-images/product-images/one_seater_sofa/sofa_04/product_04_a_full.webp",
  },
  {
    id: "sofa-06",
    imageUrl:
      "https://limjfxtziyciiyxjuyyh.supabase.co/storage/v1/object/public/product-images/product-images/one_seater_sofa/sofa_06/product_06_a_full.webp",
  },
];

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
      <Image
        source={{
          uri: `https://limjfxtziyciiyxjuyyh.supabase.co/storage/v1/object/public/product-images/product-images/${item.thumbPath}`,
        }}
        style={styles.productImage}
        contentFit="cover"
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

export default function Home() {
  const colors = useThemeColors();
  const { width: screenWidth } = useWindowDimensions();
  const bannerWidth = screenWidth - 48;
  const styles = getStyles(colors, bannerWidth);
  const params = useLocalSearchParams<{ location?: string }>();

  const [location, setLocation] = useState(params.location ?? DEFAULT_LOCATION);
  const [search, setSearch] = useState("");
  const [activeFilter, setActiveFilter] = useState("Newest");
  const [wishlisted, setWishlisted] = useState<Set<string>>(new Set());
  const [timeLeft, setTimeLeft] = useState(FLASH_SALE_SECONDS);
  const [activeBannerIndex, setActiveBannerIndex] = useState(0);
  const [hasUnread, setHasUnread] = useState(true);

  const dotAnims = useRef(
    BANNER_SLIDES.map((_, i) => new Animated.Value(i === 0 ? 1 : 0))
  ).current;
  const bellScaleAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (params.location) {
      setLocation(params.location);
    }
  }, [params.location]);

  useEffect(() => {
    const interval = setInterval(() => {
      setTimeLeft((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    dotAnims.forEach((anim, i) => {
      Animated.timing(anim, {
        toValue: i === activeBannerIndex ? 1 : 0,
        duration: 300,
        easing: Easing.ease,
        useNativeDriver: false,
      }).start();
    });
  }, [activeBannerIndex, dotAnims]);

  const hours = Math.floor(timeLeft / 3600);
  const minutes = Math.floor((timeLeft % 3600) / 60);
  const seconds = timeLeft % 60;

  const displayedProducts = useMemo(() => {
    const sorted = [...products];

    switch (activeFilter) {
      case "Newest":
        return sorted.sort(
          (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
      case "Popular":
        return sorted.sort((a, b) => b.rating - a.rating);
      case "Top Selling":
        return sorted.sort((a, b) => b.salesCount - a.salesCount);
      case "All":
      default:
        return sorted;
    }
  }, [activeFilter]);

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
    Alert.alert(label, "This will continue once the corresponding screen is built.");
  }

  function handleBannerScroll(event: NativeSyntheticEvent<NativeScrollEvent>) {
    const index = Math.round(event.nativeEvent.contentOffset.x / bannerWidth);
    setActiveBannerIndex(index);
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

  return (
    <View style={styles.screen}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.headerRow}>
          <View>
            <Text style={styles.locationLabel}>Location</Text>
            <Pressable
              style={styles.locationRow}
              onPress={() => router.push("/location-search")}
            >
              <Ionicons name="location" size={16} color={colors.accent} />
              <Text style={styles.locationValue}>{location}</Text>
              <Ionicons name="chevron-down" size={16} color={colors.textPrimary} />
            </Pressable>
          </View>
          <AnimatedPressable
            style={[styles.bellButton, { transform: [{ scale: bellScaleAnim }] }]}
            onPress={handleBellPress}
          >
            <Ionicons name="notifications-outline" size={22} color={colors.textPrimary} />
            {hasUnread && <View style={styles.bellDot} />}
          </AnimatedPressable>
        </View>

        <View style={styles.searchRow}>
          <View style={styles.searchWrapper}>
            <Ionicons name="search" size={20} color={colors.textMuted} />
            <TextInput
              style={styles.searchInput}
              placeholder="Search furniture, categories..."
              placeholderTextColor={colors.textMuted}
              value={search}
              onChangeText={setSearch}
            />
          </View>
          <Pressable
            style={styles.filterButton}
            onPress={() => notImplemented("Filters")}
          >
            <Ionicons name="options-outline" size={20} color={colors.onAccent} />
          </Pressable>
        </View>

        <ScrollView
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          onMomentumScrollEnd={handleBannerScroll}
          style={styles.bannerScroll}
        >
          {BANNER_SLIDES.map((slide) => (
            <View key={slide.id} style={[styles.banner, { width: bannerWidth }]}>
              <Image
                source={{ uri: slide.imageUrl }}
                style={styles.bannerImage}
                contentFit="cover"
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
          ))}
        </ScrollView>

        <View style={styles.dotsRow}>
          {BANNER_SLIDES.map((slide, i) => (
            <Animated.View
              key={slide.id}
              style={[
                styles.dot,
                {
                  width: dotAnims[i].interpolate({
                    inputRange: [0, 1],
                    outputRange: [6, 18],
                  }),
                  backgroundColor: dotAnims[i].interpolate({
                    inputRange: [0, 1],
                    outputRange: [colors.outline, colors.accent],
                  }),
                },
              ]}
            />
          ))}
        </View>

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
            <Pressable
              key={category.id}
              style={styles.categoryItem}
              onPress={() => handleCategoryPress(category.id, category.name)}
            >
              <View style={styles.categoryIconCircle}>
                <MaterialCommunityIcons
                  name={category.icon}
                  size={26}
                  color={colors.accent}
                />
              </View>
              <Text style={styles.categoryLabel}>{category.name}</Text>
            </Pressable>
          ))}
        </View>

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

        <View style={styles.filterChipsRow}>
          {FILTERS.map((filter) => (
            <Pressable
              key={filter}
              style={[
                styles.filterChip,
                activeFilter === filter && styles.filterChipActive,
              ]}
              onPress={() => setActiveFilter(filter)}
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

        <FlatList
          data={displayedProducts}
          keyExtractor={(item) => item.id}
          numColumns={2}
          columnWrapperStyle={styles.productRow}
          scrollEnabled={false}
          renderItem={({ item }) => (
            <ProductCard
              item={item}
              colors={colors}
              styles={styles}
              isWishlisted={wishlisted.has(item.id)}
              onToggleWishlist={toggleWishlist}
              onAddToCart={() => notImplemented("Add to Cart")}
            />
          )}
        />
      </ScrollView>
    </View>
  );
}

function getStyles(colors: ThemeColors, bannerWidth: number) {
  return StyleSheet.create({
    screen: {
      flex: 1,
      backgroundColor: colors.background,
    },
    scrollContent: {
      paddingHorizontal: 24,
      paddingTop: 60,
      paddingBottom: 40,
    },
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
      backgroundColor: colors.placeholder,
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
      backgroundColor: colors.placeholder,
      borderRadius: 16,
      paddingHorizontal: 16,
      height: 52,
    },
    searchInput: {
      flex: 1,
      fontFamily: Fonts.regular,
      fontSize: 14,
      color: colors.textPrimary,
    },
    filterButton: {
      width: 52,
      height: 52,
      borderRadius: 16,
      backgroundColor: colors.accent,
      alignItems: "center",
      justifyContent: "center",
    },
    bannerScroll: {
      marginBottom: 12,
    },
    banner: {
      height: 160,
      borderRadius: 24,
      overflow: "hidden",
      justifyContent: "center",
      padding: 20,
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
    dotsRow: {
      flexDirection: "row",
      justifyContent: "center",
      gap: 6,
      marginBottom: 24,
    },
    dot: {
      height: 6,
      borderRadius: 3,
    },
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
      backgroundColor: colors.placeholder,
      alignItems: "center",
      justifyContent: "center",
    },
    categoryLabel: {
      fontFamily: Fonts.medium,
      fontSize: 12,
      color: colors.textPrimary,
    },
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
      backgroundColor: colors.placeholder,
      borderRadius: 8,
      paddingHorizontal: 8,
      paddingVertical: 4,
    },
    timerText: {
      fontFamily: Fonts.semiBold,
      fontSize: 13,
      color: colors.accent,
    },
    timerColon: {
      fontFamily: Fonts.semiBold,
      color: colors.textMuted,
    },
    filterChipsRow: {
      flexDirection: "row",
      gap: 10,
      marginBottom: 20,
    },
    filterChip: {
      backgroundColor: colors.placeholder,
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
  });
}