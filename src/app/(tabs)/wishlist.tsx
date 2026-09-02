// Wishlist tab — "All items" (every hearted product) and "My lists"
// (user-created named collections). Add-to-list picker lets you organize
// wishlisted items into lists on the spot.

import { AddToCartButton } from "@/components/ui/add-to-cart-button";
import { RemoteImage } from "@/components/ui/remote-image";
import {
  WishlistListsSkeleton,
  WishlistRowsSkeleton,
} from "@/components/ui/wishlist-row-skeleton";
import { WishlistSkeleton } from "@/components/ui/wishlist-skeleton";
import { ThemeColors } from "@/constants/colors";
import { Fonts } from "@/constants/fonts";
import { bestSellerIds } from "@/data/product-badges";
import { Product, products } from "@/data/products";
import { useDeferredReady } from "@/hooks/use-deferred-ready";
import { useThemeColors } from "@/hooks/use-theme-colors";
import { WishlistCollection, useWishlistStore } from "@/store/wishlist-store";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  ActivityIndicator,
  Animated,
  Easing,
  FlatList,
  InteractionManager,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

const WISHLIST_ACTIVE_COLOR = "#DC143C";
const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

type TabId = "all" | "lists";

function productById(id: string): Product | undefined {
  return products.find((p) => p.id === id);
}

// --- "All items" / "My lists" tab with an animated underline ---
function WishlistTab({
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
    <Pressable onPress={onPress} style={styles.tabButton}>
      <Animated.Text
        style={[
          styles.tabLabel,
          {
            color: colorAnim.interpolate({
              inputRange: [0, 1],
              outputRange: [colors.textMuted, colors.accent],
            }),
          },
        ]}
      >
        {label}
      </Animated.Text>
      <Animated.View
        style={[
          styles.tabUnderline,
          {
            backgroundColor: colorAnim.interpolate({
              inputRange: [0, 1],
              outputRange: ["transparent", colors.accent],
            }),
          },
        ]}
      />
    </Pressable>
  );
}

