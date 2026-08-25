import { ThemeColors } from "@/constants/colors";
import { Fonts } from "@/constants/fonts";
import { products } from "@/data/products";
import { useThemeColors } from "@/hooks/use-theme-colors";
import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { router, useLocalSearchParams } from "expo-router";
import { FlatList, Pressable, StyleSheet, Text, View } from "react-native";

export default function CategoryProducts() {
  const colors = useThemeColors();
  const styles = getStyles(colors);
  const params = useLocalSearchParams<{ category: string; title: string }>();

  const filtered = products.filter((item) => item.category === params.category);

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
            <View style={styles.productCard}>
              <Image
                source={{
                  uri: `https://limjfxtziyciiyxjuyyh.supabase.co/storage/v1/object/public/product-images/product-images/${item.thumbPath}`,
                }}
                style={styles.productImage}
                contentFit="cover"
              />
              <Pressable style={styles.wishlistButton}>
                <Ionicons
                  name="heart-outline"
                  size={18}
                  color={colors.accent}
                />
              </Pressable>
              <View style={styles.productFooter}>
                <Text style={styles.productPrice}>
                  ${item.price.toFixed(2)}
                </Text>
                <Pressable style={styles.cartButton}>
                  <Ionicons
                    name="cart-outline"
                    size={18}
                    color={colors.onAccent}
                  />
                </Pressable>
              </View>
            </View>
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
