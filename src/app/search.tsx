// Search screen — reached from Home/Shop's search bar. Live results while
// typing, persisted recent searches, and recently viewed products.

import { RemoteImage } from "@/components/ui/remote-image";
import { ThemeColors } from "@/constants/colors";
import { Fonts } from "@/constants/fonts";
import { categories } from "@/data/categories";
import { bestSellerIds } from "@/data/product-badges";
import { Product, products } from "@/data/products";
import { useThemeColors } from "@/hooks/use-theme-colors";
import {
  RecentViewProduct,
  useSearchHistoryStore,
} from "@/store/search-history-store";
import { useWishlistStore } from "@/store/wishlist-store";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useMemo, useRef, useState } from "react";
import {
  Animated,
  Easing,
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

const WISHLIST_ACTIVE_COLOR = "#DC143C";
const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

function getCategoryLabel(categoryId: string) {
  const match = categories.find((c) => c.id === categoryId);
  return match ? match.name : categoryId;
}

// --- Grid card for live search results: badges, title, sale/rating, price ---
type ResultCardProps = {
  item: Product;
  colors: ThemeColors;
  styles: ReturnType<typeof getStyles>;
  isWishlisted: boolean;
  onToggleWishlist: (id: string) => void;
  onPress: () => void;
};

function ResultCard({
  item,
  colors,
  styles,
  isWishlisted,
  onToggleWishlist,
  onPress,
}: ResultCardProps) {
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
    <Pressable style={styles.resultCard} onPress={onPress}>
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
        style={styles.resultImage}
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
          color={isWishlisted ? "#DC143C" : colors.accent}
        />
      </AnimatedPressable>

      <Text style={styles.resultName}>{item.name}</Text>

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

      <Text style={styles.resultPrice}>${item.price.toFixed(2)}</Text>
    </Pressable>
  );
}

