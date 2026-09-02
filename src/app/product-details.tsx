// Product Details screen — image gallery (real angles from product data,
// clickable thumbnails and a full-screen viewer), color variants (including
// a "Default" option representing the base photos), optional video (shown
// as the 2nd thumbnail, right after the main photo), price/cart, and a
// reviews section. There is no review system in the app yet, so that
// section is an honest empty state rather than fabricated reviews. The
// description is a generic, non-product-specific demo paragraph — no real
// per-product copy exists yet, and this avoids inventing fake specifics.

import { AddToCartButton } from "@/components/ui/add-to-cart-button";
import { ProductDetailsSkeleton } from "@/components/ui/product-details-skeleton";
import { RemoteImage } from "@/components/ui/remote-image";
import { ScrollProgressBar } from "@/components/ui/scroll-progress-bar";
import { ThemeColors } from "@/constants/colors";
import { Fonts } from "@/constants/fonts";
import { categories } from "@/data/categories";
import { bestSellerIds } from "@/data/product-badges";
import { products } from "@/data/products";
import { useDeferredReady } from "@/hooks/use-deferred-ready";
import { useThemeColors } from "@/hooks/use-theme-colors";
import { useWishlistStore } from "@/store/wishlist-store";
import { Ionicons } from "@expo/vector-icons";
import { useEvent } from "expo";
import { router, useLocalSearchParams } from "expo-router";
import { useVideoPlayer, VideoView } from "expo-video";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  ActivityIndicator,
  Animated,
  Easing,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from "react-native";

const WISHLIST_ACTIVE_COLOR = "#DC143C";
const DEFAULT_COLOR_ID = "default";
const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

// Generic, non-product-specific demo description — no real per-product
// copy exists yet, and this deliberately avoids inventing fake specifics
// (exact dimensions, materials, etc.) while still reading like real copy.
const DEMO_DESCRIPTION =
  "A thoughtfully designed piece built for everyday comfort and long-term durability. Crafted from premium materials with careful attention to detail and finish, it complements a variety of interior styles. Dimensions are suited for most spaces — check the size guide for exact measurements before ordering. Assembly instructions and care guidelines are included with delivery.";

// Text labels for color variants aren't paired with real hex values in the
// data, so this maps the known names to a reasonable display swatch.
const COLOR_SWATCHES: Record<string, string> = {
  beige: "#D8C4AE",
  black: "#1C1C1C",
  navy_blue: "#1B2A4A",
  red: "#B03A2E",
  yellow: "#D4A72C",
  yellowish: "#E8D67B",
  wine: "#5E1B26",
  coffe: "#4B3621",
  dark_caramel: "#6B4423",
  caramel: "#C68642",
  blue_sky: "#7EC8E3",
  gray: "#8C8C8C",
};

function formatColorName(name: string) {
  if (name === DEFAULT_COLOR_ID) return "Default";
  return name
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

function getCategoryLabel(categoryId: string) {
  const match = categories.find((c) => c.id === categoryId);
  return match ? match.name : categoryId;
}

// A slide in the main swipeable gallery — always a real photo.
type GallerySlide = { uri: string; fallbackUri: string };

// An entry in the thumbnail row — either a photo (swaps the gallery) or
// the video button (opens the video modal, doesn't affect the gallery).
type ThumbEntry =
  | { kind: "image"; uri: string; fallbackUri: string; galleryIndex: number }
  | { kind: "video" };

// --- Full-screen image viewer, opened by tapping the main photo ---
function FullImageModal({
  visible,
  image,
  styles,
  onClose,
}: {
  visible: boolean;
  image: GallerySlide | undefined;
  styles: ReturnType<typeof getStyles>;
  onClose: () => void;
}) {
  return (
    <Modal
      transparent
      visible={visible}
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.fullImageBackdrop}>
        <Pressable style={styles.fullImageCloseButton} onPress={onClose}>
          <Ionicons name="close" size={26} color="#FFFFFF" />
        </Pressable>
        {image && (
          <RemoteImage
            uri={image.uri}
            fallbackUri={image.fallbackUri}
            style={styles.fullImage}
            contentFit="contain"
          />
        )}
      </View>
    </Modal>
  );
}