// --- Full-width wishlist row: image, badges, title, rating/price, cart ---
function WishlistRow({
  item,
  colors,
  styles,
  onOpenAddToList,
  onPress,
}: {
  item: Product;
  colors: ThemeColors;
  styles: ReturnType<typeof getStyles>;
  onOpenAddToList: () => void;
  onPress: () => void;
}) {
  const toggleWishlist = useWishlistStore((s) => s.toggleWishlist);
  const heartScaleAnim = useRef(new Animated.Value(1)).current;
  const isBestSeller = bestSellerIds.has(item.id);
  const originalPrice = item.salePercent
    ? item.price / (1 - item.salePercent / 100)
    : null;

  function handleHeartPress() {
    toggleWishlist(item.id);
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

  return (
    <Pressable style={styles.row} onPress={onPress}>
      <View style={styles.imageWrapper}>
        {(item.isTopDeal || isBestSeller) && (
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
        )}
        <RemoteImage
          uri={item.thumbPath}
          fallbackUri={item.fallbackThumbPath}
          style={styles.rowImage}
        />
        <AnimatedPressable
          style={[
            styles.heartButton,
            { transform: [{ scale: heartScaleAnim }] },
          ]}
          onPress={handleHeartPress}
        >
          <Ionicons name="heart" size={16} color={WISHLIST_ACTIVE_COLOR} />
        </AnimatedPressable>
      </View>

      <View style={styles.rowContent}>
        <Text style={styles.rowTitle} numberOfLines={2}>
          {item.name}
        </Text>
        <View style={styles.ratingRow}>
          <Ionicons name="star" size={12} color="#F5A623" />
          <Text style={styles.ratingText}>{item.rating.toFixed(1)}</Text>
        </View>
        <View style={styles.priceRow}>
          <Text style={styles.price}>${item.price.toFixed(2)}</Text>
          {originalPrice && (
            <Text style={styles.originalPrice}>
              ${originalPrice.toFixed(2)}
            </Text>
          )}
        </View>

        <View style={styles.rowActions}>
          <AddToCartButton
            productId={item.id}
            colors={colors}
            variant="full"
            style={styles.addToCartButtonFlex}
          />
          <Pressable style={styles.addToListButton} onPress={onOpenAddToList}>
            <Ionicons name="bookmark-outline" size={18} color={colors.accent} />
          </Pressable>
        </View>
      </View>
    </Pressable>
  );
}

// --- "My lists" preview card: name, count, up to 3 thumbnails ---
function ListCard({
  list,
  colors,
  styles,
  onPress,
  onDelete,
}: {
  list: WishlistCollection;
  colors: ThemeColors;
  styles: ReturnType<typeof getStyles>;
  onPress: () => void;
  onDelete: () => void;
}) {
  const previewProducts = list.productIds
    .map(productById)
    .filter((p): p is Product => !!p)
    .slice(0, 3);

  return (
    <Pressable style={styles.listCard} onPress={onPress}>
      <View style={styles.listCardHeader}>
        <View style={styles.listCardTitleRow}>
          <Text style={styles.listCardName}>{list.name}</Text>
          <Ionicons name="chevron-forward" size={16} color={colors.textMuted} />
        </View>
        <Pressable onPress={onDelete} hitSlop={8}>
          <Ionicons name="trash-outline" size={18} color={colors.textMuted} />
        </Pressable>
      </View>
      <Text style={styles.listCardCount}>{list.productIds.length} items</Text>

      {previewProducts.length > 0 && (
        <View style={styles.listPreviewRow}>
          {previewProducts.map((product) => (
            <RemoteImage
              key={product.id}
              uri={product.thumbPath}
              fallbackUri={product.fallbackThumbPath}
              style={styles.listPreviewImage}
            />
          ))}
        </View>
      )}
    </Pressable>
  );
}

export default function Wishlist() {
  const colors = useThemeColors();
  const styles = getStyles(colors);
  const ready = useDeferredReady();

  const wishlistedIds = useWishlistStore((s) => s.wishlistedIds);
  const hasHydrated = useWishlistStore((s) => s.hasHydrated);
  const lists = useWishlistStore((s) => s.lists);
  const createList = useWishlistStore((s) => s.createList);
  const deleteList = useWishlistStore((s) => s.deleteList);
  const addToList = useWishlistStore((s) => s.addToList);
  const removeFromList = useWishlistStore((s) => s.removeFromList);

  const [activeTab, setActiveTab] = useState<TabId>("all");
  const [tabTransitioning, setTabTransitioning] = useState(false);
  const [createListVisible, setCreateListVisible] = useState(false);
  const [newListName, setNewListName] = useState("");
  const [isCreatingList, setIsCreatingList] = useState(false);
  const [addToListProductId, setAddToListProductId] = useState<string | null>(
    null,
  );
  const [pendingProductId, setPendingProductId] = useState<string | null>(null);

  // --- Styled delete-list confirmation, replacing the plain OS Alert ---
  const [pendingDeleteList, setPendingDeleteList] =
    useState<WishlistCollection | null>(null);

  const wishlistedProducts = useMemo(
    () => products.filter((p) => wishlistedIds[p.id]),
    [wishlistedIds],
  );

  useEffect(() => {
    const task = InteractionManager.runAfterInteractions(() => {
      setTabTransitioning(false);
    });
    return () => task.cancel();
  }, [activeTab]);

  function handleTabPress(id: TabId) {
    if (id === activeTab) return;
    setTabTransitioning(true);
    setActiveTab(id);
  }

  function openProductDetails(id: string) {
    router.push({ pathname: "/product-details", params: { id } });
  }

  function openCreateListModal(fromProductId: string | null) {
    setPendingProductId(fromProductId);
    setCreateListVisible(true);
  }

  function closeCreateListModal() {
    setCreateListVisible(false);
    setNewListName("");
    setPendingProductId(null);
  }

  function handleCreateList() {
    const trimmed = newListName.trim();
    if (!trimmed || isCreatingList) return;

    setIsCreatingList(true);

    const newListId = createList(trimmed);
    if (pendingProductId) {
      addToList(newListId, pendingProductId);
    }

    setIsCreatingList(false);
    closeCreateListModal();
  }

  function confirmDeleteList() {
    if (!pendingDeleteList) return;
    deleteList(pendingDeleteList.id);
    setPendingDeleteList(null);
  }

  // --- Wait for both the deferred-mount skeleton AND the wishlist store's
  // persisted data to finish loading, so real data doesn't flash empty
  // right after app start. ---
  if (!ready || !hasHydrated) {
    return (
      <View style={styles.screen}>
        <WishlistSkeleton />
      </View>
    );
  }

  return (
    <View style={styles.screen}>
      {/* --- Header --- */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Wishlist</Text>
        <Pressable
          style={styles.cartButton}
          onPress={() => router.push("/cart")}
        >
          <Ionicons name="cart-outline" size={20} color={colors.textPrimary} />
        </Pressable>
      </View>

      {/* --- Tabs --- */}
      <View style={styles.tabsRow}>
        <WishlistTab
          label={`All items (${wishlistedProducts.length})`}
          active={activeTab === "all"}
          colors={colors}
          styles={styles}
          onPress={() => handleTabPress("all")}
        />
        <WishlistTab
          label={`My lists (${lists.length})`}
          active={activeTab === "lists"}
          colors={colors}
          styles={styles}
          onPress={() => handleTabPress("lists")}
        />
      </View>

      {/* --- Tab content: skeleton while switching, then the real list --- */}
      {tabTransitioning ? (
        activeTab === "all" ? (
          <WishlistRowsSkeleton rows={4} />
        ) : (
          <WishlistListsSkeleton cards={3} />
        )
      ) : activeTab === "all" ? (
        wishlistedProducts.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="heart-outline" size={40} color={colors.textMuted} />
            <Text style={styles.emptyText}>
              Products you heart will show up here
            </Text>
          </View>
        ) : (
          <FlatList
            data={wishlistedProducts}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.listContent}
            renderItem={({ item }) => (
              <WishlistRow
                item={item}
                colors={colors}
                styles={styles}
                onOpenAddToList={() => setAddToListProductId(item.id)}
                onPress={() => openProductDetails(item.id)}
              />
            )}
          />
        )
      ) : lists.length === 0 ? (
        <View style={styles.emptyState}>
          <Ionicons name="albums-outline" size={40} color={colors.textMuted} />
          <Text style={styles.emptyText}>
            Create a list to organize items you love
          </Text>
        </View>
      ) : (
        <FlatList
          data={lists}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          renderItem={({ item }) => (
            <ListCard
              list={item}
              colors={colors}
              styles={styles}
              onPress={() =>
                router.push({
                  pathname: "/wishlist-list",
                  params: { listId: item.id },
                })
              }
              onDelete={() => setPendingDeleteList(item)}
            />
          )}
        />
      )}

      {/* --- Make a wishlist button (no product context) --- */}
      {activeTab === "lists" && !tabTransitioning && (
        <Pressable
          style={styles.makeListButton}
          onPress={() => openCreateListModal(null)}
        >
          <Ionicons name="add" size={20} color={colors.onAccent} />
          <Text style={styles.makeListText}>Make a wishlist</Text>
        </Pressable>
      )}

      {/* --- Create list modal --- */}
      <Modal
        transparent
        visible={createListVisible}
        animationType="fade"
        onRequestClose={closeCreateListModal}
      >
        <View style={styles.modalBackdrop}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>New Wishlist</Text>
            {pendingProductId && (
              <Text style={styles.modalSubtitle}>
                This item will be added to the new list.
              </Text>
            )}
            <TextInput
              style={styles.modalInput}
              placeholder="List name"
              placeholderTextColor={colors.textMuted}
              value={newListName}
              onChangeText={setNewListName}
              autoFocus
            />
            <View style={styles.modalActionsRow}>
              <Pressable
                style={styles.modalCancelButton}
                onPress={closeCreateListModal}
              >
                <Text style={styles.modalCancelText}>Cancel</Text>
              </Pressable>
              <Pressable
                style={[
                  styles.modalCreateButton,
                  isCreatingList && styles.modalCreateButtonBusy,
                ]}
                onPress={handleCreateList}
                disabled={isCreatingList}
              >
                {isCreatingList ? (
                  <ActivityIndicator color={colors.onAccent} size="small" />
                ) : (
                  <Text style={styles.modalCreateText}>Create</Text>
                )}
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>

      {/* --- Add-to-list picker --- */}
      <Modal
        transparent
        visible={!!addToListProductId}
        animationType="slide"
        onRequestClose={() => setAddToListProductId(null)}
      >
        <View style={styles.pickerBackdrop}>
          <View style={styles.pickerCard}>
            <View style={styles.pickerHeader}>
              <Text style={styles.modalTitle}>Add to List</Text>
              <Pressable onPress={() => setAddToListProductId(null)}>
                <Ionicons name="close" size={22} color={colors.textPrimary} />
              </Pressable>
            </View>

            {lists.length === 0 && (
              <Text style={styles.pickerEmptyText}>
                You don&apos;t have any lists yet.
              </Text>
            )}

            {lists.map((list) => {
              const inList =
                !!addToListProductId &&
                list.productIds.includes(addToListProductId);
              return (
                <Pressable
                  key={list.id}
                  style={styles.pickerRow}
                  onPress={() => {
                    if (!addToListProductId) return;
                    if (inList) {
                      removeFromList(list.id, addToListProductId);
                    } else {
                      addToList(list.id, addToListProductId);
                    }
                  }}
                >
                  <View
                    style={[
                      styles.pickerCheckbox,
                      inList && { backgroundColor: colors.accent },
                    ]}
                  >
                    {inList && (
                      <Ionicons
                        name="checkmark"
                        size={14}
                        color={colors.onAccent}
                      />
                    )}
                  </View>
                  <Text style={styles.pickerListName}>{list.name}</Text>
                </Pressable>
              );
            })}

            <Pressable
              style={styles.pickerNewListButton}
              onPress={() => {
                const productId = addToListProductId;
                setAddToListProductId(null);
                openCreateListModal(productId);
              }}
            >
              <Ionicons name="add" size={18} color={colors.accent} />
              <Text style={styles.pickerNewListText}>Create new list</Text>
            </Pressable>
          </View>
        </View>
      </Modal>

      {/* --- Delete list confirmation sheet --- */}
      <Modal
        transparent
        visible={!!pendingDeleteList}
        animationType="slide"
        onRequestClose={() => setPendingDeleteList(null)}
      >
        <View style={styles.pickerBackdrop}>
          <View style={styles.deleteSheetCard}>
            <Text style={styles.deleteSheetTitle}>Delete List?</Text>
            <View style={styles.deleteSheetDivider} />

            {pendingDeleteList && (
              <View style={styles.deleteSheetListRow}>
                <View style={styles.deleteSheetIconCircle}>
                  <Ionicons name="albums" size={18} color={colors.accent} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.deleteSheetListName}>
                    {pendingDeleteList.name}
                  </Text>
                  <Text style={styles.deleteSheetListCount}>
                    {pendingDeleteList.productIds.length} items
                  </Text>
                </View>
              </View>
            )}

            <Text style={styles.deleteSheetWarning}>
              This won&apos;t remove the items from your wishlist.
            </Text>

            <View style={styles.deleteSheetActionsRow}>
              <Pressable
                style={styles.deleteSheetCancelButton}
                onPress={() => setPendingDeleteList(null)}
              >
                <Text style={styles.deleteSheetCancelText}>Cancel</Text>
              </Pressable>
              <Pressable
                style={styles.deleteSheetConfirmButton}
                onPress={confirmDeleteList}
              >
                <Text style={styles.deleteSheetConfirmText}>Yes, Delete</Text>
              </Pressable>
            </View>
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
    header: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      paddingHorizontal: 24,
      paddingTop: 60,
      marginBottom: 20,
    },
    headerTitle: {
      fontFamily: Fonts.bold,
      fontSize: 22,
      color: colors.textPrimary,
    },
    cartButton: {
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: colors.cardBackground,
      alignItems: "center",
      justifyContent: "center",
    },
    tabsRow: {
      flexDirection: "row",
      gap: 24,
      paddingHorizontal: 24,
      marginBottom: 20,
    },
    tabButton: {
      alignItems: "flex-start",
    },
    tabLabel: {
      fontFamily: Fonts.semiBold,
      fontSize: 14,
      marginBottom: 8,
    },
    tabUnderline: {
      height: 2,
      width: "100%",
      borderRadius: 1,
    },

    listContent: {
      paddingHorizontal: 24,
      paddingBottom: 40,
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

    // --- Wishlist row ---
    row: {
      flexDirection: "row",
      gap: 14,
      marginBottom: 20,
    },
    imageWrapper: {
      width: 100,
      height: 100,
    },
    rowImage: {
      width: 100,
      height: 100,
      borderRadius: 16,
      backgroundColor: colors.cardBackground,
    },
    heartButton: {
      position: "absolute",
      top: 6,
      right: 6,
      width: 26,
      height: 26,
      borderRadius: 13,
      backgroundColor: colors.background,
      alignItems: "center",
      justifyContent: "center",
    },
    badgeStack: {
      position: "absolute",
      bottom: 6,
      left: 6,
      zIndex: 1,
      gap: 3,
    },
    topDealSticker: {
      backgroundColor: "#FF2C2C",
      borderRadius: 6,
      paddingHorizontal: 6,
      paddingVertical: 2,
    },
    topDealText: {
      fontFamily: Fonts.semiBold,
      fontSize: 8,
      color: "#FFFFFF",
    },
    bestSellerSticker: {
      backgroundColor: "#FF9900",
      borderRadius: 6,
      paddingHorizontal: 6,
      paddingVertical: 2,
    },
    bestSellerText: {
      fontFamily: Fonts.semiBold,
      fontSize: 8,
      color: "#FFFFFF",
    },

    rowContent: {
      flex: 1,
    },
    rowTitle: {
      fontFamily: Fonts.semiBold,
      fontSize: 14,
      color: colors.textPrimary,
      marginBottom: 4,
    },
    ratingRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: 3,
      marginBottom: 4,
    },
    ratingText: {
      fontFamily: Fonts.medium,
      fontSize: 12,
      color: colors.textMuted,
    },
    priceRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: 8,
      marginBottom: 10,
    },
    price: {
      fontFamily: Fonts.bold,
      fontSize: 16,
      color: colors.accent,
    },
    originalPrice: {
      fontFamily: Fonts.regular,
      fontSize: 13,
      color: colors.textMuted,
      textDecorationLine: "line-through",
    },
    rowActions: {
      flexDirection: "row",
      gap: 8,
    },
    addToCartButtonFlex: {
      flex: 1,
    },
    addToListButton: {
      width: 40,
      height: 40,
      borderRadius: 20,
      borderWidth: 1,
      borderColor: colors.outline,
      alignItems: "center",
      justifyContent: "center",
    },

    // --- List card ---
    listCard: {
      backgroundColor: colors.cardBackground,
      borderRadius: 16,
      padding: 16,
      marginBottom: 16,
    },
    listCardHeader: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: 4,
    },
    listCardTitleRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: 4,
    },
    listCardName: {
      fontFamily: Fonts.semiBold,
      fontSize: 15,
      color: colors.textPrimary,
    },
    listCardCount: {
      fontFamily: Fonts.regular,
      fontSize: 12,
      color: colors.textMuted,
      marginBottom: 12,
    },
    listPreviewRow: {
      flexDirection: "row",
      gap: 8,
    },
    listPreviewImage: {
      width: 72,
      height: 72,
      borderRadius: 12,
      backgroundColor: colors.background,
    },

    makeListButton: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: 8,
      backgroundColor: colors.accent,
      borderRadius: 28,
      paddingVertical: 16,
      marginHorizontal: 24,
      marginBottom: 20,
    },
    makeListText: {
      fontFamily: Fonts.semiBold,
      fontSize: 15,
      color: colors.onAccent,
    },

    // --- Create list modal ---
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
      borderRadius: 20,
      padding: 20,
    },
    modalTitle: {
      fontFamily: Fonts.bold,
      fontSize: 17,
      color: colors.textPrimary,
      marginBottom: 14,
    },
    modalSubtitle: {
      fontFamily: Fonts.regular,
      fontSize: 13,
      color: colors.textMuted,
      marginTop: -8,
      marginBottom: 14,
    },
    modalInput: {
      backgroundColor: colors.cardBackground,
      borderRadius: 14,
      paddingHorizontal: 16,
      height: 48,
      fontFamily: Fonts.regular,
      fontSize: 14,
      color: colors.textPrimary,
      marginBottom: 16,
    },
    modalActionsRow: {
      flexDirection: "row",
      gap: 12,
    },
    modalCancelButton: {
      flex: 1,
      alignItems: "center",
      justifyContent: "center",
      borderRadius: 24,
      borderWidth: 1,
      borderColor: colors.outline,
      paddingVertical: 12,
    },
    modalCancelText: {
      fontFamily: Fonts.semiBold,
      fontSize: 14,
      color: colors.textPrimary,
    },
    modalCreateButton: {
      flex: 1,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: colors.accent,
      borderRadius: 24,
      paddingVertical: 12,
    },
    modalCreateButtonBusy: {
      opacity: 0.7,
    },
    modalCreateText: {
      fontFamily: Fonts.semiBold,
      fontSize: 14,
      color: colors.onAccent,
    },

    // --- Add-to-list picker ---
    pickerBackdrop: {
      flex: 1,
      backgroundColor: "rgba(0, 0, 0, 0.5)",
      justifyContent: "flex-end",
    },
    pickerCard: {
      backgroundColor: colors.background,
      borderTopLeftRadius: 24,
      borderTopRightRadius: 24,
      padding: 24,
      paddingBottom: 40,
    },
    pickerHeader: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: 16,
    },
    pickerEmptyText: {
      fontFamily: Fonts.regular,
      fontSize: 13,
      color: colors.textMuted,
      marginBottom: 16,
    },
    pickerRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: 12,
      paddingVertical: 12,
    },
    pickerCheckbox: {
      width: 22,
      height: 22,
      borderRadius: 6,
      borderWidth: 1.5,
      borderColor: colors.accent,
      alignItems: "center",
      justifyContent: "center",
    },
    pickerListName: {
      fontFamily: Fonts.regular,
      fontSize: 15,
      color: colors.textPrimary,
    },
    pickerNewListButton: {
      flexDirection: "row",
      alignItems: "center",
      gap: 8,
      paddingVertical: 14,
      marginTop: 8,
    },
    pickerNewListText: {
      fontFamily: Fonts.semiBold,
      fontSize: 14,
      color: colors.accent,
    },

    // --- Delete list confirmation sheet ---
    deleteSheetCard: {
      backgroundColor: colors.background,
      borderTopLeftRadius: 28,
      borderTopRightRadius: 28,
      paddingHorizontal: 24,
      paddingTop: 20,
      paddingBottom: 50,
    },
    deleteSheetTitle: {
      fontFamily: Fonts.bold,
      fontSize: 18,
      color: colors.textPrimary,
      textAlign: "center",
      marginBottom: 16,
    },
    deleteSheetDivider: {
      height: 1,
      backgroundColor: colors.outline,
      marginBottom: 16,
    },
    deleteSheetListRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: 14,
      backgroundColor: colors.cardBackground,
      borderRadius: 16,
      padding: 14,
      marginBottom: 16,
    },
    deleteSheetIconCircle: {
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: colors.background,
      alignItems: "center",
      justifyContent: "center",
    },
    deleteSheetListName: {
      fontFamily: Fonts.semiBold,
      fontSize: 15,
      color: colors.textPrimary,
      marginBottom: 2,
    },
    deleteSheetListCount: {
      fontFamily: Fonts.regular,
      fontSize: 12,
      color: colors.textMuted,
    },
    deleteSheetWarning: {
      fontFamily: Fonts.regular,
      fontSize: 13,
      color: colors.textMuted,
      textAlign: "center",
      marginBottom: 20,
    },
    deleteSheetActionsRow: {
      flexDirection: "row",
      gap: 12,
    },
    deleteSheetCancelButton: {
      flex: 1,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: colors.cardBackground,
      borderRadius: 28,
      paddingVertical: 16,
    },
    deleteSheetCancelText: {
      fontFamily: Fonts.semiBold,
      fontSize: 15,
      color: colors.textPrimary,
    },
    deleteSheetConfirmButton: {
      flex: 1,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: colors.accent,
      borderRadius: 28,
      paddingVertical: 16,
    },
    deleteSheetConfirmText: {
      fontFamily: Fonts.semiBold,
      fontSize: 15,
      color: colors.onAccent,
    },
  });
}