export default function Search() {
  const colors = useThemeColors();
  const styles = getStyles(colors);

  const recentSearches = useSearchHistoryStore((s) => s.recentSearches);
  const recentViews = useSearchHistoryStore((s) => s.recentViews);
  const addSearch = useSearchHistoryStore((s) => s.addSearch);
  const removeSearch = useSearchHistoryStore((s) => s.removeSearch);
  const addView = useSearchHistoryStore((s) => s.addView);

  // --- Global wishlist state, shared with every other screen and the
  // Wishlist tab itself ---
  const wishlistedIds = useWishlistStore((s) => s.wishlistedIds);
  const toggleWishlist = useWishlistStore((s) => s.toggleWishlist);

  const [query, setQuery] = useState("");

  const results = useMemo(() => {
    const trimmed = query.trim().toLowerCase();
    if (!trimmed) return [];
    return products.filter(
      (item) =>
        item.name.toLowerCase().includes(trimmed) ||
        item.category.toLowerCase().includes(trimmed),
    );
  }, [query]);

  const showingResults = query.trim().length > 0;

  function handleSubmit() {
    addSearch(query);
  }

  function handleRecentSearchPress(term: string) {
    setQuery(term);
    addSearch(term);
  }

  function handleProductPress(item: Product | RecentViewProduct) {
    addView({
      id: item.id,
      name: item.name,
      category: item.category,
      price: item.price,
      thumbPath: item.thumbPath,
      fallbackThumbPath: item.fallbackThumbPath,
    });
    router.push({ pathname: "/product-details", params: { id: item.id } });
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Pressable style={styles.backButton} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={22} color={colors.accent} />
        </Pressable>
        <View style={styles.searchWrapper}>
          <Ionicons name="search" size={18} color={colors.textMuted} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search..."
            placeholderTextColor={colors.textMuted}
            value={query}
            onChangeText={setQuery}
            onSubmitEditing={handleSubmit}
            returnKeyType="search"
            autoFocus
          />
          {query.length > 0 && (
            <Pressable onPress={() => setQuery("")}>
              <Ionicons name="close-circle" size={20} color={colors.accent} />
            </Pressable>
          )}
        </View>
      </View>

      {showingResults ? (
        <>
          <View style={styles.resultsHeaderRow}>
            <Text style={styles.resultsTitle}>
              Results for &quot;{query}&quot;
            </Text>
            <Text style={styles.resultsCount}>
              {results.length}{" "}
              <Text style={styles.resultsCountAccent}>Results Found</Text>
            </Text>
          </View>

          {results.length === 0 ? (
            <View style={styles.emptyState}>
              <Ionicons
                name="search-outline"
                size={40}
                color={colors.textMuted}
              />
              <Text style={styles.emptyText}>No results found</Text>
            </View>
          ) : (
            <FlatList
              data={results}
              keyExtractor={(item) => item.id}
              numColumns={2}
              columnWrapperStyle={styles.resultsRow}
              contentContainerStyle={styles.listContent}
              renderItem={({ item }) => (
                <ResultCard
                  item={item}
                  colors={colors}
                  styles={styles}
                  isWishlisted={!!wishlistedIds[item.id]}
                  onToggleWishlist={toggleWishlist}
                  onPress={() => handleProductPress(item)}
                />
              )}
            />
          )}
        </>
      ) : (
        <FlatList
          data={[]}
          keyExtractor={() => "unused"}
          renderItem={null}
          contentContainerStyle={styles.listContent}
          ListHeaderComponent={
            <>
              {recentSearches.length > 0 && (
                <>
                  <Text style={styles.sectionTitle}>Recent Search</Text>
                  {recentSearches.map((term) => (
                    <View key={term} style={styles.recentSearchRow}>
                      <Pressable
                        style={styles.recentSearchLeft}
                        onPress={() => handleRecentSearchPress(term)}
                      >
                        <View style={styles.recentIconCircle}>
                          <Ionicons
                            name="time-outline"
                            size={16}
                            color={colors.accent}
                          />
                        </View>
                        <Text style={styles.recentSearchText}>{term}</Text>
                      </Pressable>
                      <Pressable onPress={() => removeSearch(term)}>
                        <Ionicons
                          name="close"
                          size={18}
                          color={colors.textMuted}
                        />
                      </Pressable>
                    </View>
                  ))}
                  <View style={styles.divider} />
                </>
              )}

              {recentViews.length > 0 && (
                <>
                  <Text style={styles.sectionTitle}>Recent View</Text>
                  {recentViews.map((item) => (
                    <Pressable
                      key={item.id}
                      style={styles.recentViewRow}
                      onPress={() => handleProductPress(item)}
                    >
                      <RemoteImage
                        uri={item.thumbPath}
                        fallbackUri={item.fallbackThumbPath}
                        style={styles.recentViewImage}
                      />
                      <View style={styles.recentViewInfo}>
                        <Text style={styles.recentViewName}>{item.name}</Text>
                        <Text style={styles.recentViewCategory}>
                          {getCategoryLabel(item.category)}
                        </Text>
                        <Text style={styles.recentViewPrice}>
                          ${item.price.toFixed(2)}
                        </Text>
                      </View>
                    </Pressable>
                  ))}
                </>
              )}

              {recentSearches.length === 0 && recentViews.length === 0 && (
                <View style={styles.emptyState}>
                  <Ionicons
                    name="search-outline"
                    size={40}
                    color={colors.textMuted}
                  />
                  <Text style={styles.emptyText}>
                    Start typing to search for furniture
                  </Text>
                </View>
              )}
            </>
          }
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
      gap: 12,
      paddingHorizontal: 24,
      marginBottom: 24,
    },
    backButton: {
      width: 44,
      height: 44,
      borderRadius: 22,
      borderWidth: 1,
      borderColor: colors.outline,
      alignItems: "center",
      justifyContent: "center",
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
    searchInput: {
      flex: 1,
      fontFamily: Fonts.regular,
      fontSize: 14,
      color: colors.textPrimary,
    },
    listContent: {
      paddingHorizontal: 24,
      paddingBottom: 40,
    },
    sectionTitle: {
      fontFamily: Fonts.bold,
      fontSize: 17,
      color: colors.textPrimary,
      marginBottom: 12,
    },
    recentSearchRow: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      marginBottom: 16,
    },
    recentSearchLeft: {
      flexDirection: "row",
      alignItems: "center",
      gap: 12,
      flex: 1,
    },
    recentIconCircle: {
      width: 32,
      height: 32,
      borderRadius: 16,
      backgroundColor: colors.cardBackground,
      alignItems: "center",
      justifyContent: "center",
    },
    recentSearchText: {
      fontFamily: Fonts.medium,
      fontSize: 15,
      color: colors.textPrimary,
    },
    divider: {
      height: 1,
      backgroundColor: colors.outline,
      marginVertical: 16,
    },
    recentViewRow: {
      flexDirection: "row",
      gap: 14,
      marginBottom: 16,
    },
    recentViewImage: {
      width: 80,
      height: 80,
      borderRadius: 16,
      backgroundColor: colors.cardBackground,
    },
    recentViewInfo: {
      justifyContent: "center",
      gap: 4,
    },
    recentViewName: {
      fontFamily: Fonts.semiBold,
      fontSize: 15,
      color: colors.textPrimary,
    },
    recentViewCategory: {
      fontFamily: Fonts.regular,
      fontSize: 13,
      color: colors.textMuted,
    },
    recentViewPrice: {
      fontFamily: Fonts.bold,
      fontSize: 15,
      color: colors.accent,
    },
    resultsHeaderRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      paddingHorizontal: 24,
      marginBottom: 16,
    },
    resultsTitle: {
      fontFamily: Fonts.bold,
      fontSize: 17,
      color: colors.textPrimary,
    },
    resultsCount: {
      fontFamily: Fonts.regular,
      fontSize: 13,
      color: colors.textMuted,
    },
    resultsCountAccent: {
      color: colors.accent,
      fontFamily: Fonts.semiBold,
    },
    resultsRow: {
      justifyContent: "space-between",
      marginBottom: 16,
    },
    resultCard: {
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

    resultImage: {
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
    resultName: {
      fontFamily: Fonts.semiBold,
      fontSize: 14,
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

    resultPrice: {
      fontFamily: Fonts.bold,
      fontSize: 15,
      color: colors.accent,
    },
    emptyState: {
      alignItems: "center",
      justifyContent: "center",
      paddingTop: 80,
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