// --- Full-screen video modal, tries the primary URL then falls back ---
function VideoModal({
  visible,
  videoPath,
  fallbackVideoPath,
  colors,
  styles,
  onClose,
}: {
  visible: boolean;
  videoPath: string;
  fallbackVideoPath: string;
  colors: ThemeColors;
  styles: ReturnType<typeof getStyles>;
  onClose: () => void;
}) {
  const [useFallback, setUseFallback] = useState(false);
  const source = useFallback ? `${fallbackVideoPath}.mp4` : `${videoPath}.mp4`;

  const player = useVideoPlayer(source, (p) => {
    p.loop = false;
    if (visible) p.play();
  });

  const { status } = useEvent(player, "statusChange", {
    status: player.status,
  });

  if (status === "error" && !useFallback) {
    setUseFallback(true);
  }

  return (
    <Modal
      transparent
      visible={visible}
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.videoBackdrop}>
        <Pressable style={styles.videoCloseButton} onPress={onClose}>
          <Ionicons name="close" size={26} color="#FFFFFF" />
        </Pressable>
        {status === "loading" && (
          <ActivityIndicator
            color={colors.accent}
            style={StyleSheet.absoluteFill}
          />
        )}
        {status === "error" && useFallback ? (
          <Text style={styles.videoErrorText}>
            Video unavailable right now.
          </Text>
        ) : (
          <VideoView style={styles.video} player={player} nativeControls />
        )}
      </View>
    </Modal>
  );
}

