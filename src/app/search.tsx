// Search screen — reached from Home/Shop's search bar. Live results while
// typing, persisted recent searches, and recently viewed products.
// Filter button (price/category/rating) sits next to the search input and
// applies on top of the live search results. No press-scale animation on
// the filter button itself — just a loading state before the modal opens.

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
import { useEffect, useMemo, useRef, useState } from "react";
import {
  ActivityIndicator,
  Animated,
  Easing,
  FlatList,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

const WISHLIST_ACTIVE_COLOR = "#DC143C";
const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

// --- Price/category/rating filter state, applied on top of the live search ---
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

const RATING_OPTIONS = [
  { label: "Any", value: 0 },
  { label: "3+", value: 3 },
  { label: "4+", value: 4 },
  { label: "4.5+", value: 4.5 },
];

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

  // --- Price/category/rating filter modal, applied on top of the live search ---
  const [filterModalVisible, setFilterModalVisible] = useState(false);
  const [draftFilters, setDraftFilters] = useState<FilterState>(EMPTY_FILTERS);
  const [appliedFilters, setAppliedFilters] =
    useState<FilterState>(EMPTY_FILTERS);

  const resetScaleAnim = useRef(new Animated.Value(1)).current;
  const applyScaleAnim = useRef(new Animated.Value(1)).current;

  // --- Busy states: brief pause before the filter modal opens, and before
  // "Apply Filters" actually applies and closes it ---
  const [filterButtonLoading, setFilterButtonLoading] = useState(false);
  const [applyLoading, setApplyLoading] = useState(false);

  const results = useMemo(() => {
    const trimmed = query.trim().toLowerCase();
    if (!trimmed) return [];

    return products.filter((item) => {
      const matchesQuery =
        item.name.toLowerCase().includes(trimmed) ||
        item.category.toLowerCase().includes(trimmed);
      if (!matchesQuery) return false;

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
  }, [query, appliedFilters]);

  const showingResults = query.trim().length > 0;

  const hasActiveFilters =
    appliedFilters.minPrice !== "" ||
    appliedFilters.maxPrice !== "" ||
    appliedFilters.categoryIds.size > 0 ||
    appliedFilters.minRating > 0;

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

  function openFilterModal() {
    if (filterButtonLoading) return;
    setFilterButtonLoading(true);
    setDraftFilters(appliedFilters);

    setTimeout(() => {
      setFilterModalVisible(true);
      setFilterButtonLoading(false);
    }, 400);
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
    if (applyLoading) return;
    setApplyLoading(true);

    setTimeout(() => {
      setAppliedFilters(draftFilters);
      setFilterModalVisible(false);
      setApplyLoading(false);
    }, 500);
  }

  function resetFilters() {
    setDraftFilters(EMPTY_FILTERS);
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
        <Pressable
          style={[
            styles.filterButton,
            filterButtonLoading && styles.filterButtonBusy,
          ]}
          onPress={openFilterModal}
          disabled={filterButtonLoading}
        >
          {filterButtonLoading ? (
            <ActivityIndicator color={colors.onAccent} size="small" />
          ) : (
            <Ionicons
              name="options-outline"
              size={20}
              color={colors.onAccent}
            />
          )}
          {hasActiveFilters && !filterButtonLoading && (
            <View style={styles.filterDot} />
          )}
        </Pressable>
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
                  <Text style={styles.sectionTitle}>Recently Viewed</Text>
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

            <View>
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
            </View>

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
                  applyLoading && styles.applyButtonBusy,
                  { transform: [{ scale: applyScaleAnim }] },
                ]}
                onPress={applyFilters}
                onPressIn={handleApplyPressIn}
                onPressOut={handleApplyPressOut}
                disabled={applyLoading}
              >
                {applyLoading ? (
                  <ActivityIndicator color={colors.onAccent} size="small" />
                ) : (
                  <Text style={styles.applyButtonText}>Apply Filters</Text>
                )}
              </AnimatedPressable>
            </View>
          </View>
        </View>
      </Modal>
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
    filterButton: {
      width: 52,
      height: 52,
      borderRadius: 16,
      backgroundColor: colors.accent,
      alignItems: "center",
      justifyContent: "center",
    },
    filterButtonBusy: {
      opacity: 0.7,
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
    applyButtonBusy: {
      opacity: 0.7,
    },
    applyButtonText: {
      fontFamily: Fonts.semiBold,
      fontSize: 15,
      color: colors.onAccent,
    },
  });
}