export default function ProductDetails() {
  const colors = useThemeColors();
  const { width: screenWidth } = useWindowDimensions();
  const styles = getStyles(colors);
  const params = useLocalSearchParams<{ id: string }>();
  const ready = useDeferredReady();

  const wishlistedIds = useWishlistStore((s) => s.wishlistedIds);
  const toggleWishlist = useWishlistStore((s) => s.toggleWishlist);

  const product = products.find((p) => p.id === params.id);
  const isBestSeller = product ? bestSellerIds.has(product.id) : false;
  const isWishlisted = product ? !!wishlistedIds[product.id] : false;

  const [selectedColor, setSelectedColor] = useState<string>(DEFAULT_COLOR_ID);
  const [galleryPage, setGalleryPage] = useState(0);
  const [videoVisible, setVideoVisible] = useState(false);
  const [fullImageVisible, setFullImageVisible] = useState(false);
  const [reviewModalVisible, setReviewModalVisible] = useState(false);
  const heartScaleAnim = useRef(new Animated.Value(1)).current;
  const galleryScrollX = useRef(new Animated.Value(0)).current;
  const galleryScrollRef = useRef<ScrollView>(null);
  const galleryWidth = screenWidth - 48;

  // --- Photos that appear in the swipeable big-picture gallery ---
  const gallerySlides: GallerySlide[] = useMemo(() => {
    if (!product) return [];
    if (selectedColor !== DEFAULT_COLOR_ID) {
      const variant = product.colorVariants?.find(
        (c) => c.color === selectedColor,
      );
      if (variant) {
        return [{ uri: variant.full, fallbackUri: variant.fallbackFull }];
      }
    }
    return product.images.map((img) => ({
      uri: img.full,
      fallbackUri: img.fallbackFull,
    }));
  }, [product, selectedColor]);

  // --- Thumbnail row: photos (index-linked to the gallery) + the video
  // button placed right after the main photo, regardless of angle count ---
  const thumbEntries: ThumbEntry[] = useMemo(() => {
    if (!product) return [];

    const photoThumbs: { uri: string; fallbackUri: string }[] =
      selectedColor !== DEFAULT_COLOR_ID
        ? (() => {
            const variant = product.colorVariants?.find(
              (c) => c.color === selectedColor,
            );
            return variant
              ? [{ uri: variant.thumb, fallbackUri: variant.fallbackThumb }]
              : [];
          })()
        : product.images.map((img) => ({
            uri: img.thumb,
            fallbackUri: img.fallbackThumb,
          }));

    const entries: ThumbEntry[] = [];
    photoThumbs.forEach((thumb, i) => {
      entries.push({
        kind: "image",
        uri: thumb.uri,
        fallbackUri: thumb.fallbackUri,
        galleryIndex: i,
      });
      if (i === 0 && product.videoPath) {
        entries.push({ kind: "video" });
      }
    });
    return entries;
  }, [product, selectedColor]);

  // --- Reset the gallery to the first slide whenever the color changes ---
  useEffect(() => {
    setGalleryPage(0);
    galleryScrollX.setValue(0);
    galleryScrollRef.current?.scrollTo({ x: 0, animated: false });
  }, [selectedColor, galleryScrollX]);

  function handleGalleryScroll(offsetX: number) {
    const index = Math.round(offsetX / galleryWidth);
    if (index !== galleryPage) {
      setGalleryPage(index);
    }
  }

  function handleThumbnailPress(entry: ThumbEntry) {
    if (entry.kind === "video") {
      setVideoVisible(true);
      return;
    }
    setGalleryPage(entry.galleryIndex);
    galleryScrollRef.current?.scrollTo({
      x: entry.galleryIndex * galleryWidth,
      animated: true,
    });
  }

  function handleWishlistPress() {
    if (!product) return;
    toggleWishlist(product.id);
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

  function handleWriteReview() {
    setReviewModalVisible(true);
  }

  if (!ready) {
    return (
      <View style={styles.screen}>
        <ProductDetailsSkeleton />
      </View>
    );
  }

  if (!product) {
    return (
      <View style={styles.screen}>
        <View style={styles.header}>
          <Pressable style={styles.headerButton} onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={22} color={colors.textPrimary} />
          </Pressable>
          <Text style={styles.headerTitle}>Product Details</Text>
          <View style={styles.headerButton} />
        </View>
        <View style={styles.emptyState}>
          <Ionicons name="cube-outline" size={40} color={colors.textMuted} />
          <Text style={styles.emptyText}>This product could not be found</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.screen}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* --- Header --- */}
        <View style={styles.header}>
          <Pressable style={styles.headerButton} onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={22} color={colors.textPrimary} />
          </Pressable>
          <Text style={styles.headerTitle}>Product Details</Text>
          <AnimatedPressable
            style={[
              styles.headerButton,
              { transform: [{ scale: heartScaleAnim }] },
            ]}
            onPress={handleWishlistPress}
          >
            <Ionicons
              name={isWishlisted ? "heart" : "heart-outline"}
              size={20}
              color={isWishlisted ? WISHLIST_ACTIVE_COLOR : colors.textPrimary}
            />
          </AnimatedPressable>
        </View>

        {/* --- Badges --- */}
        {(product.isTopDeal || isBestSeller) && (
          <View style={styles.badgeRow}>
            {product.isTopDeal && (
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

        {/* --- Image gallery (tap the photo to open full-screen) --- */}
        <Animated.ScrollView
          ref={galleryScrollRef}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          onScroll={Animated.event(
            [{ nativeEvent: { contentOffset: { x: galleryScrollX } } }],
            {
              useNativeDriver: true,
              listener: (e: any) =>
                handleGalleryScroll(e.nativeEvent.contentOffset.x),
            },
          )}
          scrollEventThrottle={16}
          style={{ marginBottom: 8 }}
        >
          {gallerySlides.map((img, i) => (
            <Pressable key={i} onPress={() => setFullImageVisible(true)}>
              <RemoteImage
                uri={img.uri}
                fallbackUri={img.fallbackUri}
                style={[styles.heroImage, { width: galleryWidth }]}
                contentFit="cover"
              />
            </Pressable>
          ))}
        </Animated.ScrollView>

        {gallerySlides.length > 1 && (
          <ScrollProgressBar
            scrollX={galleryScrollX}
            viewportWidth={galleryWidth}
            pageCount={gallerySlides.length}
            colors={colors}
          />
        )}

        {/* --- Thumbnails (video sits right after the main photo) --- */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.thumbRow}
        >
          {thumbEntries.map((entry, i) =>
            entry.kind === "video" ? (
              <Pressable
                key="video"
                style={styles.videoThumb}
                onPress={() => handleThumbnailPress(entry)}
              >
                <Ionicons name="play" size={22} color="#FFFFFF" />
              </Pressable>
            ) : (
              <Pressable key={i} onPress={() => handleThumbnailPress(entry)}>
                <RemoteImage
                  uri={entry.uri}
                  fallbackUri={entry.fallbackUri}
                  style={[
                    styles.thumbImage,
                    entry.galleryIndex === galleryPage &&
                      styles.thumbImageActive,
                  ]}
                />
              </Pressable>
            ),
          )}
        </ScrollView>

        {/* --- Title / category / rating --- */}
        <View style={styles.titleRow}>
          <View style={{ flex: 1 }}>
            <Text style={styles.categoryLabel}>
              {getCategoryLabel(product.category)}
            </Text>
            <Text style={styles.title}>{product.name}</Text>
          </View>
          <View style={styles.ratingBadge}>
            <Ionicons name="star" size={14} color="#F5A623" />
            <Text style={styles.ratingText}>{product.rating.toFixed(1)}</Text>
          </View>
        </View>

        {/* --- Description (generic demo copy — no real per-product text yet) --- */}
        <Text style={styles.sectionHeading}>Product Description</Text>
        <Text style={styles.descriptionText}>{DEMO_DESCRIPTION}</Text>

        {/* --- Color variants (Default is always shown) --- */}
        <Text style={styles.sectionHeading}>
          Select Color: {formatColorName(selectedColor)}
        </Text>
        <View style={styles.colorRow}>
          <Pressable
            style={[
              styles.defaultSwatch,
              selectedColor === DEFAULT_COLOR_ID && styles.colorSwatchActive,
            ]}
            onPress={() => setSelectedColor(DEFAULT_COLOR_ID)}
          >
            <RemoteImage
              uri={product.images[0].thumb}
              fallbackUri={product.images[0].fallbackThumb}
              style={styles.defaultSwatchImage}
            />
          </Pressable>
          {product.colorVariants?.map((variant) => (
            <Pressable
              key={variant.color}
              style={[
                styles.colorSwatch,
                {
                  backgroundColor:
                    COLOR_SWATCHES[variant.color] ?? colors.textMuted,
                },
                selectedColor === variant.color && styles.colorSwatchActive,
              ]}
              onPress={() => setSelectedColor(variant.color)}
            />
          ))}
        </View>

        {/* --- Reviews (honest empty state, no fabricated data) --- */}
        <Text style={styles.sectionHeading}>Customer Reviews</Text>
        <View style={styles.reviewsSummaryRow}>
          <Text style={styles.reviewsAverage}>{product.rating.toFixed(1)}</Text>
          <Ionicons name="star" size={20} color="#F5A623" />
        </View>
        <View style={styles.emptyReviewsBox}>
          <Ionicons
            name="chatbubble-ellipses-outline"
            size={28}
            color={colors.textMuted}
          />
          <Text style={styles.emptyReviewsText}>
            No reviews yet. Be the first to review this product!
          </Text>
        </View>
        <Pressable style={styles.writeReviewButton} onPress={handleWriteReview}>
          <Ionicons name="create-outline" size={18} color={colors.onAccent} />
          <Text style={styles.writeReviewText}>Write Review</Text>
        </Pressable>
      </ScrollView>

      {/* --- Price / Add to Cart --- */}
      <View style={styles.footer}>
        <View>
          <Text style={styles.footerLabel}>Total Price</Text>
          <Text style={styles.footerPrice}>${product.price.toFixed(2)}</Text>
        </View>
        <AddToCartButton
          productId={product.id}
          colors={colors}
          variant="full"
          style={styles.footerAddToCartButton}
        />
      </View>

      <FullImageModal
        visible={fullImageVisible}
        image={gallerySlides[galleryPage]}
        styles={styles}
        onClose={() => setFullImageVisible(false)}
      />

      {product.videoPath && product.fallbackVideoPath && (
        <VideoModal
          visible={videoVisible}
          videoPath={product.videoPath}
          fallbackVideoPath={product.fallbackVideoPath}
          colors={colors}
          styles={styles}
          onClose={() => setVideoVisible(false)}
        />
      )}

      <Modal
        transparent
        visible={reviewModalVisible}
        animationType="fade"
        onRequestClose={() => setReviewModalVisible(false)}
      >
        <View style={styles.reviewModalBackdrop}>
          <View style={styles.reviewModalCard}>
            <View style={styles.reviewModalHeader}>
              <Text style={styles.reviewModalTitle}>Reviews Coming Soon</Text>
              <Pressable
                style={styles.reviewModalCloseButton}
                onPress={() => setReviewModalVisible(false)}
                hitSlop={8}
              >
                <Ionicons name="close" size={20} color={colors.textPrimary} />
              </Pressable>
            </View>

            <View style={styles.reviewModalDivider} />

            <View style={styles.reviewModalIconCircle}>
              <Ionicons name="create-outline" size={24} color={colors.accent} />
            </View>

            <Text style={styles.reviewModalMessage}>
              The review feature is currently being prepared. This app is a
              demonstration, and customer reviews will be available in a future
              version.
            </Text>

            <Pressable
              style={styles.reviewModalButton}
              onPress={() => setReviewModalVisible(false)}
            >
              <Text style={styles.reviewModalButtonText}>Got it</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </View>
  );
}

function getStyles(colors: ThemeColors) {
  return StyleSheet.create({
    screen: {
      flex: 1,
      backgroundColor: colors.background,
    },
    scrollContent: {
      paddingHorizontal: 24,
      paddingTop: 60,
      paddingBottom: 140,
    },
    header: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      marginBottom: 12,
    },
    headerButton: {
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: colors.cardBackground,
      alignItems: "center",
      justifyContent: "center",
    },
    headerTitle: {
      fontFamily: Fonts.bold,
      fontSize: 17,
      color: colors.textPrimary,
    },

    badgeRow: {
      flexDirection: "row",
      gap: 6,
      marginBottom: 8,
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

    heroImage: {
      height: 320,
      borderRadius: 20,
      backgroundColor: colors.cardBackground,
    },

    thumbRow: {
      gap: 10,
      marginBottom: 24,
    },
    thumbImage: {
      width: 64,
      height: 64,
      borderRadius: 12,
      backgroundColor: colors.cardBackground,
    },
    thumbImageActive: {
      borderWidth: 2,
      borderColor: colors.accent,
    },
    videoThumb: {
      width: 64,
      height: 64,
      borderRadius: 12,
      backgroundColor: colors.accent,
      alignItems: "center",
      justifyContent: "center",
    },

    titleRow: {
      flexDirection: "row",
      alignItems: "flex-start",
      justifyContent: "space-between",
      marginBottom: 20,
    },
    categoryLabel: {
      fontFamily: Fonts.regular,
      fontSize: 13,
      color: colors.textMuted,
      marginBottom: 4,
    },
    title: {
      fontFamily: Fonts.bold,
      fontSize: 22,
      color: colors.textPrimary,
    },
    ratingBadge: {
      flexDirection: "row",
      alignItems: "center",
      gap: 4,
    },
    ratingText: {
      fontFamily: Fonts.bold,
      fontSize: 15,
      color: colors.textPrimary,
    },

    sectionHeading: {
      fontFamily: Fonts.bold,
      fontSize: 16,
      color: colors.textPrimary,
      marginBottom: 10,
      marginTop: 4,
    },
    descriptionText: {
      fontFamily: Fonts.regular,
      fontSize: 14,
      lineHeight: 21,
      color: colors.textMuted,
      marginBottom: 24,
    },

    colorRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: 12,
      marginBottom: 24,
    },
    colorSwatch: {
      width: 32,
      height: 32,
      borderRadius: 16,
    },
    defaultSwatch: {
      width: 32,
      height: 32,
      borderRadius: 16,
      overflow: "hidden",
      borderWidth: 1,
      borderColor: colors.outline,
    },
    defaultSwatchImage: {
      width: "100%",
      height: "100%",
    },
    colorSwatchActive: {
      borderColor: colors.accent,
      borderWidth: 3,
    },

    reviewsSummaryRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: 6,
      marginBottom: 16,
    },
    reviewsAverage: {
      fontFamily: Fonts.bold,
      fontSize: 28,
      color: colors.accent,
    },
    emptyReviewsBox: {
      alignItems: "center",
      justifyContent: "center",
      gap: 10,
      backgroundColor: colors.cardBackground,
      borderRadius: 16,
      paddingVertical: 28,
      paddingHorizontal: 24,
      marginBottom: 16,
    },
    emptyReviewsText: {
      fontFamily: Fonts.medium,
      fontSize: 13,
      color: colors.textMuted,
      textAlign: "center",
    },
    writeReviewButton: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: 8,
      backgroundColor: colors.accent,
      borderRadius: 24,
      paddingVertical: 14,
    },
    writeReviewText: {
      fontFamily: Fonts.semiBold,
      fontSize: 14,
      color: colors.onAccent,
    },
    reviewModalBackdrop: {
      flex: 1,
      backgroundColor: "rgba(0, 0, 0, 0.5)",
      alignItems: "center",
      justifyContent: "center",
      paddingHorizontal: 24,
    },
    reviewModalCard: {
      width: "100%",
      maxWidth: 420,
      backgroundColor: colors.background,
      borderRadius: 24,
      paddingHorizontal: 24,
      paddingTop: 20,
      paddingBottom: 24,
    },
    reviewModalHeader: {
      minHeight: 36,
      alignItems: "center",
      justifyContent: "center",
      position: "relative",
    },
    reviewModalTitle: {
      fontFamily: Fonts.bold,
      fontSize: 18,
      color: colors.textPrimary,
      textAlign: "center",
      paddingHorizontal: 40,
    },
    reviewModalCloseButton: {
      position: "absolute",
      top: 0,
      right: 0,
      width: 36,
      height: 36,
      borderRadius: 18,
      backgroundColor: colors.cardBackground,
      alignItems: "center",
      justifyContent: "center",
    },
    reviewModalDivider: {
      height: 1,
      backgroundColor: colors.outline,
      marginTop: 16,
      marginBottom: 22,
    },
    reviewModalIconCircle: {
      width: 56,
      height: 56,
      borderRadius: 28,
      backgroundColor: colors.cardBackground,
      alignSelf: "center",
      alignItems: "center",
      justifyContent: "center",
      marginBottom: 18,
    },
    reviewModalMessage: {
      fontFamily: Fonts.regular,
      fontSize: 14,
      lineHeight: 21,
      color: colors.textMuted,
      textAlign: "center",
      marginBottom: 24,
    },
    reviewModalButton: {
      backgroundColor: colors.accent,
      borderRadius: 28,
      paddingVertical: 15,
      alignItems: "center",
      justifyContent: "center",
    },
    reviewModalButtonText: {
      fontFamily: Fonts.semiBold,
      fontSize: 15,
      color: colors.onAccent,
    },

    footer: {
      position: "absolute",
      bottom: 0,
      left: 0,
      right: 0,
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      backgroundColor: colors.background,
      borderTopWidth: 1,
      borderTopColor: colors.outline,
      paddingHorizontal: 24,
      paddingTop: 16,
      paddingBottom: 48,
    },
    footerLabel: {
      fontFamily: Fonts.regular,
      fontSize: 12,
      color: colors.textMuted,
      marginBottom: 2,
    },
    footerPrice: {
      fontFamily: Fonts.bold,
      fontSize: 22,
      color: colors.accent,
    },
    footerAddToCartButton: {
      paddingHorizontal: 24,
      minWidth: 170,
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

    videoBackdrop: {
      flex: 1,
      backgroundColor: "#000000",
      alignItems: "center",
      justifyContent: "center",
    },
    videoCloseButton: {
      position: "absolute",
      top: 60,
      right: 24,
      zIndex: 1,
      width: 44,
      height: 44,
      borderRadius: 22,
      backgroundColor: "rgba(255,255,255,0.15)",
      alignItems: "center",
      justifyContent: "center",
    },
    video: {
      width: "100%",
      height: "40%",
    },
    videoErrorText: {
      fontFamily: Fonts.medium,
      fontSize: 14,
      color: "#FFFFFF",
    },

    fullImageBackdrop: {
      flex: 1,
      backgroundColor: "#000000",
      alignItems: "center",
      justifyContent: "center",
    },
    fullImageCloseButton: {
      position: "absolute",
      top: 60,
      right: 24,
      zIndex: 1,
      width: 44,
      height: 44,
      borderRadius: 22,
      backgroundColor: "rgba(255,255,255,0.15)",
      alignItems: "center",
      justifyContent: "center",
    },
    fullImage: {
      width: "100%",
      height: "80%",
    },
  });
}
